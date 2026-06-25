import type { Primitive, PrimitiveBase, PrimitiveType } from "@specable/domain"

import { Effect } from "effect"

import { DuplicateIdError } from "../errors.js"

export interface GraphIndex {
  readonly byType: ReadonlyMap<PrimitiveType, ReadonlySet<PrimitiveId>>
  readonly nodes: ReadonlyMap<PrimitiveId, PrimitiveRecord>
}

export interface GraphMetadata {
  readonly description?: string
  readonly name?: string
  readonly schemaVersion: number
}

export type PrimitiveId = PrimitiveBase.PrimitiveId

export type PrimitiveRecord = Primitive

export interface ProductGraph {
  readonly index: GraphIndex
  readonly metadata: GraphMetadata | null
  readonly primitives: readonly PrimitiveRecord[]
  readonly projectPath: string
}

export const buildGraphIndex = (
  primitives: readonly PrimitiveRecord[]
): Effect.Effect<GraphIndex, DuplicateIdError> =>
  Effect.gen(function*() {
    const nodes = new Map<PrimitiveId, PrimitiveRecord>()
    const byType = new Map<PrimitiveType, Set<PrimitiveId>>()

    for (const primitive of primitives) {
      if (nodes.has(primitive.id)) {
        return yield* Effect.fail(
          new DuplicateIdError({
            id: primitive.id,
            type: primitive.type
          })
        )
      }

      nodes.set(primitive.id, primitive)

      const idsForType = byType.get(primitive.type) ?? new Set<PrimitiveId>()
      idsForType.add(primitive.id)
      byType.set(primitive.type, idsForType)
    }

    return {
      byType,
      nodes
    }
  })

export const emptyGraphIndex = (): GraphIndex => ({
  byType: new Map(),
  nodes: new Map()
})
