import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface WishDayBrandingProps {
  variant?: "watermark" | "badge" | "footer";
  className?: string;
  showTagline?: boolean;
}

export function WishDayBranding({ 
  variant = "watermark", 
  className,
  showTagline = false 
}: WishDayBrandingProps) {
  if (variant === "watermark") {
    return (
      <div className={cn(
        "fixed bottom-4 right-4 z-50",
        "flex items-center gap-2 px-3 py-2",
        "rounded-full backdrop-blur-md",
        "bg-black/20 border border-white/10",
        "shadow-lg shadow-black/20",
        "animate-fade-in",
        className
      )}>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-white/90 tracking-wide">
          WishDay
        </span>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-4 py-2",
        "rounded-xl backdrop-blur-md",
        "bg-gradient-to-r from-primary/20 to-accent/20",
        "border border-primary/30",
        "shadow-soft",
        className
      )}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-soft">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-foreground tracking-wide">
            WishDay
          </span>
          {showTagline && (
            <span className="text-[10px] text-muted-foreground -mt-0.5">
              Make wishes magical ✨
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={cn(
        "flex flex-col items-center gap-2 py-4",
        className
      )}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-wide">
            WishDay
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Create and share beautiful wishes with your loved ones
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
          <span>Made with</span>
          <span className="text-primary">❤️</span>
          <span>wishaday.hareeshworks.in</span>
        </div>
      </div>
    );
  }

  return null;
}

// Share card with branding for social media
export function ShareCardBranding({ className }: { className?: string }) {
  return (
    <div className={cn(
      "absolute bottom-0 left-0 right-0 z-30",
      "p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">WishDay</span>
            <span className="text-[10px] text-white/60">wishaday.hareeshworks.in</span>
          </div>
        </div>
        <span className="text-xs text-white/50">Create your own wish ✨</span>
      </div>
    </div>
  );
}
