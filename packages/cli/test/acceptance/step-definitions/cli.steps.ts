import { Given, Then, When } from "@cucumber/cucumber"
import * as fs from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { expect } from "vitest"

import type { SpecAbleWorld } from "../support/world.js"

import { assertAllPrimitiveFilesEmpty, readSpecableJson } from "../../integration/helpers/projectLayout.js"
import { runSpecable } from "../../integration/helpers/runSpecable.js"
import { makeTempProjectPath } from "../../integration/helpers/tempProjectRoot.js"

const acceptanceDir = path.dirname(fileURLToPath(import.meta.url))
const genericValidExample = path.join(acceptanceDir, "../../../examples/generic/valid")

Given("an empty temporary project directory", async function(this: SpecAbleWorld) {
  this.tempProjectPath = await makeTempProjectPath("acceptance-root")
})

When(
  "I run specable init with default storage",
  async function(this: SpecAbleWorld) {
    if (this.tempProjectPath === undefined) {
      throw new Error("tempProjectPath is not set")
    }

    this.lastResult = await runSpecable(["init", this.tempProjectPath])
  }
)

When(
  "I run specable init with storage {string}",
  async function(this: SpecAbleWorld, storage: string) {
    if (this.tempProjectPath === undefined) {
      throw new Error("tempProjectPath is not set")
    }

    this.lastResult = await runSpecable(["init", this.tempProjectPath, "--storage", storage])
  }
)

When("I run specable project show on that root", async function(this: SpecAbleWorld) {
  if (this.tempProjectPath === undefined) {
    throw new Error("tempProjectPath is not set")
  }

  this.lastResult = await runSpecable(["project", "show", this.tempProjectPath])
})

When("I run specable check on the bundled generic valid example", async function(this: SpecAbleWorld) {
  this.checkExamplePath = genericValidExample
  this.lastResult = await runSpecable(["check", genericValidExample])
})

When("I run specable check with --out on the bundled generic valid example", async function(this: SpecAbleWorld) {
  this.checkExamplePath = genericValidExample
  this.checkOutDir = await fs.mkdtemp(path.join(os.tmpdir(), "specable-acceptance-out-"))
  this.lastResult = await runSpecable(["check", genericValidExample, "--out", this.checkOutDir])
})

Then("the exit code should be {int}", function(this: SpecAbleWorld, expected: number) {
  if (this.lastResult === undefined) {
    throw new Error("lastResult is not set")
  }

  expect(this.lastResult.code).toBe(expected)
})

Then("stdout should contain {string}", function(this: SpecAbleWorld, text: string) {
  if (this.lastResult === undefined) {
    throw new Error("lastResult is not set")
  }

  expect(this.lastResult.stdout).toContain(text)
})

Then(
  "specable.json should declare storage type {string}",
  async function(this: SpecAbleWorld, storageType: string) {
    if (this.tempProjectPath === undefined) {
      throw new Error("tempProjectPath is not set")
    }

    const config = await readSpecableJson(this.tempProjectPath)

    expect(config.storage.type).toBe(storageType)
  }
)

Then("nine empty primitive JSON files should exist", async function(this: SpecAbleWorld) {
  if (this.tempProjectPath === undefined) {
    throw new Error("tempProjectPath is not set")
  }

  await assertAllPrimitiveFilesEmpty(this.tempProjectPath)
})

Then("graph.sqlite should exist with zero primitives", async function(this: SpecAbleWorld) {
  if (this.tempProjectPath === undefined) {
    throw new Error("tempProjectPath is not set")
  }

  const dbPath = path.join(this.tempProjectPath, "graph.sqlite")
  const stat = await fs.stat(dbPath)

  expect(stat.isFile()).toBe(true)
})

Then("check artifacts should be written", async function(this: SpecAbleWorld) {
  if (this.checkOutDir === undefined) {
    throw new Error("checkOutDir is not set")
  }

  for (
    const artifact of [
      "summary.md",
      "validation.json",
      "integrity-report.json",
      "integrity-report.md",
      "check-result.json"
    ]
  ) {
    const artifactPath = path.join(this.checkOutDir, artifact)
    const stat = await fs.stat(artifactPath)

    expect(stat.isFile()).toBe(true)
  }
})
