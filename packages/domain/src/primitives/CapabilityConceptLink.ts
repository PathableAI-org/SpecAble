import { Schema } from "@effect/schema"

import { graphJsonSchema, graphNode, primitiveTypeLiteral, relationship } from "../GraphAnnotations.js"
import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { Reference } from "../Reference.js"
import { ConceptImportance } from "../unions/ConceptImportance.js"
import { ConceptRole } from "../unions/ConceptRole.js"

export const CapabilityConceptLink = Schema.Struct({
  type: primitiveTypeLiteral("CapabilityConceptLink"),
  ...PrimitiveBaseFields,
  capability: Schema.optional(
    Reference.annotations(
      relationship({
        cardinality: "one",
        description: "Capability whose interaction with a domain concept is being classified",
        from: "CapabilityConceptLink",
        identifier: "CapabilityConceptLinkCapability",
        requiredWhenActive: true,
        role: "classifies-capability",
        title: "Capability",
        to: "Capability"
      })
    )
  ),
  domainConcept: Schema.optional(
    Reference.annotations(
      relationship({
        cardinality: "one",
        description: "Domain concept involved in the classified capability interaction",
        from: "CapabilityConceptLink",
        identifier: "CapabilityConceptLinkDomainConcept",
        requiredWhenActive: true,
        role: "classifies-concept",
        title: "Domain Concept",
        to: "DomainConcept"
      })
    )
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
  jsonSchema: graphJsonSchema(graphNode("CapabilityConceptLink")),
  title: "Capability Concept Link"
})

export type CapabilityConceptLink = typeof CapabilityConceptLink.Type
