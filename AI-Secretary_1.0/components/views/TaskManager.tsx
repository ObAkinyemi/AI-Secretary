"use client";

import AddTaskForm from "../task-manager/AddTaskForm";
import TaskQueue from "../task-manager/TaskQueue";
import JsonPreview from "../task-manager/JsonPreview";

export default function TaskManagerView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <AddTaskForm />
      </div>
      <div className="flex flex-col h-full">
        <div className="flex-grow">
            <TaskQueue />
        </div>
        <JsonPreview />
      </div>
    </div>
  );
}