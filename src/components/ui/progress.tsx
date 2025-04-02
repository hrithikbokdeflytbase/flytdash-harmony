
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { RefreshCw } from "lucide-react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
    failed?: boolean;
    onRetry?: () => void;
  }
>(({ className, value, indicatorClassName, failed = false, onRetry, ...props }, ref) => (
  <div className="relative">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          failed ? "bg-error-200" : "bg-[rgba(255,255,255,0.84)]", // Text-01 color: #FFFFFF with 84% opacity
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
    {failed && onRetry && (
      <button 
        onClick={onRetry}
        className="absolute right-0 top-[-2px] p-[2px] rounded-full bg-background-level-3 hover:bg-background-level-4 transition-colors"
        title="Retry"
      >
        <RefreshCw size={12} className="text-error-200 animate-pulse" />
      </button>
    )}
  </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
