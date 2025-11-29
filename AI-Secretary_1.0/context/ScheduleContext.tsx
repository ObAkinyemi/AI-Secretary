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

interface ScheduleContextType {
  tasks: Task[];
  appointments: Appointment[];
  rules: string[];
  categories: string[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updatedTask: Task) => void;
  removeTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  addAppointment: (apt: Appointment) => void;
  updateAppointment: (id: string, updatedApt: Appointment) => void;
  removeAppointment: (id: string) => void;
  setAppointments: (apts: Appointment[]) => void;
  setRules: (rules: string[]) => void;
  updateCategories: (cats: string[]) => void;
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

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("ais_tasks");
    const savedApts = localStorage.getItem("ais_apts");
    const savedRules = localStorage.getItem("ais_rules");
    
    if (savedTasks) setTasksState(JSON.parse(savedTasks));
    if (savedApts) setAppointmentsState(JSON.parse(savedApts));
    if (savedRules) setRulesState(JSON.parse(savedRules));
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem("ais_tasks", JSON.stringify(tasks));
    localStorage.setItem("ais_apts", JSON.stringify(appointments));
    localStorage.setItem("ais_rules", JSON.stringify(rules));
  }, [tasks, appointments, rules]);

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

  return (
    <ScheduleContext.Provider
      value={{
        tasks, appointments, rules, categories,
        addTask, updateTask, removeTask, setTasks,
        addAppointment, updateAppointment, removeAppointment, setAppointments,
        setRules, updateCategories
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