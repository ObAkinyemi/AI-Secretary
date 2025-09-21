// Mark this as a client component to allow for interactivity
"use client";

import { useState, useRef } from 'react';
// Correctly import the pdfjs-dist library
import * as pdfjsLib from 'pdfjs-dist';
import SignInButton from '@/components/SignInButton';

// Set up the worker for pdf.js. This is a required step.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;


// Helper function to generate time options for dropdowns
const generateTimeOptions = (limitInMinutes) => {
    const options = [];
    for (let i = 1; i <= (limitInMinutes / 15); i++) {
        const minutes = i * 15;
        const hours = minutes / 60;
        let timeText;
        if (minutes < 60) {
            timeText = `${minutes} min`;
        } else {
            timeText = `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        options.push({ value: minutes, text: timeText });
    }
    return options;
};

// Main component for the application's homepage
export default function HomePage() {
    // --- STATE MANAGEMENT ---
    const [flexibleTasks, setFlexibleTasks] = useState([]);
    const [taskName, setTaskName] = useState('');
    const [totalTime, setTotalTime] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [chunkMin, setChunkMin] = useState(15);
    const [chunkMax, setChunkMax] = useState(120);
    const [editingTaskId, setEditingTaskId] = useState(null);

    const [fixedAppointments, setFixedAppointments] = useState([]);
    const [appointmentName, setAppointmentName] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState('Monday');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('09:00');
    const [editingApptId, setEditingApptId] = useState(null);
    
    const [dailyEvents, setDailyEvents] = useState('');
    const [schedulingRules, setSchedulingRules] = useState('Your scheduling rules here...');
    const pdfUploadRef = useRef(null);

    const [generatedSchedule, setGeneratedSchedule] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const timeOptions = generateTimeOptions(240); // Generate up to 4 hours

    // --- PDF HANDLING ---
    const handlePdfUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setDailyEvents('Reading and processing PDF...');
        const fileReader = new FileReader();

        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            try {
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n\n';
                }
                setDailyEvents(fullText);
            } catch (err) {
                console.error("Error processing PDF:", err);
                setDailyEvents('Error: Could not read the PDF file.');
            }
        };
        fileReader.readAsArrayBuffer(file);
    };

    // --- FLEXIBLE TASK LOGIC ---
    const handleTaskSubmit = (e) => {
        e.preventDefault();
        if (!taskName || !totalTime) {
            alert('Please fill in task name and total time.');
            return;
        }
        if (editingTaskId) {
            setFlexibleTasks(flexibleTasks.map(t => 
                t.id === editingTaskId ? { ...t, name: taskName, time: totalTime, priority, chunkMin, chunkMax } : t
            ));
        } else {
            const newTask = { id: Date.now(), name: taskName, time: totalTime, priority, chunkMin, chunkMax };
            setFlexibleTasks([...flexibleTasks, newTask]);
        }
        resetTaskForm();
    };
    
    const resetTaskForm = () => {
        setTaskName('');
        setTotalTime('');
        setPriority('Medium');
        setChunkMin(15);
        setChunkMax(120);
        setEditingTaskId(null);
    };

    const startEditTask = (task) => {
        setEditingTaskId(task.id);
        setTaskName(task.name);
        setTotalTime(task.time);
        setPriority(task.priority);
        setChunkMin(task.chunkMin);
        setChunkMax(task.chunkMax);
    };
    
    const removeTask = (id) => {
        setFlexibleTasks(flexibleTasks.filter(t => t.id !== id));
        if (id === editingTaskId) resetTaskForm();
    };

    // --- MAIN SCHEDULE GENERATION LOGIC ---
    const handleGenerateSchedule = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedSchedule('');

        // Combine all fixed appointment data into one text block
        const fixedAppointmentsText = `
            Daily Mandatory Events:
            ${dailyEvents}
            ---
            Manually Added Fixed Appointments:
            ${fixedAppointments.map(a => `${a.dayOfWeek}: ${a.name} from ${a.startTime} to ${a.endTime}`).join('\n')}
        `;

        try {
            const response = await fetch('/api/generate-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fixedAppointmentsText: fixedAppointmentsText,
                    flexibleTasksJson: JSON.stringify(flexibleTasks, null, 2),
                    schedulingRules: schedulingRules,
                }),
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Server error');
            const data = await response.json();
            setGeneratedSchedule(data.schedule);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
  
    return (
        <main className="bg-gray-900 text-white min-h-screen p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="text-center mb-10">
                    {/* Add this div to position the button in the top right */}
                    <div className="flex justify-end p-4">
                        <SignInButton />
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold text-blue-400">AI Secretary</h1>
                    <p className="text-lg text-gray-400 mt-2">Your intelligent scheduling assistant</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* --- LEFT COLUMN: INPUTS --- */}
                    <div className="space-y-8">
                        {/* Flexible Task Manager */}
                        <section className="bg-gray-800 p-6 rounded-lg shadow-xl">
                            <h2 className="text-2xl font-semibold mb-4">{editingTaskId ? 'Edit Task' : 'Create New Flexible Task'}</h2>
                            <form onSubmit={handleTaskSubmit} className="space-y-4">
                                <input type="text" placeholder="Task Name (e.g., Physics Homework)" className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
                                <input type="text" placeholder="Total Time Allocation (e.g., 3 hours)" className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={totalTime} onChange={(e) => setTotalTime(e.target.value)} />
                                <select className="w-full p-3 bg-gray-700 rounded-md border border-gray-600" value={priority} onChange={(e) => setPriority(e.target.value)}>
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                                <div className="grid grid-cols-2 gap-4">
                                    <select className="w-full p-3 bg-gray-700 rounded-md border border-gray-600" value={chunkMin} onChange={(e) => setChunkMin(Number(e.target.value))}>
                                        {timeOptions.map(opt => <option key={`min-${opt.value}`} value={opt.value}>{opt.text}</option>)}
                                    </select>
                                    <select className="w-full p-3 bg-gray-700 rounded-md border border-gray-600" value={chunkMax} onChange={(e) => setChunkMax(Number(e.target.value))}>
                                        {timeOptions.map(opt => <option key={`max-${opt.value}`} value={opt.value}>{opt.text}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className={`w-full p-3 font-bold rounded-md transition-colors ${editingTaskId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    {editingTaskId ? 'Update Task' : 'Add Task'}
                                </button>
                                {editingTaskId && <button type="button" onClick={resetTaskForm} className="w-full mt-2 p-2 bg-gray-600 hover:bg-gray-500 font-bold rounded-md">Cancel Edit</button>}
                            </form>
                        </section>

                        {/* Schedule Settings */}
                        <section className="bg-gray-800 p-6 rounded-lg shadow-xl">
                            <h2 className="text-2xl font-semibold mb-4">Scheduling Rules & Fixed Events</h2>
                             <textarea rows="4" placeholder="Enter your scheduling rules..." className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 mb-4" value={schedulingRules} onChange={(e) => setSchedulingRules(e.target.value)} />
                             <textarea rows="4" placeholder="Upload a PDF or manually enter fixed/daily events here..." className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 mb-4" value={dailyEvents} onChange={(e) => setDailyEvents(e.target.value)} />
                            <input type="file" accept=".pdf" ref={pdfUploadRef} onChange={handlePdfUpload} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                        </section>
                    </div>

                    {/* --- RIGHT COLUMN: DISPLAYS --- */}
                    <div className="space-y-8">
                         <section className="bg-gray-800 p-6 rounded-lg shadow-xl">
                            <h2 className="text-2xl font-semibold mb-4">Current Task List</h2>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {flexibleTasks.length > 0 ? flexibleTasks.map(task => (
                                    <div key={task.id} onClick={() => startEditTask(task)} className="bg-gray-700 p-3 rounded-md flex justify-between items-start cursor-pointer hover:bg-gray-600">
                                        <div>
                                            <p className="font-bold text-white">{task.name}</p>
                                            <p className="text-sm text-gray-300">Total: {task.time} | Chunks: {task.chunkMin}m to {task.chunkMax}m</p>
                                            <p className={`text-sm font-semibold ${ {High: 'text-red-400', Medium: 'text-yellow-400', Low: 'text-green-400'}[task.priority]}`}>{task.priority} Priority</p>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); removeTask(task.id); }} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md">&times;</button>
                                    </div>
                                )) : <p className="text-gray-500">No flexible tasks added yet.</p>}
                            </div>
                        </section>
                    </div>
                </div>

                 {/* --- BOTTOM SECTION: GENERATION & OUTPUT --- */}
                <section className="mt-12 text-center">
                    <button onClick={handleGenerateSchedule} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? 'Generating Schedule...' : 'Generate Schedule'}
                    </button>
                    {error && <p className="text-red-400 mt-4">Error: {error}</p>}
                </section>

                {generatedSchedule && (
                    <section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-xl">
                        <h2 className="text-2xl font-semibold mb-4">Your Optimized Schedule</h2>
                        <div className="bg-gray-900 p-4 rounded-md whitespace-pre-wrap text-left font-mono">{generatedSchedule}</div>
                    </section>
                )}
            </div>
        </main>
    );
}

