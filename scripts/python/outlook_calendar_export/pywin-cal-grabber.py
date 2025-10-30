# outlook_exporter/export_calendar.py

import win32com.client
import datetime
import os
import argparse
import tempfile
from icalendar import Calendar, Event

def get_all_calendars(namespace):
    """
    Finds all calendar folders in the user's Outlook profile.
    """
    calendars = []
    # olAppointmentItem = 1
    for folder in namespace.Folders:
        try:
            if folder.DefaultItemType == 1: # 1 = olAppointmentItem
                calendars.append(folder)
        except Exception:
            pass # Ignore folders that fail access
    return calendars

def select_calendars(calendar_list):
    """
    Presents a numbered list of calendars and asks the user to select which ones to export.
    """
    if not calendar_list:
        print("No calendar folders found.")
        return []

    print("\n--- Available Calendars ---")
    for i, calendar in enumerate(calendar_list):
        print(f"  {i + 1}: {calendar.Name}")

    print("\nEnter the numbers of the calendars to export, separated by commas (e.g., 1, 3):")
    try:
        selection_str = input("> ")
        selected_indices = [int(i.strip()) - 1 for i in selection_str.split(',')]
        
        selected_calendars = []
        for index in selected_indices:
            if 0 <= index < len(calendar_list):
                selected_calendars.append(calendar_list[index])
            else:
                print(f"Warning: Index {index + 1} is out of range. Skipping.")
        
        return selected_calendars
        
    except ValueError:
        print("Invalid input. Please enter numbers separated by commas.")
        return []
    except Exception as e:
        print(f"An error occurred during selection: {e}")
        return []

def export_and_merge_calendars(calendar_list, start_date, end_date):
    """
    Exports multiple calendars for a date range and merges them into a single .ics file.
    """
    try:
        merged_calendar = Calendar()
        merged_calendar.add('prodid', '-//Your AI Secretary//Outlook Exporter//')
        merged_calendar.add('version', '2.0')

        # Use a temporary directory to store intermediate .ics files
        with tempfile.TemporaryDirectory() as temp_dir:
            print(f"\nExporting {len(calendar_list)} calendar(s)...")

            for calendar_folder in calendar_list:
                print(f"  Processing: '{calendar_folder.Name}'...")
                try:
                    exporter = calendar_folder.GetCalendarExporter()
                    
                    # Set export options
                    exporter.IncludeWholeCalendar = False
                    exporter.StartDate = start_date
                    exporter.EndDate = end_date
                    exporter.CalendarDetail = 2  # 2 = Full Details
                    exporter.IncludeAttachments = False
                    exporter.IncludePrivateDetails = True
                    exporter.RestrictToFolder = True
                    
                    # Define a temporary file path
                    temp_file_path = os.path.join(temp_dir, f"temp_{calendar_folder.Name}.ics")
                    
                    # 1. Export this calendar to its own .ics file
                    exporter.SaveAsICal(temp_file_path)
                    
                    # 2. Read the exported file and merge its events
                    with open(temp_file_path, 'r', encoding='utf-8') as f:
                        temp_cal_data = f.read()
                        temp_cal = Calendar.from_ical(temp_cal_data)
                        
                        # Add each event from the temp calendar to the main one
                        for component in temp_cal.walk('vevent'):
                            merged_calendar.add_component(component)
                            
                except Exception as e:
                    print(f"    WARNING: Could not export calendar '{calendar_folder.Name}'. Error: {e}")

        # 3. Define the final output file path
        desktop_path = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop')
        file_name = f"Merged_Export_{start_date.strftime('%Y-%m-%d')}_to_{end_date.strftime('%Y-%m-%d')}.ics"
        output_path = os.path.join(desktop_path, file_name)

        print(f"\nMerging calendars and saving to: {output_path}")

        # 4. Save the merged calendar to the final .ics file
        with open(output_path, 'wb') as f:
            f.write(merged_calendar.to_ical())

        print("\n--------------------------------------------------")
        print("✅ Success! Calendars merged and exported.")
        print(f"File saved to your Desktop as: {file_name}")
        print("--------------------------------------------------")

    except Exception as e:
        print("\n--------------------------------------------------")
        print("❌ An error occurred:")
        print(e)
        print("\nTroubleshooting steps:")
        print("1. Make sure Outlook is running.")
        print("2. Ensure you have run 'pip install pywin32 icalendar'.")
        print("--------------------------------------------------")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export and merge multiple Outlook calendars to a single .ics file.")
    parser.add_argument("--start", help="Start date in YYYY-MM-DD format.")
    parser.add_argument("--end", help="End date in YYYY-MM-DD format.")
    args = parser.parse_args()

    start_export_date = None
    end_export_date = None

    if args.start and args.end:
        try:
            start_export_date = datetime.datetime.strptime(args.start, "%Y-%m-%d").date()
            end_export_date = datetime.datetime.strptime(args.end, "%Y-%m-%d").date()
        except ValueError:
            print("Error: Dates must be in YYYY-MM-DD format.")
            exit()
    else:
        # Default behavior: Export the next full week (Monday to Sunday)
        print("No date range specified. Defaulting to next full week.")
        today = datetime.date.today()
        # Find the next Monday
        start_export_date = today + datetime.timedelta(days=-today.weekday(), weeks=1)
        # Find the following Sunday
        end_export_date = start_export_date + datetime.timedelta(days=6)
    
    try:
        print("Connecting to Outlook...")
        outlook = win32com.client.Dispatch("Outlook.Application")
        namespace = outlook.GetNamespace("MAPI")
        
        all_calendars = get_all_calendars(namespace)
        selected_calendars = select_calendars(all_calendars)
        
        if selected_calendars:
            print(f"Exporting date range: {start_export_date.strftime('%Y-%m-%d')} to {end_export_date.strftime('%Y-%m-%d')}")
            export_and_merge_calendars(selected_calendars, start_export_date, end_export_date)
        else:
            print("No calendars selected. Exiting.")

    except Exception as e:
        print("\n--------------------------------------------------")
        print("❌ Could not connect to Outlook.")
        print("1. Make sure the Outlook desktop application is running.")
        print("2. If Outlook is open, try restarting it.")
        print(e)
        print("--------------------------------------------------")
