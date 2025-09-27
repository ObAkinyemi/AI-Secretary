# outlook_exporter/export_calendar.py

import win32com.client
import datetime
import os
import argparse

def format_utc_datetime(dt):
    """Formats a datetime object into the required UTC string format for .ics files."""
    return dt.strftime("%Y%m%dT%H%M%SZ")

def export_calendar_manual(start_datetime, end_datetime):
    """
    Connects to Outlook, manually iterates through appointments in a date range,
    and constructs an .ics file from scratch.
    """
    try:
        # 1. Connect to the Outlook application
        print("Connecting to Outlook...")
        outlook = win32com.client.Dispatch("Outlook.Application")
        namespace = outlook.GetNamespace("MAPI")
        calendar_folder = namespace.GetDefaultFolder(9)

        print(f"Successfully connected to calendar: '{calendar_folder.Name}'")
        
        # 2. Filter appointments directly in Outlook for efficiency
        # The Restrict method requires dates in a specific string format.
        start_str = start_datetime.strftime('%m/%d/%Y %I:%M %p')
        end_str = end_datetime.strftime('%m/%d/%Y %I:%M %p')
        restriction = f"[Start] >= '{start_str}' AND [End] <= '{end_str}'"
        
        print(f"Filtering appointments from {start_str} to {end_str}...")
        
        calendar_items = calendar_folder.Items
        calendar_items.Sort("[Start]")
        calendar_items.IncludeRecurrences = True
        
        restricted_items = calendar_items.Restrict(restriction)
        print(f"Found {restricted_items.Count} appointments in the specified range.")

        # 3. Manually build the .ics file content
        ics_content = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//AI-Secretary//Outlook Exporter//EN",
        ]

        for item in restricted_items:
            ics_content.append("BEGIN:VEVENT")
            ics_content.append(f"SUMMARY:{item.Subject}")
            # Use StartUTC and EndUTC to get timezone-correct datetime objects
            ics_content.append(f"DTSTART:{format_utc_datetime(item.StartUTC)}")
            ics_content.append(f"DTEND:{format_utc_datetime(item.EndUTC)}")
            ics_content.append(f"LOCATION:{item.Location}")
            ics_content.append(f"UID:{item.GlobalAppointmentID}")
            ics_content.append("END:VEVENT")

        ics_content.append("END:VCALENDAR")
        
        final_ics_string = "\r\n".join(ics_content)

        # 4. Define the output file path and save the file
        desktop_path = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop')
        file_name = f"Outlook_Export_{start_datetime.strftime('%Y-%m-%d')}_to_{end_datetime.strftime('%Y-%m-%d')}.ics"
        output_path = os.path.join(desktop_path, file_name)

        print(f"Preparing to save file to: {output_path}")
        with open(output_path, "w") as f:
            f.write(final_ics_string)

        print("\n--------------------------------------------------")
        print("✅ Success! Calendar exported successfully.")
        print(f"File saved to your Desktop as: {file_name}")
        print("--------------------------------------------------")

    except Exception as e:
        print("\n--------------------------------------------------")
        print("❌ An error occurred:")
        print(e)
        print("\nTroubleshooting steps:")
        print("1. Make sure the Outlook desktop application is running.")
        print("2. Ensure all required packages are installed (see README).")
        print("3. If Outlook is open, try restarting it.")
        print("--------------------------------------------------")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export Outlook calendar to an .ics file for a specified date range.")
    parser.add_argument("--start", help="Start date in YYYY-MM-DD format.")
    parser.add_argument("--end", help="End date in YYYY-MM-DD format.")
    args = parser.parse_args()

    start_export_datetime = None
    end_export_datetime = None

    if args.start and args.end:
        try:
            start_dt = datetime.datetime.strptime(args.start, "%Y-%m-%d")
            end_dt = datetime.datetime.strptime(args.end, "%Y-%m-%d")
            start_export_datetime = start_dt
            end_export_datetime = end_dt.replace(hour=23, minute=59, second=59)
        except ValueError:
            print("Error: Dates must be in YYYY-MM-DD format.")
            exit()
    else:
        print("No date range specified. Defaulting to next full week.")
        today = datetime.date.today()
        start_of_next_week = today + datetime.timedelta(days=-today.weekday(), weeks=1)
        end_of_next_week = start_of_next_week + datetime.timedelta(days=6)
        start_export_datetime = datetime.datetime.combine(start_of_next_week, datetime.time.min)
        end_export_datetime = datetime.datetime.combine(end_of_next_week, datetime.time.max)

    export_calendar_manual(start_export_datetime, end_export_datetime)

