import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full w-9 h-9 border border-border bg-card/50 hover:bg-accent transition-all duration-300"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-primary animate-in fade-in zoom-in duration-500" />
      ) : (
        <Moon className="h-4 w-4 text-primary animate-in fade-in zoom-in duration-500" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
