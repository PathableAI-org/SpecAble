import { Schema } from "@effect/schema"

import { graphJsonSchema, graphNode, primitiveTypeLiteral, relationship } from "../GraphAnnotations.js"
import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { Reference, ReferenceArray } from "../Reference.js"

export const Story = Schema.Struct({
  type: primitiveTypeLiteral("Story"),
  ...PrimitiveBaseFields,
  actor: Schema.optional(
    Reference.annotations(
      relationship({
        cardinality: "one",
        description: "Actor who wants or performs the story behavior",
        from: "Story",
        identifier: "StoryActor",
        requiredWhenActive: true,
        role: "as-a",
        title: "Actor",
        to: "Actor"
      })
    )
  ),
  capability: Schema.optional(
    Reference.annotations(
      relationship({
        cardinality: "one",
        description: "Capability that enables the story behavior",
        from: "Story",
        identifier: "StoryCapability",
        requiredWhenActive: true,
        role: "can",
        title: "Capability",
        to: "Capability"
      })
    )
  ),
  expectedResult: Schema.optional(
    Reference.annotations(
      relationship({
        cardinality: "one",
        description: "Expected result or benefit produced by the story",
        from: "Story",
        identifier: "StoryExpectedResult",
        requiredWhenActive: true,
        role: "so-that",
        title: "Expected Result",
        to: "ExpectedResult"
      })
    )
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
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Workflows this story demonstrates or belongs to",
        from: "Story",
        identifier: "StoryWorkflows",
        role: "belongs-to",
        title: "Workflows",
        to: "Workflow"
      })
    )
  )
}).annotations({
  description: "Human-readable planning artifact derived from actor, capability, and expected result",
  documentation:
    "Stories provide a deterministic human artifact over graph links. The actor-capability-expected result triple is the source of generated text.",
  examples: [
    {
      actor: "actor-care-coach",
      capability: "cap-schedule-session",
      expectedResult: "result-less-manual-scheduling",
      id: "story-coach-schedules-session",
      name: "Coach schedules session",
      status: "Active",
      text: "As a Care coach, I can schedule a coaching session so that session coordination takes less manual work.",
      type: "Story",
      workflows: ["workflow-session-scheduling"]
    }
  ],
  identifier: "Story",
  jsonSchema: graphJsonSchema(graphNode("Story")),
  title: "Story"
})

export type Story = typeof Story.Type
