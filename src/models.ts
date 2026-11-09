export interface Point { x: number; y: number }
export interface DrawingSource { name: string; size: number; sha256: string }
export interface Calibration { points: [Point, Point]; knownFeet: number; feetPerPixel: number; timestamp: string }
export type MeasurementKind = 'length' | 'area' | 'count';
export interface Measurement {
  id: string; label: string; kind: MeasurementKind; points: Point[];
  value: number; unit: 'ft' | 'sq ft' | 'each'; source: DrawingSource;
  page: number; scale: number | null; calibration: Calibration | null;
  formula: string; verified: false; createdAt: string; updatedAt?: string;
}
export interface EstimateLine {
  id?: string; trade: string; name: string; category: 'Material' | 'Labor' | 'Equipment' | 'Subcontract';
  qty: number; unit: string; unitCost: number; waste: number; code: string;
  source?: Measurement | {status: 'unverified'; assumption: string};
}
export interface EstimateOptions { taxPct?: number; overheadPct?: number; profitPct?: number; profitMode?: 'margin' | 'markup' }
