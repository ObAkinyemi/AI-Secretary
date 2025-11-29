import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { tasks, appointments, rules, workingHours } = await request.json();

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Google API Key is missing" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
      You are an expert scheduling assistant.
      
      Here are my constraints:
      1. WORKING HOURS: ${workingHours?.start || "08:00"} to ${workingHours?.end || "22:00"}.
      2. FIXED APPOINTMENTS (Do not overlap with these):
      ${JSON.stringify(appointments.map((a: any) => ({ 
          name: a.name, 
          start: a.startTime, 
          end: a.endTime, 
          date: a.date 
      })))}

      3. TASKS TO SCHEDULE (Fit these into empty slots):
      ${JSON.stringify(tasks.map((t: any) => ({
          name: t.taskName,
          duration: t.duration + " minutes",
          priority: t.priority,
          category: t.category
      })))}

      4. USER RULES:
      ${rules.join("\n")}

      INSTRUCTIONS:
      - Create a schedule for the dates found in the appointments (or today/tomorrow if none).
      - Do NOT schedule anything during fixed appointments.
      - Respect the user rules.
      - You can split tasks if needed (append "(Part 1)", "(Part 2)" to name).
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

    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        const schedule = JSON.parse(cleanedText);
        return NextResponse.json({ schedule });
    } catch (e) {
        console.error("Failed to parse Gemini response:", text);
        return NextResponse.json({ error: "Failed to parse schedule" }, { status: 500 });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}