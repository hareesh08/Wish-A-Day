import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { WishTheme } from "../ThemeSelector";
import { 
  Gift, Heart, PartyPopper, Star, Flower2, 
  HeartHandshake, Award, Music, Calendar, Sparkles 
} from "lucide-react";

interface GiftBox3DProps {
  theme: WishTheme;
  onOpenComplete: () => void;
  isActive: boolean;
}

const themeIcons: Record<WishTheme, React.ComponentType<{ className?: string }>> = {
  default: Sparkles,
  birthday: PartyPopper,
  love: Heart,
  celebration: Star,
  wedding: Flower2,
  valentine: HeartHandshake,
  congratulations: Award,
  appreciation: Gift,
  festival: Music,
  event: Calendar,
};

const themeColors: Record<WishTheme, { box: string; ribbon: string; glow: string; accent: string }> = {
  default: { box: "#FFD700", ribbon: "#FF6B6B", glow: "#FFD700", accent: "#FFF8DC" },
  birthday: { box: "#FF69B4", ribbon: "#4ECDC4", glow: "#FF69B4", accent: "#FFE4E1" },
  love: { box: "#FF1744", ribbon: "#FFD700", glow: "#FF1744", accent: "#FFE4E1" },
  celebration: { box: "#FFD700", ribbon: "#FF6B6B", glow: "#FFD700", accent: "#FFFACD" },
  wedding: { box: "#FFFFFF", ribbon: "#FFD700", glow: "#F8BBD9", accent: "#FFF5EE" },
  valentine: { box: "#FF1744", ribbon: "#FFB6C1", glow: "#FF1744", accent: "#FFF0F5" },
  congratulations: { box: "#FFD700", ribbon: "#FF6B6B", glow: "#FFD700", accent: "#FFFACD" },
  appreciation: { box: "#4CAF50", ribbon: "#FFD700", glow: "#4CAF50", accent: "#F0FFF0" },
  festival: { box: "#9C27B0", ribbon: "#FFD700", glow: "#9C27B0", accent: "#E6E6FA" },
  event: { box: "#2196F3", ribbon: "#FFD700", glow: "#2196F3", accent: "#E6F3FF" },
};

