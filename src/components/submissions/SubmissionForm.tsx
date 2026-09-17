"use client";

import { useRef, useState } from "react";
import { isClientUploadConfigured, uploadFileFromBrowser } from "@/lib/clientUpload";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGES = 5;

const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text";

export function SubmissionForm() {
  const documentInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!isClientUploadConfigured()) {
    return (
      <p className="font-serif text-muted">
        Innsending av bidrag er ikke satt opp på denne installasjonen ennå. Ta kontakt med
        redaksjonen direkte i mellomtiden.
      </p>
    );
  }

  if (done) {
    return (
      <div className="border border-ink bg-ink/5 px-4 py-6">
        <p className="font-headline text-xl font-bold text-ink">Takk for bidraget!</p>
        <p className="mt-2 font-serif text-ink/80">
          Redaksjonen har mottatt det du sendte inn, og tar kontakt hvis vi trenger mer
          informasjon.
        </p>
      </div>
    );
  }

  function handleDocumentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) {
      setDocumentFile(null);
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setError("Dokumentet er for stort (maks 10 MB).");
      if (documentInputRef.current) documentInputRef.current.value = "";
      return;
    }
    setDocumentFile(file);
  }

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setError(null);
    if (files.length > MAX_IMAGES) {
      setError(`Du kan laste opp maks ${MAX_IMAGES} bilder.`);
      if (imagesInputRef.current) imagesInputRef.current.value = "";
      return;
    }
    const tooLarge = files.find((f) => f.size > MAX_IMAGE_BYTES);
    if (tooLarge) {
      setError(`Bildet "${tooLarge.name}" er for stort (maks 5 MB per bilde).`);
      if (imagesInputRef.current) imagesInputRef.current.value = "";
      return;
    }
    setImageFiles(files);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Fyll ut navn.");
      return;
    }
    if (!documentFile) {
      setError("Last opp et dokument (Word, PDF e.l.) med teksten din.");
      return;
    }

    setSending(true);
    try {
      const document = await uploadFileFromBrowser(documentFile, "innsendinger/dokumenter");
      const images = await Promise.all(imageFiles.map((f) => uploadFileFromBrowser(f, "innsendinger/bilder")));

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          documentUrl: document.url,
          documentName: document.name,
          imageUrls: images.map((img) => img.url),
          website,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Kunne ikke sende inn bidraget. Prøv igjen.");
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke sende inn bidraget. Prøv igjen.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">Navn</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">
          E-post (valgfritt - så redaksjonen kan svare deg)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">
          Melding til redaksjonen (valgfritt)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">
          Dokument med teksten din (Word, PDF e.l., maks 10 MB)
        </label>
        <input
          ref={documentInputRef}
          type="file"
          accept={DOCUMENT_ACCEPT}
          onChange={handleDocumentChange}
          required
          className="mt-1 block w-full font-serif text-sm text-ink"
        />
      </div>

      <div>
        <label className="block font-sans text-xs uppercase tracking-wide text-muted">
          Bilder (valgfritt, maks {MAX_IMAGES} stk, 5 MB per bilde)
        </label>
        <input
          ref={imagesInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          className="mt-1 block w-full font-serif text-sm text-ink"
        />
      </div>

      {/* Honeypot - skjult for ekte brukere, fylles ofte ut av roboter */}
      <div className="hidden" aria-hidden="true">
        <label>
          La stå tomt
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="font-sans text-sm text-accent">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="border border-accent bg-accent px-4 py-2 font-sans text-sm uppercase tracking-wide text-paper hover:opacity-90 disabled:opacity-50"
      >
        {sending ? "Sender inn…" : "Send inn"}
      </button>
    </form>
  );
}
