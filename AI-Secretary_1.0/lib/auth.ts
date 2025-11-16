import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      // Read the Client ID from your .env.local file
      clientId: process.env.GOOGLE_OAUTH_CID as string,
      // Read the Client Secret from your .env.local file
      clientSecret: process.env.GOOGLE_OAUTH_CID_SECRET as string,
      
      // This is the CRITICAL part for your app:
      // We are asking for permission to not only log in,
      // but to also read/write to the user's calendar.
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),
    // ...you could add more providers here (like GitHub, Apple, etc.)
  ],
  
  // These callbacks are needed to get the access token
  // back from Google so we can use it in our API routes.
// ... existing code ...
  callbacks: {
    async jwt({ token, account }) {
      // If this is the user's first login, add the access token to the JWT
      if (account) {
        // 1. Cast token to 'any' to add the custom property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (token as any).accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Add the access token to the session object
      // so we can access it from our API routes
      
      // 2. Cast session to 'any' and get the token's accessToken
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).accessToken = (token as any).accessToken;
      return session;
    },
  },
  
  // This is required by NextAuth.js
  secret: process.env.NEXTAUTH_SECRET,
};