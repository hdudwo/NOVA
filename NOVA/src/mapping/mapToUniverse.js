

import defaultPreset from '../universe/presets/default.js'

export function mapToUniverse(analysis = {}) {
  return {
    ...defaultPreset,
    analysis,
  }
}


