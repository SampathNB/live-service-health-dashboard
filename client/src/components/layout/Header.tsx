import { ThemeToggle } from '@/components';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-xl leading-none">S</span>
            </div>
            <div className="text-xl font-bold tracking-tight text-foreground hidden sm:block">Service Monitor</div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#" className="nav-link text-primary bg-accent/50">Overview</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div data-tooltip="Toggle Appearance">
            <ThemeToggle />
          </div>
          <div className="h-8 w-px bg-border mx-2" />
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-semibold">Operator One</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Super Admin</span>
            </div>
            <div 
              className="w-9 h-9 rounded-full border border-border bg-muted flex items-center justify-center text-xs font-bold text-primary shadow-sm overflow-hidden cursor-help"
              data-tooltip="View Profile"
            >
              OP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
