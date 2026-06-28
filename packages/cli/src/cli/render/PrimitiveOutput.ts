import type { Primitive } from "@specable/domain"

const TYPE_COLUMN_WIDTH = 14

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
