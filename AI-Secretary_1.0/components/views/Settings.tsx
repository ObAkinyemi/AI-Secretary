"use client";

import React, { useState, useEffect } from "react";
import { useSchedule, SettingsState } from "@/context/ScheduleContext";
import { Clock, Save, Coffee, Layers, Tag, Calendar as CalIcon, Plus, X } from "lucide-react";

export default function SettingsView() {
  const { settings, updateSettings, categories, updateCategories } = useSchedule();
  
  // Local state for form handling
  const [localSettings, setLocalSettings] = useState<SettingsState>(settings);
  const [localCategories, setLocalCategories] = useState<string[]>(categories);
  const [newCat, setNewCat] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Sync with context on mount
  useEffect(() => {
    setLocalSettings(settings);
    setLocalCategories(categories);
  }, [settings, categories]);

  const handleSave = () => {
    updateSettings(localSettings);
    updateCategories(localCategories);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const updateField = (section: keyof SettingsState, field: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addCategory = () => {
    if (newCat.trim() && !localCategories.includes(newCat)) {
      setLocalCategories([...localCategories, newCat.trim()]);
      setNewCat("");
    }
  };

  const removeCategory = (cat: string) => {
    setLocalCategories(localCategories.filter(c => c !== cat));
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
              isSaved ? "bg-green-600 text-white scale-105" : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isSaved ? "Settings Saved!" : <><Save className="w-5 h-5" /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Working Hours */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Clock className="w-6 h-6 text-blue-400" /></div>
            <div>
              <h3 className="text-lg font-semibold text-white">Working Hours</h3>
              <p className="text-sm text-gray-400">Your active availability window.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Time</label>
              <input type="time" value={localSettings.workingHours.start} onChange={(e) => updateField('workingHours', 'start', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Time</label>
              <input type="time" value={localSettings.workingHours.end} onChange={(e) => updateField('workingHours', 'end', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
          </div>
        </div>

        {/* Routine Blocks */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg"><Coffee className="w-6 h-6 text-purple-400" /></div>
            <div>
              <h3 className="text-lg font-semibold text-white">Daily Routine</h3>
              <p className="text-sm text-gray-400">Fixed daily anchors.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Wake Up</label>
              <input type="time" value={localSettings.routines.wakeUp} onChange={(e) => updateField('routines', 'wakeUp', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Bedtime</label>
              <input type="time" value={localSettings.routines.bedtime} onChange={(e) => updateField('routines', 'bedtime', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
          </div>
        </div>

        {/* Buffers & Defaults */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
            <div className="p-2 bg-green-500/20 rounded-lg"><Layers className="w-6 h-6 text-green-400" /></div>
            <div>
              <h3 className="text-lg font-semibold text-white">Buffers & Defaults</h3>
              <p className="text-sm text-gray-400">Spacing and standard sizes.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm text-gray-400 mb-1">Appt Buffer (min)</label>
                 <input type="number" value={localSettings.bufferTimes.appointments} onChange={(e) => updateField('bufferTimes', 'appointments', Number(e.target.value))} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
               </div>
               <div>
                 <label className="block text-sm text-gray-400 mb-1">Task Buffer (min)</label>
                 <input type="number" value={localSettings.bufferTimes.tasks} onChange={(e) => updateField('bufferTimes', 'tasks', Number(e.target.value))} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
               </div>
            </div>
            <div className="border-t border-gray-700 pt-4">
                <label className="block text-sm text-gray-400 mb-2">Default Task Size  --- min chunk size --- max chunk size</label>
                <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="Duration" value={localSettings.taskDefaults.duration} onChange={(e) => updateField('taskDefaults', 'duration', Number(e.target.value))} className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm" />
                    <input type="number" placeholder="Min Chunk" value={localSettings.taskDefaults.minChunk} onChange={(e) => updateField('taskDefaults', 'minChunk', Number(e.target.value))} className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm" />
                    <input type="number" placeholder="Max Chunk" value={localSettings.taskDefaults.maxChunk} onChange={(e) => updateField('taskDefaults', 'maxChunk', Number(e.target.value))} className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm" />
                </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg"><Tag className="w-6 h-6 text-orange-400" /></div>
            <div>
              <h3 className="text-lg font-semibold text-white">Categories</h3>
              <p className="text-sm text-gray-400">Manage your task types.</p>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="New Category..."
                className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            />
            <button onClick={addCategory} className="bg-orange-600 hover:bg-orange-500 p-2 rounded-lg text-white"><Plus className="w-5 h-5" /></button>
          </div>

          <div className="flex flex-wrap gap-2">
            {localCategories.map(cat => (
                <div key={cat} className="flex items-center gap-1 bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm border border-gray-600">
                    {cat}
                    <button onClick={() => removeCategory(cat)} className="hover:text-red-400 ml-1"><X className="w-3 h-3" /></button>
                </div>
            ))}
          </div>
        </div>

        {/* Calendar Settings */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
            <div className="p-2 bg-teal-500/20 rounded-lg"><CalIcon className="w-6 h-6 text-teal-400" /></div>
            <div>
              <h3 className="text-lg font-semibold text-white">Calendar Defaults</h3>
              <p className="text-sm text-gray-400">Timezone and view preferences.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm text-gray-400 mb-1">Timezone</label>
                <input type="text" value={localSettings.calendar.timezone} onChange={(e) => updateField('calendar', 'timezone', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
             </div>
             <div>
                <label className="block text-sm text-gray-400 mb-1">Default View</label>
                <select value={localSettings.calendar.view} onChange={(e) => updateField('calendar', 'view', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white">
                    <option value="Day">Day</option>
                    <option value="Week">Week</option>
                    <option value="Agenda">Agenda</option>
                </select>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}