import React, { useState } from 'react'
import { Repeat, ChevronDown, ChevronUp, Edit2, Trash2, GripVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import StepBlock from './StepBlock'

export default function LoopBundle({
  bundle,
  steps,
  onUpdateBundle,
  onDeleteBundle,
  onStepClick,
  onDeleteStep,
  webhookConfig,
  onDragStart,
  onDragEnd
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(bundle.name)

  const bundleSteps = steps.filter(step => step.loopBundleId === bundle.id)
  const rowCount = webhookConfig?.type === 'file'
    ? (webhookConfig?.columns?.length > 0 ? 25 : 'N') // Placeholder - would be actual row count
    : (webhookConfig?.attributes?.length > 0 ? 'N' : 'N')

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateBundle(bundle.id, { name: editName.trim() })
    }
    setIsEditingName(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setEditName(bundle.name)
      setIsEditingName(false)
    }
  }

  return (
    <Card className="border-2 border-accent-teal/50 bg-gradient-to-br from-accent-teal/5 via-transparent to-accent-teal/5 shadow-lg overflow-hidden">
      {/* Bundle Header */}
      <div className="bg-gradient-to-r from-accent-teal/20 to-accent-teal/10 border-b-2 border-accent-teal/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Loop Icon */}
            <div className="w-10 h-10 rounded-full bg-accent-teal flex items-center justify-center flex-shrink-0">
              <Repeat className="w-5 h-5 text-white" />
            </div>

            {/* Bundle Name */}
            {isEditingName ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyPress}
                className="h-8 max-w-xs"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-primary-dark-blue text-lg">
                  {bundle.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                  className="h-6 w-6 p-0 hover:bg-accent-teal/20"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              </div>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent-teal/20 text-accent-teal border-none">
                <Repeat className="w-3 h-3 mr-1" />
                Executes {rowCount}× together
              </Badge>
              <Badge variant="outline" className="border-accent-teal/40 text-muted-foreground">
                {bundleSteps.length} step{bundleSteps.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hover:bg-accent-teal/20"
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteBundle(bundle.id)}
              className="hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Drop Zone Hint */}
        {bundleSteps.length === 0 && !isCollapsed && (
          <div className="mt-2 p-4 border-2 border-dashed border-accent-teal/40 rounded-lg bg-white/50">
            <p className="text-sm text-center text-muted-foreground">
              Drag steps here to add them to this loop
            </p>
          </div>
        )}
      </div>

      {/* Bundle Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-0">
          {bundleSteps.length > 0 ? (
            bundleSteps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Step Block */}
                <div className="relative z-10">
                  <StepBlock
                    step={step}
                    onClick={() => onStepClick(step.id)}
                    onDelete={() => onDeleteStep(step.id)}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    isInBundle={true}
                  />
                </div>

                {/* Threading between steps */}
                {index < bundleSteps.length - 1 && (
                  <div className="relative h-6 flex items-center justify-center">
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 -ml-0.5 flex">
                      <div className="w-0.5 bg-accent-teal"></div>
                      <div className="w-0.5 bg-accent-teal ml-1"></div>
                    </div>
                    <div className="relative bg-white px-2 z-10">
                      <span className="text-xs text-accent-teal font-semibold">⟁ threaded</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : null}
        </div>
      )}
    </Card>
  )
}
