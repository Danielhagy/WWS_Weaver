import React, { useState, useEffect } from "react";
import { Integration } from "@/entities/Integration";
import { IntegrationRun } from "@/entities/IntegrationRun";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Activity, CheckCircle, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import StatsCards from "../Components/Dashboard/StatsCards.jsx";
import IntegrationCard from "../Components/Dashboard/IntegrationCard.jsx";
import RecentRuns from "../Components/Dashboard/RecentRuns.jsx";

export default function Dashboard() {
  const [integrations, setIntegrations] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [integrationsData, runsData] = await Promise.all([
      Integration.list("-created_date"),
      IntegrationRun.list("-created_date", 10)
    ]);
    setIntegrations(integrationsData);
    setRecentRuns(runsData);
    setIsLoading(false);
  };

  const activeIntegrations = integrations.filter(i => i.status === "active").length;
  const totalRuns = recentRuns.length;
  const successfulRuns = recentRuns.filter(r => r.status === "success").length;
  const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-green-50 rounded-2xl p-6 border border-green-100" style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Integration Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your Workday integrations with ease
              </p>
            </div>
            <Link to={createPageUrl("CreateIntegration")}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                New Integration
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCards
            title="Total Integrations"
            value={integrations.length}
            icon={Activity}
            bgColor="bg-blue-500"
            trend={`${activeIntegrations} active`}
          />
          <StatsCards
            title="Recent Runs"
            value={totalRuns}
            icon={Clock}
            bgColor="bg-purple-500"
            trend="Last 10 executions"
          />
          <StatsCards
            title="Success Rate"
            value={`${successRate}%`}
            icon={CheckCircle}
            bgColor="bg-green-500"
            trend={`${successfulRuns}/${totalRuns} succeeded`}
          />
          <StatsCards
            title="Failed Runs"
            value={recentRuns.filter(r => r.status === "failed").length}
            icon={XCircle}
            bgColor="bg-red-500"
          />
        </div>

        {/* Integrations Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Integrations</h2>
            <p className="text-sm text-gray-500">{integrations.length} total</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-md">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : integrations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Integrations Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first integration to get started with Workday data processing
              </p>
              <Link to={createPageUrl("CreateIntegration")}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Integration
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onUpdate={loadData}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Runs */}
        <RecentRuns runs={recentRuns} isLoading={isLoading} />
      </div>
    </div>
  );
}