import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import * as path from "node:path"

import { PrimitiveService } from "../../src/primitive/PrimitiveService.js"
import { ProjectRootService } from "../../src/project/ProjectRootService.js"
import { CANONICAL_PRIMITIVE_TYPES } from "../../src/storage/PrimitiveTypes.js"
import { sampleCreateInput, withJsonProjectRoot } from "../fixtures/primitive/helpers.js"
import { withTempDir } from "../fixtures/project/helpers.js"
import { primitiveServiceJsonTestLayer, projectRootJsonTestLayer } from "../fixtures/project/layers.js"

const inspectJsonTestLayer = Layer.merge(projectRootJsonTestLayer, primitiveServiceJsonTestLayer)

describe("ProjectRootService.describe (JSON)", () => {
  it.effect("returns ProjectDescriptor for an initialized JSON-backed root", () =>
    withTempDir("specable-inspect-json-", (parentDir) =>
      Effect.gen(function*() {
        const projectRoot = path.join(parentDir, "demo-json")
        const service = yield* ProjectRootService

        const config = yield* service.initialize(projectRoot, { storage: "json" })
        const descriptor = yield* service.describe(projectRoot)

        expect(descriptor.projectId).toBe(config.projectId)
        expect(descriptor.name).toBe("demo-json")
        expect(descriptor.rootPath).toBe(path.resolve(projectRoot))
        expect(descriptor.schemaVersion).toBe(1)
        expect(descriptor.storage).toEqual({ location: ".", type: "json" })
        expect(descriptor.primitiveTypes).toEqual([...CANONICAL_PRIMITIVE_TYPES])
        expect(descriptor.graph.totalPrimitives).toBe(0)
        expect(descriptor.graph.empty).toBe(true)

        for (const type of CANONICAL_PRIMITIVE_TYPES) {
          expect(descriptor.graph.countsByType[type]).toBe(0)
        }

        expect(descriptor.createdAt).toBe(config.createdAt)
      })).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("reports non-empty graph counts after primitives are created", () =>
    withJsonProjectRoot(({ projectRoot }) =>
      Effect.gen(function*() {
        const primitiveService = yield* PrimitiveService
        const rootService = yield* ProjectRootService

        yield* primitiveService.create(
          sampleCreateInput(projectRoot, "Capability", "Schedule session", { status: "Draft" })
        )
        yield* primitiveService.create(
          sampleCreateInput(projectRoot, "Actor", "Coach", { status: "Draft" })
        )

        const descriptor = yield* rootService.describe(projectRoot)

        expect(descriptor.graph.totalPrimitives).toBe(2)
        expect(descriptor.graph.empty).toBe(false)
        expect(descriptor.graph.countsByType.Capability).toBe(1)
        expect(descriptor.graph.countsByType.Actor).toBe(1)

        for (const type of CANONICAL_PRIMITIVE_TYPES) {
          if (type !== "Capability" && type !== "Actor") {
            expect(descriptor.graph.countsByType[type]).toBe(0)
          }
        }
      })
    ).pipe(Effect.provide(inspectJsonTestLayer)))
})
