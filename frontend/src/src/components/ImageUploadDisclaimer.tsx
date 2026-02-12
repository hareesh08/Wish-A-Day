import { useState } from "react";
import { AlertTriangle, Shield, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageUploadDisclaimerProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ImageUploadDisclaimer({
  isOpen,
  onAccept,
  onDecline,
}: ImageUploadDisclaimerProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToContent, setAgreedToContent] = useState(false);

  const canAccept = agreedToTerms && agreedToContent;

  const handleAccept = () => {
    if (canAccept) {
      // Save acceptance to session storage
      sessionStorage.setItem("wishday-disclaimer-accepted", "true");
      onAccept();
    }
  };

  const handleDecline = () => {
    setAgreedToTerms(false);
    setAgreedToContent(false);
    onDecline();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDecline()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Photo Upload Terms
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please read and accept the following terms before uploading photos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Data Retention Notice */}
          <div className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
            <Trash2 className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Data Retention Policy
              </h4>
              <p className="text-xs text-muted-foreground">
                Uploaded photos are <strong>not permanently stored</strong>. All images 
                will be automatically deleted based on the wish expiry settings you choose. 
                We do not retain or archive your photos after expiration.
              </p>
            </div>
          </div>

          {/* Content Guidelines */}
          <div className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Prohibited Content
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                The following types of content are <strong>strictly prohibited</strong>:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Adult, explicit, or NSFW content</li>
                <li>Illegal content or materials</li>
                <li>Violence or graphic imagery</li>
                <li>Hate speech or discriminatory content</li>
                <li>Copyrighted material without permission</li>
              </ul>
            </div>
          </div>

          {/* Liability Disclaimer */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> The owner and operators of WishDay are not 
              responsible for any content uploaded by users. By uploading photos, you 
              confirm that you have the right to share them and that they comply with 
              our content guidelines. Violation may result in content removal and 
              account restrictions.
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                I understand that my photos will be deleted and not retained permanently
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                checked={agreedToContent}
                onCheckedChange={(checked) => setAgreedToContent(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                I confirm my photos do not contain adult, illegal, or prohibited content
              </span>
            </label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!canAccept}
            className={cn(
              "w-full sm:w-auto gap-2",
              canAccept && "bg-primary hover:bg-primary/90"
            )}
          >
            {canAccept && <CheckCircle2 className="w-4 h-4" />}
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
