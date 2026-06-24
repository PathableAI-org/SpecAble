import { Schema } from "@effect/schema"

export const ActorCategory = Schema.Literal(
  "Human",
  "System",
  "AI",
  "Organization",
  "External"
).annotations({
  description: "Classification of who or what participates in product behavior",
  identifier: "ActorCategory",
  title: "Actor Category"
})

export type ActorCategory = typeof ActorCategory.Type
