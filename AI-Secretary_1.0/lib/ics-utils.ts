export interface Appointment {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export function generateICS(events: any[]): string {
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AI Secretary//NONSGML v1.0//EN\n";

  events.forEach((event) => {
    // Determine if it's a Task (has taskName) or Appointment (has name)
    const summary = event.taskName || event.name || "Untitled";
    
    // Simple VEVENT generation
    icsContent += "BEGIN:VEVENT\n";
    icsContent += `SUMMARY:${summary}\n`;
    icsContent += `DTSTART:${formatDateForICS(new Date())}\n`; // Placeholder date logic
    icsContent += `DTEND:${formatDateForICS(new Date())}\n`;   // Placeholder date logic
    icsContent += "END:VEVENT\n";
  });

  icsContent += "END:VCALENDAR";
  return icsContent;
}

// Helper to format JS Date to ICS format (YYYYMMDDTHHmmSS)
function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function parseICS(fileContent: string): Appointment[] {
  const appointments: Appointment[] = [];
  
  // 1. Unfold lines (Outlook splits long lines with a space on the next line)
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
      // Only add if we successfully parsed the start date
      if (currentEvent && currentEvent.name && currentEvent.date) {
         appointments.push(currentEvent as Appointment);
      }
      currentEvent = null;
      continue;
    }

    if (inEvent && currentEvent) {
      // Parse SUMMARY (Name)
      if (line.startsWith('SUMMARY')) {
        // Handle SUMMARY:Name or SUMMARY;LANGUAGE=en-us:Name
        const parts = line.split(':');
        if (parts.length > 1) {
            currentEvent.name = parts.slice(1).join(':'); // Rejoin in case name has colons
        }
      }

      // Parse DTSTART (Start Time)
      if (line.startsWith('DTSTART')) {
          const val = getValue(line);
          if (val) {
            const { date, time } = parseICSDate(val);
            currentEvent.date = date;
            currentEvent.startTime = time;
          }
      }

      // Parse DTEND (End Time)
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

// Helper to extract value after the first colon
function getValue(line: string): string {
    const idx = line.indexOf(':');
    if (idx === -1) return "";
    return line.substring(idx + 1);
}

// Helper to parse ICS date strings (e.g., 20251128T103000 or 20251126)
function parseICSDate(val: string): { date: string, time: string } {
    // Case 1: Date-only (e.g., 20251126) - usually "All Day" events
    if (val.length === 8) {
        return {
            date: `${val.substring(0,4)}-${val.substring(4,6)}-${val.substring(6,8)}`,
            time: "00:00"
        };
    }

    // Case 2: DateTime (e.g., 20251128T103000)
    if (val.length >= 15) {
        return {
            date: `${val.substring(0,4)}-${val.substring(4,6)}-${val.substring(6,8)}`,
            time: `${val.substring(9,11)}:${val.substring(11,13)}`
        };
    }

    return { date: "", time: "" };
}