import { Schema } from "@effect/schema"

import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { Reference } from "../Reference.js"
import { ConceptImportance } from "../unions/ConceptImportance.js"
import { ConceptRole } from "../unions/ConceptRole.js"

export const CapabilityConceptLink = Schema.Struct({
  type: Schema.Literal("CapabilityConceptLink"),
  ...PrimitiveBaseFields,
  capability: Schema.optional(Reference),
  domainConcept: Schema.optional(Reference),
  importance: Schema.optional(ConceptImportance),
  role: Schema.optional(ConceptRole)
}).annotations({
  description: "Typed join between a capability and a domain concept",
  identifier: "CapabilityConceptLink",
  title: "Capability Concept Link"
})

export type CapabilityConceptLink = typeof CapabilityConceptLink.Type
