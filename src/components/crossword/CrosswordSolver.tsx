"use client";

import { useMemo, useRef, useState } from "react";
import type { PublicShape } from "@/lib/crossword";

const CELL = 34;

export function CrosswordSolver({ crosswordId, shape }: { crosswordId: string; shape: PublicShape }) {
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [correctness, setCorrectness] = useState<Record<string, boolean> | null>(null);
  const [checking, setChecking] = useState(false);
  const [solved, setSolved] = useState(false);
  const [activeDirection, setActiveDirection] = useState<"A" | "D">("A");
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const cellSet = useMemo(() => new Set(shape.cells.map((c) => `${c.row},${c.col}`)), [shape.cells]);
  const numberByCell = useMemo(() => {
    const m = new Map<string, number>();
    shape.cells.forEach((c) => {
      if (c.number != null) m.set(`${c.row},${c.col}`, c.number);
    });
    return m;
  }, [shape.cells]);

  const ncols = shape.maxCol - shape.minCol + 1;
  const nrows = shape.maxRow - shape.minRow + 1;

  function focusCell(row: number, col: number) {
    inputRefs.current.get(`${row},${col}`)?.focus();
  }

  function nextCell(row: number, col: number, dir: "A" | "D", delta: number) {
    const r = dir === "D" ? row + delta : row;
    const c = dir === "A" ? col + delta : col;
    return cellSet.has(`${r},${c}`) ? { r, c } : null;
  }

  function handleChange(row: number, col: number, value: string) {
    const letter = value.slice(-1).toUpperCase();
    setGuesses((prev) => ({ ...prev, [`${row},${col}`]: letter }));
    setCorrectness(null);
    if (letter) {
      const next = nextCell(row, col, activeDirection, 1);
      if (next) focusCell(next.r, next.c);
    }
  }

  function handleKeyDown(row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !guesses[`${row},${col}`]) {
      const prev = nextCell(row, col, activeDirection, -1);
      if (prev) focusCell(prev.r, prev.c);
      return;
    }
    if (e.key === "ArrowRight") {
      const n = nextCell(row, col, "A", 1);
      if (n) {
        setActiveDirection("A");
        focusCell(n.r, n.c);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      const n = nextCell(row, col, "A", -1);
      if (n) {
        setActiveDirection("A");
        focusCell(n.r, n.c);
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      const n = nextCell(row, col, "D", 1);
      if (n) {
        setActiveDirection("D");
        focusCell(n.r, n.c);
      }
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      const n = nextCell(row, col, "D", -1);
      if (n) {
        setActiveDirection("D");
        focusCell(n.r, n.c);
      }
      e.preventDefault();
    }
  }

  function focusClue(number: number, direction: "A" | "D") {
    const cell = shape.cells.find((c) => c.number === number);
    if (!cell) return;
    setActiveDirection(direction);
    focusCell(cell.row, cell.col);
  }

  async function handleCheck() {
    setChecking(true);
    try {
      const res = await fetch(`/api/crosswords/${crosswordId}/check`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guesses }),
      });
      const data = await res.json();
      setCorrectness(data.correct);
      setSolved(Boolean(data.allCorrect));
    } finally {
      setChecking(false);
    }
  }

  const across = shape.clues.filter((c) => c.direction === "A");
  const down = shape.clues.filter((c) => c.direction === "D");

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="overflow-x-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${ncols}, ${CELL}px)`,
            gridTemplateRows: `repeat(${nrows}, ${CELL}px)`,
          }}
        >
          {Array.from({ length: nrows }).map((_, ri) =>
            Array.from({ length: ncols }).map((_, ci) => {
              const row = shape.minRow + ri;
              const col = shape.minCol + ci;
              const key = `${row},${col}`;
              if (!cellSet.has(key)) {
                return <div key={key} className="bg-ink/10" style={{ width: CELL, height: CELL }} />;
              }
              const number = numberByCell.get(key);
              const isWrong = correctness && correctness[key] === false;
              const isRight = correctness && correctness[key] === true;
              return (
                <div key={key} className="relative" style={{ width: CELL, height: CELL }}>
                  {number != null && (
                    <span className="pointer-events-none absolute left-0.5 top-0 font-sans text-[8px] text-muted">
                      {number}
                    </span>
                  )}
                  <input
                    ref={(el) => {
                      if (el) inputRefs.current.set(key, el);
                    }}
                    data-row={row}
                    data-col={col}
                    value={guesses[key] ?? ""}
                    onChange={(e) => handleChange(row, col, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(row, col, e)}
                    onFocus={() => {
                      const n = nextCell(row, col, "A", 1) || nextCell(row, col, "A", -1);
                      if (!n) setActiveDirection("D");
                    }}
                    maxLength={1}
                    className={`h-full w-full border border-ink/40 text-center font-headline text-lg font-bold uppercase text-ink focus:border-accent focus:outline-none ${
                      isWrong ? "bg-accent/20" : isRight ? "bg-green-100" : "bg-white"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="border border-ink bg-ink px-4 py-2 font-sans text-sm uppercase tracking-wide text-paper hover:opacity-90 disabled:opacity-50"
          >
            {checking ? "Sjekker…" : "Sjekk svar"}
          </button>
          {solved && (
            <span className="font-sans text-sm font-bold text-accent">Riktig! Du løste kryssordet 🎉</span>
          )}
          {correctness && !solved && (
            <span className="font-sans text-sm text-muted">Ikke helt riktig ennå - rød rute betyr feil bokstav.</span>
          )}
        </div>
      </div>

      <div className="font-sans text-sm">
        <h2 className="mb-2 font-headline text-lg font-bold text-ink">VANNRETT</h2>
        <ul className="space-y-1.5">
          {across.map((c) => (
            <li key={`A${c.number}`}>
              <button type="button" onClick={() => focusClue(c.number, "A")} className="text-left hover:text-accent">
                {c.number}. {c.clue}
              </button>
            </li>
          ))}
        </ul>
        <h2 className="mb-2 mt-5 font-headline text-lg font-bold text-ink">LODDRETT</h2>
        <ul className="space-y-1.5">
          {down.map((c) => (
            <li key={`D${c.number}`}>
              <button type="button" onClick={() => focusClue(c.number, "D")} className="text-left hover:text-accent">
                {c.number}. {c.clue}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
