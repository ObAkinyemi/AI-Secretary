"use client";

import React, { useState, useEffect } from "react";
import { useSchedule, Task } from "@/context/ScheduleContext";

interface AddTaskFormProps {
  initialData?: Task | null;
  onComplete?: () => void; // Called when edit is done
  mode?: "add" | "edit" | "template";
}

export default function AddTaskForm({ initialData, onComplete, mode = "add" }: AddTaskFormProps) {
  const { addTask, updateTask, categories } = useSchedule();

  const [taskName, setTaskName] = useState("");
  const [duration, setDuration] = useState(60); // minutes
  const [minChunk, setMinChunk] = useState(30);
  const [maxChunk, setMaxChunk] = useState(120);
  const [dueDateDays, setDueDateDays] = useState<string>(""); // Input is string, convert to num
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [category, setCategory] = useState(categories[0]);

  // Load initial data if provided (for Edit or Template)
  useEffect(() => {
    if (initialData) {
      // If template, clear name. If edit, keep name.
      setTaskName(mode === "template" ? "" : initialData.taskName);
      setDuration(initialData.duration);
      setMinChunk(initialData.minChunk);
      setMaxChunk(initialData.maxChunk);
      setDueDateDays(initialData.dueDateDays ? initialData.dueDateDays.toString() : "");
      setPriority(initialData.priority);
      setCategory(initialData.category);
    }
  }, [initialData, mode]);

  const handleSubmit = () => {
    if (!taskName.trim()) return;

    const newTask: Task = {
      id: mode === "edit" && initialData ? initialData.id : crypto.randomUUID(),
      taskName,
      duration,
      minChunk,
      maxChunk,
      dueDateDays: dueDateDays ? parseInt(dueDateDays) : null,
      priority,
      category,
    };

    if (mode === "edit" && initialData) {
      updateTask(initialData.id, newTask);
    } else {
      addTask(newTask);
    }

    // Reset Form
    setTaskName("");
    setDuration(60);
    setDueDateDays("");
    if (onComplete) onComplete();
  };

  // Helper to generate dropdown options
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
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        {mode === "edit" ? "Edit Task" : mode === "template" ? "New Task from Template" : "Add New Task"}
      </h2>
      
      <div className="space-y-4">
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

        {/* Chunks */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Min Chunk</label>
            <select 
              value={minChunk}
              onChange={e => setMinChunk(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
            >
              {generateTimeOptions(15, 180, 15)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Max Chunk</label>
            <select 
              value={maxChunk}
              onChange={e => setMaxChunk(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
            >
              {generateTimeOptions(15, 180, 15)}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Due Date (Days to complete)</label>
          <input 
            type="number" 
            value={dueDateDays}
            onChange={e => setDueDateDays(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
            placeholder="Optional (leave empty for null)"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
          <select 
            value={priority}
            onChange={e => setPriority(e.target.value as any)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Based on Due Date">Based on Due Date</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <select 
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4"
        >
          {mode === "edit" ? "Save Changes" : "Add Task"}
        </button>
      </div>
    </div>
  );
}