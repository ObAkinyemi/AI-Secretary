"use client";

import AddAppointmentForm from "../appointment-manager/AddAppointmentForm";
import AppointmentList from "../appointment-manager/AppointmentList";

export default function AppointmentManagerView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
      <div>
        <AddAppointmentForm />
      </div>
      <div className="h-full">
        <AppointmentList />
      </div>
    </div>
  );
}