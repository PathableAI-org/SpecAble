import { Schema } from "@effect/schema"

import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { Reference, ReferenceArray } from "../Reference.js"

export const Story = Schema.Struct({
  type: Schema.Literal("Story").annotations({
    description: "Discriminator value identifying this primitive as Story",
    documentation: "Use `Story` in the `type` field only for Story primitives.",
    examples: ["Story"],
    identifier: "StoryType",
    title: "Story Type"
  }),
  ...PrimitiveBaseFields,
  actor: Schema.optional(
    Reference.annotations({
      description: "Actor who wants or performs the story behavior",
      documentation:
        "Relationship field: Story.actor references one Actor primitive. Required when the Story is Active.",
      identifier: "StoryActor",
      title: "Actor"
    })
  ),
  capability: Schema.optional(
    Reference.annotations({
      description: "Capability that enables the story behavior",
      documentation:
        "Relationship field: Story.capability references one Capability primitive. Required when the Story is Active.",
      identifier: "StoryCapability",
      title: "Capability"
    })
  ),
  expectedResult: Schema.optional(
    Reference.annotations({
      description: "Expected result or benefit produced by the story",
      documentation:
        "Relationship field: Story.expectedResult references one ExpectedResult primitive. Required when the Story is Active.",
      identifier: "StoryExpectedResult",
      title: "Expected Result"
    })
  ),
  text: Schema.optional(
    Schema.String.annotations({
      description: "Stored story text; generated from linked primitives when absent",
      documentation:
        "When omitted, story generation can derive text from the actor, capability, and expected result links.",
      examples: [
        "As a Care coach, I can schedule a coaching session so that session coordination takes less manual work."
      ],
      identifier: "StoryText",
      title: "Story Text"
    })
  ),
  workflows: Schema.optional(
    ReferenceArray.annotations({
      description: "Workflows this story demonstrates or belongs to",
      documentation: "Relationship field: Story.workflows references Workflow primitives.",
      identifier: "StoryWorkflows",
      title: "Workflows"
    })
  )
}).annotations({
  description: "Human-readable planning artifact derived from actor, capability, and expected result",
  documentation:
    "Stories provide a deterministic human artifact over graph links. The actor-capability-expected result triple is the source of generated text.",
  examples: [
    {
      actor: makePrimitiveId("actor-care-coach"),
      capability: makePrimitiveId("cap-schedule-session"),
      expectedResult: makePrimitiveId("result-less-manual-scheduling"),
      id: makePrimitiveId("story-coach-schedules-session"),
      name: "Coach schedules session",
      status: "Active",
      text: "As a Care coach, I can schedule a coaching session so that session coordination takes less manual work.",
      type: "Story",
      workflows: [makePrimitiveId("workflow-session-scheduling")]
    }
  ],
  identifier: "Story",
  title: "Story"
})

export type Story = typeof Story.Type
