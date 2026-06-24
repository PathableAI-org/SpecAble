import { Schema } from "@effect/schema"

export interface GraphEdgeAnnotation {
  readonly cardinality: GraphEdgeCardinality
  readonly from: GraphPrimitiveType
  readonly kind: "edge"
  readonly requiredWhenActive?: boolean
  readonly role: string
  readonly to: GraphPrimitiveType
}

export type GraphEdgeCardinality = "many" | "one"

export interface GraphFieldAnnotation {
  readonly kind: "field"
  readonly owner: "PrimitiveBase" | "Reference" | GraphPrimitiveType
  readonly role: string
}

export interface GraphNodeAnnotation {
  readonly kind: "node"
  readonly type: GraphPrimitiveType
}

export type GraphPrimitiveType =
  | "Actor"
  | "Capability"
  | "CapabilityConceptLink"
  | "DomainConcept"
  | "ExpectedResult"
  | "Objective"
  | "Persona"
  | "Story"
  | "Workflow"

export const graphNode = (type: GraphPrimitiveType): GraphNodeAnnotation => ({
  kind: "node",
  type
})

export const graphField = (owner: GraphFieldAnnotation["owner"], role: string): GraphFieldAnnotation => ({
  kind: "field",
  owner,
  role
})

export const graphEdge = (annotation: Omit<GraphEdgeAnnotation, "kind">): GraphEdgeAnnotation => ({
  kind: "edge",
  ...annotation
})

export const relationship = (options: {
  readonly cardinality: GraphEdgeCardinality
  readonly description: string
  readonly from: GraphPrimitiveType
  readonly identifier: string
  readonly requiredWhenActive?: boolean
  readonly role: string
  readonly title: string
  readonly to: GraphPrimitiveType
}) => {
  const edge = options.requiredWhenActive === undefined
    ? graphEdge({
      cardinality: options.cardinality,
      from: options.from,
      role: options.role,
      to: options.to
    })
    : graphEdge({
      cardinality: options.cardinality,
      from: options.from,
      requiredWhenActive: options.requiredWhenActive,
      role: options.role,
      to: options.to
    })

  return {
    description: options.description,
    documentation:
      `Graph edge: ${options.from} -> ${options.to}; role: ${options.role}; cardinality: ${options.cardinality}. ${options.description}`,
    identifier: options.identifier,
    jsonSchema: {
      graph: edge
    },
    title: options.title
  }
}

export const graphJsonSchema = (
  graph: GraphEdgeAnnotation | GraphFieldAnnotation | GraphNodeAnnotation
): { readonly graph: GraphEdgeAnnotation | GraphFieldAnnotation | GraphNodeAnnotation } => ({
  graph
})

export const valueDescriptionsJsonSchema = <const Values extends Record<string, string>>(
  values: Values
): { readonly valueDescriptions: Values } => ({
  valueDescriptions: values
})

const primitiveTypeTitle = (type: GraphPrimitiveType): string => type.replace(/([a-z])([A-Z])/g, "$1 $2")

export const primitiveTypeLiteral = <const Type extends GraphPrimitiveType>(type: Type) =>
  Schema.Literal(type).annotations({
    description: `Discriminator value identifying this primitive as ${primitiveTypeTitle(type)}`,
    documentation: `Use \`${type}\` in the \`type\` field only for ${primitiveTypeTitle(type)} primitives.`,
    examples: [type],
    identifier: `${type}Type`,
    jsonSchema: graphJsonSchema(graphNode(type)),
    title: `${primitiveTypeTitle(type)} Type`
  })
