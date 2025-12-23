export function animate(update) {
  let frameId = null

  const loop = () => {
    update?.()
    frameId = requestAnimationFrame(loop)
  }

  frameId = requestAnimationFrame(loop)

  return () => {
    if (frameId) {
      cancelAnimationFrame(frameId)
    }
  }
}




