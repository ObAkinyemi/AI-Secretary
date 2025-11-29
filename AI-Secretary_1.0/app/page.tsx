"use client";

import React, { useState } from "react";
import { ScheduleProvider } from "@/context/ScheduleContext";
import Navigation from "@/components/Navigation";
import TaskManagerView from "@/components/views/TaskManager";
import AppointmentManagerView from "@/components/views/AppointmentManager";
import GenerateScheduleView from "@/components/views/GenerateSchedule";
import SettingsView from "@/components/views/Settings";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Task Manager");
  const { data: session } = useSession();

  const renderView = () => {
    switch (activeTab) {
      case "Task Manager": return <TaskManagerView />;
      case "Appointment Manager": return <AppointmentManagerView />;
      case "Generate Schedule": return <GenerateScheduleView />;
      case "Settings": return <SettingsView />;
      default: return <TaskManagerView />;
    }
  };

  return (
    <ScheduleProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
        <header className="relative pt-8 pb-4 px-4 flex justify-center items-center">
          
          {/* Centered Titles */}
          <div className="text-center z-0">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Secretary</h1>
            <p className="text-gray-400 mt-1">Task & Appointment Assistant</p>
          </div>

          {/* Absolute positioned Auth Button (Top Right) */}
          <div className="absolute top-8 right-6 z-10">
            {session ? (
              <div className="flex flex-col items-end sm:flex-row sm:items-center gap-3">
                <span className="text-xs text-blue-400 hidden md:inline">
                  Signed in as {session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-3 rounded transition-colors shadow-sm"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-4 rounded transition-colors shadow-sm"
              >
                Sign in
              </button>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 pb-12">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="animate-in fade-in duration-300">
            {renderView()}
          </div>
        </main>
      </div>
    </ScheduleProvider>
  );
}