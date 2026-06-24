import { Schema } from "@effect/schema"

export const ReferenceRole = Schema.Literal("Primary", "Supporting").annotations({
  description: "Role metadata on actor references, e.g. Primary Actor links from personas and workflows",
  identifier: "ReferenceRole",
  title: "Reference Role"
})

export type ReferenceRole = typeof ReferenceRole.Type
