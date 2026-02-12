import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { PartyPopper, Cake, Star, Sparkles, Gift } from "lucide-react";

interface CinematicBirthdayProps {
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

const BALLOON_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181", 
  "#AA96DA", "#FF69B4", "#00D4AA", "#FFB347", "#87CEEB"
];

const CONFETTI_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#FF69B4", "#9370DB",
  "#00CED1", "#F38181", "#FFD700", "#98D8C8", "#FF85C0"
];

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 3 + Math.random() * 4,
    size: 8 + Math.random() * 16,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotation: Math.random() * 360,
  }));
};

// Cinematic 3D Balloon with realistic shine and string
const CinematicBalloon = ({ 
  color, 
  size, 
  delay, 
  x 
}: { 
  color: string; 
  size: number; 
  delay: number; 
  x: number;
}) => (
  <div
    className="absolute bottom-0 animate-cinematic-balloon-rise"
    style={{
      left: `${x}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${6 + delay}s`,
    }}
  >
    <div className="relative transform-gpu">
      {/* Balloon shadow */}
      <div 
        className="absolute rounded-full blur-md opacity-30"
        style={{ 
          width: size * 1.6,
          height: size * 2,
          backgroundColor: color,
          top: 8,
          left: 4,
        }}
      />
      
      {/* Main balloon body */}
      <div 
        className="balloon-3d relative"
        style={{ 
          width: size * 1.8,
          height: size * 2.2,
          background: `radial-gradient(ellipse at 30% 25%, 
            ${color}ff 0%, 
            ${color}ee 25%, 
            ${color}cc 50%, 
            ${color}99 75%, 
            ${color}77 100%)`,
          borderRadius: "50% 50% 50% 50% / 55% 55% 45% 45%",
          boxShadow: `
            inset -8px -8px 20px rgba(0,0,0,0.2),
            inset 8px 8px 20px rgba(255,255,255,0.3),
            0 8px 32px ${color}40
          `,
        }}
      >
        {/* Primary highlight */}
        <div 
          className="absolute rounded-full"
          style={{
            top: "15%",
            left: "20%",
            width: "35%",
            height: "25%",
            background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
            borderRadius: "50%",
            filter: "blur(2px)",
          }}
        />
        
        {/* Secondary highlight */}
        <div 
          className="absolute rounded-full"
          style={{
            top: "25%",
            left: "55%",
            width: "15%",
            height: "12%",
            background: "rgba(255,255,255,0.5)",
            borderRadius: "50%",
            filter: "blur(1px)",
          }}
        />

        {/* Balloon knot */}
        <div 
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: "-4px",
            width: 8,
            height: 10,
            background: color,
            clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
            filter: "brightness(0.8)",
          }}
        />
      </div>
      
      {/* Curly string */}
      <svg 
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: size * 2.2 + 4 }}
        width="20" 
        height={size * 2}
        viewBox="0 0 20 60"
      >
        <path
          d="M10 0 Q5 15 15 25 Q5 35 15 45 Q5 55 10 60"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.7"
          className="animate-string-wave"
        />
      </svg>
    </div>
  </div>
);

// Cinematic confetti with physics
const CinematicConfetti = ({ particle }: { particle: Particle }) => (
  <div
    className="absolute animate-cinematic-confetti-fall pointer-events-none"
    style={{
      left: `${particle.x}%`,
      animationDelay: `${particle.delay}s`,
      animationDuration: `${particle.duration}s`,
    }}
  >
    <div
      className="animate-confetti-spin"
      style={{
        width: particle.size * 0.5,
        height: particle.size * 0.8,
        backgroundColor: particle.color,
        transform: `rotate(${particle.rotation}deg)`,
        borderRadius: Math.random() > 0.5 ? "2px" : "50%",
        boxShadow: `0 2px 8px ${particle.color}60`,
      }}
    />
  </div>
);

