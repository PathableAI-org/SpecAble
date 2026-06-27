import { describe, expect, it } from "@effect/vitest"
import { errors, type ProjectDescriptor } from "@specable/core"

import { resolveProjectShowCommandExit } from "../../src/cli/ProjectShowCommand.js"
import { formatProjectShowOutput } from "../../src/cli/render/ProjectShowOutput.js"

const { ProjectConfigDecodeError, ProjectNotFoundError } = errors

const sampleDescriptor: ProjectDescriptor.ProjectDescriptor = {
  createdAt: "2026-06-27T12:00:00.000Z",
  graph: {
    countsByType: {
      Actor: 0,
      Capability: 0,
      CapabilityConceptLink: 0,
      DomainConcept: 0,
      ExpectedResult: 0,
      Objective: 0,
      Persona: 0,
      Story: 0,
      Workflow: 0
    },
    empty: true,
    totalPrimitives: 0
  },
  name: "demo-json",
  primitiveTypes: [
    "Actor",
    "Capability",
    "CapabilityConceptLink",
    "DomainConcept",
    "ExpectedResult",
    "Objective",
    "Persona",
    "Story",
    "Workflow"
  ],
  projectId: "8f3c2e1a-4b5d-4c6e-9f0a-1b2c3d4e5f6a",
  rootPath: "/tmp/demo-json",
  schemaVersion: 1,
  storage: { location: ".", type: "json" }
}

describe("ProjectShowCommand", () => {
  it("formats stdout in stable field order", () => {
    const output = formatProjectShowOutput(sampleDescriptor)
    const lines = output.split("\n")

    expect(lines).toEqual([
      "projectId: 8f3c2e1a-4b5d-4c6e-9f0a-1b2c3d4e5f6a",
      "name: demo-json",
      "rootPath: /tmp/demo-json",
      "schemaVersion: 1",
      "storage.type: json",
      "storage.location: .",
      "primitiveTypes: Actor, Capability, CapabilityConceptLink, DomainConcept, ExpectedResult, Objective, Persona, Story, Workflow",
      "graph.totalPrimitives: 0",
      "graph.empty: true",
      "createdAt: 2026-06-27T12:00:00.000Z"
    ])
  })

  it("maps missing project root to exit code 2", () => {
    const resolution = resolveProjectShowCommandExit(
      new ProjectNotFoundError({ path: "/tmp/not-a-project" })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Not a valid SpecAble project root: /tmp/not-a-project"
    })
  })

  it("maps decode failures to exit code 2", () => {
    const resolution = resolveProjectShowCommandExit(
      new ProjectConfigDecodeError({
        message: "Expected string, actual null",
        path: "name"
      })
    )

    expect(resolution).toEqual({
      code: 2,
      message: "Invalid specable.json (name): Expected string, actual null"
    })
  })
})
