"use client";

import React from "react";
import { ScheduleProvider } from "@/context/ScheduleContext";
import CalendarDashboard from "@/components/views/CalendarDashboard";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CalendarPage() {
  const { data: session } = useSession();

  return (
    <ScheduleProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
        {/* Header */}
        <header className="h-[70px] bg-gray-800 border-b border-gray-700 flex justify-between items-center px-6 shadow-md z-20">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Full Calendar</h1>
              <p className="text-xs text-gray-400">Task & Appointment Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Settings</button>
            <div className="h-6 w-px bg-gray-600"></div>
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-blue-400 hidden md:inline">
                  {session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-3 rounded transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow relative">
          <CalendarDashboard />
        </main>
      </div>
    </ScheduleProvider>
  );
}