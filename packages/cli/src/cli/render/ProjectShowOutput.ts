import type { ProjectDescriptor } from "@specable/core"

export const formatProjectShowOutput = (descriptor: ProjectDescriptor.ProjectDescriptor): string =>
  [
    `projectId: ${descriptor.projectId}`,
    `name: ${descriptor.name}`,
    `rootPath: ${descriptor.rootPath}`,
    `schemaVersion: ${descriptor.schemaVersion}`,
    `storage.type: ${descriptor.storage.type}`,
    `storage.location: ${descriptor.storage.location}`,
    `primitiveTypes: ${descriptor.primitiveTypes.join(", ")}`,
    `graph.totalPrimitives: ${descriptor.graph.totalPrimitives}`,
    `graph.empty: ${descriptor.graph.empty}`,
    `createdAt: ${descriptor.createdAt}`
  ].join("\n")
