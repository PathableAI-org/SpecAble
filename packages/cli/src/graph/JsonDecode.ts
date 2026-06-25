import type { ParseError } from "@effect/schema/ParseResult"

import { ArrayFormatter, Schema } from "@effect/schema"
import { FixtureDecodeError } from "@specable/domain/errors.js"
import { Effect } from "effect"

const decodeFailureMessage = (error: ParseError): string =>
  ArrayFormatter.formatErrorSync(error)[0]?.message ?? "Schema decode failed"

const decodeSchema = <A, I>(
  filePath: string,
  schema: Schema.Schema<A, I>,
  parsed: unknown
): Effect.Effect<A, FixtureDecodeError> => {
  const result = Schema.decodeUnknownEither(schema)(parsed)
  return result._tag === "Right"
    ? Effect.succeed(result.right)
    : Effect.fail(new FixtureDecodeError({ filePath, message: decodeFailureMessage(result.left) }))
}

export const parseJsonString = (
  filePath: string,
  content: string
): Effect.Effect<unknown, FixtureDecodeError> =>
  Effect.try({
    catch: (cause) =>
      new FixtureDecodeError({
        filePath,
        message: cause instanceof Error ? cause.message : "Invalid JSON"
      }),
    try: () => JSON.parse(content) as unknown
  })

export const decodeJsonContent = <A, I>(
  filePath: string,
  schema: Schema.Schema<A, I>,
  content: string
): Effect.Effect<A, FixtureDecodeError> =>
  Effect.gen(function*() {
    const parsed = yield* parseJsonString(filePath, content)
    return yield* decodeSchema(filePath, schema, parsed)
  })

export const decodeJsonFile = <A, I>(
  filePath: string,
  schema: Schema.Schema<A, I>,
  content: string
): Effect.Effect<A, FixtureDecodeError> => decodeJsonContent(filePath, schema, content)
