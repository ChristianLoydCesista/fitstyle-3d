export const MODEL_CONFIG = {
  michellePath: "./models/Michelle.glb",
  targetHeightMeters: 1.75,

  // Keep the fitting model stationary for now.
  playAnimation: false,

  // If Michelle.glb is absent or invalid, the viewer remains usable
  // by showing a procedural development fallback.
  allowProceduralFallback: true,
};
