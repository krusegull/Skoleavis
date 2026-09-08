import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/apiAuth";
import { canManageSchoolYears } from "@/lib/permissions";
import { setCurrentSchoolYear } from "@/lib/schoolYear";

/** Admin: markerer et skoleår som gjeldende (fjerner flagget fra alle andre). */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canManageSchoolYears(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  await setCurrentSchoolYear(params.id);
  return NextResponse.json({ ok: true });
}
