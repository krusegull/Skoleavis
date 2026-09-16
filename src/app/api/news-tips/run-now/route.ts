import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { findWeeklyNewsTips, saveNewsTips } from "@/lib/newsTips";

// Samme jobb som cron-ruta, men trigget manuelt av en innlogget Redaktør/Admin
// i stedet for CRON_SECRET - så man slipper å vente til torsdag for å teste.
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  try {
    const rawTips = await findWeeklyNewsTips();
    const saved = await saveNewsTips(rawTips);
    return NextResponse.json({ found: rawTips.length, saved });
  } catch (err) {
    console.error("Feil ved manuelt nyhetstips-søk:", err);
    return NextResponse.json({ error: "Kunne ikke hente nyhetstips." }, { status: 502 });
  }
}
