import React from 'react'
import { Settings, Trash2, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function StepBlock({ step, isSelected, onClick, onDelete, previousSteps }) {
  const isConfigured = step.webService !== null || step.existingStitchId !== null
  const hasMappings = step.mappings && step.mappings.length > 0
  const hasGoldenThreads = previousSteps.length > 0

  return (
    <Card
      className={`p-5 border-2 transition-all duration-200 cursor-pointer group hover:shadow-lg ${
        isSelected
          ? 'border-accent-teal bg-accent-teal/5 shadow-lg ring-2 ring-accent-teal/20'
          : isConfigured
          ? 'border-green-500/30 bg-white hover:border-accent-teal/50'
          : 'border-dashed border-soft-gray hover:border-accent-teal/50 bg-white'
      }`}
      onClick={onClick}
      data-testid={`step-block-${step.id}`}
    >
      <div className="flex items-center gap-4">
        {/* Step Number Badge */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-md transition-all ${
          isSelected
            ? 'bg-accent-teal text-white'
            : isConfigured
            ? 'bg-green-500 text-white'
            : 'bg-soft-gray text-muted-foreground'
        }`}>
          {step.order}
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-primary-dark-blue truncate">
              {step.name}
            </h3>
            {isConfigured && (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
            {!isConfigured && (
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground truncate">
              {step.webService || 'Click to configure web service'}
            </p>
            {hasGoldenThreads && hasMappings && (
              <Badge variant="secondary" className="bg-accent-teal/10 text-accent-teal border-none text-xs flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Golden Thread
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="hover:bg-accent-teal/10 hover:text-accent-teal"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="hover:bg-red-50 hover:text-red-600"
            data-testid={`delete-step-${step.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Configuration Status */}
      {isConfigured && (
        <div className="mt-3 pt-3 border-t border-soft-gray/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Mappings: {step.mappings?.length || 0}</span>
            {step.testResults && (
              <span className="text-green-600 font-medium">✓ Tested</span>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
