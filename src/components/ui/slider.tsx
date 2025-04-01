
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-error-200" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-error-200 bg-background-level-1 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:scale-110 cursor-pointer z-40" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

// New timeline-specific slider component
const TimelineSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    indicatorHeight?: number;
  }
>(({ className, indicatorHeight = 200, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-sm bg-background-level-4">
      <SliderPrimitive.Range className="absolute h-full bg-error-200" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="relative block h-5 w-5 rounded-full border-2 border-error-200 bg-background-level-1 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:scale-110 cursor-pointer z-40">
      {/* Position indicator line as part of the thumb - removed hover scaling for the line */}
      <div 
        className="absolute top-0 left-1/2 w-[1px] bg-error-200 shadow-[0_0_4px_rgba(248,71,58,0.6)]" 
        style={{ 
          height: `${indicatorHeight}px`,
          transform: 'translate(-50%, -100%)',
          // Ensure the indicator never exceeds its container
          maxHeight: `${indicatorHeight}px`,
          // Add clip path to ensure the line doesn't extend beyond its intended area
          clipPath: 'inset(0 0 0 0)',
          // Make the line not respond to hover events
          pointerEvents: 'none',
          opacity: 0.3,
        }}
      />
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
))
TimelineSlider.displayName = "TimelineSlider"

export { Slider, TimelineSlider }
