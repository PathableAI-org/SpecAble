import { NodeFileSystem } from "@effect/platform-node"
import * as FileSystem from "@effect/platform/FileSystem"
import { describe, expect, it } from "@effect/vitest"
import { PrimitiveBase } from "@specable/domain"
import { Effect } from "effect"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

import { formatIntegrityOutput } from "../../src/cli/render/IntegrityOutput.js"
import { loadProductGraph } from "../../src/graph/GraphLoader.js"
import { findDuplicateNames, findLikelyDuplicateNames } from "../../src/integrity/DuplicateDetection.js"
import { encodeIntegrityReport, formatIntegrityReportMarkdown } from "../../src/integrity/IntegrityReport.js"
import { analyzeProductGraphIntegrity } from "../../src/integrity/IntegrityService.js"
import {
  jaccardSimilarity,
  LIKELY_DUPLICATE_JACCARD_THRESHOLD,
  normalizeDisplayName,
  wordTokens
} from "../../src/integrity/NameNormalization.js"
import { findOrphans } from "../../src/integrity/OrphanDetection.js"
import { buildStoryTripleSummary } from "../../src/integrity/StoryTripleSummary.js"
import { validateProductGraph } from "../../src/validation/ValidationService.js"
import { ids, makeTestGraph } from "../fixtures/validation/helpers.js"

const testDir = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(testDir, "../fixtures/integrity")
const nodeFileSystemLayer = NodeFileSystem.layer

describe("NameNormalization", () => {
  it("normalizes names with trim and lowercase only", () => {
    expect(normalizeDisplayName(" Schedule Session ")).toBe("schedule session")
    expect(normalizeDisplayName("Schedule  Session")).toBe("schedule  session")
  })

  it("computes Jaccard similarity for likely duplicate detection", () => {
    const left = wordTokens(normalizeDisplayName("Coach Schedule Session Block"))
    const right = wordTokens(normalizeDisplayName("Coach Schedule Session Block Extra"))

    expect(jaccardSimilarity(left, right)).toBeGreaterThanOrEqual(LIKELY_DUPLICATE_JACCARD_THRESHOLD)
  })
})

