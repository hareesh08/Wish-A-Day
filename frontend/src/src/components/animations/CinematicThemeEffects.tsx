import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { WishTheme } from "../ThemeSelector";
import { 
  Heart, Star, Sparkles, Flower2, Music, 
  Gift, Award, PartyPopper, Calendar, HeartHandshake,
  Cake, Crown, Gem
} from "lucide-react";

interface CinematicThemeEffectsProps {
  theme: WishTheme;
  isActive: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotation: number;
}

// Color palettes for each theme
const THEME_COLORS: Record<WishTheme, string[]> = {
  default: ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#9B59B6"],
  birthday: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181", "#AA96DA", "#FF69B4"],
  love: ["#FF1744", "#FF4081", "#F50057", "#E91E63", "#FFB6C1", "#FF69B4"],
  celebration: ["#FFD700", "#FF6B6B", "#4ECDC4", "#FF69B4", "#9370DB", "#00CED1"],
  wedding: ["#FFFFFF", "#F8BBD9", "#FFD700", "#E8D5B7", "#FFF0F5", "#FAEBD7"],
  valentine: ["#FF1744", "#FF4081", "#FFB6C1", "#FFC0CB", "#FF69B4", "#DC143C"],
  congratulations: ["#FFD700", "#FFA500", "#FF8C00", "#DAA520", "#F0E68C", "#FFDF00"],
  appreciation: ["#4CAF50", "#8BC34A", "#CDDC39", "#00BCD4", "#26A69A", "#66BB6A"],
  festival: ["#9C27B0", "#E91E63", "#FF5722", "#FFC107", "#00BCD4", "#4CAF50"],
  event: ["#2196F3", "#03A9F4", "#00BCD4", "#3F51B5", "#673AB7", "#9C27B0"],
};

const generateParticles = (count: number, colors: string[]): Particle[] => {
  const isMobile = window.innerWidth < 768;
  const actualCount = isMobile ? Math.floor(count * 0.5) : count; // 50% fewer on mobile
  
  return Array.from({ length: actualCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 4,
    size: 8 + Math.random() * 16,
    color: colors[i % colors.length],
    rotation: Math.random() * 360,
  }));
};

