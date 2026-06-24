import { Schema } from "@effect/schema"

import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { Reference } from "../Reference.js"
import { ConceptImportance } from "../unions/ConceptImportance.js"
import { ConceptRole } from "../unions/ConceptRole.js"

export const CapabilityConceptLink = Schema.Struct({
  type: Schema.Literal("CapabilityConceptLink").annotations({
    description: "Discriminator value identifying this primitive as Capability Concept Link",
    documentation: "Use `CapabilityConceptLink` in the `type` field only for Capability Concept Link primitives.",
    examples: ["CapabilityConceptLink"],
    identifier: "CapabilityConceptLinkType",
    title: "Capability Concept Link Type"
  }),
  ...PrimitiveBaseFields,
  capability: Schema.optional(
    Reference.annotations({
      description: "Capability whose interaction with a domain concept is being classified",
      documentation:
        "Relationship field: CapabilityConceptLink.capability references one Capability primitive. Required when the link is Active.",
      identifier: "CapabilityConceptLinkCapability",
      title: "Capability"
    })
  ),
  domainConcept: Schema.optional(
    Reference.annotations({
      description: "Domain concept involved in the classified capability interaction",
      documentation:
        "Relationship field: CapabilityConceptLink.domainConcept references one DomainConcept primitive. Required when the link is Active.",
      identifier: "CapabilityConceptLinkDomainConcept",
      title: "Domain Concept"
    })
  ),
  importance: Schema.optional(
    ConceptImportance.annotations({
      description: "Relative importance of this concept to the linked capability",
      documentation: "Use Primary for concepts central to the capability; Supporting for contextual concepts.",
      identifier: "CapabilityConceptLinkImportance",
      title: "Importance"
    })
  ),
  role: Schema.optional(
    ConceptRole.annotations({
      description: "Operation the linked capability performs against the linked domain concept",
      documentation: "Examples include reading, creating, updating, summarizing, approving, or exporting the concept.",
      identifier: "CapabilityConceptLinkRole",
      title: "Concept Role"
    })
  )
}).annotations({
  description: "Typed join between a capability and a domain concept",
  documentation:
    "Use this primitive when the relationship between a capability and domain concept needs operation-level semantics.",
  examples: [
    {
      capability: makePrimitiveId("cap-schedule-session"),
      domainConcept: makePrimitiveId("concept-session"),
      id: makePrimitiveId("link-schedule-session-creates-session"),
      importance: "Primary",
      name: "Schedule session creates session",
      role: "Creates",
      status: "Active",
      type: "CapabilityConceptLink"
    }
  ],
  identifier: "CapabilityConceptLink",
  title: "Capability Concept Link"
})

export type CapabilityConceptLink = typeof CapabilityConceptLink.Type
