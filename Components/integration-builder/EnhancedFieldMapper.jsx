import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  FileText,
  Hash,
  Zap,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  X
} from "lucide-react";
import { PUT_POSITION_FIELDS, getFieldsByCategory, DYNAMIC_FUNCTIONS, MAPPING_SOURCE_TYPES } from '@/config/putPositionFields';

export default function EnhancedFieldMapper({ csvHeaders, mappings, onMappingsChange }) {
  const [expandedCategories, setExpandedCategories] = useState({ 
    "Basic Information": true, 
    "Position Details": true,
    "Request Information": false,
    "Process Options": false
  });
  
  const fieldsByCategory = getFieldsByCategory();

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getMappingForField = (fieldName) => {
    return mappings.find(m => m.target_field === fieldName) || {
      target_field: fieldName,
      source_type: MAPPING_SOURCE_TYPES.UNMAPPED,
      source_value: null,
      transformation: "none"
    };
  };

  const updateMapping = (fieldName, updates) => {
    const newMappings = [...mappings];
    const existingIndex = newMappings.findIndex(m => m.target_field === fieldName);
    
    const mapping = {
      target_field: fieldName,
      ...getMappingForField(fieldName),
      ...updates
    };

    if (existingIndex >= 0) {
      if (mapping.source_type === MAPPING_SOURCE_TYPES.UNMAPPED) {
        newMappings.splice(existingIndex, 1);
      } else {
        newMappings[existingIndex] = mapping;
      }
    } else if (mapping.source_type !== MAPPING_SOURCE_TYPES.UNMAPPED) {
      newMappings.push(mapping);
    }
    
    onMappingsChange(newMappings);
  };

  const requiredFields = PUT_POSITION_FIELDS.filter(f => f.required);
  const mappedRequiredFields = requiredFields.filter(f => 
    mappings.some(m => m.target_field === f.name && m.source_type !== MAPPING_SOURCE_TYPES.UNMAPPED)
  );
  const allRequiredMapped = mappedRequiredFields.length === requiredFields.length;

  const totalMapped = mappings.filter(m => m.source_type !== MAPPING_SOURCE_TYPES.UNMAPPED).length;

  return (
    <div className="space-y-6">
      {/* Summary Alert */}
      {!allRequiredMapped && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>Required fields pending:</strong> Please map {requiredFields.length - mappedRequiredFields.length} required field(s) to continue.
            <span className="block text-sm mt-1">
              ({mappedRequiredFields.length}/{requiredFields.length} required fields mapped)
            </span>
          </AlertDescription>
        </Alert>
      )}

      {allRequiredMapped && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>All required fields mapped!</strong> You can proceed to the next step or continue mapping optional fields.
          </AlertDescription>
        </Alert>
      )}

      {/* Mapping Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Mapping Progress: {totalMapped} / {PUT_POSITION_FIELDS.length} fields
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Required: {mappedRequiredFields.length}/{requiredFields.length} • 
              Optional: {totalMapped - mappedRequiredFields.length}/{PUT_POSITION_FIELDS.length - requiredFields.length}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-white">
              <FileText className="w-3 h-3 mr-1" />
              {csvHeaders?.length || 0} CSV columns
            </Badge>
          </div>
        </div>
      </div>

      {/* Field Mapping by Category */}
      {Object.entries(fieldsByCategory).map(([category, fields]) => (
        <div key={category} className="border border-gray-200 rounded-lg bg-white">
          <button
            onClick={() => toggleCategory(category)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedCategories[category] ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
              <Badge variant="outline" className="text-xs">
                {fields.length} fields
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {fields.filter(f => mappings.some(m => m.target_field === f.name && m.source_type !== MAPPING_SOURCE_TYPES.UNMAPPED)).length} mapped
            </div>
          </button>

          {expandedCategories[category] && (
            <div className="p-6 space-y-4">
              {fields.map((field) => (
                <FieldMappingRow
                  key={field.name}
                  field={field}
                  csvHeaders={csvHeaders}
                  mapping={getMappingForField(field.name)}
                  onUpdate={(updates) => updateMapping(field.name, updates)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Individual Field Mapping Row Component
function FieldMappingRow({ field, csvHeaders, mapping, onUpdate }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
      {/* Field Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Label className="text-base font-semibold text-gray-900">{field.name}</Label>
            {field.required ? (
              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Required</Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Optional</Badge>
            )}
            {field.type && (
              <Badge variant="outline" className="text-xs capitalize">{field.type}</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">{field.description}</p>
          {field.helpText && (
            <div className="flex items-start gap-1 mt-1">
              <Info className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500">{field.helpText}</p>
            </div>
          )}
        </div>
        {mapping.source_type !== MAPPING_SOURCE_TYPES.UNMAPPED && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ source_type: MAPPING_SOURCE_TYPES.UNMAPPED, source_value: null })}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Mapping Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button
          type="button"
          variant={mapping.source_type === MAPPING_SOURCE_TYPES.FILE_COLUMN ? "default" : "outline"}
          className={`justify-start ${mapping.source_type === MAPPING_SOURCE_TYPES.FILE_COLUMN ? "bg-blue-600 text-white" : ""}`}
          onClick={() => onUpdate({ source_type: MAPPING_SOURCE_TYPES.FILE_COLUMN, source_value: null })}
        >
          <FileText className="w-4 h-4 mr-2" />
          Map from File
        </Button>
        <Button
          type="button"
          variant={mapping.source_type === MAPPING_SOURCE_TYPES.HARDCODED ? "default" : "outline"}
          className={`justify-start ${mapping.source_type === MAPPING_SOURCE_TYPES.HARDCODED ? "bg-blue-600 text-white" : ""}`}
          onClick={() => onUpdate({ source_type: MAPPING_SOURCE_TYPES.HARDCODED, source_value: "" })}
        >
          <Hash className="w-4 h-4 mr-2" />
          Hardcode Value
        </Button>
        <Button
          type="button"
          variant={mapping.source_type === MAPPING_SOURCE_TYPES.DYNAMIC_FUNCTION ? "default" : "outline"}
          className={`justify-start ${mapping.source_type === MAPPING_SOURCE_TYPES.DYNAMIC_FUNCTION ? "bg-blue-600 text-white" : ""}`}
          onClick={() => onUpdate({ source_type: MAPPING_SOURCE_TYPES.DYNAMIC_FUNCTION, source_value: null })}
        >
          <Zap className="w-4 h-4 mr-2" />
          Dynamic Function
        </Button>
      </div>

      {/* Value Input based on Source Type */}
      {mapping.source_type === MAPPING_SOURCE_TYPES.FILE_COLUMN && (
        <div>
          <Label className="text-sm">Select CSV Column</Label>
          {field.type === 'text_with_type' ? (
            <div className="space-y-2 mt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">Source Column</Label>
                  <Select
                    value={mapping.source_value || ""}
                    onValueChange={(value) => onUpdate({ source_value: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose column" />
                    </SelectTrigger>
                    <SelectContent>
                      {csvHeaders && csvHeaders.length > 0 ? (
                        csvHeaders.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="_none_" disabled>No columns available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Type</Label>
                  <Select
                    value={mapping.type_value || field.defaultType}
                    onValueChange={(value) => onUpdate({ ...mapping, type_value: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.typeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Type will be used for all records
              </p>
            </div>
          ) : (
            <Select
              value={mapping.source_value || ""}
              onValueChange={(value) => onUpdate({ source_value: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a column from your file" />
              </SelectTrigger>
              <SelectContent>
                {csvHeaders && csvHeaders.length > 0 ? (
                  csvHeaders.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="_none_" disabled>No columns available</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {mapping.source_type === MAPPING_SOURCE_TYPES.HARDCODED && (
        <div>
          <Label className="text-sm">Enter Hardcoded Value</Label>
          {field.type === 'text_with_type' ? (
            <div className="space-y-2 mt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">ID Value</Label>
                  <Input
                    type="text"
                    value={mapping.source_value || ""}
                    onChange={(e) => onUpdate({ source_value: e.target.value })}
                    placeholder={`Enter ID...`}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Type</Label>
                  <Select
                    value={mapping.type_value || field.defaultType}
                    onValueChange={(value) => onUpdate({ ...mapping, type_value: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.typeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                ID and type will be used for all records
              </p>
            </div>
          ) : field.type === 'textarea' ? (
            <Textarea
              value={mapping.source_value || ""}
              onChange={(e) => onUpdate({ source_value: e.target.value })}
              placeholder={`Enter ${field.name.toLowerCase()}...`}
              className="mt-1"
              rows={3}
            />
          ) : field.type === 'boolean' ? (
            <Select
              value={mapping.source_value || "false"}
              onValueChange={(value) => onUpdate({ source_value: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          ) : field.type === 'date' ? (
            <Input
              type="date"
              value={mapping.source_value || ""}
              onChange={(e) => onUpdate({ source_value: e.target.value })}
              className="mt-1"
            />
          ) : field.options ? (
            <Select
              value={mapping.source_value || ""}
              onValueChange={(value) => onUpdate({ source_value: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a value" />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={field.type === 'number' ? 'number' : 'text'}
              value={mapping.source_value || ""}
              onChange={(e) => onUpdate({ source_value: e.target.value })}
              placeholder={`Enter ${field.name.toLowerCase()}...`}
              className="mt-1"
            />
          )}
          {field.type !== 'text_with_type' && (
            <p className="text-xs text-gray-500 mt-1">
              This value will be used for all records
            </p>
          )}
        </div>
      )}

      {mapping.source_type === MAPPING_SOURCE_TYPES.DYNAMIC_FUNCTION && (
        <div>
          <Label className="text-sm">Select Dynamic Function</Label>
          <Select
            value={mapping.source_value || ""}
            onValueChange={(value) => onUpdate({ source_value: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose a function" />
            </SelectTrigger>
            <SelectContent>
              {DYNAMIC_FUNCTIONS.map((func) => (
                <SelectItem key={func.id} value={func.id}>
                  {func.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mapping.source_value && (
            <div className="mt-2 p-2 bg-gray-50 rounded border">
              <p className="text-xs text-gray-600">
                <strong>Preview:</strong> <span className="font-mono font-semibold">
                  {DYNAMIC_FUNCTIONS.find(f => f.id === mapping.source_value)?.execute()}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {DYNAMIC_FUNCTIONS.find(f => f.id === mapping.source_value)?.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Clear Mapping Button */}
      {mapping.source_type !== MAPPING_SOURCE_TYPES.UNMAPPED && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onUpdate({ source_type: MAPPING_SOURCE_TYPES.UNMAPPED, source_value: null })}
          className="text-gray-600 hover:text-red-600"
        >
          Clear Mapping
        </Button>
      )}
    </div>
  );
}