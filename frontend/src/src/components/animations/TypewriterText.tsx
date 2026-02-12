import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number; // ms per character
  delay?: number; // initial delay before starting
  onComplete?: () => void;
  showCursor?: boolean;
  cursorColor?: string;
}

export function TypewriterText({
  text,
  className,
  speed = 50,
  delay = 0,
  onComplete,
  showCursor = true,
  cursorColor = "hsl(var(--primary))",
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startTyping = () => {
      setIsTyping(true);
      let currentIndex = 0;

      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          
          // Vary speed slightly for natural feel
          const nextDelay = speed + (Math.random() - 0.5) * 20;
          setTimeout(typeNextChar, nextDelay);
        } else {
          setIsTyping(false);
          setIsComplete(true);
          onComplete?.();
        }
      };

      typeNextChar();
    };

    const timer = setTimeout(startTyping, delay);
    return () => clearTimeout(timer);
  }, [text, speed, delay, onComplete]);

  return (
    <div ref={containerRef} className={cn("relative inline", className)}>
      <span className="whitespace-pre-wrap">{displayedText}</span>
      {showCursor && !isComplete && (
        <span 
          className={cn(
            "inline-block w-0.5 h-[1.2em] ml-0.5 align-middle",
            isTyping ? "animate-cursor-blink" : "opacity-100"
          )}
          style={{ backgroundColor: cursorColor }}
        />
      )}
      {/* Invisible full text for proper sizing */}
      <span className="sr-only">{text}</span>
    </div>
  );
}

// Multi-line typewriter for longer messages
interface TypewriterMessageProps {
  title?: string;
  message: string;
  titleClassName?: string;
  messageClassName?: string;
  titleSpeed?: number;
  messageSpeed?: number;
  onTitleComplete?: () => void;
  onMessageComplete?: () => void;
}

export function TypewriterMessage({
  title,
  message,
  titleClassName,
  messageClassName,
  titleSpeed = 60,
  messageSpeed = 30,
  onTitleComplete,
  onMessageComplete,
}: TypewriterMessageProps) {
  const [phase, setPhase] = useState<"title" | "message" | "complete">(title ? "title" : "message");

  const handleTitleComplete = () => {
    onTitleComplete?.();
    setPhase("message");
  };

  const handleMessageComplete = () => {
    onMessageComplete?.();
    setPhase("complete");
  };

  return (
    <div className="space-y-4">
      {title && (
        <TypewriterText
          text={title}
          className={titleClassName}
          speed={titleSpeed}
          onComplete={handleTitleComplete}
          showCursor={phase === "title"}
        />
      )}
      {(phase === "message" || phase === "complete") && (
        <TypewriterText
          text={message}
          className={messageClassName}
          speed={messageSpeed}
          delay={title ? 300 : 0}
          onComplete={handleMessageComplete}
          showCursor={phase === "message"}
        />
      )}
    </div>
  );
}