// =====================================================
// BIRTHDAY CINEMATIC - Balloons, Confetti, Cake, Fireworks - OPTIMIZED
// =====================================================
const BirthdayCinematic = ({ particles }: { particles: Particle[] }) => {
  const isMobile = window.innerWidth < 768;
  const balloonCount = isMobile ? 5 : 8;
  const confettiCount = isMobile ? 15 : 27;
  
  return (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Cinematic gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-pink-500/10 animate-gradient-pulse" />
    
    {/* 3D Balloons */}
    {particles.slice(0, balloonCount).map((p, i) => (
      <div
        key={`balloon-${i}`}
        className="absolute bottom-0 animate-cinematic-balloon-rise"
        style={{
          left: `${8 + i * (84 / balloonCount)}%`,
          animationDelay: `${i * 0.4}s`,
          animationDuration: `${10 + i}s`,
          willChange: "transform",
        }}
      >
        <div className="relative">
          <div 
            className="rounded-full shadow-xl"
            style={{ 
              width: 40 + (i % 3) * 12,
              height: 50 + (i % 3) * 15,
              background: `radial-gradient(ellipse at 30% 25%, ${p.color}ff 0%, ${p.color}cc 50%, ${p.color}88 100%)`,
              boxShadow: `inset -6px -6px 15px rgba(0,0,0,0.2), inset 6px 6px 15px rgba(255,255,255,0.3), 0 8px 32px ${p.color}40`,
            }}
          >
            <div 
              className="absolute rounded-full"
              style={{ top: "15%", left: "20%", width: "35%", height: "25%", background: "linear-gradient(135deg, rgba(255,255,255,0.7), transparent)", filter: "blur(2px)" }}
            />
          </div>
          <div className="w-0.5 h-16 bg-gradient-to-b from-gray-400 to-transparent mx-auto" />
        </div>
      </div>
    ))}

    {/* Confetti rain */}
    {particles.slice(balloonCount, balloonCount + confettiCount).map((p) => (
      <div
        key={`confetti-${p.id}`}
        className="absolute animate-cinematic-confetti-fall"
        style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`, willChange: "transform" }}
      >
        <div
          className="animate-confetti-spin"
          style={{
            width: p.size * 0.4,
            height: p.size * 0.7,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "2px" : "50%",
            boxShadow: `0 2px 8px ${p.color}60`,
          }}
        />
      </div>
    ))}

    {/* Party poppers */}
    <PartyPopper className="absolute top-[6%] left-[5%] w-12 h-12 text-pink-500 animate-popper-burst drop-shadow-lg" style={{ animationDelay: "1s" }} />
    <PartyPopper className="absolute top-[8%] right-[6%] w-10 h-10 text-yellow-500 animate-popper-burst scale-x-[-1] drop-shadow-lg" style={{ animationDelay: "1.5s" }} />

    {/* Birthday cake */}
    <div className="absolute bottom-[8%] right-[10%] animate-cinematic-cake-entrance" style={{ animationDelay: "0.8s" }}>
      <Cake className="w-14 h-14 text-pink-400 drop-shadow-lg" />
      <Sparkles className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 text-yellow-400 animate-sparkle-pulse" />
    </div>

    {/* Sparkle overlay - reduced count */}
    {!isMobile && Array.from({ length: 10 }).map((_, i) => (
      <div
        key={`sparkle-${i}`}
        className="absolute animate-birthday-sparkle"
        style={{ left: `${5 + i * 9}%`, top: `${10 + (i % 4) * 20}%`, animationDelay: `${i * 0.2}s` }}
      >
        <div className="w-1.5 h-1.5 bg-white rounded-full" style={{ boxShadow: "0 0 6px #FFD700, 0 0 12px #FFD700" }} />
      </div>
    ))}
  </div>
);};

// =====================================================
// LOVE CINEMATIC - Floating Hearts, Rose Petals, Romantic Glow
// =====================================================
const LoveCinematic = ({ particles }: { particles: Particle[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Romantic gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-red-500/15 via-pink-500/10 to-rose-500/15 animate-gradient-pulse" />

    {/* Floating 3D hearts */}
    {particles.slice(0, 15).map((p, i) => (
      <div
        key={`heart-${i}`}
        className="absolute animate-cinematic-heart-float"
        style={{
          left: `${p.x}%`,
          bottom: "-10%",
          animationDelay: `${p.delay}s`,
          animationDuration: `${8 + p.duration}s`,
        }}
      >
        <Heart 
          className="drop-shadow-lg animate-heart-pulse-gentle"
          style={{ 
            width: p.size * 1.5, 
            height: p.size * 1.5, 
            color: p.color,
            fill: p.color,
            filter: `drop-shadow(0 0 ${8 + i * 2}px ${p.color}80)`,
          }}
        />
      </div>
    ))}

    {/* Rose petals falling */}
    {particles.slice(15, 30).map((p) => (
      <div
        key={`petal-${p.id}`}
        className="absolute animate-cinematic-petal-fall"
        style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration + 4}s` }}
      >
        <div 
          className="rounded-full rotate-45"
          style={{
            width: p.size * 0.6,
            height: p.size * 0.9,
            background: `linear-gradient(135deg, #FFB6C1 0%, #FF69B4 50%, #FF1493 100%)`,
            boxShadow: "0 2px 8px rgba(255, 105, 180, 0.4)",
          }}
        />
      </div>
    ))}

    {/* Romantic glow orbs */}
    <div className="absolute top-[20%] left-[15%] w-32 h-32 rounded-full bg-pink-400/20 blur-3xl animate-love-glow" />
    <div className="absolute bottom-[25%] right-[20%] w-40 h-40 rounded-full bg-red-400/15 blur-3xl animate-love-glow" style={{ animationDelay: "2s" }} />
    <div className="absolute top-[50%] right-[10%] w-24 h-24 rounded-full bg-rose-400/20 blur-2xl animate-love-glow" style={{ animationDelay: "4s" }} />

    {/* Sparkle hearts */}
    <HeartHandshake className="absolute top-[15%] right-[20%] w-8 h-8 text-pink-400 animate-float drop-shadow-lg" />
    <Heart className="absolute bottom-[30%] left-[10%] w-6 h-6 text-red-400 fill-red-400 animate-heartbeat drop-shadow-lg" />
  </div>
);

