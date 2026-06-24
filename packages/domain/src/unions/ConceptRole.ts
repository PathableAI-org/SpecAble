import { Schema } from "@effect/schema"

import { valueDescriptionsJsonSchema } from "../GraphAnnotations.js"

export const ConceptRole = Schema.Literal(
  "Reads",
  "Creates",
  "Updates",
  "Deletes",
  "References",
  "Attaches",
  "Summarizes",
  "Approves",
  "Exports"
).annotations({
  description: "How a capability relates to a domain concept in a capability concept link",
  documentation:
    "Allowed values:\n- `Reads`: consumes or views an existing concept.\n- `Creates`: creates a new concept instance.\n- `Updates`: changes an existing concept instance.\n- `Deletes`: removes or retires a concept instance.\n- `References`: links to or cites a concept without changing it.\n- `Attaches`: associates a concept or artifact with another entity.\n- `Summarizes`: produces a summary of the concept.\n- `Approves`: reviews or authorizes the concept.\n- `Exports`: emits the concept outside the current system boundary.",
  examples: ["Reads", "Creates", "Updates"],
  identifier: "ConceptRole",
  jsonSchema: valueDescriptionsJsonSchema({
    Approves: "Reviews or authorizes the concept.",
    Attaches: "Associates a concept or artifact with another entity.",
    Creates: "Creates a new concept instance.",
    Deletes: "Removes or retires a concept instance.",
    Exports: "Emits the concept outside the current system boundary.",
    Reads: "Consumes or views an existing concept.",
    References: "Links to or cites a concept without changing it.",
    Summarizes: "Produces a summary of the concept.",
    Updates: "Changes an existing concept instance."
  }),
  title: "Capability Concept Role"
})

export type ConceptRole = typeof ConceptRole.Type
