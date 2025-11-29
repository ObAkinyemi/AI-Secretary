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
  appointments: Appointment[],
  rules: string[]
): ScheduledBlock[] {
  const schedule: ScheduledBlock[] = [];
  
  // 1. Determine Schedule Date (First appointment date or Today)
  const today = new Date();
  // Ensure we format the date string safely (YYYY-MM-DD) for filtering
  const todayStr = today.toISOString().split("T")[0]; 
  const scheduleDateStr = appointments.length > 0 ? appointments[0].date : todayStr;

  // 2. Map Appointments to Blocks
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

  // 3. Sort Fixed Blocks by time
  fixedBlocks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // 4. Define Working Hours
  const dayStart = parseTime("08:00", new Date(scheduleDateStr));
  const dayEnd = parseTime("22:00", new Date(scheduleDateStr));

  // 5. Identify Free Time Windows
  // We use 'let' because we will modify these windows as we fill them
  let freeWindows: { start: Date, end: Date }[] = [];
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

  // 6. Sort Tasks by Priority
  const priorityOrder = { "High": 3, "Medium": 2, "Low": 1, "Based on Due Date": 2 };
  const sortedTasks = [...tasks].sort((a, b) => {
    // @ts-ignore
    return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
  });

  // 7. Slot Tasks into Free Windows
  for (const task of sortedTasks) {
    let timeNeeded = task.duration; // minutes

    // Iterate through windows to find space
    for (let i = 0; i < freeWindows.length; i++) {
      if (timeNeeded <= 0) break;

      const window = freeWindows[i];
      const windowDuration = (window.end.getTime() - window.start.getTime()) / 60000;

      if (windowDuration <= 0) continue;

      // Logic: Fit Whole Task OR Chunk
      let timeToSchedule = 0;
      let isChunk = false;

      if (windowDuration >= timeNeeded) {
        // Fits completely
        timeToSchedule = timeNeeded;
      } else if (windowDuration >= task.minChunk) {
        // Fits a chunk
        timeToSchedule = windowDuration; // Take the whole window? Or just maxChunk?
        // Let's cap it at maxChunk if defined, otherwise take available window
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

        // CRITICAL FIX: Update the window start time!
        // We modify the object in the array directly so the next iteration sees the new start time
        window.start = end;
        
        timeNeeded -= timeToSchedule;
      }
    }
  }

  // 8. Final Sort
  return schedule.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}