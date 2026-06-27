import * as fs from "node:fs/promises"
import * as path from "node:path"
import { beforeAll, describe, expect, it } from "vitest"

/**
 * Subprocess integration tests for additional init failure paths.
 *
 * @see specs/002-initialize-project-roots/quickstart.md — Failure scenarios
 */
import { SPECABLE_JSON } from "./helpers/projectLayout.js"
import { assertSpecableBuilt, runSpecable } from "./helpers/runSpecable.js"
import { makeNonEmptyTempDir, removeTempProjectTree } from "./helpers/tempProjectRoot.js"

describe.sequential("specable init failure paths (subprocess)", () => {
  beforeAll(() => {
    assertSpecableBuilt()
  })

  it("rejects init into a non-empty directory without specable.json", async () => {
    const dirPath = await makeNonEmptyTempDir("specable-init-nonempty-")

    try {
      const result = await runSpecable(["init", dirPath])

      expect(result.code).toBe(2)
      expect(result.stderr.length).toBeGreaterThan(0)
      await expect(fs.access(path.join(dirPath, SPECABLE_JSON))).rejects.toThrow()
    } finally {
      await removeTempProjectTree(dirPath)
    }
  })
})
