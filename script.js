// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    let flexibleTasks = [];
    let fixedAppointments = [];
    let currentlyEditingTaskId = null;
    let currentlyEditingAppointmentId = null;

    // --- DOM ELEMENT REFERENCES ---
    // Flexible Tasks
    const taskNameInput = document.getElementById('task-name-input');
    const totalTimeInput = document.getElementById('total-time-input');
    const priorityInput = document.getElementById('priority-input');
    const chunkMinInput = document.getElementById('chunk-min-input');
    const chunkMaxInput = document.getElementById('chunk-max-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskListContainer = document.getElementById('task-list-container');
    const downloadJsonBtn = document.getElementById('download-json-btn');
    const downloadSqlBtn = document.getElementById('download-sql-btn');
    const taskFormTitle = document.getElementById('form-title');

    // Fixed Appointments
    const appointmentNameInput = document.getElementById('appointment-name-input');
    const dayOfWeekInput = document.getElementById('day-of-week-input');
    const startTimeInput = document.getElementById('start-time-input');
    const endTimeInput = document.getElementById('end-time-input');
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    const appointmentListContainer = document.getElementById('appointment-list-container');
    const appointmentFormTitle = document.getElementById('appointment-form-title');
    const downloadApptJsonBtn = document.getElementById('download-appointment-json-btn');
    const downloadApptSqlBtn = document.getElementById('download-appointment-sql-btn');


    // Legacy / PDF Section
    const pdfUploadInput = document.getElementById('pdf-upload');
    const dailyAppointmentsTextarea = document.getElementById('daily-appointments');
    
    // --- HELPER FUNCTIONS ---
    const populateTimeDropdowns = () => {
        const times = [];
        for (let i = 1; i <= 8; i++) { // up to 2 hours
            const minutes = i * 15;
            const hours = minutes / 60;
            const timeText = minutes < 60 ? `${minutes} min` : `${hours} hour${hours > 1 ? 's' : ''}`;
            const timeValue = minutes < 60 ? `${minutes}m` : `${hours}h`;
            times.push({ value: timeValue, text: timeText });
        }
        times.forEach(time => {
            chunkMinInput.add(new Option(time.text, time.value));
            chunkMaxInput.add(new Option(time.text, time.value));
        });
        chunkMaxInput.selectedIndex = times.length - 1;
    };
    
    const generateTaskSQL = (taskArray) => {
        if (taskArray.length === 0) return '-- No tasks to export.';
        const tableName = 'flexible_tasks';
        const header = `DROP TABLE IF EXISTS ${tableName};\nCREATE TABLE ${tableName} (\n    id BIGINT PRIMARY KEY,\n    task_name VARCHAR(255) NOT NULL,\n    total_time VARCHAR(50),\n    priority VARCHAR(50),\n    chunk_min VARCHAR(20),\n    chunk_max VARCHAR(20)\n);\n`;
        return header + taskArray.map(t => `INSERT INTO ${tableName} (id, task_name, total_time, priority, chunk_min, chunk_max) VALUES (${t.id}, '${t.name.replace(/'/g, "''")}', '${t.time}', '${t.priority}', '${t.chunkMin}', '${t.chunkMax}');`).join('\n');
    };
    
    const generateAppointmentSQL = (apptArray) => {
        if (apptArray.length === 0) return '-- No appointments to export.';
        const tableName = 'fixed_appointments';
        const header = `DROP TABLE IF EXISTS ${tableName};\nCREATE TABLE ${tableName} (\n    id BIGINT PRIMARY KEY,\n    appointment_name VARCHAR(255) NOT NULL,\n    day_of_week VARCHAR(50),\n    start_time TIME,\n    end_time TIME\n);\n`;
        return header + apptArray.map(a => `INSERT INTO ${tableName} (id, appointment_name, day_of_week, start_time, end_time) VALUES (${a.id}, '${a.name.replace(/'/g, "''")}', '${a.day}', '${a.start}', '${a.end}');`).join('\n');
    };

    const handleDownload = (content, fileName, mimeType, isAppointment = false) => {
        const dataArray = isAppointment ? fixedAppointments : flexibleTasks;
        if (dataArray.length === 0) {
            alert(`No ${isAppointment ? 'fixed appointments' : 'flexible tasks'} to download.`);
            return;
        }
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getPriorityClass = (priority) => ({'High': 'text-red-400', 'Medium': 'text-yellow-400', 'Low': 'text-green-400'}[priority] || 'text-gray-400');

    // --- FLEXIBLE TASK LOGIC ---
    const enterTaskEditMode = (id) => {
        const taskToEdit = flexibleTasks.find(t => t.id === id);
        if (!taskToEdit) return;
        currentlyEditingTaskId = id;
        taskFormTitle.textContent = 'Edit Flexible Task';
        taskNameInput.value = taskToEdit.name;
        totalTimeInput.value = taskToEdit.time;
        priorityInput.value = taskToEdit.priority;
        chunkMinInput.value = taskToEdit.chunkMin;
        chunkMaxInput.value = taskToEdit.chunkMax;
        addTaskBtn.textContent = 'Update Task';
        addTaskBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        addTaskBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    };

    const exitTaskEditMode = () => {
        currentlyEditingTaskId = null;
        taskFormTitle.textContent = 'Create Flexible Task';
        taskNameInput.value = '';
        totalTimeInput.value = '';
        priorityInput.value = '';
        chunkMinInput.selectedIndex = 0;
        chunkMaxInput.selectedIndex = chunkMaxInput.options.length - 1;
        addTaskBtn.textContent = 'Add Task';
        addTaskBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        addTaskBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
    };

    const renderTasks = () => {
        taskListContainer.innerHTML = '';
        if (flexibleTasks.length === 0) {
            taskListContainer.innerHTML = `<div class="text-center text-gray-500 pt-20"><p>No flexible tasks added yet.</p></div>`;
            return;
        }
        flexibleTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item bg-gray-700 p-4 rounded-md flex justify-between items-start cursor-pointer transition-colors duration-200';
            taskElement.addEventListener('click', () => enterTaskEditMode(task.id));
            const infoContainer = document.createElement('div');
            infoContainer.innerHTML = `<p class="font-bold text-white">${task.name}</p><p class="text-sm text-gray-300">Total: ${task.time} | Chunks: ${task.chunkMin} to ${task.chunkMax}</p><p class="text-sm font-semibold ${getPriorityClass(task.priority)}">${task.priority} Priority</p>`;
            const removeButton = document.createElement('button');
            removeButton.innerHTML = '&times;';
            removeButton.className = 'bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition duration-300 flex-shrink-0 ml-4';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                handleRemoveTask(task.id);
            });
            taskElement.appendChild(infoContainer);
            taskElement.appendChild(removeButton);
            taskListContainer.appendChild(taskElement);
        });
    };
    
    const handleTaskFormSubmit = () => {
        const name = taskNameInput.value.trim();
        const time = totalTimeInput.value.trim();
        const priority = priorityInput.value;
        const chunkMin = chunkMinInput.value;
        const chunkMax = chunkMaxInput.value;
        if (!name || !time || !priority) {
            alert('Please fill out Task Name, Total Time, and Priority.');
            return;
        }
        if (currentlyEditingTaskId !== null) {
            const taskIndex = flexibleTasks.findIndex(t => t.id === currentlyEditingTaskId);
            if (taskIndex > -1) flexibleTasks[taskIndex] = { ...flexibleTasks[taskIndex], name, time, priority, chunkMin, chunkMax };
        } else {
            flexibleTasks.push({ id: Date.now(), name, time, priority, chunkMin, chunkMax });
        }
        renderTasks();
        exitTaskEditMode();
    };
    
    const handleRemoveTask = (id) => {
        if(currentlyEditingTaskId === id) exitTaskEditMode();
        flexibleTasks = flexibleTasks.filter(t => t.id !== id);
        renderTasks();
    };

    // --- FIXED APPOINTMENT LOGIC ---
    const formatTime = (time) => {
        if (!time) return '';
        let [hours, minutes] = time.split(':');
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    };
    
    const enterAppointmentEditMode = (id) => {
        const appointmentToEdit = fixedAppointments.find(a => a.id === id);
        if (!appointmentToEdit) return;
        currentlyEditingAppointmentId = id;
        appointmentFormTitle.textContent = 'Edit Fixed Appointment';
        appointmentNameInput.value = appointmentToEdit.name;
        dayOfWeekInput.value = appointmentToEdit.day;
        startTimeInput.value = appointmentToEdit.start;
        endTimeInput.value = appointmentToEdit.end;
        addAppointmentBtn.textContent = 'Update Appointment';
        addAppointmentBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        addAppointmentBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    };

    const exitAppointmentEditMode = () => {
        currentlyEditingAppointmentId = null;
        appointmentFormTitle.textContent = 'Add Fixed Appointment';
        appointmentNameInput.value = '';
        dayOfWeekInput.value = '';
        startTimeInput.value = '';
        endTimeInput.value = '';
        addAppointmentBtn.textContent = 'Add Appointment';
        addAppointmentBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        addAppointmentBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
    };

    const renderAppointments = () => {
        appointmentListContainer.innerHTML = '';
        if (fixedAppointments.length === 0) {
            appointmentListContainer.innerHTML = `<div class="text-center text-gray-500 pt-12"><p>No fixed appointments added yet.</p></div>`;
            return;
        }
        fixedAppointments.forEach(appt => {
            const apptElement = document.createElement('div');
            apptElement.className = 'appointment-item bg-gray-700 p-4 rounded-md flex justify-between items-start cursor-pointer transition-colors duration-200';
            apptElement.addEventListener('click', () => enterAppointmentEditMode(appt.id));
            const infoContainer = document.createElement('div');
            infoContainer.innerHTML = `<p class="font-bold text-white">${appt.name}</p><p class="text-sm text-gray-300">${appt.day} | ${formatTime(appt.start)} - ${formatTime(appt.end)}</p>`;
            const removeButton = document.createElement('button');
            removeButton.innerHTML = '&times;';
            removeButton.className = 'bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition duration-300 flex-shrink-0 ml-4';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                handleRemoveAppointment(appt.id);
            });
            apptElement.appendChild(infoContainer);
            apptElement.appendChild(removeButton);
            appointmentListContainer.appendChild(apptElement);
        });
    };

    const handleAppointmentFormSubmit = () => {
        const name = appointmentNameInput.value.trim();
        const day = dayOfWeekInput.value;
        const start = startTimeInput.value;
        const end = endTimeInput.value;
        if (!name || !day || !start || !end) {
            alert('Please fill out all appointment fields.');
            return;
        }
        if (currentlyEditingAppointmentId !== null) {
            const apptIndex = fixedAppointments.findIndex(a => a.id === currentlyEditingAppointmentId);
            if (apptIndex > -1) fixedAppointments[apptIndex] = { ...fixedAppointments[apptIndex], name, day, start, end };
        } else {
            fixedAppointments.push({ id: Date.now(), name, day, start, end });
        }
        fixedAppointments.sort((a, b) => {
            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            if (days.indexOf(a.day) !== days.indexOf(b.day)) return days.indexOf(a.day) - days.indexOf(b.day);
            return a.start.localeCompare(b.start);
        });
        renderAppointments();
        exitAppointmentEditMode();
    };
    
    const handleRemoveAppointment = (id) => {
        if(currentlyEditingAppointmentId === id) exitAppointmentEditMode();
        fixedAppointments = fixedAppointments.filter(a => a.id !== id);
        renderAppointments();
    };

    // --- PDF PROCESSING LOGIC ---
    const handlePdfUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }
        const originalPlaceholder = dailyAppointmentsTextarea.placeholder;
        dailyAppointmentsTextarea.placeholder = 'Reading and processing PDF...';
        dailyAppointmentsTextarea.value = '';
        try {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                const typedarray = new Uint8Array(this.result);
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }
                dailyAppointmentsTextarea.value = fullText.trim();
                dailyAppointmentsTextarea.placeholder = originalPlaceholder;
            };
            fileReader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error processing PDF:', error);
            alert('Failed to process the PDF file.');
            dailyAppointmentsTextarea.placeholder = originalPlaceholder;
        }
    };

    // --- EVENT LISTENERS ---
    addTaskBtn.addEventListener('click', handleTaskFormSubmit);
    downloadJsonBtn.addEventListener('click', () => handleDownload(JSON.stringify(flexibleTasks, null, 2), 'tasks.json', 'application/json', false));
    downloadSqlBtn.addEventListener('click', () => handleDownload(generateTaskSQL(flexibleTasks), 'tasks.sql', 'application/sql', false));
    
    addAppointmentBtn.addEventListener('click', handleAppointmentFormSubmit);
    downloadApptJsonBtn.addEventListener('click', () => handleDownload(JSON.stringify(fixedAppointments, null, 2), 'appointments.json', 'application/json', true));
    downloadApptSqlBtn.addEventListener('click', () => handleDownload(generateAppointmentSQL(fixedAppointments), 'appointments.sql', 'application/sql', true));
    
    pdfUploadInput.addEventListener('change', handlePdfUpload);

    // --- INITIALIZATION ---
    populateTimeDropdowns();
    renderTasks();
    renderAppointments();
});

