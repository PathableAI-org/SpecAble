import { Schema } from "@effect/schema"
import { PrimitiveBase } from "@specable/domain"

export class BrokenReferenceError extends Schema.TaggedError<BrokenReferenceError>("BrokenReferenceError")(
  "BrokenReferenceError",
  {
    fieldPath: Schema.optional(
      Schema.String.annotations({
        description: "JSON Pointer-style path to the broken reference field",
        identifier: "BrokenReferenceFieldPath",
        title: "Field Path"
      })
    ),
    sourceId: Schema.optional(
      PrimitiveBase.PrimitiveId.annotations({
        description: "Primitive that contains the broken reference, when known",
        identifier: "BrokenReferenceSourceId",
        title: "Source ID"
      })
    ),
    targetId: Schema.String.annotations({
      description: "Referenced primitive ID that does not exist in the graph",
      identifier: "BrokenReferenceTargetId",
      title: "Target ID"
    })
  }
) {}

export class DuplicateIdError extends Schema.TaggedError<DuplicateIdError>("DuplicateIdError")(
  "DuplicateIdError",
  {
    id: PrimitiveBase.PrimitiveId.annotations({
      description: "Primitive identifier that appears more than once in the graph project",
      identifier: "DuplicatePrimitiveId",
      title: "Duplicate ID"
    }),
    type: Schema.String.annotations({
      description: "Primitive type of the duplicate entry",
      identifier: "DuplicatePrimitiveType",
      title: "Primitive Type"
    })
  }
) {}

export class GraphProjectNotFoundError extends Schema.TaggedError<GraphProjectNotFoundError>(
  "GraphProjectNotFoundError"
)(
  "GraphProjectNotFoundError",
  {
    path: Schema.String.annotations({
      description: "Graph project directory path that could not be loaded",
      identifier: "GraphProjectPath",
      title: "Project Path"
    })
  }
) {}

export class OutputWriteError extends Schema.TaggedError<OutputWriteError>("OutputWriteError")(
  "OutputWriteError",
  {
    message: Schema.String.annotations({
      description: "Human-readable write failure summary",
      identifier: "OutputWriteMessage",
      title: "Message"
    }),
    path: Schema.String.annotations({
      description: "Output directory or file path that could not be written",
      identifier: "OutputWritePath",
      title: "Output Path"
    })
  }
) {}

export class ValidationFailedError extends Schema.TaggedError<ValidationFailedError>("ValidationFailedError")(
  "ValidationFailedError",
  {
    failureCount: Schema.Number.annotations({
      description: "Number of Active validation failures present in the check result",
      identifier: "ValidationFailureCount",
      title: "Failure Count"
    })
  }
) {}
