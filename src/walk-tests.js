// 验证漫游的实际空间约束；不调用浏览器或伪称键盘、WebGL已经实测。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {walkEntry,walkStairEntry,walkSurface,advanceWalk,EYE_HEIGHT} from './walk.js';
import {FLOOR_HEIGHT,STAIR_LAYOUT,TRANSPORT_CORE,floorBounds} from './spatial.js';
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name);}
test('五层入口均落在可走过道',()=>{for(let f=1;f<=5;f++){const p=walkEntry(f),s=walkSurface(p.x,p.z,p.y);assert.equal(s.floor,f);assert.ok(Number.isFinite(p.y+EYE_HEIGHT));}});
test('不会横跨中庭孔洞',()=>{const p=walkEntry(4);p.x=7;p.z=0;const q=advanceWalk(p,-14,0);assert.ok(q.x>=6.3);assert.equal(q.y,p.y);});
test('三楼楼梯出口平台能够进入座位区',()=>{const p=walkStairEntry(3);const q=advanceWalk(p,2.5,0);assert.ok(q.x>7);assert.equal(q.floor,3);});
test('连续上四段普通梯能到五楼',()=>{let p={x:4.65,z:19,y:.15,floor:1};for(let i=0;i<1700;i++)p=advanceWalk(p,0,-.025);assert.equal(p.floor,5);assert.ok(p.z<=STAIR_LAYOUT[4].end);});
test('连续下四段普通梯能回一楼',()=>{let p=walkStairEntry(5);for(let i=0;i<1700;i++)p=advanceWalk(p,0,.025);assert.equal(p.floor,1);assert.ok(p.z>=19);});
test('低帧率大步也不能穿过实体家具',()=>{const p=walkEntry(3),box={minX:6,maxX:8,minZ:14,maxZ:15,minY:9.6,maxY:11};const q=advanceWalk(p,0,-8,[box]);assert.ok(q.z>=15.19);});
test('不会自由飞行或越过本层模型外墙',()=>{for(let floor=1;floor<=5;floor++){const p=walkEntry(floor),q=advanceWalk(p,100,0);assert.ok(q.x<=floorBounds(floor).right-.7);assert.equal(q.y,p.y);}});
test('没有人物与座位状态输入，步行不改编号',()=>{const p=walkEntry(3),before=JSON.stringify(p);advanceWalk(p,1,0);assert.equal(JSON.stringify(p),before);});
test('一楼右翼延长后的地面与左侧后沿齐平',()=>{assert.equal(walkSurface(20,-49,.15)?.floor,1);assert.equal(floorBounds(1).back,-52.6);assert.equal(walkSurface(20,-54,.15),null);});
test('各层下楼入口均从本层实体平台开始',()=>{for(let f=2;f<=5;f++){const p=walkStairEntry(f);assert.equal(walkSurface(p.x,p.z,p.y).floor,f);}});
test('上层前部现在与一楼前沿一致，所有楼层可走至新前沿',()=>{for(let floor=1;floor<=5;floor++)assert.equal(walkSurface(7.5,32,(floor-1)*FLOOR_HEIGHT+.15).floor,floor);});
test('一至五楼左右扩展翼部均有楼面，前台中轴左右等宽',()=>{for(let floor=1;floor<=5;floor++){for(const x of [-27.4,27.4])assert.equal(walkSurface(x,17,(floor-1)*FLOOR_HEIGHT+.15).floor,floor);assert.equal(floorBounds(floor).left,-floorBounds(floor).right);}});
test('一楼在交通区结束，上层仍有完整后部空间',()=>{assert.ok(floorBounds(1).back>floorBounds(2).back);assert.equal(walkSurface(7,-70,.15),null);for(let floor=2;floor<=5;floor++){assert.equal(walkSurface(7,-70,(floor-1)*FLOOR_HEIGHT+.15).floor,floor);assert.ok(floorBounds(floor).back<TRANSPORT_CORE.back-20);assert.ok(floorBounds(floor).back>TRANSPORT_CORE.back-35);}});
test('白墙交通区折返梯可从二楼上到五楼',()=>{
 const s=TRANSPORT_CORE.stair;let p={x:s.leftX,z:s.front+.25,y:4.95,floor:2};
 for(let floor=2;floor<5;floor++){
  for(let i=0;i<212;i++)p=advanceWalk(p,0,-.025);
  for(let i=0;i<68;i++)p=advanceWalk(p,.025,0);
  for(let i=0;i<212;i++)p=advanceWalk(p,0,.025);
  assert.equal(p.floor,floor+1);assert.ok(Math.abs(p.y-floor*FLOOR_HEIGHT-.15)<.02);
  if(floor<4)for(let i=0;i<68;i++)p=advanceWalk(p,-.025,0);
 }
});
test('白墙交通区折返梯可从五楼下到二楼',()=>{
 const s=TRANSPORT_CORE.stair;let p={x:s.rightX,z:s.front+.25,y:19.35,floor:5};
 for(let floor=5;floor>2;floor--){
  for(let i=0;i<212;i++)p=advanceWalk(p,0,-.025);
  for(let i=0;i<68;i++)p=advanceWalk(p,-.025,0);
  for(let i=0;i<212;i++)p=advanceWalk(p,0,.025);
  assert.equal(p.floor,floor-1);assert.ok(Math.abs(p.y-(floor-2)*FLOOR_HEIGHT-.15)<.02);
  if(floor>3)for(let i=0;i<68;i++)p=advanceWalk(p,.025,0);
 }
});
fs.writeFileSync(new URL('./walk-results.json',import.meta.url),JSON.stringify({passed,scope:'第一人称移动、楼梯高度、挑空/家具约束；未进行浏览器/WebGL键鼠实测'},null,2));
