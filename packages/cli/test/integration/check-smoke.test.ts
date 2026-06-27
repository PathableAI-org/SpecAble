/**
 * Subprocess integration tests for v0 `specable check` regression.
 *
 * @see specs/001-product-primitives-v0/quickstart.md — Run against bundled generic example
 * @see specs/002-initialize-project-roots/quickstart.md — v0 regression check
 */
import * as fs from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { beforeAll, describe, expect, it } from "vitest"

import { assertSpecableBuilt, runSpecable } from "./helpers/runSpecable.js"

const testDir = path.dirname(fileURLToPath(import.meta.url))
const genericValidExample = path.join(testDir, "../../examples/generic/valid")

const CHECK_ARTIFACTS = [
  "summary.md",
  "validation.json",
  "integrity-report.json",
  "integrity-report.md",
  "check-result.json"
] as const

describe.sequential("specable check smoke (subprocess)", () => {
  beforeAll(() => {
    assertSpecableBuilt()
  })

  it("checks bundled generic valid example without specable.json", async () => {
    const result = await runSpecable(["check", genericValidExample])

    expect(result.code).toBe(0)
    expect(result.stdout.length).toBeGreaterThan(0)
  })

  it("writes expected artifacts with --out", async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "specable-check-out-"))

    try {
      const result = await runSpecable(["check", genericValidExample, "--out", outDir])

      expect(result.code).toBe(0)

      for (const artifact of CHECK_ARTIFACTS) {
        const artifactPath = path.join(outDir, artifact)
        const stat = await fs.stat(artifactPath)

        expect(stat.isFile()).toBe(true)
      }
    } finally {
      await fs.rm(outDir, { force: true, recursive: true })
    }
  })
})
