import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

export const runtime = "nodejs"

// "gemini-flash-latest" is Google's official rolling alias for their
// current recommended fast/free-tier-eligible Gemini model, so the app
// keeps working as Google ships new model versions. Override with
// GEMINI_MODEL to pin a specific stable model (e.g. "gemini-2.5-flash").
const DEFAULT_GEMINI_MODEL = "gemini-flash-latest"

// Retry a small, fixed number of times on transient failures (rate limits /
// transient server errors) with exponential backoff, capped so we stay well
// inside typical serverless function time limits.
const MAX_ATTEMPTS = 3
const BASE_DELAY_MS = 500

const SYSTEM_PROMPT = `You are an expert OpenSCAD programmer. Convert the user's description of a 3D-printable object into a single, complete, valid OpenSCAD script that is ALSO structured so its individual parts can be edited independently in a UI (sliders per part).

Output rules:
- Output ONLY raw OpenSCAD code. No markdown code fences, no explanations, no comments other than the structural ones described below.
- The script must be self-contained and renderable as-is by the OpenSCAD WebAssembly CLI: only core language features (cube, sphere, cylinder, polyhedron, linear_extrude, rotate_extrude, hull, minkowski, CSG booleans, transformations, modules/functions, for loops, etc). No "include"/"use" of external files.
- Choose sensible real-world millimeter dimensions. Use the user's explicit measurements exactly when given.
- Make sure the final geometry is manifold (watertight solids) so it exports cleanly to STL.
- If a shape needs a dense repeated pattern of holes/cutouts (e.g. a perforated grid), build that pattern in 2D (circle/square + difference()) and linear_extrude() it ONCE, rather than subtracting many individual 3D solids — 2D booleans are dramatically cheaper and this avoids slow renders.

Structural rules (REQUIRED — these let the UI expose sliders per part):
1. Break the object into logical, independently-meaningful components (e.g. "tabletop", "leg_1", "seat", "backrest", "base_plate" — whatever the object naturally has). Every component that a user could plausibly want to resize independently must be its own component.
2. For every tunable dimension of a component, declare it as its own top-level variable, and immediately above the FIRST such variable for that component, add exactly one line: \`// @component <id> "<Display Name>"\` where <id> is a short lowercase snake_case identifier unique in the file. Every variable belonging to that component must immediately follow (one @component header covers all the variables under it, until the next @component header).
3. Annotate EVERY tunable variable with a trailing comment in exactly this form (all four attributes required, on one line, no line breaks):
   \`variable_name = 123; // @param label="Human Label" min=50 max=500 step=5\`
   Pick min/max that give a sensible, safe editing range around the current value (never let min go to 0 or negative for a physical dimension unless that's meaningful). Use a step that's a sensible increment for that dimension (e.g. 1 or 5 for mm lengths, 1 for small radii).
4. Define one module per component named exactly \`render_<id>()\` (matching the id used in its @component header) that draws ONLY that component, fully positioned in world space (bake in its own translate()/rotate() — do not rely on being wrapped in a positioning transform by the caller). Put all of these render_<id>() module definitions, and any shared/helper modules, functions, colors, and variables, BEFORE the assembly block described next.
5. At the very end of the file, add the assembly block wrapped exactly between these two marker comment lines (verbatim, each on its own line):
   // === ASSEMBLY START ===
   // === ASSEMBLY END ===
   Inside it, put ONLY calls to the render_<id>() modules (nothing else — no new geometry, no new variables). This block must be a valid, complete rendering of the whole object when run as-is.
6. Do not reference a component's private variables in another component's module. If two parts must always match (e.g. all four legs the same height), share ONE variable between their render_<id>() modules rather than duplicating it — but still give it a single @component/@param annotation under whichever component you consider its "owner".

Worked example — "A rectangular table, 1000mm long, 600mm wide, 750mm high, 50mm tabletop, four cylindrical legs":

table_length = 1000;
table_width = 600;
table_height = 750;

// @component tabletop "Tabletop"
tabletop_thickness = 50; // @param label="Thickness" min=20 max=100 step=5

// @component leg_1 "Front Left Leg"
leg_1_height = 700; // @param label="Height" min=400 max=900 step=5
leg_1_radius = 25; // @param label="Radius" min=10 max=60 step=1

// @component leg_2 "Front Right Leg"
leg_2_height = 700; // @param label="Height" min=400 max=900 step=5
leg_2_radius = 25; // @param label="Radius" min=10 max=60 step=1

// @component leg_3 "Back Left Leg"
leg_3_height = 700; // @param label="Height" min=400 max=900 step=5
leg_3_radius = 25; // @param label="Radius" min=10 max=60 step=1

// @component leg_4 "Back Right Leg"
leg_4_height = 700; // @param label="Height" min=400 max=900 step=5
leg_4_radius = 25; // @param label="Radius" min=10 max=60 step=1

leg_inset = 60;

module render_tabletop() {
    translate([0, 0, leg_1_height])
        cube([table_length, table_width, tabletop_thickness], center = false);
}

module render_leg_1() {
    translate([leg_inset, leg_inset, 0])
        cylinder(h = leg_1_height, r = leg_1_radius, $fn = 32);
}

module render_leg_2() {
    translate([table_length - leg_inset, leg_inset, 0])
        cylinder(h = leg_2_height, r = leg_2_radius, $fn = 32);
}

module render_leg_3() {
    translate([leg_inset, table_width - leg_inset, 0])
        cylinder(h = leg_3_height, r = leg_3_radius, $fn = 32);
}

module render_leg_4() {
    translate([table_length - leg_inset, table_width - leg_inset, 0])
        cylinder(h = leg_4_height, r = leg_4_radius, $fn = 32);
}

// === ASSEMBLY START ===
render_tabletop();
render_leg_1();
render_leg_2();
render_leg_3();
render_leg_4();
// === ASSEMBLY END ===

Follow this convention exactly for whatever object is described, choosing components and parameters that make sense for that object (a chair has different parts than a bracket or a building — decide sensibly).`

