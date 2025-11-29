import { Task } from "@/context/ScheduleContext";
import { Appointment } from "@/lib/ics-utils";

export interface ScheduledBlock {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  type: "task" | "appointment";
  isChunk?: boolean;
}

function parseTime(timeStr: string, baseDate: Date = new Date()): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function runScheduler(
  tasks: Task[],
  appointments: Appointment[]
  // Removed rules parameter completely to fix "unused variable" warning
): ScheduledBlock[] {
  const schedule: ScheduledBlock[] = [];
  
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; 
  const scheduleDateStr = appointments.length > 0 ? appointments[0].date : todayStr;

  const fixedBlocks: ScheduledBlock[] = appointments
    .filter(a => a.date === scheduleDateStr)
    .map(a => ({
      id: a.id,
      name: a.name,
      startTime: parseTime(a.startTime, new Date(a.date)),
      endTime: parseTime(a.endTime, new Date(a.date)),
      type: "appointment"
    }));

  schedule.push(...fixedBlocks);
  fixedBlocks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const dayStart = parseTime("08:00", new Date(scheduleDateStr));
  const dayEnd = parseTime("22:00", new Date(scheduleDateStr));

  // FIX: Changed 'let' to 'const'
  const freeWindows: { start: Date, end: Date }[] = [];
  let currentTime = dayStart;

  for (const block of fixedBlocks) {
    if (block.startTime > currentTime) {
      freeWindows.push({ start: new Date(currentTime), end: new Date(block.startTime) });
    }
    if (block.endTime > currentTime) {
      currentTime = block.endTime;
    }
  }
  if (currentTime < dayEnd) {
    freeWindows.push({ start: new Date(currentTime), end: new Date(dayEnd) });
  }

  const priorityOrder = { "High": 3, "Medium": 2, "Low": 1, "Based on Due Date": 2 };
  const sortedTasks = [...tasks].sort((a, b) => {
    // I am leaving your manual fix for @ts-expect-error here since you said you fixed it.
    // Assuming you deleted the line causing the error or the comment itself.
    const pA = a.priority as keyof typeof priorityOrder;
    const pB = b.priority as keyof typeof priorityOrder;
    return (priorityOrder[pB] || 1) - (priorityOrder[pA] || 1);
  });

  for (const task of sortedTasks) {
    let timeNeeded = task.duration;

    for (let i = 0; i < freeWindows.length; i++) {
      if (timeNeeded <= 0) break;

      const window = freeWindows[i];
      const windowDuration = (window.end.getTime() - window.start.getTime()) / 60000;

      if (windowDuration <= 0) continue;

      let timeToSchedule = 0;
      let isChunk = false;

      if (windowDuration >= timeNeeded) {
        timeToSchedule = timeNeeded;
      } else if (windowDuration >= task.minChunk) {
        timeToSchedule = windowDuration;
        if (task.maxChunk && timeToSchedule > task.maxChunk) {
            timeToSchedule = task.maxChunk;
        }
        isChunk = true;
      }

      if (timeToSchedule > 0) {
        const start = new Date(window.start);
        const end = new Date(start.getTime() + timeToSchedule * 60000);

        schedule.push({
          id: isChunk ? `${task.id}-chunk-${i}` : task.id,
          name: task.taskName + (isChunk ? " (Part)" : ""),
          startTime: start,
          endTime: end,
          type: "task",
          isChunk: isChunk
        });

        window.start = end;
        timeNeeded -= timeToSchedule;
      }
    }
  }

  return schedule.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}