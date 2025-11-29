"use client";

import React from "react";
import { ScheduledBlock } from "@/lib/scheduler";
import { Calendar, CheckCircle, Clock } from "lucide-react";

interface Props {
  schedule: ScheduledBlock[];
}

export default function ScheduleDisplay({ schedule }: Props) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6 text-center text-gray-400 mt-6">
        No schedule items to display.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden mt-6 animate-in slide-in-from-bottom fade-in duration-500">
      <div className="bg-gray-700/50 p-4 border-b border-gray-600">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Proposed Schedule
        </h3>
      </div>
      
      <div className="divide-y divide-gray-700">
        {schedule.map((block) => {
          // Safety check for dates
          const start = block.startTime instanceof Date ? block.startTime : new Date(block.startTime);
          const end = block.endTime instanceof Date ? block.endTime : new Date(block.endTime);

          return (
            <div 
              key={block.id} 
              className={`p-4 flex items-center gap-4 hover:bg-gray-700/30 transition-colors ${
                block.type === "appointment" ? "bg-gray-800/50 opacity-75" : "bg-blue-900/10"
              }`}
            >
              {/* Time Column */}
              <div className="flex flex-col items-center min-w-[4.5rem] text-sm">
                <span className="text-white font-medium">
                  {!isNaN(start.getTime()) ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "--:--"}
                </span>
                <div className="h-4 w-px bg-gray-600 my-1"></div>
                <span className="text-gray-400">
                  {!isNaN(end.getTime()) ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "--:--"}
                </span>
              </div>

              {/* Icon Column */}
              <div className={`p-2 rounded-full ${
                block.type === "appointment" ? "bg-gray-700 text-gray-400" : "bg-blue-500/20 text-blue-400"
              }`}>
                {block.type === "appointment" ? <Clock className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              </div>

              {/* Content Column */}
              <div>
                <h4 className={`font-semibold ${
                  block.type === "appointment" ? "text-gray-300" : "text-white"
                }`}>
                  {block.name}
                </h4>
                <span className="text-xs uppercase tracking-wider font-bold text-gray-500">
                  {block.type} {block.isChunk ? "(Split)" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}