export function GiftBox3D({ theme, onOpenComplete, isActive }: GiftBox3DProps) {
  const [phase, setPhase] = useState<"intro" | "floating" | "shaking" | "opening" | "burst" | "complete">("intro");
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const ThemeIcon = themeIcons[theme];
  const colors = themeColors[theme];

  // Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animation sequence
  useEffect(() => {
    if (!isActive) return;

    const sequence = [
      { phase: "floating", delay: 200 },
      { phase: "shaking", delay: 1500 },
      { phase: "opening", delay: 3000 },
      { phase: "burst", delay: 4500 },
      { phase: "complete", delay: 6000 },
    ];

    const timers = sequence.map(({ phase, delay }) =>
      setTimeout(() => {
        setPhase(phase as any);
        if (phase === "complete") {
          setTimeout(onOpenComplete, 300);
        }
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isActive, onOpenComplete]);

  if (phase === "complete") return null;

  // Parallax transforms based on mouse position
  const parallaxX = (mousePos.x - 0.5) * 30;
  const parallaxY = (mousePos.y - 0.5) * 30;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at center, ${colors.accent}40 0%, #000 70%)`,
      }}
    >
      {/* Aurora background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2 animate-aurora-flow"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, ${colors.glow}30 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, ${colors.ribbon}20 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, ${colors.accent}15 0%, transparent 60%)
            `,
          }}
        />
      </div>

      {/* Parallax depth layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Far layer - slow movement */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`far-${i}`}
            className="absolute animate-twinkle-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px)`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            <div 
              className="w-1 h-1 rounded-full"
              style={{ 
                backgroundColor: colors.glow,
                boxShadow: `0 0 4px ${colors.glow}`,
              }}
            />
          </div>
        ))}

        {/* Mid layer - medium movement */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`mid-${i}`}
            className="absolute animate-float-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `translate(${parallaxX * 0.6}px, ${parallaxY * 0.6}px)`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <div 
              className="w-2 h-2 rounded-full opacity-60"
              style={{ 
                backgroundColor: colors.ribbon,
                boxShadow: `0 0 8px ${colors.ribbon}`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Dynamic light rays */}
      {(phase === "opening" || phase === "burst") && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`ray-${i}`}
              className="absolute left-1/2 top-1/2 origin-left animate-light-ray"
              style={{
                width: "150vw",
                height: "4px",
                background: `linear-gradient(90deg, ${colors.glow}80, transparent)`,
                transform: `rotate(${i * 30}deg)`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 3D Gift Box Container */}
      <div 
        className={cn(
          "relative perspective-1000 transition-all duration-1000",
          phase === "floating" && "animate-gift-float-3d",
          phase === "shaking" && "animate-gift-shake-3d",
          phase === "opening" && "animate-gift-open-3d",
          phase === "burst" && "scale-0 opacity-0"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: `
            rotateX(${-parallaxY * 0.2}deg) 
            rotateY(${parallaxX * 0.2}deg)
          `,
        }}
      >
        {/* Outer glow */}
        <div 
          className={cn(
            "absolute -inset-8 rounded-3xl blur-2xl transition-all duration-1000",
            phase === "shaking" && "animate-pulse scale-110",
            phase === "opening" && "scale-150 opacity-100",
          )}
          style={{ 
            backgroundColor: colors.glow,
            opacity: phase === "intro" ? 0.3 : 0.6,
          }}
        />

        {/* 3D Box - Bottom */}
        <div 
          className="relative w-40 h-40 md:w-48 md:h-48"
          style={{ 
            transformStyle: "preserve-3d",
            transform: "translateZ(-40px)",
          }}
        >
          {/* Front face */}
          <div 
            className="absolute inset-0 rounded-xl"
            style={{ 
              background: `linear-gradient(145deg, ${colors.box}, ${colors.box}dd)`,
              transform: "translateZ(40px)",
              boxShadow: `inset 0 -20px 40px rgba(0,0,0,0.2), inset 0 20px 40px rgba(255,255,255,0.3)`,
            }}
          >
            <div className="absolute inset-4 rounded-lg bg-gradient-to-br from-white/30 to-transparent" />
          </div>

          {/* Top face (lid) */}
          <div 
            className={cn(
              "absolute inset-0 rounded-xl transition-all duration-1000 origin-bottom",
              phase === "opening" && "animate-lid-open-3d"
            )}
            style={{ 
              background: `linear-gradient(145deg, ${colors.box}, ${colors.box}ee)`,
              transform: phase === "opening" || phase === "burst" 
                ? "rotateX(-120deg) translateZ(20px)" 
                : "translateZ(60px)",
              boxShadow: `0 10px 30px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.5)`,
            }}
          >
            <div className="absolute inset-4 rounded-lg bg-gradient-to-br from-white/40 to-transparent" />
          </div>

          {/* Ribbon - Horizontal */}
          <div 
            className={cn(
              "absolute top-1/2 left-0 right-0 h-6 -translate-y-1/2 transition-all duration-700",
              (phase === "opening" || phase === "burst") && "opacity-0 scale-x-0"
            )}
            style={{ 
              background: `linear-gradient(180deg, ${colors.ribbon}, ${colors.ribbon}cc)`,
              transform: "translateZ(65px) translateY(-50%)",
              boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
            }}
          >
            <div className="absolute inset-1 bg-gradient-to-b from-white/30 to-transparent" />
          </div>

          {/* Ribbon - Vertical */}
          <div 
            className={cn(
              "absolute left-1/2 top-0 bottom-0 w-6 -translate-x-1/2 transition-all duration-700",
              (phase === "opening" || phase === "burst") && "opacity-0 scale-y-0"
            )}
            style={{ 
              background: `linear-gradient(90deg, ${colors.ribbon}, ${colors.ribbon}cc)`,
              transform: "translateZ(65px) translateX(-50%)",
              boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
            }}
          >
            <div className="absolute inset-1 bg-gradient-to-r from-white/30 to-transparent" />
          </div>

          {/* Bow */}
          <div 
            className={cn(
              "absolute top-2 left-1/2 -translate-x-1/2 transition-all duration-500",
              (phase === "opening" || phase === "burst") && "animate-bow-fly-away"
            )}
            style={{ transform: "translateZ(70px) translateX(-50%)" }}
          >
            {/* Bow loops */}
            <div className="flex gap-1">
              <div 
                className="w-8 h-6 rounded-full"
                style={{ 
                  background: `radial-gradient(ellipse at 30% 30%, ${colors.ribbon}, ${colors.ribbon}aa)`,
                  transform: "rotate(-20deg)",
                  boxShadow: `inset 2px 2px 4px rgba(255,255,255,0.4)`,
                }}
              />
              <div 
                className="w-8 h-6 rounded-full"
                style={{ 
                  background: `radial-gradient(ellipse at 70% 30%, ${colors.ribbon}, ${colors.ribbon}aa)`,
                  transform: "rotate(20deg)",
                  boxShadow: `inset -2px 2px 4px rgba(255,255,255,0.4)`,
                }}
              />
            </div>
            {/* Bow center */}
            <div 
              className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{ 
                background: `radial-gradient(circle, ${colors.ribbon}, ${colors.ribbon}cc)`,
                boxShadow: `0 2px 6px rgba(0,0,0,0.3)`,
              }}
            />
          </div>
        </div>

        {/* Content emerging from box */}
        {(phase === "opening" || phase === "burst") && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative animate-content-emerge">
              {/* Glowing backdrop */}
              <div 
                className="absolute inset-0 blur-xl animate-pulse"
                style={{ color: colors.glow }}
              >
                <ThemeIcon className="w-20 h-20" />
              </div>
              {/* Main icon */}
              <ThemeIcon 
                className="w-20 h-20 relative z-10 drop-shadow-2xl"
                style={{ 
                  color: colors.glow,
                  filter: `drop-shadow(0 0 20px ${colors.glow})`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Celebration burst particles */}
      {phase === "burst" && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Confetti burst */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i / 60) * 360;
            const distance = 100 + Math.random() * 200;
            const confettiColors = [colors.glow, colors.ribbon, colors.box, colors.accent, "#FFD700", "#FF6B6B"];
            
            return (
              <div
                key={`confetti-${i}`}
                className="absolute left-1/2 top-1/2 animate-confetti-burst-3d"
                style={{
                  width: `${4 + Math.random() * 8}px`,
                  height: `${4 + Math.random() * 8}px`,
                  backgroundColor: confettiColors[i % confettiColors.length],
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                  "--angle": `${angle}deg`,
                  "--distance": `${distance}px`,
                  animationDelay: `${Math.random() * 0.3}s`,
                } as React.CSSProperties}
              />
            );
          })}

          {/* Sparkle ring */}
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute left-1/2 top-1/2 animate-sparkle-ring"
              style={{
                transform: `rotate(${i * 22.5}deg) translateY(-100px)`,
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <Sparkles 
                className="w-6 h-6"
                style={{ color: colors.glow }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Sparkle cursor trail */}
      <SparkleTrail color={colors.glow} />
    </div>
  );
}

// Sparkle cursor trail component
function SparkleTrail({ color }: { color: string }) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.7) { // Throttle sparkle creation
        const newSparkle = {
          id: idRef.current++,
          x: e.clientX,
          y: e.clientY,
        };
        setSparkles(prev => [...prev.slice(-15), newSparkle]);
        
        setTimeout(() => {
          setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
        }, 800);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle-cursor"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Sparkles 
            className="w-4 h-4"
            style={{ color }}
          />
        </div>
      ))}
    </div>
  );
}
