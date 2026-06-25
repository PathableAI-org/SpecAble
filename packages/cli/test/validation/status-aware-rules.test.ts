import { NodeFileSystem } from "@effect/platform-node"
import * as FileSystem from "@effect/platform/FileSystem"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

import { loadProductGraph } from "../../src/graph/GraphLoader.js"
import { validateProductGraph } from "../../src/validation/ValidationService.js"

const testDir = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(testDir, "../fixtures/validation")
const nodeFileSystemLayer = NodeFileSystem.layer

describe("StatusAwareValidation", () => {
  it.effect("reports Draft incompleteness as warnings", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(fs, path.join(fixturesDir, "draft-warn"))
      const result = validateProductGraph(graph)

      expect(result.summary.passed).toBe(true)
      expect(result.summary.warningCount).toBeGreaterThan(0)
      expect(result.failures).toHaveLength(0)
      expect(result.warnings.some((finding) => finding.primitiveType === "Objective")).toBe(true)
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it.effect("reports Active incompleteness as failures", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(fs, path.join(fixturesDir, "active-fail"))
      const result = validateProductGraph(graph)

      expect(result.summary.passed).toBe(false)
      expect(result.summary.failureCount).toBeGreaterThan(0)
      expect(result.failures.some((finding) => finding.primitiveId === "actor-incomplete")).toBe(
        true
      )
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it.effect("passes a valid Active fixture with only advisory warnings allowed", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(fs, path.join(fixturesDir, "valid"))
      const result = validateProductGraph(graph)

      expect(result.summary.passed).toBe(true)
      expect(result.summary.failureCount).toBe(0)
    }).pipe(Effect.provide(nodeFileSystemLayer)))
})
