import { describe, expect, it } from "@effect/vitest"
import { primitiveErrors } from "@specable/core"
import { Effect } from "effect"

import {
  parsePrimitiveCreateSetEntries,
  resolvePrimitiveCreateCommandExit
} from "../../src/cli/PrimitiveCreateCommand.js"
import { formatPrimitiveCreateSuccessOutput } from "../../src/cli/render/PrimitiveOutput.js"

const { DuplicatePrimitiveIdError, PrimitiveValidationError, UnknownPrimitiveTypeError } = primitiveErrors

describe("PrimitiveCreateCommand", () => {
  it("formats success stdout with id, status, and root path", () => {
    const output = formatPrimitiveCreateSuccessOutput({
      id: "cap-schedule-session-x7k9",
      name: "Schedule session",
      rootPath: "/tmp/demo-json",
      status: "Draft",
      type: "Capability"
    })

    expect(output).toContain("Created Capability \"Schedule session\"")
    expect(output).toContain("id: cap-schedule-session-x7k9")
    expect(output).toContain("status: Draft")
    expect(output).toContain("root: /tmp/demo-json")
  })

  it.effect("parses repeatable --set key=value pairs", () =>
    Effect.gen(function*() {
      const fields = yield* parsePrimitiveCreateSetEntries([
        "description=Primary care provider",
        "category=Human"
      ])

      expect(fields).toEqual({
        category: "Human",
        description: "Primary care provider"
      })
    }))

  it("maps unknown primitive type to exit code 2", () => {
    const resolution = resolvePrimitiveCreateCommandExit(
      new UnknownPrimitiveTypeError({ type: "NotARealType" })
    )

    expect(resolution?.code).toBe(2)
    expect(resolution?.message).toContain("Unknown primitive type \"NotARealType\"")
    expect(resolution?.message).toContain("Capability")
  })

  it("maps validation failures to exit code 2 with field paths", () => {
    const resolution = resolvePrimitiveCreateCommandExit(
      new PrimitiveValidationError({
        fieldPaths: ["category"],
        message: "Expected one of Human, System, AI, Organization, External, actual \"NotARealCategory\"",
        type: "Actor"
      })
    )

    expect(resolution).toEqual({
      code: 2,
      message:
        "Primitive validation failed for Actor (category): Expected one of Human, System, AI, Organization, External, actual \"NotARealCategory\""
    })
  })

  it("maps duplicate primitive IDs to exit code 2", () => {
    const resolution = resolvePrimitiveCreateCommandExit(
      new DuplicatePrimitiveIdError({ id: "cap-duplicate-test-x1y2", path: "/tmp/demo-json" })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Duplicate primitive ID \"cap-duplicate-test-x1y2\" in project root /tmp/demo-json"
    })
  })
})
