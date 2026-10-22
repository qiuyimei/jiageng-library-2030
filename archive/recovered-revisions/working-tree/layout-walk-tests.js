import * as T from 'three';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHelpers} from './model-helpers.js';
import {buildLibraryFloors,floorRackRecords} from './library-layout.js';
import {deskLayouts,desksConflict,READING_BAY_LAYOUT as R,GROUND_LAYOUT as G,TOILET_LAYOUT,TOILET_GRID,upperFacilities} from './spatial.js';
import {collectWalkObstacles,walkSurface,walkUpEntry,walkStairEntry,advanceWalk} from './walk.js';
const root=new T.Group();buildLibraryFloors(root,createHelpers());const obstacles=collectWalkObstacles(root,T.Box3);
let passed=0;const checks=[];
function test(name,f){f();checks.push(name);passed++;console.log('PASS '+name);}
test('多排书架保留南北横向、东区纵向，不再只有四条架线',()=>{
 for(let floor=2;floor<=5;floor++){
  const records=floorRackRecords(floor),north=records.filter(r=>r.layoutRegion==='北'),east=records.filter(r=>r.layoutRegion==='东');
  assert.equal(new Set(north.map(r=>r.z)).size,12);assert.equal(north.length,48);assert.ok(north.every(r=>r.rotation===0));
  assert.equal(east.length,R.eastRackXs.length*R.eastRackZs.length);assert.ok(east.every(r=>r.rotation===Math.PI/2));
 }
});
test('南北桌排优先，所有东区补位与它们保持桌椅净空',()=>{
 for(let floor=2;floor<=5;floor++){
  const desks=deskLayouts(floor),primary=desks.filter(d=>d.placementPriority==='南北'),east=desks.filter(d=>d.placementPriority==='东区补位');
  assert.ok(primary.every(d=>d.rotation===0));assert.ok(east.every(d=>d.rotation===Math.PI/2));assert.ok(east.length>=16);
  for(const d of east)for(const p of primary)assert.equal(desksConflict(d,p),false);
 }
 const rear=deskLayouts(3).filter(d=>d.rearRow);assert.equal(rear.length,2);assert.ok(rear.every(d=>Math.abs(d.x)<4));
});
test('一楼普通梯两侧都可连续上到五楼，沿实物碰撞模型行走',()=>{
 for(const side of [-1,1]){let p={...walkUpEntry(1),x:side*4.65};for(let i=0;i<1600;i++)p=advanceWalk(p,0,-.025,obstacles);assert.equal(p.floor,5);assert.ok(p.y>19);}
});
test('一楼扶梯也有完整的一至二楼可行走坡面',()=>{
 for(const side of [-1,1]){let p={x:side*5.82,z:19.2,y:.15,floor:1};for(let i=0;i<330;i++)p=advanceWalk(p,0,-.025,obstacles);assert.equal(p.floor,2);assert.ok(Math.abs(p.y-4.95)<.01);}
});
test('楼梯侧边和跨入中段不能退回一楼平地而穿过梯体',()=>{
 for(const side of [-1,1])for(const x of [5.3,5.4,5.55])assert.equal(walkSurface(side*x,16,.15),null);
 let p={x:4.65,z:16,y:2.07,floor:1};p=advanceWalk(p,2,0,obstacles);assert.ok(p.x<5.2);assert.ok(p.y>1.9);
});
test('五层每个厕所均占四格，一楼门洞可进入且内部有示意陈设',()=>{
 const all=[{floor:1,...G.toilet},...[2,3,4,5].flatMap(floor=>upperFacilities(floor).toilets.map(t=>({floor,...t})))];
 assert.equal(all.length,9);
 for(const t of all){
  assert.equal(t.w/TOILET_GRID.w,2);assert.equal(t.d/TOILET_GRID.d,2);
  assert.ok(Math.abs(t.z+t.d/2-33.85)<.001);
  assert.ok(Math.abs(Math.abs(t.x)+t.w/2-34.25)<.001);
  if(t.floor>1){const room=root.getObjectByName('library_floor_'+t.floor).getObjectByName('user_upper_facilities').children.find(o=>o.name==='upper_toilet'&&Math.abs(o.position.x-t.x)<.001);const size=new T.Box3().setFromObject(room.getObjectByName('toilet_room_shell')).getSize(new T.Vector3());assert.ok(Math.abs(size.x-t.w)<.001&&Math.abs(size.z-t.d)<.001);}
 }
 const wc=root.getObjectByName('ground_toilet');assert.ok(wc.getObjectByName('ground_toilet_basin'));assert.equal(wc.getObjectsByProperty('name','ground_toilet_stall').length,3);
 let p={x:G.toilet.x,z:G.toilet.z-G.toilet.d/2-.6,y:.15,floor:1};for(let i=0;i<110;i++)p=advanceWalk(p,0,.025,obstacles);assert.ok(p.z>G.toilet.z-G.toilet.d/2+1.5);
});
test('加宽密集书库至后墙前保留阅览与检修通道',()=>{
 const b=G.compactBlocks[0];assert.equal(b.columns,6);assert.ok(b.w>5&&b.d>60);assert.ok(b.z-b.d/2<-51);
 let p={x:-19.1,z:20.5,y:.15,floor:1};for(let i=0;i<2400;i++)p=advanceWalk(p,0,-.03,obstacles);assert.ok(p.z<-50);
});
fs.writeFileSync('layout-walk-results.json',JSON.stringify({passed,checks,scope:'同源Three.js实体几何、坡面与通道检查；不是浏览器或现场验收'},null,2));
