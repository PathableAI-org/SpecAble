import type { Primitive } from "@specable/domain"

import type { ProductGraph } from "../graph/ProductGraph.js"

import { countInboundReferences, isFullyDisconnected } from "./GraphEdges.js"
import { type IntegrityFinding, sortIntegrityFindings } from "./IntegrityFinding.js"

const canStandAloneWithoutRelationships = (primitive: Primitive): boolean => {
  if (primitive.type === "Actor") {
    return true
  }

  if (primitive.type === "Objective" && primitive.status === "Draft") {
    return true
  }

  return false
}

const orphanFinding = (primitive: Primitive): IntegrityFinding => ({
  code: "orphan",
  field: "relationships",
  message:
    `${primitive.type} "${primitive.name}" is disconnected and cannot meaningfully stand alone without relationships`,
  primitiveId: primitive.id,
  primitiveType: primitive.type,
  severity: "warning"
})

export const findOrphans = (graph: ProductGraph): readonly IntegrityFinding[] => {
  const inbound = countInboundReferences(graph)
  const findings: IntegrityFinding[] = []

  for (const primitive of graph.primitives) {
    if (primitive.status === "Active") {
      continue
    }

    if (canStandAloneWithoutRelationships(primitive)) {
      continue
    }

    if (!isFullyDisconnected(graph, primitive.id, inbound)) {
      continue
    }

    findings.push(orphanFinding(primitive))
  }

  return sortIntegrityFindings(findings)
}
