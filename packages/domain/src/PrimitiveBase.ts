import { Schema } from "@effect/schema"

import { PersonaConfidence } from "./unions/PersonaConfidence.js"
import { Status } from "./unions/Status.js"

export const PrimitiveId = Schema.String.annotations({
  description: "Stable, globally unique identifier within the graph project",
  documentation:
    "Primitive IDs are the durable link targets used by references. Prefer lowercase, stable IDs such as `cap-schedule-session` over display names.",
  examples: ["obj-improve-coach-utilization", "cap-schedule-session"],
  identifier: "PrimitiveIdString",
  title: "Primitive ID"
}).pipe(Schema.brand("PrimitiveId"))

export type PrimitiveId = typeof PrimitiveId.Type

export const makePrimitiveId = (value: string): PrimitiveId => PrimitiveId.make(value)

export const PrimitiveName = Schema.String.annotations({
  description: "Display name used in summaries and story templates",
  documentation: "Names are human-facing labels and are not used as graph identifiers.",
  examples: ["Improve coach utilization", "Schedule coaching session"],
  identifier: "PrimitiveName",
  title: "Primitive Name"
})

export const PrimitiveBaseFields = {
  confidence: Schema.optional(
    PersonaConfidence.annotations({
      description: "Evidence confidence for primitives that capture user or persona assumptions",
      documentation: "Primarily used by Persona primitives; validation may treat Hypothesis confidence as less strict.",
      identifier: "PrimitiveConfidence",
      title: "Confidence"
    })
  ),
  description: Schema.optional(
    Schema.String.annotations({
      description: "Human-readable description of the primitive",
      documentation:
        "Use this for concise product meaning. It should clarify the primitive without becoming the source of relationships.",
      examples: ["Reduce manual coordination work by helping coaches keep session schedules current."],
      identifier: "PrimitiveDescription",
      title: "Description"
    })
  ),
  evidence: Schema.optional(
    Schema.String.annotations({
      description: "Artifact or reference supporting the primitive",
      documentation:
        "Use synthetic or local references in fixtures; do not include secrets or private production data.",
      examples: ["Discovery interview synthesis, 2026-06-24"],
      identifier: "PrimitiveEvidence",
      title: "Evidence"
    })
  ),
  id: PrimitiveId,
  name: PrimitiveName,
  notes: Schema.optional(
    Schema.String.annotations({
      description: "Additional free-form notes",
      documentation: "Notes are supplementary and should not carry required graph relationships.",
      examples: ["Needs validation with the implementation team before moving to Active."],
      identifier: "PrimitiveNotes",
      title: "Notes"
    })
  ),
  status: Status.annotations({
    description: "Lifecycle status controlling validation strictness for this primitive",
    documentation:
      "Draft primitives can be incomplete, Active primitives must satisfy relationship rules, and Deprecated primitives are ignored unless still referenced by Active primitives.",
    identifier: "PrimitiveStatus",
    title: "Status"
  }),
  tags: Schema.optional(
    Schema.Array(Schema.String).annotations({
      description: "Optional categorization tags",
      documentation: "Tags help group primitives in reports; they are not relationship edges.",
      examples: [["scheduling", "coach-ops"]],
      identifier: "PrimitiveTags",
      title: "Tags"
    })
  )
} satisfies Schema.Struct.Fields

export const PrimitiveBase = Schema.Struct(PrimitiveBaseFields).annotations({
  description: "Shared metadata fields for all product primitives",
  documentation:
    "Every primitive carries stable identity, human labels, lifecycle status, and optional evidence metadata.",
  examples: [
    {
      description: "Reduce manual schedule coordination for coaches.",
      id: makePrimitiveId("cap-schedule-session"),
      name: "Schedule coaching session",
      status: "Active",
      tags: ["scheduling"]
    }
  ],
  identifier: "PrimitiveBase",
  title: "Primitive Base"
})

export type PrimitiveBase = typeof PrimitiveBase.Type
