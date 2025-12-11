"use client";

import React, { useState, useEffect } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import AddTaskForm from "../task-manager/AddTaskForm";
import AddAppointmentForm from "../appointment-manager/AddAppointmentForm";

interface SidebarProps {
  initialTab?: "task" | "datetime";
  selectedDate?: Date | null;
}

export default function TaskSidebar({ initialTab, selectedDate }: SidebarProps) {
  const [tab, setTab] = useState<"task" | "datetime">("task");

  // If parent (Calendar) tells us to switch tabs, do it.
  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (event: React.MouseEvent<HTMLElement>, newTab: string | null) => {
    if (newTab) setTab(newTab as "task" | "datetime");
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
      
      {/* Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-700 shrink-0">
        <ToggleButtonGroup
          value={tab}
          exclusive
          onChange={handleTabChange}
          fullWidth
          size="small"
          sx={{
            backgroundColor: '#374151',
            borderRadius: '20px',
            p: '4px',
            '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '16px !important',
                color: '#9ca3af',
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.2s',
                '&.Mui-selected': {
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                },
                '&:hover': { backgroundColor: '#4b5563' }
            }
          }}
        >
          <ToggleButton value="task">Task Info</ToggleButton>
          <ToggleButton value="datetime">Date/Time</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar overscroll-contain scroll-smooth">
        {tab === "task" ? (
          <AddTaskForm 
            // Pass the switch handler to flip the local state
            onSwitchType={() => setTab("datetime")} 
          />
        ) : (
          <div className="flex flex-col h-full">
             {/* Pass initial date to the form if available */}
             <AddAppointmentForm 
                initialData={selectedDate ? { 
                    id: "", name: "", 
                    date: selectedDate.toISOString().split("T")[0],
                    startTime: selectedDate.toTimeString().slice(0,5),
                    endTime: new Date(selectedDate.getTime() + 60*60000).toTimeString().slice(0,5)
                } : undefined}
             />
             
             {/* Switch Link for Appointments */}
             <div className="pt-4 mt-auto border-t border-gray-700 text-center">
                <span className="text-gray-400 text-xs">Wrong type? </span>
                <button 
                    onClick={() => setTab("task")}
                    className="text-blue-400 hover:text-blue-300 text-xs font-semibold underline"
                >
                    Add Task instead
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}