import type { PrimitiveBase } from "@specable/domain"
import type { PrimitiveType } from "@specable/domain"

import type { ProductGraph } from "../graph/ProductGraph.js"

import { type IntegrityFinding, sortIntegrityFindings } from "./IntegrityFinding.js"
import {
  jaccardSimilarity,
  LIKELY_DUPLICATE_JACCARD_THRESHOLD,
  normalizeDisplayName,
  wordTokens
} from "./NameNormalization.js"

const duplicateNameFinding = (
  primitiveType: PrimitiveType,
  primitiveId: PrimitiveBase.PrimitiveId,
  relatedIds: readonly PrimitiveBase.PrimitiveId[],
  normalizedName: string
): IntegrityFinding => ({
  code: "duplicate-name",
  field: "name",
  message: `Duplicate normalized name "${normalizedName}" within ${primitiveType}`,
  primitiveId,
  primitiveType,
  relatedIds,
  severity: "warning"
})

export const findDuplicateNames = (graph: ProductGraph): readonly IntegrityFinding[] => {
  const findings: IntegrityFinding[] = []

  for (const [primitiveType, ids] of graph.index.byType.entries()) {
    const byNormalizedName = new Map<string, PrimitiveBase.PrimitiveId[]>()

    for (const primitiveId of ids) {
      const primitive = graph.index.nodes.get(primitiveId)

      if (primitive === undefined) {
        continue
      }

      const normalized = normalizeDisplayName(primitive.name)
      const group = byNormalizedName.get(normalized) ?? []
      group.push(primitiveId)
      byNormalizedName.set(normalized, group)
    }

    for (const [normalizedName, primitiveIds] of byNormalizedName.entries()) {
      if (primitiveIds.length < 2) {
        continue
      }

      for (const primitiveId of primitiveIds) {
        findings.push(
          duplicateNameFinding(
            primitiveType,
            primitiveId,
            primitiveIds.filter((id) => id !== primitiveId),
            normalizedName
          )
        )
      }
    }
  }

  return sortIntegrityFindings(findings)
}

const likelyDuplicateNameFinding = (
  primitiveType: PrimitiveType,
  primitiveId: PrimitiveBase.PrimitiveId,
  relatedId: PrimitiveBase.PrimitiveId,
  leftName: string,
  rightName: string,
  similarity: number
): IntegrityFinding => ({
  code: "likely-duplicate-name",
  field: "name",
  message: `Likely duplicate name (Jaccard ${
    similarity.toFixed(2)
  }) between "${leftName}" and "${rightName}" within ${primitiveType}`,
  primitiveId,
  primitiveType,
  relatedIds: [relatedId],
  severity: "warning"
})

const pairKeyForIds = (
  leftId: PrimitiveBase.PrimitiveId,
  rightId: PrimitiveBase.PrimitiveId
): string => [leftId, rightId].sort().join("|")

const likelyDuplicateSimilarity = (leftName: string, rightName: string): null | number => {
  const leftNormalized = normalizeDisplayName(leftName)
  const rightNormalized = normalizeDisplayName(rightName)

  if (leftNormalized === rightNormalized) {
    return null
  }

  const similarity = jaccardSimilarity(wordTokens(leftNormalized), wordTokens(rightNormalized))

  return similarity >= LIKELY_DUPLICATE_JACCARD_THRESHOLD ? similarity : null
}

const findingsForLikelyPair = (
  primitiveType: PrimitiveType,
  left: { readonly id: PrimitiveBase.PrimitiveId; readonly name: string },
  right: { readonly id: PrimitiveBase.PrimitiveId; readonly name: string },
  similarity: number
): readonly IntegrityFinding[] => [
  likelyDuplicateNameFinding(primitiveType, left.id, right.id, left.name, right.name, similarity),
  likelyDuplicateNameFinding(primitiveType, right.id, left.id, right.name, left.name, similarity)
]

// fallow-ignore-next-line complexity
const likelyDuplicateFindingsForType = (
  primitiveType: PrimitiveType,
  primitives: readonly { readonly id: PrimitiveBase.PrimitiveId; readonly name: string }[],
  reportedPairs: Set<string>
): readonly IntegrityFinding[] => {
  const findings: IntegrityFinding[] = []

  for (let leftIndex = 0; leftIndex < primitives.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < primitives.length; rightIndex += 1) {
      const left = primitives[leftIndex]
      const right = primitives[rightIndex]

      if (left === undefined || right === undefined) {
        continue
      }

      const similarity = likelyDuplicateSimilarity(left.name, right.name)

      if (similarity === null) {
        continue
      }

      const pairKey = pairKeyForIds(left.id, right.id)

      if (reportedPairs.has(pairKey)) {
        continue
      }

      reportedPairs.add(pairKey)

      for (const finding of findingsForLikelyPair(primitiveType, left, right, similarity)) {
        findings.push(finding)
      }
    }
  }

  return findings
}

export const findLikelyDuplicateNames = (graph: ProductGraph): readonly IntegrityFinding[] => {
  const findings: IntegrityFinding[] = []
  const reportedPairs = new Set<string>()

  for (const [primitiveType, ids] of graph.index.byType.entries()) {
    const typePrimitives: { readonly id: PrimitiveBase.PrimitiveId; readonly name: string }[] = []

    for (const primitiveId of ids) {
      const primitive = graph.index.nodes.get(primitiveId)

      if (primitive !== undefined) {
        typePrimitives.push(primitive)
      }
    }

    for (const finding of likelyDuplicateFindingsForType(primitiveType, typePrimitives, reportedPairs)) {
      findings.push(finding)
    }
  }

  return sortIntegrityFindings(findings)
}

export const findNameIntegrityWarnings = (graph: ProductGraph): readonly IntegrityFinding[] =>
  sortIntegrityFindings([...findDuplicateNames(graph), ...findLikelyDuplicateNames(graph)])
