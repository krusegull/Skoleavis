import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageSchoolYears } from "@/lib/permissions";
import { SchoolYearPanel } from "@/components/dashboard/SchoolYearPanel";
import { RoleAssignment, User } from "@prisma/client";

export default async function SkolearPage() {
  const session = await getServerSession(authOptions);
  if (!canManageSchoolYears(session?.user?.role)) redirect("/dashboard");

  const schoolYears = await prisma.schoolYear.findMany({ orderBy: { createdAt: "desc" } });
  const assignments = await prisma.roleAssignment.findMany({ include: { user: true } });

  const assignmentsByYear: Record<string, (RoleAssignment & { user: User })[]> = {};
  for (const year of schoolYears) assignmentsByYear[year.id] = [];
  for (const a of assignments) {
    assignmentsByYear[a.schoolYearId]?.push(a);
  }

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Avslutt skoleår</h1>
      <p className="mt-2 font-serif text-muted">
        Administrer skoleår og deaktiver kontoer manuelt når redaksjonsmedlemmer slutter.
      </p>
      <div className="mt-6">
        <SchoolYearPanel schoolYears={schoolYears} assignmentsByYear={assignmentsByYear} />
      </div>
    </div>
  );
}
