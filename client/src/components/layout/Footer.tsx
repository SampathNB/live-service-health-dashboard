export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background px-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            System Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
