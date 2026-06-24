import { Schema } from "@effect/schema"

import { makePrimitiveId } from "../PrimitiveBase.js"
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
  documentation:
    "Allowed values:\n- `Objective`: why work matters.\n- `Actor`: participant in product behavior.\n- `Persona`: evidence-backed archetype.\n- `DomainConcept`: product/domain vocabulary item.\n- `Capability`: reusable operational ability.\n- `CapabilityConceptLink`: operation-level capability-to-concept join.\n- `ExpectedResult`: observable changed state.\n- `Workflow`: operational sequence.\n- `Story`: human-readable actor/capability/result artifact.",
  examples: ["Objective", "Capability", "Story"],
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
  documentation:
    "Use this schema when decoding a primitive after the loader has selected a candidate object with a `type` discriminator.",
  examples: [
    {
      expectedResults: [makePrimitiveId("result-less-manual-scheduling")],
      id: makePrimitiveId("obj-improve-coach-utilization"),
      name: "Improve coach utilization",
      status: "Active",
      type: "Objective"
    },
    {
      actor: makePrimitiveId("actor-care-coach"),
      capability: makePrimitiveId("cap-schedule-session"),
      expectedResult: makePrimitiveId("result-less-manual-scheduling"),
      id: makePrimitiveId("story-coach-schedules-session"),
      name: "Coach schedules session",
      status: "Active",
      type: "Story"
    }
  ],
  identifier: "Primitive",
  title: "Product Primitive"
})

export type Primitive = typeof Primitive.Type

export { Actor, Capability, CapabilityConceptLink, DomainConcept, ExpectedResult, Objective, Persona, Story, Workflow }
