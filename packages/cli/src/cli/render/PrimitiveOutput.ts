import type { Primitive } from "@specable/domain"

const TYPE_COLUMN_WIDTH = 14

const PRIMITIVE_HEADER_FIELDS = ["id", "type", "name", "status"] as const

export interface PrimitiveCreateSuccessDetails {
  readonly id: string
  readonly name: string
  readonly rootPath: string
  readonly status: Primitive["status"]
  readonly type: Primitive["type"]
}

export interface PrimitiveListEntry {
  readonly id: string
  readonly name: string
  readonly status: Primitive["status"]
  readonly type: Primitive["type"]
}

export const formatPrimitiveCreateSuccessOutput = (details: PrimitiveCreateSuccessDetails): string =>
  [
    `Created ${details.type} "${details.name}"`,
    `  id: ${details.id}`,
    `  status: ${details.status}`,
    `  root: ${details.rootPath}`
  ].join("\n")

export const formatPrimitiveListSuccessOutput = (
  rootPath: string,
  summaries: readonly PrimitiveListEntry[]
): string => {
  const header = `${summaries.length} primitives in ${rootPath}`

  if (summaries.length === 0) {
    return header
  }

  const lines = summaries.map((summary) => {
    const typeColumn = summary.type.padEnd(TYPE_COLUMN_WIDTH, " ")

    return `${typeColumn}  ${summary.id}  "${summary.name}"  ${summary.status}`
  })

  return [header, "", ...lines].join("\n")
}

export const formatPrimitiveGetSuccessOutput = (primitive: Primitive): string => {
  const lines = [
    `id: ${primitive.id}`,
    `type: ${primitive.type}`,
    `name: ${primitive.name}`,
    `status: ${primitive.status}`
  ]

  const reserved = new Set<string>(PRIMITIVE_HEADER_FIELDS)
  const extraKeys = Object.keys(primitive)
    .filter((key) => !reserved.has(key))
    .sort((left, right) => left.localeCompare(right))

  const extraLines = extraKeys.flatMap((key) => {
    const value = primitive[key as keyof Primitive]

    return value === undefined ? [] : [`${key}: ${formatPrimitiveFieldValue(value)}`]
  })

  return [...lines, ...extraLines].join("\n")
}

const formatPrimitiveFieldValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  return JSON.stringify(value)
}
