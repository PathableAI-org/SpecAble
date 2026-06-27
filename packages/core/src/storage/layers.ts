import type * as FileSystem from "@effect/platform/FileSystem"
import type { Layer } from "effect"

import type { StorageBackend } from "./StorageBackend.js"

import { JsonStorageBackendLive } from "./JsonStorageBackend.js"
import { SqliteStorageBackendLive } from "./SqliteStorageBackend.js"

/**
 * Live Layer for JSON storage. Requires `FileSystem` when composing — platform
 * deps are absorbed at Layer build; `bootstrap` / `describe` run with `R = never`.
 */
export { JsonStorageBackendLive }

/**
 * Live Layer for SQLite storage. Requires `FileSystem` when composing (used for
 * describe-time existence checks); SQLite clients are scoped per call.
 */
export { SqliteStorageBackendLive }

export type JsonStorageBackendLiveLayer = Layer.Layer<StorageBackend, never, JsonStorageBackendLiveR>

/** Requirements for building {@link JsonStorageBackendLive}. */
export type JsonStorageBackendLiveR = FileSystem.FileSystem

export type SqliteStorageBackendLiveLayer = Layer.Layer<StorageBackend, never, SqliteStorageBackendLiveR>

/** Requirements for building {@link SqliteStorageBackendLive}. */
export type SqliteStorageBackendLiveR = FileSystem.FileSystem
