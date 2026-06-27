import { beforeAll, describe, expect, it } from "@effect/vitest"
import { PrimitiveTypes, ProjectRootService } from "@specable/core"
import { Effect } from "effect"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

import { formatProjectShowOutput } from "../../src/cli/render/ProjectShowOutput.js"
import { projectRootInspectLiveLayer } from "../../src/services/Layers.js"
import { materializeSqliteFromSchema } from "../fixtures/project/prepareSqliteFixture.js"

const { CANONICAL_PRIMITIVE_TYPES } = PrimitiveTypes

const testDir = path.dirname(fileURLToPath(import.meta.url))
const examplesDir = path.join(testDir, "../../examples/project")

const examplePath = (name: string): string => path.join(examplesDir, name)

describe("Bundled project root examples", () => {
  beforeAll(async () => {
    await materializeSqliteFromSchema(examplePath("sqlite-empty"))
  })

  it.effect("json-empty describes an empty JSON-backed root", () =>
    Effect.gen(function*() {
      const service = yield* ProjectRootService.ProjectRootService
      const projectRoot = examplePath("json-empty")
      const descriptor = yield* service.describe(projectRoot)

      expect(descriptor.name).toBe("demo-json-empty")
      expect(descriptor.storage).toEqual({ location: ".", type: "json" })
      expect(descriptor.primitiveTypes).toEqual([...CANONICAL_PRIMITIVE_TYPES])
      expect(descriptor.graph.totalPrimitives).toBe(0)
      expect(descriptor.graph.empty).toBe(true)

      for (const type of CANONICAL_PRIMITIVE_TYPES) {
        expect(descriptor.graph.countsByType[type]).toBe(0)
      }

      const output = formatProjectShowOutput(descriptor)

      expect(output).toContain("projectId:")
      expect(output).toContain("storage.type: json")
      expect(output).toContain("graph.empty: true")
    }).pipe(Effect.provide(projectRootInspectLiveLayer)))

  it.effect("sqlite-empty describes an empty SQLite-backed root", () =>
    Effect.gen(function*() {
      const service = yield* ProjectRootService.ProjectRootService
      const projectRoot = examplePath("sqlite-empty")
      const descriptor = yield* service.describe(projectRoot)

      expect(descriptor.name).toBe("demo-sqlite-empty")
      expect(descriptor.storage).toEqual({ location: "graph.sqlite", type: "sqlite" })
      expect(descriptor.primitiveTypes).toEqual([...CANONICAL_PRIMITIVE_TYPES])
      expect(descriptor.graph.totalPrimitives).toBe(0)
      expect(descriptor.graph.empty).toBe(true)

      const output = formatProjectShowOutput(descriptor)

      expect(output).toContain("storage.type: sqlite")
      expect(output).toContain("graph.empty: true")
    }).pipe(Effect.provide(projectRootInspectLiveLayer)))
})
