import { mergeConfig, type UserConfigExport } from "vitest/config"

import shared from "./vitest.shared.js"

const config: UserConfigExport = {
  test: {
    include: ["packages/*/test/**/*.test.ts"]
  }
}

export default mergeConfig(shared, config)
