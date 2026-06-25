import { SystemError } from "@effect/platform/Error"
import { describe, expect, it } from "@effect/vitest"
import { errors as domainErrors, PrimitiveBase } from "@specable/domain"

import { resolveCliExitResolution } from "../../src/cli/CliExit.js"
import {
  BrokenReferenceError,
  CheckScopeUnavailableError,
  DuplicateIdError,
  GraphProjectNotFoundError,
  OutputWriteError,
  ValidationFailedError
} from "../../src/errors.js"

describe("resolveCliExitResolution", () => {
  it("maps check scope unavailable to exit 2", () => {
    const resolution = resolveCliExitResolution(
      new CheckScopeUnavailableError({ message: "scope unavailable" })
    )

    expect(resolution).toEqual({ code: 2, message: "scope unavailable" })
  })

  it("maps graph project not found to exit 2", () => {
    const resolution = resolveCliExitResolution(
      new GraphProjectNotFoundError({ path: "/missing/project" })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Graph project not found: /missing/project"
    })
  })

  it("maps fixture decode errors to exit 2", () => {
    const resolution = resolveCliExitResolution(
      new domainErrors.FixtureDecodeError({
        filePath: "actors.json",
        message: "invalid json"
      })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Fixture decode error in actors.json: invalid json"
    })
  })

  it("maps duplicate IDs to exit 1", () => {
    const resolution = resolveCliExitResolution(
      new DuplicateIdError({
        id: PrimitiveBase.makePrimitiveId("actor-coach"),
        type: "Actor"
      })
    )

    expect(resolution).toEqual({
      code: 1,
      message: "Duplicate primitive ID: actor-coach (Actor)"
    })
  })

  it("maps broken references to exit 1", () => {
    const resolution = resolveCliExitResolution(
      new BrokenReferenceError({ targetId: "missing-actor" })
    )

    expect(resolution).toEqual({
      code: 1,
      message: "Broken reference to missing-actor"
    })
  })

  it("maps output write errors to exit 2", () => {
    const resolution = resolveCliExitResolution(
      new OutputWriteError({ message: "permission denied", path: "/tmp/out" })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Failed to write /tmp/out: permission denied"
    })
  })

  it("maps validation failures to exit 1 without a message", () => {
    const resolution = resolveCliExitResolution(
      new ValidationFailedError({ failureCount: 3 })
    )

    expect(resolution).toEqual({ code: 1 })
  })

  it("maps platform errors to exit 2", () => {
    const resolution = resolveCliExitResolution(
      new SystemError({
        method: "readFile",
        module: "FileSystem",
        pathOrDescriptor: "/missing",
        reason: "NotFound"
      })
    )

    expect(resolution?.code).toBe(2)
    expect(resolution?.message).toContain("Graph load error:")
  })

  it("returns undefined for unknown errors", () => {
    expect(resolveCliExitResolution(new Error("unexpected"))).toBeUndefined()
  })
})
