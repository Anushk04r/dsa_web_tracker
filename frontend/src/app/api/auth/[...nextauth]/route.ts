import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const res = await fetch(`${backendUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;
        const data = await res.json();

        if (!data.user || !data.token) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          backendToken: data.token,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.backendToken = (user as any).backendToken;
        token.leetcodeUsername = (user as any).leetcodeUsername;
      }
      if (trigger === "update" && session?.user) {
        token.leetcodeUsername = session.user.leetcodeUsername;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).backendToken = token.backendToken;
      if (session.user) {
        (session.user as any).leetcodeUsername = token.leetcodeUsername;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };


