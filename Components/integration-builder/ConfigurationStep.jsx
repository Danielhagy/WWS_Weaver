import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// For MVP, we'll focus on Put Position only
const WORKDAY_SERVICES = [
  { 
    value: "Create_Position", 
    label: "Create Position (Put Position) - Staffing v44.2",
    version: "v44.2",
    description: "Create new positions in your organizational structure",
    service: "Staffing"
  }
];

export default function ConfigurationStep({ data, updateData, nextStep }) {
  const selectedService = WORKDAY_SERVICES.find(s => s.value === data.workday_service);

  const handleNext = () => {
    if (data.name && data.workday_service) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration</h2>
        <p className="text-gray-600">Set up the basic details of your integration</p>
      </div>

      <Alert variant="info" className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>MVP Mode:</strong> Currently supporting Create Position web service. 
          Additional services will be available in future releases.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Integration Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Q4 2025 Position Creation"
            value={data.name || ""}
            onChange={(e) => updateData({ name: e.target.value })}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Give your integration a descriptive name for easy identification
          </p>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what this integration does and when it should be used..."
            value={data.description || ""}
            onChange={(e) => updateData({ description: e.target.value })}
            className="mt-1 h-24"
          />
          <p className="text-sm text-gray-500 mt-1">
            Optional: Add details about the purpose and usage of this integration
          </p>
        </div>

        <div>
          <Label htmlFor="service">Workday Web Service *</Label>
          <Select
            value={data.workday_service || ""}
            onValueChange={(value) => {
              updateData({ workday_service: value });
            }}
          >
            <SelectTrigger className="mt-1" id="service">
              <SelectValue placeholder="Select a Workday service" />
            </SelectTrigger>
            <SelectContent>
              {WORKDAY_SERVICES.map((service) => (
                <SelectItem key={service.value} value={service.value}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedService && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Selected:</strong> {selectedService.service} - {selectedService.version}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {selectedService.description}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Choose the Workday web service operation you want to execute
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={handleNext}
          disabled={!data.name || !data.workday_service}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Next: Source & Mapping
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}