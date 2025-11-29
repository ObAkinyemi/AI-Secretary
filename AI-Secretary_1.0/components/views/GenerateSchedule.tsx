"use client";

import React, { useState } from "react";
import SchedulingRules from "../SchedulingRules";
import ScheduleDisplay from "../schedule/ScheduleDisplay"; 
import { useSchedule } from "@/context/ScheduleContext";
import { generateICS } from "@/lib/ics-utils";
// Removed: import { runScheduler } ... 
import { ArrowRight, Loader2 } from "lucide-react";

// Define the shape here locally since we aren't importing the library anymore
interface ScheduledBlock {
  id: string;
  name: string;
  startTime: string | Date; // API returns string
  endTime: string | Date;   // API returns string
  type: "task" | "appointment";
  isChunk?: boolean;
}

export default function GenerateScheduleView() {
  const { tasks, appointments, rules } = useSchedule();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduledBlock[]>([]);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    
    if (tasks.length === 0) {
      setError("Please add at least one task in the Task Manager.");
      return;
    }
    
    setIsGenerating(true);

    try {
      // Call the API
      const response = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks, appointments, rules }),
      });

      if (!response.ok) throw new Error("Failed to generate schedule");

      const data = await response.json();
      
      // Merge the fixed appointments (for display) with the new AI tasks
      // The AI might return appointments too, but usually we just want tasks back.
      // Let's assume the AI returns JUST the new tasks or a full mixed schedule.
      // For safety, let's trust the AI's output fully if it includes everything, 
      // OR merge if it only returns tasks.
      // For this prompt, let's assume the AI returns just the new TASK blocks.
      
      // Actually, to make the display complete, let's map our existing appointments to the block format
      // and combine them with the AI's result.
      const appointmentBlocks: ScheduledBlock[] = appointments.map(a => ({
          id: a.id,
          name: a.name,
          startTime: `${a.date}T${a.startTime}:00`, // Simple ISO construction
          endTime: `${a.date}T${a.endTime}:00`,
          type: "appointment"
      }));

      // Combine and Sort
      const combined = [...appointmentBlocks, ...data.schedule].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      setGeneratedSchedule(combined);

    } catch (e) {
      console.error(e);
      setError("An error occurred while generating the schedule. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePushToICS = () => {
     // Filter: Only export "task" blocks
     const taskBlocks = generatedSchedule.filter(b => b.type === "task");
     
     const eventsToExport = taskBlocks.map(b => ({
       // Pass the ID if available, or allow generateICS to create one
       id: b.id,
       taskName: b.name,
       startTime: new Date(b.startTime),
       endTime: new Date(b.endTime)
     }));

     const icsString = generateICS(eventsToExport);
     const blob = new Blob([icsString], { type: "text/calendar" });
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = "ai_schedule_tasks_only.ics";
     a.click();
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <SchedulingRules />
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-4 animate-in slide-in-from-top">
          {error}
        </div>
      )}

      <button 
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold text-lg rounded-xl shadow-lg transition-all active:scale-95 mb-4 flex justify-center items-center gap-3"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Optimizing Schedule with Gemini...
          </>
        ) : (
          "Generate Schedule with AI"
        )}
      </button>

      {generatedSchedule.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom duration-500 space-y-4 pb-12">
           <ScheduleDisplay schedule={generatedSchedule} />

           <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center sticky bottom-4 shadow-2xl">
             <h3 className="text-white font-bold text-xl mb-2">Schedule Ready</h3>
             <p className="text-gray-400 mb-6">Gemini has optimized your tasks.</p>
             
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