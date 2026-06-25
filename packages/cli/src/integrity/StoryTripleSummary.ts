import type { ProductGraph } from "../graph/ProductGraph.js"
import type { ValidationFinding } from "../validation/ValidationFinding.js"
import type { StoryTripleConflict } from "./IntegrityFinding.js"

import { referenceId } from "../validation/ReferenceUtils.js"

const tripleKey = (actorId: string, capabilityId: string, expectedResultId: string): string =>
  `${actorId}|${capabilityId}|${expectedResultId}`

export const buildStoryTripleSummary = (
  graph: ProductGraph,
  validationFailures: readonly ValidationFinding[]
): readonly StoryTripleConflict[] => {
  const duplicateStoryIds = new Set(
    validationFailures
      .filter((finding) => finding.code === "duplicate-story-triple")
      .map((finding) => finding.primitiveId)
  )

  if (duplicateStoryIds.size === 0) {
    return []
  }

  const conflicts = new Map<string, StoryTripleConflict>()

  for (const primitive of graph.primitives) {
    if (
      primitive.type !== "Story" ||
      primitive.status !== "Active" ||
      !duplicateStoryIds.has(primitive.id) ||
      primitive.actor === undefined ||
      primitive.capability === undefined ||
      primitive.expectedResult === undefined
    ) {
      continue
    }

    const actorId = referenceId(primitive.actor)
    const capabilityId = referenceId(primitive.capability)
    const expectedResultId = referenceId(primitive.expectedResult)
    const key = tripleKey(actorId, capabilityId, expectedResultId)
    const existing = conflicts.get(key)

    if (existing === undefined) {
      conflicts.set(key, {
        actorId,
        capabilityId,
        expectedResultId,
        storyIds: [primitive.id]
      })
      continue
    }

    conflicts.set(key, {
      ...existing,
      storyIds: [...existing.storyIds, primitive.id].sort()
    })
  }

  return [...conflicts.values()].sort((left, right) =>
    left.actorId.localeCompare(right.actorId) ||
    left.capabilityId.localeCompare(right.capabilityId) ||
    left.expectedResultId.localeCompare(right.expectedResultId)
  )
}
