import React, { useState, useCallback } from 'react'
import { Plus, Sparkles, Repeat } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StepBlock from './StepBlock'
import StepConfigPanel from './StepConfigPanel'
import TriggerBlock from './TriggerBlock'
import WebhookConfigPanel from './WebhookConfigPanel'
import DropZone from './DropZone'
import LoopBundle from './LoopBundle'

export default function StitchingCanvas({ steps, setSteps, webhookConfig, setWebhookConfig }) {
  const [selectedStepId, setSelectedStepId] = useState(null)
  const [configPanelOpen, setConfigPanelOpen] = useState(false)
  const [webhookConfigOpen, setWebhookConfigOpen] = useState(false)
  const [isConfigExpanded, setIsConfigExpanded] = useState(false)
  const [draggedStep, setDraggedStep] = useState(null)
  const [activeDropZone, setActiveDropZone] = useState(null) // Track which drop zone is active
  const [loopBundles, setLoopBundles] = useState([]) // Track loop bundles

  // Helper function to convert legacy field_mappings to new mapping format
  const convertLegacyMappings = (fieldMappings) => {
    if (!fieldMappings || fieldMappings.length === 0) return []

    return fieldMappings.map(mapping => {
      // If it's already in the new format, return as-is
      if (mapping.sourceType) {
        return mapping
      }

      // Convert from legacy format
      return {
        targetField: mapping.target_field,
        sourceType: 'existing_attribute',
        sourceLocation: 'webhook',
        sourceField: mapping.source_field,
        transformation: mapping.transformation
      }
    })
  }

  const handleUseExistingStitch = (stitch) => {
    // Set webhook config from stitch
    const newWebhookConfig = {
      type: stitch.parsed_attributes?.length > 0 ? 'json' : 'file',
      columns: stitch.sample_file_headers || [],
      attributes: stitch.parsed_attributes || [],
      fileName: stitch.sample_file_name || stitch.name
    }
    setWebhookConfig(newWebhookConfig)

    // Create Step 1 with the existing stitch configuration
    const convertedMappings = convertLegacyMappings(stitch.field_mappings || [])
    const newStep = {
      id: `step-${Date.now()}`,
      order: 1,
      name: stitch.name,
      webService: stitch.workday_service,
      stepType: 'existing',
      existingStitchId: stitch.id,
      mappings: convertedMappings,
      testResults: null
    }

    // If there are existing steps, increment their order
    const updatedSteps = steps.map(step => ({
      ...step,
      order: step.order + 1
    }))

    setSteps([newStep, ...updatedSteps])
  }

  const handleAddStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      order: steps.length + 1,
      name: `Step ${steps.length + 1}`,
      webService: null,
      mappings: [],
      testResults: null
    }
    setSteps([...steps, newStep])
    setSelectedStepId(newStep.id)
    setConfigPanelOpen(true)
  }

  const handleStepClick = (stepId) => {
    setSelectedStepId(stepId)
    setConfigPanelOpen(true)
  }

  const handleConfigClose = () => {
    setConfigPanelOpen(false)
    setSelectedStepId(null)
    setIsConfigExpanded(false)
  }

  const handleExpandChange = useCallback((shouldExpand) => {
    setIsConfigExpanded(shouldExpand)
  }, [])

  const handleUpdateStep = (stepId, updates) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  const handleDeleteStep = (stepId) => {
    setSteps(steps.filter(step => step.id !== stepId))
    if (selectedStepId === stepId) {
      handleConfigClose()
    }
  }

  // Loop Bundle handlers
  const handleCreateLoopBundle = () => {
    const newBundle = {
      id: `bundle-${Date.now()}`,
      name: `Loop Bundle ${loopBundles.length + 1}`,
      order: steps.length + loopBundles.length + 1
    }
    setLoopBundles([...loopBundles, newBundle])
  }

  const handleUpdateBundle = (bundleId, updates) => {
    setLoopBundles(loopBundles.map(bundle =>
      bundle.id === bundleId ? { ...bundle, ...updates } : bundle
    ))
  }

  const handleDeleteBundle = (bundleId) => {
    // Remove bundle and clear loopBundleId from steps
    setLoopBundles(loopBundles.filter(b => b.id !== bundleId))
    setSteps(steps.map(step =>
      step.loopBundleId === bundleId
        ? { ...step, loopBundleId: null }
        : step
    ))
  }

  const handleAddStepToBundle = (stepId, bundleId) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, loopBundleId: bundleId } : step
    ))
  }

  const handleRemoveStepFromBundle = (stepId) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, loopBundleId: null } : step
    ))
  }

  // Drag and drop handlers
  const handleDragStart = (e, step) => {
    setDraggedStep(step)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target)
  }

  const handleDragEnd = () => {
    setDraggedStep(null)
    setActiveDropZone(null)
  }

  // Drop zone handlers
  const handleDropZoneDragOver = (e, position) => {
    if (!draggedStep) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'

    // Only update if different to prevent unnecessary re-renders
    if (activeDropZone !== position) {
      setActiveDropZone(position)
    }
  }

  const handleDropZoneDragLeave = (e) => {
    // Don't clear immediately - let dragOver of next zone handle it
    // This prevents flashing when moving between zones
  }

  const handleDropZoneDrop = (e, insertBeforeIndex) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedStep) {
      setActiveDropZone(null)
      return
    }

    // Find current index of dragged step
    const draggedIndex = steps.findIndex(s => s.id === draggedStep.id)

    // If dropping in same position, do nothing
    if (draggedIndex === insertBeforeIndex || draggedIndex === insertBeforeIndex - 1) {
      setDraggedStep(null)
      setActiveDropZone(null)
      return
    }

    // Create new array without the dragged step
    const newSteps = steps.filter(s => s.id !== draggedStep.id)

    // Calculate actual insert position (adjust if dragged from before insert position)
    const adjustedInsertIndex = draggedIndex < insertBeforeIndex ? insertBeforeIndex - 1 : insertBeforeIndex

    // Insert at new position
    newSteps.splice(adjustedInsertIndex, 0, draggedStep)

    // Update order numbers
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }))

    setSteps(reorderedSteps)
    setDraggedStep(null)
    setActiveDropZone(null)
  }

  // Prevent step blocks from being drop targets (only drop zones should accept drops)
  const handleStepDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleStepDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Do nothing - drops should only happen on drop zones
  }

  const selectedStep = steps.find(step => step.id === selectedStepId)

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Canvas Area */}
      <div className={`transition-all duration-300 ${isConfigExpanded ? 'col-span-5' : 'col-span-8'}`}>
        <Card className="p-8 min-h-[600px] bg-gradient-to-br from-white to-soft-gray/30 relative overflow-hidden">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #0ea5e9 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Canvas Content */}
          <div className="relative space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-teal/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent-teal" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary-dark-blue">
                    Thread Canvas
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Build your workflow by connecting steps with Golden Threads
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddStep}
                  className="gap-2"
                  data-testid="add-step-button"
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </Button>
                <Button
                  onClick={handleCreateLoopBundle}
                  variant="outline"
                  className="gap-2 border-accent-teal text-accent-teal hover:bg-accent-teal hover:text-white"
                  data-testid="create-loop-bundle-button"
                >
                  <Repeat className="w-4 h-4" />
                  Create Loop Bundle
                </Button>
              </div>
            </div>

            {/* Workflow Blocks */}
            <div className="space-y-8">
              {/* Trigger Block */}
              <TriggerBlock
                webhookConfig={webhookConfig}
                onClick={() => setWebhookConfigOpen(true)}
              />

              {/* Drop Zone Before First Step */}
              {steps.length > 0 && (
                <DropZone
                  isActive={activeDropZone === 0}
                  position={0}
                  onDragOver={(e) => handleDropZoneDragOver(e, 0)}
                  onDragLeave={handleDropZoneDragLeave}
                  onDrop={(e) => handleDropZoneDrop(e, 0)}
                />
              )}

              {/* Step Blocks with Drop Zones */}
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <StepBlock
                    step={step}
                    isSelected={selectedStepId === step.id}
                    onClick={() => handleStepClick(step.id)}
                    onDelete={() => handleDeleteStep(step.id)}
                    previousSteps={steps.slice(0, index)}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleStepDragOver}
                    onDrop={handleStepDrop}
                    isDragging={draggedStep?.id === step.id}
                  />

                  {/* Drop Zone After This Step */}
                  <DropZone
                    isActive={activeDropZone === index + 1}
                    position={index + 1}
                    onDragOver={(e) => handleDropZoneDragOver(e, index + 1)}
                    onDragLeave={handleDropZoneDragLeave}
                    onDrop={(e) => handleDropZoneDrop(e, index + 1)}
                  />
                </React.Fragment>
              ))}

              {/* Add Step Prompt */}
              {steps.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-soft-gray/50 mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-dark-blue mb-2">
                    Start Building Your Pattern
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Add Step" to create your first operation
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Configuration Panel */}
      <div className={`transition-all duration-300 ${isConfigExpanded ? 'col-span-7' : 'col-span-4'}`}>
        <div className="sticky top-8">
          <StepConfigPanel
            step={selectedStep}
            isOpen={configPanelOpen}
            onClose={handleConfigClose}
            onUpdate={handleUpdateStep}
            previousSteps={selectedStep ? steps.slice(0, steps.findIndex(s => s.id === selectedStep.id)) : []}
            webhookConfig={webhookConfig}
            onExpandChange={handleExpandChange}
          />
        </div>
      </div>

      {/* Webhook Configuration Modal */}
      <WebhookConfigPanel
        webhookConfig={webhookConfig}
        isOpen={webhookConfigOpen}
        onClose={() => setWebhookConfigOpen(false)}
        onUpdate={setWebhookConfig}
        onUseExistingStitch={handleUseExistingStitch}
      />
    </div>
  )
}
