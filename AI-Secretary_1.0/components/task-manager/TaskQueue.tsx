"use client";

import React, { useRef, useState } from "react";
import { useSchedule, Task } from "@/context/ScheduleContext";
import { Upload, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import AddTaskForm from "./AddTaskForm";

// Define shape for imported JSON task
interface ImportedTask {
  task_name?: string;
  duration_minutes?: number;
  min_chunk?: number;
  max_chunk?: number;
  days_to_complete?: number;
}

export default function TaskQueue() {
  const { tasks, setTasks, removeTask } = useSchedule();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<"edit" | "template" | null>(null);
  
  // NEW: State for Format Guide Modal
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error("File must contain an array of tasks");
        
        // Basic validation
        const validTasks = json.filter((t: ImportedTask) => t.task_name && t.duration_minutes);
        if (validTasks.length < json.length) {
            alert("Some tasks were skipped due to missing task_name or duration_minutes");
        }

        // Convert to internal format
        const newTasks: Task[] = validTasks.map((t: ImportedTask) => ({
          id: crypto.randomUUID(),
          taskName: t.task_name || "Untitled",
          duration: t.duration_minutes || 60,
          minChunk: t.min_chunk || 30,
          maxChunk: t.max_chunk || 120,
          dueDateDays: t.days_to_complete || null,
          priority: "Medium",
          category: "Academic"
        }));

        setTasks([...tasks, ...newTasks]);
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openModal = (task: Task) => {
    setSelectedTask(task);
  };

  const handleModalAction = (action: "edit" | "template") => {
      setModalMode(action);
  };

  const closeModal = () => {
      setSelectedTask(null);
      setModalMode(null);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg h-full flex flex-col max-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Task Queue</h2>
        
        <div className="flex items-center gap-4">
            {/* NEW: Format Guide Link */}
            <button 
                onClick={() => setShowFormatGuide(true)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
            >
                JSON Format Guide
            </button>

            <div className="flex gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json"
                    onChange={handleJsonUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2 px-3 rounded flex items-center gap-1"
                >
                    <Upload className="w-3 h-3" /> Import Tasks
                </button>
            </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">Your tasks will appear here...</p>
        ) : (
          tasks.map(task => (
            <div 
                key={task.id}
                onClick={() => openModal(task)}
                className="bg-gray-700 p-3 rounded-lg border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors group flex items-start justify-between gap-3"
            >
                <div className="flex-grow">
                    <h4 className="font-semibold text-white">{task.taskName}</h4>
                    <p className="text-xs text-gray-400">
                        {Math.floor(task.duration / 60)}h {task.duration % 60}m • {task.category} • {task.priority}
                    </p>
                </div>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeTask(task.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-600 rounded transition-colors"
                    title="Delete Task"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
          ))
        )}
      </div>

      {/* Existing Modal for Edit/Template */}
      <Modal 
        isOpen={!!selectedTask && !modalMode} 
        onClose={closeModal} 
        title="Task Options"
      >
        <div className="space-y-3">
            <button 
                onClick={() => handleModalAction("edit")}
                className="w-full bg-blue-100 text-blue-800 font-semibold py-3 rounded-lg hover:bg-blue-200"
            >
                Edit Task
            </button>
            <button 
                onClick={() => handleModalAction("template")}
                className="w-full bg-green-100 text-green-800 font-semibold py-3 rounded-lg hover:bg-green-200"
            >
                Use as Template
            </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedTask && !!modalMode}
        onClose={closeModal}
        title={modalMode === "edit" ? "Edit Task" : "Create from Template"}
      >
          <AddTaskForm 
            initialData={selectedTask} 
            mode={modalMode || "add"} 
            onComplete={closeModal} 
          />
      </Modal>

      {/* NEW: Modal for JSON Format Guide */}
      <Modal
        isOpen={showFormatGuide}
        onClose={() => setShowFormatGuide(false)}
        title="JSON Import Instructions"
      >
        <div className="space-y-4 text-gray-300">
            <p>
                To import tasks, upload a JSON file containing an array of task objects. Each object must have a <code className="bg-gray-700 text-green-400 px-1 rounded font-mono text-sm">task_name</code> and a <code className="bg-gray-700 text-green-400 px-1 rounded font-mono text-sm">duration_minutes</code>.
            </p>
            <p>
                All other fields are optional. The structure should look like this:
            </p>
            <div className="bg-gray-950 p-4 rounded-lg border border-gray-700 font-mono text-xs text-blue-300 overflow-auto max-h-64">
<pre>{`[
  {
    "task_name": "Study Physics",
    "duration_minutes": 120,
    "min_chunk": 30,
    "max_chunk": 120,
    "days_to_complete": 7,
    "priority": "High",
    "category": "Academic"
  },
  {
    "task_name": "Call Mom",
    "duration_minutes": 15
  }
]`}</pre>
            </div>
        </div>
      </Modal>

    </div>
  );
}