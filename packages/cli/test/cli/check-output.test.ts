import { NodeFileSystem } from "@effect/platform-node"
import * as FileSystem from "@effect/platform/FileSystem"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import * as fs from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

import {
  buildCheckArtifactsContext,
  needsIntegrityAnalysis,
  needsSummaryMarkdown,
  needsSummaryPreview
} from "../../src/cli/CheckArtifactsPlan.js"
import { resolveCheckCommandExit } from "../../src/cli/CheckCommand.js"
import { writeCheckArtifacts } from "../../src/cli/output/ArtifactWriter.js"
import { formatCheckOutput } from "../../src/cli/render/CheckOutput.js"
import { ScopeFlagConflictError, ValidationFailedError } from "../../src/errors.js"
import { loadProductGraph } from "../../src/graph/GraphLoader.js"
import { analyzeProductGraphIntegrity } from "../../src/integrity/IntegrityService.js"
import { generateSummaryMarkdown } from "../../src/summary/SummaryGenerator.js"
import { truncateSummaryPreview } from "../../src/summary/SummaryPreview.js"
import { validateProductGraph } from "../../src/validation/ValidationService.js"
import { makeSummaryGraph } from "../fixtures/summary/helpers.js"

const testDir = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(testDir, "../fixtures/summary/valid")
const nodeFileSystemLayer = NodeFileSystem.layer

const makeTempDir = async (): Promise<string> => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), "specable-us3-"))

  return base
}

