import sanitizeHtml from "sanitize-html";

/**
 * Renser HTML fra rik tekst-editoren før den lagres. Kun de formaterings-
 * mulighetene verktøylinjen faktisk tilbyr er tillatt - alt annet (script,
 * iframe, stiler osv.) fjernes. Kjøres alltid server-side, siden dette
 * innholdet vises offentlig via dangerouslySetInnerHTML.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "strong", "em", "ul", "ol", "li", "a", "br"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
  });
}

/** Fjerner all HTML-markup - brukes når ren tekst trengs (f.eks. i teaser-prompten til Claude). */
export function stripHtml(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
}
