export interface Appointment {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

// Helper to format JS Date to ICS format (YYYYMMDDTHHmmSS) - Local Time
function formatDateForICS(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  // Get local components
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  // Return YYYYMMDDTHHmmSS (No 'Z', implies local time)
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

export function generateICS(events: any[]): string {
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AI Secretary//NONSGML v1.0//EN\nCALSCALE:GREGORIAN\n";

  events.forEach((event) => {
    const summary = event.taskName || event.name || "Untitled";
    const uid = event.id || crypto.randomUUID(); // Ensure UID for better import handling
    
    let dtStart, dtEnd;
    
    if (event.startTime && event.endTime) {
        dtStart = formatDateForICS(event.startTime);
        dtEnd = formatDateForICS(event.endTime);
    } else {
        const now = new Date();
        dtStart = formatDateForICS(now);
        dtEnd = formatDateForICS(now);
    }

    icsContent += "BEGIN:VEVENT\n";
    icsContent += `UID:${uid}\n`;
    icsContent += `DTSTAMP:${formatDateForICS(new Date())}\n`;
    icsContent += `SUMMARY:${summary}\n`;
    icsContent += `DTSTART:${dtStart}\n`;
    icsContent += `DTEND:${dtEnd}\n`;
    icsContent += "END:VEVENT\n";
  });

  icsContent += "END:VCALENDAR";
  return icsContent;
}

export function parseICS(fileContent: string): Appointment[] {
  const appointments: Appointment[] = [];
  
  const unfoldedContent = fileContent.replace(/\r\n /g, "").replace(/\n /g, "");
  const lines = unfoldedContent.split(/\r\n|\n|\r/);
  
  let currentEvent: Partial<Appointment> | null = null;
  let inEvent = false;

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = { id: crypto.randomUUID() };
      continue;
    }

    if (line.startsWith('END:VEVENT')) {
      inEvent = false;
      if (currentEvent && currentEvent.name && currentEvent.date) {
         appointments.push(currentEvent as Appointment);
      }
      currentEvent = null;
      continue;
    }

    if (inEvent && currentEvent) {
      if (line.startsWith('SUMMARY')) {
        const parts = line.split(':');
        if (parts.length > 1) {
            currentEvent.name = parts.slice(1).join(':'); 
        }
      }

      if (line.startsWith('DTSTART')) {
          const val = getValue(line);
          if (val) {
            const { date, time } = parseICSDate(val);
            currentEvent.date = date;
            currentEvent.startTime = time;
          }
      }

      if (line.startsWith('DTEND')) {
          const val = getValue(line);
          if (val) {
            const { time } = parseICSDate(val);
            currentEvent.endTime = time;
          }
      }
    }
  }

  return appointments;
}

function getValue(line: string): string {
    const idx = line.indexOf(':');
    if (idx === -1) return "";
    return line.substring(idx + 1);
}

function parseICSDate(val: string): { date: string, time: string } {
    if (val.length === 8) {
        return {
            date: `${val.substring(0,4)}-${val.substring(4,6)}-${val.substring(6,8)}`,
            time: "00:00"
        };
    }
    if (val.length >= 15) {
        return {
            date: `${val.substring(0,4)}-${val.substring(4,6)}-${val.substring(6,8)}`,
            time: `${val.substring(9,11)}:${val.substring(11,13)}`
        };
    }
    return { date: "", time: "" };
}