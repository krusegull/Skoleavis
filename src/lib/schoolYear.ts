import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

/** Henter skoleåret som er markert som gjeldende, om noen. */
export async function getCurrentSchoolYear() {
  return prisma.schoolYear.findFirst({ where: { isCurrent: true } });
}

/**
 * Rollen en bruker har for gjeldende skoleår, eller null hvis brukeren
 * ikke har noen tildeling for inneværende år (eller kontoen er deaktivert).
 */
export async function getCurrentRole(userId: string): Promise<Role | null> {
  const currentYear = await getCurrentSchoolYear();
  if (!currentYear) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.active) return null;

  const assignment = await prisma.roleAssignment.findUnique({
    where: { userId_schoolYearId: { userId, schoolYearId: currentYear.id } },
  });
  return assignment?.role ?? null;
}

/** Aktive redaksjonsmedlemmer for gjeldende skoleår, til bruk i bidragsyter-velgeren. */
export async function getCurrentRoster() {
  const currentYear = await getCurrentSchoolYear();
  if (!currentYear) return [];

  const assignments = await prisma.roleAssignment.findMany({
    where: { schoolYearId: currentYear.id, user: { active: true } },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return assignments.map((a) => ({ id: a.user.id, name: a.user.name, role: a.role }));
}

/**
 * Setter ett skoleår som "gjeldende" og fjerner flagget fra alle andre.
 * Kjøres i en transaksjon slik at det aldri finnes mer enn ett gjeldende år.
 */
export async function setCurrentSchoolYear(schoolYearId: string) {
  await prisma.$transaction([
    prisma.schoolYear.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } }),
    prisma.schoolYear.update({ where: { id: schoolYearId }, data: { isCurrent: true } }),
  ]);
}
