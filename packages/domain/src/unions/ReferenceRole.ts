import { Schema } from "@effect/schema"

export const ReferenceRole = Schema.Literal("Primary", "Supporting").annotations({
  description: "Role metadata on actor references, e.g. Primary Actor links from personas and workflows",
  documentation:
    "Allowed values:\n- `Primary`: the main target for the relationship.\n- `Supporting`: an additional or contextual target for the relationship.",
  examples: ["Primary", "Supporting"],
  identifier: "ReferenceRole",
  title: "Reference Role"
})

export type ReferenceRole = typeof ReferenceRole.Type
