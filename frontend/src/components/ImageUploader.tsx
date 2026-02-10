import { useState, useCallback } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageUploadDisclaimer } from "./ImageUploadDisclaimer";

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 2,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);

  // Check if disclaimer was already accepted in this session
  const isDisclaimerAccepted = () => {
    return sessionStorage.getItem("wishday-disclaimer-accepted") === "true";
  };

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      setError(null);

      const newFiles: File[] = [];
      const remaining = maxImages - images.length;

      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        const file = files[i];
        if (validateFile(file)) {
          newFiles.push(file);
        }
      }

      if (files.length > remaining) {
        setError(`You can only upload ${maxImages} images total`);
      }

      if (newFiles.length > 0) {
        onImagesChange([...images, ...newFiles]);
      }
    },
    [images, maxImages, maxSizeMB, onImagesChange]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      
      // Check if disclaimer already accepted
      if (isDisclaimerAccepted()) {
        processFiles(files);
      } else {
        // Store files and show disclaimer
        setPendingFiles(files);
        setShowDisclaimer(true);
      }
    },
    [processFiles]
  );

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    if (pendingFiles) {
      processFiles(pendingFiles);
      setPendingFiles(null);
    }
  };

  const handleDisclaimerDecline = () => {
    setShowDisclaimer(false);
    setPendingFiles(null);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
    setError(null);
  };

  const isDisabled = images.length >= maxImages;

  return (
    <div className="space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 group",
          dragActive && !isDisabled && "border-primary bg-primary/5 scale-[1.01]",
          isDisabled
            ? "border-muted bg-muted/30 cursor-not-allowed"
            : "border-border hover:border-primary/50 hover:bg-secondary/30 cursor-pointer"
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          disabled={isDisabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
              isDisabled 
                ? "bg-muted" 
                : "bg-primary/10 group-hover:bg-primary/20 group-hover:scale-105"
            )}
          >
            <Upload
              className={cn(
                "w-5 h-5 transition-colors",
                isDisabled ? "text-muted-foreground" : "text-primary"
              )}
            />
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">
              {isDisabled ? "Maximum images reached" : "Drop images or tap to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Up to {maxImages} images • {maxSizeMB}MB max each
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive animate-fade-in flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((file, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden shadow-sm border border-border/50 animate-scale-in"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-background/80 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}/{images.length}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
            style={{ width: `${(images.length / maxImages) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {images.length}/{maxImages}
        </span>
      </div>

      {/* Disclaimer Dialog */}
      <ImageUploadDisclaimer
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
      />
    </div>
  );
}
