import type { ParseError } from "@effect/schema/ParseResult"

import { ArrayFormatter, Schema } from "@effect/schema"
import { errors as domainErrors } from "@specable/domain"
import { Effect, Either } from "effect"

type FixtureDecodeError = domainErrors.FixtureDecodeError

const decodeFailureMessage = (error: ParseError): string =>
  ArrayFormatter.formatErrorSync(error)[0]?.message ?? "Schema decode failed"

const decodeSchema = <A, I>(
  filePath: string,
  schema: Schema.Schema<A, I, never>,
  parsed: unknown
): Effect.Effect<A, FixtureDecodeError> => {
  const result = Schema.decodeUnknownEither(schema)(parsed)

  return Either.match(result, {
    onLeft: (error) =>
      Effect.fail(new domainErrors.FixtureDecodeError({ filePath, message: decodeFailureMessage(error) })),
    onRight: Effect.succeed
  })
}

export const parseJsonString = (
  filePath: string,
  content: string
): Effect.Effect<unknown, FixtureDecodeError> =>
  Effect.try({
    catch: (cause) =>
      new domainErrors.FixtureDecodeError({
        filePath,
        message: cause instanceof Error ? cause.message : "Invalid JSON"
      }),
    try: () => JSON.parse(content) as unknown
  })

export const decodeJsonContent = <A, I>(
  filePath: string,
  schema: Schema.Schema<A, I, never>,
  content: string
): Effect.Effect<A, FixtureDecodeError> =>
  Effect.gen(function*() {
    const parsed = yield* parseJsonString(filePath, content)
    return yield* decodeSchema(filePath, schema, parsed)
  })

export const decodeJsonFile = <A, I>(
  filePath: string,
  schema: Schema.Schema<A, I, never>,
  content: string
): Effect.Effect<A, FixtureDecodeError> => decodeJsonContent(filePath, schema, content)
