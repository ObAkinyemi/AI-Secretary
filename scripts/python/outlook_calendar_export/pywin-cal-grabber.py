import os
import win32com.client
import datetime
from datetime import timezone

outlook = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")
calendar = outlook.GetDefaultFolder(9)  # 9 = olFolderCalendar

# Define date range
start_date = datetime.datetime(2025, 10, 6)
# end = datetime.datetime(2025, 10, 10)
# code for if I wanted to just do 7 days automatically
end_date = start_date + datetime.timedelta(days=7)

calendar_items = []


# Loop through all top-level mailboxes
for i in range(outlook.Folders.Count):
    mailbox = outlook.Folders.Item(i + 1)
    try:
        calendar_folder = mailbox.Folders["Calendar"]
        items = calendar_folder.Items
        items.Sort("[Start]")
        items.IncludeRecurrences = True

        # Restrict to date range
        restriction = f"[Start] >= '{start_date.strftime('%m/%d/%Y %H:%M %p')}' AND [End] <= '{end_date.strftime('%m/%d/%Y %H:%M %p')}'"
        restricted_items = items.Restrict(restriction)

        for item in restricted_items:
            calendar_items.append(item)

    except Exception as e:
        print(f"Skipping {mailbox.Name}: {e}")


# Display the results to test and make sure the above loop works
# for item in calendar_items:
#     try:
#         print(f"{item.Subject} | {item.Start} - {item.End}")
#     except Exception as e:
#         print(f"Error reading item: {e}")


# Generate .ics content
ics_lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Outlook Export//EN"
]


for item in calendar_items:
    try:
        subject = item.Subject
        dtstart = item.Start.astimezone(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        dtend = item.End.astimezone(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")

        location = item.Location if item.Location else ""

        ics_lines.extend([
            "BEGIN:VEVENT",
            f"SUMMARY:{subject}",
            f"DTSTART:{dtstart}",
            f"DTEND:{dtend}",
            f"LOCATION:{location}",
            "END:VEVENT"
        ])
    except Exception as e:
        print(f"Error processing item: {e}")


ics_lines.append("END:VCALENDAR")

# Save to file

base_filename = "calendar_export"
extension = ".ics"
filename = base_filename + extension
counter = 1

# Check for existing files and increment the filename
while os.path.exists(filename):
    filename = f"{base_filename}{counter}{extension}"
    counter += 1

# Save the file with the unique name
with open(filename, "w", encoding="utf-8") as f:
    f.write("\n".join(ics_lines))

print(f"✅ ICS file '{filename}' has been created successfully.")