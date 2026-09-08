import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canManageSchoolYears } from "@/lib/permissions";

const createSchoolYearSchema = z.object({
  label: z.string().min(4).max(20),
  makeCurrent: z.boolean().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user || !canManageSchoolYears(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const schoolYears = await prisma.schoolYear.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ schoolYears });
}

/** Admin: oppretter et nytt skoleår, f.eks. når man skal starte "2027/2028". */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canManageSchoolYears(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = createSchoolYearSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const schoolYear = await prisma.$transaction(async (tx) => {
    if (parsed.data.makeCurrent) {
      await tx.schoolYear.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
    }
    return tx.schoolYear.create({
      data: { label: parsed.data.label, isCurrent: Boolean(parsed.data.makeCurrent) },
    });
  });

  return NextResponse.json({ schoolYear }, { status: 201 });
}
