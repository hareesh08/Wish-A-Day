import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { WishTheme } from '@/components/ThemeSelector';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  createdAt: number;
}

interface SparkleTrailProps {
  theme: WishTheme;
  isActive: boolean;
}

const themeColors: Record<WishTheme, string[]> = {
  birthday: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347'],
  love: ['#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB'],
  wedding: ['#FFFAF0', '#FFD700', '#F0E68C', '#FAEBD7'],
  valentine: ['#FF1493', '#DC143C', '#FF69B4', '#C71585'],
  congratulations: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520'],
  appreciation: ['#E6E6FA', '#DDA0DD', '#EE82EE', '#DA70D6'],
  festival: ['#FF6347', '#FFD700', '#00CED1', '#9370DB'],
  event: ['#4169E1', '#1E90FF', '#00BFFF', '#87CEEB'],
  celebration: ['#FF6347', '#FFD700', '#32CD32', '#1E90FF'],
  default: ['#A855F7', '#EC4899', '#3B82F6', '#10B981'],
};

export const SparkleTrail = ({ theme, isActive }: SparkleTrailProps) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  const createSparkle = useCallback((x: number, y: number) => {
    if (prefersReducedMotion || !isActive) return;
    
    const colors = themeColors[theme] || themeColors.default;
    const newSparkle: Sparkle = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: Date.now(),
    };
    
    setSparkles(prev => [...prev.slice(-20), newSparkle]);
  }, [theme, isActive, prefersReducedMotion]);
  
  useEffect(() => {
    if (!isActive || prefersReducedMotion) return;
    
    let lastTime = 0;
    const throttleMs = 50;
    
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const now = Date.now();
      if (now - lastTime < throttleMs) return;
      lastTime = now;
      
      const point = 'touches' in e ? e.touches[0] : e;
      if (point) {
        createSparkle(point.clientX, point.clientY);
      }
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [isActive, createSparkle, prefersReducedMotion]);
  
  // Cleanup old sparkles
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSparkles(prev => prev.filter(s => now - s.createdAt < 1000));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!isActive || prefersReducedMotion) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {sparkles.map(sparkle => {
        const age = (Date.now() - sparkle.createdAt) / 1000;
        const opacity = Math.max(0, 1 - age);
        const scale = 1 + age * 0.5;
        
        return (
          <div
            key={sparkle.id}
            className="absolute animate-sparkle-float"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              width: sparkle.size,
              height: sparkle.size,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transition: 'opacity 0.3s, transform 0.3s',
            }}
          >
            <svg viewBox="0 0 24 24" fill={sparkle.color}>
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
