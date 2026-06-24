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
  identifier: "ConceptRole",
  title: "Capability Concept Role"
})

export type ConceptRole = typeof ConceptRole.Type
