import type { Story } from "@specable/domain"
import type { PrimitiveType } from "@specable/domain"
import type { PrimitiveBase } from "@specable/domain"

import type { ProductGraph } from "../graph/ProductGraph.js"
import type { ValidationFinding } from "./ValidationFinding.js"

import { collectPrimitiveReferences, referenceId } from "./ReferenceUtils.js"

export const findBrokenReferences = (graph: ProductGraph): readonly ValidationFinding[] => {
  const findings: ValidationFinding[] = []

  for (const primitive of graph.primitives) {
    for (const reference of collectPrimitiveReferences(primitive)) {
      if (!graph.index.nodes.has(reference.targetId)) {
        findings.push({
          code: "broken-reference",
          field: reference.field,
          message: `Broken reference to unknown primitive ID "${reference.targetId}"`,
          primitiveId: primitive.id,
          primitiveType: primitive.type,
          severity: "failure"
        })
      }
    }
  }

  return findings
}

export const findDuplicateStoryTriples = (graph: ProductGraph): readonly ValidationFinding[] => {
  const triples = new Map<string, readonly Story[]>()

  for (const primitive of graph.primitives) {
    if (primitive.type !== "Story" || primitive.status !== "Active") {
      continue
    }

    if (
      primitive.actor === undefined ||
      primitive.capability === undefined ||
      primitive.expectedResult === undefined
    ) {
      continue
    }

    const key = [
      referenceId(primitive.actor),
      referenceId(primitive.capability),
      referenceId(primitive.expectedResult)
    ].join("|")

    const existing = triples.get(key) ?? []
    triples.set(key, [...existing, primitive])
  }

  const findings: ValidationFinding[] = []

  for (const stories of triples.values()) {
    if (stories.length < 2) {
      continue
    }

    for (const story of stories) {
      findings.push({
        code: "duplicate-story-triple",
        field: "actor|capability|expectedResult",
        message: `Duplicate Active story triple shared with stories: ${stories.map((item) => item.id).join(", ")}`,
        primitiveId: story.id,
        primitiveType: "Story",
        severity: "failure"
      })
    }
  }

  return findings
}

export const duplicateIdFinding = (id: PrimitiveBase.PrimitiveId, type: string): ValidationFinding => ({
  code: "duplicate-id",
  field: "id",
  message: `Duplicate primitive ID "${id}" encountered while loading the graph project`,
  primitiveId: id,
  primitiveType: isPrimitiveType(type) ? type : "Actor",
  severity: "failure"
})

const isPrimitiveType = (value: string): value is PrimitiveType =>
  value === "Objective" ||
  value === "Actor" ||
  value === "Persona" ||
  value === "DomainConcept" ||
  value === "Capability" ||
  value === "CapabilityConceptLink" ||
  value === "ExpectedResult" ||
  value === "Workflow" ||
  value === "Story"
