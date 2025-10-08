import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AddStepButton({ onAdd, position, inLoop = false, onDrop, isDragging = false }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => {
    if (!isDragging) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (onDrop) {
      // position should be an object with drop info
      onDrop(e, position)
    }
  }

  return (
    <div
      className="relative py-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Connecting Line - Thicker and highlighted when dragging over */}
      <div className={`absolute left-1/2 top-0 bottom-0 -ml-px transition-all duration-200 ${
        isDragOver
          ? 'w-1 bg-accent-teal shadow-lg'
          : 'w-0.5 bg-soft-gray group-hover:bg-accent-teal'
      }`} />

      {/* Drop Indicator Line */}
      {isDragOver && (
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center z-20">
          <div className="w-full h-1 bg-accent-teal rounded-full shadow-lg animate-pulse" />
        </div>
      )}

      {/* Add Button */}
      <div className="relative flex items-center justify-center z-10">
        <Button
          onClick={onAdd}
          variant="ghost"
          size="sm"
          className={`
            rounded-full w-8 h-8 p-0 transition-all duration-200
            ${isDragOver || isHovered || inLoop
              ? 'bg-accent-teal text-white hover:bg-accent-teal/90 shadow-md scale-110'
              : 'bg-white border-2 border-soft-gray text-muted-foreground hover:border-accent-teal hover:text-accent-teal'
            }
          `}
          data-testid={inLoop ? 'add-step-to-loop-button' : `add-step-button-${JSON.stringify(position)}`}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Hint Text */}
      {(isHovered || isDragOver) && !isDragging && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-6 z-50">
          <div className="bg-primary-dark-blue text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap shadow-lg">
            Add step here
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary-dark-blue rotate-45" />
          </div>
        </div>
      )}

      {/* Drop Hint Text */}
      {isDragOver && isDragging && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-6 z-50">
          <div className="bg-accent-teal text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap shadow-lg font-semibold">
            Drop here
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent-teal rotate-45" />
          </div>
        </div>
      )}
    </div>
  )
}
