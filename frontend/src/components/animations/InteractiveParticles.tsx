import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { WishTheme } from "../ThemeSelector";
import { Heart, Star, Sparkles, PartyPopper, Flower2 } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "confetti" | "heart" | "star" | "sparkle" | "flower";
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
}

interface InteractiveParticlesProps {
  theme: WishTheme;
  isActive: boolean;
  maxParticles?: number;
}

const themeParticleConfig: Record<WishTheme, {
  types: Particle["type"][];
  colors: string[];
  burstSize: number;
}> = {
  default: { types: ["sparkle", "confetti"], colors: ["#FFD700", "#FF6B6B", "#4ECDC4"], burstSize: 8 },
  birthday: { types: ["confetti", "star", "sparkle"], colors: ["#FF69B4", "#4ECDC4", "#FFE66D", "#95E1D3"], burstSize: 12 },
  love: { types: ["heart", "sparkle"], colors: ["#FF1744", "#FF6B6B", "#FFB6C1"], burstSize: 10 },
  celebration: { types: ["confetti", "star", "sparkle"], colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#9B59B6"], burstSize: 15 },
  wedding: { types: ["flower", "sparkle", "heart"], colors: ["#FFB6C1", "#FFF0F5", "#FFD700", "#FFFFFF"], burstSize: 8 },
  valentine: { types: ["heart", "sparkle"], colors: ["#FF1744", "#FFB6C1", "#FF69B4"], burstSize: 12 },
  congratulations: { types: ["confetti", "star"], colors: ["#FFD700", "#FFA500", "#FF6B6B"], burstSize: 12 },
  appreciation: { types: ["sparkle", "flower"], colors: ["#4CAF50", "#81C784", "#FFD700"], burstSize: 8 },
  festival: { types: ["confetti", "star", "sparkle"], colors: ["#9C27B0", "#E91E63", "#FFD700", "#00BCD4"], burstSize: 14 },
  event: { types: ["confetti", "star"], colors: ["#2196F3", "#3F51B5", "#FFD700"], burstSize: 10 },
};

export function InteractiveParticles({ 
  theme, 
  isActive, 
  maxParticles = 60 // Reduced from 100
}: InteractiveParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleIdRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  
  const config = themeParticleConfig[theme];

  // Create particle burst at position
  const createBurst = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < config.burstSize; i++) {
      const angle = (Math.PI * 2 * i) / config.burstSize + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 5;
      const type = config.types[Math.floor(Math.random() * config.types.length)];
      
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward bias
        type,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size: 8 + Math.random() * 12,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 1,
        maxLife: 60 + Math.random() * 60, // 1-2 seconds at 60fps
      });
    }
    
    setParticles(prev => {
      const combined = [...prev, ...newParticles];
      return combined.slice(-maxParticles);
    });
  }, [config, maxParticles]);

  // Handle click/touch
  useEffect(() => {
    if (!isActive) return;

    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      const point = "touches" in e ? e.touches[0] : e;
      createBurst(point.clientX, point.clientY);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [isActive, createBurst]);

  // Animation loop
  useEffect(() => {
    if (!isActive || particles.length === 0) return;

    particlesRef.current = particles;

    const animate = () => {
      setParticles(prev => {
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // Gravity
            vx: p.vx * 0.98, // Air resistance
            rotation: p.rotation + p.rotationSpeed,
            life: p.life - 1 / p.maxLife,
          }))
          .filter(p => p.life > 0 && p.y < window.innerHeight + 50);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, particles.length]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Click hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-white/60 animate-pulse pointer-events-none">
        Tap anywhere for magic! ✨
      </div>

      {particles.map(particle => (
        <ParticleElement key={particle.id} particle={particle} />
      ))}
    </div>
  );
}

function ParticleElement({ particle }: { particle: Particle }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: particle.x,
    top: particle.y,
    transform: `translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${particle.life})`,
    opacity: particle.life,
    transition: "none",
    willChange: "transform, opacity",
  };

  switch (particle.type) {
    case "heart":
      return (
        <Heart 
          className="fill-current"
          style={{ 
            ...style, 
            color: particle.color,
            width: particle.size,
            height: particle.size,
          }} 
        />
      );
    case "star":
      return (
        <Star 
          className="fill-current"
          style={{ 
            ...style, 
            color: particle.color,
            width: particle.size,
            height: particle.size,
          }} 
        />
      );
    case "sparkle":
      return (
        <Sparkles 
          style={{ 
            ...style, 
            color: particle.color,
            width: particle.size,
            height: particle.size,
          }} 
        />
      );
    case "flower":
      return (
        <Flower2 
          style={{ 
            ...style, 
            color: particle.color,
            width: particle.size,
            height: particle.size,
          }} 
        />
      );
    case "confetti":
    default:
      return (
        <div
          style={{
            ...style,
            width: particle.size,
            height: particle.size * 0.6,
            backgroundColor: particle.color,
            borderRadius: "2px",
          }}
        />
      );
  }
}

// Ambient floating particles for background
interface AmbientParticlesProps {
  theme: WishTheme;
  density?: number;
}

export function AmbientParticles({ theme, density = 12 }: AmbientParticlesProps) { // Reduced from 20
  const config = themeParticleConfig[theme];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: density }).map((_, i) => {
        const type = config.types[i % config.types.length];
        const color = config.colors[i % config.colors.length];
        
        return (
          <div
            key={i}
            className="absolute animate-ambient-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          >
            {type === "heart" && <Heart className="w-4 h-4 fill-current" style={{ color, opacity: 0.3 }} />}
            {type === "star" && <Star className="w-4 h-4 fill-current" style={{ color, opacity: 0.3 }} />}
            {type === "sparkle" && <Sparkles className="w-4 h-4" style={{ color, opacity: 0.3 }} />}
            {type === "flower" && <Flower2 className="w-4 h-4" style={{ color, opacity: 0.3 }} />}
            {type === "confetti" && (
              <div 
                className="w-2 h-3 rounded-sm" 
                style={{ backgroundColor: color, opacity: 0.3 }} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
