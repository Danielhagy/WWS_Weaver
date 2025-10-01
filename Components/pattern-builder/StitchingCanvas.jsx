import React, { useState, useCallback } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StepBlock from './StepBlock'
import StepConfigPanel from './StepConfigPanel'
import TriggerBlock from './TriggerBlock'
import WebhookConfigPanel from './WebhookConfigPanel'

export default function StitchingCanvas({ steps, setSteps, webhookConfig, setWebhookConfig }) {
  const [selectedStepId, setSelectedStepId] = useState(null)
  const [configPanelOpen, setConfigPanelOpen] = useState(false)
  const [webhookConfigOpen, setWebhookConfigOpen] = useState(false)
  const [isConfigExpanded, setIsConfigExpanded] = useState(false)

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
              <Button
                onClick={handleAddStep}
                className="gap-2"
                data-testid="add-step-button"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </Button>
            </div>

            {/* Workflow Blocks */}
            <div className="space-y-8">
              {/* Trigger Block */}
              <TriggerBlock
                webhookConfig={webhookConfig}
                onClick={() => setWebhookConfigOpen(true)}
              />

              {/* Connection Line */}
              {steps.length > 0 && (
                <div className="flex justify-center">
                  <div className="w-0.5 h-12 bg-gradient-to-b from-accent-teal to-accent-teal/50 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-accent-teal">
                        <path d="M4 0 L0 4 L4 8 L8 4 Z" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Blocks */}
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <StepBlock
                    step={step}
                    isSelected={selectedStepId === step.id}
                    onClick={() => handleStepClick(step.id)}
                    onDelete={() => handleDeleteStep(step.id)}
                    previousSteps={steps.slice(0, index)}
                  />

                  {/* Connection Line to Next Step */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center">
                      <div className="w-0.5 h-12 bg-gradient-to-b from-accent-teal/50 to-accent-teal/50 relative golden-thread">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="w-1 h-1 rounded-full bg-accent-teal animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}
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
      />
    </div>
  )
}
