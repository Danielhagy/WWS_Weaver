import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadFile } from "@/integrations/Core";
import { IntegrationRun } from "@/entities/IntegrationRun";
import { Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function TestRunDialog({ open, onClose, integration, onRunComplete }) {
  const [file, setFile] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleTestRun = async () => {
    if (!file) return;
    
    setIsRunning(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock SOAP request/response
      const mockSoapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <wd:${integration.workday_service} xmlns:wd="urn:com.workday/bsvc">
      <!-- Field mappings applied here -->
    </wd:${integration.workday_service}>
  </soapenv:Body>
</soapenv:Envelope>`;

      const mockSoapResponse = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <wd:Response xmlns:wd="urn:com.workday/bsvc">
      <wd:Status>Success</wd:Status>
      <wd:Message>Operation completed successfully</wd:Message>
    </wd:Response>
  </soapenv:Body>
</soapenv:Envelope>`;

      // Create run log
      await IntegrationRun.create({
        integration_id: integration.id,
        integration_name: integration.name,
        status: "success",
        trigger_type: "test",
        records_processed: 1,
        records_succeeded: 1,
        records_failed: 0,
        file_url: file_url,
        soap_request: mockSoapRequest,
        soap_response: mockSoapResponse,
        duration_ms: 2000
      });

      setResult({
        status: "success",
        request: mockSoapRequest,
        response: mockSoapResponse
      });

      onRunComplete();
    } catch (error) {
      setResult({
        status: "failed",
        error: error.message
      });
    }
    setIsRunning(false);
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Integration Run</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!result ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Test File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="test-file-input"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="test-file-input" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload test file</p>
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> This is a prototype. In production, this would process 
                  your file, apply transformations, and send actual SOAP requests to Workday.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                result.status === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}>
                {result.status === "success" ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className="font-semibold">
                    {result.status === "success" ? "Test Run Successful!" : "Test Run Failed"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {result.status === "success" ? "SOAP request generated and validated" : result.error}
                  </p>
                </div>
              </div>

              {result.status === "success" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Generated SOAP Request
                    </label>
                    <Textarea
                      value={result.request}
                      readOnly
                      className="font-mono text-xs h-32"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mock Workday Response
                    </label>
                    <Textarea
                      value={result.response}
                      readOnly
                      className="font-mono text-xs h-32"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              onClick={handleTestRun}
              disabled={!file || isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Run Test"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}