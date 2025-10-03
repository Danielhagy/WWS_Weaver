import React from 'react';
import { Check } from "lucide-react";

export default function StepIndicator({ steps, currentStep, onStepClick }) {
  const handleStepClick = (stepId) => {
    // Only allow navigation to completed steps or current step
    if (stepId <= currentStep && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={`flex flex-col items-center flex-1 ${
                step.id <= currentStep ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={() => handleStepClick(step.id)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  currentStep > step.id
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : currentStep === step.id
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="text-center mt-2">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 hidden md:block">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                  currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}