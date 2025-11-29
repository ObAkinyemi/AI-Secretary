"use client";

import React, { useState } from "react";
import SchedulingRules from "../SchedulingRules";
import ScheduleDisplay from "../schedule/ScheduleDisplay"; 
import { useSchedule } from "@/context/ScheduleContext";
import { generateICS } from "@/lib/ics-utils";
import { ArrowRight, Loader2 } from "lucide-react";

interface ScheduledBlock {
  id: string;
  name: string;
  startTime: string | Date; 
  endTime: string | Date;   
  type: "task" | "appointment";
  isChunk?: boolean;
}

export default function GenerateScheduleView() {
  const { tasks, appointments, rules, settings } = useSchedule(); 
  
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
      const response = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks, appointments, rules, settings }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate schedule");
      }
      
      const appointmentBlocks: ScheduledBlock[] = appointments.map(a => ({
          id: a.id,
          name: a.name,
          startTime: `${a.date}T${a.startTime}:00`, 
          endTime: `${a.date}T${a.endTime}:00`,
          type: "appointment"
      }));

      const combined = [...appointmentBlocks, ...data.schedule].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      setGeneratedSchedule(combined);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred while generating the schedule.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePushToICS = () => {
     const taskBlocks = generatedSchedule.filter(b => b.type === "task");
     
     const eventsToExport = taskBlocks.map(b => ({
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