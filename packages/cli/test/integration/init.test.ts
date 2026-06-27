import { Effect } from "effect"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { beforeAll, describe, expect, it } from "vitest"

/**
 * Subprocess integration tests for `specable init`.
 *
 * @see specs/002-initialize-project-roots/quickstart.md — Initialize JSON/SQLite-backed root
 */
import {
  assertAllPrimitiveFilesEmpty,
  assertNoJsonPrimitiveFiles,
  assertSqliteGraphLayout,
  isUuidV4,
  readSpecableJson,
  SPECABLE_JSON
} from "./helpers/projectLayout.js"
import { assertSpecableBuilt, runSpecable } from "./helpers/runSpecable.js"
import { makeTempProjectPath, removeTempProjectParent } from "./helpers/tempProjectRoot.js"

describe.sequential("specable init (subprocess)", () => {
  beforeAll(() => {
    assertSpecableBuilt()
  })

  it("initializes a JSON-backed root with default storage", async () => {
    const projectRoot = await makeTempProjectPath("demo-json")

    try {
      const result = await runSpecable(["init", projectRoot])

      expect(result.code).toBe(0)
      expect(result.stdout).toContain("Initialized SpecAble project")
      expect(result.stdout).toContain("projectId:")
      expect(result.stdout).toContain("storage: json")
      expect(result.stdout).toContain(`root: ${projectRoot}`)

      const config = await readSpecableJson(projectRoot)

      expect(config.storage).toEqual({ location: ".", type: "json" })
      expect(isUuidV4(config.projectId)).toBe(true)
      await assertAllPrimitiveFilesEmpty(projectRoot)
    } finally {
      await removeTempProjectParent(projectRoot)
    }
  })

  it("initializes a JSON-backed root when --storage json is explicit", async () => {
    const projectRoot = await makeTempProjectPath("demo-json-explicit")

    try {
      const result = await runSpecable(["init", projectRoot, "--storage", "json"])

      expect(result.code).toBe(0)
      expect(result.stdout).toContain("storage: json")

      const config = await readSpecableJson(projectRoot)

      expect(config.storage.type).toBe("json")
      await assertAllPrimitiveFilesEmpty(projectRoot)
    } finally {
      await removeTempProjectParent(projectRoot)
    }
  })

  it("initializes a SQLite-backed root", async () => {
    const projectRoot = await makeTempProjectPath("demo-sqlite")

    try {
      const result = await runSpecable(["init", projectRoot, "--storage", "sqlite"])

      expect(result.code).toBe(0)
      expect(result.stdout).toContain("storage: sqlite")

      const config = await readSpecableJson(projectRoot)

      expect(config.storage).toEqual({ location: "graph.sqlite", type: "sqlite" })

      const dbPath = path.join(projectRoot, "graph.sqlite")
      const dbStat = await fs.stat(dbPath)

      expect(dbStat.isFile()).toBe(true)
      await assertNoJsonPrimitiveFiles(projectRoot)
      await Effect.runPromise(assertSqliteGraphLayout(dbPath))
    } finally {
      await removeTempProjectParent(projectRoot)
    }
  })

  it("leaves specable.json unchanged when init fails on re-init", async () => {
    const projectRoot = await makeTempProjectPath("demo-reinit")

    try {
      const first = await runSpecable(["init", projectRoot])

      expect(first.code).toBe(0)

      const before = await readSpecableJson(projectRoot)
      const second = await runSpecable(["init", projectRoot])

      expect(second.code).toBe(2)
      expect(second.stderr).toContain("Project already initialized")

      const after = await readSpecableJson(projectRoot)

      expect(after).toEqual(before)
    } finally {
      await removeTempProjectParent(projectRoot)
    }
  })

  it("rejects unsupported storage types", async () => {
    const projectRoot = await makeTempProjectPath("demo-bad")

    try {
      const result = await runSpecable(["init", projectRoot, "--storage", "postgres"])

      expect(result.code).toBe(2)
      expect(result.stderr).toContain("Supported types: json, sqlite")

      await expect(fs.access(path.join(projectRoot, SPECABLE_JSON))).rejects.toThrow()
    } finally {
      await removeTempProjectParent(projectRoot)
    }
  })
})
