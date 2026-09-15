import { NextRequest, NextResponse } from "next/server";
import { findWeeklyNewsTips, saveNewsTips } from "@/lib/newsTips";

// Må kjøre på nytt hver gang - ellers kan Next.js statisk bufre svaret i
// stedet for å faktisk søke etter nye tips ved hver cron-utløsning.
export const dynamic = "force-dynamic";

/**
 * Trigges av Vercel Cron hver torsdag (se "crons" i vercel.json).
 * Beskyttet med CRON_SECRET slik at ikke hvem som helst kan trigge dyre
 * Claude-kall ved å besøke URL-en direkte.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 401 });
    }
  }

  try {
    const rawTips = await findWeeklyNewsTips();
    const saved = await saveNewsTips(rawTips);
    return NextResponse.json({ found: rawTips.length, saved });
  } catch (err) {
    console.error("Feil i ukentlig nyhetstips-jobb:", err);
    return NextResponse.json({ error: "Kunne ikke hente nyhetstips." }, { status: 502 });
  }
}
