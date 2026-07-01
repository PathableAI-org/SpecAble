import { NodeFileSystem } from "@effect/platform-node"
import { Layer } from "effect"

import type { PrimitiveService } from "../../../src/primitive/PrimitiveService.js"
import type { ProjectRootService } from "../../../src/project/ProjectRootService.js"
import type { StorageBackend } from "../../../src/storage/StorageBackend.js"

import { PrimitiveService as PrimitiveServiceTag } from "../../../src/primitive/PrimitiveService.js"
import { ProjectRootService as ProjectRootServiceTag } from "../../../src/project/ProjectRootService.js"
import { JsonStorageBackendLive } from "../../../src/storage/JsonStorageBackend.js"
import { MarkdownStorageBackendLive } from "../../../src/storage/MarkdownStorageBackend.js"
import { OrgStorageBackendLive } from "../../../src/storage/OrgStorageBackend.js"
import { RoutedStorageBackendLive } from "../../../src/storage/RoutedStorageBackend.js"
import { SqliteStorageBackendLive } from "../../../src/storage/SqliteStorageBackend.js"

const nodeFileSystemLayer = NodeFileSystem.layer

/** JSON storage + Node FileSystem for tests and examples. */
export const jsonStorageTestLayer: Layer.Layer<StorageBackend> = JsonStorageBackendLive.pipe(
  Layer.provide(nodeFileSystemLayer)
)

/** SQLite storage + Node FileSystem for tests and examples. */
export const sqliteStorageTestLayer: Layer.Layer<StorageBackend> = SqliteStorageBackendLive.pipe(
  Layer.provide(nodeFileSystemLayer)
)

/** Markdown storage + Node FileSystem for tests and examples. */
export const mdStorageTestLayer: Layer.Layer<StorageBackend> = MarkdownStorageBackendLive.pipe(
  Layer.provide(nodeFileSystemLayer)
)

/** Org storage + Node FileSystem for tests and examples. */
export const orgStorageTestLayer: Layer.Layer<StorageBackend> = OrgStorageBackendLive.pipe(
  Layer.provide(nodeFileSystemLayer)
)

/** Routed storage + Node FileSystem for primitive CRUD tests. */
export const routedStorageTestLayer: Layer.Layer<StorageBackend> = RoutedStorageBackendLive.pipe(
  Layer.provide(nodeFileSystemLayer)
)

/** Project root service with JSON storage for init contract tests. */
export const projectRootJsonTestLayer: Layer.Layer<ProjectRootService> = ProjectRootServiceTag.Default.pipe(
  Layer.provide(JsonStorageBackendLive),
  Layer.provide(nodeFileSystemLayer)
)

/** Project root service with SQLite storage for init contract tests. */
export const projectRootSqliteTestLayer: Layer.Layer<ProjectRootService> = ProjectRootServiceTag.Default.pipe(
  Layer.provide(SqliteStorageBackendLive),
  Layer.provide(nodeFileSystemLayer)
)

/** Project root service with Markdown storage for init contract tests. */
export const projectRootMdTestLayer: Layer.Layer<ProjectRootService> = ProjectRootServiceTag.Default.pipe(
  Layer.provide(MarkdownStorageBackendLive),
  Layer.provide(nodeFileSystemLayer)
)

/** Project root service with Org storage for init contract tests. */
export const projectRootOrgTestLayer: Layer.Layer<ProjectRootService> = ProjectRootServiceTag.Default.pipe(
  Layer.provide(OrgStorageBackendLive),
  Layer.provide(nodeFileSystemLayer)
)

/** Primitive service with JSON storage for create contract tests. */
export const primitiveServiceJsonTestLayer: Layer.Layer<PrimitiveService> = PrimitiveServiceTag.Default.pipe(
  Layer.provide(JsonStorageBackendLive),
  Layer.provide(nodeFileSystemLayer)
)

/** Primitive service with SQLite storage for create contract tests. */
export const primitiveServiceSqliteTestLayer: Layer.Layer<PrimitiveService> = PrimitiveServiceTag.Default.pipe(
  Layer.provide(SqliteStorageBackendLive),
  Layer.provide(nodeFileSystemLayer)
)
