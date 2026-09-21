type OptionResult = { id: string; label: string; votes: number };

export function PollResults({ options }: { options: OptionResult[] }) {
  const total = options.reduce((sum, o) => sum + o.votes, 0);
  const sorted = [...options].sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-2">
      {sorted.map((option) => {
        const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0;
        return (
          <div key={option.id}>
            <div className="flex items-center justify-between font-sans text-sm">
              <span>{option.label}</span>
              <span className="text-muted">
                {option.votes} {option.votes === 1 ? "stemme" : "stemmer"} ({pct} %)
              </span>
            </div>
            <div className="mt-1 h-2 w-full bg-ink/10">
              <div className="h-2 bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      <p className="mt-2 font-sans text-xs uppercase tracking-wide text-muted">
        {total} {total === 1 ? "stemme" : "stemmer"} totalt
      </p>
    </div>
  );
}
