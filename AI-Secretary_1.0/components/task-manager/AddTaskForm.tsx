"use client";

import React, { useState, useEffect } from "react";
import { useSchedule, Task } from "@/context/ScheduleContext";

// Define Status Type
type TaskStatus = "Not Started" | "In Progress" | "Done";

// Extend the imported Task type to include status for local usage
interface ExtendedTask extends Omit<Task, 'status'> {
  status?: TaskStatus;
  [key: string]: unknown; // Allow for other potential fields safely
}

interface AddTaskFormProps {
  initialData?: Task | null;
  onComplete?: () => void;
  mode?: "add" | "edit" | "template";
  onSwitchType?: () => void; 
}

export default function AddTaskForm({ initialData, onComplete, mode = "add", onSwitchType }: AddTaskFormProps) {
  const { addTask, updateTask, categories } = useSchedule();

  const [taskName, setTaskName] = useState("");
  const [duration, setDuration] = useState(60); 
  const [minChunk, setMinChunk] = useState(30);
  const [maxChunk, setMaxChunk] = useState(120);
  const [dueDateDays, setDueDateDays] = useState<string>(""); 
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [category, setCategory] = useState(categories[0]);
  
  // NEW: Status State
  const [status, setStatus] = useState<TaskStatus>("Not Started");

  useEffect(() => {
    if (initialData) {
      setTaskName(mode === "template" ? "" : initialData.taskName);
      setDuration(initialData.duration);
      setMinChunk(initialData.minChunk);
      setMaxChunk(initialData.maxChunk);
      setDueDateDays(initialData.dueDateDays ? initialData.dueDateDays.toString() : "");
      setPriority(initialData.priority);
      setCategory(initialData.category);
      
      // Safely check for status property
      const data = initialData as ExtendedTask;
      setStatus(data.status || "Not Started");
    }
  }, [initialData, mode]);

  const handleSubmit = () => {
    if (!taskName.trim()) return;

    // Construct the object. We cast to Task to satisfy the context function signature,
    // assuming the context will simply store the extra 'status' field even if the type 
    // definition hasn't caught up yet in the other file.
    const newTask = {
      id: mode === "edit" && initialData ? initialData.id : crypto.randomUUID(),
      taskName,
      duration,
      minChunk,
      maxChunk,
      dueDateDays: dueDateDays ? parseInt(dueDateDays) : null,
      priority,
      category,
      status, 
    } as unknown as Task; 

    if (mode === "edit" && initialData) {
      updateTask(initialData.id, newTask);
    } else {
      addTask(newTask);
    }

    setTaskName("");
    setDuration(60);
    setDueDateDays("");
    setStatus("Not Started");
    if (onComplete) onComplete();
  };

  const generateTimeOptions = (startMin: number, endMin: number, step: number) => {
    const options = [];
    for (let i = startMin; i <= endMin; i += step) {
      const hours = Math.floor(i / 60);
      const mins = i % 60;
      let label = "";
      if (hours > 0) label += `${hours}h `;
      if (mins > 0) label += `${mins}m`;
      options.push(<option key={i} value={i}>{label.trim()}</option>);
    }
    return options;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col h-full">
      <h2 className="text-xl font-bold text-white mb-4">
        {mode === "edit" ? "Edit Task" : "Add New Task"}
      </h2>
      
      <div className="space-y-4 flex-grow">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Task Name</label>
          <input 
            type="text" 
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Study for Physics Quiz"
          />
        </div>

        {/* Status Dropdown (NEW) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select 
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
            className={`w-full border border-gray-600 rounded-lg p-2 text-white font-medium ${
                status === "Done" ? "bg-green-900/50 border-green-700" :
                status === "In Progress" ? "bg-yellow-900/50 border-yellow-700" :
                "bg-gray-700"
            }`}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Total Duration</label>
          <select 
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
          >
            {generateTimeOptions(30, 360, 30)}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
          <select 
            value={priority}
            onChange={e => setPriority(e.target.value as Task["priority"])}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Based on Due Date">Based on Due Date</option>
          </select>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4"
        >
          {mode === "edit" ? "Save Changes" : "Add Task"}
        </button>
      </div>

      {/* Switch Type Link (NEW) */}
      {onSwitchType && (
          <div className="pt-4 mt-4 border-t border-gray-700 text-center">
              <span className="text-gray-400 text-xs">Wrong type? </span>
              <button 
                onClick={onSwitchType}
                className="text-blue-400 hover:text-blue-300 text-xs font-semibold underline"
              >
                Add Appointment instead
              </button>
          </div>
      )}
    </div>
  );
}