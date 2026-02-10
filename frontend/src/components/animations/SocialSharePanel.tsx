import { useState, useCallback, useRef } from 'react';
import { 
  Share2, Download, Copy, Check, Loader2, Link2, Camera,
  Mail, MessageCircle, Send, Instagram, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SocialSharePanelProps {
  targetRef: React.RefObject<HTMLElement>;
  fileName?: string;
  wishUrl?: string;
  className?: string;
  portfolioUrl?: string;
  siteName?: string;
}

const PORTFOLIO_URL = 'https://wishday.app';
const SITE_NAME = 'WishDay';
const PROMO_TEXT = `✨ Made with love on ${SITE_NAME} — Create your own magical wishes!`;

const socialPlatforms = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-[hsl(142,70%,45%)]',
    getUrl: (url: string, text: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n\n${url}\n\n${PROMO_TEXT}\n${PORTFOLIO_URL}`)}`,
  },
  {
    id: 'gmail',
    label: 'Gmail',
    icon: Mail,
    color: 'bg-[hsl(4,80%,56%)]',
    getUrl: (url: string, text: string) =>
      `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(`🎉 A Special Wish For You — ${SITE_NAME}`)}&body=${encodeURIComponent(`${text}\n\nOpen your wish: ${url}\n\n---\n${PROMO_TEXT}\n${PORTFOLIO_URL}`)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: Send,
    color: 'bg-[hsl(200,80%,50%)]',
    getUrl: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${text}\n\n${PROMO_TEXT}`)}`,
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    icon: ExternalLink,
    color: 'bg-[hsl(0,0%,10%)]',
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text}\n\n${PROMO_TEXT}`)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-br from-[hsl(37,97%,56%)] via-[hsl(340,82%,52%)] to-[hsl(280,70%,50%)]',
    getUrl: () => '', // Instagram doesn't support URL sharing — we capture image instead
    isImageOnly: true,
  },
];

export const SocialSharePanel = ({
  targetRef,
  fileName = 'wishday-wish',
  wishUrl,
  className,
}: SocialSharePanelProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const shareUrl = wishUrl || window.location.href;
  const shareText = 'Someone sent you a magical wish! Open to see the surprise 💫';

  const captureWithBranding = useCallback(async () => {
    if (!targetRef.current || isCapturing) return null;
    setIsCapturing(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      // Add branding footer
      const branded = document.createElement('canvas');
      const footerHeight = 80;
      branded.width = canvas.width;
      branded.height = canvas.height + footerHeight;
      const ctx = branded.getContext('2d')!;

      // Draw original
      ctx.drawImage(canvas, 0, 0);

      // Draw branded footer
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, canvas.height, branded.width, footerHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(branded.width * 0.028)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`✨ ${SITE_NAME}`, branded.width / 2, canvas.height + 35);

      ctx.fillStyle = '#aaaaaa';
      ctx.font = `${Math.round(branded.width * 0.02)}px Inter, sans-serif`;
      ctx.fillText(PORTFOLIO_URL, branded.width / 2, canvas.height + 60);

      const imageUrl = branded.toDataURL('image/png');
      setCapturedImage(imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Capture failed:', error);
      toast({ title: 'Capture failed', description: 'Please try again', variant: 'destructive' });
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [targetRef, isCapturing, toast]);

  const downloadImage = useCallback(async () => {
    const image = capturedImage || (await captureWithBranding());
    if (!image) return;

    const link = document.createElement('a');
    link.href = image;
    link.download = `${fileName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: '📥 Downloaded!', description: 'Branded image saved to downloads' });
  }, [capturedImage, captureWithBranding, fileName, toast]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}\n\n${PROMO_TEXT}\n${PORTFOLIO_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: '🔗 Copied!', description: 'Link with promo copied to clipboard' });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  }, [shareUrl, shareText, toast]);

  const handleSocialShare = useCallback(async (platform: typeof socialPlatforms[0]) => {
    if (platform.isImageOnly) {
      // For Instagram: capture and download the image
      await downloadImage();
      toast({
        title: '📸 Image ready for Instagram!',
        description: 'Open Instagram and share from your gallery',
      });
      return;
    }
    const url = platform.getUrl(shareUrl, shareText);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }, [shareUrl, shareText, downloadImage, toast]);

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;
    try {
      const shareData: ShareData = {
        title: `🎉 A Special Wish — ${SITE_NAME}`,
        text: `${shareText}\n\n${PROMO_TEXT}`,
        url: shareUrl,
      };

      if (capturedImage && navigator.canShare) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ ...shareData, files: [file] });
          return;
        }
      }
      await navigator.share(shareData);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') copyLink();
    }
  }, [capturedImage, shareUrl, shareText, fileName, copyLink]);

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'gap-2 backdrop-blur-md bg-background/80 border-primary/20',
          'hover:bg-primary/10 hover:border-primary/40 transition-all',
          isOpen && 'border-primary bg-primary/10'
        )}
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      {/* Expanded Share Panel */}
      {isOpen && (
        <div className={cn(
          'absolute top-full right-0 mt-2 p-4 rounded-2xl',
          'bg-background/95 backdrop-blur-xl border border-border/50',
          'shadow-card min-w-[280px] z-50',
          'animate-share-panel-in'
        )}>
          {/* Social Platform Buttons */}
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Share on</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {socialPlatforms.map((platform, i) => (
              <button
                key={platform.id}
                onClick={() => handleSocialShare(platform)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl',
                  'transition-all duration-300 hover:scale-105',
                  'bg-secondary/50 hover:bg-secondary',
                  'animate-share-item-in'
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white', platform.color)}>
                  <platform.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{platform.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={copyLink} className="flex-1 gap-1.5 text-xs">
              {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => captureWithBranding()} disabled={isCapturing} className="flex-1 gap-1.5 text-xs">
              {isCapturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              Capture
            </Button>
          </div>

          {capturedImage && (
            <Button variant="outline" size="sm" onClick={downloadImage} className="w-full gap-1.5 text-xs mb-3 animate-fade-in">
              <Download className="w-3.5 h-3.5" />
              Download Branded PNG
            </Button>
          )}

          {canNativeShare && (
            <Button variant="hero" size="sm" onClick={handleNativeShare} className="w-full gap-1.5">
              <Share2 className="w-4 h-4" />
              More Sharing Options
            </Button>
          )}

          {/* Branding Footer */}
          <div className="mt-3 pt-3 border-t border-border/50 text-center">
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              ✨ Powered by <span className="font-semibold">{SITE_NAME}</span> — Create magical wishes
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
