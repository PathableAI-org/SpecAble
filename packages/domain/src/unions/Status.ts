import { Schema } from "@effect/schema"

import { valueDescriptionsJsonSchema } from "../GraphAnnotations.js"

export const Status = Schema.Literal("Draft", "Active", "Deprecated").annotations({
  description:
    "Controls validation strictness: Draft warns on incompleteness, Active enforces rules, Deprecated is exempt unless referenced by Active primitives",
  documentation:
    "Allowed values:\n- `Draft`: in-progress primitive; validation reports incompleteness as warnings.\n- `Active`: canonical primitive in use; validation enforces required fields and relationships.\n- `Deprecated`: retired primitive; ignored unless an Active primitive still references it.",
  examples: ["Draft", "Active", "Deprecated"],
  identifier: "Status",
  jsonSchema: valueDescriptionsJsonSchema({
    Active: "Canonical primitive in use; validation enforces required fields and relationships.",
    Deprecated: "Retired primitive; exempt from normal validation unless referenced by Active primitives.",
    Draft: "In-progress primitive; validation reports incompleteness as warnings."
  }),
  title: "Primitive Status"
})

export type Status = typeof Status.Type
