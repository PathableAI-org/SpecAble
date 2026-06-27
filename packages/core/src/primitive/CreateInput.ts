import { Schema } from "@effect/schema"
import { Status } from "@specable/domain"

import { AlphaPrimitiveType } from "./PrimitiveSummary.js"

export const CreateInput = Schema.Struct({
  fields: Schema.optional(
    Schema.Record({ key: Schema.String, value: Schema.Unknown }).annotations({
      description: "Optional top-level semantic fields from CLI --set",
      identifier: "CreateInputFields",
      title: "Fields"
    })
  ),
  name: Schema.NonEmptyString.annotations({
    description: "Display name for the new primitive",
    identifier: "CreateInputName",
    title: "Name"
  }),
  rootPath: Schema.String.annotations({
    description: "Project root directory path",
    identifier: "CreateInputRootPath",
    title: "Root Path"
  }),
  status: Schema.optional(Status),
  type: AlphaPrimitiveType.annotations({
    description: "Target primitive type",
    identifier: "CreateInputType",
    title: "Type"
  })
}).annotations({
  description: "Input boundary for PrimitiveService.create",
  identifier: "CreateInput",
  title: "Create Input"
})

export type CreateInput = typeof CreateInput.Type
