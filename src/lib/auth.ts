import NextAuth from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

const isDev = process.env.NODE_ENV !== "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(isDev ? {} : { adapter: PrismaAdapter(prisma) }),
  providers: [
    // Dev-only: enter any email to log in instantly, no password needed
    ...(isDev
      ? [
          CredentialsProvider({
            name: "Dev Login",
            credentials: {
              email: { label: "Email", type: "email", placeholder: "admin@ats.dev" },
              name: { label: "Name", type: "text", placeholder: "Admin" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;
              const email = credentials.email as string;
              const name = (credentials.name as string) || "Admin";
              const user = await prisma.user.upsert({
                where: { email },
                create: { email, name, role: "ADMIN" },
                update: { name },
              });
              return { id: user.id, email: user.email ?? email, name: user.name ?? name };
            },
          }),
        ]
      : []),
    // Production: LinkedIn OAuth (only when credentials are set)
    ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
      ? [
          LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            authorization: { params: { scope: "r_liteprofile r_emailaddress" } },
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
