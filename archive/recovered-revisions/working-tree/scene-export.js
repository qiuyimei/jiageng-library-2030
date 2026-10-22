// 从交互模型同源的几何与信息图层导出效果图数据。此过程不打开浏览器或调用WebGL。
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createHelpers} from './model-helpers.js';
import {buildExterior,buildLibraryFloors} from './architecture.js';
import {buildLibraryEnvironment} from './library-environment.js';
import {buildSeatLayer} from './space-layer.js';
import {makeData,RESOURCES,setScenario} from './data.js';
import {recommend,classify,reserveDemo} from './engine.js';
import {PHOTO_REFERENCES} from './photo-reference.js';
import {seatPosition,atriumVoids,EXHIBITION_LAYOUT,GROUND_LAYOUT,ELEVATOR_LAYOUT,STAIR_LAYOUT,routePoints,floorBounds,upperFacilities,TRANSPORT_CORE} from './spatial.js';
import {collectWalkObstacles,advanceWalk,walkStairEntry} from './walk.js';
import {createWalkSurroundings} from './walk-surroundings.js';
const folder=process.argv[2]||process.cwd(),H=createHelpers();
const scene=new THREE.Group(),campus=H.group(scene,'campus'),details=buildExterior(campus,H);
buildLibraryEnvironment(details.rearLibrary,H);const rear=details.rearLibrary.clone(true);rear.position.z=0;scene.add(rear);
const floorRoot=H.group(scene,'floors'),floors=buildLibraryFloors(floorRoot,H),overlay=H.group(scene,'information');
const geometries={},views={},checks=[];
function capture(key){
 scene.updateMatrixWorld(true);const objects=[];
 scene.traverseVisible(o=>{
   if(!o.isMesh)return;const id=o.geometry.uuid;
   if(!geometries[id])geometries[id]={position:Array.from(o.geometry.attributes.position.array,v=>Math.round(v*1e5)/1e5),index:o.geometry.index?Array.from(o.geometry.index.array):null};
   const mat=Array.isArray(o.material)?o.material[0]:o.material;
   objects.push({name:o.name,geometry:id,matrix:o.matrixWorld.toArray(),color:mat.color.getHexString(),opacity:mat.opacity??1,doubleSide:mat.side===THREE.DoubleSide});
 });views[key]=objects;
}
campus.visible=true;rear.visible=false;floorRoot.visible=false;overlay.visible=false;capture('campus');
campus.visible=false;rear.visible=true;capture('rear');
const now=1780000000000,prefs={resource:'software',power:true,print:true,quiet:true,window:false,accessible:false,floor:0,priority:'books'};
for(const [key,floor,furniture,expanded,mode,selection]of [
 ['overview',0,true,true,'normal','S4-02'],['skeleton',0,false,true,'normal','S4-02'],
 ...[1,2,3,4,5].map(f=>['floor'+f,f,true,false,'normal','S4-02']),
 ['floor4top',4,true,false,'normal','S4-02'],['stale',4,true,false,'stale','S4-02'],['offline',4,true,false,'offline','S4-02'],['loaned',4,true,false,'loaned',null],['conflict',4,true,false,'conflict','S4-01']
]){
 const d=makeData(now);if(mode==='conflict'){reserveDemo(d.seats,'S4-01',now);setScenario(d,mode,now,'S4-01');}else if(!['normal','loaned'].includes(mode))setScenario(d,mode,now);
 const currentPrefs=mode==='loaned'?{...prefs,resource:'loaned'}:prefs;
 const plan=recommend(d.seats,currentPrefs,d.graph,RESOURCES,now);plan.prefs=currentPrefs;
 const chosen=mode==='normal'?(plan.items[0]?.seat.id||null):mode==='stale'?'S4-09':selection;
 overlay.traverse(o=>{if(o.geometry&&!o.geometry.userData.sharedGeometry)o.geometry.dispose();});overlay.clear();const layer=buildSeatLayer(overlay,H,d.seats,now,plan,chosen,expanded);
 assert.equal(layer.markers.length,60);assert.equal(new Set(layer.markers.map(m=>m.userData.seatId)).size,60);
 for(const m of layer.markers){assert.equal(m.userData.state,classify(d.seats.find(s=>s.id===m.userData.seatId),now).kind);m.visible=!floor||m.userData.floor===floor;}
 for(const g of layer.resources.children)g.visible=!floor||g.userData.floor===floor;
 for(const line of layer.route.children)line.visible=!floor||line.userData.floors.every(f=>f===floor);
 campus.visible=false;rear.visible=false;floorRoot.visible=true;overlay.visible=true;
 for(const f of floors.storeys){f.root.visible=!floor||f.info.n===floor;f.root.position.y=(f.info.n-1)*(expanded?9:floors.height);f.furniture.visible=furniture;for(const m of f.structural.children)if(m.name.includes('beam'))m.visible=!furniture&&key!=='floor4top';}
 capture(key);checks.push({view:key,seat_markers:layer.markers.filter(m=>m.visible).length,route_segments:layer.route.children.filter(m=>m.visible).length,candidates:plan.items.map(i=>i.seat.id)});
}
// 单桌近景来自楼层内已经生成的实体桌与四把椅子，避免另画一套不一致的展示家具。
floorRoot.visible=false;overlay.visible=false;
for(const f of [3,5]){
 const detail=H.group(scene,'reading_desk_detail_'+f),src=floors.storeys.find(s=>s.info.n===f).furniture;
 for(const obj of src.children){
   const id=obj.userData.seatId;
   if(obj.name==='reading_desk'&&obj.userData.deskSample===0 || id&&Number(id.slice(-2))<=4)detail.add(obj.clone(true));
 }
 assert.equal(detail.children.filter(o=>o.userData.seatId).length,4);
 capture(f===3?'desk-normal':'desk-exam');detail.visible=false;
}
// 细节取样与交互定位使用同一份照片参考配置；没有另造一套效果图模型。
for(const ref of PHOTO_REFERENCES){
 campus.visible=false;rear.visible=ref.view==='rear';floorRoot.visible=ref.view==='cut';overlay.visible=false;
 floors.skylight.visible=ref.roof;
 for(const f of floors.storeys){f.root.visible=!ref.floor||f.info.n===ref.floor;f.root.position.y=(f.info.n-1)*floors.height;f.furniture.visible=true;f.ceiling.visible=ref.ceiling;}
 capture('detail-'+ref.id);
}
// 将已经装配的楼梯、平台与三楼展厅单独展示，使上下两种构型容易比较。
campus.visible=false;rear.visible=false;floorRoot.visible=false;overlay.visible=false;
const circulationDetail=H.group(scene,'circulation_detail');
for(const f of floors.storeys){const stage=H.group(circulationDetail,'detail_floor_'+f.info.n);stage.position.y=(f.info.n-1)*floors.height;
 for(const obj of f.structural.children)if(obj.userData.kind==='lower'||obj.userData.kind==='upper')stage.add(obj.clone(true));
 f.furniture.traverse(obj=>{
  if(obj.name==='photo_third_floor_central_exhibition'||obj.name==='third_floor_central_exhibition_ground'||obj.name==='black_stair_intermediate_landing'||obj.name.startsWith('exhibition_white_floor_'))stage.add(obj.clone(true));
 });
}
capture('circulation-detail');circulationDetail.visible=false;
// 家具细化后再检查实体椅子的世界位置，而不只检查生成标记的坐标公式。
scene.updateMatrixWorld(true);const physicalIds=[];
for(const f of floors.storeys){const chairs=f.furniture.children.filter(o=>o.name.startsWith('reading_chair_'));assert.equal(chairs.length,12);
 for(const chair of chairs){const id=chair.userData.seatId,seat=makeData(now).seats.find(s=>s.id===id),p=seatPosition(seat),world=chair.getWorldPosition(new THREE.Vector3());assert.ok(Math.abs(world.x-p.x)<1e-7&&Math.abs(world.z-p.z)<1e-7,id);physicalIds.push(id);}}
