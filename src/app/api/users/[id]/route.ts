import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canManageUsers } from "@/lib/permissions";
import { Role } from "@prisma/client";

const updateUserSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  active: z.boolean().optional(),
  newPassword: z.string().min(8).max(200).optional(),
  roleAssignment: z
    .object({
      role: z.nativeEnum(Role),
      schoolYearId: z.string(),
    })
    .optional(),
});

/**
 * Admin: oppdaterer en konto - navn, aktiv/deaktivert, nytt passord,
 * og/eller setter (oppretter eller endrer) rolletildeling for et skoleår.
 * Kontoer slettes aldri her, kun deaktiveres.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !canManageUsers(sessionUser.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = updateUserSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Fant ikke brukeren" }, { status: 404 });

  const { name, active, newPassword, roleAssignment } = parsed.data;

  const passwordHash = newPassword ? await bcrypt.hash(newPassword, 12) : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    if (roleAssignment) {
      await tx.roleAssignment.upsert({
        where: {
          userId_schoolYearId: { userId: target.id, schoolYearId: roleAssignment.schoolYearId },
        },
        update: { role: roleAssignment.role },
        create: { userId: target.id, schoolYearId: roleAssignment.schoolYearId, role: roleAssignment.role },
      });
    }

    return tx.user.update({
      where: { id: target.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(active !== undefined ? { active } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        roleAssignments: { include: { schoolYear: true } },
      },
    });
  });

  return NextResponse.json({ user: updated });
}
