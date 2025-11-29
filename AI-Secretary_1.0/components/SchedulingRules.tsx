"use client";

import React, { useRef } from "react";
import { Plus, Upload, X } from "lucide-react";
import { useSchedule } from "@/context/ScheduleContext";

export default function SchedulingRules() {
  const { rules, setRules } = useSchedule();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addRule = () => setRules([...rules, ""]);
  
  const updateRule = (index: number, val: string) => {
    const newRules = [...rules];
    newRules[index] = val;
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        setRules([...rules, ...lines]);
      }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Scheduling Rules</h2>
          <p className="text-sm text-gray-400 mt-1">Specify how you want your tasks scheduled.</p>
        </div>
        <div>
           <input type="file" ref={fileInputRef} className="hidden" accept=".txt" onChange={handleFileUpload} />
           <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600">
             <Upload className="w-4 h-4" /> Upload Rules
           </button>
        </div>
      </div>

      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex gap-2 items-start">
             <div className="flex-shrink-0 mt-3 text-gray-500"><div className="w-1.5 h-1.5 rounded-full bg-gray-500" /></div>
             <textarea
               value={rule}
               onChange={(e) => updateRule(index, e.target.value)}
               className="flex-grow p-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
               rows={1}
               placeholder={`Rule #${index+1}`}
             />
             <button onClick={() => removeRule(index)} className="p-2 text-gray-500 hover:text-red-400">
               <X className="w-4 h-4" />
             </button>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button onClick={addRule} className="flex items-center justify-center w-full py-3 gap-2 text-blue-400 font-medium bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-blue-900/50 border-dashed">
          <Plus className="w-4 h-4" /> Add New Rule
        </button>
      </div>
    </div>
  );
}