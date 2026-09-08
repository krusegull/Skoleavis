import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Henter "Om oss"-innholdet, og oppretter en tom standardrad første gang.
 * Tåler at to forespørsler prøver å opprette raden samtidig (f.eks. under
 * bygg eller ved første besøk) uten å kaste en constraint-feil til brukeren.
 */
export async function getOrCreateAboutPage() {
  const existing = await prisma.aboutPage.findUnique({ where: { id: "about" } });
  if (existing) return existing;

  try {
    return await prisma.aboutPage.create({ data: { id: "about" } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return prisma.aboutPage.findUniqueOrThrow({ where: { id: "about" } });
    }
    throw err;
  }
}
