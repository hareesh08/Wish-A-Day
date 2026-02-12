import { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimationControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onReplay?: () => void;
  onSkip?: () => void;
  showReplay?: boolean;
  showSkip?: boolean;
  className?: string;
}

export const AnimationControls = ({
  isMuted,
  onToggleMute,
  onReplay,
  onSkip,
  showReplay = true,
  showSkip = true,
  className,
}: AnimationControlsProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[200] flex flex-col gap-2",
      "animate-fade-in",
      className
    )}>
      {/* Sound Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleMute}
        className={cn(
          "w-12 h-12 rounded-full backdrop-blur-md",
          "bg-background/80 border-primary/20",
          "hover:bg-primary/10 hover:border-primary/40",
          "transition-all duration-300 shadow-lg",
          "group"
        )}
        title={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        ) : (
          <Volume2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
        )}
      </Button>
      
      {/* Replay Button */}
      {showReplay && onReplay && (
        <Button
          variant="outline"
          size="icon"
          onClick={onReplay}
          className={cn(
            "w-12 h-12 rounded-full backdrop-blur-md",
            "bg-background/80 border-primary/20",
            "hover:bg-primary/10 hover:border-primary/40",
            "transition-all duration-300 shadow-lg",
            "group"
          )}
          title="Replay animation"
        >
          <RotateCcw className="w-5 h-5 text-primary group-hover:rotate-[-360deg] transition-transform duration-500" />
        </Button>
      )}
      
      {/* Skip Button */}
      {showSkip && onSkip && (
        <Button
          variant="outline"
          size="icon"
          onClick={onSkip}
          className={cn(
            "w-12 h-12 rounded-full backdrop-blur-md",
            "bg-background/80 border-primary/20",
            "hover:bg-primary/10 hover:border-primary/40",
            "transition-all duration-300 shadow-lg",
            "group"
          )}
          title="Skip animation"
        >
          <SkipForward className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Button>
      )}
      
      {/* Reduced Motion Indicator */}
      {prefersReducedMotion && (
        <div className={cn(
          "px-3 py-2 rounded-full backdrop-blur-md",
          "bg-background/80 border border-primary/20",
          "text-xs text-muted-foreground",
          "flex items-center gap-1.5"
        )}>
          <Sparkles className="w-3 h-3" />
          <span>Reduced motion</span>
        </div>
      )}
    </div>
  );
};
