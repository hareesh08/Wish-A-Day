import { useState, useCallback, useRef } from 'react';
import { Camera, Download, Share2, Loader2, Check, Copy, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EnhancedShareCaptureProps {
  targetRef: React.RefObject<HTMLElement>;
  fileName?: string;
  wishUrl?: string;
  className?: string;
}

export const EnhancedShareCapture = ({ 
  targetRef, 
  fileName = 'wishday-wish', 
  wishUrl,
  className 
}: EnhancedShareCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const { toast } = useToast();
  
  const captureScreenshot = useCallback(async () => {
    if (!targetRef.current || isCapturing) return;
    
    setIsCapturing(true);
    setActiveAction('capture');
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setCapturedImage(imageUrl);
      
      toast({
        title: "✨ Captured!",
        description: "Your wish is ready to share",
      });
    } catch (error) {
      console.error('Screenshot failed:', error);
      toast({
        title: "Capture failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
      setActiveAction(null);
    }
  }, [targetRef, isCapturing, toast]);
  
  const downloadImage = useCallback(() => {
    if (!capturedImage) return;
    
    setActiveAction('download');
    
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `${fileName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setActiveAction(null);
    }, 2000);
    
    toast({
      title: "📥 Downloaded!",
      description: "Check your downloads folder",
    });
  }, [capturedImage, fileName, toast]);
  
  const copyLink = useCallback(async () => {
    const url = wishUrl || window.location.href;
    setActiveAction('copy');
    
    try {
      await navigator.clipboard.writeText(url);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveAction(null);
      }, 2000);
      
      toast({
        title: "🔗 Link copied!",
        description: "Share it with your friends",
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [wishUrl, toast]);
  
  const shareNative = useCallback(async () => {
    setActiveAction('share');
    
    const shareData: ShareData = {
      title: 'WishDay - A Special Wish For You ✨',
      text: 'Someone sent you a magical wish! Open to see it 💫',
      url: wishUrl || window.location.href,
    };
    
    try {
      // Try sharing with captured image if available
      if (capturedImage && navigator.canShare) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            ...shareData,
            files: [file],
          });
          setActiveAction(null);
          return;
        }
      }
      
      // Fallback to URL sharing
      if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
        // Fallback to copy link
        copyLink();
      }
    }
    
    setActiveAction(null);
  }, [capturedImage, fileName, wishUrl, copyLink]);
  
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
  
  return (
    <div className={cn(
      "flex flex-wrap items-center justify-center gap-2",
      className
    )}>
      {/* Copy Link Button - Always available */}
      <Button
        variant="outline"
        size="sm"
        onClick={copyLink}
        className={cn(
          "gap-2 backdrop-blur-md",
          "bg-background/80 border-primary/20",
          "hover:bg-primary/10 hover:border-primary/40",
          "transition-all",
          activeAction === 'copy' && showSuccess && "border-accent bg-accent/10"
        )}
      >
        {activeAction === 'copy' && showSuccess ? (
          <Check className="w-4 h-4 text-accent" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Copy Link</span>
      </Button>
      
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
        <span className="hidden sm:inline">Capture</span>
      </Button>
      
      {/* Download Button - show after capture */}
      {capturedImage && (
        <Button
          variant="outline"
          size="sm"
          onClick={downloadImage}
          className={cn(
            "gap-2 backdrop-blur-md animate-fade-in",
            "bg-background/80 border-primary/20",
            "hover:bg-primary/10 hover:border-primary/40",
            activeAction === 'download' && showSuccess && "border-accent bg-accent/10"
          )}
        >
          {activeAction === 'download' && showSuccess ? (
            <Check className="w-4 h-4 text-accent" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Download</span>
        </Button>
      )}
      
      {/* Share Button - Native share */}
      {canShare && (
        <Button
          variant="hero"
          size="sm"
          onClick={shareNative}
          className={cn(
            "gap-2 animate-pulse-soft",
            "shadow-lg"
          )}
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </Button>
      )}
    </div>
  );
};
