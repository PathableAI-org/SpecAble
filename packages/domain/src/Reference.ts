import { Schema } from "@effect/schema"

import { graphField, graphJsonSchema } from "./GraphAnnotations.js"
import { ReferenceRole } from "./unions/ReferenceRole.js"

export const ReferenceObject = Schema.Struct({
  id: Schema.String.annotations({
    description: "Target primitive identifier within the graph project",
    documentation: "Matches the `id` field on another primitive in the same graph project.",
    examples: ["actor-care-coach", "cap-schedule-session"],
    identifier: "ReferenceId",
    jsonSchema: graphJsonSchema(graphField("Reference", "target-id")),
    title: "Reference ID"
  }),
  role: Schema.optional(
    ReferenceRole.annotations({
      description: "Optional role qualifier for the referenced primitive in this relationship",
      documentation:
        "Use role metadata when the same relationship field can distinguish primary from supporting targets.",
      identifier: "ReferenceObjectRole",
      jsonSchema: graphJsonSchema(graphField("Reference", "relationship-role")),
      title: "Reference Role"
    })
  )
}).annotations({
  description: "Object-shaped reference with optional role metadata",
  documentation: "Use object references when an edge needs role metadata; otherwise a string ID is sufficient.",
  examples: [
    {
      id: "actor-care-coach",
      role: "Primary"
    }
  ],
  identifier: "ReferenceObject",
  jsonSchema: graphJsonSchema(graphField("Reference", "typed-reference")),
  title: "Typed Reference"
})

export type ReferenceObject = typeof ReferenceObject.Type

export const Reference = Schema.Union(
  Schema.String.annotations({
    description: "Shorthand string reference to a primitive identifier",
    documentation: "Use this compact form when the edge does not need additional role metadata.",
    examples: ["actor-care-coach"],
    identifier: "ReferenceIdString",
    jsonSchema: graphJsonSchema(graphField("Reference", "shorthand-reference")),
    title: "Reference ID"
  }),
  ReferenceObject
).annotations({
  description: "Primitive reference as a string ID or typed reference object",
  documentation: "References are resolved by the graph loader and validated against known primitive IDs.",
  examples: ["cap-schedule-session", { id: "actor-care-coach", role: "Primary" }],
  identifier: "Reference",
  jsonSchema: graphJsonSchema(graphField("Reference", "primitive-reference")),
  title: "Reference"
})

export type Reference = typeof Reference.Type

export const ReferenceArray = Schema.Array(Reference).annotations({
  description: "Ordered list of primitive references",
  documentation:
    "A reusable shape for relationship fields. Field-level annotations on primitive schemas define the edge meaning.",
  examples: [["actor-care-coach", "actor-client"]],
  identifier: "ReferenceArray",
  jsonSchema: graphJsonSchema(graphField("Reference", "reference-list")),
  title: "Reference List"
})

export type ReferenceArray = typeof ReferenceArray.Type
