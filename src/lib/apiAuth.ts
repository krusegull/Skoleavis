import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  role: Role | null;
  active: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.active || !session.user.role) return null;
  return { id: session.user.id, role: session.user.role, active: session.user.active };
}
