import * as React from "react"
import { cn } from "@/lib/utils"

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-white border-soft-gray text-text-dark",
    destructive: "bg-error-red/10 border-error-red/30 text-error-red",
    warning: "bg-muted-orange/10 border-muted-orange/30 text-muted-orange",
    info: "bg-accent-teal/10 border-accent-teal/30 text-accent-teal",
    success: "bg-soft-yellow-green/30 border-soft-yellow-green/50 text-primary-dark-blue",
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 shadow-sm",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
