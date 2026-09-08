export function Footer() {
  return (
    <footer className="mt-16 border-t-4 border-ink bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center font-sans text-xs uppercase tracking-wide text-muted">
        <p>Skoleavisen · Utgitt av elevredaksjonen</p>
        <p className="mt-1">© {new Date().getFullYear()} Skoleavisen</p>
      </div>
    </footer>
  );
}
