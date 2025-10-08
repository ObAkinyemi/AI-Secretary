import win32com.client
import datetime

outlook = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")
calendar = outlook.GetDefaultFolder(9)  # 9 = olFolderCalendar

# Define date range
start = datetime.datetime(2025, 10, 6)
end = datetime.datetime(2025, 10, 10)
# code for if I wanted to just do 7 days automatically
# end_date = start_date + datetime.timedelta(days=7)

# # Restrict items to date range
# items = calendar.Items
# items.Sort("[Start]")
# items.IncludeRecurrences = True
# restriction = f"[Start] >= '{start.strftime('%m/%d/%Y %H:%M %p')}' AND [End] <= '{end.strftime('%m/%d/%Y %H:%M %p')}'"
# restricted_items = items.Restrict(restriction)

# # Print subject and start time
# for item in restricted_items:
#     print(item.Subject, item.Start, item.end);