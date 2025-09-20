// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    let tasks = [];

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
    
    // --- HELPER FUNCTIONS ---
    const populateTimeDropdowns = () => {
        const times = [];
        for (let i = 1; i <= 8; i++) { // up to 2 hours
            const minutes = i * 15;
            if (minutes < 60) {
                times.push({ value: `${minutes}m`, text: `${minutes} min` });
            } else {
                const hours = minutes / 60;
                times.push({ value: `${hours}h`, text: `${hours} hour${hours > 1 ? 's' : ''}` });
            }
        }

        times.forEach(time => {
            const optionMin = new Option(time.text, time.value);
            const optionMax = new Option(time.text, time.value);
            chunkMinInput.add(optionMin);
            chunkMaxInput.add(optionMax);
        });
        chunkMaxInput.selectedIndex = times.length -1; // Default max to the highest value
    };
    
    const generateSQL = (taskArray) => {
        if (taskArray.length === 0) return '-- No tasks to export.';
        const tableName = 'flexible_tasks';
        const header = `
DROP TABLE IF EXISTS ${tableName};
CREATE TABLE ${tableName} (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_name VARCHAR(255) NOT NULL,
    total_time VARCHAR(50),
    priority VARCHAR(50),
    chunk_min VARCHAR(20),
    chunk_max VARCHAR(20)
);
`;
        const values = taskArray.map(t => 
            `INSERT INTO ${tableName} (task_name, total_time, priority, chunk_min, chunk_max) VALUES ('${t.name.replace(/'/g, "''")}', '${t.time}', '${t.priority}', '${t.chunkMin}', '${t.chunkMax}');`
        ).join('\n');
        return header + values;
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

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-400';
            case 'Medium': return 'text-yellow-400';
            case 'Low': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    // --- CORE LOGIC ---
    const renderTasks = () => {
        taskListContainer.innerHTML = '';
        if (tasks.length === 0) {
            taskListContainer.innerHTML = `<div class="text-center text-gray-500 pt-20"><p>No tasks added yet.</p></div>`;
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'bg-gray-700 p-4 rounded-md flex justify-between items-center shadow-md';
            
            taskElement.innerHTML = `
                <div>
                    <p class="font-bold text-white">${task.name}</p>
                    <p class="text-sm text-gray-300">Total: ${task.time} | Chunks: ${task.chunkMin} to ${task.chunkMax}</p>
                    <p class="text-sm font-semibold ${getPriorityClass(task.priority)}">${task.priority} Priority</p>
                </div>
            `;

            const removeButton = document.createElement('button');
            removeButton.innerHTML = '&times;';
            removeButton.className = 'bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition duration-300';
            removeButton.onclick = () => handleRemoveTask(task.id);

            taskElement.appendChild(removeButton);
            taskListContainer.appendChild(taskElement);
        });
    };
    
    const handleAddTask = () => {
        const name = taskNameInput.value.trim();
        const time = totalTimeInput.value.trim();
        const priority = priorityInput.value;
        const chunkMin = chunkMinInput.value;
        const chunkMax = chunkMaxInput.value;

        if (!name || !time || !priority) {
            alert('Please fill out Task Name, Total Time, and Priority.');
            return;
        }

        const newTask = { id: Date.now(), name, time, priority, chunkMin, chunkMax };
        tasks.push(newTask);
        
        taskNameInput.value = '';
        totalTimeInput.value = '';
        priorityInput.value = '';
        
        renderTasks();
    };
    
    const handleRemoveTask = (id) => {
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
    };

    // --- EVENT LISTENERS ---
    addTaskBtn.addEventListener('click', handleAddTask);
    downloadJsonBtn.addEventListener('click', () => handleDownload(JSON.stringify(tasks, null, 2), 'tasks.json', 'application/json'));
    downloadSqlBtn.addEventListener('click', () => handleDownload(generateSQL(tasks), 'tasks.sql', 'application/sql'));

    // --- INITIALIZATION ---
    populateTimeDropdowns();
    renderTasks();
});

