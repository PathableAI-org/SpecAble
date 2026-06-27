import { Schema } from "@effect/schema"

export type ProjectInitError =
  | ProjectAlreadyInitializedError
  | ProjectNotFoundError
  | ProjectPathNotEmptyError
  | StorageBootstrapError
  | UnsupportedStorageTypeError

export type ProjectInspectError =
  | IncompleteProjectError
  | ProjectConfigDecodeError
  | ProjectNotFoundError
  | UnsupportedStorageTypeError

export type StorageError = IncompleteProjectError | StorageBootstrapError

export class IncompleteProjectError extends Schema.TaggedError<IncompleteProjectError>("IncompleteProjectError")(
  "IncompleteProjectError",
  {
    message: Schema.String.annotations({
      description: "Description of missing or invalid storage artifacts",
      identifier: "IncompleteProjectMessage",
      title: "Message"
    }),
    path: Schema.String.annotations({
      description: "Project root path with incomplete storage",
      identifier: "IncompleteProjectPath",
      title: "Project Path"
    })
  }
) {}

export class ProjectAlreadyInitializedError extends Schema.TaggedError<ProjectAlreadyInitializedError>(
  "ProjectAlreadyInitializedError"
)(
  "ProjectAlreadyInitializedError",
  {
    path: Schema.String.annotations({
      description: "Project root path that already contains specable.json",
      identifier: "ProjectAlreadyInitializedPath",
      title: "Project Path"
    })
  }
) {}

export class ProjectConfigDecodeError extends Schema.TaggedError<ProjectConfigDecodeError>(
  "ProjectConfigDecodeError"
)(
  "ProjectConfigDecodeError",
  {
    message: Schema.String.annotations({
      description: "Human-readable decode failure summary",
      identifier: "ProjectConfigDecodeMessage",
      title: "Message"
    }),
    path: Schema.optional(
      Schema.String.annotations({
        description: "JSON Pointer-style path to the failing field, when available",
        identifier: "ProjectConfigDecodeFieldPath",
        title: "Field Path"
      })
    )
  }
) {}

export class ProjectNotFoundError extends Schema.TaggedError<ProjectNotFoundError>("ProjectNotFoundError")(
  "ProjectNotFoundError",
  {
    path: Schema.String.annotations({
      description: "Project root path that could not be found or is not a directory",
      identifier: "ProjectNotFoundPath",
      title: "Project Path"
    })
  }
) {}

export class ProjectPathNotEmptyError extends Schema.TaggedError<ProjectPathNotEmptyError>(
  "ProjectPathNotEmptyError"
)(
  "ProjectPathNotEmptyError",
  {
    path: Schema.String.annotations({
      description: "Target directory that exists and is non-empty without specable.json",
      identifier: "ProjectPathNotEmptyPath",
      title: "Project Path"
    })
  }
) {}

export class StorageBootstrapError extends Schema.TaggedError<StorageBootstrapError>("StorageBootstrapError")(
  "StorageBootstrapError",
  {
    message: Schema.String.annotations({
      description: "Human-readable storage bootstrap failure summary",
      identifier: "StorageBootstrapMessage",
      title: "Message"
    }),
    path: Schema.String.annotations({
      description: "Project root path where bootstrap failed",
      identifier: "StorageBootstrapPath",
      title: "Project Path"
    })
  }
) {}

export class UnsupportedStorageTypeError extends Schema.TaggedError<UnsupportedStorageTypeError>(
  "UnsupportedStorageTypeError"
)(
  "UnsupportedStorageTypeError",
  {
    storageType: Schema.String.annotations({
      description: "Storage backend type that is not supported",
      identifier: "UnsupportedStorageType",
      title: "Storage Type"
    })
  }
) {}
