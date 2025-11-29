"use client";

import React, { useState, useEffect } from "react";
import { useSchedule } from "@/context/ScheduleContext";
import { Clock, Save } from "lucide-react";

export default function SettingsView() {
  const { workingHours, setWorkingHours } = useSchedule();
  const [start, setStart] = useState(workingHours.start);
  const [end, setEnd] = useState(workingHours.end);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setWorkingHours({ start, end });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

      {/* Working Hours Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Working Hours</h3>
            <p className="text-sm text-gray-400">Define when you are available to work on tasks.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
            <input 
              type="time" 
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
            <input 
              type="time" 
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
              isSaved 
                ? "bg-green-600 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isSaved ? (
              <>Saved!</>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}