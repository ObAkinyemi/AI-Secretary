"use client";

import { useSchedule } from "@/context/ScheduleContext";
import { Copy } from "lucide-react";

export default function JsonPreview() {
  const { tasks } = useSchedule();

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(tasks, null, 2));
    alert("Copied to clipboard!");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Generated JSON</h2>
        <button 
            onClick={handleCopy}
            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1 px-3 rounded flex items-center gap-1"
        >
            <Copy className="w-3 h-3" /> Copy
        </button>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto h-32 overflow-y-auto">
        <pre>{JSON.stringify(tasks, null, 2)}</pre>
      </div>
    </div>
  );
}