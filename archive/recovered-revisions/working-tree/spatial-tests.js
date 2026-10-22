// 检查新空间联动的实质约束：数据同源、路线避开中庭、消息不会增加未知位置。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeData,RESOURCES} from './data.js';
import {recommend} from './engine.js';
import {seatPosition,seatLabel,seatRegionAt,mapPosition,nodePosition,routePoints,acceptSnapshot,atriumVoids,ELEVATOR_LAYOUT,GROUND_LAYOUT,elevatorLanding,floorBounds,upperFacilities,TRANSPORT_CORE} from './spatial.js';
const now=1780000000000,d=makeData(now);let count=0;
const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
test('60座位平面与三维同源、各层坐标不重复',()=>{
 for(let f=1;f<=5;f++){
   const seats=d.seats.filter(s=>s.floor===f);assert.equal(new Set(seats.map(s=>{const p=seatPosition(s);return p.x+','+p.z;})).size,12);
   assert.equal(new Set(seats.map(s=>seatLabel(s))).size,12);for(const s of seats){const p=seatPosition(s);assert.ok(seatLabel(s).startsWith(seatRegionAt(p.x,p.z,f)));}if(f>1)assert.deepEqual([...new Set(seats.map(s=>seatLabel(s)[0]))].sort(),['东','北','南'].sort());assert.equal(seats[0].id,'S'+f+'-01');
   const bounds=floorBounds(f);assert.equal(bounds.left,-bounds.right,'以前台x=0为轴，左右必须等宽');assert.equal(bounds.left,floorBounds(1).left);assert.equal(bounds.right,floorBounds(1).right);
   for(const s of seats){const p=seatPosition(s);assert.ok((Math.abs(p.x)>6.1||f===5&&p.z<-5)&&p.x>bounds.left&&p.x<bounds.right);assert.deepEqual({x:s.x,y:s.y},mapPosition(s));}
   if(f>1){const wc=upperFacilities(f).toilets.find(t=>t.x<0);assert.equal(wc.x,GROUND_LAYOUT.toilet.x);assert.equal(wc.z,GROUND_LAYOUT.toilet.z);}
 }
});
test('五层展开只改变高度，编号与平面位置保留',()=>{
 for(const s of d.seats){const a=seatPosition(s),b=seatPosition(s,true);assert.equal(a.x,b.x);assert.equal(a.z,b.z);assert.equal(b.y,(s.floor-1)*9+.5);}
});
test('所有候选图路径均有有限坐标',()=>{
 for(const resource of ['own','software','literature','economy','special']){
  const r=recommend(d.seats,{resource,print:true,priority:'books'},d.graph,RESOURCES,now);
  for(const i of r.items){assert.ok(i.trip.path.every(n=>nodePosition(n,d.seats)));const pts=routePoints(i.trip.path,d.seats);assert.ok(pts.length>1&&pts.every(p=>Number.isFinite(p.x+p.y+p.z)));}
 }
});
test('跨侧路线在连廊通行，不穿中庭孔洞',()=>{

 for(let f=2;f<=5;f++)for(const s of d.seats.filter(s=>s.floor===f)){
  const pts=routePoints(['books'+f,'hall'+f,s.node],d.seats);
  for(let i=1;i<pts.length;i++)for(let t=0;t<=20;t++){
   const a=pts[i-1],b=pts[i];if(a.floor!==b.floor)continue;
   const x=a.x+(b.x-a.x)*t/20,z=a.z+(b.z-a.z)*t/20;
   assert.ok(!atriumVoids(f).some(h=>Math.abs(x-h.x)<h.w/2&&z>h.back&&z<h.front),'路线穿越中庭');
  }
 }
});
test('父页面快照保留同一座位与需求',()=>{
 const r=acceptSnapshot({seats:d.seats,prefs:{resource:'software'},selected:'S4-09',floor:4},d.seats.map(s=>s.id));assert.equal(r.selected,'S4-09');assert.equal(r.seats.length,60);assert.equal(r.prefs.resource,'software');
});
test('拒绝重复、未知编号与不对应楼层的快照',()=>{
 const ids=d.seats.map(s=>s.id);
 for(const patch of [{id:'bad'},{floor:5},{id:d.seats[1].id}]){const seats=d.seats.map(s=>({...s}));Object.assign(seats[0],patch);assert.equal(acceptSnapshot({seats},ids),null);}
});
test('未知路线节点没有编造坐标',()=>assert.deepEqual(routePoints(['entry','invented'],d.seats),[]));
test('同层图边代价与显示折线一致',()=>{
 for(const [from,edges]of Object.entries(d.graph))for(const edge of edges){const a=nodePosition(from,d.seats),b=nodePosition(edge.to,d.seats);if(a.floor!==b.floor)continue;const pts=routePoints([from,edge.to],d.seats),sum=pts.slice(1).reduce((v,p,i)=>v+Math.abs(p.x-pts[i].x)+Math.abs(p.z-pts[i].z),0);assert.ok(Math.abs(sum-edge.weight)<1e-7);}
});
test('各层电梯门前节点按朝向定位，跨层边经过同一井道',()=>{
 for(let f=1;f<=5;f++){const p=nodePosition('elevator'+f,d.seats);assert.equal(p.x,elevatorLanding(f).x);assert.equal(p.z,elevatorLanding(f).z);}
 assert.ok(TRANSPORT_CORE.left-6.2>=4,'后部交通区仍与中庭梯保留独立距离');assert.ok(Math.abs(floorBounds(1).right-TRANSPORT_CORE.right)<.3);assert.ok(ELEVATOR_LAYOUT.x>TRANSPORT_CORE.left&&ELEVATOR_LAYOUT.x<TRANSPORT_CORE.right);assert.ok(GROUND_LAYOUT.cafe.x>0&&GROUND_LAYOUT.cafe.x+GROUND_LAYOUT.cafe.w/2<floorBounds(1).right);
 const ps=routePoints(['elevator1','elevator2'],d.seats);assert.ok(ps.some(p=>p.x===ELEVATOR_LAYOUT.x&&p.z===ELEVATOR_LAYOUT.z&&p.floor===1));assert.ok(ps.some(p=>p.x===ELEVATOR_LAYOUT.x&&p.z===ELEVATOR_LAYOUT.z&&p.floor===2));
 for(const [from,edges]of Object.entries(d.graph))for(const e of edges){if(nodePosition(from,d.seats).floor!==nodePosition(e.to,d.seats).floor&&e.accessible)assert.ok(from.startsWith('elevator')&&e.to.startsWith('elevator'));}
});
test('电梯接近折线沿右侧外通道避开密集柜区',()=>{
 const ps=routePoints(['hall1','elevator1'],d.seats);
 for(let i=1;i<ps.length;i++)for(let j=0;j<=20;j++){const t=j/20,x=ps[i-1].x+(ps[i].x-ps[i-1].x)*t,z=ps[i-1].z+(ps[i].z-ps[i-1].z)*t;assert.ok(!GROUND_LAYOUT.compactBlocks.some(b=>Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2));}
});
fs.writeFileSync(new URL('./spatial-results.json',import.meta.url),JSON.stringify({passed:count,scope:'空间数据、图路线与父子页面消息结构；未进行浏览器/WebGL验收'},null,2));
console.log('TOTAL spatial '+count);
