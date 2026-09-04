"use client"

import type { ModelComponent } from "@/lib/model-spec"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface ComponentEditorPanelProps {
  component: ModelComponent | null
  onParameterChange: (variable: string, value: number) => void
  onDeselect: () => void
}

// Fully generic: it renders whatever parameters the selected component
// declares, with no knowledge of "tables" or any other object type — this
// is what keeps the feature working for chairs, brackets, architectural
// models, etc. with zero UI-side special-casing.
export function ComponentEditorPanel({ component, onParameterChange, onDeselect }: ComponentEditorPanelProps) {
  const { t } = useLanguage()

  if (!component) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {t("designTool.editor.empty")}
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-secondary p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {t("designTool.editor.selected")}: {component.name}
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDeselect}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {component.parameters.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("designTool.editor.noParams")}</p>
      ) : (
        <div className="space-y-5">
          {component.parameters.map((param) => (
            <div key={param.variable} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <label htmlFor={`param-${param.variable}`} className="font-medium text-foreground">
                  {param.label}
                </label>
                <div className="flex items-center gap-1">
                  <Input
                    id={`param-${param.variable}`}
                    type="number"
                    value={param.value}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    onChange={(e) => {
                      const next = Number(e.target.value)
                      if (!Number.isNaN(next)) onParameterChange(param.variable, next)
                    }}
                    className="h-7 w-20 bg-background text-right text-xs"
                  />
                  {param.unit && <span className="text-muted-foreground">{param.unit}</span>}
                </div>
              </div>
              <Slider
                value={[param.value]}
                min={param.min}
                max={param.max}
                step={param.step || 1}
                onValueChange={([next]) => onParameterChange(param.variable, next)}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>
                  {param.min}
                  {param.unit}
                </span>
                <span>
                  {param.max}
                  {param.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
