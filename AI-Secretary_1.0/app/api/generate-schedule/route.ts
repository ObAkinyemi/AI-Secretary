import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { tasks, appointments, rules, settings } = await request.json();

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Google API Key is missing in .env.local" },
        { status: 500 }
      );
    }

    // Use a standard, stable model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const wh = settings?.workingHours || { start: "08:00", end: "22:00" };
    const rt = settings?.routines || { wakeUp: "06:15", bedtime: "22:30" };
    const bt = settings?.bufferTimes || { appointments: 15, tasks: 10 };

    const prompt = `
      You are an expert scheduling assistant.
      
      Here are my constraints:
      1. WORKING HOURS: ${wh.start} to ${wh.end}.
      2. FIXED ROUTINES:
         - Wake Up: ${rt.wakeUp}
         - Bedtime: ${rt.bedtime} (Hard stop)
      
      3. BUFFER RULES:
         - Before/After Appointments: ${bt.appointments} minutes
         - Between Tasks: ${bt.tasks} minutes

      4. FIXED APPOINTMENTS (Do not overlap with these):
      ${JSON.stringify(appointments.map((a: any) => ({ 
          name: a.name, 
          start: a.startTime, 
          end: a.endTime, 
          date: a.date 
      })))}

      5. TASKS TO SCHEDULE (Fit these into empty slots):
      ${JSON.stringify(tasks.map((t: any) => ({
          name: t.taskName,
          duration: t.duration + " minutes",
          priority: t.priority,
          category: t.category
      })))}

      6. USER RULES:
      ${rules.join("\n")}

      INSTRUCTIONS:
      - Create a schedule for the dates found in the appointments (or today/tomorrow if none).
      - Do NOT schedule anything during fixed appointments or fixed routines.
      - Respect the buffer times explicitly.
      - Return ONLY a raw JSON array of objects. No markdown, no code blocks.
      
      Output Format:
      [
        {
          "id": "unique_string",
          "name": "Task Name",
          "startTime": "YYYY-MM-DDTHH:mm:ss",
          "endTime": "YYYY-MM-DDTHH:mm:ss",
          "type": "task"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini Response Raw:", text);

    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        const schedule = JSON.parse(cleanedText);
        return NextResponse.json({ schedule });
    } catch (e) {
        console.error("Failed to parse Gemini response:", text);
        return NextResponse.json({ 
            error: "AI returned invalid JSON. Check server logs." 
        }, { status: 500 });
    }

  } catch (error: any) {
    console.error("API Error Detail:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}