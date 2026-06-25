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
  type PrimitiveType,
  Story,
  Workflow
} from "@specable/domain"

type PrimitiveFileSchema = Schema.Schema<{ readonly primitives: readonly Primitive[] }, unknown>

export const makePrimitiveFileSchema = <A>(
  itemSchema: Schema.Schema<A>
): Schema.Schema<{ readonly primitives: readonly A[] }> =>
  Schema.Struct({
    primitives: Schema.Array(itemSchema)
  })

export const GRAPH_METADATA_FILE = "graph.json"

export const GraphMetadataSchema = Schema.Struct({
  description: Schema.optional(Schema.String),
  name: Schema.optional(Schema.String),
  schemaVersion: Schema.Number
})

export interface FixtureFileEntry {
  readonly fileName: string
  readonly primitiveType: PrimitiveType
  readonly schema: PrimitiveFileSchema
}

export type GraphMetadataDecoded = typeof GraphMetadataSchema.Type

// Per-type schemas decode to distinct primitive shapes; unify at the graph boundary.
const asPrimitiveFileSchema = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry unifies typed per-file schemas
  itemSchema: Schema.Schema<any, any, never>
): PrimitiveFileSchema => makePrimitiveFileSchema(itemSchema) as PrimitiveFileSchema

export const FIXTURE_FILES: readonly FixtureFileEntry[] = [
  {
    fileName: "objectives.json",
    primitiveType: "Objective",
    schema: asPrimitiveFileSchema(Objective)
  },
  {
    fileName: "actors.json",
    primitiveType: "Actor",
    schema: asPrimitiveFileSchema(Actor)
  },
  {
    fileName: "personas.json",
    primitiveType: "Persona",
    schema: asPrimitiveFileSchema(Persona)
  },
  {
    fileName: "domain-concepts.json",
    primitiveType: "DomainConcept",
    schema: asPrimitiveFileSchema(DomainConcept)
  },
  {
    fileName: "capabilities.json",
    primitiveType: "Capability",
    schema: asPrimitiveFileSchema(Capability)
  },
  {
    fileName: "capability-concept-links.json",
    primitiveType: "CapabilityConceptLink",
    schema: asPrimitiveFileSchema(CapabilityConceptLink)
  },
  {
    fileName: "expected-results.json",
    primitiveType: "ExpectedResult",
    schema: asPrimitiveFileSchema(ExpectedResult)
  },
  {
    fileName: "workflows.json",
    primitiveType: "Workflow",
    schema: asPrimitiveFileSchema(Workflow)
  },
  {
    fileName: "stories.json",
    primitiveType: "Story",
    schema: asPrimitiveFileSchema(Story)
  }
]

export type FixtureFileName = (typeof FIXTURE_FILES)[number]["fileName"]
