import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

// Context for sharing state between Select components
const SelectContext = React.createContext({})

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [triggerRect, setTriggerRect] = React.useState(null)
  const triggerElementRef = React.useRef(null)

  const contextValue = {
    value,
    onValueChange,
    isOpen,
    setIsOpen,
    triggerRect,
    setTriggerRect,
    triggerElementRef
  }

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen, setTriggerRect, triggerElementRef } = React.useContext(SelectContext)
  const triggerRef = React.useRef(null)

  React.useImperativeHandle(ref, () => triggerRef.current)

  const handleClick = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setTriggerRect(rect)
      triggerElementRef.current = triggerRef.current
    }
    setIsOpen(!isOpen)
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleClick}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext)
  return <span className={!value ? "text-gray-500" : ""}>{value || placeholder}</span>
}

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { value, onValueChange, isOpen, setIsOpen, triggerRect, setTriggerRect, triggerElementRef } = React.useContext(SelectContext)

  // Calculate position based on current triggerRect
  const calculatePosition = React.useCallback(() => {
    if (!triggerRect) return null

    // Calculate position based on trigger rect
    const top = triggerRect.bottom + 4
    const left = triggerRect.left

    // Check if dropdown would go off bottom of viewport
    const maxHeight = 300
    const spaceBelow = window.innerHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top
    const shouldOpenUpward = spaceBelow < maxHeight && spaceAbove > spaceBelow

    return {
      position: 'fixed',
      top: shouldOpenUpward ? 'auto' : `${top}px`,
      bottom: shouldOpenUpward ? `${window.innerHeight - triggerRect.top + 4}px` : 'auto',
      left: `${left}px`,
      width: `${triggerRect.width}px`,
      zIndex: 9999
    }
  }, [triggerRect])

  const position = calculatePosition()

  // Add scroll and resize listeners to update trigger position
  React.useEffect(() => {
    if (!isOpen) return

    const handleScrollOrResize = () => {
      // Use the stored trigger element ref to get updated position
      if (triggerElementRef.current) {
        const newRect = triggerElementRef.current.getBoundingClientRect()
        setTriggerRect(newRect)
      }
    }

    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen, setTriggerRect, triggerElementRef])

  if (!isOpen || !position) return null

  const content = (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
      <div style={position} className="rounded-md border border-gray-300 bg-white shadow-lg">
        <div
          ref={ref}
          className={cn("max-h-[300px] overflow-auto p-1", className)}
          {...props}
        >
          {React.Children.map(children, child => {
            if (child && child.type === SelectItem) {
              return React.cloneElement(child, {
                selected: child.props.value === value,
                onSelect: (val) => {
                  onValueChange?.(val)
                  setIsOpen(false)
                }
              })
            }
            return child
          })}
        </div>
      </div>
    </>
  )

  // Use portal to render dropdown at document body level
  return createPortal(content, document.body)
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, selected, onSelect, ...props }, ref) => {
  return (
    <div
      ref={ref}
      onClick={() => onSelect?.(value)}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
        selected && "bg-blue-50 text-blue-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
