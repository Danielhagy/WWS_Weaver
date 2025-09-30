import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Integration } from "@/entities/Integration";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import StepIndicator from "../Components/integration-builder/StepIndicator.jsx";
import ConfigurationStep from "../Components/integration-builder/ConfigurationStep.jsx";
import MappingStep from "../Components/integration-builder/MappingStep.jsx";
import TransformationStep from "../Components/integration-builder/TransformationStep.jsx";
import ValidationStep from "../Components/integration-builder/ValidationStep.jsx";
import ReviewStep from "../Components/integration-builder/ReviewStep.jsx";

const STEPS = [
  { id: 1, name: "Configuration", component: ConfigurationStep },
  { id: 2, name: "Mapping", component: MappingStep },
  { id: 3, name: "Transformations", component: TransformationStep },
  { id: 4, name: "Validation", component: ValidationStep },
  { id: 5, name: "Review", component: ReviewStep },
];

export default function CreateIntegration() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const editingId = urlParams.get('id');
  const isEditMode = !!editingId;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [integrationData, setIntegrationData] = useState({
    name: "",
    description: "",
    workday_service: "",
    field_mappings: [],
    validation_enabled: false,
    validation_service: "",
    status: "draft"
  });

  useEffect(() => {
    if (isEditMode) {
      loadIntegration();
    }
  }, [editingId]);

  const loadIntegration = async () => {
    setIsLoading(true);
    const integrations = await Integration.list();
    const existing = integrations.find(i => i.id === editingId);
    if (existing) {
      setIntegrationData(existing);
    }
    setIsLoading(false);
  };

  const updateData = (newData) => {
    setIntegrationData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (isEditMode) {
      console.log('Updating integration:', editingId, integrationData);
      const updated = await Integration.update(editingId, integrationData);
      console.log('Updated integration:', updated);
    } else {
      console.log('Creating new integration:', integrationData);
      // Generate webhook URL for new integrations
      const generatedWebhookUrl = `https://api.base44.com/webhooks/${Math.random().toString(36).substr(2, 9)}`;
      const newIntegrationData = {
        ...integrationData,
        webhook_url: generatedWebhookUrl,
        status: "active"
      };
      const newIntegration = await Integration.create(newIntegrationData);
      console.log('Created integration:', newIntegration);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <p className="text-gray-600">Loading integration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-soft-gray shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark-blue">
            {isEditMode ? "Edit Stitch" : "Create New Stitch"}
          </h1>
          <p className="text-medium-gray-blue mt-1">
            {isEditMode ? "Update your Workday integration" : "Build your Workday integration step by step"}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Main Content */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <CurrentStepComponent
            data={integrationData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            onSave={handleSave}
          />
        </CardContent>
      </Card>
    </div>
  );
}