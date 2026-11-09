import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {calibrate, quantity} from './domain.js';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
const $ = id => document.getElementById(id);
const canvas = $('measureCanvas'), ctx = canvas.getContext('2d');
let source = null, pdf = null, pages = new Map(), activePage = 1, points = [], mode = 'calibrate', generation = 0;
const notice = text => $('measureNotice').textContent = text;
const units = {length:'ft',area:'sq ft',count:'each'};
function active() { return pages.get(activePage); }
function draw() {
  const page = active();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (!page) return;
  ctx.drawImage(page.image,0,0);
  for (const measurement of [...page.measurements, {points,kind:mode}]) {
    ctx.strokeStyle = measurement.id ? '#007c65' : '#cf431b'; ctx.fillStyle = '#f8b333'; ctx.lineWidth = 3;
    ctx.beginPath(); measurement.points.forEach((point,i) => i ? ctx.lineTo(point.x,point.y) : ctx.moveTo(point.x,point.y));
    if (measurement.kind === 'area') ctx.closePath(); ctx.stroke();
    for (const point of measurement.points) {ctx.beginPath(); ctx.arc(point.x,point.y,5,0,Math.PI*2); ctx.fill();}
  }
}
function update() {
  const page = active();
  $('calibrationStatus').textContent = page ? `Page ${activePage} · ${page.scale ? page.scale.toFixed(6)+' ft/page pixel' : 'Not calibrated'} · ${source.name}` : 'No drawing loaded';
  const rows = $('measureRows'); rows.replaceChildren();
  for (const [pageNumber, drawing] of pages) for (const measurement of drawing.measurements) {
    const row = rows.insertRow();
    for (const value of [`${measurement.label} / p.${pageNumber}`,measurement.value.toFixed(2),measurement.unit,'Manual / unverified']) row.insertCell().textContent=value;
    const actions=row.insertCell();
    for (const [title,handler] of [['View',async()=>{await showPage(pageNumber);notice(`Source: ${measurement.label}; ${measurement.formula}`);}],['Remove',()=>{drawing.measurements=drawing.measurements.filter(m=>m.id!==measurement.id);update();}]]) {
      const button=document.createElement('button');button.textContent=title;button.onclick=handler; actions.append(button);
    }
  }
  draw();
}
async function showPage(number) {
  points=[]; activePage=number;
  if (!pages.has(number)) {
    const token=generation;
    const page = await pdf.getPage(number), viewport=page.getViewport({scale:1});
    const view=page.getViewport({scale:Math.min(2,1600/viewport.width)});
    const image=document.createElement('canvas'); image.width=Math.ceil(view.width);image.height=Math.ceil(view.height);
    await page.render({canvasContext:image.getContext('2d'),canvas:image,viewport:view}).promise;
    if(token!==generation) return;
    pages.set(number,{image,width:image.width,height:image.height,scale:null,calibration:null,measurements:[]});
  }
  const page=pages.get(number); canvas.width=page.width;canvas.height=page.height;
  $('drawingPage').value=String(number);update();
}
async function load(file) {
  if (!file) return;
  const token=++generation;
  $('drawingPage').disabled=true;
  try {
    if (file.size > 40*1024*1024) throw new Error('Demo upload limit is 40 MB. Choose a smaller drawing.');
    if (pdf) await pdf.destroy(); pdf=null; source=null; pages=new Map();points=[];ctx.clearRect(0,0,canvas.width,canvas.height);
    notice('Opening drawing…');
    const bytes=await file.arrayBuffer();
    const hash=await crypto.subtle.digest('SHA-256',bytes);
    const fingerprint=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
    if(token!==generation) return;
    source={name:file.name,size:file.size,sha256:fingerprint};
    let count=1;
    if(file.type==='application/pdf'||/\.pdf$/i.test(file.name)) {
      pdf=await pdfjs.getDocument({data:new Uint8Array(bytes),isEvalSupported:false}).promise;
      count=pdf.numPages;
    } else if(file.type.startsWith('image/')) {
      const bitmap=await createImageBitmap(file);
      const image=document.createElement('canvas'), factor=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));
      image.width=Math.round(bitmap.width*factor);image.height=Math.round(bitmap.height*factor);image.getContext('2d').drawImage(bitmap,0,0,image.width,image.height);bitmap.close();
      pages.set(1,{image,width:image.width,height:image.height,scale:null,calibration:null,measurements:[]});
    } else throw new Error('Choose a PDF or supported image.');
    $('drawingPage').replaceChildren(...Array.from({length:count},(_,i)=>new Option(`Page ${i+1}`,String(i+1))));
    await showPage(1);$('drawingPage').disabled=false;
    notice('Select a known distance and click two endpoints to calibrate this page. All measurements require review.');
  } catch(error) {notice(`Unable to open drawing: ${error.message}`);}
}
for (const id of ['measureFile','cameraFile']) $(id).onchange=event=>load(event.target.files[0]);
$('drawingPage').onchange=async event=>{try{await showPage(Number(event.target.value));notice('Page selected. Calibration is independent for each page.');}catch(error){notice(error.message);}};
$('drawingZoom').onchange=()=>{canvas.style.width=Number($('drawingZoom').value)*100+'%';};
for(const [id,tool] of [['startCal','calibrate'],['startLength','length'],['startArea','area'],['startCount','count']]) $(id).onclick=()=>{mode=tool;points=[];notice(tool==='calibrate'?'Click two endpoints of the known distance.':`Select ${tool} points, then finish. Length finishes after two points.`);draw();};
canvas.onclick=event=>{
  const page=active();if(!page) return;
  const rect=canvas.getBoundingClientRect(); points.push({x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height});
  try {
    if(mode==='calibrate'&&points.length===2) {
      const feet=Number($('knownFeet').value),scale=calibrate(points,feet);
      page.scale=scale;page.calibration={points:structuredClone(points),knownFeet:feet,feetPerPixel:scale,timestamp:new Date().toISOString()};
      for(const m of page.measurements){m.value=quantity(m.kind,m.points,scale);m.scale=scale;m.calibration=structuredClone(page.calibration);m.updatedAt=new Date().toISOString();}
      points=[];notice('Scale updated. Existing page measurements recalculated; review them again.');update();
    } else if(mode==='length'&&points.length===2) finish(); else draw();
  }catch(error){points=[];notice(error.message);draw();}
};
function finish() {
  try {
    const page=active();if(!page) throw new Error('Load a drawing first.');
    if(mode==='calibrate') throw new Error('Click two endpoints to calibrate.');
    if(!points.length) throw new Error('Select measurement points first.');
    const value=quantity(mode,points,page.scale);
    page.measurements.push({id:crypto.randomUUID(),label:$('measureLabel').value.trim()||`Measurement ${page.measurements.length+1}`,kind:mode,points:structuredClone(points),value,unit:units[mode],source:structuredClone(source),page:activePage,scale:page.scale,calibration:structuredClone(page.calibration),formula:mode==='area'?'shoelace(page points) × scale²':mode==='length'?'Euclidean distance(page points) × scale':'number of marked points',verified:false,createdAt:new Date().toISOString()});
    points=[];notice('Measurement saved as unverified.');update();
  }catch(error){notice(error.message);}
}
$('finishArea').onclick=finish;$('undoPoint').onclick=()=>{points.pop();draw();};
$('exportMeasures').onclick=()=>{
  if(!source) return notice('Load a drawing first.');
  const session={schemaVersion:1,coordinateSystem:'page-pixels',status:'unverified',source,pages:[...pages].map(([number,{image,...page}])=>({number,...page}))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(session,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='drawing-session.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('restoreMeasures').onchange=async event=>{
  try {
    if(!source) throw new Error('Open the original drawing before restoring its session.');
    const session=JSON.parse(await event.target.files[0].text());
    if(session.schemaVersion!==1||session.source.sha256!==source.sha256||!Array.isArray(session.pages)) throw new Error('Session does not match this exact drawing.');
    // Validate the entire session before changing live measurements.
    const previousPage=activePage, restored=[];
    for(const saved of session.pages) {
      if(!Number.isInteger(saved.number)||saved.number<1||saved.number>$('drawingPage').options.length) throw new Error('Invalid session page.');
      await showPage(saved.number);const page=active();
      if(saved.width!==page.width||saved.height!==page.height||!Array.isArray(saved.measurements)) throw new Error('Page coordinates do not match.');
      const validPoints=ps=>Array.isArray(ps)&&ps.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<=page.width&&p.y<=page.height);
      let scale=null;
      if(saved.calibration){if(!validPoints(saved.calibration.points)||saved.calibration.points.length!==2)throw new Error('Invalid calibration.');scale=calibrate(saved.calibration.points,saved.calibration.knownFeet);}
      const measurements=saved.measurements.map(m=>{
        if(!['length','area','count'].includes(m.kind)||!validPoints(m.points)||typeof m.label!=='string') throw new Error('Invalid measurement geometry.');
        return {...m,id:crypto.randomUUID(),page:saved.number,source:structuredClone(source),scale,calibration:saved.calibration,value:quantity(m.kind,m.points,scale),unit:units[m.kind],verified:false};
      });
      restored.push({page,scale,calibration:saved.calibration,measurements});
    }
    for(const restoredPage of restored) Object.assign(restoredPage.page,{scale:restoredPage.scale,calibration:restoredPage.calibration,measurements:restoredPage.measurements});
    await showPage(previousPage);update();notice('Session restored. All quantities remain unverified.');
  }catch(error){notice(`Unable to restore: ${error.message}`);}
};
$('addToEstimate').onclick=()=>{
  const m=active()?.measurements.at(-1);if(!m) return notice('Create a measurement on this page first.');
  $('itemName').value=m.label;$('itemQty').value=String(m.value);$('itemUnit').value=m.unit==='ft'?'linear ft':m.unit;
  window.dispatchEvent(new CustomEvent('measurement-selected',{detail:structuredClone(m)}));
  window.dispatchEvent(new CustomEvent('open-workspace',{detail:'estimate'}));
};
update();
