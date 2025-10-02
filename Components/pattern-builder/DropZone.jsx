import React from 'react'

export default function DropZone({ isActive, onDragOver, onDragLeave, onDrop, position }) {
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onDragOver(e)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only trigger leave if actually leaving the drop zone container, not child elements
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
      onDragLeave(e)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onDrop(e)
  }

  return (
    <div
      className={`relative flex justify-center transition-all duration-200 ${
        isActive ? 'py-8 -my-8' : 'py-4 -my-4'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`drop-zone-${position}`}
      style={{ minHeight: '64px' }}
    >
      {/* Expanded hit area with visual feedback when active */}
      <div
        className={`absolute inset-x-0 inset-y-0 transition-all duration-200 ${
          isActive
            ? 'bg-accent-teal/5 border-2 border-dashed border-accent-teal/30 rounded-lg'
            : ''
        }`}
      />

      {/* Connection Line / Drop Target */}
      <div
        className={`w-0.5 h-16 transition-all duration-200 pointer-events-none ${
          isActive
            ? 'bg-accent-teal w-1 shadow-lg shadow-accent-teal/50'
            : 'bg-gradient-to-b from-accent-teal/50 to-accent-teal/50'
        } relative`}
      >
        {/* Animated pulse when active */}
        {isActive && (
          <>
            {/* Top indicator */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <div className="w-4 h-4 rounded-full bg-accent-teal animate-pulse shadow-lg shadow-accent-teal/50" />
            </div>

            {/* Middle expanding bar */}
            <div className="absolute inset-0 bg-accent-teal/20 animate-pulse rounded-full"
                 style={{ width: '8px', left: '-3.5px' }}
            />

            {/* Bottom indicator */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <div className="w-4 h-4 rounded-full bg-accent-teal animate-pulse shadow-lg shadow-accent-teal/50" />
            </div>

            {/* Insertion text */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap">
              <div className="bg-accent-teal text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg animate-pulse">
                Drop here to insert
              </div>
            </div>
          </>
        )}

        {/* Normal state pulse dot */}
        {!isActive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-1 h-1 rounded-full bg-accent-teal" />
          </div>
        )}
      </div>
    </div>
  )
}
