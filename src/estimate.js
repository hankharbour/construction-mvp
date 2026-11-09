import {estimate, lineCost, csvCell} from './domain.js';

(function(){
let selectedMeasurement=null;
window.addEventListener('measurement-selected',e=>{selectedMeasurement=e.detail;});
const key='construction-mvp-lines-v1';
let lines=[];try{let stored=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(stored))lines=stored.filter(x=>x && ['trade','name','category','unit','code'].every(k=>typeof x[k]==='string') && ['qty','unitCost','waste'].every(k=>Number.isFinite(x[k])&&x[k]>=0));}catch(e){}
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=n=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const num=id=>{const value=Number($(id).value);return Number.isFinite(value)?Math.max(0,value):0;};
function compute(){return estimate(lines,{taxPct:num('taxPct'),overheadPct:num('overheadPct'),profitPct:Math.min(99,num('marginPct')),profitMode:$('profitMode').value});}
function draw(){let t;try{t=compute();}catch(error){$('estimateTotals').textContent=error.message;return;}let body=$('lineRows');body.innerHTML=lines.map((x,i)=>'<tr><td><b>'+esc(x.trade)+'</b><div>'+esc(x.name)+'</div><small>'+esc(x.code)+'</small></td><td>'+esc(x.category)+'</td><td>'+x.qty+'</td><td>'+esc(x.unit)+'</td><td>'+money(lineCost(x))+'</td><td><button data-remove="'+i+'" aria-label="Remove item">×</button></td></tr>').join('');body.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{lines.splice(Number(b.dataset.remove),1);persist()});$('estimateTotals').innerHTML='<p>Direct costs: <strong>'+money(t.subtotal)+'</strong> | Material tax allowance: '+money(t.tax)+' | Overhead: '+money(t.overhead)+'</p><h3>Estimated bid: '+money(t.price)+'</h3><p>Target gross profit: '+money(t.profit)+' ('+num('marginPct')+'% '+$('profitMode').value+')</p>';}
function persist(){try{localStorage.setItem(key,JSON.stringify(lines))}catch(e){}draw()}
$('addLine').onclick=()=>{let name=$('itemName').value.trim();if(!name){alert('Enter an item description.');return;}let x={trade:$('customTrade').value.trim()||$('tradeType').value,name,category:$('costCategory').value,qty:num('itemQty'),unit:$('itemUnit').value,unitCost:num('itemCost'),waste:num('itemWaste'),code:$('costCode').value.trim(),source:selectedMeasurement && Number($('itemQty').value)===selectedMeasurement.value ? structuredClone(selectedMeasurement) : {status:'unverified',assumption:'Manual quantity; drawing source not attached.'}};selectedMeasurement=null;lines.push(x);$('itemName').value='';persist()};
$('clearLines').onclick=()=>{if(confirm('Clear all estimate items?')){lines=[];persist()}};
['overheadPct','marginPct','taxPct','profitMode'].forEach(id=>$(id).addEventListener('input',draw));
function saveFile(name,content,type){let url=URL.createObjectURL(new Blob([content],{type}));let a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
$('exportLines').onclick=()=>{let csv=[['Trade','Description','Category','Cost Code','Quantity','Unit','Unit Cost','Waste Percent','Extended Cost'],...lines.map(x=>[x.trade,x.name,x.category,x.code,x.qty,x.unit,x.unitCost,x.waste,(lineCost(x)).toFixed(2)])].map(row=>row.map(csvCell).join(',')).join('\n');saveFile('dead-on-pro-estimate.csv',csv,'text/csv')};
$('exportLinesJson').onclick=()=>saveFile('dead-on-pro-estimate.json',JSON.stringify({schema_version:'0.1',status:'unverified',lines,summary:compute()},null,2),'application/json');
draw();
})();
