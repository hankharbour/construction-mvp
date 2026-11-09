/** Canonical drawing coordinates: unrotated page pixels at the stored render size. */
/** @param {unknown} value */
export function nonnegative(value, label = 'Value') {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${label} must be finite and nonnegative.`);
  return number;
}
/** @param {import("./models").Point} a @param {import("./models").Point} b */
export function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
/** @param {[import("./models").Point, import("./models").Point]} points @param {number} feet */
export function calibrate(points, feet) {
  const span = distance(points[0],points[1]);
  if (!Number.isFinite(span) || span < 1 || !(Number.isFinite(feet) && feet > 0)) throw new Error('Use distinct endpoints and a positive known distance.');
  return feet / span;
}
/** @param {import("./models").MeasurementKind} kind @param {import("./models").Point[]} points @param {number | null} scale */
export function quantity(kind, points, scale) {
  if (kind === 'count') return points.length;
  if (!(Number.isFinite(scale) && scale > 0)) throw new Error('Calibrate this page first.');
  if (kind === 'length') {
    if (points.length !== 2) throw new Error('Select two endpoints.');
    return distance(points[0],points[1]) * scale;
  }
  if (points.length < 3) throw new Error('Select at least three polygon corners.');
  // Reject crossed boundaries instead of reporting misleading shoelace quantities.
  /** @param {import("./models").Point} a @param {import("./models").Point} b @param {import("./models").Point} c */
  const cross = (a, b, c) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  for(let i=0;i<points.length;i++) for(let j=i+1;j<points.length;j++) {
    const nextI=(i+1)%points.length, nextJ=(j+1)%points.length;
    if(nextI===j || nextJ===i) continue;
    const a=points[i],b=points[nextI],c=points[j],d=points[nextJ];
    if(cross(a,b,c)*cross(a,b,d)<0 && cross(c,d,a)*cross(c,d,b)<0) throw new Error('Polygon edges cross. Redraw a simple boundary.');
  }
  const area = Math.abs(points.reduce((sum, p, i) => {
    const next = points[(i + 1) % points.length];
    return sum + p.x * next.y - next.x * p.y;
  }, 0)) / 2;
  if (area === 0) throw new Error('Polygon area must be greater than zero.');
  return area * scale ** 2;
}
/** @param {import("./models").EstimateLine} line */
export function lineCost(line) {
  return nonnegative(line.qty) * nonnegative(line.unitCost) * (1 + (line.category === 'Material' ? nonnegative(line.waste) : 0) / 100);
}
/** @param {import("./models").EstimateLine[]} lines @param {import("./models").EstimateOptions} options */
export function estimate(lines, {taxPct = 0, overheadPct = 0, profitPct = 0, profitMode = 'margin'} = {}) {
  let subtotal = 0, materials = 0;
  for (const line of lines) { const amount = lineCost(line); subtotal += amount; if (line.category === 'Material') materials += amount; }
  const tax = materials * nonnegative(taxPct) / 100;
  const overhead = (subtotal + tax) * nonnegative(overheadPct) / 100;
  const base = subtotal + tax + overhead, rate = nonnegative(profitPct) / 100;
  if (profitMode === 'margin' && rate >= 1) throw new Error('Profit margin must be less than 100%.');
  const price = profitMode === 'markup' ? base * (1 + rate) : base / (1 - rate);
  if (![subtotal, tax, overhead, price].every(Number.isFinite)) throw new Error('Estimate exceeds supported numeric range.');
  return {subtotal, materials, tax, overhead, base, profit: price - base, price};
}
/** @param {unknown} value */
export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
