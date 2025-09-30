import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Loader2, Copy, ExternalLink, Code } from "lucide-react";
import { Integration } from "@/entities/Integration";
import { generateCreatePositionXML, generatePostmanInstructions } from "@/utils/xmlGenerator";

export default function ReviewStep({ data, prevStep, onSave }) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // If onSave is provided (from parent), use it instead
      if (onSave) {
        await onSave();
        setTimeout(() => {
          navigate(createPageUrl("Dashboard"));
        }, 1500);
      } else {
        // Fallback to old behavior
        const generatedWebhookUrl = `https://api.base44.com/webhooks/${Math.random().toString(36).substr(2, 9)}`;

        const integrationData = {
          ...data,
          webhook_url: generatedWebhookUrl,
          status: "active"
        };

        const saved = await Integration.create(integrationData);
        setWebhookUrl(generatedWebhookUrl);

        setTimeout(() => {
          navigate(createPageUrl("Dashboard"));
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving integration:", error);
    }
    setIsSaving(false);
  };

  if (webhookUrl) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Integration Created!</h2>
        <p className="text-gray-600 mb-8">Your integration is ready to use</p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
          <p className="text-sm font-medium text-gray-700 mb-2">Webhook URL:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-4 py-2 rounded border border-gray-200 text-sm break-all">
              {webhookUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigator.clipboard.writeText(webhookUrl)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Save</h2>
        <p className="text-gray-600">Review your integration configuration before saving</p>
      </div>

      <div className="space-y-6">
        {/* Configuration Summary */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Configuration</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Integration Name</dt>
              <dd className="font-medium text-gray-900 mt-1">{data.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Workday Service</dt>
              <dd className="font-medium text-gray-900 mt-1">{data.workday_service}</dd>
            </div>
            {data.description && (
              <div className="md:col-span-2">
                <dt className="text-sm text-gray-500">Description</dt>
                <dd className="text-gray-900 mt-1">{data.description}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Field Mappings */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Field Mappings</h3>
          <div className="space-y-2">
            {data.field_mappings && data.field_mappings.map((mapping, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">
                    {mapping.source_type === 'file_column'
                      ? mapping.source_value || mapping.source_field
                      : mapping.source_type === 'hardcoded'
                      ? `"${mapping.source_value}"`
                      : mapping.source_type === 'dynamic_function'
                      ? `[${mapping.source_value}]`
                      : mapping.source_field || 'Unmapped'}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-gray-900">{mapping.target_field}</span>
                </div>
                {mapping.transformation && mapping.transformation !== "none" && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    {mapping.transformation}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Validation */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Validation</h3>
          <div className="flex items-center gap-2">
            <Badge className={data.validation_enabled ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-800"}>
              {data.validation_enabled ? "Enabled" : "Disabled"}
            </Badge>
            {data.validation_enabled && (
              <span className="text-sm text-gray-600">Pre-flight validation active</span>
            )}
          </div>
        </div>

        {/* SOAP XML Preview for Testing */}
        <XMLPreview data={data} />
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep} disabled={isSaving}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Integration...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save Integration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// XML Preview Component for Postman Testing
function XMLPreview({ data }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatedXML = generateCreatePositionXML(data, data.sample_row_data || {});
  const postmanInstructions = generatePostmanInstructions();

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedXML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">SOAP XML for Postman Testing</h3>
            <p className="text-sm text-gray-600">Preview generated from first row of uploaded file</p>
          </div>
        </div>
        <Badge className="bg-blue-600 text-white">
          {isExpanded ? "Hide" : "Show"}
        </Badge>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-blue-200 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-700 font-medium">Generated SOAP Request:</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy XML"}
            </Button>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-green-400 font-mono">
              <code>{generatedXML}</code>
            </pre>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Postman Testing Instructions
            </h4>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {postmanInstructions}
            </pre>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Placeholders like {`{{field_name}}`} need to be replaced with actual values.
              Fields marked as {`{{ISU_USERNAME}}`} and {`{{ISU_PASSWORD}}`} should be replaced with your Workday credentials.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}