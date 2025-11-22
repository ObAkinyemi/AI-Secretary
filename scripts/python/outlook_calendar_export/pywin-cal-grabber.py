import win32com.client
import datetime
import os
import sys
import tempfile
import tkinter as tk
from tkinter import messagebox, ttk, filedialog
from icalendar import Calendar, Event

# --- CORE LOGIC (Outlook & Exporting) ---

def get_calendars_from_outlook():
    """
    Returns a list of Outlook folder objects by querying the Navigation Pane 
    (The Sidebar UI), which ensures we find Group Calendars and Shared Calendars.
    """
    try:
        outlook = win32com.client.Dispatch("Outlook.Application")
        explorer = outlook.ActiveExplorer()
        
        if not explorer:
            raise Exception("No active Outlook window found. Please open Outlook and try again.")

        try:
            nav_module = explorer.NavigationPane.Modules.GetNavigationModule(1)
        except Exception:
            raise Exception("Could not access Calendar sidebar. Please switch to the Calendar view in Outlook and try again.")

        calendars = []
        seen_ids = set()

        for group in nav_module.NavigationGroups:
            for nav_folder in group.NavigationFolders:
                try:
                    folder = nav_folder.Folder
                    if not folder or folder.Name == "Deleted Items":
                        continue

                    if folder.EntryID not in seen_ids:
                        calendars.append(folder)
                        seen_ids.add(folder.EntryID)
                        
                except Exception:
                    pass

        return calendars

    except Exception as e:
        raise Exception(f"Could not access Outlook Sidebar.\nError: {e}")

def export_manual_items(folder, start_date, end_date):
    """
    Fallback method: Manually iterates through calendar items if the built-in exporter fails.
    Useful for Internet Calendars or Shared Calendars.
    """
    events = []
    try:
        # Get items and sort
        items = folder.Items
        items.Sort("[Start]")
        items.IncludeRecurrences = True # Expand recurring events

        # Create filter string for Outlook Restrict method
        # Outlook expects strings like "MM/DD/YYYY HH:MM AM"
        s_str = start_date.strftime("%m/%d/%Y %I:%M %p")
        e_str = end_date.strftime("%m/%d/%Y %I:%M %p")
        
        # Filter events strictly within range
        restriction = f"[Start] >= '{s_str}' AND [End] <= '{e_str}'"
        restricted_items = items.Restrict(restriction)

        for item in restricted_items:
            try:
                event = Event()
                event.add('summary', item.Subject)
                event.add('dtstart', item.Start)
                event.add('dtend', item.End)
                
                if item.Location:
                    event.add('location', item.Location)
                if item.Body:
                    event.add('description', item.Body)
                
                events.append(event)
            except Exception:
                continue # Skip individual bad items
                
    except Exception as e:
        print(f"    Manual fallback failed: {e}")
        
    return events

