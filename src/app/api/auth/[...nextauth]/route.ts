import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[AUTH_ERROR] Missing credentials");
            return null;
          }

          console.log("[AUTH] Authorizing user with email:", credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: { id: true, email: true, password: true, name: true, role: true },
          });

          if (!user) {
            console.error("[AUTH_ERROR] User not found for email:", credentials.email);
            return null;
          }

          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) {
            console.error("[AUTH_ERROR] Invalid password for email:", credentials.email);
            return null;
          }

          console.log("[AUTH_SUCCESS] User authorized:", user.id, "Role:", user.role);
          return { id: user.id, email: user.email, name: user.name, role: user.role || "user" };
        } catch (error) {
          console.error("[AUTH_ERROR] Authorization failed:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.NEXTAUTH_SESSION_MAX_AGE || "86400"),
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        console.log("[JWT_CALLBACK] Token created:", { id: token.id, role: token.role });
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        console.log("[SESSION_CALLBACK] Session updated:", session.user);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
  events: {
    async signIn({ user }) {
      console.log("[AUTH_EVENT] User signed in:", user.id, user.email);
    },
    async signOut() {
      console.log("[AUTH_EVENT] User signed out");
    },
    async session({ session }) {
      console.log("[AUTH_EVENT] Session fetched:", session.user);
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };