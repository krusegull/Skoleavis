import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Oppretter det aller første skoleåret og den aller første admin-kontoen
 * (læreren som skal administrere resten). Kjøres kun manuelt ved
 * førstegangsoppsett - se README.md.
 */
async function main() {
  const yearLabel = process.env.SEED_SCHOOL_YEAR ?? "2026/2027";
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminName = process.env.SEED_ADMIN_NAME ?? "Redaksjonsansvarlig";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Sett SEED_ADMIN_EMAIL og SEED_ADMIN_PASSWORD som miljøvariabler før du kjører seed-scriptet."
    );
  }

  const schoolYear = await prisma.schoolYear.upsert({
    where: { label: yearLabel },
    update: { isCurrent: true },
    create: { label: yearLabel, isCurrent: true },
  });

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { active: true },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      active: true,
    },
  });

  await prisma.roleAssignment.upsert({
    where: {
      userId_schoolYearId: {
        userId: admin.id,
        schoolYearId: schoolYear.id,
      },
    },
    update: { role: Role.ADMIN },
    create: {
      userId: admin.id,
      schoolYearId: schoolYear.id,
      role: Role.ADMIN,
    },
  });

  console.log(`Ferdig. Admin "${admin.email}" er satt opp for skoleåret ${schoolYear.label}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
