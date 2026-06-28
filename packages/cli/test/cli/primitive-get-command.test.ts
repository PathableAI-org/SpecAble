import { describe, expect, it } from "@effect/vitest"
import { errors, primitiveErrors } from "@specable/core"
import { PrimitiveId } from "@specable/domain/PrimitiveBase.js"

import { resolvePrimitiveGetCommandExit } from "../../src/cli/PrimitiveGetCommand.js"
import { formatPrimitiveGetSuccessOutput } from "../../src/cli/render/PrimitiveOutput.js"

const { PrimitiveNotFoundError } = primitiveErrors
const { ProjectNotFoundError } = errors

describe("PrimitiveGetCommand", () => {
  it("formats get stdout with stable field order", () => {
    const output = formatPrimitiveGetSuccessOutput({
      description: "Schedule coaching sessions for assigned clients",
      id: PrimitiveId.make("cap-schedule-session-x7k9"),
      name: "Schedule session",
      status: "Draft",
      type: "Capability"
    })

    expect(output).toBe(
      [
        "id: cap-schedule-session-x7k9",
        "type: Capability",
        "name: Schedule session",
        "status: Draft",
        "description: Schedule coaching sessions for assigned clients"
      ].join("\n")
    )
  })

  it("omits unset optional fields from get stdout", () => {
    const output = formatPrimitiveGetSuccessOutput({
      id: PrimitiveId.make("actor-coach-a1b2"),
      name: "Coach",
      status: "Draft",
      type: "Actor"
    })

    expect(output).toBe(
      [
        "id: actor-coach-a1b2",
        "type: Actor",
        "name: Coach",
        "status: Draft"
      ].join("\n")
    )
  })

  it("maps not-found errors to exit code 2", () => {
    const resolution = resolvePrimitiveGetCommandExit(
      new PrimitiveNotFoundError({ id: "cap-missing-id-z9z9", path: "/tmp/demo-json" })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Primitive not found: cap-missing-id-z9z9 in project root /tmp/demo-json"
    })
  })

  it("maps missing project roots to exit code 2", () => {
    const resolution = resolvePrimitiveGetCommandExit(
      new ProjectNotFoundError({ path: "/tmp/nonexistent-root" })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Not a valid SpecAble project root: /tmp/nonexistent-root"
    })
  })
})
