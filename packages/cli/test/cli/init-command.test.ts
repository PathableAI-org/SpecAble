import { CliConfig, Options } from "@effect/cli"
import { NodeFileSystem } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { errors } from "@specable/core"
import { Effect, HashMap } from "effect"

import { formatInitSuccessOutput, initStorageOption, resolveInitCommandExit } from "../../src/cli/InitCommand.js"

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

  it.effect("defaults storage option to json when --storage is omitted", () =>
    Effect.gen(function*() {
      const storage = yield* Options.parse(initStorageOption, HashMap.empty(), CliConfig.defaultConfig)

      expect(storage).toBe("json")
    }).pipe(Effect.provide(NodeFileSystem.layer)))

  it("maps unsupported storage to exit code 2", () => {
    const resolution = resolveInitCommandExit(
      new UnsupportedStorageTypeError({ storageType: "postgres" })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Unsupported storage type \"postgres\". Supported types: json, sqlite, md, org."
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
