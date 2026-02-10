import { cn } from "@/lib/utils";
import { Sparkles, Heart, PartyPopper, Star, Cake, Gift, Flower2, Music, Calendar, Award, HeartHandshake } from "lucide-react";
export type WishTheme = "default" | "birthday" | "love" | "celebration" | "wedding" | "valentine" | "congratulations" | "appreciation" | "festival" | "event";
interface ThemeSelectorProps {
  value: WishTheme;
  onChange: (theme: WishTheme) => void;
}
const themes: {
  value: WishTheme;
  label: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}[] = [{
  value: "default",
  label: "Default",
  icon: Sparkles
}, {
  value: "birthday",
  label: "Birthday",
  icon: PartyPopper
}, {
  value: "love",
  label: "Love",
  icon: Heart
}, {
  value: "celebration",
  label: "Celebration",
  icon: Star
}, {
  value: "wedding",
  label: "Wedding",
  icon: Flower2
}, {
  value: "valentine",
  label: "Valentine",
  icon: HeartHandshake
}, {
  value: "congratulations",
  label: "Congrats",
  icon: Award
}, {
  value: "appreciation",
  label: "Thanks",
  icon: Gift
}, {
  value: "festival",
  label: "Festival",
  icon: Music
}, {
  value: "event",
  label: "Event",
  icon: Calendar
}];
export function ThemeSelector({
  value,
  onChange
}: ThemeSelectorProps) {
  return <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
      {themes.map(theme => {
      const Icon = theme.icon;
      const isSelected = value === theme.value;
      return <button key={theme.value} type="button" onClick={() => onChange(theme.value)} className={cn(`theme-${theme.value}`, "group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 overflow-hidden", isSelected ? "border-primary shadow-soft scale-[1.02] ring-2 ring-primary/20" : "border-transparent hover:border-border hover:scale-[1.01] bg-card/50")}>
            {/* Theme gradient background */}
            <div className={cn("absolute inset-0 theme-gradient transition-opacity duration-300", isSelected ? "opacity-25" : "opacity-0 group-hover:opacity-10")} />
            
            <div className={cn("relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200", isSelected ? "theme-gradient text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground group-hover:bg-secondary")}>
              <Icon className="w-4 h-4 border border-solid border-primary-foreground rounded-sm shadow-none opacity-95 text-slate-950" />
            </div>
            <span className={cn("relative z-10 text-[11px] font-medium transition-colors text-center leading-tight", isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
              {theme.label}
            </span>
            {isSelected && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />}
          </button>;
    })}
    </div>;
}