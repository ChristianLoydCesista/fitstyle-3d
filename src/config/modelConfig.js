const BASE_URL = import.meta.env.BASE_URL;

export const MODEL_CONFIG = {
  // Vite resolves BASE_URL to "/" in local dev and "/fitstyle-3d/" on
  // GitHub Pages, so Michelle loads correctly in both environments.
  michellePath: `${BASE_URL}models/Michelle.glb`,
  targetHeightMeters: 1.75,

  // Keep the fitting model stationary for now.
  playAnimation: false,

  // If Michelle.glb is absent or invalid, the viewer remains usable
  // by showing a procedural development fallback.
  allowProceduralFallback: true,
};