export async function POST(request: NextRequest) {
  let description: unknown
  try {
    const body = await request.json()
    description = body?.description
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "A model description is required." }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing the GEMINI_API_KEY environment variable." },
      { status: 500 },
    )
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
  const ai = new GoogleGenAI({ apiKey })

  try {
    const response = await generateWithRetry(ai, model, description.trim())

    const rawText = response.text ?? ""
    const code = stripCodeFences(rawText.trim())

    if (!code) {
      const blockReason = response.promptFeedback?.blockReason
      const finishReason = response.candidates?.[0]?.finishReason
      console.error("Gemini returned no usable text.", { blockReason, finishReason })
      return NextResponse.json(
        {
          error:
            blockReason || finishReason === "SAFETY"
              ? "The AI model declined to generate code for this description. Try rephrasing it."
              : "The AI model did not return any OpenSCAD code.",
        },
        { status: 502 },
      )
    }

    return NextResponse.json({ code })
  } catch (err) {
    return handleGeminiError(err)
  }
}

// Calls Gemini's generateContent, retrying a few times on rate limits (429)
// and transient server errors (500/503/504) with exponential backoff.
async function generateWithRetry(ai: GoogleGenAI, model: string, description: string) {
  let lastErr: unknown
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await ai.models.generateContent({
        model,
        contents: `Describe this as an OpenSCAD script:\n\n${description}`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          maxOutputTokens: 8192,
        },
      })
    } catch (err) {
      lastErr = err
      const status = getErrorStatus(err)
      const isRetryable = status !== undefined && [429, 500, 503, 504].includes(status)
      if (!isRetryable || attempt === MAX_ATTEMPTS - 1) {
        throw err
      }
      const delay = BASE_DELAY_MS * 2 ** attempt + Math.random() * 200
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  // Unreachable, but keeps TypeScript happy.
  throw lastErr
}

function getErrorStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status: unknown }).status
    if (typeof status === "number") return status
  }
  return undefined
}

function handleGeminiError(err: unknown) {
  const status = getErrorStatus(err)
  const message = err instanceof Error ? err.message : String(err)
  console.error("Gemini API error:", status ?? "unknown", message)

  if (status === 429) {
    return NextResponse.json(
      { error: "The AI model is rate-limited right now (free tier limit reached). Please wait a moment and try again." },
      { status: 429 },
    )
  }

  if (status === 401 || status === 403) {
    return NextResponse.json(
      { error: "The server's Gemini API key is missing or invalid." },
      { status: 500 },
    )
  }

  if (status !== undefined && status >= 400 && status < 500) {
    return NextResponse.json(
      { error: "The AI model failed to generate OpenSCAD code. Please try again." },
      { status: 502 },
    )
  }

  return NextResponse.json(
    { error: "Unexpected error while generating OpenSCAD code." },
    { status: 500 },
  )
}

// The model is instructed not to use markdown fences, but strip them
// defensively in case it does anyway.
function stripCodeFences(text: string): string {
  const fenced = text.match(/```(?:openscad|scad)?\n([\s\S]*?)```/i)
  return (fenced ? fenced[1] : text).trim()
}
