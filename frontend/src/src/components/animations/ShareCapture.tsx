import { useState, useCallback, useRef } from 'react';
import { Camera, Download, Share2, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShareCaptureProps {
  targetRef: React.RefObject<HTMLElement>;
  fileName?: string;
  className?: string;
}

export const ShareCapture = ({ targetRef, fileName = 'wish', className }: ShareCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const captureScreenshot = useCallback(async () => {
    if (!targetRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      // Dynamically import html2canvas to reduce bundle size
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setCapturedImage(imageUrl);
    } catch (error) {
      console.error('Screenshot failed:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [targetRef, isCapturing]);
  
  const downloadImage = useCallback(() => {
    if (!capturedImage) return;
    
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `${fileName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }, [capturedImage, fileName]);
  
  const shareImage = useCallback(async () => {
    if (!capturedImage) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Wish',
          text: 'Check out this special wish!',
        });
      } else if (navigator.share) {
        // Fallback to sharing URL if file sharing isn't supported
        await navigator.share({
          title: 'My Wish',
          text: 'Check out this special wish!',
          url: window.location.href,
        });
      } else {
        // Fallback - download instead
        downloadImage();
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
        downloadImage();
      }
    }
  }, [capturedImage, fileName, downloadImage]);
  
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Capture Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={captureScreenshot}
        disabled={isCapturing}
        className={cn(
          "gap-2 backdrop-blur-md",
          "bg-background/80 border-primary/20",
          "hover:bg-primary/10 hover:border-primary/40",
          "transition-all"
        )}
      >
        {isCapturing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
        <span>Capture</span>
      </Button>
      
      {/* Download/Share Buttons - show after capture */}
      {capturedImage && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadImage}
            className={cn(
              "gap-2 backdrop-blur-md animate-fade-in",
              "bg-background/80 border-primary/20",
              "hover:bg-primary/10 hover:border-primary/40",
              showSuccess && "border-accent bg-accent/10"
            )}
          >
            {showSuccess ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download</span>
          </Button>
          
          {canShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={shareImage}
              className={cn(
                "gap-2 backdrop-blur-md animate-fade-in",
                "bg-background/80 border-primary/20",
                "hover:bg-primary/10 hover:border-primary/40"
              )}
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          )}
        </>
      )}
    </div>
  );
};
