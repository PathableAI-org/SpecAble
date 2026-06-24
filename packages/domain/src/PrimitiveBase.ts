import { Schema } from "@effect/schema"

import { PersonaConfidence } from "./unions/PersonaConfidence.js"
import { Status } from "./unions/Status.js"

export const PrimitiveId = Schema.String.annotations({
  description: "Stable, globally unique identifier within the graph project",
  identifier: "PrimitiveId",
  title: "Primitive ID"
})

export const PrimitiveName = Schema.String.annotations({
  description: "Display name used in summaries and story templates",
  identifier: "PrimitiveName",
  title: "Primitive Name"
})

export const PrimitiveBaseFields = {
  confidence: Schema.optional(PersonaConfidence),
  description: Schema.optional(
    Schema.String.annotations({
      description: "Human-readable description of the primitive",
      identifier: "PrimitiveDescription",
      title: "Description"
    })
  ),
  evidence: Schema.optional(
    Schema.String.annotations({
      description: "Artifact or reference supporting the primitive",
      identifier: "PrimitiveEvidence",
      title: "Evidence"
    })
  ),
  id: PrimitiveId,
  name: PrimitiveName,
  notes: Schema.optional(
    Schema.String.annotations({
      description: "Additional free-form notes",
      identifier: "PrimitiveNotes",
      title: "Notes"
    })
  ),
  status: Status,
  tags: Schema.optional(
    Schema.Array(Schema.String).annotations({
      description: "Optional categorization tags",
      identifier: "PrimitiveTags",
      title: "Tags"
    })
  )
} satisfies Schema.Struct.Fields

export const PrimitiveBase = Schema.Struct(PrimitiveBaseFields).annotations({
  description: "Shared metadata fields for all product primitives",
  identifier: "PrimitiveBase",
  title: "Primitive Base"
})

export type PrimitiveBase = typeof PrimitiveBase.Type
