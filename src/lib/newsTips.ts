import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

const VALID_CATEGORIES = new Set(Object.values(Category));

type RawTip = {
  title?: unknown;
  summary?: unknown;
  sourceUrl?: unknown;
  sourceName?: unknown;
  category?: unknown;
};

/**
 * Finner den ferdige JSON-listen i Claudes svar. Modellen resonnerer og
 * søker underveis, så selve JSON-en kommer typisk til slutt i responsen,
 * omgitt av litt annen tekst - vi plukker ut det som står mellom første
 * `[` og siste `]`.
 */
function extractJsonArray(text: string): RawTip[] {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Kaller Claude med web-søk-verktøyet for å finne nyhetstips fra den siste
 * uken - med vekt på Stovner/Østkanten i Oslo, samt store nasjonale
 * nyheter. Returnerer KUN forslag til vinkling + kilde, aldri ferdig
 * artikkeltekst, siden vi ikke har lov til å gjengi andres journalistikk.
 */
export async function findWeeklyNewsTips(): Promise<RawTip[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const prompt = [
    "Du hjelper redaksjonen i skoleavisen Stuanytt (Haugenstua skole, Stovner",
    "bydel, Østkanten i Oslo) med å finne nyhetstips fra den siste uken.",
    "",
    "Søk på nettet etter aktuelle, troverdige nyhetssaker fra siste 7 dager som",
    "er relevante for elever på en barne-/ungdomsskole på Østkanten i Oslo.",
    "Prioriter i denne rekkefølgen:",
    "1. Lokale saker fra Stovner/Groruddalen/Østkanten i Oslo",
    "2. Store, viktige nasjonale nyheter elever bør kjenne til",
    "",
    "Bruk kun etablerte, troverdige norske nyhetskilder (f.eks. NRK, Aftenposten,",
    "VG, Dagsavisen, Groruddalen.no, Oslo kommunes egne sider, lokalaviser).",
    "",
    "Finn 5-8 saker. For hver sak: skriv et KORT, ORIGINALT forslag til vinkling",
    "for skoleavisen - ikke gjengi eller oppsummer originalartikkelen i detalj,",
    "bare gi nok til at en elev skjønner hva saken handler om og kan skrive sin",
    "egen sak om temaet. Foreslå aldri ferdig brødtekst.",
    "",
    "Svar til slutt KUN med en JSON-liste, uten noe annet etter den, i dette",
    "eksakte formatet:",
    '[{"title": "Kort forslag til tittel", "summary": "1-2 setninger om hvorfor dette er en aktuell sak og en mulig vinkling for en elevreporter", "sourceUrl": "https://...", "sourceName": "Navn på kilden", "category": "NEWS"}]',
    "",
    "category skal være én av: NEWS, REPORTAGE, INTERVIEW, REVIEW, SPORT, CULTURE.",
  ].join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_TIPS_MODEL || "claude-sonnet-5",
      max_tokens: 3000,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 8 }],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    console.error("Anthropic API-feil (nyhetstips):", await response.text());
    return [];
  }

  const data = await response.json();
  const text = (data?.content ?? [])
    .filter((block: { type: string }) => block.type === "text")
    .map((block: { text: string }) => block.text)
    .join("\n");

  return extractJsonArray(text);
}

/** Lagrer nye tips i databasen. Hopper stille over tips med URL vi allerede har. */
export async function saveNewsTips(rawTips: RawTip[]): Promise<number> {
  let saved = 0;
  for (const tip of rawTips) {
    if (typeof tip.title !== "string" || typeof tip.summary !== "string" || typeof tip.sourceUrl !== "string") {
      continue;
    }
    const category =
      typeof tip.category === "string" && VALID_CATEGORIES.has(tip.category as Category)
        ? (tip.category as Category)
        : null;

    try {
      await prisma.newsTip.create({
        data: {
          title: tip.title.slice(0, 200),
          summary: tip.summary.slice(0, 1000),
          sourceUrl: tip.sourceUrl,
          sourceName: typeof tip.sourceName === "string" ? tip.sourceName.slice(0, 120) : null,
          category,
        },
      });
      saved += 1;
    } catch {
      // Unik constraint på sourceUrl - vi har allerede dette tipset, hopp over.
    }
  }
  return saved;
}
