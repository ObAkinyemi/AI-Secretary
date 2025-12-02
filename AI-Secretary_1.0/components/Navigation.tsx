"use client";

import React from "react";
import Link from "next/link";
import { Calendar as CalendarIcon } from "lucide-react"; // Import the icon

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    "Task Manager",
    "Appointment Manager",
    "Generate Schedule",
    "Settings",
  ];

  return (
    <nav className="flex flex-wrap justify-center gap-2 mb-8 bg-gray-800/50 p-2 rounded-xl backdrop-blur-sm border border-gray-700/50">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === tab
              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 scale-105"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}

      {/* NEW: Link to the separate Calendar Page */}
      <div className="w-px h-8 bg-gray-700 mx-2 self-center hidden sm:block"></div>
      
      <Link 
        href="/calendar"
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-green-400 hover:text-green-300 hover:bg-green-900/20 transition-all border border-green-900/30 hover:border-green-500/50"
      >
        <CalendarIcon className="w-4 h-4" />
        Full Calendar
      </Link>
    </nav>
  );
}