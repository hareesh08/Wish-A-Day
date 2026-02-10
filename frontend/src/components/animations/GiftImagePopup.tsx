import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WishTheme } from '@/components/ThemeSelector';

interface GiftImagePopupProps {
  images: string[];
  theme: WishTheme;
  isActive: boolean;
  onClose?: () => void;
}

export const GiftImagePopup = ({ images, theme, isActive, onClose }: GiftImagePopupProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);
  const [revealedImages, setRevealedImages] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);

  // Sequentially reveal images with animation
  useEffect(() => {
    if (!isActive || images.length === 0) return;

    const timers: NodeJS.Timeout[] = [];
    images.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setRevealedImages(prev => {
            const next = new Set(prev);
            next.add(i);
            if (next.size === images.length) setAllRevealed(true);
            return next;
          });
        }, 800 + i * 600)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [isActive, images]);

  const openPopup = useCallback((index: number) => {
    setPopupIndex(index);
    setShowPopup(true);
  }, []);

  const closePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  const navigate = useCallback((dir: 1 | -1) => {
    setPopupIndex(prev => (prev + dir + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!showPopup) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showPopup, navigate, closePopup]);

  if (!images.length) return null;

  return (
    <>
      {/* Image Grid with Reveal Animations */}
      <div className={cn(
        'grid gap-3',
        images.length === 1 && 'grid-cols-1',
        images.length === 2 && 'grid-cols-2',
        images.length >= 3 && 'grid-cols-2 sm:grid-cols-3',
      )}>
        {images.map((src, index) => (
          <div
            key={index}
            className={cn(
              'relative rounded-xl overflow-hidden cursor-pointer group',
              'transform transition-all duration-700',
              revealedImages.has(index)
                ? 'opacity-100 scale-100 animate-gift-image-reveal'
                : 'opacity-0 scale-75',
              images.length === 1 && 'col-span-full',
              images.length === 3 && index === 2 && 'col-span-2 sm:col-span-1',
            )}
            style={{ animationDelay: `${index * 150}ms` }}
            onClick={() => openPopup(index)}
          >
            {/* Gift unwrap overlay */}
            {revealedImages.has(index) && (
              <div className="absolute inset-0 z-10 pointer-events-none animate-gift-unwrap">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-transparent" />
                <Sparkles className="absolute top-2 right-2 w-5 h-5 text-accent animate-sparkle" />
              </div>
            )}

            <div className="aspect-square bg-secondary/20">
              <img
                src={src}
                alt={`Gift image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </div>

            {/* Hover zoom icon */}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center animate-popup-backdrop"
          onClick={closePopup}
        >
          <div className="absolute inset-0 bg-foreground/90 backdrop-blur-md" />

          {/* Close button */}
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-background" />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="absolute left-4 z-10 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-background" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                className="absolute right-4 z-10 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-background" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] animate-popup-image-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[popupIndex]}
              alt={`Gift ${popupIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-sm">
                <span className="text-xs text-background font-medium">
                  {popupIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>

          {/* Dots indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setPopupIndex(i); }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === popupIndex ? 'bg-background w-6' : 'bg-background/40 hover:bg-background/60'
                  )}
                />
              ))}
            </div>
          )}

          {/* Branding */}
          <div className="absolute bottom-2 right-4">
            <span className="text-[10px] text-background/40">✨ WishDay</span>
          </div>
        </div>
      )}
    </>
  );
};
