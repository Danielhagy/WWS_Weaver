import React from 'react'
import { Webhook, FileUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TriggerBlock() {
  return (
    <Card className="p-6 border-2 border-primary-dark-blue bg-gradient-to-br from-primary-dark-blue to-primary-dark-blue/90 shadow-lg hover:shadow-xl transition-all duration-200">
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
          </div>
          <p className="text-white/80 text-sm">
            Pattern starts when webhook receives data
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <FileUp className="w-5 h-5 text-white/70" />
          </div>
        </div>
      </div>
    </Card>
  )
}
