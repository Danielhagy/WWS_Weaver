import React, { useState, useEffect } from 'react'
import { X, Settings, FlaskConical, Save, Zap, FileText, Layers, ExternalLink, Eye, EyeOff, Target, Repeat, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import DataMappingInterface from './DataMappingInterface'
import { Integration } from '@/entities/Integration'
import { useNavigate } from 'react-router-dom'
import { createPageUrl } from '@/utils'

export default function StepConfigPanel({ step, isOpen, onClose, onUpdate, previousSteps, webhookConfig, onExpandChange, loopBundles, onAddStepToBundle, onRemoveStepFromBundle }) {
  const navigate = useNavigate()
  const [localStep, setLocalStep] = useState(step || {})
  const [stepType, setStepType] = useState(step?.stepType || 'new') // 'new' or 'existing'
  const [existingStitches, setExistingStitches] = useState([])
  const [selectedStitch, setSelectedStitch] = useState(null)
  const [showStitchConfig, setShowStitchConfig] = useState(false)

  // Restore local state when step changes
  React.useEffect(() => {
    if (step) {
      setLocalStep(step)
      // Infer stepType from step data if not explicitly set
      // If existingStitchId is set, it must be an existing stitch
      const inferredStepType = step.existingStitchId ? 'existing' : (step.stepType || 'new')
      setStepType(inferredStepType)
    }
  }, [step])

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

  // Restore selected stitch when existingStitches loads or step changes
  React.useEffect(() => {
    if (step?.existingStitchId && existingStitches.length > 0) {
      const stitch = existingStitches.find(s => s.id === step.existingStitchId)
      if (stitch) {
        setSelectedStitch(stitch)
        // If step doesn't have mappings but stitch does, populate from stitch
        if (!step.mappings || step.mappings.length === 0) {
          if (stitch.field_mappings && stitch.field_mappings.length > 0) {
            const convertedMappings = convertLegacyMappings(stitch.field_mappings)
            setLocalStep(prev => ({
              ...prev,
              mappings: convertedMappings
            }))
          }
        }
      }
    } else if (!step?.existingStitchId) {
      setSelectedStitch(null)
    }
  }, [step?.existingStitchId, existingStitches])

  useEffect(() => {
    if (isOpen) {
      loadExistingStitches()
    }
  }, [isOpen])

  const loadExistingStitches = async () => {
    try {
      const stitches = await Integration.list()
      setExistingStitches(stitches || [])
    } catch (error) {
      console.error('Error loading stitches:', error)
      setExistingStitches([])
    }
  }

  if (!isOpen || !step) {
    return (
      <Card className="p-8 border-2 border-dashed border-soft-gray bg-soft-gray/10">
        <div className="text-center text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a step to configure</p>
        </div>
      </Card>
    )
  }

  const handleSave = () => {
    // Ensure stepType is persisted when saving
    const updatedStep = {
      ...localStep,
      stepType: stepType
    }
    onUpdate(step.id, updatedStep)
    setShowStitchConfig(false) // Reset on save
    onClose()
  }

  const handleCancel = () => {
    setShowStitchConfig(false) // Reset on cancel
    onClose()
  }

  const handleTestStep = () => {
    // TODO: Implement in Milestone 2
    console.log('Testing step:', localStep)
  }

  const handleFieldChange = (field, value) => {
    const newStep = { ...localStep, [field]: value }
    setLocalStep(newStep)

    // Notify parent of expansion state change when web service is selected/cleared
    if (field === 'webService' && onExpandChange) {
      const shouldExpand = stepType === 'new' && value !== null && value !== ''
      onExpandChange(shouldExpand)
    }

    // Notify parent when stepType changes
    if (field === 'stepType' && onExpandChange) {
      const shouldExpand = value === 'new' && localStep.webService !== null && localStep.webService !== ''
      onExpandChange(shouldExpand)
    }
  }

  // Mock web services for now
  const mockWebServices = [
    'Create_Position',
    'Contract_Contingent_Worker',
    'Submit_Employee_Data',
    'Create_Organization',
    'Update_Position'
  ]

  return (
    <Card className="border-2 border-accent-teal/30 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-soft-gray bg-gradient-to-r from-accent-teal/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-teal/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-accent-teal" />
            </div>
            <h3 className="font-bold text-primary-dark-blue">
              Configure Step {step.order}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-soft-gray"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {previousSteps.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent-teal/10 text-accent-teal border-none text-xs">
              <Zap className="w-3 h-3 mr-1" />
              {previousSteps.length} Previous Node{previousSteps.length !== 1 ? 's' : ''} Available
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Step Name */}
        <div className="space-y-2">
          <Label htmlFor="step-name">Step Name</Label>
          <Input
            id="step-name"
            placeholder="e.g., Create Position"
            value={localStep.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
          />
        </div>

        {/* Step Type Selection */}
        <div className="space-y-3">
          <Label>Step Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <Card
              className={`p-3 cursor-pointer transition-all ${
                stepType === 'new'
                  ? 'border-2 border-accent-teal bg-accent-teal/5'
                  : 'border-2 border-soft-gray hover:border-accent-teal/50'
              }`}
              onClick={() => {
                setStepType('new')
                setLocalStep({ ...localStep, stepType: 'new', existingStitchId: null })
                setSelectedStitch(null)
                if (onExpandChange) {
                  onExpandChange(localStep.webService !== null && localStep.webService !== '')
                }
              }}
              data-testid="step-type-new"
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  stepType === 'new' ? 'bg-accent-teal' : 'bg-soft-gray'
                }`}>
                  <Settings className={`w-4 h-4 ${
                    stepType === 'new' ? 'text-white' : 'text-muted-foreground'
                  }`} />
                </div>
                <span className="text-sm font-semibold">New Web Service</span>
              </div>
            </Card>

            <Card
              className={`p-3 cursor-pointer transition-all ${
                stepType === 'existing'
                  ? 'border-2 border-accent-teal bg-accent-teal/5'
                  : 'border-2 border-soft-gray hover:border-accent-teal/50'
              }`}
              onClick={() => {
                setStepType('existing')
                setLocalStep({ ...localStep, stepType: 'existing', webService: null })
                if (onExpandChange) {
                  onExpandChange(false)
                }
              }}
              data-testid="step-type-existing"
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  stepType === 'existing' ? 'bg-accent-teal' : 'bg-soft-gray'
                }`}>
                  <Layers className={`w-4 h-4 ${
                    stepType === 'existing' ? 'text-white' : 'text-muted-foreground'
                  }`} />
                </div>
                <span className="text-sm font-semibold">Existing Stitch</span>
              </div>
            </Card>
          </div>
        </div>

        {/* New Web Service Selection */}
        {stepType === 'new' && (
          <div className="space-y-2">
            <Label htmlFor="web-service">Workday Web Service</Label>
            <Select
              value={localStep.webService || ''}
              onValueChange={(value) => handleFieldChange('webService', value)}
            >
              <SelectTrigger id="web-service">
                <SelectValue placeholder="Select a web service..." />
              </SelectTrigger>
              <SelectContent>
                {mockWebServices.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Execution Mode Selector (shown when web service is selected, hidden if in loop) */}
        {!localStep.loopBundleId && ((stepType === 'new' && localStep.webService) || (stepType === 'existing' && localStep.existingStitchId)) && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Execution Mode</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  localStep.executionMode === 'once_per_file'
                    ? 'border-2 border-accent-teal bg-gradient-to-br from-accent-teal/10 to-accent-teal/5'
                    : 'border-2 border-soft-gray hover:border-accent-teal/50'
                }`}
                onClick={() => handleFieldChange('executionMode', 'once_per_file')}
                data-testid="execution-mode-once-per-file"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    localStep.executionMode === 'once_per_file' ? 'bg-accent-teal' : 'bg-soft-gray'
                  }`}>
                    <Target className={`w-6 h-6 ${
                      localStep.executionMode === 'once_per_file' ? 'text-white' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Single Execution</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Executes once using first row
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all ${
                  localStep.executionMode === 'once_per_row' || !localStep.executionMode
                    ? 'border-2 border-accent-teal bg-gradient-to-br from-accent-teal/10 to-accent-teal/5'
                    : 'border-2 border-soft-gray hover:border-accent-teal/50'
                }`}
                onClick={() => handleFieldChange('executionMode', 'once_per_row')}
                data-testid="execution-mode-once-per-row"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    localStep.executionMode === 'once_per_row' || !localStep.executionMode ? 'bg-accent-teal' : 'bg-soft-gray'
                  }`}>
                    <Repeat className={`w-6 h-6 ${
                      localStep.executionMode === 'once_per_row' || !localStep.executionMode ? 'text-white' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">For Each Row</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Loops through every row
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Help text based on selected mode */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                {localStep.executionMode === 'once_per_file' ? (
                  <span>
                    <strong>Single Execution:</strong> This step will execute exactly once using data from the first row.
                    Ideal for creating parent records (e.g., Create Position) that will be referenced by subsequent steps.
                  </span>
                ) : (
                  <span>
                    <strong>For Each Row (Default):</strong> This step will execute for every row in your file.
                    Ideal for bulk operations (e.g., Contract multiple workers) or child records.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Loop Mode Info (shown when in loop) */}
        {localStep.loopBundleId && ((stepType === 'new' && localStep.webService) || (stepType === 'existing' && localStep.existingStitchId)) && (
          <div className="flex items-start gap-2 p-3 bg-accent-teal/10 border border-accent-teal/30 rounded-lg">
            <Repeat className="w-4 h-4 text-accent-teal flex-shrink-0 mt-0.5" />
            <p className="text-xs text-accent-teal">
              <strong>Loop Mode:</strong> This step is in a loop and will execute for each row automatically.
            </p>
          </div>
        )}

        {/* Loop Assignment */}
        {((stepType === 'new' && localStep.webService) || (stepType === 'existing' && localStep.existingStitchId)) && loopBundles && loopBundles.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="loop-bundle">Loop (Optional)</Label>
            <Select
              value={localStep.loopBundleId || 'none'}
              onValueChange={(value) => {
                if (value === 'none') {
                  if (localStep.loopBundleId) {
                    onRemoveStepFromBundle(step.id)
                  }
                  handleFieldChange('loopBundleId', null)
                } else {
                  onAddStepToBundle(step.id, value)
                  handleFieldChange('loopBundleId', value)
                }
              }}
            >
              <SelectTrigger id="loop-bundle">
                <SelectValue placeholder="Independent (not in a loop)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="flex items-center gap-2">
                    <span>Independent (not in a loop)</span>
                  </span>
                </SelectItem>
                {loopBundles.map((bundle) => (
                  <SelectItem key={bundle.id} value={bundle.id}>
                    <span className="flex items-center gap-2">
                      <Repeat className="w-3 h-3" />
                      <span>{bundle.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {localStep.loopBundleId && (
              <p className="text-xs text-muted-foreground">
                This step will execute as part of the loop
              </p>
            )}
          </div>
        )}

        {/* Existing Stitch Selection */}
        {stepType === 'existing' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="existing-stitch">Select Existing Stitch</Label>
              <Select
                value={localStep.existingStitchId || ''}
                onValueChange={(value) => {
                  const stitch = existingStitches.find(s => s.id === value)
                  setSelectedStitch(stitch)
                  const convertedMappings = convertLegacyMappings(stitch?.field_mappings || [])
                  setLocalStep({
                    ...localStep,
                    existingStitchId: value,
                    webService: stitch?.workday_service || '',
                    name: stitch?.name ? `Use: ${stitch.name}` : localStep.name,
                    stepType: 'existing',
                    mappings: convertedMappings
                  })
                  setShowStitchConfig(false) // Reset config visibility when changing stitch
                }}
              >
                <SelectTrigger id="existing-stitch">
                  <SelectValue placeholder="Choose a stitch..." />
                </SelectTrigger>
                <SelectContent>
                  {existingStitches.length === 0 ? (
                    <SelectItem value="none" disabled>No stitches available</SelectItem>
                  ) : (
                    existingStitches.map((stitch) => (
                      <SelectItem key={stitch.id} value={stitch.id}>
                        {stitch.name} ({stitch.workday_service})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {existingStitches.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Create stitches first to use them in patterns
                </p>
              )}
            </div>

            {/* Show stitch details and edit button when a stitch is selected */}
            {selectedStitch && (
              <div className="space-y-2">
                <Card className="p-3 bg-gradient-to-br from-accent-teal/5 to-white border-accent-teal/30">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary-dark-blue">{selectedStitch.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Service: {selectedStitch.workday_service}
                        </p>
                        {selectedStitch.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedStitch.description}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigate(createPageUrl('CreateIntegration') + `?id=${selectedStitch.id}`)
                        }}
                        className="gap-1 h-8 flex-shrink-0"
                        data-testid="edit-stitch-button"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Edit
                      </Button>
                    </div>
                    {selectedStitch.field_mappings && selectedStitch.field_mappings.length > 0 && (
                      <div className="pt-2 border-t border-accent-teal/20">
                        <p className="text-xs font-medium text-muted-foreground">
                          {selectedStitch.field_mappings.length} field mapping{selectedStitch.field_mappings.length !== 1 ? 's' : ''} configured
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Toggle button to view/edit configuration */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={showStitchConfig ? "default" : "outline"}
                    className={`gap-2 ${showStitchConfig ? 'bg-accent-teal text-white hover:bg-accent-teal/90' : 'border-accent-teal text-accent-teal hover:bg-accent-teal/10'}`}
                    onClick={() => {
                      const newState = !showStitchConfig
                      setShowStitchConfig(newState)
                      if (onExpandChange) {
                        onExpandChange(newState) // Expand when showing config
                      }
                    }}
                    data-testid="toggle-config-button"
                  >
                    {showStitchConfig ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showStitchConfig ? 'Hide Mappings' : 'Change Mappings'}
                  </Button>

                  {/* Test button for existing stitch */}
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 border-accent-teal text-accent-teal hover:bg-accent-teal hover:text-white"
                    onClick={handleTestStep}
                    data-testid="test-step-button"
                  >
                    <FlaskConical className="w-4 h-4" />
                    Test
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Step Button - for new web services */}
        {stepType === 'new' && (
          <Button
            variant="outline"
            className="w-full gap-2 border-accent-teal text-accent-teal hover:bg-accent-teal hover:text-white"
            onClick={handleTestStep}
            disabled={!localStep.webService}
            data-testid="test-step-button"
          >
            <FlaskConical className="w-4 h-4" />
            Test This Step
          </Button>
        )}

        {/* Data Mapping Interface */}
        {/* For new web services: always show if webService is selected */}
        {/* For existing stitches: only show if user clicks "View/Edit Config" */}
        {((stepType === 'new' && localStep.webService) ||
          (stepType === 'existing' && localStep.existingStitchId && showStitchConfig)) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pt-2">
              <FileText className="w-4 h-4 text-primary-dark-blue" />
              <Label className="text-base font-semibold">
                {stepType === 'existing' ? 'Field Mappings (View/Edit)' : 'Field Mapping'}
              </Label>
            </div>
            {stepType === 'existing' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> You're viewing the field mappings and global attributes from the existing stitch.
                  Any changes here will only affect this pattern step, not the original stitch.
                </p>
              </div>
            )}
            <DataMappingInterface
              step={localStep}
              previousSteps={previousSteps}
              onMappingChange={(mappings) => handleFieldChange('mappings', mappings)}
              webhookConfig={
                stepType === 'existing' && selectedStitch
                  ? {
                      // Create a combined webhookConfig from the selected stitch's data
                      columns: selectedStitch.sample_file_headers || [],
                      attributes: selectedStitch.parsed_attributes || [],
                      type: selectedStitch.parsed_attributes?.length > 0 ? 'json' : 'file'
                    }
                  : webhookConfig
              }
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-soft-gray bg-soft-gray/20">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 gap-2"
            data-testid="save-step-config"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </Card>
  )
}
