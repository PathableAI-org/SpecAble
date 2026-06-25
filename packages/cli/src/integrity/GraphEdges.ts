import type { PrimitiveBase } from "@specable/domain"

import type { ProductGraph } from "../graph/ProductGraph.js"

import { collectPrimitiveReferences } from "../validation/ReferenceUtils.js"

export type PrimitiveId = PrimitiveBase.PrimitiveId

export const countInboundReferences = (graph: ProductGraph): ReadonlyMap<PrimitiveId, number> => {
  const inbound = new Map<PrimitiveId, number>()

  for (const primitive of graph.primitives) {
    for (const reference of collectPrimitiveReferences(primitive)) {
      inbound.set(reference.targetId, (inbound.get(reference.targetId) ?? 0) + 1)
    }
  }

  return inbound
}

export const edgeCountsForPrimitive = (
  graph: ProductGraph,
  primitiveId: PrimitiveId,
  inbound: ReadonlyMap<PrimitiveId, number>
): { readonly inbound: number; readonly outbound: number } => {
  const primitive = graph.index.nodes.get(primitiveId)

  if (primitive === undefined) {
    return { inbound: 0, outbound: 0 }
  }

  return {
    inbound: inbound.get(primitiveId) ?? 0,
    outbound: collectPrimitiveReferences(primitive).length
  }
}

export const isFullyDisconnected = (
  graph: ProductGraph,
  primitiveId: PrimitiveId,
  inbound: ReadonlyMap<PrimitiveId, number>
): boolean => {
  const { inbound: inboundCount, outbound } = edgeCountsForPrimitive(graph, primitiveId, inbound)

  return inboundCount === 0 && outbound === 0
}
