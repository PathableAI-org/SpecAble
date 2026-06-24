import { Schema } from "@effect/schema"

export class FixtureDecodeError extends Schema.TaggedError<FixtureDecodeError>("FixtureDecodeError")(
  "FixtureDecodeError",
  {
    filePath: Schema.String.annotations({
      description: "Graph fixture file where decoding failed",
      identifier: "FixtureDecodeFilePath",
      title: "File Path"
    }),
    message: Schema.String.annotations({
      description: "Human-readable decode failure summary",
      identifier: "FixtureDecodeMessage",
      title: "Message"
    }),
    path: Schema.optional(
      Schema.String.annotations({
        description: "JSON Pointer-style path to the failing field, when available",
        identifier: "FixtureDecodeFieldPath",
        title: "Field Path"
      })
    )
  }
) {}
