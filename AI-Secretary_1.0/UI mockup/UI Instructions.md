We're going to have 4 pages: the task manager page, the appointment manager page, the generate schedule page, and the settings page.

the first page will be the task manager page. On this page will be three components: add new task, task queue, and generated json. 



Within the Add New Task component:

There will be a text input box for the task name.

There will be a drop-down of total duration. In this drop-down there will be multiple options for the total duration of the task ranging from 30 minutes to 6 hours. The options should be broken up into 30 minute increments.

Below the total duration component, there will be the minimum chunk size component and the maximum chunk size component next to each other. Both of these components should have a drop down to allow for chunk size of 15 minutes to 3 hours in 15 minute increments.

There should be a due date component. This due date component is used to input the number of days I have to complete the assignment. This will also be an optional component. If there is no input in this component, then the input should be null.

There will be a priority component. It is component should have a drop down of four options: High, medium, low, based on due date.

There will be a component that allows me to put in the category of this task as a drop down of different options that can be configured in the settings page. The settings page will be determined after all of these components are implemented. For right now, make the input a drop down of 4 options: personal, academic, physical, military.



The second component is a task queue that allows me to see what tasks I currently have inputted. There should be an orange button to import tasks by uploading a json file using the format that is specified. If the json file is not correct, let the user know.

When a task is inputted into the task queue, I want to be able to click on a task and get a few different options.

I want the option to edit the task or use the task as a template for other tasks. I want the option to use the task as a template for other tasks should fill in the different input boxes of the add new task component based on the parameters of the chosen task excluding the task name.

These options should be in the form of a popup in the middle of the screen while the rest of the screen is lowered in brightness by 40%. 



The generate json component should show all of the tasks, in json format, that I'm inputting in real time in the format that will be uploaded to Gemini.







The second page will be the appointment manager page.



In the appointment manager, there should be two components. One component will be an Add New Appointment component and the other will be the appointment list component which shows me a list of all of the appointments within the ICS file I upload and the appointments that I add using the add new appointment component. 



Instructions for the Add New Appointment component:

In the Add New Appointment component there should be a text input box for me to input my appointment name. There should be a component to add the date using month date and year. There should be a start time and end time component using military time.

There should be an add appointment button to add that appointment to the appointment list.

In the appointment list component there should be a button called download ICS file and a button called upload ICS file. The button, Download ICS File, should allow me to download all of the appointments in the appointment list, including the ones that I upload from the upload ICS button, in ICS format. The upload ICS file should allow me to upload an ICS file to the appointment list and it should list all of my appointments from the ICS file into the appointment list for me to see along with the appointments that I add from the add new appointment component.

I also want to be able to click on an appointment and get a few different options:

I want the option to edit the appointment

I want the option to use the appointment as a template for other tasks.

These options should be in the form of a pop up in the middle of the screen while the rest of the screen is lowered in brightness by 40%.

The option to use the appointment as a template for other appointments should fill in the different input boxes of the add new appointment component based on the parameters of that chosen appointment excluding the task name.

In the appointment list:

If the appointment list component is not as big as the height of the appointment manager, then I want the appointment list to expand in height downward. Once the bottom of the appointment list has reached the bottom of the page, I want the ability to scroll through the different appointments in the appointment list.



The third page will be the generate schedule page

The scheduling rules input box should be at the top. I want a "new rule" button under all of the rules that allows me to add a text box for a new rule. Specify that each rule should be succinct and specific. This component should expand to fit the number of rules desired based on how many times the "new rule" button is clicked and the amount of text in each rule box. There should be an upload rules button to allow for a user to upload however many rules they want. These rules should be uploaded according to the instructions in this [document](https://docs.google.com/document/d/18HUUhGPsF6g9Cvbie5qmT2eieyWruxeHfWP1B2gV7Dk/edit?tab=t.0).



Under the scheduling rules component should be the generate schedule button. After a schedule is generated there should be a button that says push -> (an arrow) ICS. Before the schedule is generated the push -> ICS button should be hidden. Users should have the option to have a different schedule generate every single time they press the generate schedule button based on the rules they have set. The schedule that is generated will be based on the tasks in the task manager, the appointments and the appointment manager, and the rules in the scheduling rules input. If there is anything wrong with the input let the user know where the mistake is so they can fix it. The schedule displayed should include all appointments and tasks, but the ICS that is generated and downloaded should only include the tasks.



The settings page will be configured later, but for right now just add a settings page and leave it blank.



Remove all pdfjs components and all pdfjs integrations from the code.

