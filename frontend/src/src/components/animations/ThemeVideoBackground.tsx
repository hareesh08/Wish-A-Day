import { useState, useEffect, useRef } from "react";
import { WishTheme } from "@/components/ThemeSelector";
import { cn } from "@/lib/utils";

// Import theme-specific videos
import birthdayVideo from "@/assets/videos/birthday_1.mp4";
import marriageVideo from "@/assets/videos/marriage_1.mp4";
import valentineVideo from "@/assets/videos/valentine_1.mp4";
import celebrationVideo from "@/assets/videos/celebration_1.mp4";

interface ThemeVideoBackgroundProps {
  theme: WishTheme;
  isActive: boolean;
  className?: string;
}

// Map themes to their respective videos
const themeVideoMap: Partial<Record<WishTheme, string>> = {
  birthday: birthdayVideo,
  wedding: marriageVideo,
  love: valentineVideo,
  valentine: valentineVideo,
  celebration: celebrationVideo,
  congratulations: celebrationVideo,
  festival: celebrationVideo,
  event: celebrationVideo,
  appreciation: celebrationVideo,
  default: celebrationVideo,
};

export function ThemeVideoBackground({ 
  theme, 
  isActive,
  className 
}: ThemeVideoBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const videoSrc = themeVideoMap[theme] || celebrationVideo;

  useEffect(() => {
    if (isActive && isLoaded) {
      // Slight delay before showing video for dramatic entrance
      const timer = setTimeout(() => setShowVideo(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, isLoaded]);

  useEffect(() => {
    if (videoRef.current && isActive) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked, that's okay
        console.log("Video autoplay was prevented");
      });
    }
  }, [isActive, videoSrc]);

  return (
    <div className={cn(
      "absolute inset-0 overflow-hidden z-0",
      className
    )}>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />
      
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />
      
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoSrc}
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          "transition-opacity duration-1000",
          showVideo ? "opacity-60" : "opacity-0"
        )}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setIsLoaded(true)}
      />
      
      {/* Animated gradient overlay that syncs with theme */}
      <div 
        className={cn(
          "absolute inset-0 z-20 mix-blend-overlay",
          "bg-gradient-to-br from-primary/20 via-transparent to-accent/20",
          "animate-gradient-shift"
        )}
      />
    </div>
  );
}
