import type { ParseError } from "@effect/schema/ParseResult"

import { ArrayFormatter, Schema } from "@effect/schema"
import { Effect } from "effect"

import { IncompleteProjectError } from "../project/errors.js"

const parseFailureMessage = (error: ParseError): string =>
  ArrayFormatter.formatErrorSync(error)[0]?.message ?? "Schema decode failed"

export const parseJsonString = (
  path: string,
  content: string
): Effect.Effect<unknown, IncompleteProjectError> =>
  Effect.try({
    catch: (cause) =>
      new IncompleteProjectError({
        message: cause instanceof Error ? cause.message : "Invalid JSON",
        path
      }),
    try: () => JSON.parse(content) as unknown
  })

export const decodeUnknownAtPath = <A, I>(
  path: string,
  schema: Schema.Schema<A, I, never>,
  input: unknown,
  failureMessage?: string
): Effect.Effect<A, IncompleteProjectError> =>
  Schema.decodeUnknown(schema)(input).pipe(
    Effect.mapError((error) =>
      new IncompleteProjectError({
        message: failureMessage ?? parseFailureMessage(error),
        path
      })
    )
  )

export const decodeJsonContent = <A, I>(
  path: string,
  schema: Schema.Schema<A, I, never>,
  content: string,
  failureMessage?: string
): Effect.Effect<A, IncompleteProjectError> =>
  Effect.gen(function*() {
    const parsed = yield* parseJsonString(path, content)
    return yield* decodeUnknownAtPath(path, schema, parsed, failureMessage)
  })
