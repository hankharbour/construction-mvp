import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadEstimate,saveEstimate} from '../src/storage.js';
function memory(){const map=new Map();return {getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key)};}
test('migrates valid legacy lines, rejects malformed persisted financial data',()=>{
  const storage=memory(),line={trade:'Roofing',name:'Shingle',category:'Material',qty:10,unit:'sq ft',unitCost:3,waste:10,code:''};
  storage.setItem('construction-mvp-lines-v1',JSON.stringify([line,{...line,qty:-1},null,{...line,unitCost:'bad'}]));
  const loaded=loadEstimate(storage);assert.deepEqual(loaded.lines,[line]);
  saveEstimate(storage,{...loaded,settings:{taxPct:8,overheadPct:12,profitPct:30,profitMode:'markup'}});
  assert.equal(loadEstimate(storage).settings.profitMode,'markup');assert.equal(storage.getItem('construction-mvp-lines-v1'),null);
});
test('unavailable storage returns safe defaults',()=>{
  assert.deepEqual(loadEstimate({getItem(){throw new Error('denied');}}).lines,[]);
});
