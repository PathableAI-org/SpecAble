import type { Story } from "@specable/domain"

import type { PrimitiveId, ProductGraph } from "../graph/ProductGraph.js"

import { referenceId } from "../validation/ReferenceUtils.js"

export interface StoryTextResult {
  readonly actorId: PrimitiveId
  readonly capabilityId: PrimitiveId
  readonly expectedResultId: PrimitiveId
  readonly generated: boolean
  readonly text: string
  readonly textSource: StoryTextSource
}

export type StoryTextSource = "generated" | "stored"

const isUsableDisplayName = (name: string | undefined): name is string => {
  if (name === undefined) {
    return false
  }

  return name.trim().length > 0
}

export const displayNameFor = (graph: ProductGraph, primitiveId: PrimitiveId): string => {
  const primitive = graph.index.nodes.get(primitiveId)

  if (primitive === undefined) {
    return primitiveId
  }

  return isUsableDisplayName(primitive.name) ? primitive.name.trim() : primitiveId
}

export const generateStoryText = (
  graph: ProductGraph,
  story: Story
): string | undefined => {
  if (story.actor === undefined || story.capability === undefined || story.expectedResult === undefined) {
    return undefined
  }

  const actorId = referenceId(story.actor)
  const capabilityId = referenceId(story.capability)
  const expectedResultId = referenceId(story.expectedResult)

  const actorLabel = displayNameFor(graph, actorId)
  const capabilityLabel = displayNameFor(graph, capabilityId)
  const expectedResultLabel = displayNameFor(graph, expectedResultId)

  return `As a ${actorLabel}, I can ${capabilityLabel} so that ${expectedResultLabel}.`
}

export const resolveStoryText = (graph: ProductGraph, story: Story): StoryTextResult | undefined => {
  if (story.actor === undefined || story.capability === undefined || story.expectedResult === undefined) {
    return undefined
  }

  const actorId = referenceId(story.actor)
  const capabilityId = referenceId(story.capability)
  const expectedResultId = referenceId(story.expectedResult)

  if (isUsableDisplayName(story.text)) {
    return {
      actorId,
      capabilityId,
      expectedResultId,
      generated: false,
      text: story.text.trim(),
      textSource: "stored"
    }
  }

  const generated = generateStoryText(graph, story)

  if (generated === undefined) {
    return undefined
  }

  return {
    actorId,
    capabilityId,
    expectedResultId,
    generated: true,
    text: generated,
    textSource: "generated"
  }
}

/** Escape primitive IDs for safe inclusion in HTML comment metadata tokens. */
export const sanitizeStoryMetadataToken = (value: string): string =>
  value
    .replace(/[\0\r\n]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

export const formatStoryMetadataComment = (
  storyId: PrimitiveId,
  result: StoryTextResult
): string => {
  const safeStoryId = sanitizeStoryMetadataToken(storyId)
  const safeActorId = sanitizeStoryMetadataToken(result.actorId)
  const safeCapabilityId = sanitizeStoryMetadataToken(result.capabilityId)
  const safeExpectedResultId = sanitizeStoryMetadataToken(result.expectedResultId)

  return `<!-- specable:story ${safeStoryId} generated=${result.generated} actor=${safeActorId} capability=${safeCapabilityId} expectedResult=${safeExpectedResultId} -->`
}
