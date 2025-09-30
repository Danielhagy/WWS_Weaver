import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ValidationStep({ data, updateData, nextStep, prevStep }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Validation</h2>
        <p className="text-gray-600">Configure optional pre-flight data validation</p>
      </div>

      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          Validation runs a Get_Workers request before processing to verify employee IDs 
          exist in Workday. This helps prevent failed imports.
        </AlertDescription>
      </Alert>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <Label htmlFor="validation-toggle" className="text-base font-semibold">
                Enable Pre-Flight Validation
              </Label>
            </div>
            <p className="text-sm text-gray-600">
              Validate data against Workday before sending the main request
            </p>
          </div>
          <Switch
            id="validation-toggle"
            checked={data.validation_enabled || false}
            onCheckedChange={(checked) => updateData({ validation_enabled: checked })}
          />
        </div>
      </div>

      {data.validation_enabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Validation Configuration</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-700">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Get_Workers Request</p>
                <p className="text-sm text-gray-600">Query Workday to verify employee exists</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-700">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Validation Check</p>
                <p className="text-sm text-gray-600">Confirm employee ID is valid before processing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-blue-700">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Error Prevention</p>
                <p className="text-sm text-gray-600">Skip invalid records to maintain data integrity</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
          Next: Review & Save
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}