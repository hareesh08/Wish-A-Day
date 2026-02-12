import { useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface MusicToggleProps {
  isMuted: boolean;
  onToggle: () => void;
  volume?: number;
  onVolumeChange?: (v: number) => void;
  className?: string;
}

export function MusicToggle({ isMuted, onToggle, volume = 0.3, onVolumeChange, className }: MusicToggleProps) {
  const [showSlider, setShowSlider] = useState(false);

  const VolumeIcon = isMuted ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      {/* Volume Slider */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 flex items-center",
          showSlider && !isMuted ? "w-24 opacity-100" : "w-0 opacity-0"
        )}
      >
        <Slider
          min={0}
          max={100}
          step={1}
          value={[Math.round(volume * 100)]}
          onValueChange={([v]) => onVolumeChange?.(v / 100)}
          className="w-20"
        />
      </div>

      {/* Mute/Unmute Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          "w-10 h-10 rounded-full",
          "bg-black/30 backdrop-blur-sm text-white",
          "hover:bg-black/50 transition-all",
          !isMuted && "ring-2 ring-white/30 animate-pulse"
        )}
        aria-label={isMuted ? "Unmute music" : "Mute music"}
      >
        <VolumeIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}
