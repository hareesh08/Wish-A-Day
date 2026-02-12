import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  icon: Icon,
  title,
  description,
  optional = false,
  children,
  className,
}: FormSectionProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-soft",
        className
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-foreground">{title}</h3>
            {optional && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Optional
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
