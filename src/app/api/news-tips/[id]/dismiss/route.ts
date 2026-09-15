import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";

/** Redaktør/admin: avviser et nyhetstips - ingen skal skrive noe om det. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const tip = await prisma.newsTip.update({
    where: { id: params.id },
    data: { dismissed: true },
  });

  return NextResponse.json({ tip });
}
