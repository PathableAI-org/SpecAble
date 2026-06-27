/**
 * Subprocess integration tests for `specable project show`.
 *
 * @see specs/002-initialize-project-roots/quickstart.md — Inspect both roots
 */
import { CANONICAL_PRIMITIVE_TYPES } from "@specable/core/storage/PrimitiveTypes.js"
import { beforeAll, describe, expect, it } from "vitest"

import { assertSpecableBuilt, runSpecable } from "./helpers/runSpecable.js"
import { makeTempProjectPath, removeTempProjectParent } from "./helpers/tempProjectRoot.js"

const initRoot = async (projectPath: string, storage: "json" | "sqlite"): Promise<void> => {
  const args = storage === "json"
    ? ["init", projectPath]
    : ["init", projectPath, "--storage", storage]
  const result = await runSpecable(args)

  expect(result.code).toBe(0)
}

describe.sequential("specable project show (subprocess)", () => {
  beforeAll(() => {
    assertSpecableBuilt()
  })

  it("describes an empty JSON-backed root", async () => {
    const projectRoot = await makeTempProjectPath("demo-json-show")

    try {
      await initRoot(projectRoot, "json")

      const result = await runSpecable(["project", "show", projectRoot])

      expect(result.code).toBe(0)
      expect(result.stdout).toContain("projectId:")
      expect(result.stdout).toContain("name:")
      expect(result.stdout).toContain("storage.type: json")
      expect(result.stdout).toContain("storage.location: .")
      expect(result.stdout).toContain("primitiveTypes:")
      expect(result.stdout).toContain("graph.totalPrimitives: 0")
      expect(result.stdout).toContain("graph.empty: true")

      for (const type of CANONICAL_PRIMITIVE_TYPES) {
        expect(result.stdout).toContain(type)
      }
    } finally {
      await removeTempProjectParent(projectRoot)
    }
  })

  it("describes an empty SQLite-backed root", async () => {
    const projectRoot = await makeTempProjectPath("demo-sqlite-show")

    try {
      await initRoot(projectRoot, "sqlite")

      const result = await runSpecable(["project", "show", projectRoot])

      expect(result.code).toBe(0)
      expect(result.stdout).toContain("storage.type: sqlite")
      expect(result.stdout).toContain("storage.location: graph.sqlite")
      expect(result.stdout).toContain("graph.totalPrimitives: 0")
      expect(result.stdout).toContain("graph.empty: true")
    } finally {
      await removeTempProjectParent(projectRoot)
    }
  })

  it("reports parity fields across JSON and SQLite backends", async () => {
    const jsonRoot = await makeTempProjectPath("parity-json")
    const sqliteRoot = await makeTempProjectPath("parity-sqlite")

    try {
      await initRoot(jsonRoot, "json")
      await initRoot(sqliteRoot, "sqlite")

      const jsonResult = await runSpecable(["project", "show", jsonRoot])
      const sqliteResult = await runSpecable(["project", "show", sqliteRoot])

      expect(jsonResult.code).toBe(0)
      expect(sqliteResult.code).toBe(0)

      const extractLine = (output: string, key: string): string | undefined =>
        output.split("\n").find((line) => line.startsWith(`${key}:`))

      expect(extractLine(jsonResult.stdout, "schemaVersion")).toBe(
        extractLine(sqliteResult.stdout, "schemaVersion")
      )
      expect(extractLine(jsonResult.stdout, "primitiveTypes")).toBe(
        extractLine(sqliteResult.stdout, "primitiveTypes")
      )
      expect(extractLine(jsonResult.stdout, "graph.totalPrimitives")).toBe("graph.totalPrimitives: 0")
      expect(extractLine(sqliteResult.stdout, "graph.totalPrimitives")).toBe("graph.totalPrimitives: 0")
      expect(extractLine(jsonResult.stdout, "graph.empty")).toBe("graph.empty: true")
      expect(extractLine(sqliteResult.stdout, "graph.empty")).toBe("graph.empty: true")
    } finally {
      await removeTempProjectParent(jsonRoot)
      await removeTempProjectParent(sqliteRoot)
    }
  })
})

describe.sequential("specable project show failures (subprocess)", () => {
  beforeAll(() => {
    assertSpecableBuilt()
  })

  it("rejects a non-project path", async () => {
    const result = await runSpecable(["project", "show", "/tmp"])

    expect(result.code).toBe(2)
    expect(result.stderr.length).toBeGreaterThan(0)
  })
})
