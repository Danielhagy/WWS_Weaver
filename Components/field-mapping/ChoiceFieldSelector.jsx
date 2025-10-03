import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Check, AlertCircle, FileUp, Hash, Sparkles, Globe, X } from 'lucide-react';

/**
 * ChoiceFieldSelector - Modern card-based UI for SOAP choice groups
 *
 * Allows users to select exactly ONE option from a choice group (e.g., Applicant vs Former Worker vs Create New)
 * Features:
 * - Card-based selection (not radio buttons)
 * - Icon-based visual indicators
 * - Expandable complex types (e.g., Create New Applicant)
 * - 4-source field mapping (File Attributes, Global JSON, Hardcoded, Dynamic Function)
 * - Grey-out inactive options
 * - Validation feedback
 * - Only collapses on explicit collapse button click
 */
export default function ChoiceFieldSelector({
  choiceGroup,
  selectedOptionId,
  onSelect,
  fieldValues = {},
  onFieldChange,
  errors = {},
  webhookColumns = [],
  previousSteps = [],
  dynamicFunctions = [],
  globalAttributes = []
}) {
  const [expandedOption, setExpandedOption] = useState(null);
  const [fieldMappingTypes, setFieldMappingTypes] = useState({});

  // Auto-expand when option is selected
  useEffect(() => {
    if (selectedOptionId) {
      const option = choiceGroup.options.find(opt => opt.id === selectedOptionId);
      if (option && option.isExpandable) {
        setExpandedOption(selectedOptionId);
      }
    }
  }, [selectedOptionId, choiceGroup.options]);

  const handleCardClick = (e, optionId) => {
    // Don't collapse on any clicks - only the explicit toggle button should collapse
    // Only handle selection if this option is not already selected
    if (selectedOptionId !== optionId) {
      onSelect(optionId);
      const option = choiceGroup.options.find(opt => opt.id === optionId);
      if (option && option.isExpandable) {
        setExpandedOption(optionId);
      }
    }
  };

  const handleToggleExpansion = (e, optionId) => {
    e.stopPropagation();
    setExpandedOption(expandedOption === optionId ? null : optionId);
  };

  const isOptionExpandable = (optionId) => {
    const option = choiceGroup.options.find(opt => opt.id === optionId);
    return option && option.isExpandable;
  };

  const isOptionActive = (optionId) => {
    return selectedOptionId === optionId;
  };

  const isOptionInactive = (optionId) => {
    return selectedOptionId && selectedOptionId !== optionId;
  };

  const getFieldMappingType = (xmlPath) => {
    return fieldMappingTypes[xmlPath] || 'hardcoded';
  };

  const setFieldMappingType = (xmlPath, type) => {
    setFieldMappingTypes(prev => ({
      ...prev,
      [xmlPath]: type
    }));
  };

  // Dynamic functions configuration
  const defaultDynamicFunctions = [
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
      id: "uuid",
      label: "Generate UUID",
      description: "Unique identifier",
      execute: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    }
  ];

  const availableFunctions = dynamicFunctions.length > 0 ? dynamicFunctions : defaultDynamicFunctions;

  return (
    <div className="space-y-4">
      {/* Choice Group Header */}
      <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {choiceGroup.name}
              {choiceGroup.required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{choiceGroup.helpText}</p>
          </div>
          {!selectedOptionId && (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          )}
          {selectedOptionId && (
            <Check className="w-5 h-5 text-green-600" />
          )}
        </div>
      </div>

      {/* Choice Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {choiceGroup.options.map((option) => {
          const isActive = isOptionActive(option.id);
          const isInactive = isOptionInactive(option.id);
          const isExpanded = expandedOption === option.id;
          const isExpandable = isOptionExpandable(option.id);

          return (
            <div
              key={option.id}
              className={`${isExpandable && isExpanded ? 'md:col-span-2' : 'col-span-1'} transition-all duration-300`}
            >
              <Card
                className={`
                  transition-all duration-200
                  ${isActive ? 'border-blue-500 border-2 bg-blue-50 shadow-md' : ''}
                  ${isInactive ? 'opacity-40 grayscale hover:opacity-60' : 'hover:border-gray-400 hover:shadow-sm'}
                  ${!selectedOptionId ? 'hover:border-blue-300 cursor-pointer' : ''}
                  ${isActive && !isExpandable ? 'cursor-default' : ''}
                `}
                onClick={(e) => handleCardClick(e, option.id)}
              >
                <div className="p-4">
                  {/* Option Header */}
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`
                      text-3xl flex-shrink-0 transition-transform
                      ${isActive ? 'scale-110' : ''}
                    `}>
                      {option.icon || '📋'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                          {option.name}
                        </h4>
                        {isActive && (
                          <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {option.isSimpleReference && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                            Simple Reference
                          </Badge>
                        )}
                        {option.isComplexType && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                            Create New
                          </Badge>
                        )}
                        {option.isExpandable && isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                            onClick={(e) => handleToggleExpansion(e, option.id)}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <ChevronRight className="w-3 h-3 mr-1" />
                                Expand ({option.fields?.length || 0} fields)
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Note */}
                      {option.note && isActive && (
                        <p className="text-xs text-gray-500 italic mt-2">
                          {option.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Simple Reference Field (always visible when active) */}
                  {isActive && !isExpanded && option.isSimpleReference && option.fields && option.fields.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      {option.fields.slice(0, 1).map((field, idx) => (
                        <FieldMapper
                          key={idx}
                          field={field}
                          fieldValues={fieldValues}
                          onFieldChange={onFieldChange}
                          errors={errors}
                          webhookColumns={webhookColumns}
                          globalAttributes={globalAttributes}
                          previousSteps={previousSteps}
                          dynamicFunctions={availableFunctions}
                          mappingType={getFieldMappingType(field.xmlPath)}
                          onMappingTypeChange={(type) => setFieldMappingType(field.xmlPath, type)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Expanded Fields for Complex Types */}
                  {isActive && isExpanded && option.fields && option.fields.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {option.fields.map((field, idx) => (
                          <div
                            key={idx}
                            className={field.type === 'textarea' ? 'md:col-span-2' : 'col-span-1'}
                          >
                            <FieldMapper
                              field={field}
                              fieldValues={fieldValues}
                              onFieldChange={onFieldChange}
                              errors={errors}
                              webhookColumns={webhookColumns}
                              globalAttributes={globalAttributes}
                              previousSteps={previousSteps}
                              dynamicFunctions={availableFunctions}
                              mappingType={getFieldMappingType(field.xmlPath)}
                              onMappingTypeChange={(type) => setFieldMappingType(field.xmlPath, type)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Validation Error */}
      {choiceGroup.required && !selectedOptionId && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Please select one option to continue</span>
        </div>
      )}
    </div>
  );
}

// Field Mapper Component - Handles individual field mapping with 4 source types
function FieldMapper({
  field,
  fieldValues,
  onFieldChange,
  errors,
  webhookColumns,
  globalAttributes,
  previousSteps,
  dynamicFunctions,
  mappingType,
  onMappingTypeChange
}) {
  // Determine how many tabs to show based on available data sources
  const hasFileData = webhookColumns && webhookColumns.length > 0;
  const hasGlobalData = globalAttributes && globalAttributes.length > 0;
  const hasPreviousSteps = previousSteps && previousSteps.length > 0;

  // Check if field has any value set
  const hasValue = fieldValues[field.xmlPath] && fieldValues[field.xmlPath].trim() !== '';

  // Clear function - removes all values for this field
  const handleClear = () => {
    onFieldChange(field.xmlPath, '');
    if (field.type === 'text_with_type') {
      onFieldChange(`${field.xmlPath}_type`, field.defaultType);
    }
  };

  return (
    <div className={`space-y-2 p-3 rounded-md border transition-colors ${hasValue ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
      {/* Field Label with Clear Button */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {field.name}
          {field.required && <span className="text-red-500">*</span>}
          {hasValue && (
            <Badge variant="outline" className={`text-xs ${field.required ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-green-100 text-green-700 border-green-300'}`}>
              <Check className="w-3 h-3 mr-1" />
              Set
            </Badge>
          )}
        </label>
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="h-6 px-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50"
            title="Clear this field"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Mapping Type Selector - 4 Tabs */}
      <div className="grid grid-cols-4 gap-1">
        <Button
          type="button"
          size="sm"
          variant={mappingType === 'file' ? "default" : "outline"}
          className={`justify-start text-xs h-7 px-2 ${mappingType === 'file' ? "bg-blue-600 text-white" : ""}`}
          onClick={(e) => { e.stopPropagation(); onMappingTypeChange('file'); }}
          disabled={!hasFileData}
          title={hasFileData ? "Map from file attributes" : "No file data available"}
        >
          <FileUp className="w-3 h-3 mr-1" />
          File
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mappingType === 'global' ? "default" : "outline"}
          className={`justify-start text-xs h-7 px-2 ${mappingType === 'global' ? "bg-purple-600 text-white" : ""}`}
          onClick={(e) => { e.stopPropagation(); onMappingTypeChange('global'); }}
          disabled={!hasGlobalData}
          title={hasGlobalData ? "Map from global JSON variables" : "No global data available"}
        >
          <Globe className="w-3 h-3 mr-1" />
          Global
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mappingType === 'hardcoded' ? "default" : "outline"}
          className={`justify-start text-xs h-7 px-2 ${mappingType === 'hardcoded' ? "bg-accent-teal text-white" : ""}`}
          onClick={(e) => { e.stopPropagation(); onMappingTypeChange('hardcoded'); }}
        >
          <Hash className="w-3 h-3 mr-1" />
          Static
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mappingType === 'dynamic' ? "default" : "outline"}
          className={`justify-start text-xs h-7 px-2 ${mappingType === 'dynamic' ? "bg-orange-600 text-white" : ""}`}
          onClick={(e) => { e.stopPropagation(); onMappingTypeChange('dynamic'); }}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Dynamic
        </Button>
      </div>

      {/* Field Input based on Mapping Type */}

      {/* FILE ATTRIBUTES */}
      {mappingType === 'file' && (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          {field.type === 'text_with_type' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Select
                  value={fieldValues[field.xmlPath] || ""}
                  onValueChange={(value) => onFieldChange(field.xmlPath, value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Choose file column..." />
                  </SelectTrigger>
                  <SelectContent>
                    {webhookColumns && webhookColumns.length > 0 ? (
                      webhookColumns.map((col) => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_none_" disabled>No file columns available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={fieldValues[`${field.xmlPath}_type`] || field.defaultType}
                  onValueChange={(value) => onFieldChange(`${field.xmlPath}_type`, value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.typeOptions && field.typeOptions.map((typeOpt) => (
                      <SelectItem key={typeOpt} value={typeOpt}>
                        {typeOpt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <Select
              value={fieldValues[field.xmlPath] || ""}
              onValueChange={(value) => onFieldChange(field.xmlPath, value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Choose file column..." />
              </SelectTrigger>
              <SelectContent>
                {webhookColumns && webhookColumns.length > 0 ? (
                  webhookColumns.map((col) => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="_none_" disabled>No file columns available</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-gray-500">
            <FileUp className="w-3 h-3 inline mr-1" />
            Row-specific data from uploaded file
          </p>
        </div>
      )}

      {/* GLOBAL JSON ATTRIBUTES */}
      {mappingType === 'global' && (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          {field.type === 'text_with_type' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Select
                  value={fieldValues[field.xmlPath] || ""}
                  onValueChange={(value) => onFieldChange(field.xmlPath, value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Choose global attribute..." />
                  </SelectTrigger>
                  <SelectContent>
                    {globalAttributes && globalAttributes.length > 0 ? (
                      globalAttributes.map((attr) => (
                        <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_none_" disabled>No global attributes available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={fieldValues[`${field.xmlPath}_type`] || field.defaultType}
                  onValueChange={(value) => onFieldChange(`${field.xmlPath}_type`, value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.typeOptions && field.typeOptions.map((typeOpt) => (
                      <SelectItem key={typeOpt} value={typeOpt}>
                        {typeOpt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <Select
              value={fieldValues[field.xmlPath] || ""}
              onValueChange={(value) => onFieldChange(field.xmlPath, value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Choose global attribute..." />
              </SelectTrigger>
              <SelectContent>
                {globalAttributes && globalAttributes.length > 0 ? (
                  globalAttributes.map((attr) => (
                    <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="_none_" disabled>No global attributes available</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-gray-500">
            <Globe className="w-3 h-3 inline mr-1" />
            Global variables from JSON (same for all rows)
          </p>
        </div>
      )}

      {/* HARDCODED VALUES */}
      {mappingType === 'hardcoded' && (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          {field.type === 'text_with_type' ? (
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                className={`h-8 text-sm ${errors[field.xmlPath] ? 'border-red-500' : ''}`}
                placeholder={field.helpText}
                value={fieldValues[field.xmlPath] || ''}
                onChange={(e) => onFieldChange(field.xmlPath, e.target.value)}
              />
              <Select
                value={fieldValues[`${field.xmlPath}_type`] || field.defaultType}
                onValueChange={(value) => onFieldChange(`${field.xmlPath}_type`, value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {field.typeOptions && field.typeOptions.map((typeOpt) => (
                    <SelectItem key={typeOpt} value={typeOpt}>
                      {typeOpt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Input
              type={field.type === 'date' ? 'date' : 'text'}
              className={`h-8 text-sm ${errors[field.xmlPath] ? 'border-red-500' : ''}`}
              placeholder={field.helpText}
              value={fieldValues[field.xmlPath] || ''}
              onChange={(e) => onFieldChange(field.xmlPath, e.target.value)}
            />
          )}
          <p className="text-xs text-gray-500">
            <Hash className="w-3 h-3 inline mr-1" />
            Static value (same for all records)
          </p>
        </div>
      )}

      {/* DYNAMIC FUNCTIONS */}
      {mappingType === 'dynamic' && (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <Select
            value={fieldValues[field.xmlPath] || ""}
            onValueChange={(value) => onFieldChange(field.xmlPath, value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Choose function..." />
            </SelectTrigger>
            <SelectContent>
              {dynamicFunctions && dynamicFunctions.length > 0 ? (
                dynamicFunctions.map((func) => (
                  <SelectItem key={func.id} value={func.id}>{func.label}</SelectItem>
                ))
              ) : (
                <SelectItem value="_none_" disabled>No functions available</SelectItem>
              )}
            </SelectContent>
          </Select>
          {field.type === 'text_with_type' && (
            <Select
              value={fieldValues[`${field.xmlPath}_type`] || field.defaultType}
              onValueChange={(value) => onFieldChange(`${field.xmlPath}_type`, value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.typeOptions && field.typeOptions.map((typeOpt) => (
                  <SelectItem key={typeOpt} value={typeOpt}>
                    {typeOpt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {fieldValues[field.xmlPath] && (
            <div className="p-2 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded text-xs">
              <p className="text-gray-600">
                <strong className="text-primary-dark-blue">Preview:</strong>{' '}
                <span className="font-mono font-semibold text-orange-600">
                  {dynamicFunctions.find(f => f.id === fieldValues[field.xmlPath])?.execute()}
                </span>
              </p>
            </div>
          )}
          <p className="text-xs text-gray-500">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Auto-generated value (computed per record)
          </p>
        </div>
      )}

      {/* Help Text */}
      {field.helpText && (
        <p className="text-xs text-muted-foreground italic">{field.helpText}</p>
      )}

      {/* Error Message */}
      {errors[field.xmlPath] && (
        <p className="text-xs text-red-600">{errors[field.xmlPath]}</p>
      )}
    </div>
  );
}
