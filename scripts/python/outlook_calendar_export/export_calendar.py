# outlook_exporter/export_calendar.py

import win32com.client
import datetime
import os
import argparse

def export_calendar(start_date, end_date):
    """
    Connects to Outlook and exports the calendar for a specified date range to an .ics file.
    """
    try:
        # 1. Connect to the Outlook application
        print("Connecting to Outlook...")
        outlook = win32com.client.Dispatch("Outlook.Application")
        namespace = outlook.GetNamespace("MAPI")
        calendar_folder = namespace.GetDefaultFolder(9)  # 9 corresponds to the Calendar folder

        print(f"Successfully connected to calendar: '{calendar_folder.Name}'")
        print(f"Exporting date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")

        # 2. Use the CalendarSharing object to export the .ics file
        exporter = calendar_folder.GetCalendarExporter()

        # Set export options
        exporter.IncludeWholeCalendar = False
        exporter.StartDate = start_date
        exporter.EndDate = end_date
        exporter.CalendarDetail = 2 # 2 = Full Details
        exporter.IncludeAttachments = False
        exporter.IncludePrivateDetails = True
        exporter.RestrictToFolder = True

        # 3. Define the output file path
        desktop_path = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop')
        file_name = f"Outlook_Export_{start_date.strftime('%Y-%m-%d')}_to_{end_date.strftime('%Y-%m-%d')}.ics"
        output_path = os.path.join(desktop_path, file_name)

        print(f"Preparing to save file to: {output_path}")

        # 4. Save the calendar file
        exporter.SaveAsICal(output_path)

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
        print("2. Ensure you have run 'pip install pywin32' in your command prompt.")
        print("3. If Outlook is open, try restarting it.")
        print("--------------------------------------------------")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export Outlook calendar to an .ics file for a specified date range.")
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
        start_export_date = today + datetime.timedelta(days=-today.weekday(), weeks=1)
        end_export_date = start_export_date + datetime.timedelta(days=6)

    export_calendar(start_export_date, end_export_date)

