
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        flight: 
          "border-transparent bg-primary-200 text-text-icon-01",
        success: 
          "border-transparent bg-emerald-100 text-emerald-700 text-[10px] py-0 px-1.5",
        processing: 
          "border-transparent bg-amber-100 text-amber-700 text-[10px] py-0 px-1.5",
        failed: 
          "border-transparent bg-red-100 text-red-700 text-[10px] py-0 px-1.5",
        minimal:
          "border-transparent text-[10px] py-0 px-1.5",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[10px] px-1.5 py-0 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
