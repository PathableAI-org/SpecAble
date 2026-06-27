import { NodeFileSystem } from "@effect/platform-node"
import { Layer } from "effect"

import type { StorageBackend } from "../../../src/storage/StorageBackend.js"

import { JsonStorageBackendLive } from "../../../src/storage/JsonStorageBackend.js"
import { SqliteStorageBackendLive } from "../../../src/storage/SqliteStorageBackend.js"

/** JSON storage + Node FileSystem for tests and examples. */
export const jsonStorageTestLayer: Layer.Layer<StorageBackend> = JsonStorageBackendLive.pipe(
  Layer.provide(NodeFileSystem.layer)
)

/** SQLite storage + Node FileSystem for tests and examples. */
export const sqliteStorageTestLayer: Layer.Layer<StorageBackend> = SqliteStorageBackendLive.pipe(
  Layer.provide(NodeFileSystem.layer)
)
