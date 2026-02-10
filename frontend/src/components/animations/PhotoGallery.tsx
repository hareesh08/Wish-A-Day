import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TransitionType = 'fade' | 'slide' | 'zoom' | 'flip';

interface PhotoGalleryProps {
  images: string[];
  className?: string;
}

const TRANSITIONS: TransitionType[] = ['fade', 'slide', 'zoom', 'flip'];

export const PhotoGallery = ({ images, className }: PhotoGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [transition, setTransition] = useState<TransitionType>('fade');
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Cycle transition style per slide change
  useEffect(() => {
    setTransition(TRANSITIONS[currentIndex % TRANSITIONS.length]);
  }, [currentIndex]);

  // Auto-advance
  useEffect(() => {
    if (images.length <= 1 || isFullscreen) return;
    const interval = setInterval(() => goToNext(), 5000);
    return () => clearInterval(interval);
  }, [images.length, isFullscreen, currentIndex]);

  const goToNext = useCallback(() => {
    if (isAnimating || images.length <= 1) return;
    setIsAnimating(true);
    setDirection('next');
    setPrevIndex(currentIndex);
    setCurrentIndex(prev => (prev + 1) % images.length);
    setTimeout(() => setIsAnimating(false), 700);
  }, [images.length, isAnimating, currentIndex]);

  const goToPrev = useCallback(() => {
    if (isAnimating || images.length <= 1) return;
    setIsAnimating(true);
    setDirection('prev');
    setPrevIndex(currentIndex);
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsAnimating(false), 700);
  }, [images.length, isAnimating, currentIndex]);

  const goToIndex = useCallback((index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setDirection(index > currentIndex ? 'next' : 'prev');
    setPrevIndex(currentIndex);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating, currentIndex]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'Escape') setIsFullscreen(false);
    };
    if (isFullscreen) {
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [isFullscreen, goToNext, goToPrev]);

  // Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToNext() : goToPrev();
    }
  };

  if (!images || images.length === 0) return null;

  const getSlideStyle = (index: number): string => {
    const isActive = index === currentIndex;
    const wasActive = index === prevIndex;

    if (!isActive && !wasActive) return 'opacity-0 scale-95 z-0';

    if (transition === 'slide') {
      if (isActive) return cn('z-10 animate-gallery-slide-in', direction === 'next' ? 'origin-right' : 'origin-left');
      if (wasActive) return cn('z-5 animate-gallery-slide-out', direction === 'next' ? 'origin-left' : 'origin-right');
    }
    if (transition === 'zoom') {
      if (isActive) return 'z-10 animate-gallery-zoom-in';
      if (wasActive) return 'z-5 animate-gallery-zoom-out';
    }
    if (transition === 'flip') {
      if (isActive) return 'z-10 animate-gallery-flip-in';
      if (wasActive) return 'z-5 animate-gallery-flip-out';
    }
    // Default fade
    if (isActive) return 'z-10 animate-gallery-fade-in';
    if (wasActive) return 'z-5 animate-gallery-fade-out';

    return 'opacity-0 z-0';
  };

  return (
    <>
      {/* Main Gallery */}
      <div
        className={cn("relative overflow-hidden rounded-xl group", className)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={cn(
                "absolute inset-0 transition-none",
                getSlideStyle(index)
              )}
            >
              <img
                src={image}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ))}

          {/* Photo counter badge */}
          {images.length > 1 && (
            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrev}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 z-20",
                "w-10 h-10 rounded-full",
                "bg-black/30 backdrop-blur-sm text-white",
                "hover:bg-black/50",
                "transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 z-20",
                "w-10 h-10 rounded-full",
                "bg-black/30 backdrop-blur-sm text-white",
                "hover:bg-black/50",
                "transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Fullscreen Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullscreen(true)}
          className={cn(
            "absolute top-2 right-2 z-20",
            "w-8 h-8 rounded-full",
            "bg-black/30 backdrop-blur-sm text-white",
            "hover:bg-black/50",
            "transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          )}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-2 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex justify-center gap-1.5">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={cn(
                    "w-10 h-7 rounded-sm overflow-hidden border-2 transition-all duration-300",
                    index === currentIndex
                      ? "border-white scale-110 shadow-lg"
                      : "border-transparent opacity-60 hover:opacity-90 hover:border-white/50"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center animate-gallery-fade-in"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-6 h-6" />
          </Button>

          <img
            src={images[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain animate-gallery-zoom-in"
          />

          {images.length > 1 && (
            <>
              <Button variant="ghost" size="icon" onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white">
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white">
                <ChevronRight className="w-6 h-6" />
              </Button>
              {/* Fullscreen thumbnails */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => goToIndex(index)}
                    className={cn(
                      "w-14 h-10 rounded overflow-hidden border-2 transition-all duration-300",
                      index === currentIndex
                        ? "border-white scale-110"
                        : "border-transparent opacity-50 hover:opacity-80"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
