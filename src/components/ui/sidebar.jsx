import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext({ isOpen: true, toggle: () => {} })

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = React.useState(() => {
    // Start closed on mobile, open on desktop
    return typeof window !== 'undefined' && window.innerWidth >= 768
  })

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
  const { isOpen, toggle } = React.useContext(SidebarContext)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggle}
        />
      )}

      <aside
        className={cn(
          "flex h-screen w-64 flex-col transition-all duration-300 md:relative fixed inset-y-0 left-0 z-50",
          !isOpen && "-translate-x-full md:translate-x-0 md:w-16",
          isOpen && "translate-x-0",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    </>
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
      className={cn("sticky bottom-0 bg-white/80 backdrop-blur-sm px-4 py-4", className)}
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
