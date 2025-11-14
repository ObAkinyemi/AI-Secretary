import NextAuth from "next-auth"
import Providers from "@/components/Providers"
import { authOptions } from "@/lib/auth"

import dotenv from "dotenv";

dotenv.config();

const oCID = process.env.OAUTH_CID;
const oCIDSecret = process.env.OAUTH_CID_SECRET;



// --- DIAGNOSTIC LOGS ---
// This will print the status of your environment variables to the terminal 
// every time the authentication system is used.
console.log("--- SERVER-SIDE AUTHENTICATION CHECK ---");
console.log("GOOGLE_CLIENT_ID Loaded:", !!oCID);
console.log("GOOGLE_CLIENT_SECRET Loaded:", !!oCIDSecret);
console.log("NEXTAUTH_SECRET Loaded:", !!process.env.NEXTAUTH_SECRET);
console.log("--------------------------------------");

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }


// #### **Step 2: Restart Your Server (Crucial)**
// Stop your development server (`Ctrl+C`) and restart it (`npm run dev`).

// #### **Step 3: Test and Check Your Terminal**
// 1.  Go to `http://localhost:3000` in your browser.
// 2.  Look at the **terminal window** where you just ran `npm run dev`. You should immediately see the diagnostic log printed out.
// 3.  Click the "Sign in with Google" button. The log will likely print again.

// Now, please tell me what your terminal says. It will look like one of these two options:

// **Option A (This is what we hope to see):**


// --- SERVER-SIDE AUTHENTICATION CHECK ---
// GOOGLE_CLIENT_ID Loaded: true
// GOOGLE_CLIENT_SECRET Loaded: true
// NEXTAUTH_SECRET Loaded: true
// --------------------------------------


// **Option B (This is the problem):**


// --- SERVER-SIDE AUTHENTICATION CHECK ---
// GOOGLE_CLIENT_ID Loaded: false
// GOOGLE_CLIENT_SECRET Loaded: false
// NEXTAUTH_SECRET Loaded: false
// --------------------------------------

