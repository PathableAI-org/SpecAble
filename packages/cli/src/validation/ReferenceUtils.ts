import type { Primitive, PrimitiveBase } from "@specable/domain"
import type { Reference, ReferenceArray } from "@specable/domain/Reference.js"

import type { GraphIndex } from "../graph/ProductGraph.js"

export type PrimitiveId = PrimitiveBase.PrimitiveId

export const referenceId = (reference: Reference): PrimitiveId =>
  typeof reference === "string" ? reference : reference.id

export const referenceIds = (references: ReferenceArray | undefined): readonly PrimitiveId[] =>
  references === undefined ? [] : references.map(referenceId)

export const hasNonEmptyText = (value: string | undefined): boolean => value !== undefined && value.trim().length > 0

export const hasReferences = (references: ReferenceArray | undefined): boolean =>
  references !== undefined && references.length > 0

export const hasSingleReference = (reference: Reference | undefined): boolean => reference !== undefined

export const hasPrimaryActorReference = (references: ReferenceArray | undefined): boolean => {
  if (references === undefined || references.length === 0) {
    return false
  }

  return references.some((reference) => {
    if (typeof reference === "string") {
      return true
    }

    return reference.role === undefined || reference.role === "Primary"
  })
}

export const isReferencedByActivePrimitive = (
  deprecatedId: PrimitiveId,
  graph: GraphIndex
): boolean => {
  for (const primitive of graph.nodes.values()) {
    if (primitive.status !== "Active") {
      continue
    }

    if (primitiveReferencesTarget(primitive, deprecatedId)) {
      return true
    }
  }

  return false
}

export const collectPrimitiveReferences = (
  primitive: Primitive
): readonly { readonly field: string; readonly targetId: PrimitiveId }[] => {
  switch (primitive.type) {
    case "Actor":
      return []
    case "Capability":
      return [
        ...referenceIds(primitive.actors).map((targetId) => ({ field: "actors", targetId })),
        ...referenceIds(primitive.domainConcepts).map((targetId) => ({
          field: "domainConcepts",
          targetId
        })),
        ...referenceIds(primitive.expectedResults).map((targetId) => ({
          field: "expectedResults",
          targetId
        })),
        ...referenceIds(primitive.workflows).map((targetId) => ({ field: "workflows", targetId }))
      ]
    case "CapabilityConceptLink":
      return [
        ...(primitive.capability === undefined
          ? []
          : [{ field: "capability", targetId: referenceId(primitive.capability) }]),
        ...(primitive.domainConcept === undefined
          ? []
          : [{ field: "domainConcept", targetId: referenceId(primitive.domainConcept) }])
      ]
    case "DomainConcept":
      return []
    case "ExpectedResult":
      return [
        ...referenceIds(primitive.capabilities).map((targetId) => ({
          field: "capabilities",
          targetId
        })),
        ...referenceIds(primitive.objectives).map((targetId) => ({ field: "objectives", targetId }))
      ]
    case "Objective":
      return [
        ...referenceIds(primitive.expectedResults).map((targetId) => ({
          field: "expectedResults",
          targetId
        })),
        ...referenceIds(primitive.workflows).map((targetId) => ({ field: "workflows", targetId }))
      ]
    case "Persona":
      return referenceIds(primitive.primaryActors).map((targetId) => ({
        field: "primaryActors",
        targetId
      }))
    case "Story":
      return [
        ...(primitive.actor === undefined
          ? []
          : [{ field: "actor", targetId: referenceId(primitive.actor) }]),
        ...(primitive.capability === undefined
          ? []
          : [{ field: "capability", targetId: referenceId(primitive.capability) }]),
        ...(primitive.expectedResult === undefined
          ? []
          : [{ field: "expectedResult", targetId: referenceId(primitive.expectedResult) }]),
        ...referenceIds(primitive.workflows).map((targetId) => ({ field: "workflows", targetId }))
      ]
    case "Workflow":
      return [
        ...referenceIds(primitive.capabilities).map((targetId) => ({
          field: "capabilities",
          targetId
        })),
        ...referenceIds(primitive.domainConcepts).map((targetId) => ({
          field: "domainConcepts",
          targetId
        })),
        ...referenceIds(primitive.expectedResults).map((targetId) => ({
          field: "expectedResults",
          targetId
        })),
        ...referenceIds(primitive.objectives).map((targetId) => ({ field: "objectives", targetId })),
        ...referenceIds(primitive.primaryActors).map((targetId) => ({
          field: "primaryActors",
          targetId
        })),
        ...referenceIds(primitive.stories).map((targetId) => ({ field: "stories", targetId }))
      ]
  }
}

const primitiveReferencesTarget = (primitive: Primitive, targetId: PrimitiveId): boolean =>
  collectPrimitiveReferences(primitive).some((reference) => reference.targetId === targetId)
