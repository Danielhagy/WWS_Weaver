import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Integration } from "@/entities/Integration";
import { IntegrationRun } from "@/entities/IntegrationRun";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Copy, Edit, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import TestRunDialog from "../Components/integration-details/TestRunDialog.jsx";

export default function IntegrationDetails() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const integrationId = urlParams.get('id');
  
  const [integration, setIntegration] = useState(null);
  const [runs, setRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTestDialog, setShowTestDialog] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const integrationData = await Integration.list();
    const found = integrationData.find(i => i.id === integrationId);
    setIntegration(found);
    
    const runsData = await IntegrationRun.filter(
      { integration_id: integrationId },
      "-created_date",
      20
    );
    setRuns(runsData);
    setIsLoading(false);
  }, [integrationId]);

  useEffect(() => {
    if (integrationId) {
      loadData();
    }
  }, [integrationId, loadData]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this integration?")) {
      await Integration.delete(integrationId);
      navigate(createPageUrl("Dashboard"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Integration not found</p>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800"
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-green-50 rounded-2xl p-6 border border-green-100" style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)' }}>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{integration.name}</h1>
              <p className="text-gray-600 mt-1">{integration.workday_service}</p>
            </div>
            <Badge className={statusColors[integration.status]}>
              {integration.status}
            </Badge>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowTestDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Test Run
          </Button>
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(integration.webhook_url)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Webhook
          </Button>
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => navigate(createPageUrl("CreateIntegration") + `?id=${integrationId}`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className="text-red-600" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Field Mappings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {integration.field_mappings?.map((mapping, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm">{mapping.source_field}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium text-gray-900">{mapping.target_field}</span>
                      </div>
                      {mapping.transformation && mapping.transformation !== "none" && (
                        <Badge variant="outline" className="text-xs">
                          {mapping.transformation}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Runs</CardTitle>
              </CardHeader>
              <CardContent>
                {runs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No runs yet</p>
                ) : (
                  <div className="space-y-3">
                    {runs.map((run) => (
                      <div
                        key={run.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{run.trigger_type}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(run.created_date).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            run.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {run.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook URL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <code className="block bg-gray-50 p-3 rounded text-xs break-all border border-gray-200">
                    {integration.webhook_url}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigator.clipboard.writeText(integration.webhook_url)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Validation</p>
                  <Badge className={integration.validation_enabled ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-800"}>
                    {integration.validation_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Field Mappings</p>
                  <p className="font-medium">{integration.field_mappings?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TestRunDialog
        open={showTestDialog}
        onClose={() => setShowTestDialog(false)}
        integration={integration}
        onRunComplete={loadData}
      />
    </div>
  );
}
