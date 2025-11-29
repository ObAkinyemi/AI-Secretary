import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

// Define strict types
interface ExtendedSession extends Session {
  accessToken?: string;
}

interface CalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
}

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as ExtendedSession;
    
    // Safety check
    if (!session || !session.accessToken) {
      console.error("[app/api/calendar/push/route.ts] No session or access token found.");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { event }: { event: CalendarEvent } = await request.json();
    const accessToken = session.accessToken;

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(`[app/api/calendar/push/route.ts] Google API Error: ${data.error?.message || "Unknown"}`);
      return NextResponse.json({ error: data.error?.message }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown Error";
    console.error(`[app/api/calendar/push/route.ts] Critical Exception: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}