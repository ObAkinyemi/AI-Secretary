"use client";

import React, { useState } from "react";
import SchedulingRules from "../SchedulingRules";
import { useSchedule } from "@/context/ScheduleContext";
import { generateICS } from "@/lib/ics-utils";
import { ArrowRight } from "lucide-react";

export default function GenerateScheduleView() {
  const { tasks, appointments, rules } = useSchedule();
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = () => {
    setError("");
    if (tasks.length === 0) {
      setError("Please add at least one task in the Task Manager.");
      return;
    }
    // Simulation of AI Generation
    // In a real app, here you would POST to your API
    setTimeout(() => {
      setIsGenerated(true);
      alert("Schedule Generated Successfully! (Simulated)");
    }, 1000);
  };

  const handlePushToICS = () => {
     // EXCLUDE APPOINTMENTS, ONLY TASKS
     const icsString = generateICS(tasks);
     const blob = new Blob([icsString], { type: "text/calendar" });
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = "ai_schedule_tasks_only.ics";
     a.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <SchedulingRules />
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <button 
        onClick={handleGenerate}
        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl shadow-lg transition-transform active:scale-95 mb-4"
      >
        Generate Schedule
      </button>

      {isGenerated && (
        <div className="animate-in slide-in-from-top fade-in duration-500">
           <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center mb-4">
             <h3 className="text-white font-bold text-xl mb-2">Schedule Ready</h3>
             <p className="text-gray-400 mb-6">Your schedule has been optimized based on your rules.</p>
             
             <button 
               onClick={handlePushToICS}
               className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-colors"
             >
               Push <ArrowRight className="w-5 h-5" /> ICS
             </button>
           </div>
        </div>
      )}
    </div>
  );
}