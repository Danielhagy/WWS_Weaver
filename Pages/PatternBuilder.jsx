import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import StitchingCanvas from '../Components/pattern-builder/StitchingCanvas'

export default function PatternBuilder() {
  const navigate = useNavigate()
  const [patternName, setPatternName] = useState('')
  const [patternDescription, setPatternDescription] = useState('')
  const [steps, setSteps] = useState([])
  const [webhookConfig, setWebhookConfig] = useState(null)

  const handleSavePattern = () => {
    // TODO: Implement save functionality in future milestones
    console.log('Saving pattern:', { patternName, patternDescription, steps, webhookConfig })
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/Dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary-dark-blue">
              Create Pattern
            </h1>
            <p className="text-muted-foreground mt-1">
              Stitch together multiple operations into a seamless workflow
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Play className="w-4 h-4" />
            Test Pattern
          </Button>
          <Button onClick={handleSavePattern} className="gap-2">
            <Save className="w-4 h-4" />
            Save Pattern
          </Button>
        </div>
      </div>

      {/* Pattern Details */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="pattern-name">Pattern Name</Label>
            <Input
              id="pattern-name"
              placeholder="e.g., Create Position & Hire Worker"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pattern-description">Description</Label>
            <Input
              id="pattern-description"
              placeholder="Describe what this pattern does..."
              value={patternDescription}
              onChange={(e) => setPatternDescription(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Stitching Canvas */}
      <StitchingCanvas
        steps={steps}
        setSteps={setSteps}
        webhookConfig={webhookConfig}
        setWebhookConfig={setWebhookConfig}
      />
    </div>
  )
}
