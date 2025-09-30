import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Workflow, Calendar, ExternalLink, Play, Pause } from "lucide-react";
import { format } from "date-fns";
import { Integration } from "@/entities/Integration";

const statusColors = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  active: "bg-green-100 text-green-800 border-green-200",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

export default function IntegrationCard({ integration, onUpdate }) {
  const handleToggleStatus = async () => {
    const newStatus = integration.status === "active" ? "paused" : "active";
    await Integration.update(integration.id, { status: newStatus });
    onUpdate();
  };

  return (
    <Card className="bg-white hover:shadow-xl transition-all duration-300 border-none shadow-md flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-green-500 rounded-lg flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{integration.workday_service}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[integration.status]} border`}>
            {integration.status}
          </Badge>
          {integration.field_mappings && (
            <Badge variant="outline" className="text-xs">
              {integration.field_mappings.length} mappings
            </Badge>
          )}
        </div>

        {integration.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {integration.description}
          </p>
        )}

        {integration.last_run_date && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            Last run: {format(new Date(integration.last_run_date), "MMM d, yyyy HH:mm")}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex gap-2 mt-auto">
        <Link to={createPageUrl("IntegrationDetails") + `?id=${integration.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleStatus}
          className={integration.status === "active" ? "text-yellow-600" : "text-green-600"}
        >
          {integration.status === "active" ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}