assert.equal(new Set(physicalIds).size,60);
// 核对本次用户指出的空间关系，避免同一类楼梯继续复制到所有楼层。
const placementChecks=[];
const upperChecks=[];
for(const f of floors.storeys){
 const names=[];f.structural.traverse(o=>names.push(o.name));
 const lower=f.info.n<=2,upper=f.info.n===3||f.info.n===4;
 assert.equal(names.includes('photo_lower_terraces_and_stairs'),lower);
 assert.equal(names.includes('photo_upper_gallery_stairs'),upper);
 assert.equal(names.includes('lower_escalator_ribbed_step'),f.info.n===1);
 assert.equal(names.includes('curved_stone_display_terrace'),f.info.n===2);
 if(lower)assert.ok(!names.includes('stair_black_horizontal_rail')&&!names.includes('stair_brown_handrail'),'下部普通直梯不能复制上部扶手');
 const boards=[];f.furniture.traverse(o=>{if(o.userData.role==='exhibition_board')boards.push(o);});
 assert.equal(boards.length,f.info.n===3?8:0);
 for(const board of boards){const {x,z}=board.position;
  assert.ok(Math.abs(x)<EXHIBITION_LAYOUT.width/2&&z>EXHIBITION_LAYOUT.z-EXHIBITION_LAYOUT.depth/2&&z<EXHIBITION_LAYOUT.z+EXHIBITION_LAYOUT.depth/2);
  assert.ok(!atriumVoids(3).some(h=>Math.abs(x-h.x)<h.w/2&&z>h.back&&z<h.front));
  const bounds=new THREE.Box3().setFromObject(board);assert.ok(bounds.max.z-bounds.min.z>bounds.max.x-bounds.min.x,'展板底座须沿厅纵向摆放');
  f.structural.traverse(o=>{if(o.name==='upper_black_stair_tread')assert.ok(!bounds.intersectsBox(new THREE.Box3().setFromObject(o)),'展板不能插入上部楼梯踏板');});
 }
 const wood=f.furniture.getObjectByName('photo_abstract_wood_sculpture');assert.equal(!!wood,f.info.n===3,'R51木雕只放在三楼展厅');
 const lift=f.furniture.getObjectByName('user_elevator_landing');assert.ok(lift);assert.equal(lift.position.x,ELEVATOR_LAYOUT.x);assert.equal(lift.position.z,ELEVATOR_LAYOUT.z);
 assert.equal(lift.rotation.y,Math.PI/2,'各层电梯门朝向必须一致');
 const core=f.structural.getObjectByName('user_white_transport_core');assert.ok(core);
 if(core){assert.ok(core.getObjectByName('transport_core_white_wall'));assert.ok(core.getObjectByName('transport_core_return_stair'));assert.ok(TRANSPORT_CORE.left-6.2>=4,'后部交通区不得与中庭楼梯相连');if(f.info.n>1)assert.ok(atriumVoids(f.info.n).some(h=>h.transport),'楼梯上层必须留出楼板孔洞');}
 const footprint=floorBounds(f.info.n);assert.equal(footprint.left,-footprint.right,'以前台中轴为准，左右等宽');
 const slabBounds=new THREE.Box3().setFromObject(f.structural.getObjectByName('guide_outline_floor_slab'));assert.ok(Math.abs(slabBounds.min.x+34.4)<1e-4&&Math.abs(slabBounds.max.x-34.4)<1e-4,'检查实际楼板，不能只扩大数据外框');
 if(f.info.n>1){
  const b=floorBounds(f.info.n),toilets=[],rooms=[],racks=[];
  f.furniture.traverse(o=>{if(o.name==='upper_toilet')toilets.push(o);if(o.name==='upper_seminar_room')rooms.push(o);if(o.name==='guide_book_rack')racks.push(o);});
  assert.equal(toilets.length,2);assert.ok(toilets[0].position.x<ELEVATOR_LAYOUT.x&&toilets[1].position.x>ELEVATOR_LAYOUT.x);
  assert.equal(rooms.length,upperFacilities(f.info.n).rooms.length);assert.equal(!!f.furniture.getObjectByName('upper_rear_wall_lockers'),f.info.n===5);
  assert.equal(b.front,GROUND_LAYOUT.frontZ);assert.equal(b.right-b.left,68.8);assert.ok(b.right-TRANSPORT_CORE.right<.3,'白墙交通区必须接到右侧墙');for(const wc of toilets){assert.ok(Math.abs(wc.position.z+GROUND_LAYOUT.toilet.d/2-GROUND_LAYOUT.frontZ)<4,'厕所仍在原前角');assert.ok(b.front-(wc.position.z+GROUND_LAYOUT.toilet.d/2)<.3,'厕所必须贴前端角落');assert.ok(Math.min(wc.position.x-GROUND_LAYOUT.toilet.w/2-b.left,b.right-wc.position.x-GROUND_LAYOUT.toilet.w/2)<.3,'厕所外边沿贴侧墙');const size=new THREE.Box3().setFromObject(wc.getObjectByName('toilet_room_shell')).getSize(new THREE.Vector3());assert.ok(Math.abs(size.x-13)<.001&&Math.abs(size.z-12.4)<.001,'每层每个厕所均为四格');}assert.equal(!!f.furniture.getObjectByName('upper_cultural_exchange_centre'),f.info.n===4);
  if(f.info.n===5){assert.ok(racks.length>10);assert.equal(upperFacilities(5).periodicals.length,6);}else{assert.ok(racks.some(r=>r.position.z>22));assert.ok(racks.some(r=>r.position.z<-24));}
  upperChecks.push({floor:f.info.n,bounds:b,two_toilets:true,schematic_perimeter_room_segments:rooms.length,current_room_uses_verified:false,book_racks:racks.length,cultural_exchange_centre:f.info.n===4,periodical_zones:upperFacilities(f.info.n).periodicals.length,core_attached_to_right_wall:true,toilets_at_corners:true,rear_wall_lockers:f.info.n===5,shape_only_reading_desks:f.furniture.children.filter(o=>o.name==='reading_desk'&&o.userData.deskSample===null).length});
 }
 if(f.info.n===1){const counter=f.furniture.getObjectByName('photo_red_wood_service_counter');assert.ok(counter);assert.equal(counter.children.filter(o=>o.name==='service_monitor').length,6);
  const ps=f.furniture.getObjectByName('ground_printer_row');assert.equal(ps.children.filter(o=>o.name==='schematic_printer').length,4);
  const cabinets=[];f.furniture.traverse(o=>{if(o.name==='compact_storage_cabinet')cabinets.push(o);});assert.equal(cabinets.length,GROUND_LAYOUT.compactBlocks.reduce((n,b)=>n+Math.floor(b.d/6)*(b.columns||4),0));assert.ok(cabinets.every(o=>!o.userData.seatId));
  const blocks=[];f.furniture.traverse(o=>{if(o.name==='ground_compact_storage_block')blocks.push(o);});assert.ok(blocks.every(b=>b.position.x<=0));assert.ok(blocks.some(b=>b.position.x===0&&b.position.z<counter.position.z));
  const dedicated=f.furniture.children.filter(o=>o.name==='reading_desk'&&o.userData.dedicated);assert.equal(dedicated.length,GROUND_LAYOUT.dedicated.rows.length*2);assert.ok(dedicated.every(o=>!o.userData.seatId&&o.position.x>7));
  const sofas=[];f.furniture.traverse(o=>{if(o.name==='ground_wood_sofa')sofas.push(o);});assert.equal(sofas.length,4);assert.ok(sofas.every(o=>o.position.z>STAIR_LAYOUT[1].start));assert.ok(f.furniture.getObjectByName('ground_toilet'));
  // 对应用户确认的朝向：门面指向+X；门前通道应在井道右侧，不能仍按旧门面求路线。
  assert.equal(lift.rotation.y,Math.PI/2);const door=lift.getObjectByName('elevator_closed_door');const norm=new THREE.Vector3(0,0,1).applyQuaternion(door.getWorldQuaternion(new THREE.Quaternion()));assert.ok(norm.x>.99);assert.ok(ELEVATOR_LAYOUT.groundLanding.x>lift.position.x);
  const leftBlock=blocks.find(b=>b.position.x<0),rowZ=new Set(leftBlock.children.filter(o=>o.name==='compact_storage_cabinet').map(o=>o.position.z));assert.equal(rowZ.size,Math.floor(GROUND_LAYOUT.compactBlocks[0].d/6));
  const smallRacks=[];f.furniture.traverse(o=>{if(o.name==='ground_small_display_shelf')smallRacks.push(o);});assert.equal(smallRacks.length,2);
  for(const side of [-1,1]){const pair=sofas.filter(o=>Math.sign(o.position.x)===side).sort((a,b)=>a.position.x-b.position.x),rack=smallRacks.find(o=>Math.sign(o.position.x)===side),bounds=new THREE.Box3().setFromObject(rack);assert.equal(pair.length,2);assert.ok(pair[0].position.x<rack.position.x&&rack.position.x<pair[1].position.x);assert.ok(bounds.max.z-bounds.min.z>bounds.max.x-bounds.min.x);}
  assert.ok(sofas.every(o=>Math.abs(o.rotation.y-Math.PI)<1e-7));assert.ok(GROUND_LAYOUT.dedicated.x<GROUND_LAYOUT.cafe.x-GROUND_LAYOUT.cafe.w/2,'专座内移，咖啡厅占原右翼长条区域');
  const toilet=f.furniture.getObjectByName('ground_toilet'),wcDoor=toilet.getObjectByName('toilet_door');assert.ok(wcDoor.position.z<0&&wcDoor.userData.open,'厕所入口保持打开，朝后方阅览桌排');
  assert.equal(counter.position.x,0,'前台在左右两翼的中轴上');assert.ok(f.furniture.getObjectByName('ground_cafe'),'一楼右侧咖啡厅必须存在');assert.ok(GROUND_LAYOUT.cafe.x>0);assert.ok(f.furniture.getObjectByName('ground_room_107'));assert.ok(f.furniture.getObjectByName('ground_room_106'));assert.equal(TRANSPORT_CORE.exits.length,2);assert.equal(core.getObjectsByProperty('name','transport_core_entry_lintel').length,2);assert.ok(f.furniture.getObjectByName('ground_room_107'));assert.ok(f.furniture.getObjectByName('ground_room_106'));assert.equal(TRANSPORT_CORE.exits.length,2);assert.equal(core.getObjectsByProperty('name','transport_core_entry_lintel').length,2);assert.ok(Math.abs((GROUND_LAYOUT.toilet.x-GROUND_LAYOUT.toilet.w/2)-(upperFacilities(2).toilets[0].x-upperFacilities(2).toilets[0].w/2))<.02);
  assert.ok(f.furniture.children.filter(o=>o.name.startsWith('reading_chair_')).every(o=>o.position.x<-13));
  f.structural.traverse(o=>{if(o.name==='lower_black_stair_tread')assert.equal(o.material.color.getHexString(),'596166');});
 }
 if(f.info.n===3){
  const edge=f.structural.getObjectByName('photo_third_floor_potted_edge');assert.ok(edge);let vines=0;edge.traverse(o=>{if(o.name==='photo_trailing_vines')vines++;});assert.equal(vines,0);
  const desks=f.furniture.children.filter(o=>o.name==='reading_desk'&&o.userData.rearRow);assert.equal(desks.length,2);
  for(const desk of desks){const b=new THREE.Box3().setFromObject(desk);assert.ok(b.max.z-b.min.z>b.max.x-b.min.x,'木雕后方书桌沿纵向摆放');assert.ok(desk.position.z<wood.position.z);}
  assert.equal(f.structural.children.filter(o=>o.name==='third_floor_seating_access_landing').length,2);
  const c=f.furniture.getObjectByName('ceramic_tree_display'),a=f.furniture.getObjectByName('armillary_display');assert.ok(a.position.z>c.position.z&&c.position.z>wood.position.z,'前后顺序必须为金球、白瓷、木雕');
  for(const p of f.structural.children.filter(o=>o.name==='third_floor_seating_access_landing')){const b=new THREE.Box3().setFromObject(p);assert.ok(b.max.z<STAIR_LAYOUT[2].end);assert.ok(b.min.z>STAIR_LAYOUT[3].start);}
 }
 placementChecks.push({floor:f.info.n,lower_escalators:f.info.n===1,curved_terraces:f.info.n===2,upper_ordinary_stairs:upper,central_exhibition_boards:boards.length,white_transport_core:true,elevator_door_faces_right:true,front_desk_axis_symmetric:true,bounds:footprint,cafe:f.info.n===1});
}
// 使用同一套真实家具碰撞边界检查三楼进出通道和下楼，避免只测空地图。
const obstacles=collectWalkObstacles(floorRoot,THREE.Box3),walkChecks=[];
for(const side of [-1,1]){let p={...walkStairEntry(3),x:side*4.65};for(let i=0;i<100;i++)p=advanceWalk(p,side*.03,0,obstacles);assert.ok(side*p.x>7);assert.equal(p.floor,3);walkChecks.push({side,third_floor_access:true});}
let down=walkStairEntry(3);for(let i=0;i<320;i++)down=advanceWalk(down,0,.025,obstacles);assert.equal(down.floor,2);assert.ok(Math.abs(down.y-4.95)<.02);walkChecks.push({third_to_second_descent:true});
let lobbyWalk={x:7.5,z:31,y:.15,floor:1};for(let i=0;i<350;i++)lobbyWalk=advanceWalk(lobbyWalk,0,-.03,obstacles);assert.ok(lobbyWalk.z<21);walkChecks.push({expanded_ground_lobby_clear:true});
// 左右沙发/书架外移后，入口中轴与左右上楼接近线都必须保持可走；按最终家具包围盒检查。
for(const x of [-7.5,0,7.5]){let p={x,z:31,y:.15,floor:1};for(let i=0;i<350;i++)p=advanceWalk(p,0,-.03,obstacles);assert.ok(p.z<21,'沙发书架不能挡住入口直行通道：'+x);}
walkChecks.push({lounge_groups_moved_outward:true,ground_entry_aisles_clear:[-7.5,0,7.5]});
const approach=routePoints(['hall1','elevator1'],makeData(now).seats);let elevatorWalk={...approach[0],y:.15};
for(const target of approach.slice(1)){const dx=target.x-elevatorWalk.x,dz=target.z-elevatorWalk.z,n=Math.ceil(Math.hypot(dx,dz)/.03);for(let i=0;i<n;i++)elevatorWalk=advanceWalk(elevatorWalk,dx/n,dz/n,obstacles);assert.ok(Math.hypot(elevatorWalk.x-target.x,elevatorWalk.z-target.z)<.04,'一楼电梯通路阻挡：'+JSON.stringify({p:elevatorWalk,target,near:obstacles.filter(o=>Math.abs((o.minX+o.maxX)/2-elevatorWalk.x)<3&&Math.abs((o.minZ+o.maxZ)/2-elevatorWalk.z)<3&&o.minY<elevatorWalk.y+1.6&&o.maxY>elevatorWalk.y+.25)}));}
walkChecks.push({ground_print_row_bypassed_and_dedicated_desks_leave_elevator_access:true});
// 上层桌排为共同井道让位后，同样使用真实家具边界检查从大厅到门前的通路。
for(let floor=2;floor<=5;floor++){
 const points=routePoints(['hall'+floor,'elevator'+floor],makeData(now).seats);let p={...points[0],y:(floor-1)*4.8+.15};
 for(const target of points.slice(1)){const dx=target.x-p.x,dz=target.z-p.z,n=Math.ceil(Math.hypot(dx,dz)/.03);for(let i=0;i<n;i++)p=advanceWalk(p,dx/n,dz/n,obstacles);assert.ok(Math.hypot(p.x-target.x,p.z-target.z)<.04,'上层电梯门前通路被家具挡住：'+floor+JSON.stringify({p,target,near:obstacles.filter(o=>Math.abs((o.minX+o.maxX)/2-p.x)<2&&Math.abs((o.minZ+o.maxZ)/2-p.z)<2&&o.minY<p.y+1.6&&o.maxY>p.y+.25)}));}
 walkChecks.push({floor,elevator_approach_clear:true});
}
// 验证侧楼梯在实际白墙和家具包围盒下也能上下，不只在空地图检查高度。
const sideStair=TRANSPORT_CORE.stair;let coreUp={x:sideStair.leftX,z:sideStair.front+.25,y:4.95,floor:2};
for(let floor=2;floor<5;floor++){for(let i=0;i<212;i++)coreUp=advanceWalk(coreUp,0,-.025,obstacles);for(let i=0;i<68;i++)coreUp=advanceWalk(coreUp,.025,0,obstacles);for(let i=0;i<212;i++)coreUp=advanceWalk(coreUp,0,.025,obstacles);assert.equal(coreUp.floor,floor+1);if(floor<4)for(let i=0;i<68;i++)coreUp=advanceWalk(coreUp,-.025,0,obstacles);}
let coreDown={x:sideStair.rightX,z:sideStair.front+.25,y:19.35,floor:5};
for(let floor=5;floor>2;floor--){for(let i=0;i<212;i++)coreDown=advanceWalk(coreDown,0,-.025,obstacles);for(let i=0;i<68;i++)coreDown=advanceWalk(coreDown,-.025,0,obstacles);for(let i=0;i<212;i++)coreDown=advanceWalk(coreDown,0,.025,obstacles);assert.equal(coreDown.floor,floor-1);if(floor>3)for(let i=0;i<68;i++)coreDown=advanceWalk(coreDown,.025,0,obstacles);}
walkChecks.push({white_core_return_stair_up_and_down_with_real_geometry:true});
// 跟随实际折线逐步行走，途中不直接改坐标或传送越过碰撞体。
function followCheckedWalk(p,targets,label){for(const target of targets){const dx=target.x-p.x,dz=target.z-p.z,n=Math.ceil(Math.hypot(dx,dz)/.025);for(let i=0;i<n;i++)p=advanceWalk(p,dx/n,dz/n,obstacles);assert.ok(Math.hypot(p.x-target.x,p.z-target.z)<.04,label+JSON.stringify({p,target}));}return p;}
// 补足的横向翼部、前部通道与后部房间也必须能走到，不能只有看起来加大的楼板。
for(let floor=2;floor<=5;floor++){
 let p={x:7,z:33.25,y:(floor-1)*4.8+.15,floor};for(let i=0;i<160;i++)p=advanceWalk(p,-.025,0,obstacles);assert.ok(p.x<3.1,'上层前厅通道必须开放：'+floor);
 for(const r of upperFacilities(floor).rooms){let q={x:r.x,z:r.z+r.d/2+.55,y:(floor-1)*4.8+.15,floor};for(let i=0;i<72;i++)q=advanceWalk(q,0,-.025,obstacles);assert.ok(q.z<r.z+r.d/2-.8,'后方研讨室门洞可进入');}
 // 横向书架成组后，主通道位于书架与窗边桌之间；到东端再接内侧后部通道。
 for(const side of [-1,1]){
  let q={x:side*27.4,z:17,y:(floor-1)*4.8+.15,floor};
  const targets=side<0?[{x:q.x,z:-52.1},{x:-20.4,z:-52.1},{x:-20.4,z:floorBounds(floor).back+3}]:[{x:q.x,z:TRANSPORT_CORE.approach.z},{x:TRANSPORT_CORE.entry.x,z:TRANSPORT_CORE.approach.z},{x:TRANSPORT_CORE.entry.x,z:TRANSPORT_CORE.back-2},{x:20.4,z:TRANSPORT_CORE.back-2},{x:20.4,z:floorBounds(floor).back+3}];
  q=followCheckedWalk(q,targets,'左右翼应通过成组书架外侧的实际通道到后沿：'+floor+'/'+side);assert.ok(q.z<-48);
 }

 let q={x:7.2,z:-22,y:(floor-1)*4.8+.15,floor};for(let i=0;i<Math.ceil((-22-(floorBounds(floor).back+2))/.03);i++)q=advanceWalk(q,0,-.03,obstacles);assert.ok(q.z<floorBounds(floor).back+3,'电梯后方完整延伸区域应有连续通路：'+floor);
 walkChecks.push({floor,expanded_front_passage_clear:true,rear_rooms_accessible:floor<5?true:null,wider_wing_clear:true});
}
const culture=upperFacilities(4).culture;let culturalWalk={x:culture.x,z:culture.z+culture.d/2+.6,y:14.55,floor:4};for(let i=0;i<80;i++)culturalWalk=advanceWalk(culturalWalk,0,-.025,obstacles);assert.ok(culturalWalk.z<culture.z+culture.d/2-.8,'中日文化交流中心门洞可进入');walkChecks.push({fourth_floor_culture_entry_clear:true});
const photoExterior=details.rearLibrary.getObjectByName('photo_exterior_details');
// 检查两端真门洞：从电梯门前到两个出口，再转回大厅一侧；使用最终墙体和家具碰撞。
for(let floor=1;floor<=5;floor++)for(const exit of TRANSPORT_CORE.exits){
 let p={...ELEVATOR_LAYOUT.landing,y:(floor-1)*4.8+.15,floor};
 const z=exit.z+(exit.face==='front'?.7:-.6);
 for(const target of [{x:p.x,z},{x:exit.face==='front'?19.1:7.2,z}]){
  const dx=target.x-p.x,dz=target.z-p.z,n=Math.ceil(Math.hypot(dx,dz)/.025);
  for(let i=0;i<n;i++)p=advanceWalk(p,dx/n,dz/n,obstacles);
  assert.ok(Math.hypot(p.x-target.x,p.z-target.z)<.04,'电梯厅两端出口应能通行：'+floor+'/'+exit.face);
 }
 walkChecks.push({floor,lift_hall_exit:exit.face,walkable_with_real_obstacles:true});
}
let leftRear={x:-19.1,z:20.5,y:.15,floor:1};for(let i=0;i<2600;i++)leftRear=advanceWalk(leftRear,0,-.03,obstacles);assert.ok(leftRear.z<-50,'一楼左侧延伸到后部应可通行');walkChecks.push({ground_left_rear_extended_and_walkable:true});
// 2026-10-18现场补充：柱间实墙应真正阻挡横穿，柜库后方应留通道通往收书室。
const ground=floors.storeys[0],groundWalls=ground.furniture.getObjectsByProperty('name','ground_partition_wall');
assert.equal(groundWalls.length,4,'两道柱间墙及两组沙发背墙应存在');
for(const side of [-1,1]){let p={x:side*5.7,z:-20,y:.15,floor:1};for(let i=0;i<80;i++)p=advanceWalk(p,side*.025,0,obstacles);assert.ok(Math.abs(p.x)<6.1,'不能穿过服务台后柱间实墙');}
const receiving=GROUND_LAYOUT.rooms.find(r=>r.bookStorage);assert.ok(receiving&&receiving.x>0&&receiving.z<-44);
const centralBookBlock=GROUND_LAYOUT.compactBlocks.find(b=>b.x===0);assert.ok(centralBookBlock.z-centralBookBlock.d/2>receiving.z+receiving.d/2+2,'密集书库后端须留横向通道');
let receivingWalk={x:-4.3,z:10.3,y:.15,floor:1};
receivingWalk=followCheckedWalk(receivingWalk,[{x:-4.3,z:-42.4},{x:-2.4,z:-42.4},{x:-2.4,z:receiving.z},{x:.2,z:receiving.z}],'台后密集书库与收书室之间必须留可走通道');
const smallWoodTables=ground.furniture.getObjectsByProperty('name','ground_receiving_wood_table');assert.equal(smallWoodTables.length,3);assert.ok(smallWoodTables.every(t=>!t.userData.seatId));
for(const sofa of ground.furniture.getObjectsByProperty('name','ground_wood_sofa')){const b=new THREE.Box3().setFromObject(sofa);assert.ok(b.max.z<31.91&&31.91-b.max.z<.3,'沙发背面靠前端墙且不穿墙');assert.ok(sofa.position.z>30);}
walkChecks.push({ground_counter_rear_partition_walls:2,ground_rear_receiving_room:true,compact_rear_cross_aisle_walkable:true,wood_side_tables:3,sofas_near_entrance_against_wall:true});
// 本轮确认的不是单个设施平移：右翼要有完整楼面、延长家具、末端通路和106房间次序。
assert.equal(GROUND_LAYOUT.rightBoundaryZ,floorBounds(1).back);
assert.ok(floorBounds(1).back>floorBounds(2).back,'一楼范围小于上层');
assert.ok(TRANSPORT_CORE.back-floorBounds(1).back<3,'一楼在交通区后结束');
for(let f=2;f<=5;f++)assert.ok(TRANSPORT_CORE.back-floorBounds(f).back>20&&TRANSPORT_CORE.back-floorBounds(f).back<35,'上层保留有限后区，电梯位置固定，不再按数学中点无限补长');
assert.ok(GROUND_LAYOUT.dedicated.z-GROUND_LAYOUT.dedicated.d/2>floorBounds(1).back,'专座区域色块不能伸出楼板');
assert.ok(GROUND_LAYOUT.dedicated.z-GROUND_LAYOUT.dedicated.d/2<TRANSPORT_CORE.front+1);
assert.ok(GROUND_LAYOUT.cafe.d>40);
const staffRoom=GROUND_LAYOUT.rooms.find(r=>r.id==='106');
assert.ok(staffRoom.z+staffRoom.d/2<GROUND_LAYOUT.cafe.z-GROUND_LAYOUT.cafe.d/2);
assert.ok(staffRoom.z-staffRoom.d/2>TRANSPORT_CORE.front);
assert.equal(TRANSPORT_CORE.left,GROUND_LAYOUT.dedicated.x-GROUND_LAYOUT.dedicated.w/2,'交通区横跨专座后方到侧墙');
assert.equal(ELEVATOR_LAYOUT.x,GROUND_LAYOUT.dedicated.x,'电梯须在专座后方这一端');
assert.ok(TRANSPORT_CORE.stair.leftX>ELEVATOR_LAYOUT.x+10,'靠外墙端为楼梯，两者不能挤成同侧小盒子');
let rightRear={x:19.1,z:20.5,y:.15,floor:1};
rightRear=followCheckedWalk(rightRear,[{x:rightRear.x,z:TRANSPORT_CORE.approach.z},{x:TRANSPORT_CORE.entry.x,z:TRANSPORT_CORE.approach.z},{x:TRANSPORT_CORE.entry.x,z:TRANSPORT_CORE.back-.6}],'专座旁过道应接入完整交通区并贯通后沿');
for(let floor=1;floor<=5;floor++){const p={...ELEVATOR_LAYOUT.landing,y:(floor-1)*4.8+.15,floor};followCheckedWalk(p,[{x:p.x,z:TRANSPORT_CORE.stair.front+1},{x:TRANSPORT_CORE.stair.leftX,z:TRANSPORT_CORE.stair.front+1},{x:TRANSPORT_CORE.stair.leftX,z:TRANSPORT_CORE.stair.front+.25}],'电梯与侧楼梯之间必须横向贯通：'+floor);}
walkChecks.push({ground_right_full_depth:true,rear_aisle_clear:true,staff_between_cafe_and_terminal_core:true});
const columnBays=photoExterior.children.filter(g=>g.name==='photo_three_column_bay'),windows=photoExterior.children.filter(g=>g.name==='photo_plum_shaped_window');
assert.equal(columnBays.length,2);assert.equal(windows.length,2);
for(const opening of windows){
 const bay=columnBays.find(g=>g.userData.side===opening.userData.side);assert.equal(bay.children.length,3);
 assert.ok(bay.children.every(c=>Math.abs(opening.position.x)<Math.abs(c.position.x)&&opening.position.z<c.position.z));
 const ray=new THREE.Raycaster(new THREE.Vector3(opening.position.x,3.12,opening.position.z-2),new THREE.Vector3(0,0,1),0,3);
 scene.updateMatrixWorld(true);
 // 窗口本身的红砖和石材不能堵住花形中心；不使用有色玻璃假装孔洞。
 const localOrigin=opening.getWorldPosition(new THREE.Vector3());ray.ray.origin.set(localOrigin.x,localOrigin.y+3.12,localOrigin.z-2);
 assert.equal(ray.intersectObject(opening,true).length,0,'梅花形中心须为通透开口');
}
assert.equal(details.rearLibrary.children.filter(o=>o.name==='rear_continuous_glass_bay').length,3);
// 第一视角核对图使用当前楼层及相邻楼层、吊顶和同源窗外环境，不另造一套室内模型。
campus.visible=false;rear.visible=false;floorRoot.visible=true;overlay.visible=false;floors.skylight.visible=true;
for(const f of floors.storeys){f.root.visible=f.info.n<=2;f.root.position.y=(f.info.n-1)*floors.height;f.furniture.visible=true;f.ceiling.visible=true;}
createWalkSurroundings(scene,H).visible=true;capture('ground-walk');
fs.writeFileSync(path.join(folder,'model-data.json'),JSON.stringify({geometries,views}));
fs.writeFileSync(path.join(folder,'upper-layout-check.json'),JSON.stringify(upperChecks,null,2));
fs.writeFileSync(path.join(folder,'scene-check.json'),JSON.stringify({views:checks,all_exported_views:Object.keys(views),physical_seat_coordinate_check:60,photo_detail_views:PHOTO_REFERENCES.length,placement_checks:placementChecks,walk_geometry_checks:walkChecks,ground_layout:{window_sample_seats:12,schematic_printers:4,schematic_compact_cabinets:GROUND_LAYOUT.compactBlocks.reduce((n,b)=>n+Math.floor(b.d/6)*(b.columns||4),0),left_compact_rows:Math.floor(GROUND_LAYOUT.compactBlocks[0].d/6),aligned_elevator_floors:5,ground_lift_faces_right:true,lift_behind_dedicated_seats:true,dedicated_desks_moved_inward:true,lift_hall_exits:2,rooms:['107研讨室','106工作人员室','收书室'],counter_side_partition_walls:2,receiving_wood_tables:3,sofas_against_front_wall:true,cafe_in_right_long_strip:true,extended_left_rear:true,full_depth_right_rear:true,ground_back_aligned:true,traffic_at_dedicated_rear:true,unmonitored_dedicated_desks:GROUND_LAYOUT.dedicated.rows.length*2,lobby_sofas:4,small_display_shelves:2,sofas_face_inside:true,shelf_between_sofas_longitudinal:true,toilet_on_left:true,toilet_door_faces_desks:true},facade_relationships:{three_glass_bays:3,outer_column_groups:2,columns_per_group:3,inner_open_flower_apertures:2,flower_centers_not_occluded:true},scope:'真实Three.js几何与状态层检查；不等于WebGL/浏览器实测'},null,2));
console.log('EXPORTED '+Object.keys(views).length+' unified model views');
