import React, { useState } from 'react'
import { Repeat, ChevronDown, ChevronUp, Edit2, Trash2, GripVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import StepBlock from './StepBlock'
import AddStepButton from './AddStepButton'

export default function LoopBundle({
  bundle,
  steps,
  onUpdateBundle,
  onDeleteBundle,
  onStepClick,
  onDeleteStep,
  webhookConfig,
  onDragStart,
  onDragEnd,
  onAddStepToBundle,
  onAddStep,
  isDragging = false,
  draggedStep = null,
  onBundleDragStart,
  onBundleDragEnd,
  isBundleDragging = false,
  onDropInLoop
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(bundle.name)
  const [isDragOver, setIsDragOver] = useState(false)

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

  const handleDragOver = (e) => {
    // Check if we're dragging a step that's already in this bundle
    // We use the draggedStep prop from parent instead of reading dataTransfer
    // because dataTransfer.getData() returns empty string during dragover (security restriction)
    if (draggedStep && draggedStep.loopBundleId === bundle.id) {
      // Don't show drop zone UI or prevent default for steps already in this bundle
      // This allows the step to be dragged OUT of the loop to other drop targets
      return
    }

    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    // Only handle drag leave if we're actually handling drag over
    if (draggedStep && draggedStep.loopBundleId === bundle.id) {
      // Step is in this bundle, don't handle the event
      return
    }

    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const stepId = e.dataTransfer.getData('stepId')
    if (stepId && onAddStepToBundle) {
      // Check if the step is already in this bundle
      const draggedStep = steps.find(s => s.id === stepId)
      if (draggedStep && draggedStep.loopBundleId === bundle.id) {
        // Step is already in this bundle, don't re-add it
        console.log('Step already in this bundle, ignoring drop')
        return
      }
      // Add step to bundle
      onAddStepToBundle(stepId, bundle.id)
    }
  }

  const handleHeaderDragStart = (e) => {
    // Prevent dragging when clicking on buttons or inputs
    const clickableElement = e.target.closest('button, input, a')
    if (clickableElement) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    if (onBundleDragStart) {
      onBundleDragStart(e, bundle)
    }
  }

  return (
    <Card
      className={`border-2 ${isDragOver ? 'border-accent-teal border-4 bg-accent-teal/20' : 'border-accent-teal/50'} bg-gradient-to-br from-accent-teal/5 via-transparent to-accent-teal/5 shadow-lg overflow-hidden transition-all ${isBundleDragging ? 'opacity-50 scale-95' : ''} group`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`loop-bundle-${bundle.id}`}
    >
      {/* Bundle Header - Draggable */}
      <div
        className="bg-gradient-to-r from-accent-teal/20 to-accent-teal/10 border-b-2 border-accent-teal/30 p-3"
        draggable
        onDragStart={handleHeaderDragStart}
        onDragEnd={onBundleDragEnd}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Drag Handle */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
              <GripVertical className="w-5 h-5 text-accent-teal" />
            </div>

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

        {/* Empty Loop - Show Add Button */}
        {bundleSteps.length === 0 && !isCollapsed && (
          <div className="mt-2 p-6">
            <AddStepButton
              onAdd={() => onAddStep && onAddStep(null, bundle.id)}
              position={{ position: 'into-loop', bundleId: bundle.id }}
              inLoop={true}
              isDragging={isDragging}
              onDrop={onDropInLoop}
            />
            <p className="text-xs text-center text-muted-foreground mt-2">
              Add step to loop or drag and drop
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
                    previousSteps={bundleSteps.slice(0, index)}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    isInBundle={true}
                  />
                </div>

                {/* Add Step Button or Threading between steps */}
                {index < bundleSteps.length - 1 ? (
                  <div className="relative h-12 flex items-center justify-center my-2">
                    {/* Threading lines */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 -ml-0.5 flex">
                      <div className="w-0.5 bg-accent-teal"></div>
                      <div className="w-0.5 bg-accent-teal ml-1"></div>
                    </div>
                    {/* Add Step Button overlaid on threading */}
                    <div className="relative z-10">
                      <AddStepButton
                        onAdd={() => onAddStep && onAddStep(null, bundle.id)}
                        position={{ position: 'into-loop', bundleId: bundle.id }}
                        inLoop={true}
                        isDragging={isDragging}
                        onDrop={onDropInLoop}
                      />
                    </div>
                  </div>
                ) : (
                  /* Add Step Button after last step in loop */
                  <div className="relative h-10 my-2">
                    <AddStepButton
                      onAdd={() => onAddStep && onAddStep(null, bundle.id)}
                      position={{ position: 'into-loop', bundleId: bundle.id }}
                      inLoop={true}
                      isDragging={isDragging}
                      onDrop={onDropInLoop}
                    />
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
