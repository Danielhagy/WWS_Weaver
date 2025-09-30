import React, { useState } from "react";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [integrationData, setIntegrationData] = useState({
    name: "",
    description: "",
    workday_service: "",
    field_mappings: [],
    validation_enabled: false,
    validation_service: "",
    status: "draft"
  });

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
    const newIntegration = await Integration.create(integrationData);
    navigate(`${createPageUrl("IntegrationDetails")}?id=${newIntegration.id}`);
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Integration</h1>
            <p className="text-gray-600 mt-1">Build your Workday integration step by step</p>
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
    </div>
  );
}