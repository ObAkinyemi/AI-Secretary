"use client";

import React, { useState } from "react";
import { 
  Today as TodayIcon, 
  DateRange as DateRangeIcon, 
  CalendarMonth as CalendarMonthIcon,
  ArrowBackIosNew,
  ArrowForwardIos
} from "@mui/icons-material";
import { ToggleButton, ToggleButtonGroup, Button, IconButton } from "@mui/material";
import MainCalendar from "../calendar/MainCalendar";
import TaskSidebar from "../sidebar/TaskSidebar"; // We'll build this next

export default function CalendarDashboard() {
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Navigation Logic
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === "day") newDate.setDate(newDate.getDate() - 1);
    if (view === "week") newDate.setDate(newDate.getDate() - 7);
    if (view === "month") newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "day") newDate.setDate(newDate.getDate() + 1);
    if (view === "week") newDate.setDate(newDate.getDate() + 7);
    if (view === "month") newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
    if (newView) setView(newView as "day" | "week" | "month");
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6">
      
      {/* LEFT SIDEBAR (Task Info | Date Time) */}
      <div className="w-1/3 min-w-[350px] max-w-[400px]">
        <TaskSidebar />
      </div>

      {/* MAIN CALENDAR AREA */}
      <div className="grow flex flex-col gap-4">
        
        {/* Custom Header / Toolbar */}
        <div className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center">
          
          {/* Day/Week/Month Switcher */}
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="calendar view"
            size="small"
            sx={{ 
                '& .MuiToggleButton-root': { 
                    border: 'none', 
                    borderRadius: '8px !important',
                    px: 2,
                    mx: 0.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#64748b',
                    '&.Mui-selected': {
                        backgroundColor: '#eff6ff',
                        color: '#3b82f6'
                    }
                } 
            }}
          >
            <ToggleButton value="day">
              <TodayIcon sx={{ fontSize: 18, mr: 1 }} /> Day
            </ToggleButton>
            <ToggleButton value="week">
              <DateRangeIcon sx={{ fontSize: 18, mr: 1 }} /> Week
            </ToggleButton>
            <ToggleButton value="month">
              <CalendarMonthIcon sx={{ fontSize: 18, mr: 1 }} /> Month
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
             <IconButton onClick={handlePrev} size="small">
                <ArrowBackIosNew fontSize="inherit" />
             </IconButton>
             <span className="font-bold text-gray-700 w-32 text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
             </span>
             <IconButton onClick={handleNext} size="small">
                <ArrowForwardIos fontSize="inherit" />
             </IconButton>
          </div>

          {/* Add Event Button (Placeholder for now) */}
          <Button 
            variant="contained" 
            sx={{ backgroundColor: '#3b82f6', textTransform: 'none', fontWeight: 'bold' }}
          >
            + Add Event
          </Button>
        </div>

        {/* The Calendar Grid */}
        <div className="grow bg-white rounded-xl shadow-sm overflow-hidden">
           <MainCalendar view={view} date={currentDate} />
        </div>
      </div>
    </div>
  );
}