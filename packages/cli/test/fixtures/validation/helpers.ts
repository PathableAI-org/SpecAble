import type { Primitive } from "@specable/domain"

import { PrimitiveBase } from "@specable/domain"
import { Effect, Option } from "effect"

import { buildGraphIndex, type ProductGraph } from "../../../src/graph/ProductGraph.js"

export const validationFixtures = {
  activeFail: "active-fail",
  brokenRef: "broken-ref",
  draftWarn: "draft-warn",
  valid: "valid"
} as const

export const makeTestGraph = (
  primitives: readonly Primitive[],
  projectPath = "/tmp/specable-test-graph"
): ProductGraph => {
  const index = Effect.runSync(buildGraphIndex([...primitives]))

  return {
    index,
    metadata: Option.none(),
    primitives: [...primitives],
    projectPath
  }
}

export const ids = {
  actorCoach: PrimitiveBase.makePrimitiveId("actor-coach"),
  actorIncomplete: PrimitiveBase.makePrimitiveId("actor-incomplete"),
  capSchedule: PrimitiveBase.makePrimitiveId("cap-schedule"),
  objDraft: PrimitiveBase.makePrimitiveId("obj-draft"),
  resultScheduled: PrimitiveBase.makePrimitiveId("result-scheduled"),
  storyA: PrimitiveBase.makePrimitiveId("story-a"),
  storyB: PrimitiveBase.makePrimitiveId("story-b"),
  workflowScheduling: PrimitiveBase.makePrimitiveId("workflow-scheduling")
} as const
