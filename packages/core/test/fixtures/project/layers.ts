import { NodeFileSystem } from "@effect/platform-node"
import { Layer } from "effect"

import type { ProjectRootService } from "../../../src/project/ProjectRootService.js"
import type { StorageBackend } from "../../../src/storage/StorageBackend.js"

import { ProjectRootService as ProjectRootServiceTag } from "../../../src/project/ProjectRootService.js"
import { JsonStorageBackendLive } from "../../../src/storage/JsonStorageBackend.js"
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
