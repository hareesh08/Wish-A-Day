import { ReactNode, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { WishTheme } from "../ThemeSelector";

interface GlassmorphicCardProps {
  children: ReactNode;
  theme: WishTheme;
  className?: string;
  enableParallax?: boolean;
  glowIntensity?: "subtle" | "medium" | "strong";
}

const themeGlowColors: Record<WishTheme, { primary: string; secondary: string }> = {
  default: { primary: "rgba(255, 215, 0, 0.3)", secondary: "rgba(255, 107, 107, 0.2)" },
  birthday: { primary: "rgba(255, 105, 180, 0.3)", secondary: "rgba(78, 205, 196, 0.2)" },
  love: { primary: "rgba(255, 23, 68, 0.3)", secondary: "rgba(255, 182, 193, 0.2)" },
  celebration: { primary: "rgba(255, 215, 0, 0.3)", secondary: "rgba(255, 107, 107, 0.2)" },
  wedding: { primary: "rgba(255, 182, 193, 0.2)", secondary: "rgba(255, 215, 0, 0.15)" },
  valentine: { primary: "rgba(255, 23, 68, 0.3)", secondary: "rgba(255, 105, 180, 0.2)" },
  congratulations: { primary: "rgba(255, 215, 0, 0.35)", secondary: "rgba(255, 165, 0, 0.2)" },
  appreciation: { primary: "rgba(76, 175, 80, 0.3)", secondary: "rgba(129, 199, 132, 0.2)" },
  festival: { primary: "rgba(156, 39, 176, 0.3)", secondary: "rgba(233, 30, 99, 0.2)" },
  event: { primary: "rgba(33, 150, 243, 0.3)", secondary: "rgba(63, 81, 181, 0.2)" },
};

export function GlassmorphicCard({
  children,
  theme,
  className,
  enableParallax = true,
  glowIntensity = "medium",
}: GlassmorphicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

  const glowColors = themeGlowColors[theme];

  const intensityMultiplier = {
    subtle: 0.5,
    medium: 1,
    strong: 1.5,
  }[glowIntensity];

  useEffect(() => {
    if (!enableParallax || !cardRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = cardRef.current!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const maxRotate = 10;
      const rotateY = (mouseX / (rect.width / 2)) * maxRotate;
      const rotateX = -(mouseY / (rect.height / 2)) * maxRotate;
      
      setTransform({
        rotateX: Math.max(-maxRotate, Math.min(maxRotate, rotateX)),
        rotateY: Math.max(-maxRotate, Math.min(maxRotate, rotateY)),
        scale: 1.02,
      });

      // Update glow position
      const glowX = ((e.clientX - rect.left) / rect.width) * 100;
      const glowY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlowPosition({ x: glowX, y: glowY });
    };

    const handleMouseLeave = () => {
      setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
      setGlowPosition({ x: 50, y: 50 });
    };

    const card = cardRef.current;
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enableParallax]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "transition-transform duration-200 ease-out",
        className
      )}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
      }}
    >
      {/* Aurora gradient background */}
      <div 
        className="absolute inset-0 animate-aurora-shift"
        style={{
          background: `
            radial-gradient(ellipse at ${glowPosition.x}% ${glowPosition.y}%, ${glowColors.primary} 0%, transparent 50%),
            radial-gradient(ellipse at ${100 - glowPosition.x}% ${100 - glowPosition.y}%, ${glowColors.secondary} 0%, transparent 50%),
            linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)
          `,
          opacity: intensityMultiplier,
        }}
      />

      {/* Glass layer */}
      <div 
        className="absolute inset-0"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      />

      {/* Subtle border glow */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 ${40 * intensityMultiplier}px ${glowColors.primary}
          `,
        }}
      />

      {/* Dynamic light reflection */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              circle at ${glowPosition.x}% ${glowPosition.y}%,
              rgba(255, 255, 255, ${0.15 * intensityMultiplier}) 0%,
              transparent 40%
            )
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom shadow for depth */}
      <div 
        className="absolute -bottom-4 left-4 right-4 h-8 rounded-full blur-xl opacity-30"
        style={{ backgroundColor: glowColors.primary }}
      />
    </div>
  );
}

// Standalone aurora background component
interface AuroraBackgroundProps {
  theme: WishTheme;
  intensity?: "subtle" | "medium" | "strong";
}

export function AuroraBackground({ theme, intensity = "medium" }: AuroraBackgroundProps) {
  const glowColors = themeGlowColors[theme];
  
  const opacityMap = {
    subtle: 0.3,
    medium: 0.5,
    strong: 0.7,
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary aurora wave */}
      <div 
        className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2 animate-aurora-wave-1"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, ${glowColors.primary} 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, ${glowColors.secondary} 0%, transparent 50%)
          `,
          opacity: opacityMap[intensity],
        }}
      />

      {/* Secondary aurora wave */}
      <div 
        className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2 animate-aurora-wave-2"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 60% 30%, ${glowColors.secondary} 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 30% 70%, ${glowColors.primary} 0%, transparent 50%)
          `,
          opacity: opacityMap[intensity] * 0.7,
        }}
      />

      {/* Shimmer overlay */}
      <div 
        className="absolute inset-0 animate-shimmer-slow"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}
