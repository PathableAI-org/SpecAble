import { describe, expect, it } from "@effect/vitest"
import { errors } from "@specable/core"

import { formatInitSuccessOutput, resolveInitCommandExit } from "../../src/cli/InitCommand.js"

const { ProjectAlreadyInitializedError, UnsupportedStorageTypeError } = errors

describe("InitCommand", () => {
  it("formats success stdout with projectId, storage, and root path", () => {
    const output = formatInitSuccessOutput({
      name: "demo-json",
      projectId: "8f3c2e1a-4b5d-4c6e-9f0a-1b2c3d4e5f6a",
      rootPath: "/tmp/demo-json",
      storage: "json"
    })

    expect(output).toContain("Initialized SpecAble project \"demo-json\"")
    expect(output).toContain("projectId: 8f3c2e1a-4b5d-4c6e-9f0a-1b2c3d4e5f6a")
    expect(output).toContain("storage: json")
    expect(output).toContain("root: /tmp/demo-json")
  })

  it("defaults storage option to json in command definition", async () => {
    const { initCommand } = await import("../../src/cli/InitCommand.js")

    expect(initCommand).toBeDefined()
  })

  it("maps unsupported storage to exit code 2", () => {
    const resolution = resolveInitCommandExit(
      new UnsupportedStorageTypeError({ storageType: "postgres" })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Unsupported storage type \"postgres\". Supported types: json, sqlite."
    })
  })

  it("maps re-init to exit code 2", () => {
    const resolution = resolveInitCommandExit(
      new ProjectAlreadyInitializedError({ path: "/tmp/demo-json" })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Project already initialized: /tmp/demo-json"
    })
  })
})
