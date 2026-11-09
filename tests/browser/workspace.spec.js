import {test,expect} from '@playwright/test';
// Minimal real two-page PDF, generated without network or production drawings.
function pdfFixture(){
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 400] /Contents 4 0 R >>','<< /Length 30 >>\nstream\n0 0 0 RG 50 50 400 200 re S\nendstream','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 400] /Contents 6 0 R >>','<< /Length 30 >>\nstream\n0 0 0 RG 80 80 300 100 re S\nendstream'];
  let text='%PDF-1.4\n', offsets=[0];objects.forEach((object,i)=>{offsets.push(Buffer.byteLength(text));text+=`${i+1} 0 obj\n${object}\nendobj\n`;});
  const xref=Buffer.byteLength(text);text+=`xref\n0 7\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(text);
}
test('navigation, estimating and conceptual controls have no runtime errors',async({page,isMobile})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  const nav=page.locator(isMobile?'#appBottom':'#appTopbar');
  await nav.locator('[data-page="estimate"]').click();
  await page.locator('#itemName').fill('Sample lumber');await page.locator('#itemQty').fill('10');await page.locator('#itemCost').fill('10');await page.locator('#itemWaste').fill('10');
  await page.locator('#addLine').click();await expect(page.locator('#lineRows')).toContainText('$110.00');
  await expect(page.locator('#estimateTotals')).toContainText('$151.25');
  await page.locator('#profitMode').selectOption('markup');await expect(page.locator('#estimateTotals')).toContainText('$145.20');
  await nav.locator('[data-page="design"]').click();await page.locator('#length').fill('60');await expect(page.locator('#summary')).toContainText('vinyl exterior');
  await nav.locator('[data-page="plans"]').click();await expect(page.locator('#measureCanvas')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
test('multi-page PDF calibration, zoom, provenance, session restore and transfer',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/#plans');
  await page.locator('#measureFile').setInputFiles({name:'sample.pdf',mimeType:'application/pdf',buffer:pdfFixture()});
  await expect(page.locator('#drawingPage')).toBeEnabled();await expect(page.locator('#drawingPage option')).toHaveCount(2);
  const canvas=page.locator('#measureCanvas');
  async function point(x,y){const rect=await canvas.boundingBox();await canvas.click({position:{x:rect.width*x,y:rect.height*y}});}
  await point(.1,.1);await point(.5,.1);await expect(page.locator('#calibrationStatus')).not.toContainText('Not calibrated');
  await page.locator('#startLength').click();await point(.1,.2);await point(.5,.2);await expect(page.locator('#measureRows')).toContainText('10.00');
  await page.locator('#drawingPage').selectOption('2');await expect(page.locator('#calibrationStatus')).toContainText('Not calibrated');
  await page.locator('#drawingPage').selectOption('1');await expect(page.locator('#calibrationStatus')).not.toContainText('Not calibrated');
  await page.locator('#drawingZoom').selectOption('2');
  await page.locator('#startLength').click();
  // Click within the visible half of the zoomed canvas; scale remains page-based.
  await canvas.click({position:{x:20,y:20}});await canvas.click({position:{x:100,y:20}});
  const pending=page.waitForEvent('download');await page.locator('#exportMeasures').click();const download=await pending;
  const stream=await download.createReadStream();const chunks=[];for await(const chunk of stream)chunks.push(chunk);const buffer=Buffer.concat(chunks), session=JSON.parse(buffer);
  expect(session.pages[0].measurements[0].points).toHaveLength(2);expect(session.source.sha256).toHaveLength(64);expect(session.pages[0].measurements[0].verified).toBe(false);
  await page.locator('#restoreMeasures').setInputFiles({name:'session.json',mimeType:'application/json',buffer});await expect(page.locator('#measureNotice')).toContainText('Session restored');
  await page.locator('#addToEstimate').click();await expect(page.locator('#estimatePage')).toBeVisible();await expect(page.locator('#itemUnit')).toHaveValue('linear ft');
  expect(errors).toEqual([]);
});
