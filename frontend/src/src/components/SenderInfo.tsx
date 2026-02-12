import { User, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SenderInfoProps {
  senderName: string;
  onSenderNameChange: (name: string) => void;
  senderMessage: string;
  onSenderMessageChange: (message: string) => void;
}

export function SenderInfo({
  senderName,
  onSenderNameChange,
  senderMessage,
  onSenderMessageChange,
}: SenderInfoProps) {
  return (
    <div className="space-y-3">
      {/* Sender Name */}
      <div className="space-y-1.5">
        <label htmlFor="sender-name" className="text-sm font-medium text-foreground">
          Your name
        </label>
        <Input
          id="sender-name"
          placeholder="e.g., Sarah, Your Friend, Mom & Dad"
          value={senderName}
          onChange={(e) => onSenderNameChange(e.target.value)}
          maxLength={100}
          className="h-11"
        />
      </div>

      {/* Sender Message */}
      <div className="space-y-1.5">
        <label htmlFor="sender-message" className="text-sm font-medium text-foreground">
          Personal note
        </label>
        <Textarea
          id="sender-message"
          placeholder="e.g., With love from your friend..."
          value={senderMessage}
          onChange={(e) => onSenderMessageChange(e.target.value)}
          rows={2}
          maxLength={200}
          className="resize-none"
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            This appears at the bottom of your wish
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {senderMessage.length}/200
          </p>
        </div>
      </div>
    </div>
  );
}