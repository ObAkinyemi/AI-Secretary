import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      // Read the Client ID from your .env.local file
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      // Read the Client Secret from your .env.local file
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      
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
  callbacks: {
    async jwt({ token, account }) {
      // If this is the user's first login, add the access token to the JWT
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Add the access token to the session object
      // so we can access it from our API routes
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  
  // This is required by NextAuth.js
  secret: process.env.NEXTAUTH_SECRET,
};