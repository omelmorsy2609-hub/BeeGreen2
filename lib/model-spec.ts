// Structured, parametric representation of a generated OpenSCAD model.
//
// The LLM (see app/api/generate-scad/route.ts) is instructed to annotate
// its generated OpenSCAD with a small, strict comment convention:
//
//   // @component leg_1 "Front Left Leg"
//   leg_1_height = 700; // @param label="Height" min=400 max=900 step=5
//   leg_1_radius = 25;  // @param label="Radius" min=10 max=60 step=1
//
//   // === ASSEMBLY START ===
//   render_tabletop();
//   render_leg_1();
//   ...
//   // === ASSEMBLY END ===
//
// ...and to define one `module render_<component_id>() { ... }` per
// component (with that component's own position/rotation baked in)
// somewhere before the assembly block.
//
// This file derives a structured ModelSpec straight from that source text,
// rather than asking the LLM for a parallel JSON blob, so the spec can
// never drift out of sync with the actual code — the code is the single
// source of truth, always.
//
// Any script that doesn't follow this convention (hand-written code in
// "advanced" mode, or an older/plain generation) simply parses to zero
// components, and callers fall back to the plain merged-mesh viewer.

export type ParameterUnit = "mm" | "deg" | "count" | ""

export interface ComponentParameter {
  /** The OpenSCAD variable name — also this parameter's unique key. */
  variable: string
  /** Display label, e.g. "Height". */
  label: string
  min: number
  max: number
  step: number
  value: number
  unit: ParameterUnit
}

export interface ModelComponent {
  /** Stable id, also the OpenSCAD module suffix: render_<id>(). */
  id: string
  /** Display name, e.g. "Front Left Leg". */
  name: string
  parameters: ComponentParameter[]
}

export interface ModelSpec {
  components: ModelComponent[]
}

export const ASSEMBLY_START = "// === ASSEMBLY START ==="
export const ASSEMBLY_END = "// === ASSEMBLY END ==="

const COMPONENT_LINE = /^\s*\/\/\s*@component\s+([A-Za-z_][A-Za-z0-9_]*)\s+"([^"]*)"\s*$/
const PARAM_LINE =
  /^(\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*=\s*)(-?\d+(?:\.\d+)?)(\s*;.*?\/\/\s*@param\b)(.*)$/

function parseParamAttrs(rest: string): { label?: string; min?: number; max?: number; step?: number } {
  const attrs: { label?: string; min?: number; max?: number; step?: number } = {}
  const labelMatch = rest.match(/label="([^"]*)"/)
  if (labelMatch) attrs.label = labelMatch[1]
  const minMatch = rest.match(/\bmin=(-?\d+(?:\.\d+)?)/)
  if (minMatch) attrs.min = Number(minMatch[1])
  const maxMatch = rest.match(/\bmax=(-?\d+(?:\.\d+)?)/)
  if (maxMatch) attrs.max = Number(maxMatch[1])
  const stepMatch = rest.match(/\bstep=(-?\d+(?:\.\d+)?)/)
  if (stepMatch) attrs.step = Number(stepMatch[1])
  return attrs
}

function humanizeVariable(variable: string, componentId: string): string {
  const stripped = variable.startsWith(`${componentId}_`) ? variable.slice(componentId.length + 1) : variable
  return stripped
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/** Parses the `@component` / `@param` annotations out of generated OpenSCAD source. */
export function parseModelSpec(source: string): ModelSpec {
  const lines = source.split("\n")
  const components = new Map<string, ModelComponent>()
  let currentComponentId: string | null = null

  for (const line of lines) {
    const componentMatch = line.match(COMPONENT_LINE)
    if (componentMatch) {
      const [, id, name] = componentMatch
      currentComponentId = id
      if (!components.has(id)) {
        components.set(id, { id, name, parameters: [] })
      }
      continue
    }

    const paramMatch = line.match(PARAM_LINE)
    if (paramMatch && currentComponentId) {
      const variable = paramMatch[2]
      const valueStr = paramMatch[4]
      const rest = paramMatch[6]
      const component = components.get(currentComponentId)
      if (!component) continue

      const attrs = parseParamAttrs(rest)
      const value = Number(valueStr)
      const min = attrs.min ?? Math.min(0, value)
      const max = attrs.max ?? Math.max(value * 2, value + 100)
      const step = attrs.step ?? (Number.isInteger(value) ? 1 : 0.1)

      // Guard against a malformed/duplicate variable line.
      if (component.parameters.some((p) => p.variable === variable)) continue

      component.parameters.push({
        variable,
        label: attrs.label ?? humanizeVariable(variable, component.id),
        min,
        max,
        step,
        value,
        unit: "mm",
      })
    }
  }

  return { components: Array.from(components.values()).filter((c) => c.parameters.length > 0) }
}

/** True if the source has enough structure to support per-component editing. */
export function hasComponentStructure(source: string): boolean {
  return source.includes(ASSEMBLY_START) && /\/\/\s*@component\s+/.test(source)
}

/**
 * Replaces a single top-level `variable = number;` assignment in the
 * source with a new value, preserving everything else — including the
 * @param annotation comment — exactly.
 */
export function setParameterValue(source: string, variable: string, newValue: number): string {
  const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`^(\\s*)(${escaped})(\\s*=\\s*)(-?\\d+(?:\\.\\d+)?)(\\s*;)`, "m")
  const formatted = Number.isInteger(newValue) ? String(newValue) : String(Number(newValue.toFixed(3)))
  return source.replace(pattern, (_match, indent, name, eq, _old, semi) => `${indent}${name}${eq}${formatted}${semi}`)
}

/**
 * Builds a small standalone OpenSCAD script that renders just ONE
 * component: every variable/module/color definition from the shared
 * preamble (everything above the assembly block), plus a single call to
 * that component's own render_<id>() module. The component's own
 * translate()/rotate() calls (baked in by the generator) mean the result
 * is already positioned correctly in world space, so no extra transform
 * math is needed here.
 *
 * Returns null if the component's render module can't be found, so the
 * caller can skip/fall back gracefully instead of rendering broken code.
 */
export function extractComponentSource(source: string, componentId: string): string | null {
  const startIndex = source.indexOf(ASSEMBLY_START)
  const preamble = startIndex === -1 ? source : source.slice(0, startIndex)

  const moduleName = `render_${componentId}`
  if (!new RegExp(`module\\s+${moduleName}\\s*\\(`).test(preamble)) {
    return null
  }

  return `${preamble}\n${moduleName}();\n`
}
