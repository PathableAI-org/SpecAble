import type { PrimitiveBase } from "@specable/domain"

import { PrimitiveBase as PrimitiveBaseModule } from "@specable/domain"

export const integrityIds = {
  actorDisconnected: PrimitiveBaseModule.makePrimitiveId("actor-disconnected"),
  capSchedule: PrimitiveBaseModule.makePrimitiveId("cap-schedule"),
  capScheduleASession: PrimitiveBaseModule.makePrimitiveId("cap-schedule-a-session"),
  capScheduleSession: PrimitiveBaseModule.makePrimitiveId("cap-schedule-session"),
  storyOrphan: PrimitiveBaseModule.makePrimitiveId("story-orphan"),
  workflowGap: PrimitiveBaseModule.makePrimitiveId("workflow-gap")
} as const

export const makePrimitiveId = (id: string): PrimitiveBase.PrimitiveId => PrimitiveBaseModule.makePrimitiveId(id)
