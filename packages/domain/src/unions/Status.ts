import { Schema } from "@effect/schema"

export const Status = Schema.Literal("Draft", "Active", "Deprecated").annotations({
  description:
    "Controls validation strictness: Draft warns on incompleteness, Active enforces rules, Deprecated is exempt unless referenced by Active primitives",
  identifier: "Status",
  title: "Primitive Status"
})

export type Status = typeof Status.Type
