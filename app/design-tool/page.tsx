"use client"

import { useEffect, useRef, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Type,
  ImageIcon,
  Upload,
  ArrowLeft,
  RotateCcw,
  Download,
  Loader2,
  Code2,
  ChevronDown,
  ChevronUp,
  MousePointerClick,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { useOpenScad } from "@/lib/use-openscad"
import { useTextToScad } from "@/lib/use-text-to-scad"
import { useComponentRenderer } from "@/lib/use-component-renderer"
import { StlViewer } from "@/components/stl-viewer"
import { ComponentStlViewer, type ComponentMeshData } from "@/components/component-stl-viewer"
import { ComponentEditorPanel } from "@/components/component-editor-panel"
import {
  parseModelSpec,
  setParameterValue,
  extractComponentSource,
  type ModelSpec,
} from "@/lib/model-spec"

type InputMode = "text" | "image"

const EMPTY_SPEC: ModelSpec = { components: [] }

export default function DesignToolPage() {
  const { t } = useLanguage()
  const [inputMode, setInputMode] = useState<InputMode>("text")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [description, setDescription] = useState("")
  const [scadCode, setScadCode] = useState("")
  const [showCode, setShowCode] = useState(false)

  // Structured component/parameter spec parsed straight out of the
  // generated OpenSCAD source (see lib/model-spec.ts) — this is what
  // drives the "click a part, drag a slider" editing UI below.
  const [modelSpec, setModelSpec] = useState<ModelSpec>(EMPTY_SPEC)
  const [componentBuffers, setComponentBuffers] = useState<ComponentMeshData[]>([])
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [generationId, setGenerationId] = useState(0)
  const paramUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modelSpecRef = useRef<ModelSpec>(EMPTY_SPEC)
  useEffect(() => {
    modelSpecRef.current = modelSpec
  }, [modelSpec])
  useEffect(() => {
    return () => {
      if (paramUpdateTimer.current) clearTimeout(paramUpdateTimer.current)
    }
  }, [])

  const { status: codeStatus, error: codeError, generate, reset: resetCode } = useTextToScad()
  const { status, error: renderError, stlBuffer, render, reset: resetRender } = useOpenScad()
  const { renderComponents, isRendering: isRenderingParts } = useComponentRenderer()

  const isWritingCode = codeStatus === "generating"
  const isRenderingModel = status === "loading-engine" || status === "rendering"
  const isGenerating = isWritingCode || isRenderingModel
  const hasResult = status === "ready" && stlBuffer !== null
  const hasComponents = modelSpec.components.length > 0 && componentBuffers.length > 0
  const selectedComponent = modelSpec.components.find((c) => c.id === selectedComponentId) ?? null
  const error = codeError || renderError

  // Renders every component's isolated preview in parallel and swaps them
  // into the viewer. Used both right after a fresh generation and after a
  // manual "Re-render" of hand-edited annotated code.
  const refreshComponentPreviews = async (code: string, spec: ModelSpec) => {
    if (spec.components.length === 0) {
      setComponentBuffers([])
      return
    }
    const requests = spec.components
      .map((component) => {
        const source = extractComponentSource(code, component.id)
        return source ? { id: component.id, source } : null
      })
      .filter((r): r is { id: string; source: string } => r !== null)

    const results = await renderComponents(requests)
    setComponentBuffers(
      results
        .filter((r) => r.ok && r.buffer)
        .map((r) => ({ id: r.id, buffer: r.buffer as ArrayBuffer })),
    )
  }

  const handleGenerate = async () => {
    if (advancedMode) {
      render(scadCode)
      const spec = parseModelSpec(scadCode)
      setModelSpec(spec)
      setSelectedComponentId(null)
      setGenerationId((n) => n + 1)
      void refreshComponentPreviews(scadCode, spec)
      return
    }
    const code = await generate(description)
    if (code) {
      setScadCode(code)
      setShowCode(true)
      render(code)
      const spec = parseModelSpec(code)
      setModelSpec(spec)
      setSelectedComponentId(null)
      setGenerationId((n) => n + 1)
      void refreshComponentPreviews(code, spec)
    }
  }

  const handleRerenderCode = () => {
    render(scadCode)
    const spec = parseModelSpec(scadCode)
    setModelSpec(spec)
    setSelectedComponentId((current) => (spec.components.some((c) => c.id === current) ? current : null))
    setGenerationId((n) => n + 1)
    void refreshComponentPreviews(scadCode, spec)
  }

  const handleReset = () => {
    setDescription("")
    setScadCode("")
    setShowCode(false)
    setModelSpec(EMPTY_SPEC)
    setComponentBuffers([])
    setSelectedComponentId(null)
    resetCode()
    resetRender()
  }

  // Editing a slider/number: apply the edit to the canonical source
  // immediately (so the code panel and the numeric readout update live),
  // then debounce the actual re-renders — one edited variable can affect
  // more than just the component that "owns" it (e.g. a shared leg
  // height), so all components are refreshed together, along with the
  // full merged model used for STL download.
  const handleParameterChange = (variable: string, value: number) => {
    setScadCode((prevCode) => {
      const nextCode = setParameterValue(prevCode, variable, value)

      setModelSpec((prevSpec) => ({
        components: prevSpec.components.map((c) => ({
          ...c,
          parameters: c.parameters.map((p) => (p.variable === variable ? { ...p, value } : p)),
        })),
      }))

      if (paramUpdateTimer.current) clearTimeout(paramUpdateTimer.current)
      paramUpdateTimer.current = setTimeout(() => {
        render(nextCode)
        void refreshComponentPreviews(nextCode, modelSpecRef.current)
      }, 200)

      return nextCode
    })
  }

  const handleDownload = () => {
    if (!stlBuffer) return
    const blob = new Blob([stlBuffer], { type: "model/stl" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "model.stl"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-32">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("designTool.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("designTool.subtitle")}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-border bg-secondary p-1">
            <button
              onClick={() => setInputMode("text")}
              className={cn(
                "flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium transition-colors",
                inputMode === "text"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Type className="h-4 w-4" />
              {t("designTool.textTab")}
            </button>
            <button
              onClick={() => setInputMode("image")}
              className={cn(
                "flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium transition-colors",
                inputMode === "image"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ImageIcon className="h-4 w-4" />
              {t("designTool.imageTab")}
            </button>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Panel */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {inputMode === "text" ? t("designTool.textTab") : t("designTool.imageTab")}
              </h2>
              {inputMode === "text" && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Code2 className="h-3.5 w-3.5" />
                  {t("designTool.advancedToggle")}
                  <Switch
                    checked={advancedMode}
                    onCheckedChange={(checked) => {
                      setAdvancedMode(checked)
                      // Seed the code editor with whatever was last generated
                      // so switching modes doesn't lose the user's work.
                      if (checked) setShowCode(false)
                    }}
                  />
                </label>
              )}
            </div>

            {inputMode === "text" ? (
              <div className="space-y-4">
                {advancedMode ? (
                  <Textarea
                    placeholder={t("designTool.codePlaceholder")}
                    className="min-h-[200px] resize-none bg-secondary font-mono text-sm"
                    value={scadCode}
                    onChange={(e) => setScadCode(e.target.value)}
                  />
                ) : (
                  <Textarea
                    placeholder={t("designTool.textPlaceholder")}
                    className="min-h-[200px] resize-none bg-secondary text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                )}
                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={
                      (advancedMode ? !scadCode.trim() : !description.trim()) || isGenerating
                    }
                    className="flex-1 gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isWritingCode
                          ? t("designTool.writingCode")
                          : t("designTool.generating")}
                      </>
                    ) : (
                      <>
                        {t("designTool.generate")}
                        <ArrowLeft className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                {error && <p className="whitespace-pre-wrap text-xs text-destructive">{error}</p>}

                {!advancedMode && scadCode && (
                  <div className="rounded-lg border border-border bg-secondary">
                    <button
                      type="button"
                      onClick={() => setShowCode((prev) => !prev)}
                      className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        {t("designTool.generatedCode")}
                      </span>
                      {showCode ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {showCode && (
                      <div className="space-y-3 border-t border-border p-4">
                        <Textarea
                          className="min-h-[160px] resize-none bg-background font-mono text-xs"
                          value={scadCode}
                          onChange={(e) => setScadCode(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handleRerenderCode}
                          disabled={!scadCode.trim() || isGenerating}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {t("designTool.rerender")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary transition-colors hover:border-accent/50 hover:bg-secondary/80">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <Upload className="h-8 w-8 text-accent" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground">
                    {t("designTool.upload")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("designTool.uploadDesc")}
                  </p>
                </div>
                <Button disabled className="w-full gap-2">
                  {t("designTool.generate")}
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {t("designTool.preview")}
              </h2>
              {hasResult && (
                <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  {t("designTool.download")}
                </Button>
              )}
            </div>

            {hasComponents && (
              <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                {isRenderingParts ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MousePointerClick className="h-3.5 w-3.5" />
                )}
                {isRenderingParts ? t("designTool.editor.updating") : t("designTool.editor.hint")}
              </p>
            )}

            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-accent" />
                  <p className="text-sm text-muted-foreground">
                    {isWritingCode ? t("designTool.writingCode") : t("designTool.generating")}
                  </p>
                </div>
              ) : hasComponents ? (
                <ComponentStlViewer
                  components={componentBuffers}
                  selectedId={selectedComponentId}
                  onSelect={setSelectedComponentId}
                  resetKey={generationId}
                  className="h-full w-full"
                />
              ) : hasResult && stlBuffer ? (
                <StlViewer stlBuffer={stlBuffer} className="h-full w-full" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Type className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("designTool.preview")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Parts Section — only appears once the generated model has structured components */}
        {hasComponents && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {t("designTool.editor.title")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modelSpec.components.map((component) => (
                <button
                  key={component.id}
                  type="button"
                  onClick={() =>
                    setSelectedComponentId((current) => (current === component.id ? null : component.id))
                  }
                  className={cn(
                    "rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors",
                    component.id === selectedComponentId
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {component.name}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <ComponentEditorPanel
                component={selectedComponent}
                onParameterChange={handleParameterChange}
                onDeselect={() => setSelectedComponentId(null)}
              />
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">{t("designTool.tips.title")}</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground">{t("designTool.tips.1")}</p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground">{t("designTool.tips.2")}</p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground">{t("designTool.tips.3")}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
