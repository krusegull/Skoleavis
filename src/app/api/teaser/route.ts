import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/apiAuth";
import { stripHtml } from "@/lib/sanitize";

const teaserRequestSchema = z.object({
  title: z.string().min(1).max(200),
  ingress: z.string().min(1).max(500),
  body: z.string().min(1).max(20000),
  previousTeaser: z.string().max(300).optional(),
});

/**
 * "Foreslå teaser": serverside-kall til Claude. Nøkkelen leses kun fra
 * miljøvariabelen ANTHROPIC_API_KEY og sendes aldri til klienten.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Teaser-forslag er ikke satt opp på denne installasjonen." },
      { status: 503 }
    );
  }

  const parsed = teaserRequestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, ingress, body, previousTeaser } = parsed.data;

  const prompt = [
    "Du hjelper elevredaksjonen i en skoleavis med å skrive en kort, fengende teaser-tekst",
    "til en sak. Teaseren skal friste til å lese saken, være maks 2 setninger,",
    "og passe stilen til en ungdomsskole-/videregåendeavis - engasjerende, men ikke klikkfiske.",
    "Svar KUN med selve teaser-teksten, uten anførselstegn og uten forklaring.",
    "",
    `Tittel: ${title}`,
    `Ingress: ${ingress}`,
    `Brødtekst: ${stripHtml(body).slice(0, 4000)}`,
    previousTeaser ? `Tidligere forslag som ikke fungerte: ${previousTeaser}. Foreslå noe annet.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API-feil:", errText);
      return NextResponse.json({ error: "Kunne ikke hente teaser-forslag akkurat nå." }, { status: 502 });
    }

    const data = await response.json();
    const teaser = data?.content?.[0]?.text?.trim() ?? "";

    return NextResponse.json({ teaser });
  } catch (err) {
    console.error("Feil ved kall til Anthropic:", err);
    return NextResponse.json({ error: "Kunne ikke hente teaser-forslag akkurat nå." }, { status: 502 });
  }
}
