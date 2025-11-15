import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import the rules from the separate file

// --- DIAGNOSTIC LOGS ---
// This will print the status of your environment variables to the terminal
// This log runs when the server starts.
console.log("--- AUTHENTICATION ROUTE LOADED ---");
console.log("GOOGLE_CLIENT_ID Loaded:", !!process.env.GOOGLE_OAUTH_CID);
console.log("GOOGLE_CLIENT_SECRET Loaded:", !!process.env.GOOGLE_OAUTH_CID_SECRET);
console.log("NEXTAUTH_SECRET Loaded:", !!process.env.NEXTAUTH_SECRET);
console.log("--------------------------------------");

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };