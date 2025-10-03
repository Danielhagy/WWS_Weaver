import React, { useState } from 'react'
import { FileUp, Zap, ArrowRight, Plus, X, Hash, Sparkles, Info, ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CREATE_POSITION_FIELDS, getFieldsByCategory as getCreatePositionFieldsByCategory } from '@/config/createPositionFields'
import { CONTRACT_CONTINGENT_WORKER_FIELDS, CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS, getFieldsByCategory as getContractFieldsByCategory } from '@/config/contractContingentWorkerFields'
import { END_CONTINGENT_WORKER_CONTRACT_FIELDS, getFieldsByCategory as getEndContractFieldsByCategory } from '@/config/endContingentWorkerContractFields'
import ChoiceFieldSelector from '../field-mapping/ChoiceFieldSelector'

// Import dynamic functions configuration
const DYNAMIC_FUNCTIONS = [
  {
    id: "today",
    label: "Today's Date",
    description: "Current date in YYYY-MM-DD format",
    execute: () => new Date().toISOString().split('T')[0]
  },
  {
    id: "now",
    label: "Current Date and Time",
    description: "Current timestamp in ISO format",
    execute: () => new Date().toISOString()
  },
  {
    id: "timestamp",
    label: "Unix Timestamp",
    description: "Current Unix timestamp (seconds since epoch)",
    execute: () => Math.floor(Date.now() / 1000).toString()
  },
  {
    id: "uuid",
    label: "Generate UUID",
    description: "Unique identifier for this record",
    execute: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16)
;
      });
    }
  },
  {
    id: "random_number",
    label: "Random Number (1-1000)",
    description: "Generate a random number",
    execute: () => Math.floor(Math.random() * 1000 + 1).toString()
  }
];

