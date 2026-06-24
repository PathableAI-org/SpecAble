import { Schema } from "@effect/schema"

export const ConceptImportance = Schema.Literal("Primary", "Secondary", "Supporting").annotations({
  description: "Relative importance of a domain concept within a capability concept link",
  documentation:
    "Allowed values:\n- `Primary`: core concept required to understand or execute the capability.\n- `Secondary`: important but not central to the capability.\n- `Supporting`: contextual or supplementary concept.",
  examples: ["Primary", "Supporting"],
  identifier: "ConceptImportance",
  title: "Concept Importance"
})

export type ConceptImportance = typeof ConceptImportance.Type
