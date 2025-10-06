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
import AddStepButton from './AddStepButton'

export default function StitchingCanvas({ steps, setSteps, webhookConfig, setWebhookConfig }) {
  const [selectedStepId, setSelectedStepId] = useState(null)
  const [configPanelOpen, setConfigPanelOpen] = useState(false)
  const [webhookConfigOpen, setWebhookConfigOpen] = useState(false)
  const [isConfigExpanded, setIsConfigExpanded] = useState(false)
  const [draggedStep, setDraggedStep] = useState(null)
  const [draggedBundle, setDraggedBundle] = useState(null)
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

  const handleAddStep = (insertPosition = null, loopBundleId = null, afterStepId = null, afterBundleId = null) => {
    // Calculate the correct order value for the new step based on visual position
    let newOrder = 1

    if (insertPosition === 0) {
      // Insert at the very beginning - order should be 1, shift everything else
      newOrder = 1
    } else if (afterStepId) {
      // Insert after a specific step
      const afterStep = steps.find(s => s.id === afterStepId)
      if (afterStep) {
        // New step should have order right after this step
        // We need to find what comes next visually to know if we need to shift orders
        newOrder = afterStep.order + 1
      }
    } else if (afterBundleId) {
      // Insert after a bundle
      const bundle = loopBundles.find(b => b.id === afterBundleId)
      if (bundle) {
        newOrder = bundle.order + 1
      }
    } else {
      // Add to end - get the highest order among independent steps and bundles
      const independentSteps = steps.filter(s => !s.loopBundleId)
      const maxStepOrder = independentSteps.length > 0 ? Math.max(...independentSteps.map(s => s.order || 0)) : 0
      const maxBundleOrder = loopBundles.length > 0 ? Math.max(...loopBundles.map(b => b.order || 0)) : 0
      newOrder = Math.max(maxStepOrder, maxBundleOrder) + 1
    }

    const newStep = {
      id: `step-${Date.now()}`,
      order: newOrder,
      name: `Step ${steps.length + 1}`,
      webService: null,
      mappings: [],
      testResults: null,
      loopBundleId: loopBundleId
    }

    // If we're inserting in the middle, we need to shift the orders of items that come after
    // Only shift orders for independent steps and bundles, not steps in loops
    let updatedSteps = [...steps]
    let updatedBundles = [...loopBundles]

    // Shift orders of independent steps that are >= newOrder
    updatedSteps = updatedSteps.map(step => {
      if (!step.loopBundleId && step.order >= newOrder) {
        return { ...step, order: step.order + 1 }
      }
      return step
    })

    // Shift orders of bundles that are >= newOrder
    updatedBundles = updatedBundles.map(bundle => {
      if (bundle.order >= newOrder) {
        return { ...bundle, order: bundle.order + 1 }
      }
      return bundle
    })

    // Add the new step
    updatedSteps.push(newStep)

    setSteps(updatedSteps)
    setLoopBundles(updatedBundles)
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

  // Loop handlers
  const handleCreateLoopBundle = () => {
    const newBundle = {
      id: `bundle-${Date.now()}`,
      name: `Loop ${loopBundles.length + 1}`,
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
    // Clear drag state when step is added to bundle
    setDraggedStep(null)
    setActiveDropZone(null)
  }

  const handleRemoveStepFromBundle = (stepId) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, loopBundleId: null } : step
    ))
  }

  // Drag and drop handlers for steps
  const handleDragStart = (e, step) => {
    setDraggedStep(step)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target)
    e.dataTransfer.setData('stepId', step.id) // Add stepId for loop bundle drops
  }

  const handleDragEnd = () => {
    setDraggedStep(null)
    setActiveDropZone(null)
  }

  // Drag and drop handlers for bundles
  const handleBundleDragStart = (e, bundle) => {
    setDraggedBundle(bundle)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target)
  }

  const handleBundleDragEnd = () => {
    setDraggedBundle(null)
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

  const handleDropZoneDrop = (e, dropInfo) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('Drop Info:', dropInfo)
    console.log('Dragged Step:', draggedStep)

    // Handle dropping into a loop
    if (dropInfo.position === 'into-loop') {
      if (draggedStep) {
        // Add step to the bundle - remove it from independent steps by clearing its order
        setSteps(steps.map(step =>
          step.id === draggedStep.id ? { ...step, loopBundleId: dropInfo.bundleId } : step
        ))
        setDraggedStep(null)
        setActiveDropZone(null)
      }
      return
    }

    // Handle bundle drops
    if (draggedBundle) {
      const oldOrder = draggedBundle.order

      // Determine new target order based on dropInfo
      let newOrder

      if (dropInfo.position === 'start') {
        newOrder = 1
      } else if (dropInfo.position === 'after-step') {
        const afterStep = steps.find(s => s.id === dropInfo.afterStepId)
        newOrder = afterStep ? afterStep.order + 1 : loopBundles.length
      } else if (dropInfo.position === 'after-bundle') {
        const afterBundle = loopBundles.find(b => b.id === dropInfo.afterBundleId)
        newOrder = afterBundle ? afterBundle.order + 1 : loopBundles.length
      } else {
        const independentSteps = steps.filter(s => !s.loopBundleId)
        const maxStepOrder = independentSteps.length > 0 ? Math.max(...independentSteps.map(s => s.order || 0)) : 0
        const maxBundleOrder = loopBundles.length > 0 ? Math.max(...loopBundles.map(b => b.order || 0)) : 0
        newOrder = Math.max(maxStepOrder, maxBundleOrder) + 1
      }

      // Shift orders
      let updatedSteps = [...steps]
      let updatedBundles = [...loopBundles]

      // First, remove the old order by shifting items down
      updatedSteps = updatedSteps.map(step => {
        if (!step.loopBundleId && step.order > oldOrder) {
          return { ...step, order: step.order - 1 }
        }
        return step
      })

      updatedBundles = updatedBundles.map(bundle => {
        if (bundle.id === draggedBundle.id) {
          return { ...bundle, order: newOrder }
        } else if (bundle.order > oldOrder) {
          return { ...bundle, order: bundle.order - 1 }
        }
        return bundle
      })

      // Then shift items at new position up
      updatedSteps = updatedSteps.map(step => {
        if (!step.loopBundleId && step.order >= newOrder) {
          return { ...step, order: step.order + 1 }
        }
        return step
      })

      updatedBundles = updatedBundles.map(bundle => {
        if (bundle.id !== draggedBundle.id && bundle.order >= newOrder) {
          return { ...bundle, order: bundle.order + 1 }
        }
        return bundle
      })

      setSteps(updatedSteps)
      setLoopBundles(updatedBundles)
      setDraggedBundle(null)
      setActiveDropZone(null)
      return
    }

    // Handle step drops
    if (!draggedStep) {
      setActiveDropZone(null)
      return
    }

    // Calculate new order for the step
    let newOrder
    const oldOrder = draggedStep.order
    const wasInLoop = !!draggedStep.loopBundleId

    if (dropInfo.position === 'start') {
      newOrder = 1
    } else if (dropInfo.position === 'after-step') {
      const afterStep = steps.find(s => s.id === dropInfo.afterStepId)
      newOrder = afterStep ? afterStep.order + 1 : 1
    } else if (dropInfo.position === 'after-bundle') {
      const bundle = loopBundles.find(b => b.id === dropInfo.afterBundleId)
      newOrder = bundle ? bundle.order + 1 : 1
    } else {
      const independentSteps = steps.filter(s => !s.loopBundleId)
      const maxStepOrder = independentSteps.length > 0 ? Math.max(...independentSteps.map(s => s.order || 0)) : 0
      const maxBundleOrder = loopBundles.length > 0 ? Math.max(...loopBundles.map(b => b.order || 0)) : 0
      newOrder = Math.max(maxStepOrder, maxBundleOrder) + 1
    }

    console.log('Moving step from order', oldOrder, 'to', newOrder, 'wasInLoop:', wasInLoop)

    // Update steps and bundles
    let updatedSteps = [...steps]
    let updatedBundles = [...loopBundles]

    // If step was in a loop, we don't need to shift down old positions
    // If step wasn't in a loop, shift down items after its old position
    if (!wasInLoop && oldOrder) {
      updatedSteps = updatedSteps.map(step => {
        if (!step.loopBundleId && step.id !== draggedStep.id && step.order > oldOrder) {
          return { ...step, order: step.order - 1 }
        }
        return step
      })

      updatedBundles = updatedBundles.map(bundle => {
        if (bundle.order > oldOrder) {
          return { ...bundle, order: bundle.order - 1 }
        }
        return bundle
      })
    }

    // Shift items at new position up
    updatedSteps = updatedSteps.map(step => {
      if (!step.loopBundleId && step.id !== draggedStep.id && step.order >= newOrder) {
        return { ...step, order: step.order + 1 }
      }
      return step
    })

    updatedBundles = updatedBundles.map(bundle => {
      if (bundle.order >= newOrder) {
        return { ...bundle, order: bundle.order + 1 }
      }
      return bundle
    })

    // Update the dragged step with new order and remove from loop
    updatedSteps = updatedSteps.map(step => {
      if (step.id === draggedStep.id) {
        return { ...step, order: newOrder, loopBundleId: null }
      }
      return step
    })

    console.log('Final updated steps:', updatedSteps)
    console.log('Final updated bundles:', updatedBundles)

    setSteps(updatedSteps)
    setLoopBundles(updatedBundles)
    setDraggedStep(null)
    setActiveDropZone(null)
  }

  // Handle dropping on a step block to swap positions
  const handleStepDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleStepDrop = (e, targetStep) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedStep || draggedStep.id === targetStep.id) {
      setDraggedStep(null)
      return
    }

    // Find indices
    const draggedIndex = steps.findIndex(s => s.id === draggedStep.id)
    const targetIndex = steps.findIndex(s => s.id === targetStep.id)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedStep(null)
      return
    }

    // Swap the steps
    const newSteps = [...steps]

    // Preserve loop bundle assignments during swap
    const draggedStepWithBundle = { ...draggedStep }
    const targetStepWithBundle = { ...targetStep }

    // Swap positions
    newSteps[draggedIndex] = targetStepWithBundle
    newSteps[targetIndex] = draggedStepWithBundle

    // Update order numbers
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }))

    setSteps(reorderedSteps)
    setDraggedStep(null)
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
                    Build your workflow by connecting steps
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
                  data-testid="create-loop-button"
                >
                  <Repeat className="w-4 h-4" />
                  Loop
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

              {/* Add Step Button Before First Step */}
              <AddStepButton
                onAdd={() => handleAddStep(0)}
                position={{ position: 'start' }}
                onDrop={handleDropZoneDrop}
                isDragging={!!draggedStep || !!draggedBundle}
              />

              {/* Render Loop Bundles and Independent Steps */}
              {(() => {
                // Get steps not in any bundle
                const independentSteps = steps.filter(s => !s.loopBundleId)

                // Combine bundles and independent steps, then sort by order
                const allItems = [...loopBundles, ...independentSteps]
                  .sort((a, b) => (a.order || 0) - (b.order || 0))

                return allItems.map((item, index) => {
                  const isBundle = item.id?.startsWith('bundle-')

                  if (isBundle) {
                    // Render Loop Bundle
                    return (
                      <React.Fragment key={item.id}>
                        <LoopBundle
                          bundle={item}
                          steps={steps}
                          webhookConfig={webhookConfig}
                          onUpdateBundle={handleUpdateBundle}
                          onDeleteBundle={handleDeleteBundle}
                          onStepClick={handleStepClick}
                          onDeleteStep={handleDeleteStep}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onAddStepToBundle={handleAddStepToBundle}
                          onAddStep={handleAddStep}
                          isDragging={!!draggedStep}
                          draggedStep={draggedStep}
                          onBundleDragStart={handleBundleDragStart}
                          onBundleDragEnd={handleBundleDragEnd}
                          isBundleDragging={draggedBundle?.id === item.id}
                          onDropInLoop={handleDropZoneDrop}
                        />

                        {/* Add Step Button After Bundle */}
                        <AddStepButton
                          onAdd={() => handleAddStep(null, null, null, item.id)}
                          position={{ position: 'after-bundle', afterBundleId: item.id }}
                          onDrop={handleDropZoneDrop}
                          isDragging={!!draggedStep || !!draggedBundle}
                        />
                      </React.Fragment>
                    )
                  } else {
                    // Render Independent Step
                    const stepIndex = steps.findIndex(s => s.id === item.id)
                    return (
                      <React.Fragment key={item.id}>
                        <StepBlock
                          step={item}
                          isSelected={selectedStepId === item.id}
                          onClick={() => handleStepClick(item.id)}
                          onDelete={() => handleDeleteStep(item.id)}
                          previousSteps={steps.slice(0, stepIndex)}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleStepDragOver}
                          onDrop={handleStepDrop}
                          isDragging={draggedStep?.id === item.id}
                        />

                        {/* Add Step Button After This Step */}
                        <AddStepButton
                          onAdd={() => handleAddStep(null, null, item.id)}
                          position={{ position: 'after-step', afterStepId: item.id }}
                          onDrop={handleDropZoneDrop}
                          isDragging={!!draggedStep || !!draggedBundle}
                        />
                      </React.Fragment>
                    )
                  }
                })
              })()}

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
            loopBundles={loopBundles}
            onAddStepToBundle={handleAddStepToBundle}
            onRemoveStepFromBundle={handleRemoveStepFromBundle}
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
