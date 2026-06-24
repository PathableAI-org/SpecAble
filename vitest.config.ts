import { mergeConfig, type UserConfigExport } from "vitest/config"

import shared from "./vitest.shared.ts"

const config: UserConfigExport = {
  test: {
    include: ["packages/*/test/**/*.test.ts"],
    passWithNoTests: true
  }
}

export default mergeConfig(shared, config)
