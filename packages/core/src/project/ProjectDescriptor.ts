import { Schema } from "@effect/schema"

import { CANONICAL_PRIMITIVE_TYPES, type CanonicalPrimitiveType } from "../storage/PrimitiveTypes.js"
import { StorageBinding } from "./ProjectConfig.js"

const countsByTypeFields = Object.fromEntries(
  CANONICAL_PRIMITIVE_TYPES.map((type) => [type, Schema.Number])
) as Record<CanonicalPrimitiveType, typeof Schema.Number>

export const CountsByTypeSchema = Schema.Struct(countsByTypeFields).annotations({
  description: "Per-type primitive counts keyed by canonical type name",
  identifier: "CountsByType",
  title: "Counts By Type"
})

export type CountsByType = typeof CountsByTypeSchema.Type

export const GraphStoreSummarySchema = Schema.Struct({
  countsByType: CountsByTypeSchema,
  empty: Schema.Boolean.annotations({
    description: "True when totalPrimitives is zero",
    identifier: "GraphEmpty",
    title: "Empty"
  }),
  totalPrimitives: Schema.Number.annotations({
    description: "Total primitive instances across all types",
    identifier: "GraphTotalPrimitives",
    title: "Total Primitives"
  })
}).annotations({
  description: "Runtime graph store aggregate for inspect",
  identifier: "GraphStoreSummary",
  title: "Graph Store Summary"
})

export type GraphStoreSummary = typeof GraphStoreSummarySchema.Type

export const ProjectDescriptorSchema = Schema.Struct({
  createdAt: Schema.String.annotations({
    description: "ISO-8601 UTC timestamp from specable.json",
    identifier: "DescriptorCreatedAt",
    title: "Created At"
  }),
  graph: GraphStoreSummarySchema,
  name: Schema.NonEmptyString.annotations({
    description: "Display name from specable.json",
    identifier: "DescriptorName",
    title: "Name"
  }),
  primitiveTypes: Schema.Array(Schema.Literal(...CANONICAL_PRIMITIVE_TYPES)).annotations({
    description: "Canonical primitive types from specable.json",
    identifier: "DescriptorPrimitiveTypes",
    title: "Primitive Types"
  }),
  projectId: Schema.String.annotations({
    description: "Stable project identity from specable.json",
    identifier: "DescriptorProjectId",
    title: "Project ID"
  }),
  rootPath: Schema.String.annotations({
    description: "Resolved absolute filesystem path to the project root",
    identifier: "DescriptorRootPath",
    title: "Root Path"
  }),
  schemaVersion: Schema.Literal(1).annotations({
    description: "Ontology schema version from specable.json",
    identifier: "DescriptorSchemaVersion",
    title: "Schema Version"
  }),
  storage: StorageBinding
}).annotations({
  description: "Public inspect result combining config, graph summary, and operational path",
  identifier: "ProjectDescriptor",
  title: "Project Descriptor"
})

export type ProjectDescriptor = typeof ProjectDescriptorSchema.Type

export const emptyCountsByType = (): CountsByType =>
  Object.fromEntries(CANONICAL_PRIMITIVE_TYPES.map((type) => [type, 0])) as CountsByType

export const emptyGraphStoreSummary = (): GraphStoreSummary => ({
  countsByType: emptyCountsByType(),
  empty: true,
  totalPrimitives: 0
})
