import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
// OTP verification uses drizzle query builder (inline where helpers)

const hasDb = db !== null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(hasDb
    ? {
        adapter: DrizzleAdapter(db!, {
          usersTable: schema.users,
          accountsTable: schema.accounts,
          sessionsTable: schema.sessions,
          verificationTokensTable: schema.verificationTokens,
        }),
      }
    : {}),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        if (!email) return null;

        // Without DB: return a stub user (session-only, no persistence)
        if (!db) {
          return { id: "local-user", email, name: email.split("@")[0], image: null };
        }

        // Verify that OTP was recently used for this email (within last 2 minutes)
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const verifiedOtp = await db.query.otpCodes.findFirst({
          where: (o, { eq: eq_, and: and_, gte: gte_ }) =>
            and_(
              eq_(o.email, email),
              eq_(o.used, true),
              gte_(o.createdAt, twoMinutesAgo),
            ),
        });

        if (!verifiedOtp) {
          return null; // OTP not verified — reject sign-in
        }

        // With DB: find or create user
        const existing = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.email, email),
        });

        if (existing) {
          return { id: existing.id, email: existing.email, name: existing.name, image: existing.image };
        }

        const [newUser] = await db.insert(schema.users).values({
          email,
          name: email.split("@")[0],
        }).returning();

        return { id: newUser.id, email: newUser.email, name: newUser.name, image: newUser.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
