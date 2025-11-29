"use client";

import React, { useState, useEffect } from "react";
import { useSchedule } from "@/context/ScheduleContext";
import { Appointment } from "@/lib/ics-utils";

interface AddAptProps {
  initialData?: Appointment | null;
  onComplete?: () => void;
  mode?: "add" | "edit" | "template";
}

export default function AddAppointmentForm({ initialData, onComplete, mode="add" }: AddAptProps) {
  const { addAppointment, updateAppointment } = useSchedule();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(mode === "template" ? "" : initialData.name);
      setDate(initialData.date);
      setStart(initialData.startTime);
      setEnd(initialData.endTime);
    }
  }, [initialData, mode]);

  const handleSubmit = () => {
    if (!name || !date || !start || !end) return;

    const newApt: Appointment = {
      id: mode === "edit" && initialData ? initialData.id : crypto.randomUUID(),
      name,
      date,
      startTime: start,
      endTime: end
    };

    if (mode === "edit" && initialData) {
      updateAppointment(initialData.id, newApt);
    } else {
      addAppointment(newApt);
    }

    setName("");
    setDate("");
    setStart("");
    setEnd("");
    if (onComplete) onComplete();
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg h-fit">
      <h2 className="text-xl font-bold text-white mb-4">
        {mode === "edit" ? "Edit Appointment" : mode === "template" ? "New from Template" : "Add New Appointment"}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Appointment Name</label>
          <input 
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
            placeholder="e.g. Dentist Checkup"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
          <input 
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
            <input 
              type="time"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
            <input 
              type="time"
              value={end}
              onChange={e => setEnd(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
            />
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg mt-4"
        >
          {mode === "edit" ? "Save Changes" : "Add Appointment"}
        </button>
      </div>
    </div>
  );
}