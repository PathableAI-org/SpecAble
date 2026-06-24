import { Schema } from "@effect/schema"

export const ActorCategory = Schema.Literal(
  "Human",
  "System",
  "AI",
  "Organization",
  "External"
).annotations({
  description: "Classification of who or what participates in product behavior",
  documentation:
    "Allowed values:\n- `Human`: an individual person or user role.\n- `System`: software or infrastructure acting in the workflow.\n- `AI`: AI model, assistant, or agent participating in behavior.\n- `Organization`: team, company, or institution acting as a participant.\n- `External`: third-party actor outside the product boundary.",
  examples: ["Human", "System", "AI"],
  identifier: "ActorCategory",
  title: "Actor Category"
})

export type ActorCategory = typeof ActorCategory.Type
