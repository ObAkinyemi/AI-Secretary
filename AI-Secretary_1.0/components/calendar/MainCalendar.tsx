"use client";

import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useSchedule, Task } from "@/context/ScheduleContext";
import { 
  Today as TodayIcon, 
  DateRange as DateRangeIcon, 
  CalendarMonth as CalendarMonthIcon,
  ArrowBackIosNew,
  ArrowForwardIos,
  Add as AddIcon,
  Upload as UploadIcon
} from "@mui/icons-material";
import { ToggleButton, ToggleButtonGroup, Button, IconButton, Menu, MenuItem } from "@mui/material";
import Modal from "@/components/ui/Modal";
import AddAppointmentForm from "../appointment-manager/AddAppointmentForm";

interface MainCalendarProps {
    onDateSelect?: (date: Date, type: "task" | "datetime") => void;
}

// Interfaces for Types
interface ScheduledTask extends Task {
    scheduledStart?: string | Date;
    scheduledEnd?: string | Date;
    status?: string;
}

interface CalendarEventInfo {
    event: {
        extendedProps: {
            type: "task" | "appointment";
            status?: string;
        };
        start: Date | null;
        end: Date | null;
    };
}

export default function MainCalendar({ onDateSelect }: MainCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const { tasks, appointments } = useSchedule();
  
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Modal State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  // --- Header Logic ---
  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: string | null) => {
    if (!newView) return;
    const api = calendarRef.current?.getApi();
    if (!api) return;

    if (newView === "day") api.changeView("timeGridDay");
    if (newView === "week") api.changeView("timeGridWeek");
    if (newView === "month") api.changeView("dayGridMonth");
    
    setView(newView as "day" | "week" | "month");
  };

  // --- Event Styling ---
  const getEventStyle = (eventInfo: CalendarEventInfo) => {
    const isTask = eventInfo.event.extendedProps.type === "task";
    const status = eventInfo.event.extendedProps.status; 
    const end = eventInfo.event.end || eventInfo.event.start; 
    const now = new Date();
    // Safety check for end date
    const isPast = end ? end < now : false;

    let backgroundColor = "#3B82F6"; 
    let borderColor = "#2563EB";
    let textColor = "#FFFFFF"; // Default white text
    let classNames: string[] = [];

    if (isPast) {
        backgroundColor = "#9CA3AF"; 
        borderColor = "#6B7280";
        classNames.push("opacity-70");
    }

    if (isTask) {
        if (status === "Done") {
            backgroundColor = "#10B981"; 
            borderColor = "#059669";
            classNames.push("opacity-50"); 
        } else if (isPast && status !== "Done") {
            backgroundColor = "#8A0303"; 
            borderColor = "#7F1D1D";
            classNames.push("animate-pulse shadow-[0_0_15px_#ef4444]");
        } else if (status === "In Progress") {
            backgroundColor = "#EAB308"; 
            borderColor = "#CA8A04";
            textColor = "#000000"; // Use black text for yellow background
        }
    }

    return { style: { backgroundColor, borderColor, textColor }, classNames };
  };

  const handleDateClick = (arg: DateClickArg) => {
    if (view === "month") {
        const api = calendarRef.current?.getApi();
        api?.changeView("timeGridDay", arg.date);
        setView("day");
        return;
    }
    setClickedDate(arg.date);
    setIsTypeModalOpen(true);
  };

  const handleTypeSelection = (type: "task" | "datetime") => {
      setIsTypeModalOpen(false);
      if (onDateSelect && clickedDate) {
          onDateSelect(clickedDate, type);
      }
  };

  const events = [
    ...appointments.map(a => ({
      id: a.id,
      title: a.name,
      start: `${a.date}T${a.startTime}`,
      end: `${a.date}T${a.endTime}`,
      extendedProps: { type: "appointment" }
    })),
    ...tasks.filter(t => (t as ScheduledTask).scheduledStart).map(t => {
        const task = t as ScheduledTask;
        return {
            id: task.id,
            title: task.taskName,
            start: task.scheduledStart,
            end: task.scheduledEnd,
            extendedProps: { type: "task", status: task.status }
        };
    })
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm overflow-hidden relative border border-gray-200">
      
      {/* UNIFIED HEADER 
          - Removed bottom border to blend with grid
          - Added z-index to stay on top
      */}
      <div className="px-4 py-3 flex justify-between items-center bg-white z-10 shrink-0">
        
        {/* Left: View Switcher */}
        <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            size="small"
            sx={{ 
                '& .MuiToggleButton-root': { 
                    border: 'none', 
                    borderRadius: '8px !important',
                    px: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#64748b',
                    '&.Mui-selected': { backgroundColor: '#eff6ff', color: '#3b82f6' }
                } 
            }}
        >
            <ToggleButton value="day"><TodayIcon sx={{ fontSize: 18, mr: 1 }} /> Day</ToggleButton>
            <ToggleButton value="week"><DateRangeIcon sx={{ fontSize: 18, mr: 1 }} /> Week</ToggleButton>
            <ToggleButton value="month"><CalendarMonthIcon sx={{ fontSize: 18, mr: 1 }} /> Month</ToggleButton>
        </ToggleButtonGroup>

        {/* Center: Date Nav */}
        <div className="flex items-center gap-2">
             <IconButton onClick={() => { calendarRef.current?.getApi().prev(); setCurrentDate(calendarRef.current?.getApi().getDate() || new Date()) }} size="small"><ArrowBackIosNew fontSize="inherit" /></IconButton>
             <span className="font-bold text-gray-800 w-40 text-center text-lg">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
             </span>
             <IconButton onClick={() => { calendarRef.current?.getApi().next(); setCurrentDate(calendarRef.current?.getApi().getDate() || new Date()) }} size="small"><ArrowForwardIos fontSize="inherit" /></IconButton>
             <Button size="small" onClick={() => { calendarRef.current?.getApi().today(); setCurrentDate(new Date()) }} sx={{ ml: 1, color: '#64748b' }}>Today</Button>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
            <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ backgroundColor: '#3b82f6', textTransform: 'none', fontWeight: 'bold', boxShadow: 'none' }}
            >
                Add Event
            </Button>
            <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { setIsQuickAddOpen(true); setAnchorEl(null); }}>Add Event</MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>Import Schedule</MenuItem>
            </Menu>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="flex-grow relative overflow-hidden">
        <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={false} 
            events={events}
            height="100%"
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            allDaySlot={false}
            nowIndicator={true}
            dateClick={handleDateClick}
            slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: false,
                meridiem: 'short'
            }}
            // Apply text colors for the calendar UI itself (headers, times)
            dayHeaderClassNames="text-gray-700 font-semibold" 
            slotLabelClassNames="text-gray-500 font-medium"
            eventClassNames={(arg) => getEventStyle(arg as unknown as CalendarEventInfo).classNames}
            eventDidMount={(arg) => {
                const { style } = getEventStyle(arg as unknown as CalendarEventInfo);
                arg.el.style.backgroundColor = style.backgroundColor;
                arg.el.style.borderColor = style.borderColor;
                // Force text color on all child elements to ensure visibility
                arg.el.style.color = style.textColor;
                const titleEl = arg.el.querySelector('.fc-event-title');
                if (titleEl) (titleEl as HTMLElement).style.color = style.textColor;
                const timeEl = arg.el.querySelector('.fc-event-time');
                if (timeEl) (timeEl as HTMLElement).style.color = style.textColor;
            }}
        />
      </div>

      <Modal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} title="What would you like to add?">
         <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => handleTypeSelection("task")}
                className="p-6 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-xl text-blue-200 font-bold flex flex-col items-center gap-2 transition-colors"
            >
                <span>📝</span>
                <span>Task</span>
                <span className="text-xs font-normal text-blue-300">Flexible work (1h default)</span>
            </button>
            <button 
                onClick={() => handleTypeSelection("datetime")}
                className="p-6 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-xl text-purple-200 font-bold flex flex-col items-center gap-2 transition-colors"
            >
                <span>📅</span>
                <span>Appointment</span>
                <span className="text-xs font-normal text-purple-300">Fixed time event</span>
            </button>
         </div>
      </Modal>

      <Modal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} title="Quick Add">
         <AddAppointmentForm 
            onComplete={() => setIsQuickAddOpen(false)} 
         />
      </Modal>
    </div>
  );
}