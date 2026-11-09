import {lineCost} from './domain.js';
const key = 'dead-on-pro-estimate-v2';
const legacyKey = 'construction-mvp-lines-v1';
export const defaultSettings = {taxPct:0, overheadPct:10, profitPct:20, profitMode:'margin'};
export function validLine(line) {
  if (!line || !['trade','name','category','unit','code'].every(k => typeof line[k] === 'string')) return false;
  if (!['Material','Labor','Equipment','Subcontract'].includes(line.category)) return false;
  try { return Number.isFinite(lineCost(line)); } catch { return false; }
}
export function loadEstimate(storage) {
  try {
    const saved = JSON.parse(storage.getItem(key) || 'null');
    const lines = saved?.schemaVersion === 2 ? saved.lines : JSON.parse(storage.getItem(legacyKey) || '[]');
    const settings = {...defaultSettings};
    if (saved?.schemaVersion === 2 && saved.settings) {
      for (const k of ['taxPct','overheadPct','profitPct']) if (Number.isFinite(saved.settings[k]) && saved.settings[k] >= 0) settings[k] = saved.settings[k];
      if (['margin','markup'].includes(saved.settings.profitMode)) settings.profitMode=saved.settings.profitMode;
      if(settings.profitMode==='margin' && settings.profitPct>=100) settings.profitPct=20;
    }
    return {lines:Array.isArray(lines) ? lines.filter(validLine) : [], settings};
  } catch { return {lines:[],settings:{...defaultSettings}}; }
}
export function saveEstimate(storage, state) {
  storage.setItem(key,JSON.stringify({schemaVersion:2,...state}));
  storage.removeItem(legacyKey);
}
