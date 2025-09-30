import React, { useState } from 'react'
import { FileUp, Zap, ArrowRight, Plus, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export default function DataMappingInterface({ step, previousSteps, onMappingChange, webhookConfig }) {
  const [mappings, setMappings] = useState(step.mappings || [])

  // Mock target fields for the selected web service
  const mockTargetFields = [
    'Position_ID',
    'Position_Title',
    'Worker_ID',
    'First_Name',
    'Last_Name',
    'Email',
    'Start_Date',
    'Manager_ID'
  ]

  // Get webhook source columns from configuration or use mock data
  const webhookColumns = webhookConfig?.columns || webhookConfig?.attributes || [
    'employee_id',
    'first_name',
    'last_name',
    'email',
    'position_title',
    'start_date',
    'manager_email'
  ]

  const handleAddMapping = () => {
    const newMapping = {
      id: `mapping-${Date.now()}`,
      targetField: '',
      sourceType: 'webhook',
      sourceField: ''
    }
    const updatedMappings = [...mappings, newMapping]
    setMappings(updatedMappings)
    onMappingChange(updatedMappings)
  }

  const handleUpdateMapping = (mappingId, field, value) => {
    const updatedMappings = mappings.map(m =>
      m.id === mappingId ? { ...m, [field]: value } : m
    )
    setMappings(updatedMappings)
    onMappingChange(updatedMappings)
  }

  const handleRemoveMapping = (mappingId) => {
    const updatedMappings = mappings.filter(m => m.id !== mappingId)
    setMappings(updatedMappings)
    onMappingChange(updatedMappings)
  }

  return (
    <div className="space-y-4">
      {/* Data Sources Section */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">
          Available Data Sources
        </div>

        {/* Webhook Source */}
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
              <FileUp className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm text-primary-dark-blue">
              Webhook Source
            </span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none text-xs">
              {webhookColumns.length} {webhookConfig?.type === 'file' ? 'columns' : 'attributes'}
            </Badge>
            {webhookConfig?.type && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none text-xs">
                {webhookConfig.type === 'file' ? 'File' : 'JSON'}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 ml-8">
            {webhookColumns.map((col) => (
              <Badge
                key={col}
                variant="outline"
                className="text-xs bg-white border-blue-200 text-blue-700"
                data-testid={`webhook-column-${col}`}
              >
                {col}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Golden Threads from Previous Steps */}
        {previousSteps.length > 0 && (
          <Card className="p-3 bg-gradient-to-br from-accent-teal/10 to-white border-accent-teal/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-accent-teal flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-sm text-primary-dark-blue">
                Golden Threads
              </span>
              <Badge variant="secondary" className="bg-accent-teal/20 text-accent-teal border-none text-xs">
                from previous steps
              </Badge>
            </div>
            <div className="space-y-2 ml-8">
              {previousSteps.map((prevStep, idx) => (
                <div key={prevStep.id} className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    Step {prevStep.order}: {prevStep.name}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Mock output fields - in real implementation, these would come from test results */}
                    {prevStep.testResults?.outputFields?.map((field) => (
                      <Badge
                        key={field}
                        variant="outline"
                        className="text-xs bg-white border-accent-teal/30 text-accent-teal"
                        data-testid={`golden-thread-${prevStep.id}-${field}`}
                      >
                        {field}
                      </Badge>
                    )) || (
                      <span className="text-xs text-muted-foreground italic">
                        Test this step to discover output fields
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Mappings Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            Field Mappings
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddMapping}
            className="gap-1 h-7 text-xs"
            data-testid="add-mapping-button"
          >
            <Plus className="w-3 h-3" />
            Add Mapping
          </Button>
        </div>

        {mappings.length === 0 ? (
          <Card className="p-4 border-dashed">
            <p className="text-sm text-muted-foreground text-center">
              No mappings yet. Click "Add Mapping" to start.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {mappings.map((mapping) => (
              <Card key={mapping.id} className="p-3 bg-soft-gray/20">
                <div className="space-y-2">
                  {/* Target Field */}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Select
                        value={mapping.targetField}
                        onValueChange={(value) => handleUpdateMapping(mapping.id, 'targetField', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Target field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {mockTargetFields.map((field) => (
                            <SelectItem key={field} value={field} className="text-xs">
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="col-span-5">
                      <Select
                        value={mapping.sourceType}
                        onValueChange={(value) => handleUpdateMapping(mapping.id, 'sourceType', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="webhook" className="text-xs">
                            <div className="flex items-center gap-1">
                              <FileUp className="w-3 h-3" />
                              Webhook
                            </div>
                          </SelectItem>
                          {previousSteps.length > 0 && (
                            <SelectItem value="golden-thread" className="text-xs">
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Golden Thread
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMapping(mapping.id)}
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Source Field */}
                  <div className="pl-5">
                    {mapping.sourceType === 'webhook' ? (
                      <Select
                        value={mapping.sourceField}
                        onValueChange={(value) => handleUpdateMapping(mapping.id, 'sourceField', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select webhook column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {webhookColumns.map((col) => (
                            <SelectItem key={col} value={col} className="text-xs">
                              {col}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        value={mapping.sourceField}
                        onValueChange={(value) => handleUpdateMapping(mapping.id, 'sourceField', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select golden thread field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {previousSteps.map((prevStep) =>
                            prevStep.testResults?.outputFields?.map((field) => (
                              <SelectItem key={`${prevStep.id}-${field}`} value={`${prevStep.id}.${field}`} className="text-xs">
                                Step {prevStep.order}: {field}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
