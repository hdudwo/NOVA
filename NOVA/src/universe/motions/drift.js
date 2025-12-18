export function applyDrift(object, delta = 0.016) {
  if (!object) return

  const drift = Math.sin(Date.now() * 0.001) * 0.1 * delta
  if (object.position) {
    object.position.x += drift
    object.position.y -= drift * 0.5
  }
}