export default function DataMappingInterface({ step, previousSteps, onMappingChange, webhookConfig }) {
  const [mappings, setMappings] = useState(step.mappings || [])
  const [choiceSelections, setChoiceSelections] = useState(step.choiceSelections || {})
  const [choiceFieldValues, setChoiceFieldValues] = useState(step.choiceFieldValues || {})
  const [choiceFieldErrors, setChoiceFieldErrors] = useState({})

  // Initialize expanded categories based on web service
  const getInitialExpandedCategories = () => {
    if (step.webService === 'Create_Position') {
      return {
        "Basic Information": true,
        "Position Details": false,
        "Position Restrictions": false,
        "Request Information": false,
        "Process Options": false
      }
    } else if (step.webService === 'Contract_Contingent_Worker') {
      return {
        "Worker Identification": true,
        "Contract Information": false,
        "Position Details": false,
        "Organization": false,
        "Process Options": false
      }
    }
    return {}
  }

  const [expandedCategories, setExpandedCategories] = useState(getInitialExpandedCategories())

  // Get actual target fields and choice groups based on web service
  let targetFields = []
  let fieldsByCategory = {}
  let choiceGroups = []

  if (step.webService === 'Create_Position') {
    targetFields = CREATE_POSITION_FIELDS
    fieldsByCategory = getCreatePositionFieldsByCategory()
  } else if (step.webService === 'Contract_Contingent_Worker') {
    targetFields = CONTRACT_CONTINGENT_WORKER_FIELDS
    fieldsByCategory = getContractFieldsByCategory()
    choiceGroups = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS
  } else if (step.webService === 'End_Contingent_Worker_Contract') {
    targetFields = END_CONTINGENT_WORKER_CONTRACT_FIELDS
    fieldsByCategory = getEndContractFieldsByCategory()
  }

  // Get webhook source columns from configuration or use mock data
  const webhookColumns = webhookConfig?.columns || [
    'employee_id',
    'first_name',
    'last_name',
    'email',
    'position_title',
    'start_date',
    'manager_email'
  ]

  // Get global JSON attributes
  const globalAttributes = webhookConfig?.attributes || []

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const getMappingForField = (fieldName) => {
    return mappings.find(m => m.targetField === fieldName)
  }

  const updateMapping = (fieldName, updates) => {
    const newMappings = [...mappings];
    const existingIndex = newMappings.findIndex(m => m.targetField === fieldName);

    const mapping = {
      targetField: fieldName,
      ...getMappingForField(fieldName),
      ...updates
    };

    if (existingIndex >= 0) {
      if (mapping.sourceType === 'unmapped') {
        newMappings.splice(existingIndex, 1);
      } else {
        newMappings[existingIndex] = mapping;
      }
    } else if (mapping.sourceType !== 'unmapped') {
      newMappings.push(mapping);
    }

    setMappings(newMappings);
    onMappingChange(newMappings);
  }

  // Handle choice group selection
  const handleChoiceSelect = (choiceGroupId, optionId) => {
    const newSelections = {
      ...choiceSelections,
      [choiceGroupId]: optionId
    }
    setChoiceSelections(newSelections)
    // Notify parent of choice selection change
    if (onMappingChange) {
      onMappingChange(mappings, newSelections, choiceFieldValues)
    }
  }

  const handleChoiceFieldChange = (xmlPath, value) => {
    const newFieldValues = {
      ...choiceFieldValues,
      [xmlPath]: value
    }
    setChoiceFieldValues(newFieldValues)
    // Notify parent of field value change
    if (onMappingChange) {
      onMappingChange(mappings, choiceSelections, newFieldValues)
    }
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
              {previousSteps.map((prevStep) => (
                <div key={prevStep.id} className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    Step {prevStep.order}: {prevStep.name}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
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

      {/* Choice Groups Section */}
      {choiceGroups && choiceGroups.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground border-b pb-2">
            Choice Groups
            <p className="text-xs text-gray-500 mt-1">Select exactly one option from each group</p>
          </div>
          {choiceGroups.map((choiceGroup) => (
            <ChoiceFieldSelector
              key={choiceGroup.id}
              choiceGroup={choiceGroup}
              selectedOptionId={choiceSelections[choiceGroup.id]}
              onSelect={(optionId) => handleChoiceSelect(choiceGroup.id, optionId)}
              fieldValues={choiceFieldValues}
              onFieldChange={handleChoiceFieldChange}
              errors={choiceFieldErrors}
              webhookColumns={webhookColumns}
              globalAttributes={globalAttributes}
              previousSteps={previousSteps}
              dynamicFunctions={DYNAMIC_FUNCTIONS}
            />
          ))}
        </div>
      )}

      {/* Field Mapping by Category */}
      {targetFields.length > 0 ? (
        <div className="space-y-3 pt-2">
          <div className="text-sm font-medium text-muted-foreground">
            Field Mappings
          </div>

          {Object.entries(fieldsByCategory).map(([category, fields]) => (
            <Card key={category} className="border-2 border-soft-gray">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between bg-soft-gray/20 hover:bg-soft-gray/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedCategories[category] ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                  <h3 className="text-sm font-semibold text-primary-dark-blue">{category}</h3>
                  <Badge variant="outline" className="text-xs">
                    {fields.length} fields
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {fields.filter(f => getMappingForField(f.name)).length} mapped
                </div>
              </button>

              {expandedCategories[category] && (
                <div className="p-4 space-y-3">
                  {fields.map((field) => (
                    <FieldMappingRow
                      key={field.name}
                      field={field}
                      mapping={getMappingForField(field.name) || { targetField: field.name, sourceType: 'unmapped' }}
                      webhookColumns={webhookColumns}
                      previousSteps={previousSteps}
                      dynamicFunctions={DYNAMIC_FUNCTIONS}
                      onUpdate={(updates) => updateMapping(field.name, updates)}
                    />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-4 border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            Select a web service to see available fields for mapping
          </p>
        </Card>
      )}
    </div>
  )
}

// Individual Field Mapping Row Component
function FieldMappingRow({ field, mapping, webhookColumns, previousSteps, dynamicFunctions, onUpdate }) {
  const isConfigured = mapping.sourceType !== 'unmapped'

  return (
    <Card className={`p-3 border ${isConfigured ? 'border-accent-teal/30 bg-accent-teal/5' : 'border-soft-gray'}`}>
      <div className="space-y-2">
        {/* Field Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Label className="text-sm font-semibold text-gray-900">{field.name}</Label>
              {field.required && (
                <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Required</Badge>
              )}
              {field.type && (
                <Badge variant="outline" className="text-xs capitalize">{field.type}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{field.description}</p>
            {field.helpText && (
              <div className="flex items-start gap-1 mt-1">
                <Info className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-500">{field.helpText}</p>
              </div>
            )}
          </div>
          {isConfigured && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onUpdate({ sourceType: 'unmapped' })}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Mapping Type Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            size="sm"
            variant={mapping.sourceType === 'existing_attribute' ? "default" : "outline"}
            className={`justify-start text-xs h-auto py-2 ${mapping.sourceType === 'existing_attribute' ? "bg-accent-teal text-white hover:bg-accent-teal/90" : ""}`}
            onClick={() => onUpdate({ sourceType: 'existing_attribute', sourceLocation: 'webhook' })}
          >
            <FileUp className="w-3 h-3 mr-1" />
            Existing
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mapping.sourceType === 'hardcoded' ? "default" : "outline"}
            className={`justify-start text-xs h-auto py-2 ${mapping.sourceType === 'hardcoded' ? "bg-accent-teal text-white hover:bg-accent-teal/90" : ""}`}
            onClick={() => onUpdate({ sourceType: 'hardcoded', hardcodedValue: '' })}
          >
            <Hash className="w-3 h-3 mr-1" />
            Hardcode
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mapping.sourceType === 'dynamic_function' ? "default" : "outline"}
            className={`justify-start text-xs h-auto py-2 ${mapping.sourceType === 'dynamic_function' ? "bg-accent-teal text-white hover:bg-accent-teal/90" : ""}`}
            onClick={() => onUpdate({ sourceType: 'dynamic_function', dynamicFunction: '' })}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Dynamic
          </Button>
        </div>

        {/* Configuration based on mapping type */}
        {mapping.sourceType === 'existing_attribute' && (
          <div className="space-y-2 pl-2 border-l-2 border-accent-teal/30">
            <div>
              <Label className="text-xs">Source</Label>
              <Select
                value={mapping.sourceLocation || 'webhook'}
                onValueChange={(value) => onUpdate({ ...mapping, sourceLocation: value, sourceField: '' })}
              >
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webhook">
                    <div className="flex items-center gap-2">
                      <FileUp className="w-3 h-3" />
                      Webhook
                    </div>
                  </SelectItem>
                  {previousSteps.map((prevStep) => (
                    <SelectItem key={prevStep.id} value={prevStep.id}>
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Step {prevStep.order}: {prevStep.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Field</Label>
              <Select
                value={mapping.sourceField || ''}
                onValueChange={(value) => onUpdate({ ...mapping, sourceField: value })}
              >
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  {mapping.sourceLocation === 'webhook' ? (
                    webhookColumns.map((col) => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))
                  ) : (
                    (() => {
                      const selectedStep = previousSteps.find(s => s.id === mapping.sourceLocation);
                      if (selectedStep?.testResults?.outputFields) {
                        return selectedStep.testResults.outputFields.map((field) => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ));
                      }
                      return <SelectItem value="_none_" disabled>Test the previous step first</SelectItem>;
                    })()
                  )}
                </SelectContent>
              </Select>
            </div>
            {/* For text_with_type fields, also show type selector */}
            {field.type === 'text_with_type' && field.typeOptions && (
              <div>
                <Label className="text-xs">ID Type</Label>
                <Select
                  value={mapping.sourceFieldType || field.defaultType || field.typeOptions[0]}
                  onValueChange={(value) => onUpdate({ ...mapping, sourceFieldType: value })}
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.typeOptions.map((typeOpt) => (
                      <SelectItem key={typeOpt} value={typeOpt}>{typeOpt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Specify the type of ID being passed
                </p>
              </div>
            )}
          </div>
        )}

        {mapping.sourceType === 'hardcoded' && (
          <div className="pl-2 border-l-2 border-accent-teal/30 space-y-2">
            <Label className="text-xs">Value</Label>

            {/* Boolean fields: show dropdown with true/false */}
            {field.type === 'boolean' && (
              <Select
                value={mapping.hardcodedValue || (field.defaultValue !== undefined ? String(field.defaultValue) : '')}
                onValueChange={(value) => onUpdate({ ...mapping, hardcodedValue: value })}
              >
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue placeholder="Select true or false..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Date fields: show date input */}
            {field.type === 'date' && (
              <Input
                type="date"
                value={mapping.hardcodedValue || ''}
                onChange={(e) => onUpdate({ ...mapping, hardcodedValue: e.target.value })}
                className="h-8 mt-1"
              />
            )}

            {/* Number fields: show number input */}
            {field.type === 'number' && (
              <Input
                type="number"
                step="0.01"
                value={mapping.hardcodedValue || ''}
                onChange={(e) => onUpdate({ ...mapping, hardcodedValue: e.target.value })}
                placeholder="Enter number..."
                className="h-8 mt-1"
              />
            )}

            {/* Textarea fields: show textarea */}
            {field.type === 'textarea' && (
              <textarea
                value={mapping.hardcodedValue || ''}
                onChange={(e) => onUpdate({ ...mapping, hardcodedValue: e.target.value })}
                placeholder="Enter text..."
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-transparent"
                rows={3}
              />
            )}

            {/* Text and text_with_type fields: show text input */}
            {(field.type === 'text' || field.type === 'text_with_type') && (
              <div className="space-y-2">
                <Input
                  type="text"
                  value={mapping.hardcodedValue || ''}
                  onChange={(e) => onUpdate({ ...mapping, hardcodedValue: e.target.value })}
                  placeholder="Enter value..."
                  className="h-8 mt-1"
                />
                {field.type === 'text_with_type' && field.typeOptions && (
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={mapping.hardcodedType || field.defaultType || field.typeOptions[0]}
                      onValueChange={(value) => onUpdate({ ...mapping, hardcodedType: value })}
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.typeOptions.map((typeOpt) => (
                          <SelectItem key={typeOpt} value={typeOpt}>{typeOpt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              This value will be used for all records
            </p>
          </div>
        )}

        {mapping.sourceType === 'dynamic_function' && (
          <div className="space-y-2 pl-2 border-l-2 border-accent-teal/30">
            <div>
              <Label className="text-xs">Function</Label>
              <Select
                value={mapping.dynamicFunction || ''}
                onValueChange={(value) => onUpdate({ ...mapping, dynamicFunction: value })}
              >
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue placeholder="Choose function..." />
                </SelectTrigger>
                <SelectContent>
                  {dynamicFunctions.map((func) => (
                    <SelectItem key={func.id} value={func.id}>{func.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {mapping.dynamicFunction && (
              <Card className="p-2 bg-gradient-to-br from-accent-teal/5 to-white border-accent-teal/20">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-primary-dark-blue">Preview:</strong>{' '}
                  <span className="font-mono font-semibold text-accent-teal">
                    {dynamicFunctions.find(f => f.id === mapping.dynamicFunction)?.execute()}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dynamicFunctions.find(f => f.id === mapping.dynamicFunction)?.description}
                </p>
              </Card>
            )}
            {/* For text_with_type fields, also show type selector */}
            {field.type === 'text_with_type' && field.typeOptions && (
              <div>
                <Label className="text-xs">ID Type</Label>
                <Select
                  value={mapping.dynamicFunctionType || field.defaultType || field.typeOptions[0]}
                  onValueChange={(value) => onUpdate({ ...mapping, dynamicFunctionType: value })}
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.typeOptions.map((typeOpt) => (
                      <SelectItem key={typeOpt} value={typeOpt}>{typeOpt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Specify the type of ID for the generated value
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
