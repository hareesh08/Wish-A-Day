import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
  completed: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
              step.completed
                ? "bg-primary/20 text-primary"
                : index === currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step.completed ? (
              <Check className="w-3 h-3" />
            ) : (
              <span className="w-4 text-center">{index + 1}</span>
            )}
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-6 h-0.5 rounded-full transition-colors",
                step.completed ? "bg-primary/30" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
