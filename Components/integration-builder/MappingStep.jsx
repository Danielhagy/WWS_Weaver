import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, FileSpreadsheet, FileJson, Upload, ChevronDown, ChevronRight, X, Info } from "lucide-react";
import { UploadFile } from "@/integrations/Core";
import { WORKDAY_SERVICES } from '@/config/workdayServices';
import { PUT_POSITION_FIELDS } from '@/config/putPositionFields';
import { CREATE_POSITION_FIELDS } from '@/config/createPositionFields';
import { END_CONTINGENT_WORKER_CONTRACT_FIELDS } from '@/config/endContingentWorkerContractFields';
import * as XLSX from 'xlsx';

import FileUploadZone from "./FileUploadZone.jsx";
import EnhancedFieldMapper from "./EnhancedFieldMapper.jsx";

// Field configuration registry
const FIELD_CONFIG_MAP = {
  'putPositionFields': PUT_POSITION_FIELDS,
  'createPositionFields': CREATE_POSITION_FIELDS,
  'endContingentWorkerContractFields': END_CONTINGENT_WORKER_CONTRACT_FIELDS
};

export default function MappingStep({ data, updateData, nextStep, prevStep }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [hasJson, setHasJson] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [parsedAttributes, setParsedAttributes] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [fieldDefinitions, setFieldDefinitions] = useState([]);

  // Load field configuration based on selected service
  useEffect(() => {
    const service = WORKDAY_SERVICES.find(s => s.value === data.workday_service);
    if (service?.fieldConfig) {
      const fields = FIELD_CONFIG_MAP[service.fieldConfig] || [];
      setFieldDefinitions(fields);
    } else {
      setFieldDefinitions([]);
    }
  }, [data.workday_service]);

  // Load existing file info if in edit mode
  useEffect(() => {
    if (data.sample_file_url && !uploadedFile) {
      // Use saved headers if available, otherwise extract from mappings
      let headers = [];

      if (data.sample_file_headers && Array.isArray(data.sample_file_headers)) {
        headers = data.sample_file_headers;
      } else {
        // Fallback: extract headers from existing field mappings
        const existingHeaders = new Set();
        data.field_mappings?.forEach(mapping => {
          if (mapping.source_type === 'file_column' && mapping.source_field) {
            existingHeaders.add(mapping.source_field);
          }
        });
        headers = Array.from(existingHeaders);
      }

      if (headers.length > 0) {
        setCsvHeaders(headers);
        // Create a file info object from existing data
        const fileName = data.sample_file_name || data.sample_file_url.split('/').pop() || 'uploaded-file';
        const fileType = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') ? 'excel' : 'csv';
        setUploadedFile({
          name: fileName,
          url: data.sample_file_url,
          type: fileType
        });
        setHasFile(true);
      }
    }

    // Load existing JSON if available
    if (data.source_json && !hasJson) {
      setJsonInput(data.source_json);
      if (data.parsed_attributes) {
        setParsedAttributes(data.parsed_attributes);
        setHasJson(true);
      }
    }
  }, [data.sample_file_url, data.sample_file_name, data.sample_file_headers, data.field_mappings, data.source_json, data.parsed_attributes]);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      const fileType = getFileType(file.name);
      console.log('File type detected:', fileType);

      let headers = [];
      let firstRowData = {};

      if (fileType === 'excel') {
        // Parse Excel file
        const excelData = await parseExcelFile(file);
        headers = excelData.headers;
        firstRowData = excelData.firstRow;
      } else {
        // Parse CSV file
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });
        const csvData = parseCSVData(text);
        headers = csvData.headers;
        firstRowData = csvData.firstRow;
      }

      console.log('Parsed headers:', headers);
      console.log('First row data:', firstRowData);
      setCsvHeaders(headers);

      // Then upload the file
      const { file_url } = await UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url, type: fileType });
      setHasFile(true);
      setShowFileUpload(false);

      // Keep existing JSON data if it exists
      updateData({
        sample_file_url: file_url,
        sample_file_name: file.name,
        sample_file_headers: headers,
        sample_row_data: firstRowData,
        has_both_sources: hasJson,
        // Preserve existing JSON data
        source_json: data.source_json,
        parsed_attributes: data.parsed_attributes,
        smart_mode: data.smart_mode
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Error processing file: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Detect file type from extension
  const getFileType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'xlsx' || ext === 'xls') return 'excel';
    if (ext === 'csv') return 'csv';
    return 'unknown';
  };

  // Parse Excel file - returns headers and first row data
  const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON to get headers and data
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length === 0) {
            console.warn('Excel file is empty');
            resolve({ headers: [], firstRow: {} });
            return;
          }

          // First row contains headers
          const headers = jsonData[0].map(h => String(h || '').trim()).filter(h => h.length > 0);

          // Second row contains first data row (if exists)
          let firstRow = {};
          if (jsonData.length > 1) {
            const dataRow = jsonData[1];
            headers.forEach((header, index) => {
              firstRow[header] = dataRow[index] !== undefined ? String(dataRow[index]) : '';
            });
          }

          console.log('Excel headers extracted:', headers);
          console.log(`Found ${jsonData.length} rows, ${headers.length} columns`);
          console.log('First row data:', firstRow);

          resolve({ headers, firstRow });
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(new Error(`Failed to parse Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // CSV parser to extract headers and first row data
  const parseCSVData = (text) => {
    console.log('Parsing CSV text, first 200 chars:', text.substring(0, 200));
    const lines = text.split('\n');
    if (lines.length === 0) {
      console.warn('No lines found in CSV');
      return { headers: [], firstRow: {} };
    }

    const firstLine = lines[0].trim();
    console.log('First line:', firstLine);

    // Handle both comma and semicolon delimiters
    const delimiter = firstLine.includes(';') ? ';' : ',';
    console.log('Using delimiter:', delimiter);

    // Parse line function - handles quoted fields
    const parseLine = (line) => {
      const fields = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          fields.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }

      // Add the last field
      if (current || line.endsWith(delimiter)) {
        fields.push(current.trim().replace(/^"|"$/g, ''));
      }

      return fields;
    };

    // Parse headers
    const headers = parseLine(firstLine);

    // Parse first data row if it exists
    let firstRow = {};
    if (lines.length > 1) {
      const secondLine = lines[1].trim();
      if (secondLine) {
        const dataFields = parseLine(secondLine);
        headers.forEach((header, index) => {
          if (header) {
            firstRow[header] = dataFields[index] || '';
          }
        });
      }
    }

    const filtered = headers.filter(h => h.length > 0);
    console.log('Extracted headers:', filtered);
    console.log('First row data:', firstRow);
    return { headers: filtered, firstRow };
  };

  // Parse JSON and extract attributes with smart name/ID pairing and examples
  const parseJSONAttributes = (jsonText) => {
    try {
      const jsonData = JSON.parse(jsonText);
      const attributes = [];
      const smartAttributes = []; // User-friendly grouped attributes

      // Recursive function to flatten nested JSON and categorize attributes
      const extractAttributes = (obj, path = '', parentObj = null, category = 'Root') => {
        if (obj === null || obj === undefined) return;

        if (typeof obj === 'object' && !Array.isArray(obj)) {
          Object.keys(obj).forEach(key => {
            const fullPath = path ? `${path}.${key}` : key;
            const value = obj[key];

            // Determine data type
            let dataType = typeof value;
            if (value === null) dataType = 'null';
            else if (Array.isArray(value)) dataType = 'array';
            else if (value instanceof Date) dataType = 'date';

            // Categorize based on key name patterns
            let attrCategory = category;
            if (key.toLowerCase().includes('name') || key.toLowerCase().includes('first') || key.toLowerCase().includes('last')) {
              attrCategory = 'Identity';
            } else if (key.toLowerCase().includes('email') || key.toLowerCase().includes('phone') || key.toLowerCase().includes('contact')) {
              attrCategory = 'Contact Information';
            } else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.toLowerCase().includes('start') || key.toLowerCase().includes('end')) {
              attrCategory = 'Dates & Time';
            } else if (key.toLowerCase().includes('department') || key.toLowerCase().includes('location') || key.toLowerCase().includes('organization') || key.toLowerCase().includes('subsidiary')) {
              attrCategory = 'Organization';
            } else if (key.toLowerCase().includes('id') || key.toLowerCase().includes('guid') || key.toLowerCase().includes('reference')) {
              attrCategory = 'Identifiers';
            } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price') || key.toLowerCase().includes('currency') || key.toLowerCase().includes('total')) {
              attrCategory = 'Financial';
            }

            // Get sample value
            let sampleValue = '';
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              sampleValue = '{object}';
            } else if (Array.isArray(value)) {
              sampleValue = `[${value.length} items]`;
            } else {
              sampleValue = String(value);
            }

            // Add base attribute
            attributes.push({
              path: fullPath,
              name: key,
              value: sampleValue,
              rawValue: value,
              dataType,
              category: attrCategory,
              nested: path.split('.').length,
              parentPath: path
            });

            // Recursively process nested objects
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              extractAttributes(value, fullPath, obj, attrCategory);
            }

            // Process array elements (first item only for structure)
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
              extractAttributes(value[0], `${fullPath}[0]`, obj, attrCategory);
            }
          });
        }
      };

      extractAttributes(jsonData);

      // Second pass: Create smart, user-friendly attribute groups
      // Look for patterns like objects with both 'name' and 'id' fields
      const createSmartAttributes = () => {
        const smartGroups = {};

        attributes.forEach(attr => {
          // Check if this is an object with useful fields
          if (attr.dataType === 'object' && attr.rawValue) {
            const obj = attr.rawValue;
            const hasId = obj.id !== undefined;
            const hasName = obj.name !== undefined || obj.display_name !== undefined;
            const hasEmail = obj.email !== undefined;
            const hasType = obj.type !== undefined;

            if (hasId || hasName || hasEmail) {
              // Create a smart group for this object
              const displayName = obj.display_name || obj.name || obj.email || attr.name;
              const friendlyName = attr.name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();

              smartGroups[attr.path] = {
                path: attr.path,
                friendlyName: friendlyName.charAt(0).toUpperCase() + friendlyName.slice(1),
                category: attr.category,
                options: [],
                example: displayName,
                type: obj.type || attr.dataType
              };

              // Add ID option
              if (hasId) {
                smartGroups[attr.path].options.push({
                  label: `${friendlyName} ID`,
                  path: `${attr.path}.id`,
                  value: obj.id,
                  type: 'id',
                  description: `The unique identifier for this ${friendlyName.toLowerCase()}`
                });
              }

              // Add Name option
              if (obj.name) {
                smartGroups[attr.path].options.push({
                  label: `${friendlyName} Name`,
                  path: `${attr.path}.name`,
                  value: obj.name,
                  type: 'name',
                  description: `The name of this ${friendlyName.toLowerCase()}`
                });
              }

              // Add Display Name option
              if (obj.display_name) {
                smartGroups[attr.path].options.push({
                  label: `${friendlyName} Display Name`,
                  path: `${attr.path}.display_name`,
                  value: obj.display_name,
                  type: 'display_name',
                  description: `The display name for this ${friendlyName.toLowerCase()}`
                });
              }

              // Add Email option
              if (hasEmail) {
                smartGroups[attr.path].options.push({
                  label: `${friendlyName} Email`,
                  path: `${attr.path}.email`,
                  value: obj.email,
                  type: 'email',
                  description: `The email address for this ${friendlyName.toLowerCase()}`
                });
              }

              // Add other useful fields
              ['first_name', 'last_name', 'phone', 'employee_number', 'key'].forEach(field => {
                if (obj[field] !== undefined) {
                  const label = field.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                  smartGroups[attr.path].options.push({
                    label: `${friendlyName} ${label.charAt(0).toUpperCase() + label.slice(1)}`,
                    path: `${attr.path}.${field}`,
                    value: obj[field],
                    type: field,
                    description: `The ${label} of this ${friendlyName.toLowerCase()}`
                  });
                }
              });
            }
          }
        });

        return Object.values(smartGroups);
      };

      const smartGroups = createSmartAttributes();

      return { attributes, smartAttributes: smartGroups };
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Invalid JSON format. Please check your input.');
    }
  };

  const handleJSONParse = () => {
    try {
      const { attributes, smartAttributes } = parseJSONAttributes(jsonInput);
      setParsedAttributes(smartAttributes.length > 0 ? smartAttributes : attributes);
      setHasJson(true);
      setShowJsonInput(false);
      // Initialize all categories as collapsed
      setExpandedCategories({});

      // Keep existing file data if it exists
      updateData({
        source_json: jsonInput,
        parsed_attributes: smartAttributes.length > 0 ? smartAttributes : attributes,
        raw_attributes: attributes,
        smart_mode: smartAttributes.length > 0,
        has_both_sources: hasFile,
        // Preserve existing file data
        sample_file_url: data.sample_file_url,
        sample_file_name: data.sample_file_name,
        sample_file_headers: data.sample_file_headers,
        sample_row_data: data.sample_row_data
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleNext = () => {
    // Check if all required fields are mapped
    const requiredFieldsMapped = data.field_mappings?.every(m => {
      const field = fieldDefinitions.find(f => f.name === m.target_field);
      return !field?.required || (m.source_type && m.source_type !== 'unmapped');
    });

    if (data.field_mappings && data.field_mappings.length > 0 && requiredFieldsMapped) {
      nextStep();
    }
  };

  const canProceed = () => {
    // Must have at least a file OR JSON data
    if (!hasFile && !hasJson) return false;

    if (!data.field_mappings || data.field_mappings.length === 0) return false;

    // Check all required fields are mapped
    const requiredFields = fieldDefinitions.filter(f => f.required);
    const mappedRequiredFields = requiredFields.filter(f =>
      data.field_mappings.some(m => m.target_field === f.name && m.source_type !== 'unmapped')
    );

    return mappedRequiredFields.length === requiredFields.length;
  };

  // Combine CSV headers and JSON attributes for the field mapper
  const getAllAvailableSources = () => {
    const sources = [];

    // Add file columns (row-specific data)
    if (hasFile && csvHeaders.length > 0) {
      csvHeaders.forEach(header => {
        sources.push({
          value: header,
          displayName: header,
          type: 'file_column',
          scope: 'row',
          description: `Column from uploaded file (varies per row)`
        });
      });
    }

    // Add JSON attributes (global data)
    if (hasJson && parsedAttributes.length > 0) {
      if (data.smart_mode) {
        // Smart mode: flatten all options
        parsedAttributes.forEach(attr => {
          attr.options?.forEach(option => {
            sources.push({
              value: option.path,
              displayName: option.label,
              sampleValue: option.value,
              description: option.description,
              type: 'json_global',
              scope: 'global',
              category: attr.category
            });
          });
        });
      } else {
        // Basic mode: use raw attributes
        parsedAttributes.forEach(attr => {
          sources.push({
            value: attr.path,
            displayName: attr.path,
            type: 'json_global',
            scope: 'global'
          });
        });
      }
    }

    return sources;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Source & Mapping</h2>
        <p className="text-gray-600">Add data sources and map fields to Workday</p>
      </div>

      {/* Data Sources Summary */}
      {(hasFile || hasJson) && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 border-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary-dark-blue">Data Sources Configured</h3>
              <div className="flex gap-2">
                {!hasFile && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFileUpload(true)}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Add File
                  </Button>
                )}
                {!hasJson && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowJsonInput(true)}
                    className="gap-2"
                  >
                    <FileJson className="w-4 h-4" />
                    Add JSON
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* File Data Card */}
              {hasFile && uploadedFile && (
                <Card className="p-3 bg-white border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-primary-dark-blue">File Data</h4>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Row-Specific</Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{csvHeaders.length} columns • Varies per row</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setUploadedFile(null);
                        setCsvHeaders([]);
                        setHasFile(false);
                        updateData({
                          sample_file_url: null,
                          sample_file_name: null,
                          sample_file_headers: null,
                          sample_row_data: null
                        });
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* JSON Data Card */}
              {hasJson && (
                <Card className="p-3 bg-white border-2 border-teal-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <FileJson className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-primary-dark-blue">JSON Data</h4>
                        <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-xs">Global</Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {parsedAttributes.length} source{parsedAttributes.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Same for all rows</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setParsedAttributes([]);
                        setJsonInput('');
                        setHasJson(false);
                        updateData({
                          source_json: null,
                          parsed_attributes: null,
                          raw_attributes: null,
                          smart_mode: false
                        });
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Empty state - show add buttons */}
              {!hasFile && (
                <Card
                  className="p-4 border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-colors"
                  onClick={() => setShowFileUpload(true)}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">Add File Data</p>
                    <p className="text-xs text-gray-500">Row-specific values</p>
                  </div>
                </Card>
              )}

              {!hasJson && (
                <Card
                  className="p-4 border-2 border-dashed border-gray-300 hover:border-teal-400 cursor-pointer transition-colors"
                  onClick={() => setShowJsonInput(true)}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <FileJson className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">Add JSON Data</p>
                    <p className="text-xs text-gray-500">Global variables</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Explanation */}
            {hasFile && hasJson && (
              <Alert className="bg-white border-accent-teal">
                <Info className="w-4 h-4 text-accent-teal" />
                <AlertDescription className="text-sm text-gray-700">
                  <strong>How it works:</strong> For each row in your file, a web service request will be created.
                  Row-specific data changes per row, while global JSON data remains constant across all requests.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}

      {/* Initial Source Selection (when nothing is added yet) */}
      {!hasFile && !hasJson && !showFileUpload && !showJsonInput && (
        <div>
          <Label className="text-base font-semibold mb-3 block">Add Data Source</Label>
          <p className="text-sm text-gray-600 mb-4">
            You can add a file, JSON data, or both. File data varies per row, while JSON acts as global variables.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Card
              className="p-6 cursor-pointer hover:border-blue-500 transition-all border-2"
              onClick={() => setShowFileUpload(true)}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-primary-dark-blue mb-1">Upload File</h3>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs mb-2">Row-Specific</Badge>
                  <p className="text-sm text-gray-600">
                    CSV or Excel file with row data
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:border-teal-500 transition-all border-2"
              onClick={() => setShowJsonInput(true)}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent-teal to-teal-600 flex items-center justify-center">
                  <FileJson className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-primary-dark-blue mb-1">Paste JSON</h3>
                  <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-xs mb-2">Global</Badge>
                  <p className="text-sm text-gray-600">
                    Constant data for all rows
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <Card className="p-6 border-2 border-blue-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-primary-dark-blue">Upload File Data</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFileUpload(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <FileUploadZone onFileUpload={handleFileUpload} isUploading={isUploading} />
        </Card>
      )}

      {/* JSON Input Modal */}
      {showJsonInput && (
        <Card className="p-6 border-2 border-teal-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-primary-dark-blue">Add JSON Global Data</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJsonInput(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Label htmlFor="json-input" className="text-base font-semibold mb-2 block">
            Paste Your Sample JSON Data
          </Label>
          <p className="text-sm text-gray-600 mb-4">
            Paste a sample JSON response from your source system. Our intelligent parser will extract and categorize all attributes.
          </p>
          <Textarea
            id="json-input"
            placeholder='{"request": {"attributes": [...], "name": "...", ...}}'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="h-64 font-mono text-sm mb-4"
          />
          <Button
            onClick={handleJSONParse}
            disabled={!jsonInput.trim()}
            className="w-full bg-accent-teal hover:bg-teal-600"
          >
            <FileJson className="w-4 h-4 mr-2" />
            Parse JSON Attributes
          </Button>
        </Card>
      )}

      {/* Field Mapper - Shows when at least one source is configured */}
      {(hasFile || hasJson) && !showFileUpload && !showJsonInput && (
        <EnhancedFieldMapper
          csvHeaders={getAllAvailableSources().map(s => s.value)}
          mappings={data.field_mappings || []}
          onMappingsChange={(mappings) => updateData({ field_mappings: mappings })}
          isJsonMode={hasJson}
          parsedAttributes={parsedAttributes}
          smartMode={data.smart_mode}
          allSources={getAllAvailableSources()}
          fieldDefinitions={fieldDefinitions}
        />
      )}

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Next: Transformations
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}