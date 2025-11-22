import win32com.client
import datetime
import os
import sys
import tempfile
import tkinter as tk
from tkinter import messagebox, ttk, filedialog
from icalendar import Calendar

# --- CORE LOGIC (Outlook & Exporting) ---

def connect_outlook():
    """Connects to Outlook MAPI namespace."""
    try:
        outlook = win32com.client.Dispatch("Outlook.Application")
        namespace = outlook.GetNamespace("MAPI")
        return namespace
    except Exception as e:
        raise Exception(f"Could not connect to Outlook. Is it running?\nError: {e}")

def get_calendars_from_outlook():
    """Returns a list of Outlook folder objects that are calendars."""
    namespace = connect_outlook()
    calendars = []
    # Recursively or simply check default folders? 
    # For simplicity matching previous script, we scan top-level folders
    # but often Calendars are in the default 'Calendar' folder or subfolders.
    # We'll stick to the previous logic: iterating namespace.Folders
    for folder in namespace.Folders:
        try:
            if folder.DefaultItemType == 1:  # 1 = olAppointmentItem
                calendars.append(folder)
        except Exception:
            pass
            
    # Also check the user's default calendar explicitly
    try:
        default_cal = namespace.GetDefaultFolder(9) # 9 = olFolderCalendar
        # Avoid duplicates if already found
        if not any(c.EntryID == default_cal.EntryID for c in calendars):
            calendars.insert(0, default_cal)
    except Exception:
        pass

    return calendars

def run_export_process(selected_calendars, start_date, end_date, output_path):
    """The heavy lifting: exports selected calendars to .ics and merges them."""
    merged_calendar = Calendar()
    merged_calendar.add('prodid', '-//AI Secretary//Outlook Exporter//')
    merged_calendar.add('version', '2.0')

    with tempfile.TemporaryDirectory() as temp_dir:
        for calendar_folder in selected_calendars:
            try:
                exporter = calendar_folder.GetCalendarExporter()
                exporter.IncludeWholeCalendar = False
                exporter.StartDate = start_date
                exporter.EndDate = end_date
                exporter.CalendarDetail = 2  # Full Details
                exporter.IncludeAttachments = False
                exporter.IncludePrivateDetails = True
                exporter.RestrictToFolder = True
                
                temp_file_path = os.path.join(temp_dir, f"temp_{calendar_folder.Name}.ics")
                exporter.SaveAsICal(temp_file_path)
                
                with open(temp_file_path, 'r', encoding='utf-8') as f:
                    temp_cal_data = f.read()
                    temp_cal = Calendar.from_ical(temp_cal_data)
                    for component in temp_cal.walk('vevent'):
                        merged_calendar.add_component(component)
            except Exception as e:
                print(f"Error exporting {calendar_folder.Name}: {e}")
                # We continue even if one fails

    # Save to the user-selected path
    with open(output_path, 'wb') as f:
        f.write(merged_calendar.to_ical())
    
    return output_path

# --- GUI CLASS ---

class CalendarApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Outlook Calendar Exporter")
        self.geometry("600x450")
        self.configure(bg="#f0f0f0")

        # Data storage
        self.found_calendars = [] # List of Outlook folder objects
        self.checkbox_vars = []   # List of BooleanVars for checkboxes

        # --- UI LAYOUT ---
        
        # 1. Left Panel (Calendar List)
        left_frame = tk.Frame(self, bg="white", bd=2, relief=tk.GROOVE)
        left_frame.place(x=20, y=20, width=250, height=400)
        
        tk.Label(left_frame, text="Calendars", font=("Arial", 12, "bold"), bg="white").pack(pady=10)
        
        # Scrollable Frame for checkboxes
        self.canvas = tk.Canvas(left_frame, bg="white")
        self.scrollbar = tk.Scrollbar(left_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas, bg="white")

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")

        # 2. Right Panel (Controls)
        right_frame = tk.Frame(self, bg="#f0f0f0")
        right_frame.place(x=290, y=20, width=280, height=400)

        # Red "Pull Calendars" Button
        self.btn_pull = tk.Button(right_frame, text="Pull Calendars", bg="#ff6b6b", fg="white", 
                                  font=("Arial", 12, "bold"), height=2, relief=tk.FLAT,
                                  command=self.pull_calendars_action)
        self.btn_pull.pack(fill="x", pady=(0, 20))

        # Green "Push iCS" Button
        self.btn_push = tk.Button(right_frame, text="Push iCS", bg="#51cf66", fg="white", 
                                  font=("Arial", 12, "bold"), height=2, relief=tk.FLAT,
                                  command=self.push_ics_action)
        self.btn_push.pack(fill="x", pady=(0, 40))

        # Date Range Section
        tk.Label(right_frame, text="Date Range", font=("Arial", 14, "bold"), bg="#f0f0f0").pack(pady=(0, 10))
        
        # Date Inputs Container
        date_frame = tk.Frame(right_frame, bg="#f0f0f0")
        date_frame.pack(fill="x")

        # Defaults
        today = datetime.date.today()
        next_week = today + datetime.timedelta(days=7)

        # Start Date
        tk.Label(date_frame, text="Start Date (DD/MM/YYYY)", bg="#f0f0f0").pack(anchor="w")
        self.entry_start = tk.Entry(date_frame, font=("Arial", 11), justify="center")
        self.entry_start.insert(0, today.strftime("%d/%m/%Y"))
        self.entry_start.pack(fill="x", pady=(0, 15))

        # End Date
        tk.Label(date_frame, text="End Date (DD/MM/YYYY)", bg="#f0f0f0").pack(anchor="w")
        self.entry_end = tk.Entry(date_frame, font=("Arial", 11), justify="center")
        self.entry_end.insert(0, next_week.strftime("%d/%m/%Y"))
        self.entry_end.pack(fill="x")

    def pull_calendars_action(self):
        """Connects to Outlook and populates the left list."""
        try:
            self.btn_pull.config(text="Loading...", state="disabled")
            self.update() # Force UI refresh

            cals = get_calendars_from_outlook()
            self.found_calendars = cals
            
            # Clear existing checkboxes
            for widget in self.scrollable_frame.winfo_children():
                widget.destroy()
            self.checkbox_vars = []

            if not cals:
                tk.Label(self.scrollable_frame, text="No calendars found", bg="white").pack(pady=20)
            else:
                for cal in cals:
                    var = tk.BooleanVar()
                    self.checkbox_vars.append(var)
                    cb = tk.Checkbutton(self.scrollable_frame, text=cal.Name, variable=var, 
                                        bg="white", anchor="w", font=("Arial", 10))
                    cb.pack(fill="x", padx=5, pady=2)

            self.btn_pull.config(text="Pull Calendars", state="normal")

        except Exception as e:
            messagebox.showerror("Connection Error", str(e))
            self.btn_pull.config(text="Pull Calendars", state="normal")

    def push_ics_action(self):
        """Exports the selected calendars."""
        # 1. Validation
        selected_indices = [i for i, var in enumerate(self.checkbox_vars) if var.get()]
        if not selected_indices:
            messagebox.showwarning("Selection Required", "Please select at least one calendar from the list.")
            return

        start_str = self.entry_start.get()
        end_str = self.entry_end.get()

        try:
            start_date = datetime.datetime.strptime(start_str, "%d/%m/%Y").date()
            end_date = datetime.datetime.strptime(end_str, "%d/%m/%Y").date()
            
            if start_date > end_date:
                messagebox.showerror("Invalid Dates", "Start date must be before end date.")
                return
        except ValueError:
            messagebox.showerror("Invalid Format", "Please use DD/MM/YYYY format (e.g., 25/12/2024).")
            return

        # 2. Ask User for Save Location
        default_filename = f"Merged_Schedule_{start_date.strftime('%d-%m-%Y')}_to_{end_date.strftime('%d-%m-%Y')}.ics"
        
        output_path = filedialog.asksaveasfilename(
            defaultextension=".ics",
            initialfile=default_filename,
            title="Save Merged Calendar As",
            filetypes=[("iCalendar files", "*.ics"), ("All files", "*.*")]
        )

        # If user cancelled the dialog
        if not output_path:
            return

        # 3. Processing
        selected_folders = [self.found_calendars[i] for i in selected_indices]
        
        try:
            self.btn_push.config(text="Exporting...", bg="#8ce99a", state="disabled")
            self.update()

            # Pass the chosen path to the processing function
            final_path = run_export_process(selected_folders, start_date, end_date, output_path)
            
            messagebox.showinfo("Success", f"Export Complete!\nSaved to:\n{final_path}")
            
        except Exception as e:
            messagebox.showerror("Export Error", f"An error occurred during export:\n{e}")
        finally:
            self.btn_push.config(text="Push iCS", bg="#51cf66", state="normal")

if __name__ == "__main__":
    app = CalendarApp()
    app.mainloop()