// Animated birthday cake with flickering candles
const CinematicCake = ({ delay = 0 }: { delay?: number }) => (
  <div 
    className="absolute bottom-[8%] right-[10%] animate-cinematic-cake-entrance"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="relative w-20 h-16">
      {/* Cake base layers */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-8 rounded-lg bg-gradient-to-b from-pink-400 to-pink-500 shadow-lg">
        <div className="absolute inset-x-2 top-1 h-1 bg-white/30 rounded" />
        <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-pink-600 to-transparent rounded-b-lg" />
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-6 rounded-lg bg-gradient-to-b from-rose-300 to-rose-400">
        <div className="absolute inset-x-2 top-1 h-0.5 bg-white/40 rounded" />
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-12 h-5 rounded-lg bg-gradient-to-b from-pink-200 to-pink-300">
        <div className="absolute inset-x-1 top-0.5 h-0.5 bg-white/50 rounded" />
      </div>
      
      {/* Frosting drips */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute bg-pink-200 rounded-full"
          style={{
            width: 4 + Math.random() * 4,
            height: 8 + Math.random() * 8,
            bottom: 13,
            left: 4 + i * 16,
            borderRadius: "0 0 50% 50%",
          }}
        />
      ))}
      
      {/* Candles with realistic flames */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: 30 + i * 14, bottom: 52 }}
        >
          {/* Candle body */}
          <div className="w-2 h-5 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-sm shadow-inner">
            <div className="absolute inset-x-0 top-0 h-1 bg-white/50 rounded-t-sm" />
          </div>
          {/* Wick */}
          <div className="absolute w-0.5 h-1.5 bg-gray-700 left-1/2 -translate-x-1/2 -top-1" />
          {/* Flame layers */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 -top-5 animate-flame-dance"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {/* Outer flame glow */}
            <div className="absolute w-4 h-6 bg-orange-300/50 rounded-full blur-sm -left-1 -top-1" />
            {/* Main flame */}
            <div className="relative w-2 h-4 bg-gradient-to-t from-yellow-500 via-orange-400 to-transparent rounded-full">
              {/* Inner bright core */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-gradient-to-t from-yellow-200 to-white rounded-full" />
            </div>
          </div>
        </div>
      ))}
      
      {/* Cake sparkle effects */}
      <Sparkles 
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-300 animate-sparkle-pulse"
      />
    </div>
  </div>
);

