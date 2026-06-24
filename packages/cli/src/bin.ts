#!/usr/bin/env node

import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"

Effect.void.pipe(NodeRuntime.runMain)
