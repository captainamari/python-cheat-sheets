export interface FieldParams {
  seed: number;
  strands: number;
  amplitude: number;
  twist: number;
  colorPalette: string[];
}
export interface Strand {
  points: [number, number][];
  color: string;
  opacity: number;
  weight: number;
}
export const fieldDefaults: FieldParams = {
  seed: 31415,
  strands: 72,
  amplitude: 42,
  twist: 1.15,
  colorPalette: ['#a95137', '#376b67', '#8b784b'],
};

/** One deterministic geometry source for the build-time SVG and the p5.js viewer. */
export function generateField(input: FieldParams = fieldDefaults): Strand[] {
  const strands = Math.round(Math.max(24, Math.min(100, input.strands)));
  const amplitude = Math.max(10, Math.min(65, input.amplitude));
  const twist = Math.max(0.4, Math.min(2, input.twist));
  let state = input.seed >>> 0 || 1;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const phase = random() * Math.PI * 2;
  const rotation = -0.45 + random() * 0.25;
  const harmonic = random() * Math.PI * 2;
  const palette = input.colorPalette.length ? input.colorPalette : fieldDefaults.colorPalette;
  const result: Strand[] = [];
  for (let i = 0; i < strands; i++) {
    const lane = i / (strands - 1);
    const points: [number, number][] = [];
    for (let j = 0; j <= 180; j++) {
      const t = (j / 180) * Math.PI * 2;
      const r = 91 + lane * 103 + amplitude * Math.sin(2 * t + phase + lane * twist);
      const x = r * Math.cos(t) + 20 * Math.sin(3 * t + harmonic) * lane;
      const y = r * Math.sin(t) * 0.92 + 32 * Math.sin(t * 2 + lane * twist);
      points.push([
        Number((300 + 0.85 * (x * Math.cos(rotation) - y * Math.sin(rotation))).toFixed(2)),
        Number((270 + 0.85 * (x * Math.sin(rotation) + y * Math.cos(rotation))).toFixed(2)),
      ]);
    }
    result.push({
      points,
      color: palette[Math.min(palette.length - 1, Math.floor(lane * palette.length))],
      opacity: 0.52 + Math.sin(lane * Math.PI) * 0.22,
      weight: i % 13 === 0 ? 1.35 : 0.8,
    });
  }
  return result;
}