// Firework burst effect
const Firework = ({ 
  x, 
  y, 
  color, 
  delay 
}: { 
  x: number; 
  y: number; 
  color: string; 
  delay: number;
}) => (
  <div
    className="absolute animate-firework-launch"
    style={{ 
      left: `${x}%`, 
      bottom: 0,
      animationDelay: `${delay}s`,
    }}
  >
    <div className="relative">
      {/* Trail */}
      <div 
        className="w-1 h-8 animate-trail-fade"
        style={{ 
          background: `linear-gradient(to top, ${color}, transparent)`,
        }}
      />
      
      {/* Burst particles */}
      <div 
        className="absolute -top-4 left-1/2 -translate-x-1/2 animate-firework-explode"
        style={{ animationDelay: `${delay + 0.8}s` }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-spark-fly"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}, 0 0 16px ${color}80`,
              transform: `rotate(${i * 30}deg) translateY(-${20 + Math.random() * 20}px)`,
              animationDelay: `${delay + 0.8 + i * 0.02}s`,
            }}
          />
        ))}
        {/* Secondary smaller particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute w-1 h-1 rounded-full animate-spark-fly-small"
            style={{
              backgroundColor: color,
              opacity: 0.7,
              transform: `rotate(${i * 45 + 22.5}deg) translateY(-${15 + Math.random() * 15}px)`,
              animationDelay: `${delay + 0.85 + i * 0.03}s`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Star burst decoration
const StarBurst = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <div
    className="absolute animate-star-pop"
    style={{ 
      left: `${x}%`, 
      top: `${y}%`,
      animationDelay: `${delay}s`,
    }}
  >
    <Star 
      className="w-6 h-6 text-yellow-400 fill-yellow-300 drop-shadow-lg animate-star-twinkle"
      style={{ animationDelay: `${delay + 0.3}s` }}
    />
  </div>
);

// Main cinematic birthday animation component
export function CinematicBirthdayAnimation({ isActive }: CinematicBirthdayProps) {
  const [phase, setPhase] = useState<"intro" | "main" | "celebration">("intro");
  const confettiParticles = useMemo(() => generateParticles(35), []);

  useEffect(() => {
    if (!isActive) return;

    const timers = [
      setTimeout(() => setPhase("main"), 500),
      setTimeout(() => setPhase("celebration"), 2000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className={cn(
      "absolute inset-0 overflow-hidden pointer-events-none z-5",
      "animate-fade-in"
    )}>
      {/* Cinematic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-pink-900/10 animate-gradient-pulse" />
      
      {/* Floating balloons with 3D effect */}
      {BALLOON_COLORS.slice(0, 8).map((color, i) => (
        <CinematicBalloon
          key={`balloon-${i}`}
          color={color}
          size={24 + (i % 3) * 8}
          delay={i * 0.4}
          x={8 + i * 11}
        />
      ))}

      {/* Confetti rain */}
      {phase !== "intro" && confettiParticles.map((particle) => (
        <CinematicConfetti key={particle.id} particle={particle} />
      ))}

      {/* Party poppers */}
      <div 
        className="absolute top-[5%] left-[5%] animate-popper-burst"
        style={{ animationDelay: "1s" }}
      >
        <PartyPopper className="w-12 h-12 text-pink-500 drop-shadow-lg" />
        <div className="absolute inset-0 animate-popper-particles">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-particle-fly"
              style={{
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                transform: `rotate(${i * 45}deg)`,
                animationDelay: `${1.2 + i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      <div 
        className="absolute top-[8%] right-[6%] animate-popper-burst scale-x-[-1]"
        style={{ animationDelay: "1.5s" }}
      >
        <PartyPopper className="w-10 h-10 text-yellow-500 drop-shadow-lg" />
      </div>

      {/* Fireworks */}
      {phase === "celebration" && (
        <>
          <Firework x={20} y={25} color="#FF6B6B" delay={0} />
          <Firework x={50} y={20} color="#4ECDC4" delay={0.5} />
          <Firework x={75} y={30} color="#FFE66D" delay={1} />
          <Firework x={35} y={35} color="#FF69B4" delay={1.5} />
          <Firework x={65} y={28} color="#9370DB" delay={2} />
        </>
      )}

      {/* Star bursts */}
      {phase !== "intro" && (
        <>
          <StarBurst x={15} y={20} delay={0.3} />
          <StarBurst x={80} y={15} delay={0.6} />
          <StarBurst x={60} y={35} delay={0.9} />
          <StarBurst x={25} y={45} delay={1.2} />
          <StarBurst x={85} y={40} delay={1.5} />
        </>
      )}

      {/* Birthday cake */}
      <CinematicCake delay={0.8} />

      {/* Gifts */}
      <div 
        className="absolute bottom-[10%] left-[12%] animate-gift-bounce"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="relative">
          <Gift className="w-10 h-10 text-red-500 drop-shadow-lg" />
          <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400 animate-sparkle-rotate" />
        </div>
      </div>

      {/* Sparkle overlay */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute animate-birthday-sparkle"
            style={{
              left: `${5 + (i * 5)}%`,
              top: `${10 + (i % 5) * 18}%`,
              animationDelay: `${i * 0.15}s`,
            }}
          >
            <div className="w-1 h-1 bg-white rounded-full shadow-lg" 
              style={{ 
                boxShadow: `0 0 4px #fff, 0 0 8px #FFD700`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Light rays */}
      <div className="absolute inset-0 animate-light-rays opacity-20">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`ray-${i}`}
            className="absolute top-0 h-full w-px bg-gradient-to-b from-yellow-200 via-transparent to-transparent"
            style={{
              left: `${15 + i * 14}%`,
              transform: `rotate(${-10 + i * 4}deg)`,
              transformOrigin: "top center",
              opacity: 0.3 + (i % 2) * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default CinematicBirthdayAnimation;
