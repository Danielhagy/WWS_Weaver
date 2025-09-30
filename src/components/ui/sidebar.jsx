import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext({ isOpen: true, toggle: () => {} })

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = React.useState(true)
  
  const toggle = React.useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar({ className, children, ...props }) {
  const { isOpen } = React.useContext(SidebarContext)
  
  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col transition-all duration-300",
        !isOpen && "w-0 overflow-hidden md:w-16",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

export function SidebarHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center gap-2 px-4 py-4", className)}
      {...props}
    />
  )
}

export function SidebarContent({ className, ...props }) {
  return (
    <div
      className={cn("flex-1 overflow-auto", className)}
      {...props}
    />
  )
}

export function SidebarFooter({ className, ...props }) {
  return (
    <div
      className={cn("mt-auto px-4 py-4", className)}
      {...props}
    />
  )
}

export function SidebarGroup({ className, ...props }) {
  return <div className={cn("space-y-2", className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }) {
  return (
    <div
      className={cn("px-2 py-1 text-xs font-semibold text-gray-500", className)}
      {...props}
    />
  )
}

export function SidebarGroupContent({ className, ...props }) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenu({ className, ...props }) {
  return <nav className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }) {
  return <div className={cn("", className)} {...props} />
}

export function SidebarMenuButton({ className, asChild, ...props }) {
  const Comp = asChild ? React.Fragment : "button"
  
  if (asChild) {
    return <>{props.children}</>
  }
  
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100",
        className
      )}
      {...props}
    />
  )
}

export function SidebarTrigger({ className, ...props }) {
  const { toggle } = React.useContext(SidebarContext)
  
  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100",
        className
      )}
      {...props}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  )
}
