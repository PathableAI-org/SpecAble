import { Schema } from "@effect/schema"

import { valueDescriptionsJsonSchema } from "../GraphAnnotations.js"

export const PersonaConfidence = Schema.Literal("Hypothesis", "Validated", "Confirmed").annotations({
  description: "Evidence confidence for a persona; Hypothesis exempts evidence requirements during validation",
  documentation:
    "Allowed values:\n- `Hypothesis`: plausible but not yet supported by direct evidence.\n- `Validated`: supported by research, interviews, analytics, or comparable evidence.\n- `Confirmed`: repeatedly validated and treated as durable product knowledge.",
  examples: ["Hypothesis", "Validated"],
  identifier: "PersonaConfidence",
  jsonSchema: valueDescriptionsJsonSchema({
    Confirmed: "Repeatedly validated and treated as durable product knowledge.",
    Hypothesis: "Plausible but not yet supported by direct evidence.",
    Validated: "Supported by research, interviews, analytics, or comparable evidence."
  }),
  title: "Persona Confidence"
})

export type PersonaConfidence = typeof PersonaConfidence.Type
