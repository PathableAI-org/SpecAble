import { Schema } from "@effect/schema"

import { CANONICAL_PRIMITIVE_TYPES } from "../storage/PrimitiveTypes.js"

export const StorageType = Schema.Literal("json", "sqlite", "md", "org").annotations({
  description: "Pluggable storage backend discriminator for project roots",
  identifier: "StorageType",
  title: "Storage Type"
})

export type StorageType = typeof StorageType.Type

export const StorageBinding = Schema.Struct({
  location: Schema.NonEmptyString.annotations({
    description: "Project-relative path to storage artifacts",
    identifier: "StorageLocation",
    title: "Storage Location"
  }),
  type: StorageType
}).annotations({
  description: "Binding between a project root and its storage backend layout",
  identifier: "StorageBinding",
  title: "Storage Binding"
})

export type StorageBinding = typeof StorageBinding.Type

const PrimitiveTypeName = Schema.Literal(...CANONICAL_PRIMITIVE_TYPES)

export const ProjectConfigSchema = Schema.Struct({
  createdAt: Schema.String.annotations({
    description: "ISO-8601 UTC timestamp recorded at project initialization",
    identifier: "ProjectCreatedAt",
    title: "Created At"
  }),
  name: Schema.NonEmptyString.annotations({
    description: "Human-readable display name for the project root",
    identifier: "ProjectName",
    title: "Project Name"
  }),
  primitiveTypes: Schema.Array(PrimitiveTypeName).annotations({
    description: "Canonical v0 primitive types supported by this project root",
    identifier: "ProjectPrimitiveTypes",
    title: "Primitive Types"
  }),
  projectId: Schema.String.annotations({
    description: "Stable UUID v4 identity for the project root",
    identifier: "ProjectId",
    title: "Project ID"
  }),
  schemaVersion: Schema.Literal(1).annotations({
    description: "Product primitive ontology generation version",
    identifier: "ProjectSchemaVersion",
    title: "Schema Version"
  }),
  specableVersion: Schema.Literal(1).annotations({
    description: "SpecAble project manifest format version",
    identifier: "SpecableVersion",
    title: "SpecAble Version"
  }),
  storage: StorageBinding
}).annotations({
  description: "Authoritative project manifest persisted as specable.json",
  identifier: "ProjectConfig",
  title: "Project Config"
})

export type ProjectConfig = typeof ProjectConfigSchema.Type

export const decodeProjectConfig = Schema.decodeUnknown(ProjectConfigSchema)

export const encodeProjectConfig = Schema.encode(ProjectConfigSchema)
