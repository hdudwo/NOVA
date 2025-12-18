import { initScene } from './core/initScene.js'
import defaultPreset from './presets/default.js'

export function buildUniverse(container, preset = defaultPreset) {
  const context = initScene(container, preset)
  return {
    ...context,
    preset,
  }
}


