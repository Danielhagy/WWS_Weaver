import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

const statusIcons = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  processing: <Clock className="w-4 h-4 text-blue-500 animate-spin" />
};

const statusColors = {
  success: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200"
};

export default function RecentRuns({ runs, isLoading }) {
  if (runs.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Recent Execution History</CardTitle>
          <Link to={createPageUrl("RunHistory")}>
            <Button variant="ghost" size="sm">
              View All
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => (
              <div
                key={run.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3 md:mb-0">
                  {statusIcons[run.status]}
                  <div>
                    <p className="font-medium text-gray-900">{run.integration_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">
                        {format(new Date(run.created_date), "MMM d, yyyy HH:mm")}
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-500 capitalize">{run.trigger_type}</p>
                    </div>
                    {run.records_processed > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {run.records_succeeded}/{run.records_processed} records succeeded
                      </p>
                    )}
                  </div>
                </div>
                <Badge className={`${statusColors[run.status]} border`}>
                  {run.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}