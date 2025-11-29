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

// Helper to parse "HH:mm" to a Date object for Today (or specific date)
function parseTime(timeStr: string, baseDate: Date = new Date()): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function runScheduler(
  tasks: Task[],
  appointments: Appointment[],
  rules: string[] // Rules are unused in local algo, but passed for future AI expansion
): ScheduledBlock[] {
  const schedule: ScheduledBlock[] = [];
  
  // 1. Convert Appointments to ScheduledBlocks
  // For this MVP, we assume scheduling for "Today" or the date of the first appointment found
  // To keep it simple, we will normalize everything to a single timeline (e.g., today) 
  // or respect the specific dates if provided.
  
  // Let's assume we are scheduling for the date specified in the appointments, 
  // or "Today" if no appointments exist.
  const today = new Date();
  const scheduleDateStr = appointments.length > 0 ? appointments[0].date : today.toISOString().split("T")[0];

  // Map Appointments
  const fixedBlocks: ScheduledBlock[] = appointments
    .filter(a => a.date === scheduleDateStr) // Only schedule for the primary day found
    .map(a => ({
      id: a.id,
      name: a.name,
      startTime: parseTime(a.startTime, new Date(a.date)),
      endTime: parseTime(a.endTime, new Date(a.date)),
      type: "appointment"
    }));

  schedule.push(...fixedBlocks);

  // 2. Sort Fixed Blocks by time
  fixedBlocks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // 3. Define Working Hours (e.g., 8:00 AM to 10:00 PM)
  // In a real app, this would be a setting.
  const dayStart = parseTime("08:00", new Date(scheduleDateStr));
  const dayEnd = parseTime("22:00", new Date(scheduleDateStr));

  // 4. Identify Free Time Windows
  const freeWindows: { start: Date, end: Date }[] = [];
  let currentTime = dayStart;

  for (const block of fixedBlocks) {
    if (block.startTime > currentTime) {
      freeWindows.push({ start: currentTime, end: block.startTime });
    }
    // Move current time to end of block if it's later
    if (block.endTime > currentTime) {
      currentTime = block.endTime;
    }
  }
  // Add final window after last appointment
  if (currentTime < dayEnd) {
    freeWindows.push({ start: currentTime, end: dayEnd });
  }

  // 5. Sort Tasks by Priority
  const priorityOrder = { "High": 3, "Medium": 2, "Low": 1, "Based on Due Date": 2 };
  const sortedTasks = [...tasks].sort((a, b) => {
    return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
  });

  // 6. Slot Tasks into Free Windows
  for (const task of sortedTasks) {
    let timeNeeded = task.duration; // minutes

    for (let i = 0; i < freeWindows.length; i++) {
      if (timeNeeded <= 0) break;

      const window = freeWindows[i];
      const windowDuration = (window.end.getTime() - window.start.getTime()) / 60000; // minutes

      if (windowDuration <= 0) continue;

      // Can we fit the whole task?
      if (windowDuration >= timeNeeded) {
        const start = new Date(window.start);
        const end = new Date(start.getTime() + timeNeeded * 60000);
        
        schedule.push({
          id: task.id,
          name: task.taskName,
          startTime: start,
          endTime: end,
          type: "task"
        });

        // Update window start
        window.start = end; 
        timeNeeded = 0;
      } 
      // Can we fit a chunk? (Check minChunk)
      else if (windowDuration >= task.minChunk) {
        // Fit as much as we can (or up to maxChunk if implemented)
        const chunkDuration = Math.min(windowDuration, timeNeeded);
        
        const start = new Date(window.start);
        const end = new Date(start.getTime() + chunkDuration * 60000);

        schedule.push({
          id: `${task.id}-chunk-${i}`,
          name: `${task.taskName} (Part)`,
          startTime: start,
          endTime: end,
          type: "task",
          isChunk: true
        });

        // Update window start & reduce needed time
        window.start = end;
        timeNeeded -= chunkDuration;
      }
    }
  }

  // 7. Final Sort by Start Time
  return schedule.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}