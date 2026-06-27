import type { Primitive } from "@specable/domain"

export interface PrimitiveCreateSuccessDetails {
  readonly id: string
  readonly name: string
  readonly rootPath: string
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
