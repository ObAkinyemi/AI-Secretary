Good to add to the end of a prompt for a new feature

Before you execute, explain to me in your own words how you understand the prompt, what you will do, and how you will implement it.



Prompt 1

Can you create a nextjs page that can be used to:

1\. add, remove, or adjust schedule events in the action, event, time format?

* Action: State the command clearly. The most common actions are Add, Remove, or Reschedule.
* Event: Name the specific event and its duration (e.g., "Squadron Meeting (1h)", "Physics Study (2h block)").
* Time: Auto (you will determine when the best time to complete a portion of this task will be)
* On the page should be 3 input elements that are stacked on top of each other in a sleek manner. The top input element should be action, the middle input element should be event, and the bottom input element should be time.
* Next to those input elements should be an add button.
* Once the schedule event is created, it should be displayed somewhere on the page that makes sense from a css layout perspective.
* I also want the schedule event stored into a json file or an sql file that can be downloaded by a user once all the events have been added. Make a button that will do this.

The  purpose of this is to make it faster to create events, add events, and schedule.



Prompt 2

Can you add in a section that will allow me to upload my fixed appointments as a pdf?
It will have:

* My daily fixed appointments (things that must happen every day)
* My fixed appointments (fa) that I must go to every day.

The difference between the two is, fa's I go to every day are not the same every day. They are appointments that I have made with others before time like class. You have to schedule around those.
My daily fa's are mandatory events that I have to do on a daily basis.



Prompt 3

I want the ability to click on a task in the current task list and edit it.

* The information in the task I select from the current task list should populate the "create new task" block with the task name, total time, priority, and chunk size.
* The "add task" button should be changed to "edit task"



Prompt 4

I want you to add another block on the page that will allow me to add/remove/edit fixed appointments without having to redownload a new pdf with all of my fixed appointments.



prompt 5
I want to be able to see my fixed appointments in the "daily mandatory events" block when I upload my fixed appointments pdf.

* Fill out the daily mandatory events text block with the days, events, and times from the pdf.
* Fill the check boxes of the days included in the pdf.


Prompt 6
I am going to use co-pilot to create a python script that should export one weeks worth of outlook data into an ics file.
It will be in a separate github repository from the AI secretary.
Once this happens, pdfjs will no longer be needed, and instead, I'll need AI-secretary (the nextjs version) to read ics files and print them out in a more user-friendly format.
For right now, I will get the python script to work. However, I want to give you an ics so that you can give me an example of what user-friendly would look like.
In the very near future, I want to implement this python script into AI secretary as a button that will allow me to export [time period] worth of every event from my outlook calendar. In this context, my outlook calendar does not mean one editable outlook calendar. One calendar is the entire outlook of all of my events in the outlook app, or in the future, google calendar, and apple calendar.

[time period] could be one week, one month, one day, 3 days, etc. The user chooses, but a month will be the limit for now. In the far future we can do more, but one month is good enough for now.