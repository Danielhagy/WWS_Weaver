import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TRANSFORMATIONS = [
  { value: "none", label: "No Transformation" },
  { value: "format-date", label: "Format Date (YYYY-MM-DD)" },
  { value: "text-to-uppercase", label: "Convert to Uppercase" },
  { value: "text-to-lowercase", label: "Convert to Lowercase" },
  { value: "trim-whitespace", label: "Trim Whitespace" }
];

export default function TransformationStep({ data, updateData, nextStep, prevStep }) {
  const handleTransformationChange = (targetField, transformation) => {
    const newMappings = data.field_mappings.map(mapping => {
      if (mapping.target_field === targetField) {
        return { ...mapping, transformation };
      }
      return mapping;
    });
    updateData({ field_mappings: newMappings });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transformations</h2>
        <p className="text-gray-600">Apply optional data transformations to your mapped fields</p>
      </div>

      <div className="space-y-4">
        {data.field_mappings && data.field_mappings.length > 0 ? (
          data.field_mappings.map((mapping) => (
            <div
              key={mapping.target_field}
              className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900">{mapping.target_field}</p>
                  {mapping.transformation && mapping.transformation !== "none" && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      <Wand2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Source: <span className="font-medium">
                    {mapping.source_type === 'file_column'
                      ? mapping.source_value || mapping.source_field
                      : mapping.source_type === 'hardcoded'
                      ? `Hardcoded: "${mapping.source_value}"`
                      : mapping.source_type === 'dynamic_function'
                      ? `Function: ${mapping.source_value}`
                      : mapping.source_field || 'Not mapped'}
                  </span>
                </p>
              </div>

              <Select
                value={mapping.transformation || "none"}
                onValueChange={(value) => handleTransformationChange(mapping.target_field, value)}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSFORMATIONS.map((transform) => (
                    <SelectItem key={transform.value} value={transform.value}>
                      {transform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">No field mappings available</p>
        )}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-600" />
          Transformation Preview
        </h4>
        <p className="text-sm text-gray-600">
          Transformations are applied in real-time when processing your data. You can chain multiple 
          transformations or skip them entirely for any field.
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
          Next: Validation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}