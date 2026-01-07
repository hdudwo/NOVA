export function initScene(container, preset = {}) {
  // three.js scene/camera/renderer wiring will live here
  return {
    container,
    preset,
    scene: null,
    camera: null,
    renderer: null,
  }
}





