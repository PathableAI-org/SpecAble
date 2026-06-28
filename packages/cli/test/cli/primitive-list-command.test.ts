import { describe, expect, it } from "@effect/vitest"
import { errors, primitiveErrors } from "@specable/core"

import { resolvePrimitiveListCommandExit } from "../../src/cli/PrimitiveListCommand.js"
import { formatPrimitiveListSuccessOutput } from "../../src/cli/render/PrimitiveOutput.js"

const { UnknownPrimitiveTypeError } = primitiveErrors
const { ProjectNotFoundError } = errors

describe("PrimitiveListCommand", () => {
  it("formats empty list stdout", () => {
    const output = formatPrimitiveListSuccessOutput("/tmp/demo-json", [])

    expect(output).toBe("0 primitives in /tmp/demo-json")
  })

  it("formats list stdout with stable type column alignment", () => {
    const output = formatPrimitiveListSuccessOutput("/tmp/demo-json", [
      {
        id: "cap-schedule-session-x7k9",
        name: "Schedule session",
        status: "Draft",
        type: "Capability"
      },
      {
        id: "actor-coach-a1b2",
        name: "Coach",
        status: "Draft",
        type: "Actor"
      }
    ])

    expect(output).toContain("2 primitives in /tmp/demo-json")
    expect(output).toContain("Capability      cap-schedule-session-x7k9  \"Schedule session\"  Draft")
    expect(output).toContain("Actor           actor-coach-a1b2  \"Coach\"  Draft")
  })

  it("maps unknown filter type to exit code 2", () => {
    const resolution = resolvePrimitiveListCommandExit(
      new UnknownPrimitiveTypeError({ type: "NotARealType" })
    )

    expect(resolution?.code).toBe(2)
    expect(resolution?.message).toContain("Unknown primitive type \"NotARealType\"")
    expect(resolution?.message).toContain("Capability")
  })

  it("maps missing project roots to exit code 2", () => {
    const resolution = resolvePrimitiveListCommandExit(
      new ProjectNotFoundError({ path: "/tmp/nonexistent-root" })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Not a valid SpecAble project root: /tmp/nonexistent-root"
    })
  })
})
