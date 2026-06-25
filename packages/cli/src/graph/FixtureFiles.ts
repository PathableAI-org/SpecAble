import type { FixtureDecodeError } from "@specable/domain/errors.js"
import type { Effect } from "effect"

import { Schema } from "@effect/schema"
import {
  Actor,
  Capability,
  CapabilityConceptLink,
  DomainConcept,
  ExpectedResult,
  Objective,
  Persona,
  type Primitive,
  Story,
  Workflow
} from "@specable/domain"

import { decodeJsonContent } from "./JsonDecode.js"

export const makePrimitiveFileSchema = <A, I>(
  itemSchema: Schema.Schema<A, I, never>
): Schema.Schema<{ readonly primitives: readonly A[] }, { readonly primitives: readonly I[] }, never> =>
  Schema.Struct({
    primitives: Schema.Array(itemSchema)
  })

export const GRAPH_METADATA_FILE = "graph.json"

export const GraphMetadataSchema = Schema.Struct({
  description: Schema.optional(Schema.String),
  name: Schema.optional(Schema.String),
  schemaVersion: Schema.Literal(1)
})

export interface FixtureFileEntry<A extends Primitive = Primitive> {
  readonly decode: (
    filePath: string,
    content: string
  ) => Effect.Effect<{ readonly primitives: readonly A[] }, FixtureDecodeError>
  readonly fileName: string
  readonly primitiveType: A["type"]
}

export type GraphMetadataDecoded = typeof GraphMetadataSchema.Type

export const fixtureFile = <A extends Primitive, I>(
  fileName: string,
  primitiveType: A["type"],
  itemSchema: Schema.Schema<A, I, never>
): FixtureFileEntry<A> => {
  const schema = makePrimitiveFileSchema(itemSchema)

  return {
    decode: (filePath, content) => decodeJsonContent(filePath, schema, content),
    fileName,
    primitiveType
  }
}

export const FIXTURE_FILES = [
  fixtureFile("objectives.json", "Objective", Objective),
  fixtureFile("actors.json", "Actor", Actor),
  fixtureFile("personas.json", "Persona", Persona),
  fixtureFile("domain-concepts.json", "DomainConcept", DomainConcept),
  fixtureFile("capabilities.json", "Capability", Capability),
  fixtureFile("capability-concept-links.json", "CapabilityConceptLink", CapabilityConceptLink),
  fixtureFile("expected-results.json", "ExpectedResult", ExpectedResult),
  fixtureFile("workflows.json", "Workflow", Workflow),
  fixtureFile("stories.json", "Story", Story)
] as const

export type FixtureFileName = (typeof FIXTURE_FILES)[number]["fileName"]
