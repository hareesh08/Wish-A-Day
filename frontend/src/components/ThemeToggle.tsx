import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem("wishday-theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("wishday-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative w-10 h-10 rounded-full",
        "bg-secondary/50 hover:bg-secondary",
        "transition-all duration-300",
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <Sun className={cn(
        "h-5 w-5 absolute transition-all duration-300",
        theme === "light" 
          ? "opacity-100 rotate-0 scale-100" 
          : "opacity-0 -rotate-90 scale-0"
      )} />
      <Moon className={cn(
        "h-5 w-5 absolute transition-all duration-300",
        theme === "dark" 
          ? "opacity-100 rotate-0 scale-100" 
          : "opacity-0 rotate-90 scale-0"
      )} />
    </Button>
  );
}
