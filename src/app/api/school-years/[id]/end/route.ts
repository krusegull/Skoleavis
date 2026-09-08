import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canManageSchoolYears } from "@/lib/permissions";

const endSchoolYearSchema = z.object({
  userIds: z.array(z.string()).min(1),
});

/**
 * "Avslutt skoleår": administrator velger konkrete kontoer og deaktiverer
 * dem manuelt. Dette er alltid en bevisst handling - ingen automatikk.
 * Rolletildelingene (historikken) røres ikke.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canManageSchoolYears(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const schoolYear = await prisma.schoolYear.findUnique({ where: { id: params.id } });
  if (!schoolYear) return NextResponse.json({ error: "Fant ikke skoleåret" }, { status: 404 });

  const parsed = endSchoolYearSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await prisma.user.updateMany({
    where: { id: { in: parsed.data.userIds } },
    data: { active: false },
  });

  return NextResponse.json({ deactivated: result.count });
}
