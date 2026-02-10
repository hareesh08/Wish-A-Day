import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { WishTheme } from '@/components/ThemeSelector';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  velocityX: number;
  velocityY: number;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'triangle' | 'star';
}

interface ConfettiCannonProps {
  theme: WishTheme;
  trigger: boolean;
  onComplete?: () => void;
}

const themeColors: Record<WishTheme, string[]> = {
  birthday: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32'],
  love: ['#FF1493', '#FF69B4', '#FFB6C1', '#DC143C', '#C71585'],
  wedding: ['#FFFAF0', '#FFD700', '#F0E68C', '#FAEBD7', '#FFF8DC'],
  valentine: ['#FF1493', '#DC143C', '#FF69B4', '#C71585', '#FF6B6B'],
  congratulations: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B'],
  appreciation: ['#E6E6FA', '#DDA0DD', '#EE82EE', '#DA70D6', '#BA55D3'],
  festival: ['#FF6347', '#FFD700', '#00CED1', '#9370DB', '#32CD32', '#FF69B4'],
  event: ['#4169E1', '#1E90FF', '#00BFFF', '#87CEEB', '#6495ED'],
  celebration: ['#FF6347', '#FFD700', '#32CD32', '#1E90FF', '#FF69B4', '#9370DB'],
  default: ['#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'],
};

const shapes = ['square', 'circle', 'triangle', 'star'] as const;

export const ConfettiCannon = ({ theme, trigger, onComplete }: ConfettiCannonProps) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  const fireConfetti = useCallback((originX: number, originY: number, angle: number) => {
    const colors = themeColors[theme] || themeColors.default;
    const pieces: ConfettiPiece[] = [];
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 15 : 25; // Reduced from 30
    
    for (let i = 0; i < count; i++) {
      const spreadAngle = angle + (Math.random() - 0.5) * 60;
      const velocity = 15 + Math.random() * 10;
      const radians = (spreadAngle * Math.PI) / 180;
      
      pieces.push({
        id: Date.now() + i,
        x: originX,
        y: originY,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        velocityX: Math.cos(radians) * velocity,
        velocityY: Math.sin(radians) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    
    return pieces;
  }, [theme]);
  
  useEffect(() => {
    if (!trigger || prefersReducedMotion) return;
    
    // Fire from both corners
    const leftPieces = fireConfetti(0, window.innerHeight, -45);
    const rightPieces = fireConfetti(window.innerWidth, window.innerHeight, -135);
    
    setConfetti([...leftPieces, ...rightPieces]);
    
    // Animate
    let frame = 0;
    const gravity = 0.5;
    const friction = 0.99;
    
    const animate = () => {
      frame++;
      
      setConfetti(prev => {
        const updated = prev.map(piece => ({
          ...piece,
          x: piece.x + piece.velocityX,
          y: piece.y + piece.velocityY,
          velocityX: piece.velocityX * friction,
          velocityY: piece.velocityY + gravity,
          rotation: piece.rotation + piece.rotationSpeed,
        }));
        
        // Filter out pieces that have fallen off screen
        return updated.filter(p => p.y < window.innerHeight + 100);
      });
      
      if (frame < 180) {
        requestAnimationFrame(animate);
      } else {
        setConfetti([]);
        onComplete?.();
      }
    };
    
    requestAnimationFrame(animate);
  }, [trigger, fireConfetti, onComplete, prefersReducedMotion]);
  
  if (!trigger || prefersReducedMotion) return null;
  
  const renderShape = (piece: ConfettiPiece) => {
    switch (piece.shape) {
      case 'circle':
        return <circle cx="50%" cy="50%" r="40%" fill={piece.color} />;
      case 'triangle':
        return <polygon points="50,0 100,100 0,100" fill={piece.color} />;
      case 'star':
        return (
          <path
            d="M50 0L61 35H98L68 57L79 91L50 70L21 91L32 57L2 35H39L50 0Z"
            fill={piece.color}
            transform="scale(0.5) translate(50, 50)"
          />
        );
      default:
        return <rect width="100%" height="100%" fill={piece.color} />;
    }
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {confetti.map(piece => (
        <svg
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            transform: `translate(-50%, -50%) rotate(${piece.rotation}deg)`,
          }}
          viewBox="0 0 100 100"
        >
          {renderShape(piece)}
        </svg>
      ))}
    </div>
  );
};
