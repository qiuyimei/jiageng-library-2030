// 文字提取测试：既验证支持项，也验证不应自动声称支持的条件。
import assert from 'node:assert/strict';
import {parseSeatDemand} from '../seat-voice.js';
const cases=[
 ['文学靠窗稍后打印',r=>{assert.equal(r.patch.subject,'literature');assert.equal(r.patch.window,true);assert.equal(r.patch.print,true);}],
 ['不靠窗，不用打印',r=>{assert.equal(r.patch.window,false);assert.equal(r.patch.print,false);}],
 ['三楼计算机',r=>{assert.equal(r.patch.floor,3);assert.equal(r.patch.range,'current');assert.equal(r.patch.subject,'technology');}],
 ['比较五层，带插座',r=>{assert.equal(r.patch.range,'all');assert.equal(r.patch.power,true);}],
 ['文学和计算机',r=>{assert.equal(r.patch.subject,undefined);assert.ok(r.notes.length);}],
 ['二楼和三楼',r=>{assert.equal(r.patch.floor,undefined);assert.ok(r.notes.length);}],
 ['靠窗，但是不要靠窗',r=>{assert.equal(r.patch.window,undefined);assert.ok(r.notes.length);}],
 ['最好有插座',r=>{assert.equal(r.patch.power,undefined);assert.ok(r.notes.some(s=>s.includes('必须')));}],
 ['安静阅读',r=>assert.ok(r.notes.some(s=>s.includes('没有实时噪声')))],
 ['轮椅，两个同学相邻',r=>assert.ok(r.notes.some(s=>s.includes('尚未实现')))],
 ['',r=>{assert.equal(Object.keys(r.patch).length,0);assert.ok(r.notes.length);}],
 ['报刊',r=>assert.equal(r.patch.subject,'periodicals')],
 ['不限主题',r=>assert.equal(r.patch.subject,'own')],
 ['不需要充电',r=>assert.equal(r.patch.power,false)]
];
for(const [text,check] of cases){check(parseSeatDemand(text));console.log('PASS demand '+JSON.stringify(text));}
console.log('TOTAL demand '+cases.length);
