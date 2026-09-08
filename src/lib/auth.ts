import type { AuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/schoolYear";

/**
 * Feide legges til som leverandør kun dersom miljøvariablene finnes.
 * Uten dem forsvinner "Logg inn med Feide"-knappen automatisk, og resten
 * av appen fungerer helt normalt - se .env.example.
 */
function buildFeideProvider(): Provider | null {
  const clientId = process.env.FEIDE_CLIENT_ID;
  const clientSecret = process.env.FEIDE_CLIENT_SECRET;
  const issuer = process.env.FEIDE_ISSUER || "https://auth.dataporten.no";

  if (!clientId || !clientSecret) return null;

  return {
    id: "feide",
    name: "Feide",
    type: "oauth",
    wellKnown: `${issuer}/.well-known/openid-configuration`,
    authorization: { params: { scope: "openid profile email userid-feide" } },
    idToken: true,
    checks: ["pkce", "state"],
    profile(profile: { sub: string; name?: string; email?: string }) {
      return {
        id: profile.sub,
        name: profile.name ?? "Feide-bruker",
        email: profile.email ?? "",
      };
    },
    clientId,
    clientSecret,
  };
}

const feideProvider = buildFeideProvider();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "E-post og passord",
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Passord", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user || !user.active || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
    ...(feideProvider ? [feideProvider] : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id ?? token.id;
      if (!userId) return token;

      token.id = userId;
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      token.active = dbUser?.active ?? false;
      token.role = dbUser?.active ? await getCurrentRole(userId) : null;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.active = token.active;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
