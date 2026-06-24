import { Schema } from "@effect/schema"

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
  title: "Capability Concept Role"
})

export type ConceptRole = typeof ConceptRole.Type
