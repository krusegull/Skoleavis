import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";
import { getCurrentSchoolYear } from "@/lib/schoolYear";
import { UserAdminPanel } from "@/components/dashboard/UserAdminPanel";

export default async function BrukerePage() {
  const session = await getServerSession(authOptions);
  if (!canManageUsers(session?.user?.role)) redirect("/dashboard");

  const [users, schoolYears, currentSchoolYear] = await Promise.all([
    prisma.user.findMany({
      include: { roleAssignments: { include: { schoolYear: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.schoolYear.findMany({ orderBy: { createdAt: "desc" } }),
    getCurrentSchoolYear(),
  ]);

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-ink">Brukeradministrasjon</h1>
      <p className="mt-2 font-serif text-muted">
        Rettigheter følger rollen en konto har for gjeldende skoleår - aldri en bestemt person.
      </p>
      <div className="mt-6">
        <UserAdminPanel users={users} schoolYears={schoolYears} currentSchoolYearId={currentSchoolYear?.id ?? null} />
      </div>
    </div>
  );
}
