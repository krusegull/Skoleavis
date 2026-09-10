// Ingen server-only avhengigheter her - denne brukes fra både klient- og
// servertkomponenter (skjemaenes initial-verdi, og render-fallback for
// innhold lagret før rik tekst-editoren fantes).

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Konverterer eldre innhold lagret som ren tekst (avsnitt skilt med blanke
 * linjer, fra før rik tekst-editoren fantes) til HTML, slik at det vises og
 * kan redigeres riktig. Gjør ingenting dersom teksten allerede er HTML.
 */
export function ensureRichTextHtml(text: string): string {
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
