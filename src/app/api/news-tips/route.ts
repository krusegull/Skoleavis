import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";

/** Redaktør/admin: liste aktive (ikke avviste) nyhetstips, nyeste først. */
export async function GET() {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const tips = await prisma.newsTip.findMany({
    where: { dismissed: false, articleId: null },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tips });
}
