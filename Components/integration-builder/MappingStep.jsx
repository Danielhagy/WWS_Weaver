import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, FileSpreadsheet } from "lucide-react";
import { UploadFile } from "@/integrations/Core";
import { PUT_POSITION_FIELDS } from "@/config/putPositionFields";
import * as XLSX from 'xlsx';

import FileUploadZone from "./FileUploadZone.jsx";
import EnhancedFieldMapper from "./EnhancedFieldMapper.jsx";

export default function MappingStep({ data, updateData, nextStep, prevStep }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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
      }
    }
  }, [data.sample_file_url, data.sample_file_name, data.sample_file_headers, data.field_mappings]);

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
      updateData({
        sample_file_url: file_url,
        sample_file_name: file.name,
        sample_file_headers: headers,
        sample_row_data: firstRowData
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

  const handleNext = () => {
    // Check if all required fields are mapped
    const requiredFieldsMapped = data.field_mappings?.every(m => {
      const field = PUT_POSITION_FIELDS.find(f => f.name === m.target_field);
      return !field?.required || (m.source_type && m.source_type !== 'unmapped');
    });

    if (data.field_mappings && data.field_mappings.length > 0 && requiredFieldsMapped) {
      nextStep();
    }
  };

  const canProceed = () => {
    if (!data.field_mappings || data.field_mappings.length === 0) return false;

    // Check all required fields are mapped
    const requiredFields = PUT_POSITION_FIELDS.filter(f => f.required);
    const mappedRequiredFields = requiredFields.filter(f =>
      data.field_mappings.some(m => m.target_field === f.name && m.source_type !== 'unmapped')
    );

    return mappedRequiredFields.length === requiredFields.length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Source & Mapping</h2>
        <p className="text-gray-600">Upload a sample file or directly map fields to Workday</p>
      </div>

      {!uploadedFile ? (
        <FileUploadZone onFileUpload={handleFileUpload} isUploading={isUploading} />
      ) : (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">{uploadedFile.name}</p>
              <p className="text-sm text-gray-600">
                {uploadedFile.type === 'excel' ? 'Excel file' : 'CSV file'} • {csvHeaders.length} columns detected
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUploadedFile(null);
                setCsvHeaders([]);
                updateData({ field_mappings: [] });
              }}
              className="ml-auto"
            >
              Change File
            </Button>
          </div>

          <EnhancedFieldMapper
            csvHeaders={csvHeaders}
            mappings={data.field_mappings || []}
            onMappingsChange={(mappings) => updateData({ field_mappings: mappings })}
          />
        </div>
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