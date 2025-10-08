import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Info, Users, ChevronDown, ChevronRight, CheckCircle2, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WORKDAY_SERVICES } from '@/config/workdayServices';

// Transform WORKDAY_SERVICES into the UI format
const WEB_SERVICES = [
  {
    id: "staffing",
    name: "Staffing",
    version: "v45.0", // Updated to v45.0 to reflect new services
    description: "Manage positions, workers, and organizational assignments",
    icon: Users,
    operations: WORKDAY_SERVICES.map(service => ({
      value: service.value,
      label: service.label,
      description: service.description,
      version: service.version,
      fieldConfig: service.fieldConfig,
      operationName: service.operationName
    }))
  }
  // Future service categories will be added here: HCM, Recruiting, Compensation, etc.
];

export default function ConfigurationStep({ data, updateData, nextStep }) {
  const [expandedService, setExpandedService] = useState(
    data.workday_service ? WEB_SERVICES.find(s =>
      s.operations.some(op => op.value === data.workday_service)
    )?.id : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleNext = () => {
    if (data.name && data.workday_service) {
      nextStep();
    }
  };

  const toggleService = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  const handleOperationSelect = (operationValue) => {
    updateData({ workday_service: operationValue });
  };

  // Filter services and operations based on search query
  const filteredServices = WEB_SERVICES.map(service => {
    const matchesServiceName = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesServiceDescription = service.description.toLowerCase().includes(searchQuery.toLowerCase());

    const filteredOperations = service.operations.filter(op =>
      op.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Show service if it matches or any of its operations match
    if (matchesServiceName || matchesServiceDescription || filteredOperations.length > 0) {
      return {
        ...service,
        operations: searchQuery ? filteredOperations : service.operations
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration</h2>
        <p className="text-gray-600">Set up the basic details of your integration</p>
      </div>

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
          <Label>Workday Web Service *</Label>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Select a web service category, then choose an operation
          </p>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search web services and operations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {filteredServices.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No web services or operations match your search.</p>
              </Card>
            ) :
              filteredServices.map((service) => {
              const ServiceIcon = service.icon;
              const isExpanded = expandedService === service.id;
              const hasSelectedOperation = service.operations.some(op => op.value === data.workday_service);

              return (
                <Card key={service.id} className="overflow-hidden border-2 transition-all">
                  {/* Service Header - Clickable Tile */}
                  <button
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-teal to-accent-teal/70 flex items-center justify-center flex-shrink-0">
                      <ServiceIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-primary-dark-blue">{service.name}</h3>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                          {service.version}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{service.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasSelectedOperation && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Operations List - Expanded */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50/50 p-3 space-y-2">
                      {service.operations.map((operation) => {
                        const isSelected = data.workday_service === operation.value;

                        return (
                          <button
                            key={operation.value}
                            type="button"
                            onClick={() => handleOperationSelect(operation.value)}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                ? 'border-accent-teal bg-accent-teal/5'
                                : 'border-gray-200 hover:border-accent-teal/50 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-primary-dark-blue">
                                    {operation.label}
                                  </p>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-accent-teal flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {operation.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })
            }
          </div>
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