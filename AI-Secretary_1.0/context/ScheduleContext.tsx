"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Appointment } from "@/lib/ics-utils";

export interface Task {
  id: string;
  taskName: string;
  duration: number; // minutes
  minChunk: number; // minutes
  maxChunk: number; // minutes
  dueDateDays: number | null; // number of days to complete
  priority: "High" | "Medium" | "Low" | "Based on Due Date";
  category: string;
}

export interface SettingsState {
  workingHours: {
    start: string; // "08:00"
    end: string;   // "22:00"
  };
  bufferTimes: {
    appointments: number; // 15
    tasks: number;        // 10
  };
  routines: {
    wakeUp: string;   // "06:15"
    bedtime: string;  // "22:30"
  };
  taskDefaults: {
    duration: number; // 60
    minChunk: number; // 15
    maxChunk: number; // 60
  };
  calendar: {
    view: "Day" | "Week" | "Agenda";
    timezone: string;
  };
}

interface ScheduleContextType {
  tasks: Task[];
  appointments: Appointment[];
  rules: string[];
  categories: string[];
  settings: SettingsState;
  
  addTask: (task: Task) => void;
  updateTask: (id: string, updatedTask: Task) => void;
  removeTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  
  addAppointment: (apt: Appointment) => void;
  updateAppointment: (id: string, updatedApt: Appointment) => void;
  removeAppointment: (id: string) => void;
  setAppointments: (apts: Appointment[]) => void;
  
  setRules: (rules: string[]) => void;
  
  // Settings Updaters
  updateCategories: (cats: string[]) => void;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [appointments, setAppointmentsState] = useState<Appointment[]>([]);
  const [rules, setRulesState] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "Personal",
    "Academic",
    "Physical",
    "Military",
  ]);

  const [settings, setSettingsState] = useState<SettingsState>({
    workingHours: { start: "08:00", end: "22:00" },
    bufferTimes: { appointments: 15, tasks: 10 },
    routines: { wakeUp: "06:15", bedtime: "22:30" },
    taskDefaults: { duration: 60, minChunk: 30, maxChunk: 120 },
    calendar: { view: "Week", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" }
  });

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("ais_tasks");
    const savedApts = localStorage.getItem("ais_apts");
    const savedRules = localStorage.getItem("ais_rules");
    const savedCats = localStorage.getItem("ais_categories");
    const savedSettings = localStorage.getItem("ais_settings");
    
    if (savedTasks) setTasksState(JSON.parse(savedTasks));
    if (savedApts) setAppointmentsState(JSON.parse(savedApts));
    if (savedRules) setRulesState(JSON.parse(savedRules));
    if (savedCats) setCategories(JSON.parse(savedCats));
    if (savedSettings) setSettingsState({ ...settings, ...JSON.parse(savedSettings) }); // Merge defaults
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem("ais_tasks", JSON.stringify(tasks));
    localStorage.setItem("ais_apts", JSON.stringify(appointments));
    localStorage.setItem("ais_rules", JSON.stringify(rules));
    localStorage.setItem("ais_categories", JSON.stringify(categories));
    localStorage.setItem("ais_settings", JSON.stringify(settings));
  }, [tasks, appointments, rules, categories, settings]);

  const addTask = (task: Task) => setTasksState([...tasks, task]);
  const updateTask = (id: string, t: Task) => setTasksState(tasks.map(x => x.id === id ? t : x));
  const removeTask = (id: string) => setTasksState(tasks.filter(x => x.id !== id));
  const setTasks = (t: Task[]) => setTasksState(t);

  const addAppointment = (a: Appointment) => setAppointmentsState([...appointments, a]);
  const updateAppointment = (id: string, a: Appointment) => setAppointmentsState(appointments.map(x => x.id === id ? a : x));
  const removeAppointment = (id: string) => setAppointmentsState(appointments.filter(x => x.id !== id));
  const setAppointments = (a: Appointment[]) => setAppointmentsState(a);

  const setRules = (r: string[]) => setRulesState(r);
  
  const updateCategories = (c: string[]) => setCategories(c);
  
  const updateSettings = (newSettings: Partial<SettingsState>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <ScheduleContext.Provider
      value={{
        tasks, appointments, rules, categories, settings,
        addTask, updateTask, removeTask, setTasks,
        addAppointment, updateAppointment, removeAppointment, setAppointments,
        setRules, updateCategories, updateSettings
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}