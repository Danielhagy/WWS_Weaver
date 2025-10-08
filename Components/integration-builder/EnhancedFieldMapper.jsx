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
  X,
  Globe,
  Sparkles
} from "lucide-react";
import { DYNAMIC_FUNCTIONS } from '@/config/createPositionFields';
import { MAPPING_SOURCE_TYPES } from '@/config/createPositionFields';
import { autoMapFields } from '@/utils/fuzzyMatcher';
import ChoiceFieldSelector from '../field-mapping/ChoiceFieldSelector';

export default function EnhancedFieldMapper({
  csvHeaders,
  mappings,
  onMappingsChange,
  isJsonMode = false,
  parsedAttributes = [],
  smartMode = false,
  allSources = [],
  fieldDefinitions = [],
  choiceGroups = [],
  onChoiceDataChange,
  initialChoiceSelections = {},
  initialChoiceFieldValues = {}
}) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [autoMapStats, setAutoMapStats] = useState(null);
  const [isAutoMapping, setIsAutoMapping] = useState(false);
  const [choiceSelections, setChoiceSelections] = useState(initialChoiceSelections);
  const [choiceFieldValues, setChoiceFieldValues] = useState(initialChoiceFieldValues);
  const [choiceFieldErrors, setChoiceFieldErrors] = useState({});

  // Group fields by category
  const getFieldsByCategory = () => {
    const categories = {};
    fieldDefinitions.forEach(field => {
      const category = field.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(field);
    });
    return categories;
  };

  const fieldsByCategory = getFieldsByCategory();

  // Get file columns and global attributes from allSources
  const fileColumns = allSources.filter(s => s.scope === 'row');
  const globalAttributeObjects = allSources.filter(s => s.scope === 'global');
  const globalAttributes = globalAttributeObjects.map(ga => ga.value || ga);

  // Handle auto-mapping
  const handleAutoMap = () => {
    setIsAutoMapping(true);

    // Give UI a moment to update
    setTimeout(() => {
      const result = autoMapFields(fieldDefinitions, fileColumns, globalAttributes, mappings);
      onMappingsChange(result.mappings);
      setAutoMapStats(result.stats);
      setIsAutoMapping(false);

      // Clear stats after 5 seconds
      setTimeout(() => setAutoMapStats(null), 5000);
    }, 100);
  };

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

  // Handle choice group selection
  const handleChoiceSelect = (choiceGroupId, optionId) => {
    // For optional choice groups, allow deselection by clicking same option
    const choiceGroup = choiceGroups.find(cg => cg.id === choiceGroupId);
    const isOptional = choiceGroup && !choiceGroup.required;
    const currentSelection = choiceSelections[choiceGroupId];

    let newSelections;
    if (isOptional && currentSelection === optionId) {
      // Deselect by removing the selection
      newSelections = { ...choiceSelections };
      delete newSelections[choiceGroupId];
    } else {
      // Select the new option
      newSelections = {
        ...choiceSelections,
        [choiceGroupId]: optionId
      };
    }

    setChoiceSelections(newSelections);

    // Notify parent component
    if (onChoiceDataChange) {
      onChoiceDataChange({
        choiceSelections: newSelections,
        choiceFieldValues
      });
    }
  };

  const handleChoiceFieldChange = (xmlPath, value) => {
    const newValues = { ...choiceFieldValues };

    // If clearing the value, remove the key entirely
    if (value === '' || value === null || value === undefined) {
      delete newValues[xmlPath];
      // Also clear any associated type field
      if (xmlPath.endsWith('_type')) {
        delete newValues[xmlPath];
      } else {
        delete newValues[`${xmlPath}_type`];
      }
    } else {
      newValues[xmlPath] = value;
    }

    setChoiceFieldValues(newValues);

    // Notify parent component
    if (onChoiceDataChange) {
      onChoiceDataChange({
        choiceSelections,
        choiceFieldValues: newValues
      });
    }
  };

  const requiredFields = fieldDefinitions.filter(f => f.required);
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
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              Mapping Progress: {totalMapped} / {fieldDefinitions.length} fields
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Required: {mappedRequiredFields.length}/{requiredFields.length} •
              Optional: {totalMapped - mappedRequiredFields.length}/{fieldDefinitions.length - requiredFields.length}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="bg-white">
              <FileText className="w-3 h-3 mr-1" />
              {fileColumns.length} file columns
            </Badge>
            {globalAttributes.length > 0 && (
              <Badge variant="outline" className="bg-white">
                <Globe className="w-3 h-3 mr-1" />
                {globalAttributes.length} global attributes
              </Badge>
            )}
            {(fileColumns.length > 0 || globalAttributes.length > 0) && (
              <Button
                type="button"
                size="sm"
                onClick={handleAutoMap}
                disabled={isAutoMapping}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isAutoMapping ? 'Auto-Mapping...' : 'Auto-Map Fields'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Map Stats */}
      {autoMapStats && (
        <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-gray-900">
            <strong>Auto-mapping complete!</strong>
            <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
              <div>
                <span className="text-green-600 font-semibold">{autoMapStats.highConfidence}</span>
                <span className="text-gray-600 ml-1">high confidence</span>
              </div>
              <div>
                <span className="text-yellow-600 font-semibold">{autoMapStats.mediumConfidence}</span>
                <span className="text-gray-600 ml-1">medium confidence</span>
              </div>
              <div>
                <span className="text-orange-600 font-semibold">{autoMapStats.lowConfidence}</span>
                <span className="text-gray-600 ml-1">low confidence</span>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">{autoMapStats.unmapped}</span>
                <span className="text-gray-500 ml-1">unmapped</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Review the suggested mappings below and adjust as needed.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Choice Groups Section */}
      {choiceGroups && choiceGroups.length > 0 && (
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Choice Groups</h3>
            <p className="text-sm text-gray-600">Select exactly one option from each group</p>
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
              webhookColumns={fileColumns.map(fc => fc.value || fc)}
              globalAttributes={globalAttributes}
              previousSteps={[]}
              dynamicFunctions={DYNAMIC_FUNCTIONS}
            />
          ))}
        </div>
      )}

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
                  onUpdate={(updates) => updateMapping(field.name, { ...updates, xmlPath: field.xmlPath })}
                  isJsonMode={isJsonMode}
                  parsedAttributes={parsedAttributes}
                  smartMode={smartMode}
                  allSources={allSources}
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
function FieldMappingRow({ field, csvHeaders, mapping, onUpdate, isJsonMode = false, parsedAttributes = [], smartMode = false, allSources = [] }) {
  const [sourceTab, setSourceTab] = useState('file'); // 'file' or 'global'

  // Get file columns and global attributes separately
  const fileColumns = allSources.filter(s => s.scope === 'row');
  const globalAttributes = allSources.filter(s => s.scope === 'global');
  const hasFileData = fileColumns.length > 0;
  const hasGlobalData = globalAttributes.length > 0;

  // Helper to get friendly display info for an attribute path
  const getAttributeDisplayInfo = (path) => {
    // First check allSources if available (combines file + JSON with scope info)
    if (allSources && allSources.length > 0) {
      const source = allSources.find(s => s.value === path);
      if (source) {
        return {
          displayName: source.displayName,
          sampleValue: source.sampleValue,
          description: source.description,
          scope: source.scope, // 'global' or 'row'
          category: source.category
        };
      }
    }

    // Fallback to parsedAttributes for legacy JSON mode
    if (!smartMode || !parsedAttributes.length) {
      // Fallback: just show the path
      return {
        displayName: path,
        sampleValue: null,
        description: null,
        scope: null
      };
    }

    // Find the attribute in smart attributes
    for (const smartAttr of parsedAttributes) {
      const option = smartAttr.options?.find(opt => opt.path === path);
      if (option) {
        return {
          displayName: option.label,
          sampleValue: option.value,
          description: option.description,
          category: smartAttr.category,
          scope: null
        };
      }
    }

    // Fallback: make it friendlier
    const parts = path.split('.');
    const lastPart = parts[parts.length - 1];
    return {
      displayName: lastPart.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      sampleValue: null,
      description: null,
      scope: null
    };
  };

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
            {mapping.confidence && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  mapping.confidence >= 70
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : mapping.confidence >= 50
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                    : 'bg-orange-50 text-orange-700 border-orange-300'
                }`}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {mapping.confidence >= 70 ? 'High' : mapping.confidence >= 50 ? 'Medium' : 'Low'} Confidence
              </Badge>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
          variant={mapping.source_type === MAPPING_SOURCE_TYPES.GLOBAL_ATTRIBUTE ? "default" : "outline"}
          className={`justify-start ${mapping.source_type === MAPPING_SOURCE_TYPES.GLOBAL_ATTRIBUTE ? "bg-purple-600 text-white" : ""}`}
          onClick={() => onUpdate({ source_type: MAPPING_SOURCE_TYPES.GLOBAL_ATTRIBUTE, source_value: null })}
          disabled={!hasGlobalData}
        >
          <Globe className="w-4 h-4 mr-2" />
          Global Attributes
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
          <Label className="text-sm">Select File Column</Label>
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
                      {(hasFileData ? fileColumns : (csvHeaders || [])).length > 0 ? (
                        (hasFileData ? fileColumns : (csvHeaders || [])).map((source) => {
                          const header = typeof source === 'string' ? source : source.value;
                          const displayInfo = hasFileData ? getAttributeDisplayInfo(header) : null;
                          return (
                            <SelectItem key={header} value={header}>
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className="font-medium">{displayInfo?.displayName || header}</span>
                                {displayInfo?.sampleValue && (
                                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-200 font-mono">
                                    {String(displayInfo.sampleValue).substring(0, 20)}{String(displayInfo.sampleValue).length > 20 ? '...' : ''}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="_none_" disabled>No file columns available</SelectItem>
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
              {mapping.source_value && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600">
                      <strong>Selected:</strong> {getAttributeDisplayInfo(mapping.source_value).displayName}
                    </p>
                    {getAttributeDisplayInfo(mapping.source_value).scope && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          getAttributeDisplayInfo(mapping.source_value).scope === 'global'
                            ? 'bg-purple-50 text-purple-700 border-purple-300'
                            : 'bg-blue-50 text-blue-700 border-blue-300'
                        }`}
                      >
                        {getAttributeDisplayInfo(mapping.source_value).scope === 'global' ? 'Global' : 'Row'}
                      </Badge>
                    )}
                  </div>
                  {getAttributeDisplayInfo(mapping.source_value).description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getAttributeDisplayInfo(mapping.source_value).description}
                    </p>
                  )}
                  {getAttributeDisplayInfo(mapping.source_value).sampleValue && (
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>Sample:</strong> <code className="px-1 py-0.5 bg-green-50 text-green-700 rounded">
                        {getAttributeDisplayInfo(mapping.source_value).sampleValue}
                      </code>
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Type will be used for all records
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Select
                value={mapping.source_value || ""}
                onValueChange={(value) => onUpdate({ source_value: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a file column" />
                </SelectTrigger>
                <SelectContent>
                  {(hasFileData ? fileColumns : (csvHeaders || [])).length > 0 ? (
                    (hasFileData ? fileColumns : (csvHeaders || [])).map((source) => {
                      const header = typeof source === 'string' ? source : source.value;
                      const displayInfo = hasFileData ? getAttributeDisplayInfo(header) : null;
                      return (
                        <SelectItem key={header} value={header}>
                          <div className="flex flex-col gap-1 py-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{displayInfo?.displayName || header}</span>
                              {displayInfo?.sampleValue && (
                                <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-200 font-mono">
                                  {String(displayInfo.sampleValue).substring(0, 30)}{String(displayInfo.sampleValue).length > 30 ? '...' : ''}
                                </span>
                              )}
                            </div>
                            {displayInfo?.description && (
                              <span className="text-xs text-gray-500">{displayInfo.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="_none_" disabled>No file columns available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {mapping.source_value && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getAttributeDisplayInfo(mapping.source_value).displayName}
                    </p>
                    {getAttributeDisplayInfo(mapping.source_value).scope && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          getAttributeDisplayInfo(mapping.source_value).scope === 'global'
                            ? 'bg-purple-50 text-purple-700 border-purple-300'
                            : 'bg-blue-50 text-blue-700 border-blue-300'
                        }`}
                      >
                        {getAttributeDisplayInfo(mapping.source_value).scope === 'global' ? 'Global' : 'Row-Specific'}
                      </Badge>
                    )}
                  </div>
                  {getAttributeDisplayInfo(mapping.source_value).description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {getAttributeDisplayInfo(mapping.source_value).description}
                    </p>
                  )}
                  {getAttributeDisplayInfo(mapping.source_value).sampleValue && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">Sample value:</span>
                      <code className="px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200 text-xs font-mono">
                        {getAttributeDisplayInfo(mapping.source_value).sampleValue}
                      </code>
                    </div>
                  )}
                  {(isJsonMode && smartMode) && (
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      Path: {mapping.source_value}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Global Attributes Selector */}
      {mapping.source_type === MAPPING_SOURCE_TYPES.GLOBAL_ATTRIBUTE && (
        <div>
          <Label className="text-sm">Select Global Attribute</Label>
          {field.type === 'text_with_type' ? (
            <div className="space-y-2 mt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">Source Attribute</Label>
                  <Select
                    value={mapping.source_value || ""}
                    onValueChange={(value) => onUpdate({ source_value: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose global attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      {globalAttributes.length > 0 ? (
                        globalAttributes.map((source) => {
                          const displayInfo = getAttributeDisplayInfo(source.value);
                          return (
                            <SelectItem key={source.value} value={source.value}>
                              <div className="flex items-center justify-between w-full gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{displayInfo?.displayName || source.value}</span>
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-purple-50 text-purple-700 border-purple-300"
                                  >
                                    Global
                                  </Badge>
                                </div>
                                {displayInfo?.sampleValue && (
                                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-200 font-mono">
                                    {String(displayInfo.sampleValue).substring(0, 20)}{String(displayInfo.sampleValue).length > 20 ? '...' : ''}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="_none_" disabled>No global attributes available</SelectItem>
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
              {mapping.source_value && (
                <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600">
                      <strong>Selected:</strong> {getAttributeDisplayInfo(mapping.source_value).displayName}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-xs bg-purple-50 text-purple-700 border-purple-300"
                    >
                      Global
                    </Badge>
                  </div>
                  {getAttributeDisplayInfo(mapping.source_value).description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getAttributeDisplayInfo(mapping.source_value).description}
                    </p>
                  )}
                  {getAttributeDisplayInfo(mapping.source_value).sampleValue && (
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>Sample:</strong> <code className="px-1 py-0.5 bg-green-50 text-green-700 rounded">
                        {getAttributeDisplayInfo(mapping.source_value).sampleValue}
                      </code>
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Type will be used for all records
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Select
                value={mapping.source_value || ""}
                onValueChange={(value) => onUpdate({ source_value: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a global attribute" />
                </SelectTrigger>
                <SelectContent>
                  {globalAttributes.length > 0 ? (
                    globalAttributes.map((source) => {
                      const displayInfo = getAttributeDisplayInfo(source.value);
                      return (
                        <SelectItem key={source.value} value={source.value}>
                          <div className="flex flex-col gap-1 py-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{displayInfo?.displayName || source.value}</span>
                              <Badge
                                variant="outline"
                                className="text-xs bg-purple-50 text-purple-700 border-purple-300"
                              >
                                Global
                              </Badge>
                              {displayInfo?.sampleValue && (
                                <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-200 font-mono">
                                  {String(displayInfo.sampleValue).substring(0, 30)}{String(displayInfo.sampleValue).length > 30 ? '...' : ''}
                                </span>
                              )}
                            </div>
                            {displayInfo?.description && (
                              <span className="text-xs text-gray-500">{displayInfo.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="_none_" disabled>No global attributes available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {mapping.source_value && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getAttributeDisplayInfo(mapping.source_value).displayName}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-xs bg-purple-50 text-purple-700 border-purple-300"
                    >
                      Global
                    </Badge>
                  </div>
                  {getAttributeDisplayInfo(mapping.source_value).description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {getAttributeDisplayInfo(mapping.source_value).description}
                    </p>
                  )}
                  {getAttributeDisplayInfo(mapping.source_value).sampleValue && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">Sample value:</span>
                      <code className="px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200 text-xs font-mono">
                        {getAttributeDisplayInfo(mapping.source_value).sampleValue}
                      </code>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 font-mono">
                    Path: {mapping.source_value}
                  </p>
                </div>
              )}
            </div>
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