import React, { useState } from 'react'
import { X, Settings, FlaskConical, Save, Zap, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import DataMappingInterface from './DataMappingInterface'

export default function StepConfigPanel({ step, isOpen, onClose, onUpdate, previousSteps }) {
  const [localStep, setLocalStep] = useState(step || {})

  React.useEffect(() => {
    if (step) {
      setLocalStep(step)
    }
  }, [step])

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
    onUpdate(step.id, localStep)
    onClose()
  }

  const handleTestStep = () => {
    // TODO: Implement in Milestone 2
    console.log('Testing step:', localStep)
  }

  const handleFieldChange = (field, value) => {
    setLocalStep({ ...localStep, [field]: value })
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
              {previousSteps.length} Golden Thread{previousSteps.length !== 1 ? 's' : ''} Available
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
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

        {/* Web Service Selection */}
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

        {/* Test Step Button */}
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

        {/* Data Mapping Interface */}
        {localStep.webService && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pt-2">
              <FileText className="w-4 h-4 text-primary-dark-blue" />
              <Label className="text-base font-semibold">Field Mapping</Label>
            </div>
            <DataMappingInterface
              step={localStep}
              previousSteps={previousSteps}
              onMappingChange={(mappings) => handleFieldChange('mappings', mappings)}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-soft-gray bg-soft-gray/20">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
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