def run_export_process(selected_calendars, start_date, end_date, output_path):
    """The heavy lifting: exports selected calendars to .ics and merges them."""
    merged_calendar = Calendar()
    merged_calendar.add('prodid', '-//AI Secretary//Outlook Exporter//')
    merged_calendar.add('version', '2.0')

    with tempfile.TemporaryDirectory() as temp_dir:
        for calendar_folder in selected_calendars:
            print(f"Processing: {calendar_folder.Name}...")
            
            # METHOD A: Try Outlook's Built-in Exporter (Fast, Standard)
            try:
                exporter = calendar_folder.GetCalendarExporter()
                exporter.IncludeWholeCalendar = False
                exporter.StartDate = start_date
                exporter.EndDate = end_date
                exporter.CalendarDetail = 2
                exporter.IncludeAttachments = False
                exporter.IncludePrivateDetails = True
                
                temp_file_path = os.path.join(temp_dir, f"temp_{calendar_folder.Name}.ics")
                exporter.SaveAsICal(temp_file_path)
                
                # Read back and merge
                with open(temp_file_path, 'r', encoding='utf-8') as f:
                    temp_cal_data = f.read()
                    temp_cal = Calendar.from_ical(temp_cal_data)
                    for component in temp_cal.walk('vevent'):
                        merged_calendar.add_component(component)
            
            except Exception as e:
                # METHOD B: Manual Fallback (Slower, but works on weird calendars)
                print(f"  Standard export failed ({e}). Attempting manual extraction...")
                manual_events = export_manual_items(calendar_folder, start_date, end_date)
                
                if manual_events:
                    print(f"  Successfully manually extracted {len(manual_events)} events.")
                    for event in manual_events:
                        merged_calendar.add_component(event)
                else:
                    print(f"  Could not extract events from {calendar_folder.Name}.")

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

        self.found_calendars = [] 
        self.checkbox_vars = []   

        # --- UI LAYOUT ---
        left_frame = tk.Frame(self, bg="white", bd=2, relief=tk.GROOVE)
        left_frame.place(x=20, y=20, width=250, height=400)
        
        tk.Label(left_frame, text="Calendars", font=("Arial", 12, "bold"), bg="white").pack(pady=10)
        
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

        right_frame = tk.Frame(self, bg="#f0f0f0")
        right_frame.place(x=290, y=20, width=280, height=400)

        self.btn_pull = tk.Button(right_frame, text="Pull Calendars", bg="#ff6b6b", fg="white", 
                                  font=("Arial", 12, "bold"), height=2, relief=tk.FLAT,
                                  command=self.pull_calendars_action)
        self.btn_pull.pack(fill="x", pady=(0, 20))

        self.btn_push = tk.Button(right_frame, text="Push iCS", bg="#51cf66", fg="white", 
                                  font=("Arial", 12, "bold"), height=2, relief=tk.FLAT,
                                  command=self.push_ics_action)
        self.btn_push.pack(fill="x", pady=(0, 40))

        tk.Label(right_frame, text="Date Range", font=("Arial", 14, "bold"), bg="#f0f0f0").pack(pady=(0, 10))
        
        date_frame = tk.Frame(right_frame, bg="#f0f0f0")
        date_frame.pack(fill="x")

        today = datetime.date.today()
        next_week = today + datetime.timedelta(days=7)

        tk.Label(date_frame, text="Start Date (DD/MM/YYYY)", bg="#f0f0f0").pack(anchor="w")
        self.entry_start = tk.Entry(date_frame, font=("Arial", 11), justify="center")
        self.entry_start.insert(0, today.strftime("%d/%m/%Y"))
        self.entry_start.pack(fill="x", pady=(0, 15))

        tk.Label(date_frame, text="End Date (DD/MM/YYYY)", bg="#f0f0f0").pack(anchor="w")
        self.entry_end = tk.Entry(date_frame, font=("Arial", 11), justify="center")
        self.entry_end.insert(0, next_week.strftime("%d/%m/%Y"))
        self.entry_end.pack(fill="x")

    def pull_calendars_action(self):
        try:
            self.btn_pull.config(text="Loading...", state="disabled")
            self.update() 

            cals = get_calendars_from_outlook()
            self.found_calendars = cals
            
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
        selected_indices = [i for i, var in enumerate(self.checkbox_vars) if var.get()]
        if not selected_indices:
            messagebox.showwarning("Selection Required", "Please select at least one calendar from the list.")
            return

        start_str = self.entry_start.get()
        end_str = self.entry_end.get()

        try:
            start_date = datetime.datetime.strptime(start_str, "%d/%m/%Y")
            end_date = datetime.datetime.strptime(end_str, "%d/%m/%Y")
            end_date = end_date.replace(hour=23, minute=59, second=59)
            
            if start_date > end_date:
                messagebox.showerror("Invalid Dates", "Start date must be before end date.")
                return
        except ValueError:
            messagebox.showerror("Invalid Format", "Please use DD/MM/YYYY format (e.g., 25/12/2024).")
            return

        default_filename = f"Merged_Schedule_{start_date.strftime('%d-%m-%Y')}_to_{end_date.strftime('%d-%m-%Y')}.ics"
        
        output_path = filedialog.asksaveasfilename(
            defaultextension=".ics",
            initialfile=default_filename,
            title="Save Merged Calendar As",
            filetypes=[("iCalendar files", "*.ics"), ("All files", "*.*")]
        )

        if not output_path:
            return

        selected_folders = [self.found_calendars[i] for i in selected_indices]
        
        try:
            self.btn_push.config(text="Exporting...", bg="#8ce99a", state="disabled")
            self.update()

            final_path = run_export_process(selected_folders, start_date, end_date, output_path)
            
            messagebox.showinfo("Success", f"Export Complete!\nSaved to:\n{final_path}")
            
        except Exception as e:
            messagebox.showerror("Export Error", f"An error occurred during export:\n{e}")
        finally:
            self.btn_push.config(text="Push iCS", bg="#51cf66", state="normal")

if __name__ == "__main__":
    app = CalendarApp()
    app.mainloop()