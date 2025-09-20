// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    let tasks = [];
    let currentlyEditingId = null; // null for new, holds ID for editing

    // --- DOM ELEMENT REFERENCES ---
    const taskNameInput = document.getElementById('task-name-input');
    const totalTimeInput = document.getElementById('total-time-input');
    const priorityInput = document.getElementById('priority-input');
    const chunkMinInput = document.getElementById('chunk-min-input');
    const chunkMaxInput = document.getElementById('chunk-max-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskListContainer = document.getElementById('task-list-container');
    const downloadJsonBtn = document.getElementById('download-json-btn');
    const downloadSqlBtn = document.getElementById('download-sql-btn');
    const formTitle = document.getElementById('form-title');
    
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
    
    const generateSQL = (taskArray) => {
        if (taskArray.length === 0) return '-- No tasks to export.';
        const tableName = 'flexible_tasks';
        const header = `DROP TABLE IF EXISTS ${tableName};\nCREATE TABLE ${tableName} (\n    id BIGINT PRIMARY KEY,\n    task_name VARCHAR(255) NOT NULL,\n    total_time VARCHAR(50),\n    priority VARCHAR(50),\n    chunk_min VARCHAR(20),\n    chunk_max VARCHAR(20)\n);\n`;
        return header + taskArray.map(t => `INSERT INTO ${tableName} (id, task_name, total_time, priority, chunk_min, chunk_max) VALUES (${t.id}, '${t.name.replace(/'/g, "''")}', '${t.time}', '${t.priority}', '${t.chunkMin}', '${t.chunkMax}');`).join('\n');
    };

    const handleDownload = (content, fileName, mimeType) => {
        if (tasks.length === 0) {
            alert('No tasks to download.');
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

    // --- CORE LOGIC ---
    const enterEditMode = (id) => {
        const taskToEdit = tasks.find(t => t.id === id);
        if (!taskToEdit) return;

        currentlyEditingId = id;
        formTitle.textContent = 'Edit Task';
        
        taskNameInput.value = taskToEdit.name;
        totalTimeInput.value = taskToEdit.time;
        priorityInput.value = taskToEdit.priority;
        chunkMinInput.value = taskToEdit.chunkMin;
        chunkMaxInput.value = taskToEdit.chunkMax;

        addTaskBtn.textContent = 'Update Task';
        addTaskBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        addTaskBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    };

    const exitEditMode = () => {
        currentlyEditingId = null;
        formTitle.textContent = 'Create New Task';

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
        if (tasks.length === 0) {
            taskListContainer.innerHTML = `<div class="text-center text-gray-500 pt-20"><p>No tasks added yet.</p></div>`;
            return;
        }
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item bg-gray-700 p-4 rounded-md flex justify-between items-start cursor-pointer transition-colors duration-200';
            taskElement.addEventListener('click', () => enterEditMode(task.id));

            const infoContainer = document.createElement('div');
            infoContainer.innerHTML = `
                <p class="font-bold text-white">${task.name}</p>
                <p class="text-sm text-gray-300">Total: ${task.time} | Chunks: ${task.chunkMin} to ${task.chunkMax}</p>
                <p class="text-sm font-semibold ${getPriorityClass(task.priority)}">${task.priority} Priority</p>
            `;

            const removeButton = document.createElement('button');
            removeButton.innerHTML = '&times;';
            removeButton.className = 'bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition duration-300 flex-shrink-0 ml-4';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevents the edit click from firing
                handleRemoveTask(task.id);
            });
            
            taskElement.appendChild(infoContainer);
            taskElement.appendChild(removeButton);
            taskListContainer.appendChild(taskElement);
        });
    };
    
    const handleFormSubmit = () => {
        const name = taskNameInput.value.trim();
        const time = totalTimeInput.value.trim();
        const priority = priorityInput.value;
        const chunkMin = chunkMinInput.value;
        const chunkMax = chunkMaxInput.value;

        if (!name || !time || !priority) {
            alert('Please fill out Task Name, Total Time, and Priority.');
            return;
        }
        
        if (currentlyEditingId !== null) {
            // Update existing task
            const taskIndex = tasks.findIndex(t => t.id === currentlyEditingId);
            if (taskIndex > -1) {
                tasks[taskIndex] = { ...tasks[taskIndex], name, time, priority, chunkMin, chunkMax };
            }
            exitEditMode();
        } else {
            // Add new task
            const newTask = { id: Date.now(), name, time, priority, chunkMin, chunkMax };
            tasks.push(newTask);
        }
        
        // Clear only the input fields for a new task, not when editing
        if (currentlyEditingId === null) {
            taskNameInput.value = '';
            totalTimeInput.value = '';
            priorityInput.value = '';
        }

        renderTasks();
        if (currentlyEditingId !== null) exitEditMode(); // ensure we exit edit mode after render
    };
    
    const handleRemoveTask = (id) => {
        if(currentlyEditingId === id){
            exitEditMode(); // If deleting the task being edited, reset the form
        }
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
    };

    // --- EVENT LISTENERS ---
    addTaskBtn.addEventListener('click', handleFormSubmit);
    downloadJsonBtn.addEventListener('click', () => handleDownload(JSON.stringify(tasks, null, 2), 'tasks.json', 'application/json'));
    downloadSqlBtn.addEventListener('click', () => handleDownload(generateSQL(tasks), 'tasks.sql', 'application/sql'));

    // --- INITIALIZATION ---
    populateTimeDropdowns();
    renderTasks();
});

