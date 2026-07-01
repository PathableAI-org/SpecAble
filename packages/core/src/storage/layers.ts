import type * as FileSystem from "@effect/platform/FileSystem"
import type { Layer } from "effect"

import type { StorageBackend } from "./StorageBackend.js"

import { JsonStorageBackendLive } from "./JsonStorageBackend.js"
import { MarkdownStorageBackendLive } from "./MarkdownStorageBackend.js"
import { OrgStorageBackendLive } from "./OrgStorageBackend.js"
import { RoutedStorageBackendLive } from "./RoutedStorageBackend.js"
import { SqliteStorageBackendLive } from "./SqliteStorageBackend.js"

/**
 * Live Layer for JSON storage. Requires `FileSystem` when composing — platform
 * deps are absorbed at Layer build; `bootstrap` / `describe` run with `R = never`.
 */
export { JsonStorageBackendLive }

/**
 * Live Layer routing bootstrap/describe to JSON or SQLite by `config.storage.type`.
 * Use for inspect flows where the backend is determined from `specable.json`.
 */
export { RoutedStorageBackendLive }

/**
 * Live Layer for SQLite storage. Requires `FileSystem` when composing (used for
 * describe-time existence checks); SQLite clients are scoped per call.
 */
export { SqliteStorageBackendLive }

/**
 * Live Layer for Markdown (wiki) storage. Requires `FileSystem` when composing;
 * bootstrap creates per-type directories under the project root.
 */
export { MarkdownStorageBackendLive }

/**
 * Live Layer for Org (wiki) storage. Requires `FileSystem` when composing;
 * bootstrap creates per-type directories under the project root.
 */
export { OrgStorageBackendLive }

export type JsonStorageBackendLiveLayer = Layer.Layer<StorageBackend, never, JsonStorageBackendLiveR>

/** Requirements for building {@link JsonStorageBackendLive}. */
export type JsonStorageBackendLiveR = FileSystem.FileSystem

export type MarkdownStorageBackendLiveLayer = Layer.Layer<StorageBackend, never, MarkdownStorageBackendLiveR>

/** Requirements for building {@link MarkdownStorageBackendLive}. */
export type MarkdownStorageBackendLiveR = FileSystem.FileSystem

export type OrgStorageBackendLiveLayer = Layer.Layer<StorageBackend, never, OrgStorageBackendLiveR>

/** Requirements for building {@link OrgStorageBackendLive}. */
export type OrgStorageBackendLiveR = FileSystem.FileSystem

export type SqliteStorageBackendLiveLayer = Layer.Layer<StorageBackend, never, SqliteStorageBackendLiveR>

/** Requirements for building {@link SqliteStorageBackendLive}. */
export type SqliteStorageBackendLiveR = FileSystem.FileSystem
