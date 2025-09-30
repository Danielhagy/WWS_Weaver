import * as React from "react"
import { cn } from "@/lib/utils"

// Context for sharing state between Select components
const SelectContext = React.createContext({})

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const contextValue = {
    value,
    onValueChange,
    isOpen,
    setIsOpen
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
  const { isOpen, setIsOpen } = React.useContext(SelectContext)

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
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
  const { value, onValueChange, isOpen, setIsOpen } = React.useContext(SelectContext)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
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
