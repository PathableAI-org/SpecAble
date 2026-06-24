import { Schema } from "@effect/schema"

import { ReferenceRole } from "./unions/ReferenceRole.js"

export const ReferenceObject = Schema.Struct({
  id: Schema.String.annotations({
    description: "Target primitive identifier within the graph project",
    identifier: "ReferenceId",
    title: "Reference ID"
  }),
  role: Schema.optional(ReferenceRole)
}).annotations({
  description: "Object-shaped reference with optional role metadata",
  identifier: "ReferenceObject",
  title: "Typed Reference"
})

export type ReferenceObject = typeof ReferenceObject.Type

export const Reference = Schema.Union(
  Schema.String.annotations({
    description: "Shorthand string reference to a primitive identifier",
    identifier: "ReferenceIdString",
    title: "Reference ID"
  }),
  ReferenceObject
).annotations({
  description: "Primitive reference as a string ID or typed reference object",
  identifier: "Reference",
  title: "Reference"
})

export type Reference = typeof Reference.Type

export const ReferenceArray = Schema.Array(Reference).annotations({
  description: "Ordered list of primitive references",
  identifier: "ReferenceArray",
  title: "Reference List"
})

export type ReferenceArray = typeof ReferenceArray.Type
