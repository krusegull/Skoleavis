"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { buildGrid, type CrosswordWordInput } from "@/lib/crossword";

type CrosswordWithWords = {
  id: string;
  title: string;
  intro: string | null;
  isOpen: boolean;
  words: { answer: string; clue: string; row: number; col: number; direction: string }[];
};

const emptyWordDraft = { answer: "", clue: "", row: "0", col: "0", direction: "A" as "A" | "D" };

export function CrosswordAdminPanel({ crosswords }: { crosswords: CrosswordWithWords[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [words, setWords] = useState<CrosswordWordInput[]>([]);
  const [draft, setDraft] = useState(emptyWordDraft);
  const [bulkText, setBulkText] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { grid, conflicts } = useMemo(() => buildGrid(words), [words]);

  const rows = grid.size > 0 ? Array.from(grid.keys()).map((k) => Number(k.split(",")[0])) : [0];
  const cols = grid.size > 0 ? Array.from(grid.keys()).map((k) => Number(k.split(",")[1])) : [0];
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);

  function addWord() {
    if (!draft.answer.trim() || !draft.clue.trim()) {
      setError("Fyll ut både ord og ledetråd.");
      return;
    }
    setError(null);
    setWords((prev) => [
      ...prev,
      {
        answer: draft.answer.trim().toUpperCase(),
        clue: draft.clue.trim(),
        row: Number(draft.row) || 0,
        col: Number(draft.col) || 0,
        direction: draft.direction,
      },
    ]);
    setDraft(emptyWordDraft);
  }

  function removeWord(index: number) {
    setWords((prev) => prev.filter((_, i) => i !== index));
  }

  /** Lim inn flere ord på én gang, ett per linje: ORD|LEDETRÅD|RAD|KOLONNE|RETNING (A/D). */
  function importBulk() {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsed: CrosswordWordInput[] = [];
    const badLines: string[] = [];

    for (const line of lines) {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length !== 5) {
        badLines.push(line);
        continue;
      }
      const [answer, clue, rowStr, colStr, dir] = parts;
      const row = Number(rowStr);
      const col = Number(colStr);
      if (!answer || !clue || Number.isNaN(row) || Number.isNaN(col) || (dir !== "A" && dir !== "D")) {
        badLines.push(line);
        continue;
      }
      parsed.push({ answer: answer.toUpperCase(), clue, row, col, direction: dir });
    }

    if (badLines.length > 0) {
      setError(`Kunne ikke lese ${badLines.length} linje(r). Format: ORD|LEDETRÅD|RAD|KOLONNE|A-eller-D`);
      return;
    }
    if (parsed.length === 0) return;

    setError(null);
    setWords((prev) => [...prev, ...parsed]);
    setBulkText("");
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setIntro("");
    setWords([]);
    setDraft(emptyWordDraft);
    setError(null);
  }

  function startEdit(cw: CrosswordWithWords) {
    setEditingId(cw.id);
    setTitle(cw.title);
    setIntro(cw.intro ?? "");
    setWords(cw.words.map((w) => ({ answer: w.answer, clue: w.clue, row: w.row, col: w.col, direction: w.direction as "A" | "D" })));
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!title.trim() || words.length === 0) {
      setError("Skriv en tittel og legg til minst ett ord.");
      return;
    }
    if (conflicts.length > 0) {
      setError("Noen ord krysser hverandre feil - se rød markering i forhåndsvisningen under.");
      return;
    }

    setSaving(true);
    setError(null);
    const payload = { title: title.trim(), intro: intro.trim() || null, words };
    const res = await fetch(editingId ? `/api/crosswords/${editingId}` : "/api/crosswords", {
      method: editingId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Kunne ikke lagre kryssordet.");
      return;
    }
    resetForm();
    router.refresh();
  }

  async function toggleOpen(id: string, isOpen: boolean) {
    setBusyId(id);
    await fetch(`/api/crosswords/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isOpen: !isOpen }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Slette dette kryssordet permanent?")) return;
    setBusyId(id);
    await fetch(`/api/crosswords/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (editingId === id) resetForm();
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="border border-ink/20 p-5">
        <h2 className="font-headline text-xl font-bold text-ink">{editingId ? "Rediger kryssord" : "Nytt kryssord"}</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-muted">Tittel</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="F.eks. Stuanytt sitt julekryssord"
              className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-sans text-xs uppercase tracking-wide text-muted">Intro (valgfri)</label>
            <input
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-serif text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div className="border-t border-ink/10 pt-3">
            <p className="font-sans text-xs uppercase tracking-wide text-muted">
              Lim inn flere ord på én gang (valgfritt, ett per linje)
            </p>
            <p className="mt-1 font-serif text-xs text-muted">
              Format: ORD|LEDETRÅD|RAD|KOLONNE|A-eller-D - f.eks. JULENISSE|Han kommer med gaver 24.
              desember|0|5|D
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={4}
              placeholder={"JULENISSE|Han kommer med gaver 24. desember|0|5|D\nJULETRE|Pyntes med stjerne og kuler i stua|0|5|A"}
              className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 font-mono text-xs text-ink focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={importBulk}
              disabled={!bulkText.trim()}
              className="mt-2 border border-ink px-3 py-1.5 font-sans text-xs uppercase tracking-wide hover:bg-ink hover:text-paper disabled:opacity-50"
            >
              Importer liste
            </button>
          </div>

          <div className="border-t border-ink/10 pt-3">
            <p className="font-sans text-xs uppercase tracking-wide text-muted">
              ...eller legg til ord ett om gangen (rad/kolonne er 0-indeksert)
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <div>
                <label className="block font-sans text-xs text-muted">Ord</label>
                <input
                  value={draft.answer}
                  onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
                  className="w-32 border border-ink/30 bg-white px-2 py-1 font-serif text-sm uppercase"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-muted">Ledetråd</label>
                <input
                  value={draft.clue}
                  onChange={(e) => setDraft({ ...draft, clue: e.target.value })}
                  className="w-64 border border-ink/30 bg-white px-2 py-1 font-serif text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-muted">Rad</label>
                <input
                  type="number"
                  value={draft.row}
                  onChange={(e) => setDraft({ ...draft, row: e.target.value })}
                  className="w-16 border border-ink/30 bg-white px-2 py-1 font-serif text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-muted">Kolonne</label>
                <input
                  type="number"
                  value={draft.col}
                  onChange={(e) => setDraft({ ...draft, col: e.target.value })}
                  className="w-16 border border-ink/30 bg-white px-2 py-1 font-serif text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-muted">Retning</label>
                <select
                  value={draft.direction}
                  onChange={(e) => setDraft({ ...draft, direction: e.target.value as "A" | "D" })}
                  className="border border-ink/30 bg-white px-2 py-1 font-serif text-sm"
                >
                  <option value="A">Vannrett</option>
                  <option value="D">Loddrett</option>
                </select>
              </div>
              <button
                type="button"
                onClick={addWord}
                className="border border-ink px-3 py-1.5 font-sans text-xs uppercase tracking-wide hover:bg-ink hover:text-paper"
              >
                Legg til ord
              </button>
            </div>

            {words.length > 0 && (
              <ul className="mt-3 space-y-1">
                {words.map((w, i) => (
                  <li key={i} className="flex items-center justify-between border border-ink/20 bg-white px-3 py-1.5 text-sm">
                    <span className="font-serif text-ink">
                      {w.answer} <span className="text-muted">({w.direction === "A" ? "vannrett" : "loddrett"} @ {w.row},{w.col}) - {w.clue}</span>
                    </span>
                    <button type="button" onClick={() => removeWord(i)} className="font-sans text-xs text-muted hover:text-accent">
                      Fjern
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {words.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <p className="font-sans text-xs uppercase tracking-wide text-muted">
                  Forhåndsvisning {conflicts.length > 0 && <span className="text-accent">- {conflicts.length} kryss stemmer ikke!</span>}
                </p>
                <div
                  className="mt-1 grid w-max"
                  style={{ gridTemplateColumns: `repeat(${maxCol - minCol + 1}, 24px)` }}
                >
                  {Array.from({ length: maxRow - minRow + 1 }).map((_, ri) =>
                    Array.from({ length: maxCol - minCol + 1 }).map((_, ci) => {
                      const r = minRow + ri;
                      const c = minCol + ci;
                      const letter = grid.get(`${r},${c}`);
                      const hasConflict = conflicts.some((cf) => cf.row === r && cf.col === c);
                      return (
                        <div
                          key={`${r},${c}`}
                          className={`flex h-6 w-6 items-center justify-center border text-xs font-bold ${
                            letter ? (hasConflict ? "border-accent bg-accent/30" : "border-ink/40 bg-white") : "border-transparent"
                          }`}
                        >
                          {letter ?? ""}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {error && <p className="font-sans text-sm text-accent">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="border border-accent bg-accent px-4 py-2 font-sans text-sm uppercase tracking-wide text-paper hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Lagrer…" : editingId ? "Lagre endringer" : "Opprett kryssord"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-ink/30 px-4 py-2 font-sans text-sm uppercase tracking-wide text-muted hover:border-accent hover:text-accent"
              >
                Avbryt redigering
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-headline text-xl font-bold text-ink">Eksisterende kryssord</h2>
        {crosswords.length === 0 && <p className="mt-2 font-serif text-muted">Ingen kryssord ennå.</p>}
        <ul className="mt-3 divide-y divide-ink/20">
          {crosswords.map((cw) => (
            <li key={cw.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-sans text-xs uppercase tracking-wide text-muted">
                  {cw.isOpen ? "Åpen" : "Stengt"} · {cw.words.length} ord
                </p>
                <p className="mt-1 font-headline text-lg font-bold text-ink">{cw.title}</p>
              </div>
              <div className="flex shrink-0 gap-2 font-sans text-xs uppercase tracking-wide">
                <button
                  onClick={() => startEdit(cw)}
                  className="border border-ink px-3 py-1 hover:bg-ink hover:text-paper"
                >
                  Rediger
                </button>
                <button
                  disabled={busyId === cw.id}
                  onClick={() => toggleOpen(cw.id, cw.isOpen)}
                  className="border border-ink px-3 py-1 hover:bg-ink hover:text-paper disabled:opacity-50"
                >
                  {cw.isOpen ? "Steng" : "Åpne"}
                </button>
                <button
                  disabled={busyId === cw.id}
                  onClick={() => remove(cw.id)}
                  className="border border-ink/30 px-3 py-1 text-muted hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  Slett
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