describe("IntegrityReport", () => {
  it.effect("does not classify disconnected Actors as orphans", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(
        fs,
        path.join(fixturesDir, "disconnected-actor-not-orphan")
      )

      expect(findOrphans(graph)).toHaveLength(0)
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it.effect("reports orphan draft stories with zero relationship edges", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(fs, path.join(fixturesDir, "orphan-story"))
      const orphans = findOrphans(graph)

      expect(orphans).toHaveLength(1)
      expect(orphans[0]?.code).toBe("orphan")
      expect(orphans[0]?.primitiveId).toBe("story-orphan")
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it.effect("reports duplicate normalized names as integrity warnings", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(fs, path.join(fixturesDir, "duplicate-name"))
      const duplicates = findDuplicateNames(graph)

      expect(duplicates.length).toBeGreaterThan(0)
      expect(duplicates.every((finding) => finding.code === "duplicate-name")).toBe(true)
      expect(duplicates.every((finding) => finding.severity === "warning")).toBe(true)
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it.effect("reports likely duplicate names via Jaccard threshold", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(fs, path.join(fixturesDir, "likely-duplicate"))
      const likely = findLikelyDuplicateNames(graph)

      expect(likely.length).toBeGreaterThan(0)
      expect(likely.every((finding) => finding.code === "likely-duplicate-name")).toBe(true)
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it("builds duplicate story triple summary from validation failures only", () => {
    const graph = makeTestGraph([
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: ids.storyA,
        name: "Story A",
        status: "Active",
        type: "Story",
        workflows: [ids.workflowScheduling]
      },
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: ids.storyB,
        name: "Story B",
        status: "Active",
        type: "Story",
        workflows: [ids.workflowScheduling]
      }
    ])

    const validation = validateProductGraph(graph)
    const summary = buildStoryTripleSummary(graph, validation.failures)

    expect(summary).toHaveLength(1)
    expect(summary[0]?.storyIds).toEqual(expect.arrayContaining([ids.storyA, ids.storyB]))
  })

  it("does not duplicate Active under-linked failures in integrity warnings", () => {
    const storyId = PrimitiveBase.makePrimitiveId("story-incomplete")

    const graph = makeTestGraph([
      {
        category: "Human",
        description: "Coach",
        id: ids.actorCoach,
        name: "Coach",
        status: "Active",
        type: "Actor"
      },
      {
        actors: [ids.actorCoach],
        description: "Schedule",
        expectedResults: [ids.resultScheduled],
        id: ids.capSchedule,
        name: "Schedule",
        status: "Active",
        type: "Capability",
        workflows: [ids.workflowScheduling]
      },
      {
        capabilities: [ids.capSchedule],
        definition: "Scheduled",
        id: ids.resultScheduled,
        name: "Scheduled",
        objectives: [PrimitiveBase.makePrimitiveId("obj-1")],
        status: "Active",
        type: "ExpectedResult"
      },
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: storyId,
        name: "Incomplete story",
        status: "Active",
        type: "Story"
      }
    ])

    const validation = validateProductGraph(graph)
    const integrity = analyzeProductGraphIntegrity(graph, validation)

    expect(validation.failures.some((finding) => finding.code === "missing-relationship")).toBe(
      true
    )
    expect(integrity.warnings.map((finding) => finding.code)).not.toContain("orphan")
    expect(integrity.warnings.map((finding) => finding.code)).not.toContain("missing-relationship")
  })

  it("does not classify standalone Draft Objectives as orphans", () => {
    const graph = makeTestGraph([
      {
        description: "Draft objective standing alone",
        id: ids.objDraft,
        name: "Draft objective",
        status: "Draft",
        type: "Objective"
      }
    ])

    expect(findOrphans(graph)).toHaveLength(0)
  })

  it("includes duplicate story triple summary without integrity failure entries", () => {
    const objectiveId = PrimitiveBase.makePrimitiveId("obj-1")
    const conceptId = PrimitiveBase.makePrimitiveId("concept-session")

    const graph = makeTestGraph([
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: ids.storyA,
        name: "Story A",
        status: "Active",
        type: "Story",
        workflows: [ids.workflowScheduling]
      },
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: ids.storyB,
        name: "Story B",
        status: "Active",
        type: "Story",
        workflows: [ids.workflowScheduling]
      },
      {
        category: "Human",
        description: "Coach",
        id: ids.actorCoach,
        name: "Coach",
        status: "Active",
        type: "Actor"
      },
      {
        actors: [ids.actorCoach],
        domainConcepts: [conceptId],
        expectedResults: [ids.resultScheduled],
        id: ids.capSchedule,
        name: "Schedule",
        status: "Active",
        type: "Capability",
        workflows: [ids.workflowScheduling]
      },
      {
        capabilities: [ids.capSchedule],
        definition: "Session is scheduled",
        id: ids.resultScheduled,
        name: "Session scheduled",
        objectives: [objectiveId],
        status: "Active",
        type: "ExpectedResult"
      },
      {
        capabilities: [ids.capSchedule],
        id: ids.workflowScheduling,
        name: "Scheduling workflow",
        objectives: [objectiveId],
        primaryActors: [ids.actorCoach],
        sequenceNotes: "Coach schedules",
        status: "Active",
        stories: [ids.storyA, ids.storyB],
        type: "Workflow"
      }
    ])

    const validation = validateProductGraph(graph)
    const integrity = analyzeProductGraphIntegrity(graph, validation)

    expect(validation.failures.some((finding) => finding.code === "duplicate-story-triple")).toBe(
      true
    )
    expect(integrity.duplicateStoryTriples).toHaveLength(1)
    expect(integrity.warnings.map((finding) => finding.code)).not.toContain(
      "duplicate-story-triple"
    )
  })

  it("encodes integrity report JSON without validation failure entries", () => {
    const graph = makeTestGraph([
      {
        description: "Draft capability",
        id: ids.capSchedule,
        name: "Schedule Session",
        status: "Draft",
        type: "Capability"
      },
      {
        description: "Duplicate normalized name",
        id: PrimitiveBase.makePrimitiveId("cap-dup"),
        name: " schedule session ",
        status: "Draft",
        type: "Capability"
      }
    ])

    const validation = validateProductGraph(graph)
    const integrity = analyzeProductGraphIntegrity(graph, validation)
    const report = encodeIntegrityReport("/tmp/graph", integrity)

    expect(report.schemaVersion).toBe(1)
    expect(report.warningCount).toBeGreaterThan(0)
    expect(report.findings.every((finding) => finding.severity === "warning")).toBe(true)
    expect(formatIntegrityOutput(integrity)).toContain("Integrity warnings:")
    expect(formatIntegrityReportMarkdown("/tmp/graph", integrity)).toContain("# Integrity Report")
  })
})
