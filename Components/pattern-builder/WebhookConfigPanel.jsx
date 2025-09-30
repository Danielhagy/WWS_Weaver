import React, { useState, useRef } from 'react'
import { X, Webhook, FileUp, Code, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import * as XLSX from 'xlsx'

export default function WebhookConfigPanel({ webhookConfig, isOpen, onClose, onUpdate }) {
  const [localConfig, setLocalConfig] = useState(webhookConfig || { type: null, data: null })
  const [uploadStatus, setUploadStatus] = useState(null)
  const fileInputRef = useRef(null)

  const handleTypeSelect = (type) => {
    setLocalConfig({ ...localConfig, type, data: null, fileName: null, columns: [] })
    setUploadStatus(null)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadStatus('processing')

    try {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

          // Extract column headers from first row
          const headers = jsonData[0] || []
          const columns = headers.map(h => String(h).toLowerCase().replace(/\s+/g, '_'))

          // Get sample data (first 5 rows)
          const sampleData = jsonData.slice(0, 6)

          setLocalConfig({
            ...localConfig,
            type: 'file',
            fileName: file.name,
            columns: columns,
            sampleData: sampleData,
            fileSize: file.size,
            rawData: jsonData
          })

          setUploadStatus('success')
        } catch (error) {
          console.error('Error parsing file:', error)
          setUploadStatus('error')
        }
      }

      reader.onerror = () => {
        setUploadStatus('error')
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('Error reading file:', error)
      setUploadStatus('error')
    }
  }

  const handleJsonInput = (jsonText) => {
    try {
      const parsed = JSON.parse(jsonText)
      const attributes = Object.keys(parsed)

      setLocalConfig({
        ...localConfig,
        type: 'json',
        jsonSchema: jsonText,
        attributes: attributes,
        sampleData: parsed
      })

      setUploadStatus('success')
    } catch (error) {
      setUploadStatus('error')
      setLocalConfig({
        ...localConfig,
        jsonSchema: jsonText,
        attributes: []
      })
    }
  }

  const handleSave = () => {
    onUpdate(localConfig)
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <Card className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-soft-gray bg-gradient-to-r from-primary-dark-blue to-primary-dark-blue/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Webhook className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Configure Webhook Trigger</h2>
                <p className="text-white/70 text-sm mt-1">
                  Choose how your webhook will receive data
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Webhook Input Type</Label>
            <div className="grid grid-cols-2 gap-4">
              {/* File Upload Option */}
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  localConfig.type === 'file'
                    ? 'border-2 border-accent-teal bg-accent-teal/5'
                    : 'border-2 border-soft-gray hover:border-accent-teal/50'
                }`}
                onClick={() => handleTypeSelect('file')}
                data-testid="webhook-type-file"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    localConfig.type === 'file' ? 'bg-accent-teal' : 'bg-soft-gray'
                  }`}>
                    <FileUp className={`w-5 h-5 ${
                      localConfig.type === 'file' ? 'text-white' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-dark-blue flex items-center gap-2">
                      File Upload
                      {localConfig.type === 'file' && localConfig.columns?.length > 0 && (
                        <CheckCircle2 className="w-4 h-4 text-accent-teal" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload CSV/Excel file with headers
                    </p>
                  </div>
                </div>
              </Card>

              {/* JSON Body Option */}
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  localConfig.type === 'json'
                    ? 'border-2 border-accent-teal bg-accent-teal/5'
                    : 'border-2 border-soft-gray hover:border-accent-teal/50'
                }`}
                onClick={() => handleTypeSelect('json')}
                data-testid="webhook-type-json"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    localConfig.type === 'json' ? 'bg-accent-teal' : 'bg-soft-gray'
                  }`}>
                    <Code className={`w-5 h-5 ${
                      localConfig.type === 'json' ? 'text-white' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-dark-blue flex items-center gap-2">
                      JSON Body
                      {localConfig.type === 'json' && localConfig.attributes?.length > 0 && (
                        <CheckCircle2 className="w-4 h-4 text-accent-teal" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive data as POST body
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* File Upload Configuration */}
          {localConfig.type === 'file' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Test File</Label>
                <p className="text-sm text-muted-foreground">
                  Upload a sample CSV or Excel file to extract column headers
                </p>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    data-testid="file-upload-input"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                    data-testid="upload-file-button"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                  {localConfig.fileName && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-soft-gray/50 rounded-md">
                      <FileUp className="w-4 h-4 text-accent-teal" />
                      <span className="text-sm font-medium">{localConfig.fileName}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(localConfig.fileSize / 1024).toFixed(1)} KB
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Show extracted columns */}
              {localConfig.columns?.length > 0 && (
                <Card className="p-4 bg-gradient-to-br from-accent-teal/5 to-white border-accent-teal/30">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-teal" />
                    <h4 className="font-semibold text-primary-dark-blue">
                      Extracted Columns ({localConfig.columns.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {localConfig.columns.map((col, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-white border-accent-teal/30 text-accent-teal"
                        data-testid={`extracted-column-${col}`}
                      >
                        {col}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* JSON Configuration */}
          {localConfig.type === 'json' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sample JSON Body</Label>
                <p className="text-sm text-muted-foreground">
                  Paste a sample JSON object to extract attributes
                </p>
                <Textarea
                  placeholder='{\n  "employee_id": "12345",\n  "first_name": "John",\n  "last_name": "Doe",\n  "email": "john.doe@example.com"\n}'
                  className="font-mono text-sm min-h-[200px]"
                  value={localConfig.jsonSchema || ''}
                  onChange={(e) => handleJsonInput(e.target.value)}
                  data-testid="json-body-input"
                />
              </div>

              {/* Show extracted attributes */}
              {localConfig.attributes?.length > 0 && (
                <Card className="p-4 bg-gradient-to-br from-accent-teal/5 to-white border-accent-teal/30">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-teal" />
                    <h4 className="font-semibold text-primary-dark-blue">
                      Extracted Attributes ({localConfig.attributes.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {localConfig.attributes.map((attr, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-white border-accent-teal/30 text-accent-teal"
                        data-testid={`extracted-attribute-${attr}`}
                      >
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {uploadStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Invalid JSON format</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-soft-gray bg-soft-gray/20">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!localConfig.type || (localConfig.type === 'file' && !localConfig.columns?.length) || (localConfig.type === 'json' && !localConfig.attributes?.length)}
              className="gap-2"
              data-testid="save-webhook-config"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Configuration
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
