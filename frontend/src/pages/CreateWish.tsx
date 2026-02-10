import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, Sparkles, Loader2, MessageSquare, Palette, 
  PartyPopper, Image, User, Clock, Eye, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ImageUploader";
import { ExpirySelector, ExpiryType } from "@/components/ExpirySelector";
import { ThemeSelector, WishTheme } from "@/components/ThemeSelector";
import { CelebrationItems, CelebrationItem } from "@/components/CelebrationItems";
import { SenderInfo } from "@/components/SenderInfo";
import { ShareLink } from "@/components/ShareLink";
import { WishCard } from "@/components/WishCard";
import { FormSection } from "@/components/FormSection";
import { ProgressSteps } from "@/components/ProgressSteps";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createWish, uploadImage } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CreateWish = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState<WishTheme>("default");
  const [expiryType, setExpiryType] = useState<ExpiryType>("time");
  const [expiresAt, setExpiresAt] = useState<Date>();
  const [maxViews, setMaxViews] = useState<number>();
  const [images, setImages] = useState<File[]>([]);
  const [celebrationItems, setCelebrationItems] = useState<CelebrationItem[]>([]);
  const [senderName, setSenderName] = useState("");
  const [senderMessage, setSenderMessage] = useState("");
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdWishUrl, setCreatedWishUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Set default expiry date (7 days from now)
  useEffect(() => {
    if (!expiresAt) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setExpiresAt(defaultDate);
    }
  }, [expiresAt]);

  // Progress calculation
  const hasMessage = message.trim().length > 0;
  const hasExpiry = (expiryType === "time" && expiresAt) || (expiryType === "views" && maxViews && maxViews > 0);
  const hasExtras = images.length > 0 || celebrationItems.length > 0 || senderName.trim().length > 0;

  const steps = [
    { label: "Message", completed: hasMessage },
    { label: "Theme", completed: theme !== "default" },
    { label: "Expiry", completed: !!hasExpiry },
  ];

  const isValid = hasMessage && hasExpiry;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim() || undefined,
        message: message.trim(),
        theme,
        celebration_items: celebrationItems.map(item => ({
          type: item.type,
          quantity: item.quantity,
          color: item.color,
          message: item.message,
        })),
        expires_at: expiryType === "time" && expiresAt ? expiresAt.toISOString() : undefined,
        max_views: expiryType === "views" ? maxViews : undefined,
        sender_name: senderName.trim() || undefined,
        sender_message: senderMessage.trim() || undefined,
      };

      const result = await createWish(payload);

      for (const image of images) {
        await uploadImage(result.slug, image);
      }

      setCreatedWishUrl(result.public_url);
      
      toast({
        title: "Wish created! 🎉",
        description: "Your wish is ready to share",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Failed to create wish. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (createdWishUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-12">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="container px-4 max-w-xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-button flex items-center justify-center shadow-glow rotate-3 hover:rotate-0 transition-transform">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Your wish is ready! 🎉
            </h1>
            <p className="text-muted-foreground">
              Share this link to spread the joy
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 animate-scale-in">
            <ShareLink url={createdWishUrl} />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
            <Button asChild variant="soft" size="lg">
              <a href={createdWishUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="w-4 h-4" />
                Preview Wish
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/create">
                <Sparkles className="w-4 h-4" />
                Create Another
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-16 right-4 z-40">
        <ThemeToggle />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            
            <div className="flex-1 flex justify-center">
              <ProgressSteps steps={steps} currentStep={hasMessage ? (theme !== "default" ? 2 : 1) : 0} />
            </div>
            
            <Button
              variant={showPreview ? "default" : "soft"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{showPreview ? "Edit" : "Preview"}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Create Your Wish ✨
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Craft a beautiful message to share with someone special
            </p>
          </div>

          {showPreview ? (
            <div className="animate-fade-in">
              <WishCard
                title={title || undefined}
                message={message || "Your message will appear here..."}
                theme={theme}
                images={images.map((f) => URL.createObjectURL(f))}
                celebrationItems={celebrationItems}
                senderName={senderName || undefined}
                senderMessage={senderMessage || undefined}
                isPreview={true}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Message Section */}
              <FormSection
                icon={MessageSquare}
                title="Your Message"
                description="What would you like to say?"
              >
                <div className="space-y-3">
                  <Input
                    placeholder="Title (e.g., Happy Birthday! 🎂)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    className="h-12 text-base font-medium placeholder:font-normal"
                  />
                  <div className="relative">
                    <Textarea
                      placeholder="Write your heartfelt message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      maxLength={2000}
                      className="resize-none text-base pr-16"
                    />
                    <span className={cn(
                      "absolute bottom-3 right-3 text-xs tabular-nums transition-colors",
                      message.length > 1800 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {message.length}/2000
                    </span>
                  </div>
                </div>
              </FormSection>

              {/* Theme Section */}
              <FormSection
                icon={Palette}
                title="Choose a Theme"
                description="Set the mood for your wish"
              >
                <ThemeSelector value={theme} onChange={setTheme} />
              </FormSection>

              {/* Celebration Items */}
              <FormSection
                icon={PartyPopper}
                title="Celebration Items"
                description="Add some fun elements"
                optional
              >
                <CelebrationItems items={celebrationItems} onChange={setCelebrationItems} />
              </FormSection>

              {/* Images */}
              <FormSection
                icon={Image}
                title="Add Photos"
                description="Share memorable moments"
                optional
              >
                <ImageUploader images={images} onImagesChange={setImages} />
              </FormSection>

              {/* Sender Info */}
              <FormSection
                icon={User}
                title="From You"
                description="Let them know who sent this"
                optional
              >
                <SenderInfo
                  senderName={senderName}
                  onSenderNameChange={setSenderName}
                  senderMessage={senderMessage}
                  onSenderMessageChange={setSenderMessage}
                />
              </FormSection>

              {/* Expiry */}
              <FormSection
                icon={Clock}
                title="Expiry Settings"
                description="When should this wish disappear?"
              >
                <ExpirySelector
                  expiryType={expiryType}
                  onExpiryTypeChange={setExpiryType}
                  expiresAt={expiresAt}
                  onExpiresAtChange={setExpiresAt}
                  maxViews={maxViews}
                  onMaxViewsChange={setMaxViews}
                />
              </FormSection>

              {/* Submit */}
              <div className="pt-4 sticky bottom-4">
                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full shadow-glow"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating your wish...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Create & Share Wish
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
                {!isValid && (
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    {!hasMessage ? "Add a message to continue" : "Choose an expiry option"}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateWish;
