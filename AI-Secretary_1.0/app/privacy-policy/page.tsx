import React from "react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-8">
      <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="mb-4 text-sm text-gray-400">Last Updated: November 29, 2025</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
          <p>
            Welcome to AI Secretary (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy. 
            This Privacy Policy explains how we handle your personal information when you use our scheduling application.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Google Account Information:</strong> When you sign in with Google, we collect your email address and basic profile information to authenticate you.
            </li>
            <li>
              <strong>Calendar Data:</strong> We access your Google Calendar events only when you explicitly grant permission. This data is used solely to identify your availability and generate schedules.
            </li>
            <li>
              <strong>Task & Preference Data:</strong> We process the tasks, rules, and preferences you input into the application to generate your schedule.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
          <p>
            We use your information strictly to provide the AI Secretary service:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>To authenticate your identity.</li>
            <li>To analyze your schedule and find free time slots.</li>
            <li>To generate optimized daily or weekly schedules based on your inputs.</li>
          </ul>
          <p className="mt-2 text-yellow-400 font-medium">
            We do not sell, trade, or rent your personal identification information to others.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">4. AI Processing</h2>
          <p>
            Your schedule data (tasks, appointments, and rules) is sent to Google&apos;s Gemini AI API for processing. 
            This data is used solely to generate the schedule response and is not used to train Google&apos;s public AI models, 
            in accordance with Google Cloud&apos;s data privacy policies for API usage.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">5. Data Storage</h2>
          <p>
            Your tasks, rules, and settings are stored locally on your device (in your browser&apos;s Local Storage). 
            We do not maintain a central database of your personal tasks. This means your personal schedule data effectively never leaves your computer, except for the transient processing request sent to the AI.
          </p>
        </section>

        <section className="mb-6 bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-red-300 mb-3">6. Experimental Nature & Security Warning</h2>
          <p className="mb-2">
            <strong>Please Read Carefully:</strong> AI Secretary is currently in an <strong>experimental stage</strong> of development.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            <li>
              There may be software bugs, glitches, or unexpected behaviors in the scheduling logic.
            </li>
            <li>
              While we use standard encryption (HTTPS) and secure authentication (Google OAuth), there may be minor security vulnerabilities inherent to experimental software.
            </li>
            <li>
              <strong>Recommendation:</strong> Do NOT input highly sensitive, confidential, or financial information into this application (e.g., passwords, bank details, medical records). Use generalized task names (e.g., &quot;Client Meeting&quot; instead of &quot;Meeting with John Doe regarding Patent #123&quot;).
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <Link href="/safety" className="text-blue-400 hover:text-blue-300 hover:underline">
            &larr; Back to Safety Hub
          </Link>
        </div>
      </div>
    </div>
  );
}