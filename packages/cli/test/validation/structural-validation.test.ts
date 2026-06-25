import { NodeFileSystem } from "@effect/platform-node"
import * as FileSystem from "@effect/platform/FileSystem"
import { describe, expect, it } from "@effect/vitest"
import { PrimitiveBase } from "@specable/domain"
import { Effect } from "effect"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

import { loadProductGraph } from "../../src/graph/GraphLoader.js"
import { findBrokenReferences, findDuplicateStoryTriples } from "../../src/validation/StructuralValidation.js"
import { validateProductGraph } from "../../src/validation/ValidationService.js"
import { ids, makeTestGraph } from "../fixtures/validation/helpers.js"

const testDir = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(testDir, "../fixtures/validation")
const nodeFileSystemLayer = NodeFileSystem.layer

describe("StructuralValidation", () => {
  it.effect("reports broken references from the broken-ref fixture", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(fs, path.join(fixturesDir, "broken-ref"))
      const findings = findBrokenReferences(graph)

      expect(findings.length).toBeGreaterThan(0)
      expect(findings.every((finding) => finding.code === "broken-reference")).toBe(true)
      expect(findings.every((finding) => finding.severity === "failure")).toBe(true)
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it("detects duplicate Active story triples", () => {
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
        domainConcepts: [PrimitiveBase.makePrimitiveId("concept-session")],
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
        objectives: [PrimitiveBase.makePrimitiveId("obj-1")],
        status: "Active",
        type: "ExpectedResult"
      },
      {
        capabilities: [ids.capSchedule],
        id: ids.workflowScheduling,
        name: "Scheduling workflow",
        objectives: [PrimitiveBase.makePrimitiveId("obj-1")],
        primaryActors: [ids.actorCoach],
        sequenceNotes: "Coach schedules",
        status: "Active",
        stories: [ids.storyA, ids.storyB],
        type: "Workflow"
      }
    ])

    const findings = findDuplicateStoryTriples(graph)

    expect(findings.length).toBe(2)
    expect(findings.every((finding) => finding.code === "duplicate-story-triple")).toBe(true)
  })

  it.effect("maps duplicate IDs at load time into validation failures via validate-only flow", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const duplicateFixture = path.join(testDir, "../fixtures/graph-duplicate-id")
      const error = yield* loadProductGraph(fs, duplicateFixture).pipe(Effect.flip)

      expect(error._tag).toBe("DuplicateIdError")

      const result = validateProductGraph(
        makeTestGraph([
          {
            category: "Human",
            description: "Coach",
            id: PrimitiveBase.makePrimitiveId("actor-coach"),
            name: "Coach",
            status: "Active",
            type: "Actor"
          }
        ])
      )

      expect(result.summary.passed).toBe(true)
    }).pipe(Effect.provide(nodeFileSystemLayer)))
})
