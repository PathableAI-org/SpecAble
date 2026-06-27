import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as path from "node:path"

import { ProjectRootService } from "../../src/project/ProjectRootService.js"
import { CANONICAL_PRIMITIVE_TYPES } from "../../src/storage/PrimitiveTypes.js"
import { makeTempProjectDir, removeTempDir } from "../fixtures/project/helpers.js"
import { projectRootJsonTestLayer } from "../fixtures/project/layers.js"

describe("ProjectRootService.describe (JSON)", () => {
  it.effect("returns ProjectDescriptor for an initialized JSON-backed root", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-inspect-json-"))
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

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))
})
