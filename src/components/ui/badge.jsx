import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-accent-teal/10 text-accent-teal border-accent-teal/30",
    primary: "bg-primary-dark-blue/10 text-primary-dark-blue border-primary-dark-blue/30",
    secondary: "bg-soft-gray text-medium-gray-blue border-soft-gray",
    destructive: "bg-error-red/10 text-error-red border-error-red/30",
    warning: "bg-muted-orange/10 text-muted-orange border-muted-orange/30",
    success: "bg-soft-yellow-green/30 text-primary-dark-blue border-soft-yellow-green/50",
    outline: "text-text-dark border-soft-gray",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
