import type { ParseError } from "@effect/schema/ParseResult"

import { ArrayFormatter, Schema } from "@effect/schema"
import {
  Actor,
  Capability,
  CapabilityConceptLink,
  DomainConcept,
  ExpectedResult,
  Objective,
  Persona,
  type Primitive,
  Story,
  Workflow
} from "@specable/domain"
import { Effect } from "effect"

import type { CanonicalPrimitiveType } from "./PrimitiveTypes.js"

import { isAlphaPrimitiveType, PrimitiveValidationError } from "../primitive/errors.js"
import { ALPHA_PRIMITIVE_TYPES, AlphaPrimitiveType, type PrimitiveSummary } from "../primitive/PrimitiveSummary.js"

const schemaByType = {
  Actor,
  Capability,
  CapabilityConceptLink,
  DomainConcept,
  ExpectedResult,
  Objective,
  Persona,
  Story,
  Workflow
} as const

export const isAlphaCreatableType = (type: string): type is AlphaPrimitiveType =>
  (ALPHA_PRIMITIVE_TYPES as readonly string[]).includes(type)

export const schemaForType = <T extends CanonicalPrimitiveType>(type: T): (typeof schemaByType)[T] => schemaByType[type]

export const summaryFromPrimitive = (primitive: Primitive): PrimitiveSummary => {
  if (!isAlphaPrimitiveType(primitive.type)) {
    throw new Error(`Cannot summarize non-alpha primitive type: ${primitive.type}`)
  }

  return {
    id: primitive.id,
    name: primitive.name,
    status: primitive.status,
    type: primitive.type
  }
}

const validationErrorFromParse = (
  type: string,
  path: string,
  error: ParseError
): PrimitiveValidationError => {
  const formatted = ArrayFormatter.formatErrorSync(error)
  const fieldPaths = formatted
    .map((entry) => entry.path?.join(".") ?? "")
    .filter((entry) => entry.length > 0)
  const message = formatted[0]?.message ?? "Schema decode failed"

  return new PrimitiveValidationError({
    fieldPaths: fieldPaths.length > 0 ? fieldPaths : undefined,
    message,
    path,
    type
  })
}

export const decodePrimitiveUnknown = (
  type: CanonicalPrimitiveType,
  path: string,
  input: unknown
): Effect.Effect<Primitive, PrimitiveValidationError> => {
  const schema = schemaForType(type) as Schema.Schema<Primitive, unknown, never>

  return Schema.decodeUnknown(schema)(input).pipe(
    Effect.mapError((error) => validationErrorFromParse(type, path, error))
  )
}

export const decodeAlphaPrimitiveUnknown = (
  type: AlphaPrimitiveType,
  path: string,
  input: unknown
): Effect.Effect<Primitive, PrimitiveValidationError> => decodePrimitiveUnknown(type, path, input)

export const AlphaPrimitiveTypeSchema = AlphaPrimitiveType
