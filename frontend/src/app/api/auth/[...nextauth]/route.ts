import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

console.log("NextAuth initialization with environment variables:", {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Present" : "Missing",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "Present" : "Missing",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Present" : "Missing",
});

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  debug: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback", { user, account, profile: profile ? "Present" : "Missing" });

      if (account?.provider === "google" && user.email) {
        try {
          // Send user data to our backend
          console.log("Sending user data to backend:", {
            name: user.name,
            email: user.email,
            googleId: profile?.sub
          });

          const response = await axios.post("http://localhost:5000/api/auth/google", {
            name: user.name,
            email: user.email,
            image: user.image,
            googleId: profile?.sub,
          });

          console.log("Backend response:", response.data);

          // Store the token in the user session
          if (response.data.token) {
            user.token = response.data.token;
            user.role = response.data.user.role;
            user.id = response.data.user._id;

            // This is a server component, so we can't directly set localStorage
            // We'll use a different approach with the session and client components
            return true;
          }
        } catch (error) {
          console.error("Error during backend authentication:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      console.log("JWT callback", { token, user: user ? "Present" : "Missing" });

      // Pass the token from our backend to the JWT
      if (user?.token) {
        token.backendToken = user.token;
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback", {
        session: session ? "Present" : "Missing",
        token: token ? "Present" : "Missing"
      });

      // Pass the token to the client
      if (token.backendToken) {
        session.backendToken = token.backendToken as string;
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST }; 