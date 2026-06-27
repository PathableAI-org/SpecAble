import { After, Before, setWorldConstructor } from "@cucumber/cucumber"
import * as fs from "node:fs/promises"

import { assertSpecableBuilt } from "../../integration/helpers/runSpecable.js"
import { removeTempProjectParent } from "../../integration/helpers/tempProjectRoot.js"
import { SpecAbleWorld } from "./world.js"

setWorldConstructor(SpecAbleWorld)

Before(function() {
  assertSpecableBuilt()
})

After(async function(this: SpecAbleWorld) {
  if (this.tempProjectPath !== undefined) {
    await removeTempProjectParent(this.tempProjectPath)
    delete this.tempProjectPath
    delete this.tempParentPath
  }

  if (this.checkOutDir !== undefined) {
    await fs.rm(this.checkOutDir, { force: true, recursive: true })
    delete this.checkOutDir
  }

  delete this.lastResult
  delete this.checkExamplePath
})
