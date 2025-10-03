import React from 'react';
import { Card, CardHeader } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function StatsCards({ title, value, icon: Icon, bgColor, trend }) {
  return (
    <Card className="relative overflow-hidden border-soft-gray shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader className="p-6 relative">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-medium-gray-blue mb-1">{title}</p>
            <p className="text-3xl font-bold text-primary-dark-blue mt-2">
              {value}
            </p>
          </div>
          {/* Icon container with centered decorative circle behind it */}
          <div className="relative flex items-center justify-center">
            {/* Larger decorative circle */}
            <div className={`absolute w-24 h-24 ${bgColor} rounded-full opacity-10`} />
            {/* Icon square centered on circle */}
            <div className={`relative p-2.5 rounded-lg ${bgColor} flex items-center justify-center z-10`}>
              <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-accent-teal" />
            <span className="text-medium-gray-blue font-medium">{trend}</span>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
