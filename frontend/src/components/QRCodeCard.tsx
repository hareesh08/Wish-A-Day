import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QRCodeCardProps {
  url: string;
  className?: string;
}

export function QRCodeCard({ url, className }: QRCodeCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 512;
    canvas.height = 600;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      // Background
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(0, 0, 512, 600, 24);
      ctx.fill();

      // QR code centered
      ctx.drawImage(img, 56, 40, 400, 400);

      // Brand text
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ WishDay', 256, 480);

      ctx.fillStyle = '#888888';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('Scan to open your wish', 256, 510);

      // Accent bar
      const gradient = ctx.createLinearGradient(56, 540, 456, 540);
      gradient.addColorStop(0, '#e8734a');
      gradient.addColorStop(1, '#f0b040');
      ctx.fillStyle = gradient;
      ctx.roundRect(56, 540, 400, 4, 2);
      ctx.fill();

      const link = document.createElement('a');
      link.download = 'wishday-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-xl shadow-sm border border-border"
      >
        <QRCodeSVG
          value={url}
          size={160}
          bgColor="#ffffff"
          fgColor="#1a1a1a"
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="text-xs text-muted-foreground">Scan to open wish</p>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadQR}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Download QR
      </Button>
    </div>
  );
}
