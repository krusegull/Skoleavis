import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canManageUsers } from "@/lib/permissions";
import { Role } from "@prisma/client";
import { getCurrentSchoolYear } from "@/lib/schoolYear";

const createUserSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.nativeEnum(Role),
  schoolYearId: z.string().optional(),
});

/** Admin: liste alle kontoer med rolletildelinger, for brukeradministrasjonen. */
export async function GET() {
  const user = await getSessionUser();
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      roleAssignments: { include: { schoolYear: true }, orderBy: { schoolYear: { createdAt: "desc" } } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ users });
}

/** Admin: oppretter en ny lærer-/redaksjonskonto med rolle for et skoleår. */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = createUserSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const schoolYearId = parsed.data.schoolYearId ?? (await getCurrentSchoolYear())?.id;
  if (!schoolYearId) {
    return NextResponse.json({ error: "Ingen skoleår er satt opp ennå" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() } });
  if (existing) {
    return NextResponse.json({ error: "Det finnes allerede en konto med denne e-posten" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const created = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase().trim(),
      passwordHash,
      active: true,
      roleAssignments: {
        create: { role: parsed.data.role, schoolYearId },
      },
    },
    include: { roleAssignments: { include: { schoolYear: true } } },
  });

  return NextResponse.json({ user: created }, { status: 201 });
}
