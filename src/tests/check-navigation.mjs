// 纯快照/路由/状态单元检查；不启动浏览器，也不执行网页脚本。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cleanSeatSnapshot,encodeSeatSnapshot,decodeSeatSnapshot,modelNavigationURL,seatReturnNavigation,restoreSeatCandidates} from '../seat-navigation.js';
const catalog=[{id:'F3-N017',floor:3},{id:'F3-S065',floor:3},{id:'F5-E008',floor:5},{id:'F1-S001',floor:1,dedicated:true}];
const raw={version:1,checkin:false,floor:3,selected:'F3-N017',page:7,zoom:2.25,view:'list',attempted:true,
 form:{subject:'literature',searchRange:'all',regionFilter:'北',stateFilter:'available',windowPreference:true,powerPreference:false,printPreference:true,duration:'120',voiceText:'我想在文学资料附近安静阅读，喜欢靠窗，稍后需要打印。'},
 candidates:[{id:'F3-N017',score:138,reasons:['匹配临窗偏好'],tradeoffs:[]},{id:'F3-S065',score:138,reasons:['同层'],tradeoffs:['离打印点更远']}],
 mapFocus:{floor:3,ids:['F3-N017','F3-S065'],priority:true},scroll:{x:0,y:1460,mapX:123,mapY:245}};
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name);};
const clean=cleanSeatSnapshot(raw,catalog),capsule=encodeSeatSnapshot(clean);
test('中文需求、候选顺序、筛选、页码、缩放与滚动往返一致',()=>assert.deepEqual(decodeSeatSnapshot(capsule,catalog),clean));
test('三维坐标片段保持在开头，返回片段完整携带快照',()=>{const url=modelNavigationURL('#loc=3,-25.55,-12.3',clean);assert.ok(url.startsWith('建筑与五层展示.html#loc=3,-25.55,-12.3&return='));const back=seatReturnNavigation(url.slice(url.indexOf('#')));assert.equal(back,'嘉庚知座.html#resume='+capsule);assert.deepEqual(decodeSeatSnapshot(back.split('#resume=')[1],catalog),clean);});
test('本层三维和校园总览入口也携带相同快照',()=>{for(const hash of ['#floor=3','']){const u=modelNavigationURL(hash,clean);assert.ok(seatReturnNavigation(u.slice(u.indexOf('#'))));}});
test('登记模式返回登记界面',()=>{const c=encodeSeatSnapshot({...clean,checkin:true});assert.equal(seatReturnNavigation('#floor=3&return='+c),'嘉庚知座.html?mode=checkin#resume='+c);});
test('不依赖history或浏览器存储，也不把界面快照当登记记录',()=>{assert.ok(capsule);assert.ok(!JSON.stringify(clean).includes('owner'));assert.ok(!JSON.stringify(clean).includes('reports'));});
test('未知椅位、重复候选及跨层聚焦ID被过滤',()=>{const s=cleanSeatSnapshot({...raw,selected:'unknown',candidates:[...raw.candidates,raw.candidates[0],{id:'bad'}],mapFocus:{floor:3,ids:['bad','F5-E008','F3-S065']}},catalog);assert.equal(s.selected,null);assert.equal(s.candidates.length,2);assert.deepEqual(s.mapFocus.ids,['F3-S065']);});
test('边界数值和选项被约束',()=>{const s=cleanSeatSnapshot({...raw,page:-5,zoom:999,view:'evil',form:{subject:'fake',voiceText:'字'.repeat(900)}},catalog);assert.equal(s.page,0);assert.equal(s.zoom,3);assert.equal(s.view,'map');assert.equal(s.form.subject,'own');assert.equal(s.form.voiceText.length,500);});
test('非法片段与过大快照不会跳转外部网址',()=>{assert.equal(seatReturnNavigation('#return=javascript:alert(1)'),null);assert.equal(seatReturnNavigation('#return='+'a'.repeat(32001)),null);assert.equal(decodeSeatSnapshot('bad',catalog),null);assert.equal(decodeSeatSnapshot(capsule+'!',catalog),null);});
test('不支持的版本和空数据不恢复',()=>{assert.equal(cleanSeatSnapshot({version:2},catalog),null);assert.equal(cleanSeatSnapshot(null,catalog),null);});
test('有效原候选返回后保留原顺序与理由',()=>{const restored=restoreSeatCandidates(clean,catalog,{},()=>({kind:'available'}));assert.deepEqual(restored.map(r=>r.seat.id),['F3-N017','F3-S065']);assert.equal(restored[0].rank,1);assert.deepEqual(restored[0].reasons,['匹配临窗偏好']);});
test('状态过期或有人时撤下原候选，选中座位不因此被清空',()=>{const restored=restoreSeatCandidates(clean,catalog,{},s=>({kind:s.id==='F3-N017'?'unknown':'available'}));assert.deepEqual(restored.map(r=>r.seat.id),['F3-S065']);assert.equal(restored[0].rank,1);assert.equal(clean.selected,'F3-N017');});
test('固定专座不能因快照重新变成候选',()=>assert.equal(restoreSeatCandidates({...clean,candidates:[{id:'F1-S001'}]},catalog,{},()=>({kind:'available'})).length,0));
test('上限中文需求可以编码并还原',()=>{const s=cleanSeatSnapshot({...raw,form:{...raw.form,voiceText:'图书馆'.repeat(167)}},catalog);assert.equal(decodeSeatSnapshot(encodeSeatSnapshot(s),catalog).form.voiceText,s.form.voiceText);});
const base=new URL('../',import.meta.url),page=fs.readFileSync(new URL('seat-page.js',base),'utf8'),model=fs.readFileSync(new URL('model.js',base),'utf8');
test('三个入口和模型返回按钮都已接线',()=>{assert.ok(page.includes("bindModelNavigation(model,'#loc='"));assert.ok(page.includes("bindModelNavigation($('floorModel')"));assert.ok(page.includes("bindModelNavigation($('modelOverviewLink'))"));assert.ok(model.includes("['returnSeatLink','wideReturnSeatLink']"));assert.ok(!page.includes("model.target='_blank'"));});
fs.writeFileSync(new URL('./navigation-check.json',import.meta.url),JSON.stringify({passed:checks,scope:'快照/路由/有效状态与源码接线检查，未进行浏览器往返实测'},null,2));
