import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-accent-teal text-white hover:bg-accent-teal/90 shadow-sm hover:shadow-md",
    primary: "bg-primary-dark-blue text-white hover:bg-primary-dark-blue/90 shadow-sm hover:shadow-md",
    destructive: "bg-error-red text-white hover:bg-error-red/90 shadow-sm hover:shadow-md",
    outline: "border border-soft-gray bg-white hover:bg-soft-gray text-text-dark",
    secondary: "bg-soft-gray text-text-dark hover:bg-soft-gray/80",
    ghost: "hover:bg-soft-gray text-text-dark",
    link: "text-accent-teal underline-offset-4 hover:underline",
    warning: "bg-muted-orange text-white hover:bg-muted-orange/90 shadow-sm hover:shadow-md",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