// =====================================================
// CELEBRATION CINEMATIC - Fireworks, Stars, Confetti Burst
// =====================================================
const CelebrationCinematic = ({ particles }: { particles: Particle[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Dynamic gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 via-orange-500/5 to-red-500/10 animate-gradient-pulse" />

    {/* Firework bursts */}
    {[20, 50, 75].map((x, i) => (
      <div
        key={`firework-${i}`}
        className="absolute animate-firework-launch"
        style={{ left: `${x}%`, bottom: 0, animationDelay: `${i * 0.8}s` }}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-firework-explode" style={{ animationDelay: `${i * 0.8 + 0.8}s` }}>
          {Array.from({ length: 12 }).map((_, j) => (
            <div
              key={j}
              className="absolute w-2 h-2 rounded-full animate-spark-fly"
              style={{
                backgroundColor: particles[j % particles.length].color,
                boxShadow: `0 0 8px ${particles[j % particles.length].color}`,
                transform: `rotate(${j * 30}deg) translateY(-25px)`,
                animationDelay: `${i * 0.8 + 0.8 + j * 0.03}s`,
              }}
            />
          ))}
        </div>
      </div>
    ))}

    {/* Spinning stars */}
    {particles.slice(0, 12).map((p, i) => (
      <div
        key={`star-${i}`}
        className="absolute animate-star-pop"
        style={{ left: `${p.x}%`, top: `${15 + (i % 5) * 15}%`, animationDelay: `${p.delay}s` }}
      >
        <Star 
          className="animate-star-twinkle drop-shadow-lg"
          style={{ width: p.size, height: p.size, color: p.color, fill: p.color }}
        />
      </div>
    ))}

    {/* Confetti burst */}
    {particles.slice(12, 30).map((p) => (
      <div
        key={`conf-${p.id}`}
        className="absolute animate-cinematic-confetti-fall"
        style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
      >
        <div style={{ width: 6, height: 10, backgroundColor: p.color, borderRadius: 2, transform: `rotate(${p.rotation}deg)` }} />
      </div>
    ))}

    {/* Trophy/Award accent */}
    <Award className="absolute top-[10%] left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 animate-float drop-shadow-lg" />
  </div>
);

// =====================================================
// WEDDING CINEMATIC - Elegant Flowers, Golden Sparkles, Ribbons
// =====================================================
const WeddingCinematic = ({ particles }: { particles: Particle[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Soft elegant gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-pink-100/10 to-amber-100/15 animate-gradient-pulse" />

    {/* Floating flowers */}
    {particles.slice(0, 10).map((p, i) => (
      <div
        key={`flower-${i}`}
        className="absolute animate-cinematic-flower-float"
        style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${10 + p.duration}s` }}
      >
        <Flower2 
          className="drop-shadow-md"
          style={{ width: p.size * 1.5, height: p.size * 1.5, color: "#F8BBD9", opacity: 0.8 }}
        />
      </div>
    ))}

    {/* Golden sparkles */}
    {particles.slice(10, 25).map((p) => (
      <div
        key={`gold-${p.id}`}
        className="absolute animate-golden-sparkle-float"
        style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}s` }}
      >
        <Sparkles style={{ width: p.size * 0.8, height: p.size * 0.8, color: "#FFD700", filter: "drop-shadow(0 0 4px #FFD700)" }} />
      </div>
    ))}

    {/* Elegant ribbons */}
    <div className="absolute top-0 left-[10%] w-1 h-40 bg-gradient-to-b from-amber-200/50 to-transparent animate-ribbon-flow" />
    <div className="absolute top-0 right-[10%] w-1 h-48 bg-gradient-to-b from-pink-200/50 to-transparent animate-ribbon-flow" style={{ animationDelay: "1s" }} />

    {/* Crown accent */}
    <Crown className="absolute top-[8%] left-1/2 -translate-x-1/2 w-8 h-8 text-amber-400 animate-float drop-shadow-lg" />

    {/* Soft glow orbs */}
    <div className="absolute top-[30%] left-[20%] w-48 h-48 rounded-full bg-pink-200/10 blur-3xl animate-love-glow" />
    <div className="absolute bottom-[20%] right-[15%] w-40 h-40 rounded-full bg-amber-200/10 blur-3xl animate-love-glow" style={{ animationDelay: "3s" }} />
  </div>
);

// =====================================================
// VALENTINE CINEMATIC - Hearts, Chocolates, Romantic Sparkles
// =====================================================
const ValentineCinematic = ({ particles }: { particles: Particle[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Deep romantic gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-red-600/15 via-pink-500/10 to-rose-600/15 animate-gradient-pulse" />

    {/* Pulsing hearts cascade */}
    {particles.slice(0, 20).map((p, i) => (
      <div
        key={`vheart-${i}`}
        className="absolute animate-cinematic-heart-cascade"
        style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${6 + p.duration}s` }}
      >
        <Heart 
          className="animate-heartbeat"
          style={{ 
            width: p.size, 
            height: p.size, 
            color: p.color, 
            fill: p.color,
            filter: `drop-shadow(0 0 10px ${p.color}90)`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      </div>
    ))}

    {/* Floating chocolates (using Gem as chocolate box) */}
    {particles.slice(20, 25).map((p, i) => (
      <div
        key={`choco-${i}`}
        className="absolute animate-float"
        style={{ left: `${10 + i * 20}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.5}s` }}
      >
        <Gem className="w-6 h-6 text-amber-700 drop-shadow-lg" style={{ filter: "drop-shadow(0 0 4px #8B4513)" }} />
      </div>
    ))}

    {/* Romantic sparkle rain */}
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={`vsparkle-${i}`}
        className="absolute animate-valentine-sparkle"
        style={{ left: `${5 + i * 5}%`, animationDelay: `${i * 0.15}s` }}
      >
        <div className="w-1 h-1 rounded-full bg-pink-300" style={{ boxShadow: "0 0 4px #FF69B4, 0 0 8px #FF1493" }} />
      </div>
    ))}

    {/* Large romantic glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-red-400/10 blur-3xl animate-love-glow" />

    {/* HeartHandshake accent */}
    <HeartHandshake className="absolute top-[12%] left-1/2 -translate-x-1/2 w-10 h-10 text-rose-400 animate-heartbeat drop-shadow-lg" />
  </div>
);

// =====================================================
// CONGRATULATIONS CINEMATIC - Trophies, Gold Confetti, Stars
// =====================================================
const CongratsCinematic = ({ particles }: { particles: Particle[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Golden gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/15 via-amber-400/10 to-orange-500/15 animate-gradient-pulse" />

    {/* Trophy shine effect */}
    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 animate-trophy-entrance">
      <Award className="w-16 h-16 text-yellow-500 drop-shadow-xl" style={{ filter: "drop-shadow(0 0 20px #FFD700)" }} />
      <div className="absolute inset-0 animate-trophy-shine">
        <div className="absolute top-2 left-4 w-3 h-8 bg-white/40 rotate-12 blur-sm" />
      </div>
    </div>

    {/* Gold star bursts */}
    {particles.slice(0, 15).map((p, i) => (
      <div
        key={`gstar-${i}`}
        className="absolute animate-star-pop"
        style={{ left: `${p.x}%`, top: `${20 + (i % 4) * 18}%`, animationDelay: `${p.delay * 0.5}s` }}
      >
        <Star 
          className="animate-star-twinkle"
          style={{ width: p.size, height: p.size, color: "#FFD700", fill: "#FFD700", filter: "drop-shadow(0 0 6px #FFD700)" }}
        />
      </div>
    ))}

    {/* Gold confetti rain */}
    {particles.slice(15, 35).map((p) => (
      <div
        key={`gconf-${p.id}`}
        className="absolute animate-cinematic-confetti-fall"
        style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
      >
        <div 
          className="animate-confetti-spin"
          style={{ width: 8, height: 12, backgroundColor: p.color, borderRadius: 2, boxShadow: `0 2px 6px ${p.color}60` }}
        />
      </div>
    ))}

    {/* Sparkle accents */}
    <Sparkles className="absolute top-[25%] left-[15%] w-6 h-6 text-yellow-400 animate-sparkle-pulse drop-shadow-lg" />
    <Sparkles className="absolute top-[35%] right-[12%] w-5 h-5 text-amber-400 animate-sparkle-pulse drop-shadow-lg" style={{ animationDelay: "0.5s" }} />
  </div>
);

// =====================================================
// APPRECIATION CINEMATIC - Gifts, Warm Sparkles, Gentle Flow
// =====================================================
const AppreciationCinematic = ({ particles }: { particles: Particle[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Warm green gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-400/8 to-emerald-500/10 animate-gradient-pulse" />

    {/* Floating gifts */}
    {particles.slice(0, 8).map((p, i) => (
      <div
        key={`gift-${i}`}
        className="absolute animate-gift-float"
        style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${8 + p.duration}s` }}
      >
        <Gift 
          className="drop-shadow-lg"
          style={{ width: p.size * 1.3, height: p.size * 1.3, color: p.color, filter: `drop-shadow(0 0 8px ${p.color}60)` }}
        />
      </div>
    ))}

    {/* Warm sparkles */}
    {particles.slice(8, 20).map((p) => (
      <div
        key={`wsparkle-${p.id}`}
        className="absolute animate-appreciation-sparkle"
        style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}s` }}
      >
        <Sparkles style={{ width: p.size * 0.7, height: p.size * 0.7, color: p.color, opacity: 0.7 }} />
      </div>
    ))}

    {/* Gentle glow orbs */}
    <div className="absolute top-[25%] left-[20%] w-40 h-40 rounded-full bg-green-400/10 blur-3xl animate-love-glow" />
    <div className="absolute bottom-[30%] right-[15%] w-32 h-32 rounded-full bg-teal-400/10 blur-2xl animate-love-glow" style={{ animationDelay: "2s" }} />

    {/* Floating hearts for appreciation */}
    <Heart className="absolute top-[20%] right-[25%] w-5 h-5 text-green-400 fill-green-400/50 animate-float drop-shadow" />
    <Heart className="absolute bottom-[25%] left-[18%] w-4 h-4 text-teal-400 fill-teal-400/50 animate-float drop-shadow" style={{ animationDelay: "1s" }} />
  </div>
);

// =====================================================
// FESTIVAL CINEMATIC - Lanterns, Fireworks, Colorful Lights
// =====================================================
const FestivalCinematic = ({ particles }: { particles: Particle[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Vibrant gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-orange-500/15 animate-gradient-pulse" />

    {/* Floating lanterns */}
    {particles.slice(0, 8).map((p, i) => (
      <div
        key={`lantern-${i}`}
        className="absolute animate-lantern-float"
        style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, animationDuration: `${12 + p.duration}s` }}
      >
        <div 
          className="rounded-lg relative"
          style={{
            width: p.size * 1.4,
            height: p.size * 2,
            background: `linear-gradient(180deg, ${p.color}dd, ${p.color}88)`,
            boxShadow: `0 0 20px ${p.color}60, inset 0 0 15px rgba(255,255,255,0.2)`,
          }}
        >
          <div className="absolute inset-2 rounded bg-gradient-to-t from-yellow-200/30 to-white/20" />
        </div>
      </div>
    ))}

    {/* Floating music notes */}
    {particles.slice(8, 14).map((p, i) => (
      <div
        key={`music-${i}`}
        className="absolute animate-music-note-float"
        style={{ left: `${p.x}%`, animationDelay: `${p.delay + 1}s` }}
      >
        <Music className="drop-shadow-lg" style={{ width: p.size, height: p.size, color: p.color }} />
      </div>
    ))}

    {/* Festival sparkles */}
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={`fsparkle-${i}`}
        className="absolute animate-festival-sparkle"
        style={{ left: `${5 + i * 5}%`, top: `${10 + (i % 5) * 18}%`, animationDelay: `${i * 0.1}s` }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: particles[i % particles.length].color, boxShadow: `0 0 8px ${particles[i % particles.length].color}` }}
        />
      </div>
    ))}

    {/* String lights effect */}
    <div className="absolute top-[5%] left-0 right-0 h-4 flex justify-around">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`light-${i}`}
          className="w-3 h-3 rounded-full animate-festival-light"
          style={{ 
            backgroundColor: particles[i % particles.length].color, 
            boxShadow: `0 0 10px ${particles[i % particles.length].color}`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  </div>
);

// =====================================================
// EVENT CINEMATIC - Spotlight, Geometric, Modern Motion
// =====================================================
const EventCinematic = ({ particles }: { particles: Particle[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Modern blue gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-indigo-500/10 to-purple-600/15 animate-gradient-pulse" />

    {/* Spotlight effects */}
    <div className="absolute top-0 left-[30%] w-32 h-full bg-gradient-to-b from-blue-400/10 via-blue-400/5 to-transparent animate-spotlight-sweep" />
    <div className="absolute top-0 right-[25%] w-24 h-full bg-gradient-to-b from-indigo-400/10 via-indigo-400/5 to-transparent animate-spotlight-sweep" style={{ animationDelay: "2s" }} />

    {/* Geometric floating shapes */}
    {particles.slice(0, 10).map((p, i) => (
      <div
        key={`geo-${i}`}
        className="absolute animate-geometric-float"
        style={{ left: `${p.x}%`, top: `${15 + (i % 4) * 20}%`, animationDelay: `${p.delay}s` }}
      >
        <div 
          className="border-2 rotate-45"
          style={{
            width: p.size,
            height: p.size,
            borderColor: p.color,
            borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "4px" : "0",
            boxShadow: `0 0 15px ${p.color}40`,
          }}
        />
      </div>
    ))}

    {/* Calendar accents */}
    <Calendar className="absolute top-[15%] left-[10%] w-6 h-6 text-blue-400 animate-float drop-shadow-lg" />
    <Calendar className="absolute bottom-[20%] right-[12%] w-5 h-5 text-indigo-400 animate-float drop-shadow-lg" style={{ animationDelay: "1.5s" }} />

    {/* Modern sparkle grid */}
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={`espark-${i}`}
        className="absolute animate-event-sparkle"
        style={{ left: `${8 + i * 6}%`, top: `${25 + (i % 3) * 25}%`, animationDelay: `${i * 0.2}s` }}
      >
        <Sparkles style={{ width: 12, height: 12, color: particles[i % particles.length].color, opacity: 0.6 }} />
      </div>
    ))}
  </div>
);

// =====================================================
// DEFAULT CINEMATIC - Elegant Sparkles, Soft Motion
// =====================================================
const DefaultCinematic = ({ particles }: { particles: Particle[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Warm elegant gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-400/8 to-coral-500/10 animate-gradient-pulse" />

    {/* Floating sparkles */}
    {particles.slice(0, 15).map((p, i) => (
      <div
        key={`dsparkle-${i}`}
        className="absolute animate-default-sparkle-float"
        style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}s` }}
      >
        <Sparkles 
          className="drop-shadow"
          style={{ width: p.size, height: p.size, color: p.color, opacity: 0.6 + Math.random() * 0.3 }}
        />
      </div>
    ))}

    {/* Soft glow orbs */}
    <div className="absolute top-[20%] left-[25%] w-36 h-36 rounded-full bg-amber-400/10 blur-3xl animate-love-glow" />
    <div className="absolute bottom-[25%] right-[20%] w-32 h-32 rounded-full bg-orange-400/10 blur-2xl animate-love-glow" style={{ animationDelay: "2s" }} />

    {/* Gentle floating stars */}
    {particles.slice(15, 22).map((p, i) => (
      <div
        key={`dstar-${i}`}
        className="absolute animate-float"
        style={{ left: `${p.x}%`, top: `${20 + (i % 4) * 18}%`, animationDelay: `${p.delay}s` }}
      >
        <Star style={{ width: p.size * 0.8, height: p.size * 0.8, color: "#FFD700", fill: "#FFD70080" }} />
      </div>
    ))}
  </div>
);

// =====================================================
// MAIN COMPONENT
// =====================================================
export function CinematicThemeEffects({ theme, isActive }: CinematicThemeEffectsProps) {
  const [mounted, setMounted] = useState(false);
  const particles = useMemo(() => generateParticles(40, THEME_COLORS[theme]), [theme]);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setMounted(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isActive || !mounted) return null;

  const themeComponents: Record<WishTheme, React.ReactNode> = {
    birthday: <BirthdayCinematic particles={particles} />,
    love: <LoveCinematic particles={particles} />,
    celebration: <CelebrationCinematic particles={particles} />,
    wedding: <WeddingCinematic particles={particles} />,
    valentine: <ValentineCinematic particles={particles} />,
    congratulations: <CongratsCinematic particles={particles} />,
    appreciation: <AppreciationCinematic particles={particles} />,
    festival: <FestivalCinematic particles={particles} />,
    event: <EventCinematic particles={particles} />,
    default: <DefaultCinematic particles={particles} />,
  };

  return (
    <div className={cn("absolute inset-0 z-5 overflow-hidden pointer-events-none", "animate-fade-in")}>
      {themeComponents[theme]}
    </div>
  );
}

export default CinematicThemeEffects;
