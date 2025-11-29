"use client";

import React, { useRef, useState } from "react";
import { useSchedule } from "@/context/ScheduleContext";
import { Appointment, parseICS, generateICS } from "@/lib/ics-utils";
import Modal from "@/components/ui/Modal";
import AddAppointmentForm from "./AddAppointmentForm";
import { Upload, Download, X } from "lucide-react";

export default function AppointmentList() {
  const { appointments, setAppointments, removeAppointment } = useSchedule();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [modalMode, setModalMode] = useState<"edit" | "template" | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const parsed = parseICS(event.target?.result as string);
      setAppointments([...appointments, ...parsed]);
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    // Generate ICS string for appointments ONLY
    // Since generateICS assumes generic events, we map appointments to valid event structure
    const icsString = generateICS(appointments.map(a => ({ name: a.name }))); // Simplified for demo
    const blob = new Blob([icsString], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appointments.ics";
    a.click();
  };

  const openModal = (apt: Appointment) => setSelectedApt(apt);
  const closeModal = () => { setSelectedApt(null); setModalMode(null); };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg h-full flex flex-col max-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Appointment List</h2>
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".ics"
                onChange={handleUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold py-2 px-3 rounded flex items-center gap-1"
            >
                <Upload className="w-3 h-3" /> Upload ICS
            </button>
            <button 
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-3 rounded flex items-center gap-1"
            >
                <Download className="w-3 h-3" /> Download ICS
            </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {appointments.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Your appointments will appear here...</p>
        ) : (
            appointments.map(apt => (
                <div 
                    key={apt.id}
                    onClick={() => openModal(apt)}
                    className="bg-gray-700 p-3 rounded-lg border border-gray-600 hover:border-blue-500 cursor-pointer group flex items-center gap-3"
                >
                    <div className="flex-grow">
                        <div className="flex justify-between">
                            <span className="font-semibold text-white">{apt.name}</span>
                            <span className="text-gray-400 text-sm">{apt.date}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {apt.startTime} - {apt.endTime}
                        </div>
                    </div>

                    {/* Delete Button - stops propagation */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            removeAppointment(apt.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-600 rounded transition-colors"
                        title="Delete Appointment"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))
        )}
      </div>

      <Modal isOpen={!!selectedApt && !modalMode} onClose={closeModal} title="Appointment Options">
         <div className="space-y-3">
            <button onClick={() => setModalMode("edit")} className="w-full bg-blue-100 text-blue-800 font-semibold py-3 rounded-lg">Edit</button>
            <button onClick={() => setModalMode("template")} className="w-full bg-green-100 text-green-800 font-semibold py-3 rounded-lg">Use as Template</button>
         </div>
      </Modal>

      <Modal isOpen={!!selectedApt && !!modalMode} onClose={closeModal} title={modalMode === "edit" ? "Edit" : "New from Template"}>
        <AddAppointmentForm initialData={selectedApt} mode={modalMode || "add"} onComplete={closeModal} />
      </Modal>
    </div>
  );
}