import React, { useState, useEffect } from 'react'
import { X, Settings, FlaskConical, Save, Zap, FileText, Layers, ExternalLink, Eye, EyeOff, Target, Repeat, Info, CheckCircle, XCircle, Loader2, History } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import DataMappingInterface from './DataMappingInterface'
import { Integration } from '@/entities/Integration'
import { IntegrationRun } from '@/entities/IntegrationRun'
import { WorkdayCredential } from '@/entities/WorkdayCredential'
import { useNavigate } from 'react-router-dom'
import { createPageUrl } from '@/utils'
import { getServiceByValue } from '@/config/workdayServices'
import { extractResponseVariables, flattenVariables, substituteVariables } from '@/utils/xmlResponseParser'
import { generateSOAPRequest } from '@/utils/soapGenerator'

export default function StepConfigPanel({ step, isOpen, onClose, onUpdate, previousSteps, webhookConfig, onExpandChange, loopBundles, onAddStepToBundle, onRemoveStepFromBundle }) {
  const navigate = useNavigate()
  const [localStep, setLocalStep] = useState(step || {})
  const [stepType, setStepType] = useState(step?.stepType || 'new') // 'new' or 'existing'
  const [existingStitches, setExistingStitches] = useState([])
  const [selectedStitch, setSelectedStitch] = useState(null)
  const [showStitchConfig, setShowStitchConfig] = useState(false)
  const [isTestingStep, setIsTestingStep] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [lastRunId, setLastRunId] = useState(null)
  const testResultsRef = React.useRef(null)

  // Helper function to normalize web service name to PascalCase
  const normalizeWebService = (service) => {
    if (!service) return ''
    return service
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('_')
  }

  // Restore local state when step changes
  React.useEffect(() => {
    if (step) {
      // Normalize web service name if it exists
      const normalizedStep = {
        ...step,
        webService: step.webService ? normalizeWebService(step.webService) : step.webService
      }
      setLocalStep(normalizedStep)
      // Infer stepType from step data if not explicitly set
      // If existingStitchId is set, it must be an existing stitch
      const inferredStepType = step.existingStitchId ? 'existing' : (step.stepType || 'new')
      setStepType(inferredStepType)
      // Clear test results when switching to a different step
      setTestResult(null)
    }
  }, [step])

  // Debug: Log testResult changes and auto-scroll to results
  React.useEffect(() => {
    console.log('🔍 testResult state changed:', testResult)
    if (testResult && testResultsRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        testResultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }, 150)
    }
  }, [testResult])

  // Helper function to convert legacy field_mappings to new mapping format
  const convertLegacyMappings = (fieldMappings) => {
    if (!fieldMappings || fieldMappings.length === 0) return []

    console.log('🔄 convertLegacyMappings called with', fieldMappings.length, 'mappings');

    return fieldMappings.map((mapping, idx) => {
      // Handle snake_case format from database (source_type, source_value, target_field)
      if (mapping.source_type) {
        console.log(`📥 Converting mapping ${idx}:`, {
          target_field: mapping.target_field,
          source_type: mapping.source_type,
          source_value: mapping.source_value,
          xmlPath: mapping.xmlPath,
          type_value: mapping.type_value
        });

        const converted = {
          // CRITICAL: Use xmlPath as targetField for soapGenerator compatibility
          // soapGenerator expects targetField to be the XML path (dot notation), not the display name
          targetField: mapping.xmlPath || mapping.target_field || mapping.targetField,
          // Also preserve xmlPath separately for compatibility
          ...(mapping.xmlPath && { xmlPath: mapping.xmlPath })
        }

        // Convert source_type to sourceType and map the values
        if (mapping.source_type === 'hardcoded') {
          // Keep as 'hardcoded' for UI - will convert to 'static_value' only when calling soapGenerator
          converted.sourceType = 'hardcoded'
          converted.hardcodedValue = mapping.source_value
          converted.transformation = mapping.transformation
          if (mapping.type_value) {
            converted.hardcodedType = mapping.type_value
          }
        } else if (mapping.source_type === 'file_column') {
          converted.sourceType = 'existing_attribute'
          converted.sourceLocation = 'webhook'
          converted.sourceField = mapping.source_value
          converted.transformation = mapping.transformation
          // For file columns with type, use sourceFieldType
          if (mapping.type_value) {
            converted.sourceFieldType = mapping.type_value
          }
        } else if (mapping.source_type === 'dynamic_function') {
          converted.sourceType = 'dynamic_function'
          converted.dynamicFunction = mapping.source_value
          converted.transformation = mapping.transformation
        } else if (mapping.source_type === 'global') {
          converted.sourceType = 'existing_attribute'
          converted.sourceLocation = 'global'
          converted.sourceField = mapping.source_value
          converted.transformation = mapping.transformation
          // For global attributes with type, use sourceFieldType
          if (mapping.type_value) {
            converted.sourceFieldType = mapping.type_value
          }
        } else if (mapping.source_type === 'previous_step') {
          converted.sourceType = 'previous_step_variable'
          converted.stepVariable = mapping.source_value
          converted.transformation = mapping.transformation
        }

        // Handle auto-inference for Reference ID fields WITHOUT type_value
        // Only apply if type wasn't already set above
        if (!mapping.type_value && !converted.hardcodedType && !converted.sourceFieldType) {
          // If type_value is missing but this is a Reference ID field, infer the default type
          // This handles legacy integrations that didn't save type_value
          const xmlPath = mapping.xmlPath || mapping.target_field || ''
          if (xmlPath.includes('_Reference.ID')) {
            // Extract the reference type from the path and convert to appropriate type
            // Examples:
            // "Supervisory_Organization_Reference.ID" -> "Organization_Reference_ID"
            // "Location_Reference.ID" -> "Location_ID"
            // "Worker_Type_Reference.ID" -> "Worker_Type_ID"
            const refMatch = xmlPath.match(/([A-Z][A-Za-z_]+)_Reference\.ID/)
            if (refMatch) {
              let refType = refMatch[1]
              // Map common reference types to their ID types (matching Workday API specs)
              const typeMap = {
                'Supervisory_Organization': 'Organization_Reference_ID',
                'Location': 'Location_ID',
                'Worker_Type': 'Worker_Type_ID',
                'Time_Type': 'Position_Time_Type_ID',  // Workday spec: only WID or Position_Time_Type_ID allowed
                'Position_Time_Type': 'Position_Time_Type_ID',  // Same - used in Contract Contingent Worker
                'Position_Worker_Type': 'Contingent_Worker_Type_ID',
                'Job_Profile': 'Job_Profile_ID',
                'Default_Weekly_Hours': 'Default_Weekly_Hours_ID'
              }
              const inferredType = typeMap[refType] || `${refType}_ID`

              // Set the correct property based on source type
              if (converted.sourceType === 'static_value') {
                converted.hardcodedType = inferredType  // For UI
                converted.sourceFieldType = inferredType  // For soapGenerator
              } else if (converted.sourceType === 'existing_attribute') {
                converted.sourceFieldType = inferredType
              }

              console.log(`🔧 StepConfigPanel auto-inferred type for ${xmlPath}: ${inferredType} (set as ${converted.sourceType === 'static_value' ? 'hardcodedType+sourceFieldType' : 'sourceFieldType'})`)
            }
          }
        }

        console.log(`📤 Converted result ${idx}:`, {
          targetField: converted.targetField,
          xmlPath: converted.xmlPath,
          sourceType: converted.sourceType,
          staticValue: converted.staticValue,
          hardcodedValue: converted.hardcodedValue,
          sourceField: converted.sourceField,
          sourceFieldType: converted.sourceFieldType,
          hardcodedType: converted.hardcodedType
        });

        return converted
      }

      // Handle camelCase format (sourceType already exists)
      if (mapping.sourceType) {
        // Normalize static_value to hardcoded for UI consistency
        if (mapping.sourceType === 'static_value') {
          return {
            ...mapping,
            sourceType: 'hardcoded',
            hardcodedValue: mapping.staticValue || mapping.hardcodedValue
          }
        }

        // Handle case where sourceField is undefined for webhook mappings
        if (mapping.sourceType === 'existing_attribute' &&
            mapping.sourceLocation === 'webhook' &&
            !mapping.sourceField) {
          return {
            ...mapping,
            sourceType: 'unmapped',
            sourceLocation: undefined,
            sourceField: undefined
          }
        }

        return mapping
      }

      // Convert from very old legacy format (target_field, source_field)
      return {
        // Use xmlPath if available, otherwise fall back to target_field
        targetField: mapping.xmlPath || mapping.target_field,
        sourceType: 'existing_attribute',
        sourceLocation: 'webhook',
        sourceField: mapping.source_field,
        transformation: mapping.transformation,
        ...(mapping.xmlPath && { xmlPath: mapping.xmlPath })
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

  const handleTestStep = async (e) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log('🧪 Test button clicked - starting test...')
    setIsTestingStep(true)
    setTestResult(null)

    const startTime = Date.now()
    let pendingRun = null
    let soapBody = null

    try {
      // Get default credential
      const credential = await WorkdayCredential.getDefault()
      if (!credential) {
        setTestResult({
          success: false,
          error: 'No default credentials configured. Please set a default credential in Settings > Credentials.'
        })
        setIsTestingStep(false)
        return
      }

      // Get integration/step name for the run record
      const integrationName = selectedStitch?.name || localStep.name || `Step ${step.order}: ${localStep.webService || 'Test'}`

      // Create pending run record immediately
      pendingRun = await IntegrationRun.create({
        integration_id: selectedStitch?.id || `step-${step.id}`,
        integration_name: integrationName,
        status: 'running',
        trigger_type: 'canvas_test',
        records_processed: 0,
        records_succeeded: 0,
        records_failed: 0
      })

      console.log('📝 Created pending run record:', pendingRun.id)
      setLastRunId(pendingRun.id)

      // Build variable context from webhook data and previous steps
      const variableContext = {}

      console.log('🌐 Webhook config received:', {
        hasWebhookConfig: !!webhookConfig,
        hasSampleData: !!webhookConfig?.sampleData,
        sampleDataRows: webhookConfig?.sampleData?.length || 0,
        columns: webhookConfig?.columns || []
      })

      // Add webhook data to context (find row with most filled fields)
      if (webhookConfig && webhookConfig.sampleData && webhookConfig.sampleData.length > 0) {
        // Find the row with the most non-empty fields
        let bestRow = webhookConfig.sampleData[0]
        let maxFilledFields = 0

        webhookConfig.sampleData.forEach(row => {
          const filledFields = Object.values(row).filter(val => val !== null && val !== undefined && val !== '').length
          if (filledFields > maxFilledFields) {
            maxFilledFields = filledFields
            bestRow = row
          }
        })

        // Add all columns from the best row to variable context
        Object.entries(bestRow).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            variableContext[key] = value
          }
        })

        console.log('📊 Webhook data row with most filled fields:', bestRow)
        console.log('🔑 Webhook variables added to context:', Object.keys(bestRow).filter(k => bestRow[k]))
      }

      // Add variables from previous steps
      if (previousSteps && previousSteps.length > 0) {
        // Sort previous steps by order
        const sortedPrevSteps = [...previousSteps].sort((a, b) => (a.order || 0) - (b.order || 0))

        // Only include steps that come before the current step
        const currentStepOrder = step?.order || 0
        const priorSteps = sortedPrevSteps.filter(s => (s.order || 0) < currentStepOrder)

        // Accumulate variables from all prior steps
        priorSteps.forEach(prevStep => {
          if (prevStep.extractedVariables) {
            const flatVars = flattenVariables(prevStep.extractedVariables)
            Object.assign(variableContext, flatVars)
          }
        })

        console.log('🔗 Variables from previous steps:', Object.keys(variableContext).filter(k => k.includes('.')))
      }

      console.log('✅ Total variables available for substitution:', Object.keys(variableContext).length)

      // Generate SOAP dynamically from mappings
      const webService = localStep.webService || selectedStitch?.workday_service
      if (!webService) {
        setTestResult({
          success: false,
          error: 'No web service selected'
        })
        setIsTestingStep(false)
        return
      }

      // Get service category from web service
      const serviceConfig = getServiceByValue(webService)
      const serviceCategory = serviceConfig?.category || 'Staffing'  // All current services are Staffing

      // Use localStep.mappings directly - they're already in the correct format from convertLegacyMappings
      const mappingsToUse = localStep.mappings || []

      console.log('📦 Mappings to use for SOAP generation:', {
        count: mappingsToUse.length,
        sample: mappingsToUse.slice(0, 2)
      })

      // Log each mapping for debugging
      mappingsToUse.forEach((m, idx) => {
        console.log(`🔍 Mapping ${idx}:`, {
          targetField: m.targetField,
          sourceType: m.sourceType,
          sourceField: m.sourceField,
          hardcodedValue: m.hardcodedValue,
          hardcodedType: m.hardcodedType,
          sourceFieldType: m.sourceFieldType,
          xmlPath: m.xmlPath
        })
      })

      console.log('🔧 Generating SOAP for:', {
        webService,
        serviceCategory,
        mappings: mappingsToUse.length,
        choiceSelections: Object.keys(localStep.choiceSelections || {}).length,
        choiceFieldValues: Object.keys(localStep.choiceFieldValues || {}).length
      })

      // Convert mappings to soapGenerator format (hardcoded -> static_value)
      const soapMappings = mappingsToUse.map(m => {
        if (m.sourceType === 'hardcoded') {
          return {
            ...m,
            sourceType: 'static_value',
            staticValue: m.hardcodedValue,
            sourceFieldType: m.hardcodedType
          };
        }
        return m;
      });

      console.log('🔄 Converted to SOAP format:', soapMappings.slice(0, 2));

      // Generate SOAP using the converted mappings
      soapBody = generateSOAPRequest(
        webService,
        soapMappings,
        localStep.choiceSelections || {},
        localStep.choiceFieldValues || {},
        webhookConfig
      )
      console.log('✅ Generated SOAP for web service:', webService)
      console.log('📄 SOAP Body preview (first 500 chars):', soapBody.substring(0, 500))

      // Substitute variables from previous steps
      soapBody = substituteVariables(soapBody, variableContext)

      // Make the SOAP request via backend proxy
      const response = await fetch('http://localhost:3002/api/workday/soap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credential,
          soapBody,
          service: serviceCategory
        })
      })

      const result = await response.json()
      console.log('✅ SOAP request completed:', {
        success: result.success,
        hasData: !!result.data,
        dataType: typeof result.data,
        dataLength: result.data?.length || 0
      })

      // Check if result.data is valid
      if (!result.data) {
        console.error('❌ Backend returned no data:', result)
        throw new Error('Backend returned empty response data')
      }

      // Ensure result.data is a string
      const xmlData = typeof result.data === 'string' ? result.data : String(result.data || '')
      console.log('📄 XML Response preview (first 200 chars):', xmlData.substring(0, 200))

      const duration = Date.now() - startTime
      const version = credential.webservice_version || 'v45.0'
      const endpointUrl = `${credential.tenant_url}/${serviceCategory}/${version}`

      if (result.success) {
        // Extract variables from response (use xmlData instead of result.data)
        const extractedVars = extractResponseVariables(xmlData)
        const flatVars = flattenVariables(extractedVars)

        console.log('📊 Extracted variables from step test:', extractedVars)

        // Check if it's a SOAP fault/error
        const isSoapFault = xmlData.includes('<SOAP-ENV:Fault') || xmlData.includes('<faultcode>')

        // Update run record with success
        if (pendingRun) {
          await IntegrationRun.update(pendingRun.id, {
            status: isSoapFault ? 'failed' : 'success',
            records_processed: 1,
            records_succeeded: isSoapFault ? 0 : 1,
            records_failed: isSoapFault ? 1 : 0,
            soap_request: soapBody,
            soap_response: xmlData,
            duration_ms: duration,
            endpoint_url: endpointUrl,
            completed_at: new Date().toISOString()
          })
          console.log('✅ Updated run record with success:', pendingRun.id)
        }

        setTestResult({
          success: true,
          response: xmlData,
          message: 'Test executed successfully!',
          extractedVariables: extractedVars
        })
        // Update step with test result and extracted variables
        const updatedStep = {
          ...localStep,
          testResults: {
            success: true,
            timestamp: new Date().toISOString(),
            response: xmlData,
            extractedVariables: extractedVars
          },
          extractedVariables: extractedVars
        }
        setLocalStep(updatedStep)

        // Immediately persist to parent so variables are available
        onUpdate(step.id, updatedStep)

        console.log('✨ Test result state updated to SUCCESS and persisted to parent')
      } else {
        // Extract detailed error information
        const errorDetails = result.error || result.data || result.message || 'Test failed'
        const fullErrorMessage = typeof errorDetails === 'object'
          ? JSON.stringify(errorDetails, null, 2)
          : errorDetails

        console.error('❌ SOAP request failed:', {
          error: result.error,
          data: result.data,
          message: result.message,
          fullResponse: result
        })

        // Update run record with failure
        if (pendingRun) {
          await IntegrationRun.update(pendingRun.id, {
            status: 'failed',
            records_processed: 1,
            records_succeeded: 0,
            records_failed: 1,
            soap_request: soapBody,
            soap_response: fullErrorMessage,
            error_message: fullErrorMessage,
            duration_ms: duration,
            endpoint_url: endpointUrl,
            completed_at: new Date().toISOString()
          })
          console.log('❌ Updated run record with failure:', pendingRun.id)
        }

        setTestResult({
          success: false,
          error: result.error || 'Test failed'
        })
        console.log('❌ Test result state updated to FAILED:', result.error)
      }
    } catch (error) {
      console.error('💥 Test error caught:', error)

      // Build detailed error message
      const errorMessage = error.stack || error.message || 'Failed to execute test'
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        toString: error.toString()
      }

      console.error('📋 Full error details:', errorDetails)

      // Update run record with error if it was created
      if (pendingRun) {
        const duration = Date.now() - startTime
        await IntegrationRun.update(pendingRun.id, {
          status: 'failed',
          records_processed: 1,
          records_succeeded: 0,
          records_failed: 1,
          soap_request: soapBody || 'Request not generated',
          soap_response: JSON.stringify(errorDetails, null, 2),
          error_message: errorMessage,
          duration_ms: duration,
          completed_at: new Date().toISOString()
        })
        console.log('❌ Updated run record with error:', pendingRun.id)
      }

      setTestResult({
        success: false,
        error: errorMessage
      })
    } finally {
      setIsTestingStep(false)
      console.log('🏁 Test execution completed - isTestingStep set to false')
    }
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
        {/* Test Error Display */}
        {step.testResults && !step.testResults.success && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-1">Test Failed</h4>
                <p className="text-sm text-red-700">{step.testResults.error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Last tested: {new Date(step.testResults.timestamp).toLocaleString()}
                </p>
              </div>
              {lastRunId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => navigate(createPageUrl('RunHistory') + `?runId=${lastRunId}`)}
                >
                  <History className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Test Success Display */}
        {step.testResults && step.testResults.success && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 mb-1">Test Passed</h4>
                <p className="text-sm text-green-700">Step executed successfully</p>
                <p className="text-xs text-green-600 mt-2">
                  Last tested: {new Date(step.testResults.timestamp).toLocaleString()}
                </p>
              </div>
              {lastRunId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                  onClick={() => navigate(createPageUrl('RunHistory') + `?runId=${lastRunId}`)}
                >
                  <History className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              )}
            </div>
          </Card>
        )}

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
                  console.log('🔍 Raw stitch field_mappings:', stitch?.field_mappings)
                  let convertedMappings = convertLegacyMappings(stitch?.field_mappings || [])

                  // Check if stitch's webhook file matches pattern's webhook file
                  const stitchHeaders = stitch?.sample_file_headers || []
                  const patternColumns = webhookConfig?.columns || []
                  const patternAttributes = webhookConfig?.attributes || []

                  // Determine if this is a webhook trigger (JSON/file-based)
                  const isWebhookTrigger = webhookConfig?.type === 'json' || webhookConfig?.type === 'file'

                  // Compare headers/columns (order doesn't matter, just check if all columns match)
                  const headersMatch = stitchHeaders.length === patternColumns.length &&
                    stitchHeaders.every(header => patternColumns.includes(header))

                  console.log('🔧 Selected stitch:', stitch?.name)
                  console.log('📁 Stitch headers:', stitchHeaders)
                  console.log('📁 Pattern columns:', patternColumns)
                  console.log('🔍 Headers match:', headersMatch)
                  console.log('🎯 Is webhook trigger:', isWebhookTrigger)

                  // Handle mapping preservation based on trigger type
                  if (isWebhookTrigger) {
                    // WEBHOOK TRIGGER: Keep all mappings if headers match
                    if (headersMatch) {
                      console.log('✅ Webhook trigger with matching headers - keeping ALL mappings')
                      // Keep all mappings as-is
                    } else {
                      // Headers don't match - reset existing file mappings only
                      console.log('⚠️ Webhook trigger with different file - resetting existing file mappings')
                      convertedMappings = convertedMappings.map(mapping => {
                        if (mapping.sourceType === 'existing_attribute' && mapping.sourceLocation === 'webhook') {
                          // Clear webhook file mappings - set to unmapped
                          return {
                            ...mapping,
                            sourceType: 'unmapped',
                            sourceLocation: undefined,
                            sourceField: undefined
                          }
                        }
                        // Keep hardcoded, dynamic, global, and previous step mappings
                        return mapping
                      })
                    }
                  } else {
                    // REGULAR TRIGGER (non-webhook): Reset existing file mappings
                    console.log('🔄 Regular trigger - resetting existing file mappings, keeping hardcoded/dynamic/global')
                    convertedMappings = convertedMappings.map(mapping => {
                      if (mapping.sourceType === 'existing_attribute' && mapping.sourceLocation === 'webhook') {
                        // Clear webhook file mappings - set to unmapped
                        return {
                          ...mapping,
                          sourceType: 'unmapped',
                          sourceLocation: undefined,
                          sourceField: undefined
                        }
                      }
                      // Keep hardcoded, dynamic, global, and previous step mappings
                      return mapping
                    })
                  }

                  const webServiceName = normalizeWebService(stitch?.workday_service)
                  console.log('📋 Final mappings:', convertedMappings)
                  console.log('🎯 Choice selections from stitch:', stitch?.choice_selections)

                  // Debug: Log each mapping to see what was converted
                  convertedMappings.forEach((m, idx) => {
                    console.log(`🔍 Mapping ${idx}:`, {
                      targetField: m.targetField,
                      sourceType: m.sourceType,
                      sourceField: m.sourceField,
                      sourceFieldType: m.sourceFieldType,
                      hardcodedValue: m.hardcodedValue,
                      hardcodedType: m.hardcodedType,
                      xmlPath: m.xmlPath
                    })
                  })

                  setLocalStep({
                    ...localStep,
                    existingStitchId: value,
                    webService: webServiceName,
                    name: stitch?.name ? `Use: ${stitch.name}` : localStep.name,
                    stepType: 'existing',
                    mappings: convertedMappings,
                    choiceSelections: stitch?.choice_selections || {},
                    choiceFieldValues: stitch?.choice_field_values || {}
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
                    disabled={isTestingStep}
                    data-testid="test-step-button"
                  >
                    {isTestingStep ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <FlaskConical className="w-4 h-4" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Results Display */}
        {testResult && (
          <Card ref={testResultsRef} className={`p-4 ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <h4 className={`font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.success ? 'Test Successful' : 'Test Failed'}
                </h4>
              </div>

              {testResult.success ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-700">{testResult.message}</p>

                  {/* Extracted Variables */}
                  {testResult.extractedVariables && Object.keys(testResult.extractedVariables).length > 0 && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-xs font-semibold text-blue-800 mb-2">Extracted Variables (available for use in next steps):</p>
                      <div className="space-y-2">
                        {Object.entries(testResult.extractedVariables).map(([refType, ids]) => (
                          <div key={refType} className="text-xs">
                            <span className="font-medium text-blue-900 break-words">{refType}:</span>
                            <div className="ml-4 mt-1 space-y-1">
                              {Object.entries(ids).map(([idType, value]) => (
                                <div key={idType} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <span className="text-blue-700 flex-shrink-0">{idType}:</span>
                                  <code className="bg-white px-2 py-0.5 rounded border border-blue-300 text-blue-900 font-mono text-[10px] break-all">
                                    {value}
                                  </code>
                                  <span className="text-gray-500 text-[10px] break-all">
                                    Use: {`{{${refType}.${idType}}}`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SOAP Response */}
                  <details>
                    <summary className="text-xs text-green-700 cursor-pointer hover:text-green-800 font-medium">
                      View Full Response
                    </summary>
                    <div className="bg-white p-3 rounded border border-green-200 max-h-64 overflow-y-auto mt-2">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                        {typeof testResult.response === 'string'
                          ? testResult.response
                          : JSON.stringify(testResult.response, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-red-700 font-medium">Error:</p>
                  <div className="bg-white p-3 rounded border border-red-200">
                    <p className="text-sm text-red-800">{testResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
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
              onMappingChange={(mappings, choiceSelections, choiceFieldValues) => {
                // Update all three pieces of data when any change occurs
                const updates = {
                  mappings: mappings
                }

                // Only include choiceSelections if provided
                if (choiceSelections !== undefined) {
                  updates.choiceSelections = choiceSelections
                }

                // Only include choiceFieldValues if provided
                if (choiceFieldValues !== undefined) {
                  updates.choiceFieldValues = choiceFieldValues
                }

                // Update multiple fields at once
                setLocalStep(prev => ({
                  ...prev,
                  ...updates
                }))
              }}
              webhookConfig={webhookConfig}
            />

            {/* Test Step Button - for new web services */}
            {stepType === 'new' && (
              <Button
                variant="outline"
                className="w-full gap-2 border-accent-teal text-accent-teal hover:bg-accent-teal hover:text-white"
                onClick={handleTestStep}
                disabled={!localStep.webService || isTestingStep}
                data-testid="test-step-button"
              >
                {isTestingStep ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-4 h-4" />
                    Test This Step
                  </>
                )}
              </Button>
            )}
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
