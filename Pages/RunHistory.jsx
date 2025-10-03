import React, { useState, useEffect } from "react";
import { IntegrationRun } from "@/entities/IntegrationRun";
import { Integration } from "@/entities/Integration";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CheckCircle, XCircle, Filter, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RunHistory() {
  const [runs, setRuns] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterIntegration, setFilterIntegration] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [runsData, integrationsData] = await Promise.all([
      IntegrationRun.list("-created_date", 50),
      Integration.list()
    ]);
    setRuns(runsData);
    setIntegrations(integrationsData);
    setIsLoading(false);
  };

  const filteredRuns = runs.filter(run => {
    const matchesStatus = filterStatus === "all" || run.status === filterStatus;
    const matchesIntegration = filterIntegration === "all" || run.integration_id === filterIntegration;
    const matchesSearch = searchTerm === "" || 
      run.integration_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesIntegration && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800"
    };
    
    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-soft-gray shadow-md">
        <h1 className="text-3xl font-bold text-primary-dark-blue">Run History</h1>
        <p className="text-medium-gray-blue mt-1">View and filter all integration executions</p>
      </div>

        {/* Filters */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by integration name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterIntegration} onValueChange={setFilterIntegration}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by integration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Integrations</SelectItem>
                  {integrations.map(integration => (
                    <SelectItem key={integration.id} value={integration.id}>
                      {integration.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Showing {filteredRuns.length} of {runs.length} runs</span>
            </div>
          </CardContent>
        </Card>

        {/* Runs List */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredRuns.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Runs Found
                </h3>
                <p className="text-gray-600">
                  {runs.length === 0 
                    ? "No integration runs have been executed yet"
                    : "Try adjusting your filters"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRuns.map(run => (
                  <div
                    key={run.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getStatusIcon(run.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {run.integration_name}
                        </h4>
                        {getStatusBadge(run.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="capitalize">{run.trigger_type}</span>
                        <span>•</span>
                        <span>{new Date(run.created_date).toLocaleString()}</span>
                        {run.records_processed !== undefined && (
                          <>
                            <span>•</span>
                            <span>{run.records_processed} records processed</span>
                          </>
                        )}
                      </div>
                      
                      {run.error_message && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          <strong>Error:</strong> {run.error_message}
                        </div>
                      )}
                    </div>
                    
                    {run.completed_date && (
                      <div className="flex-shrink-0 text-right text-xs text-gray-500">
                        <div>Completed</div>
                        <div>{new Date(run.completed_date).toLocaleTimeString()}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}