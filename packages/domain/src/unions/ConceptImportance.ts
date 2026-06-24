import { Schema } from "@effect/schema"

import { valueDescriptionsJsonSchema } from "../GraphAnnotations.js"

export const ConceptImportance = Schema.Literal("Primary", "Secondary", "Supporting").annotations({
  description: "Relative importance of a domain concept within a capability concept link",
  documentation:
    "Allowed values:\n- `Primary`: core concept required to understand or execute the capability.\n- `Secondary`: important but not central to the capability.\n- `Supporting`: contextual or supplementary concept.",
  examples: ["Primary", "Supporting"],
  identifier: "ConceptImportance",
  jsonSchema: valueDescriptionsJsonSchema({
    Primary: "Core concept required to understand or execute the capability.",
    Secondary: "Important concept but not the main object of the capability.",
    Supporting: "Contextual or supplementary concept."
  }),
  title: "Concept Importance"
})

export type ConceptImportance = typeof ConceptImportance.Type
