import { Schema } from "@effect/schema"

import { Actor } from "./Actor.js"
import { Capability } from "./Capability.js"
import { CapabilityConceptLink } from "./CapabilityConceptLink.js"
import { DomainConcept } from "./DomainConcept.js"
import { ExpectedResult } from "./ExpectedResult.js"
import { Objective } from "./Objective.js"
import { Persona } from "./Persona.js"
import { Story } from "./Story.js"
import { Workflow } from "./Workflow.js"

export const PrimitiveType = Schema.Literal(
  "Objective",
  "Actor",
  "Persona",
  "DomainConcept",
  "Capability",
  "CapabilityConceptLink",
  "ExpectedResult",
  "Workflow",
  "Story"
).annotations({
  description: "Discriminator for product primitive types in the canonical ontology",
  identifier: "PrimitiveType",
  title: "Primitive Type"
})

export type PrimitiveType = typeof PrimitiveType.Type

export const Primitive = Schema.Union(
  Objective,
  Actor,
  Persona,
  DomainConcept,
  Capability,
  CapabilityConceptLink,
  ExpectedResult,
  Workflow,
  Story
).annotations({
  description: "Union of all canonical product primitive schemas",
  identifier: "Primitive",
  title: "Product Primitive"
})

export type Primitive = typeof Primitive.Type

export { Actor, Capability, CapabilityConceptLink, DomainConcept, ExpectedResult, Objective, Persona, Story, Workflow }
