import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in your .env file");
}

// Initialize with your API key from the .env.local file
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  maxOutputTokens: 8192,
  temperature: 0.4,
  topP: 0.95,
};

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig,
});

// This function handles POST requests to /api/generate-schedule
export async function POST(request) {
  try {
    const { fixedAppointmentsText, flexibleTasksJson, schedulingRules } = await request.json();

    // Basic validation
    if (!fixedAppointmentsText || !flexibleTasksJson || !schedulingRules) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Construct the detailed prompt
    const prompt = `
      You are an expert AI scheduler. Your task is to create a perfectly optimized weekly schedule.
      Here are my fixed, non-negotiable appointments:
      ---
      ${fixedAppointmentsText}
      ---
      Here is my list of flexible tasks to schedule for the week in JSON format:
      ---
      ${flexibleTasksJson}
      ---
      You MUST follow these rules exactly:
      ---
      ${schedulingRules}
      ---
      Please generate the final, optimized schedule now in a clean, readable format.
    `;

    // 2. Send the prompt to the AI and get the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const scheduleText = response.text();
    console.log(scheduleText);
    
    // 3. Send the generated schedule back to the frontend
    return NextResponse.json({ schedule: scheduleText });

  } catch (error) {
    console.error("Error generating schedule:", error);
    return NextResponse.json({ error: 'Failed to generate schedule.' }, { status: 500 });
  }
}
