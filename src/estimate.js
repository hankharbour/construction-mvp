import {estimate, lineCost, csvCell, nonnegative} from './domain.js';
import {loadEstimate,saveEstimate,defaultSettings} from './storage.js';
import {download} from './download.js';
const $ = id => document.getElementById(id);
const money = value => value.toLocaleString('en-US',{style:'currency',currency:'USD'});
let state;
try { state=loadEstimate(localStorage); } catch { state={lines:[],settings:{...defaultSettings}}; }
let lines=state.lines, selectedMeasurement=null, editingIndex=null;
const settingsIds={taxPct:'taxPct',overheadPct:'overheadPct',profitPct:'marginPct',profitMode:'profitMode'};
for(const [key,id] of Object.entries(settingsIds)) $(id).value=state.settings[key];
function settings() {
  const result={profitMode:$('profitMode').value};
  for(const key of ['taxPct','overheadPct','profitPct']) result[key]=nonnegative($(settingsIds[key]).value,key);
  return result;
}
function status(text) { $('estimateNotice').textContent=text; }
function persist() {
  try {saveEstimate(localStorage,{lines,settings:settings()});}
  catch {status('Browser storage unavailable or full. Export your estimate before leaving.');}
  draw();
}
function resetEditor() {
  editingIndex=null;selectedMeasurement=null;$('addLine').textContent='Add line item';$('cancelEdit').hidden=true;$('itemName').value='';
}
function editLine(index) {
  const line=lines[index];editingIndex=index;
  for(const [id,key] of Object.entries({itemName:'name',itemQty:'qty',itemUnit:'unit',itemCost:'unitCost',itemWaste:'waste',costCode:'code',costCategory:'category'})) $(id).value=line[key];
  $('customTrade').value=line.trade;selectedMeasurement=line.source?.points ? structuredClone(line.source) : null;
  $('addLine').textContent='Save line changes';$('cancelEdit').hidden=false;$('itemName').focus();
  status('Editing a line. Changing its quantity removes the drawing link and records a manual assumption.');
}
function button(text,handler) {const button=document.createElement('button');button.textContent=text;button.onclick=handler;return button;}
function draw() {
  const rows=$('lineRows');rows.replaceChildren();
  lines.forEach((line,index)=>{
    const row=rows.insertRow(),title=row.insertCell();
    const trade=document.createElement('b');trade.textContent=line.trade;title.append(trade);
    for(const value of [line.name,line.code]) {const div=document.createElement('div');div.textContent=value;title.append(div);}
    const source=document.createElement('small');
    source.textContent=line.source?.points ? `Drawing p.${line.source.page} · unverified snapshot` : 'Manual quantity · unverified assumption';title.append(source);
    if(line.source?.points) title.append(button('View drawing source',()=>window.dispatchEvent(new CustomEvent('view-measurement',{detail:line.source}))));
    for(const value of [line.category,line.qty,line.unit,money(lineCost(line))]) row.insertCell().textContent=value;
    const actions=row.insertCell();actions.append(button('Edit',()=>editLine(index)),button('Remove',()=>{lines.splice(index,1);resetEditor();persist();}));
  });
  if(!lines.length) {const cell=rows.insertRow().insertCell();cell.colSpan=6;cell.textContent='No line items yet. Enter a manual quantity or copy a drawing measurement.';}
  try {
    const options=settings(),t=estimate(lines,options);
    $('marginPct').max=options.profitMode==='margin'?'99.99':'';
    $('estimateTotals').textContent=`Direct costs: ${money(t.subtotal)} · Material tax allowance: ${money(t.tax)} · Overhead: ${money(t.overhead)} · Estimated bid: ${money(t.price)} · Target profit: ${money(t.profit)} (${options.profitPct}% ${options.profitMode})`;
  } catch(error) {$('estimateTotals').textContent=error.message;}
}
window.addEventListener('measurement-selected',event=>{editingIndex=null;selectedMeasurement=event.detail;$('addLine').textContent='Add line item';$('cancelEdit').hidden=true;status('Drawing snapshot selected. Review the quantity, trade and pricing before adding.');});
window.addEventListener('measurement-view-error',event=>status(event.detail));
$('addLine').onclick=()=>{
  try {
    const name=$('itemName').value.trim();if(!name) throw new Error('Enter an item description.');
    const qty=nonnegative($('itemQty').value,'Quantity');
    const line={id:editingIndex===null?crypto.randomUUID():lines[editingIndex].id,trade:$('customTrade').value.trim()||$('tradeType').value,name,category:$('costCategory').value,qty,unit:$('itemUnit').value,unitCost:nonnegative($('itemCost').value,'Unit cost'),waste:nonnegative($('itemWaste').value,'Waste'),code:$('costCode').value.trim(),source:selectedMeasurement && qty===selectedMeasurement.value && $('itemUnit').value===(selectedMeasurement.unit==='ft'?'linear ft':selectedMeasurement.unit) ? structuredClone(selectedMeasurement) : {status:'unverified',assumption:'Manually entered or corrected quantity; drawing scale not verified.'}};
    const next=[...lines];if(editingIndex===null)next.push(line);else next[editingIndex]=line;
    estimate(next,settings());lines=next;resetEditor();persist();status('Estimate saved in this browser. Quantities remain unverified.');
  } catch(error) {status(error.message);}
};
$('cancelEdit').onclick=resetEditor;
$('clearLines').onclick=()=>{if(confirm('Clear all estimate items?')){lines=[];resetEditor();persist();status('Estimate items cleared.');}};
for(const id of Object.values(settingsIds)) $(id).addEventListener('input',()=>{
  try {estimate(lines,settings());persist();status('Pricing settings saved.');}catch(error){draw();status(error.message);}
});
function snapshot() {const options=settings();return {schemaVersion:2,status:'unverified',currency:'USD',createdAt:new Date().toISOString(),settings:options,lines,summary:estimate(lines,options),assumptions:['Material tax is an illustrative cost allowance.','Drawing quantities are snapshots; source edits do not automatically revise estimate lines.','All quantities and user-supplied rates require review.']};}
$('exportLinesJson').onclick=()=>{try{download('dead-on-pro-estimate.json',JSON.stringify(snapshot(),null,2),'application/json');}catch(error){status(error.message);}};
$('exportLines').onclick=()=>{
  try {
    const saved=snapshot();
    const rows=[['Trade','Description','Category','Cost Code','Quantity','Unit','Unit Cost','Waste Percent','Extended Cost','Source','Page','Formula','Status'],...lines.map(line=>[line.trade,line.name,line.category,line.code,line.qty,line.unit,line.unitCost,line.category==='Material'?line.waste:0,lineCost(line).toFixed(2),line.source?.source?.name||'Manual assumption',line.source?.page||'',line.source?.formula||line.source?.assumption||'Manual quantity','unverified'])];
    rows.push([],['Pricing setting','Value'],...Object.entries(saved.settings),[],['Summary','USD'],...Object.entries(saved.summary).map(([k,v])=>[k,v.toFixed(2)]));
    download('dead-on-pro-estimate.csv',rows.map(row=>row.map(csvCell).join(',')).join('\r\n'),'text/csv');
  }catch(error){status(error.message);}
};
draw();
