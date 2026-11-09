import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimate, calibrate, quantity, csvCell} from '../src/domain.js';
test('material waste, tax, overhead and true margin', () => {
  const result = estimate([{category:'Material',qty:10,unitCost:10,waste:10},{category:'Labor',qty:2,unitCost:50,waste:50}], {taxPct:10,overheadPct:10,profitPct:20});
  assert.ok(Math.abs(result.subtotal - 210) < 1e-9);
  assert.ok(Math.abs(result.price - 303.875) < 1e-9);
  assert.ok(Math.abs(result.profit / result.price - 0.2) < 1e-9);
});
test('markup differs from margin and invalid financial inputs are rejected', () => {
  const lines=[{category:'Labor',qty:1,unitCost:100,waste:0}];
  assert.equal(estimate(lines,{profitPct:20,profitMode:'markup'}).price,120);
  assert.equal(estimate(lines,{profitPct:20}).price,125);
  assert.throws(()=>estimate(lines,{profitPct:100}));
  assert.throws(()=>estimate([{...lines[0],qty:Infinity}]));
  assert.throws(()=>estimate([{...lines[0],unitCost:-1}]));
});
test('calibrated lengths, polygons, counts, and degenerate calibration', () => {
  const points=[{x:0,y:0},{x:100,y:0},{x:100,y:50},{x:0,y:50}];
  const scale=calibrate(points.slice(0,2),10);
  assert.equal(quantity('length',points.slice(0,2),scale),10);
  assert.ok(Math.abs(quantity('area',points,scale)-50)<1e-9);
  assert.equal(quantity('count',points,null),4);
  assert.throws(()=>calibrate([points[0],points[0]],10));
  assert.throws(()=>quantity('length',points.slice(0,2),null));
});
test('CSV escapes quotes and spreadsheet formulas',()=>{
  assert.equal(csvCell('=HYPERLINK("bad")'),'"\'=HYPERLINK(""bad"")"');
});
test('all twelve starter trades and a custom specialty combine without schema changes',()=>{
  const trades=['Sitework','Concrete','Framing','Roofing','Exterior','Electrical','Plumbing','HVAC','Drywall','Interiors','Openings','Specialty','Fire suppression'];
  const lines=trades.flatMap(trade=>['Material','Labor','Equipment','Subcontract'].map(category=>({trade,category,qty:1,unitCost:100,waste:10})));
  assert.equal(estimate(lines).subtotal,5330);
});
test('crossed polygon boundaries are rejected',()=>{
  assert.throws(()=>quantity('area',[{x:0,y:0},{x:100,y:100},{x:0,y:100},{x:100,y:0}],1),/cross/);
});
