import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {buildExterior,buildLibraryFloors,FLOOR_INFO} from './architecture.js';
const $=id=>document.getElementById(id),host=$('viewport');
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9e7df');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});}catch(e){$('fallback').style.display='flex';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.prepend(renderer.domElement);
const camera=new THREE.PerspectiveCamera(38,1,.1,300);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.maxPolarAngle=Math.PI*.47;controls.minDistance=20;controls.maxDistance=240;
scene.add(new THREE.HemisphereLight('#fbf8ee','#abb9ac',2.4));const sun=new THREE.DirectionalLight('#fff5df',3);sun.position.set(-18,40,24);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-80,right:80,top:80,bottom:-80,near:1,far:160});sun.shadow.bias=-.0002;scene.add(sun);
const mats={};function material(color,opts={}){const k=color+JSON.stringify(opts);return mats[k]??=new THREE.MeshStandardMaterial({color,roughness:.78,...opts});}
function box(parent,name,w,h,d,x,y,z,color,opts={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color,opts));m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent,name,r,h,x,y,z,color,rTop=r){const m=new THREE.Mesh(new THREE.CylinderGeometry(rTop,r,h,12),material(color));m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,name,r,x,y,z,color){const m=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),material(color));m.name=name;m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function group(parent,name){const g=new THREE.Group();g.name=name;parent.add(g);return g;}
const interior=group(scene,'concept_interior');const exterior=group(scene,'jiageng_building_impression');exterior.visible=false;
interior.userData={description:'A-D concept zones, not a measured floor plan',units:'conceptual meters'};exterior.userData={description:'Architectural impression, not a surveyed reconstruction; upper tower not assigned to library'};
box(scene,'ground',150,.2,150,0,-1.7,0,'#e4e4d8');
function plant(parent,x,z,scale=1){const p=group(parent,'planter');p.position.set(x,0,z);p.scale.setScalar(scale);cylinder(p,'terracotta_pot',.35,.6,0,.3,0,'#b99d79',.48);cylinder(p,'stem',.035,1.2,0,1.0,0,'#6c7350');for(let i=0;i<5;i++){const a=i*2.3;sphere(p,'foliage',.38,Math.cos(a)*.28,1.25+i*.12,Math.sin(a)*.28,'#6e9270');}return p;}
function chair(parent,x,z,rot=0,col='#738f86'){const g=group(parent,'chair');g.position.set(x,0,z);g.rotation.y=rot;box(g,'seat',.64,.12,.63,0,.56,0,col);box(g,'back',.64,.62,.10,0,.92,-.27,col);for(const a of [-.24,.24])for(const b of [-.23,.23])box(g,'leg',.045,.5,.045,a,.25,b,'#68736d');return g;}
function table(parent,x,z,w=2.5,d=1.3){const g=group(parent,'table');g.position.set(x,0,z);box(g,'oak_worktop',w,.13,d,0,.83,0,'#cbb891');for(const a of [-w/2+.18,w/2-.18])for(const b of [-d/2+.15,d/2-.15])box(g,'table_leg',.08,.77,.08,a,.39,b,'#a2aaa0');return g;}
function bookcase(parent,x,z,rot=0,w=2.6){const g=group(parent,'bookcase');g.position.set(x,0,z);g.rotation.y=rot;box(g,'back',w,2.2,.1,0,1.1,-.24,'#baa985');for(const a of [-w/2,w/2])box(g,'side',.1,2.2,.55,a,1.1,0,'#baa985');for(let row=0;row<4;row++){const y=.15+row*.55;box(g,'shelf',w,.07,.56,0,y,0,'#b4a481');for(let n=0;n<12;n++){const colors=['#789084','#b4a16d','#8093a1','#b47b67','#9b8a9d'];const h=.29+(n%4)*.035;const b=box(g,'book',.12,h,.30,-w/2+.21+n*(w-.32)/12,y+h/2+.06,.01,colors[(n+row)%5]);b.rotation.z=(n%5===0)?.1:0;}}return g;}
function railing(parent,x,z,w,d){box(parent,'glass_balustrade',w,.95,d,x,1.7,z,'#bed7d1',{transparent:true,opacity:.42,metalness:.15});}
// Conceptual atrium floor: no field dimensions are claimed.
for(const [name,w,d,x,z] of [['west',14,26,-11,0],['east',14,26,11,0],['north',8,5,0,-10.5],['south',8,13,0,6.5]])box(interior,'floor_'+name,w,.26,d,x,0,z,'#e5dfce');
box(interior,'atrium_lower_floor',7.5,.15,8,0,-1.35,-4,'#cfdbc9');
plant(interior,0,-4,1.7).position.y=-1.27;
box(interior,'A_blue_zone',12,.035,13,-11,.16,-4.3,'#d4e3e7');box(interior,'B_green_zone',12,.035,13,11,.16,-4.3,'#d4e4d5');box(interior,'C_heritage_zone',12,.035,7,-11,.16,8.4,'#e5d8b9');box(interior,'D_booking_zone',12,.035,7,11,.16,8.4,'#dfdce9');
box(interior,'back_wall',36,3.2,.28,0,1.6,-13,'#f3efe5');box(interior,'left_cut_wall',.28,.75,26,-18,.375,0,'#e8e3d7');box(interior,'right_cut_wall',.28,.75,26,18,.375,0,'#e8e3d7');
for(const x of [-15,-10,-5,0,5,10,15]){box(interior,'window',3.8,1.95,.08,x,1.9,-12.8,'#a9c6c6',{transparent:true,opacity:.52,metalness:.1});box(interior,'window_frame',.12,2.4,.18,x-1.95,1.9,-12.68,'#e9e3d3');}
for(const x of [-4,4])railing(interior,x,-4,.08,8);railing(interior,0,-8,8,.08);railing(interior,0,0,8,.08);
for(const x of [-3.5,3.5])for(const z of [-9,2])box(interior,'atrium_column',.30,4.7,.30,x,2.35,z,'#ede6d5');
// Upper gallery fragment conveys the documented high atrium without assigning a real floor.
box(interior,'upper_gallery',36,.16,2.1,0,4.3,-11.5,'#ede6d5');box(interior,'gallery_rail',36,.85,.06,0,4.85,-10.45,'#b7cdc3',{transparent:true,opacity:.32});
const zoneA=group(interior,'A_fixed_quiet_24_seats');for(const x of [-14.5,-11,-7.5])for(const z of [-7.8,-2.6]){table(zoneA,x,z,2.55,1.45);for(const dx of [-.63,.63]){chair(zoneA,x+dx,z-.95,0,'#7994a0');chair(zoneA,x+dx,z+.95,Math.PI,'#7994a0');}box(zoneA,'desk_divider',2.3,.36,.045,x,1.08,z,'#dde8e6');}
bookcase(zoneA,-11,-11.4,0,9);plant(zoneA,-16.8,1.5);
const zoneC=group(interior,'C_heritage_8_seats');for(const x of [-13.8,-8.4]){table(zoneC,x,8.6,2.8,1.45);for(const dx of [-.7,.7]){chair(zoneC,x+dx,7.65,0,'#ab9566');chair(zoneC,x+dx,9.55,Math.PI,'#ab9566');}}bookcase(zoneC,-11,5.1,0,8.5);plant(zoneC,-16.6,10.8);
const zoneD=group(interior,'D_booked_room_8_seats');table(zoneD,11,8.7,6.2,1.6);for(const x of [8.7,10.2,11.8,13.3]){chair(zoneD,x,7.55,0,'#8f8aab');chair(zoneD,x,9.85,Math.PI,'#8f8aab');}for(const [x,z,w,d] of [[5,8.6,.08,7.5],[17,8.6,.08,7.5],[11,12.2,12,.08]])box(zoneD,'booking_glass',w,1.8,d,x,1.05,z,'#b9c2d5',{transparent:true,opacity:.24});box(zoneD,'display',3.4,1.1,.08,11,1.6,5.1,'#405d57');
const zoneB=group(interior,'B_flexible_12_seats');bookcase(zoneB,11,-11.4,0,9);plant(zoneB,16.5,1.3);
const moving=[];for(let n=0;n<3;n++){
 const g=group(zoneB,'mobile_table_group_'+n);const x=7.4+n*3.6;table(g,0,0,2.5,1.5);for(const dx of [-.63,.63]){chair(g,dx,-1,0);chair(g,dx,1,Math.PI);}
 const a=new THREE.Vector3(x,0,-4.2),b=new THREE.Vector3(x,0,-4.2);g.position.copy(a);moving.push({object:g,read:a,discuss:b,readRot:0,discussRot:0});
}
// Move the three desk groups from staggered reading rows into one shared worktable.
moving[0].read.set(7.6,0,-7.3);moving[1].read.set(12.0,0,-4.1);moving[2].read.set(7.6,0,-.8);
moving[0].discuss.set(8.3,0,-4.3);moving[1].discuss.set(11.0,0,-4.3);moving[2].discuss.set(13.7,0,-4.3);
const partition=group(zoneB,'concept_acoustic_enclosure');
for(const [x,z,w,d] of [[5.2,-4,.10,13.2],[11.85,2.5,10.3,.10],[17,-4,.10,13.2]]){const panel=box(partition,'partition_panel',w,2.5,d,x,1.4,z,'#a3c1b1',{transparent:true,opacity:.28});panel.castShadow=false;}
const ribs=[];for(const x of [5.2,6.7,11.1,14,17])ribs.push(box(partition,'frame',.045,2.5,.05,x,1.4,2.5,'#758f81'));box(partition,'door_threshold',1.5,.08,.08,5.95,.19,2.5,'#b8cbaa');
const door=box(partition,'inward_open_door',1.45,2.4,.065,5.45,1.35,1.8,'#a3c1b1',{transparent:true,opacity:.26});door.rotation.y=-1.25;door.castShadow=false;
const people=group(zoneB,'four_mock_participants');for(const [n,x,z] of [[0,8.3,-5.3],[1,11,-5.3],[2,11,-3.3],[3,13.7,-3.3]]){const p=group(people,'mock_reader_'+n);p.position.set(x,0,z);cylinder(p,'body',.20,.60,0,.93,0,n%2?'#bd926d':'#718a94',.15);sphere(p,'head',.18,0,1.39,0,'#d3b898');box(p,'legs',.33,.36,.27,0,.5,0,'#606b70');}people.visible=false;
// Permanent route and reception remain outside the moving zone.
box(interior,'main_route',36,.025,2.0,0,.18,3.55,'#e9e5d5');box(interior,'entry_route',4.5,.025,9,0,.18,8.2,'#e9e5d5');box(interior,'service_desk',2.4,.95,1.0,-.2,.5,9.5,'#b8bdad');box(interior,'desk_top',2.6,.10,1.15,-.2,1.02,9.5,'#cdbb99');plant(interior,2.9,11.4);plant(interior,-3.1,11.4);
for(const z of [4.2,7.0,11.5]){const a=new THREE.Mesh(new THREE.ConeGeometry(.16,.38,3),material('#acb799'));a.rotation.x=Math.PI/2;a.position.set(1.8,.22,z);interior.add(a);}
const helpers={group,box,cylinder,material,plant,chair,table};
const exteriorDetails=buildExterior(exterior,helpers);
const libraryExterior=exteriorDetails.rearLibrary.clone(true);libraryExterior.name='main_3_library_rear_only';libraryExterior.position.z=0;libraryExterior.visible=false;scene.add(libraryExterior);
const buildingFloors=group(scene,'five_floor_library_cutaway');buildingFloors.visible=false;
const floorModel=buildLibraryFloors(buildingFloors,helpers);
let floorSelection=0,expanded=false,showFurniture=true,showSkylight=false;
function floorOffset(n){return (n-1)*(expanded?9.0:floorModel.height);}
function isFloorView(){return view==='floors'||view==='floorPlan';}
function isArchitectureView(){return view==='exterior'||view==='library';}
function syncFloorVisibility(){for(const f of floorModel.storeys){f.root.visible=floorSelection===0||f.info.n===floorSelection;f.root.position.y=floorOffset(f.info.n);f.furniture.visible=showFurniture;for(const m of f.structural.children)if(m.name.includes('beam'))m.visible=view!=='floorPlan'||!showFurniture;}floorModel.skylight.visible=showSkylight&&floorSelection===0&&!expanded;}
// All geometry and texture-free materials can be exported as portable GLB.
let mode='reading',pending=false,cooldown=false,view='exterior',progress=0,targetProgress=0,labelsOn=true,selected='B';
const descriptions={A:'24席概念容量。固定静音区始终保留安静阅读用途，桌椅与隔断不随B区转换。',B:'12席概念容量。分散桌组可汇成研讨桌；馆员确认后才演示布局改变。隔断属于待验证的声学设计假设。',C:'8席概念容量。特色馆藏阅读与资源入口衔接；保留无视觉采集的选择。',D:'8席概念容量。独立预约研讨室；既有预约不被其他小组的空间申请覆盖。'};
const labelPoints={A:new THREE.Vector3(-11,2.8,-8),B:new THREE.Vector3(11,2.8,-8),C:new THREE.Vector3(-11,2.4,9.5),D:new THREE.Vector3(11,2.4,9.5)};
for(const key of Object.keys(labelPoints)){const el=document.createElement('div');el.className='model-label';el.dataset.label=key;el.innerHTML='<b>'+key+' '+({A:'固定静音',B:'可转换学习',C:'特色馆藏',D:'预约研讨'}[key])+'</b>'; $('labelsLayer').append(el);}
function toast(text){$('toast').textContent=text;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',3000);}
function status(text,kind='normal'){$('status').textContent=text;$('status').dataset.kind=kind;}
function blockReason(){if($('objection').checked)return'邻近读者提出异议：本次不转换，请馆员进一步沟通。';if($('reserved').checked)return'B区已有有效预约：保护已有安排，本次不转换。';if(cooldown)return'当前处于600秒模拟冷却期，请先推进冷却时间。';return'';}
function syncUI(){
 $('approve').disabled=!pending;$('restore').disabled=mode!=='discussion';$('request').disabled=mode==='discussion';$('reading').classList.toggle('active',mode==='reading');$('advance').hidden=!cooldown;
 const floorMode=isFloorView();$('floorBar').hidden=!floorMode;$('floorPanel').hidden=!floorMode;$('pilotPanel').hidden=floorMode||isArchitectureView();$('pilotConditions').hidden=floorMode||isArchitectureView();$('pilotZones').hidden=floorMode||isArchitectureView();$('architecturePanel').hidden=!isArchitectureView();
 $('architectureHeading').textContent=view==='library'?'主三背面 · 图书馆馆舍':'主一至主五 · 校园楼群';
 $('architectureDescription').textContent=view==='library'?'当前只展示图书馆后部馆舍，主一、主二、主四、主五已隐藏。西侧大面积百叶、狭长窗带、花岗岩基座和架空屋盖依据馆方外景照片细化。':'先看整组建筑。中央主三可以点击；进入后只看主三背面的图书馆，再打开内部剖切。';
 $('locateLibrary').hidden=view==='library';$('libraryBack').hidden=view==='exterior';$('enterCutaway').hidden=view==='exterior';$('campusBack').hidden=view==='library';
 $('breadcrumb').textContent=floorMode?'校园楼群 › 主三背面图书馆 › '+(floorSelection?floorSelection+'F':'整体剖切'):view==='library'?'校园楼群 › 主三背面图书馆':view==='exterior'?'校园楼群 · 点击中央主三进入图书馆':'主三图书馆 › 独立方案试点';
 $('legend').style.display=view==='interior'||view==='top'?'block':'none';$('floorLegend').hidden=!floorMode;
 document.querySelectorAll('[data-floor]').forEach(e=>{const active=Number(e.dataset.floor)===floorSelection;e.classList.toggle('active',active);e.setAttribute('aria-pressed',String(active));});
 $('explode').textContent=expanded?'合拢楼层':'分层展开';$('explode').disabled=floorSelection!==0;$('skylight').disabled=floorSelection!==0||expanded;$('floorPilot').hidden=floorSelection!==3;
 const selectedFloor=FLOOR_INFO.find(f=>f.n===floorSelection);
 $('floorHeading').textContent=selectedFloor?['','一楼','二楼','三楼','四楼','五楼'][floorSelection]+' · '+selectedFloor.title:'五层整体剖切';
 $('floorDescription').textContent=selectedFloor?selectedFloor.summary:'二至五楼按馆方2025版分布图重排，统一东上、西下、北左、南右；每层轮廓与馆藏分区分别建模。一楼平面尚待核对。';
 $('floorTags').textContent=selectedFloor?selectedFloor.tags.join(' · '):'点击1F—5F，单独查看该层内部；分层展开查看上下层关系。';
 $('viewTitle').textContent=floorMode?$('floorHeading').textContent:view==='exterior'?'嘉庚主楼群全景':view==='library'?'主三背面 · 图书馆外观':pending?'研讨建议 · 等待确认':mode==='discussion'?'馆员确认后的研讨布局':cooldown?'恢复阅读 · 模拟冷却中':'柔性学习试点 · 阅读布局';
 $('viewDescription').textContent=floorMode?(floorSelection===0?(expanded?'楼层已拉开，分区依照2025版馆藏导览图。':'楼层叠合；外墙与屋盖已移除。'):'其余楼层已隐藏。平面俯瞰保持东上、西下、北左、南右，便于对照馆方导览图。'):view==='exterior'?'包含前部主楼群与主三后部图书馆。点击中央主三，定位图书馆。':view==='library'?'只保留主三背面的图书馆；可旋转查看西侧入口、百叶与屋盖，再进入空间剖切。':pending?'家具仍保持阅读布局；建议通过审核后才执行。':mode==='discussion'?'B区桌组汇合，概念隔断展开；A区与其他区域、主通道保持原有用途。':'52席独立方案试点，未指定真实馆舍中的房间位置。';
 $('collectionList').innerHTML=selectedFloor?selectedFloor.zones.map(z=>'<span style="border-left:3px solid '+z.color+'">'+z.label+'</span>').join(''):'选中一个楼层后显示馆藏分区。';
}
function applyTransforms(t){for(const item of moving){item.object.position.lerpVectors(item.read,item.discuss,t);item.object.rotation.y=item.readRot+(item.discussRot-item.readRot)*t;}partition.visible=t>.02;partition.scale.y=.2+.8*t;people.visible=t>.85;}
function setView(v){
 if(v==='top'&&(isFloorView()||isArchitectureView()))v='floorPlan';view=v;interior.visible=v==='interior'||v==='top';exterior.visible=v==='exterior';libraryExterior.visible=v==='library';buildingFloors.visible=isFloorView();
 for(const id of ['interior','exterior','library','floors','top'])$(id).classList.toggle('active',id===v||(id==='top'&&v==='floorPlan'));syncFloorVisibility();
 if(v==='exterior'){camera.position.set(112,78,145);controls.target.set(0,18,-20);}
 else if(v==='library'){camera.position.set(56,35,-75);controls.target.set(0,12,-1);}
 else if(isFloorView()){
  const yy=floorSelection?floorOffset(floorSelection):expanded?17:9;
  if(v==='floorPlan'){camera.position.set(0,yy+93,.001);camera.up.set(0,1,0);controls.target.set(0,yy,0);}
  else if(floorSelection){camera.position.set(44,yy+36,58);controls.target.set(0,yy+1.0,0);}
  else{camera.position.set(61,expanded?67:47,77);controls.target.set(0,expanded?18:10,0);}
 }else if(v==='top'){camera.position.set(0,59,1);controls.target.set(0,0,0);}else{camera.position.set(38,35,43);controls.target.set(0,0,-1);}
 controls.update();syncUI();
}
function setFloor(n){floorSelection=Number(n);if(!Number.isInteger(floorSelection)||floorSelection<0||floorSelection>5)floorSelection=0;setView(view==='floorPlan'?'floorPlan':'floors');}
$('interior').onclick=()=>setView('interior');$('exterior').onclick=()=>setView('exterior');$('library').onclick=()=>setView('library');$('floors').onclick=()=>{floorSelection=0;setView('floors');};$('top').onclick=()=>setView(isFloorView()||isArchitectureView()?'floorPlan':'top');$('reset').onclick=()=>setView(view);
$('locateLibrary').onclick=()=>setView('library');$('enterCutaway').onclick=()=>{floorSelection=0;setView('floors');};
$('campusBack').onclick=()=>{setView('exterior');camera.position.set(100,65,-150);controls.target.set(0,19,-24);controls.update();};
$('libraryBack').onclick=()=>{setView('library');camera.position.set(0,20,-88);controls.target.set(0,14,0);controls.update();};
document.querySelectorAll('[data-floor]').forEach(el=>el.onclick=()=>setFloor(el.dataset.floor));
$('explode').onclick=()=>{expanded=!expanded;setView('floors');};
$('furniture').onchange=()=>{showFurniture=$('furniture').checked;syncFloorVisibility();};
$('skylight').onchange=()=>{showSkylight=$('skylight').checked;syncFloorVisibility();};
$('floorPilot').onclick=()=>setView('interior');
$('atriumView').onclick=()=>{floorSelection=0;expanded=false;setView('floors');camera.position.set(0,5.8,17.8);controls.target.set(0,10,-16);controls.update();};
$('facadeFront').onclick=()=>{setView('exterior');camera.position.set(0,31,154);controls.target.set(0,23,0);controls.update();};
$('roofDetail').onclick=()=>{if(view==='library'){camera.position.set(40,47,-54);controls.target.set(0,24,-8);}else{setView('exterior');camera.position.set(39,62,49);controls.target.set(0,40,-3);}controls.update();};
// Raycast only floor geometry; dragging rotates without unexpectedly selecting a floor.
const raycaster=new THREE.Raycaster();let pointerStart=null;
renderer.domElement.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});
renderer.domElement.addEventListener('pointerup',e=>{if(!pointerStart||Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>5)return;const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
 if(isFloorView()){const hits=raycaster.intersectObjects(floorModel.storeys.filter(f=>f.root.visible).map(f=>f.root),true);if(hits[0]){let o=hits[0].object;while(o&&!o.userData.floor)o=o.parent;if(o)setFloor(o.userData.floor);}}
 else if(view==='exterior'){const hit=raycaster.intersectObject(exterior,true)[0];if(hit){let o=hit.object;while(o&&!o.userData.main3)o=o.parent;if(o)setView('library');}}
 else if(view==='library'){const hit=raycaster.intersectObject(libraryExterior,true)[0];if(hit){floorSelection=0;setView('floors');}}
});
$('labels').onclick=()=>{labelsOn=!labelsOn;$('labels').setAttribute('aria-pressed',String(labelsOn));};
$('reading').onclick=()=>{pending=false;mode='reading';cooldown=false;targetProgress=0;status('已重置为常态阅读的演示初始状态。');syncUI();};
$('request').onclick=()=>{const reason=blockReason();if(reason){pending=false;status(reason,'blocked');}else{pending=true;status('建议已生成：B区满足本次预设条件。馆员确认后，再演示桌组与隔断变化。','pending');}syncUI();};
$('approve').onclick=()=>{const reason=blockReason();if(reason){pending=false;status(reason,'blocked');syncUI();return;}if(!pending)return;pending=false;mode='discussion';targetProgress=1;status('馆员已确认这次模拟转换。家具动画用于说明设计，真实调整需要工作人员实施。');syncUI();};
$('restore').onclick=()=>{pending=false;mode='reading';cooldown=true;targetProgress=0;status('已模拟连续无人300秒：恢复阅读用途，并进入600秒冷却期。');syncUI();};
$('advance').onclick=()=>{cooldown=false;status('已推进模拟时钟600秒，冷却结束，可以再次提出研讨建议。');syncUI();};
for(const id of ['objection','reserved'])$(id).onchange=()=>{if(pending){pending=false;status('条件发生变化，旧建议已失效，请重新生成。','blocked');}else if(mode==='discussion'&&$(id).checked)status('研讨进行中出现新约束：请馆员接管现场安排；页面不会自动搬动家具。','blocked');syncUI();};
function selectZone(key){selected=key;$('zoneDetail').textContent=descriptions[key];document.querySelectorAll('[data-zone]').forEach(el=>el.classList.toggle('active',el.dataset.zone===key));document.querySelectorAll('[data-label]').forEach(el=>el.classList.toggle('selected',el.dataset.label===key));}
document.querySelectorAll('[data-zone]').forEach(el=>el.onclick=()=>selectZone(el.dataset.zone));
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
$('snapshot').onclick=()=>{renderer.render(scene,camera);renderer.domElement.toBlob(blob=>download(blob,isFloorView()?'嘉庚图书馆_'+(floorSelection?floorSelection+'F':'五层整体')+'_'+(expanded?'展开':'剖切')+'.png':'嘉庚2030_'+view+'_'+mode+'.png'),'image/png');};
function exportName(){return view==='exterior'?'嘉庚建筑意象.glb':view==='library'?'主三背面_图书馆外观.glb':isFloorView()?(floorSelection?'图书馆_'+floorSelection+'楼_空间剖切.glb':expanded?'图书馆_五层展开.glb':'图书馆_五层整体剖切.glb'):mode==='discussion'?'空间研讨配置.glb':'空间常态阅读.glb';}
async function exportGLB(){let root;if(view==='exterior')root=exterior;else if(view==='library')root=libraryExterior;else if(isFloorView()){root=floorSelection?floorModel.storeys[floorSelection-1].root.clone(true):buildingFloors;if(floorSelection)root.position.y=0;}else root=interior;return await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});}
$('export').onclick=async()=>{try{$('export').disabled=true;const data=await exportGLB();download(new Blob([data],{type:'model/gltf-binary'}),exportName());toast('已导出当前三维模型');}catch(e){toast('导出失败：'+e.message);console.error(e);}finally{$('export').disabled=false;}};
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();selectZone('B');setView('exterior');applyTransforms(0);
const floorLabels=[];
for(const f of floorModel.storeys){const el=document.createElement('button');el.className='model-label floor-model-label';el.dataset.floorLabel=f.info.n;el.textContent=f.info.n+'F · '+f.info.title;el.onclick=()=>setFloor(f.info.n);$('labelsLayer').append(el);floorLabels.push({el,n:f.info.n});}
const functionLabels=[];for(let i=0;i<18;i++){const el=document.createElement('div');el.className='model-label function-label';$('labelsLayer').append(el);functionLabels.push(el);}
const main3Label=document.createElement('button');main3Label.className='model-label floor-model-label';main3Label.textContent='主三 · 点此进入背面图书馆';main3Label.onclick=()=>setView('library');$('labelsLayer').append(main3Label);
const directions=[['东区',0,-27],['北区',-22,0],['南区',22,0],['西区',0,26]].map(([text,x,z])=>{const el=document.createElement('div');el.className='model-label direction-label';el.textContent=text;$('labelsLayer').append(el);return{el,x,z};});
function positionLabel(el,pos,visible){const p=pos.clone().project(camera);el.style.left=((p.x*.5+.5)*host.clientWidth)+'px';el.style.top=((-p.y*.5+.5)*host.clientHeight)+'px';el.style.display=(visible&&labelsOn&&p.z<1&&Math.abs(p.x)<1.05&&Math.abs(p.y)<1.05)?'block':'none';}
let last=performance.now();function animate(now){const dt=Math.min((now-last)/1000,.08);last=now;if(Math.abs(targetProgress-progress)<.002)progress=targetProgress;else progress+=(targetProgress-progress)*Math.min(1,dt*2.8);applyTransforms(progress);controls.update();renderer.render(scene,camera);
 for(const el of document.querySelectorAll('[data-label]'))positionLabel(el,labelPoints[el.dataset.label],view==='interior'||view==='top');
 for(const l of floorLabels)positionLabel(l.el,new THREE.Vector3(-20.5,floorOffset(l.n)+1.25,20),isFloorView()&&(floorSelection===0||floorSelection===l.n));
 const info=FLOOR_INFO.find(f=>f.n===floorSelection);
 for(let i=0;i<functionLabels.length;i++){const zone=info?.zones[i];if(zone)functionLabels[i].textContent=zone.w<5?(zone.label==='中日文化交流中心'?'文化交流':zone.label.split(' ')[0]):zone.label==='儿童/教材/工具书'?'儿童/工具书':zone.label;positionLabel(functionLabels[i],new THREE.Vector3(zone?.x||0,floorOffset(floorSelection)+2.5,zone?.z||0),isFloorView()&&floorSelection>0&&showFurniture&&!!zone);}
 for(const d of directions)positionLabel(d.el,new THREE.Vector3(d.x,floorOffset(floorSelection)+.4,d.z),isFloorView()&&floorSelection>0);
 positionLabel(main3Label,new THREE.Vector3(0,26,17),view==='exterior');
 requestAnimationFrame(animate);
}requestAnimationFrame(animate);
function focusB(){setView('interior');camera.position.set(24,19,15);controls.target.set(11,.4,-4);controls.update();}
function floorPickPoint(n){const r=host.getBoundingClientRect(),p=new THREE.Vector3(15,floorOffset(n)+.25,19).project(camera);return{x:r.left+(p.x*.5+.5)*r.width,y:r.top+(-p.y*.5+.5)*r.height};}
window.modelApp={setView,setFloor,exportGLB,exportName,focusB,getState:()=>({mode,pending,cooldown,view,progress,selected,floorSelection,expanded,showFurniture,showSkylight,visibleFloors:floorModel.storeys.filter(f=>f.root.visible).map(f=>f.info.n),floorHeights:floorModel.storeys.map(f=>f.root.position.y),floorObjects:floorModel.storeys.map(f=>({n:f.info.n,title:f.info.title,childCount:f.root.children.length,furnitureVisible:f.furniture.visible})),meshCount:renderer.info.render.triangles,roofFeatures:{curvedOrangeRoofs:exteriorDetails.roofGroups.length,photoGuided:true},ASeats:24,BSeats:12,CSeats:8,DSeats:8,movableTables:moving.map(m=>m.object.position.toArray()),quietZoneSignature:zoneA.children.map(m=>m.position.toArray()),routeSignature:interior.getObjectByName('main_route').position.toArray()})};
window.modelApp.floorPickPoint=floorPickPoint;
window.modelApp.architecturePickPoint=()=>{const r=host.getBoundingClientRect(),p=new THREE.Vector3(0,28,16).project(camera);return{x:r.left+(p.x*.5+.5)*r.width,y:r.top+(-p.y*.5+.5)*r.height};};
window.modelApp.getArchitectureState=()=>({campusVisible:exterior.visible,libraryOnlyVisible:libraryExterior.visible,companionCount:exterior.children.filter(x=>x.name==='five_floor_companion_context').length,libraryPosition:exteriorDetails.rearLibrary.position.toArray(),rearLouvers:libraryExterior.children.filter(x=>x.name==='rear_horizontal_louver').length,reference:'2025-09-01',floorZones:FLOOR_INFO.map(f=>({n:f.n,verified:f.verified,zones:f.zones}))});
