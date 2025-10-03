import React from 'react'
import { Webhook, FileUp, Settings, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TriggerBlock({ webhookConfig, onClick }) {
  const isConfigured = webhookConfig && (webhookConfig.type === 'file' || webhookConfig.type === 'json')

  return (
    <Card
      className="p-6 border-2 border-primary-dark-blue bg-gradient-to-br from-primary-dark-blue to-primary-dark-blue/90 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
      onClick={onClick}
      data-testid="webhook-trigger-block"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
          <Webhook className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white">Webhook Trigger</h3>
            <Badge variant="secondary" className="bg-accent-teal text-white border-none text-xs">
              Entry Point
            </Badge>
            {isConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-accent-teal" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <p className="text-white/80 text-sm">
            {isConfigured
              ? webhookConfig.type === 'file'
                ? `File upload: ${webhookConfig.fileName || 'configured'}`
                : 'JSON body: configured'
              : 'Click to configure webhook settings'
            }
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {webhookConfig?.type === 'file' && (
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <FileUp className="w-5 h-5 text-white/70" />
            </div>
          )}
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Settings className="w-5 h-5 text-white/70" />
          </div>
        </div>
      </div>
    </Card>
  )
}