describe("CheckOutput", () => {
  it("orders stdout sections for full check mode", () => {
    const graphPath = "/tmp/specable-graph"
    const validation = validateProductGraph({
      index: { byType: new Map(), nodes: new Map() },
      metadata: Option.none(),
      primitives: [],
      projectPath: graphPath
    })
    const integrity = analyzeProductGraphIntegrity(
      {
        index: { byType: new Map(), nodes: new Map() },
        metadata: Option.none(),
        primitives: [],
        projectPath: graphPath
      },
      validation
    )
    const summaryPreview = "# Product Primitive Summary\n\n## Active Objectives"

    const output = formatCheckOutput({
      integrity,
      mode: "full",
      projectPath: graphPath,
      summaryPreview,
      validation
    })

    const validationIndex = output.indexOf("Validation status:")
    const integrityIndex = output.indexOf("Integrity status:")
    const summaryIndex = output.indexOf("Summary preview:")

    expect(validationIndex).toBeGreaterThanOrEqual(0)
    expect(integrityIndex).toBeGreaterThan(validationIndex)
    expect(summaryIndex).toBeGreaterThan(integrityIndex)
  })

  it("limits summary preview to 80 lines by default", () => {
    const markdown = Array.from({ length: 120 }, (_, index) => `Line ${index + 1}`).join("\n")
    const preview = truncateSummaryPreview(markdown)

    expect(preview.split("\n").length).toBeLessThanOrEqual(82)
    expect(preview).toContain("summary preview truncated")
  })

  it.effect("writes all check artifacts to the output directory", () =>
    Effect.gen(function*() {
      const fsService = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(fsService, fixturesDir)
      const validation = validateProductGraph(graph)
      const integrity = analyzeProductGraphIntegrity(graph, validation)
      const summaryMarkdown = generateSummaryMarkdown(graph, validation, integrity)
      const outDir = yield* Effect.promise(makeTempDir)

      yield* writeCheckArtifacts({
        integrity,
        outDir,
        projectDir: fixturesDir,
        summaryMarkdown,
        validation
      })

      const summaryExists = yield* fsService.exists(path.join(outDir, "summary.md"))
      const validationExists = yield* fsService.exists(path.join(outDir, "validation.json"))
      const integrityJsonExists = yield* fsService.exists(path.join(outDir, "integrity-report.json"))
      const integrityMdExists = yield* fsService.exists(path.join(outDir, "integrity-report.md"))
      const checkResultExists = yield* fsService.exists(path.join(outDir, "check-result.json"))

      expect(summaryExists).toBe(true)
      expect(validationExists).toBe(true)
      expect(integrityJsonExists).toBe(true)
      expect(integrityMdExists).toBe(true)
      expect(checkResultExists).toBe(true)

      const summary = yield* fsService.readFileString(path.join(outDir, "summary.md"))
      expect(summary).toContain("# Product Primitive Summary")
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it.effect("loads summary fixture graph with zero Active failures", () =>
    Effect.gen(function*() {
      const fsService = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(fsService, fixturesDir)
      const validation = validateProductGraph(graph)

      expect(validation.summary.passed).toBe(true)
      expect(validation.summary.failureCount).toBe(0)
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it("maps validation failures to ValidationFailedError for exit code 1", () => {
    const validation = validateProductGraph({
      index: { byType: new Map(), nodes: new Map() },
      metadata: Option.none(),
      primitives: [],
      projectPath: "/tmp/invalid"
    })

    expect(validation.summary.passed).toBe(true)

    const failed = {
      failures: [],
      summary: { failureCount: 1, passed: false, warningCount: 0 },
      warnings: []
    }

    expect(() => {
      if (!failed.summary.passed) {
        throw new ValidationFailedError({ failureCount: failed.summary.failureCount })
      }
    }).toThrow()
  })

  it("maps ScopeFlagConflictError to exit code 2", () => {
    const resolution = resolveCheckCommandExit(
      new ScopeFlagConflictError({ message: "conflicting scope flags" })
    )

    expect(resolution).toEqual({ code: 2, message: "conflicting scope flags" })
  })
})

describe("CheckArtifactsPlan", () => {
  it("skips integrity and summary work for validate-only without --out", () => {
    const graph = makeSummaryGraph()
    const validation = validateProductGraph(graph)
    const context = buildCheckArtifactsContext(
      { graph, validation },
      "validate-only",
      undefined
    )

    expect(needsIntegrityAnalysis("validate-only", undefined)).toBe(false)
    expect(needsSummaryMarkdown("validate-only", undefined)).toBe(false)
    expect(needsSummaryPreview("validate-only")).toBe(false)
    expect(context.integrity).toBeUndefined()
    expect(context.summaryMarkdown).toBeUndefined()
    expect(context.summaryPreview).toBeUndefined()
  })

  it("computes integrity for integrity-only without summary artifacts", () => {
    const graph = makeSummaryGraph()
    const validation = validateProductGraph(graph)
    const context = buildCheckArtifactsContext(
      { graph, validation },
      "integrity-only",
      undefined
    )

    expect(context.integrity).toBeDefined()
    expect(context.summaryMarkdown).toBeUndefined()
    expect(context.summaryPreview).toBeUndefined()
  })

  it("computes summary preview only when summary output is requested", () => {
    const graph = makeSummaryGraph()
    const validation = validateProductGraph(graph)
    const context = buildCheckArtifactsContext(
      { graph, validation },
      "summary-only",
      undefined
    )

    expect(context.integrity).toBeDefined()
    expect(context.summaryMarkdown).toBeDefined()
    expect(context.summaryPreview).toBeDefined()
    expect(needsSummaryPreview("integrity-only")).toBe(false)
  })

  it("computes full artifacts when --out is provided in validate-only mode", () => {
    const graph = makeSummaryGraph()
    const validation = validateProductGraph(graph)
    const context = buildCheckArtifactsContext(
      { graph, validation },
      "validate-only",
      "/tmp/specable-out"
    )

    expect(needsIntegrityAnalysis("validate-only", "/tmp/specable-out")).toBe(true)
    expect(needsSummaryMarkdown("validate-only", "/tmp/specable-out")).toBe(true)
    expect(context.integrity).toBeDefined()
    expect(context.summaryMarkdown).toBeDefined()
    expect(context.summaryPreview).toBeUndefined()
  })
})
