import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the AI client for parsing
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_API_KEY as string);

// A helper function to parse the schedule text using AI
async function parseScheduleWithAI(scheduleText: string): Promise<any[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
        Parse the following schedule text into a valid JSON array of event objects.
        Each object must have three properties: "summary" (the event title), "start" (the start time in ISO 8601 format), and "end" (the end time in ISO 8601 format).
        Assume the year is 2025. The timezone is America/Denver.
        Make sure the output is only the raw JSON array and nothing else.

        Schedule Text:
        ---
        ${scheduleText}
        ---
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonText = response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("AI Parsing Error:", error);
        throw new Error("Failed to parse the schedule text with AI.");
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { scheduleText } = await req.json();
        if (!scheduleText) {
            return NextResponse.json({ error: "Schedule text is required." }, { status: 400 });
        }

        const events = await parseScheduleWithAI(scheduleText);

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        for (const event of events) {
            await calendar.events.insert({
                calendarId: "primary",
                requestBody: {
                    summary: event.summary,
                    start: { dateTime: event.start, timeZone: "America/Denver" },
                    end: { dateTime: event.end, timeZone: "America/Denver" },
                },
            });
        }

        return NextResponse.json({ message: "Schedule pushed to calendar successfully!" });

    } catch (error: unknown) {
        console.error("Error pushing to calendar:", error);
        return NextResponse.json({ error: "Failed to push schedule to calendar.", details: error.message }, { status: 500 });
    }
}
