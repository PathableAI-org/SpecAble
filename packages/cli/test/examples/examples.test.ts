import { NodeFileSystem } from "@effect/platform-node"
import * as FileSystem from "@effect/platform/FileSystem"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as fs from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

import { writeCheckArtifacts } from "../../src/cli/output/ArtifactWriter.js"
import { loadProductGraph } from "../../src/graph/GraphLoader.js"
import { analyzeProductGraphIntegrity } from "../../src/integrity/IntegrityService.js"
import { generateSummaryMarkdown } from "../../src/summary/SummaryGenerator.js"
import { validateProductGraph } from "../../src/validation/ValidationService.js"

const testDir = path.dirname(fileURLToPath(import.meta.url))
const examplesDir = path.join(testDir, "../../examples")
const nodeFileSystemLayer = NodeFileSystem.layer

const examplePath = (segments: readonly string[]): string => path.join(examplesDir, ...segments)

const makeTempDir = async (): Promise<string> => fs.mkdtemp(path.join(os.tmpdir(), "specable-us4-"))

const loadAndValidate = (projectPath: string) =>
  Effect.gen(function*() {
    const fsService = yield* FileSystem.FileSystem
    const graph = yield* loadProductGraph(fsService, projectPath)
    const validation = validateProductGraph(graph)
    const integrity = analyzeProductGraphIntegrity(graph, validation)
    const summary = generateSummaryMarkdown(graph, validation, integrity)

    return { graph, integrity, summary, validation }
  })

describe("Bundled examples", () => {
  it.effect("generic valid graph passes validation with full summary sections", () =>
    loadAndValidate(examplePath(["generic", "valid"])).pipe(
      Effect.tap(({ summary, validation }) => {
        expect(validation.summary.passed).toBe(true)
        expect(validation.summary.failureCount).toBe(0)
        expect(summary).toContain("# Product Primitive Summary")
        expect(summary).toContain("## Active Objectives")
        expect(summary).toContain("## Workflows")
        expect(summary).toContain("## Actors and Personas")
        expect(summary).toContain("## Capabilities")
        expect(summary).toContain("## Domain Concepts")
        expect(summary).toContain("## Expected Results")
        expect(summary).toContain("## Stories")
        expect(summary).toContain("Reduce scheduling friction")
        expect(summary).toContain("Service Provider")
        expect(summary).toContain("Book Appointment")
        expect(summary).toContain("## Stories")
      }),
      Effect.provide(nodeFileSystemLayer)
    ))

  it.effect("generic invalid graph fails validation and lists gaps", () =>
    loadAndValidate(examplePath(["generic", "invalid"])).pipe(
      Effect.tap(({ summary, validation }) => {
        expect(validation.summary.passed).toBe(false)
        expect(validation.summary.failureCount).toBeGreaterThan(0)
        expect(validation.failures.some((finding) => finding.code === "duplicate-story-triple")).toBe(
          true
        )
        expect(validation.failures.some((finding) => finding.code === "missing-relationship")).toBe(
          true
        )
        expect(validation.warnings.length).toBeGreaterThan(0)
        expect(summary).toContain("## Known Modeling Gaps")
        expect(summary).toContain("### Failures")
        expect(summary).toContain("duplicate-story-triple")
      }),
      Effect.provide(nodeFileSystemLayer)
    ))

  it.effect("coachbridge synthetic valid graph passes offline", () =>
    loadAndValidate(examplePath(["coachbridge-synthetic", "valid"])).pipe(
      Effect.tap(({ summary, validation }) => {
        expect(validation.summary.passed).toBe(true)
        expect(validation.summary.failureCount).toBe(0)
        expect(summary).toContain("Morgan Coach")
        expect(summary).toContain("Taylor Participant")
        expect(summary).not.toContain("Notion")
      }),
      Effect.provide(nodeFileSystemLayer)
    ))

  it.effect("coachbridge synthetic invalid graph fails validation", () =>
    loadAndValidate(examplePath(["coachbridge-synthetic", "invalid"])).pipe(
      Effect.tap(({ validation }) => {
        expect(validation.summary.passed).toBe(false)
        expect(validation.failures.some((finding) => finding.code === "broken-reference")).toBe(true)
        expect(validation.warnings.length).toBeGreaterThan(0)
      }),
      Effect.provide(nodeFileSystemLayer)
    ))

  it.effect("writes all check artifacts for generic valid example", () =>
    Effect.gen(function*() {
      const fsService = yield* FileSystem.FileSystem
      const projectPath = examplePath(["generic", "valid"])
      const graph = yield* loadProductGraph(fsService, projectPath)
      const validation = validateProductGraph(graph)
      const integrity = analyzeProductGraphIntegrity(graph, validation)
      const summaryMarkdown = generateSummaryMarkdown(graph, validation, integrity)
      const outDir = yield* Effect.promise(makeTempDir)

      yield* writeCheckArtifacts({
        integrity,
        outDir,
        projectDir: projectPath,
        summaryMarkdown,
        validation
      })

      const artifactNames = [
        "summary.md",
        "validation.json",
        "integrity-report.json",
        "integrity-report.md",
        "check-result.json"
      ] as const

      for (const artifact of artifactNames) {
        const exists = yield* fsService.exists(path.join(outDir, artifact))
        expect(exists).toBe(true)
      }
    }).pipe(Effect.provide(nodeFileSystemLayer)))
})
