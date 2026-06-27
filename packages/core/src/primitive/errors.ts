import type { PlatformError } from "@effect/platform/Error"

import { Schema } from "@effect/schema"

import type { IncompleteProjectError } from "../project/errors.js"
import type { AlphaPrimitiveType } from "./PrimitiveSummary.js"

export type PrimitiveServiceError =
  | DuplicatePrimitiveIdError
  | IncompleteProjectError
  | InvalidProjectRootError
  | PlatformError
  | PrimitiveNotFoundError
  | PrimitiveValidationError
  | UnknownPrimitiveTypeError

export type StorageCreateError = DuplicatePrimitiveIdError | IncompleteProjectError | PlatformError

export type StorageReadError =
  | IncompleteProjectError
  | PlatformError
  | PrimitiveNotFoundError
  | PrimitiveValidationError

export class DuplicatePrimitiveIdError extends Schema.TaggedError<DuplicatePrimitiveIdError>(
  "DuplicatePrimitiveIdError"
)(
  "DuplicatePrimitiveIdError",
  {
    id: Schema.String.annotations({
      description: "Conflicting primitive identifier",
      identifier: "DuplicatePrimitiveId",
      title: "ID"
    }),
    path: Schema.String.annotations({
      description: "Project root path where the duplicate was detected",
      identifier: "DuplicatePrimitiveIdPath",
      title: "Project Path"
    })
  }
) {}

export class InvalidProjectRootError extends Schema.TaggedError<InvalidProjectRootError>(
  "InvalidProjectRootError"
)(
  "InvalidProjectRootError",
  {
    message: Schema.String.annotations({
      description: "Human-readable root validation summary",
      identifier: "InvalidProjectRootMessage",
      title: "Message"
    }),
    path: Schema.String.annotations({
      description: "Project root path that failed validation",
      identifier: "InvalidProjectRootPath",
      title: "Project Path"
    })
  }
) {}

export class PrimitiveNotFoundError extends Schema.TaggedError<PrimitiveNotFoundError>(
  "PrimitiveNotFoundError"
)(
  "PrimitiveNotFoundError",
  {
    id: Schema.String.annotations({
      description: "Requested primitive identifier",
      identifier: "PrimitiveNotFoundId",
      title: "ID"
    }),
    path: Schema.String.annotations({
      description: "Project root path where the primitive was not found",
      identifier: "PrimitiveNotFoundPath",
      title: "Project Path"
    })
  }
) {}

export class PrimitiveValidationError extends Schema.TaggedError<PrimitiveValidationError>(
  "PrimitiveValidationError"
)(
  "PrimitiveValidationError",
  {
    fieldPaths: Schema.optional(
      Schema.Array(Schema.String).annotations({
        description: "JSON Pointer-style paths to invalid fields",
        identifier: "PrimitiveValidationFieldPaths",
        title: "Field Paths"
      })
    ),
    message: Schema.String.annotations({
      description: "Human-readable validation summary",
      identifier: "PrimitiveValidationMessage",
      title: "Message"
    }),
    path: Schema.optional(
      Schema.String.annotations({
        description: "Storage artifact path associated with the failure",
        identifier: "PrimitiveValidationPath",
        title: "Path"
      })
    ),
    type: Schema.String.annotations({
      description: "Primitive type being validated",
      identifier: "PrimitiveValidationType",
      title: "Type"
    })
  }
) {}

export class UnknownPrimitiveTypeError extends Schema.TaggedError<UnknownPrimitiveTypeError>(
  "UnknownPrimitiveTypeError"
)(
  "UnknownPrimitiveTypeError",
  {
    type: Schema.String.annotations({
      description: "Unsupported primitive type value",
      identifier: "UnknownPrimitiveType",
      title: "Type"
    })
  }
) {}

export const invalidFilterTypeError = (type: string): UnknownPrimitiveTypeError =>
  new UnknownPrimitiveTypeError({ type })

export const isAlphaPrimitiveType = (type: string): type is AlphaPrimitiveType => (
  type === "Objective" ||
  type === "Actor" ||
  type === "Persona" ||
  type === "DomainConcept" ||
  type === "Capability" ||
  type === "ExpectedResult" ||
  type === "Workflow" ||
  type === "Story"
)
