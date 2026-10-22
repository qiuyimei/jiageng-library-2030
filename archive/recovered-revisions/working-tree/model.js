import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {buildExterior,buildLibraryFloors,FLOOR_INFO} from './architecture.js';
import {buildLibraryEnvironment} from './library-environment.js';
import {makeData,RESOURCES} from './data.js';
import {classify,STATE,recommend,summarize} from './engine.js';
import {seatPosition,nodePosition,readableNode,seatLabel,acceptSnapshot,floorBounds,upperFacilities,GROUND_LAYOUT} from './spatial.js';
import {buildSeatLayer} from './space-layer.js';
import {createHelpers} from './model-helpers.js';
import {displayZone,floorRackRecords} from './library-layout.js';
import {PHOTO_REFERENCES} from './photo-reference.js';
import {walkEntry,walkStairEntry,walkUpEntry,advanceWalk,EYE_HEIGHT,collectWalkObstacles} from './walk.js';
import {createWalkSurroundings} from './walk-surroundings.js';
import {createSceneLighting,LIGHT_PRESETS} from './lighting.js';
import {MODEL_TOUR_STOPS,nextTourStop,usesPointPicking} from './model-tour.js';
const $=id=>document.getElementById(id);
let data=makeData(Date.now()),selected=null,floor=0,expanded=false,view='campus',plan=null,linked=false;
let generated=true;
let showInformation=false;
let walking=false;
let prefs={resource:'software',power:true,print:true,window:false,quiet:true,accessible:false,floor:0,priority:'books'};
const knownIds=data.seats.map(s=>s.id);let updateScene=()=>{},setView=()=>{};
let sourceFloor=null,sourceSelected=null;
function photoPanel(ref){
 $('modelOptions').open=true;$('photoPanel').hidden=false;$('photoImage').src=ref.src;$('photoImage').alt=ref.label;
 $('photoCaption').textContent=`参考照片 R${String(ref.photo).padStart(2,'0')} · ${ref.description}`;
 $('photoDetail').value=ref.id;
}
let showPhotoDetail=id=>{const ref=PHOTO_REFERENCES.find(r=>r.id===id);if(!ref)return;photoPanel(ref);floor=ref.floor;setView(ref.view);textPanel();};
for(const ref of PHOTO_REFERENCES){const option=document.createElement('option');option.value=ref.id;option.textContent=ref.label;$('photoDetail').append(option);}
$('photoDetail').onchange=()=>showPhotoDetail($('photoDetail').value);
function compute(active=true){
 generated=active;
 // 三维页调用同一个规则引擎，颜色和候选没有独立的随机数据来源。
 plan=active?recommend(data.seats,prefs,data.graph,RESOURCES,Date.now()):{items:[],warnings:['需求已改变，请在主页面重新生成候选。'],source:RESOURCES.find(r=>r.id===prefs.resource)};
 plan.prefs=prefs;if(!selected&&plan.items.length)selected=plan.items[0].seat.id;
}
function textPanel(){
 const info=FLOOR_INFO.find(f=>f.n===floor),s=data.seats.find(s=>s.id===selected),item=plan.items.find(i=>i.seat.id===selected);
 $('floorTitle').textContent=view==='campus'?'主一至主五 · 项目所在场所':view==='rear'?'主三背面 · 图书馆入口与湖畔':info?`${floor}F · ${info.title}`:'五层空间总览';
 $('floorSummary').textContent=walking?'第一人称：WASD或方向键移动，拖动画面转头；可沿普通梯上下楼，点击1F—5F可直接定位。“定位下楼口”可转向本层普通梯。只移动视野，不生成或修改预约。':['cut','top'].includes(view)?(floor===3?'三楼从前向后是金球、白色陶瓷、木雕和纵向书桌，最后是书架；上下两段梯之间的平台可横向进入两侧座位区。':floor===1?'一楼左侧窗边阅览，右侧为固定专座；电脑台后与左侧为密集书库，打印机排已后移。左侧与台后密集书库均保留。前厅左右两区各两张沙发朝馆内，中间各有一个沿地砖线纵向书架，厕所门朝阅览桌。电梯在专座后方略靠左，黑色门面朝右侧通道。':floor===2?'弧形展陈小退台只在二楼通往三楼这一段出现，两旁是黑灰色无栏杆直梯。':floor===4||floor===5?'三至五楼使用带白色侧板的两侧普通楼梯，四楼平台连接两段。':'二至三楼为弧形退台；三至五楼为两侧普通梯；三楼中央是展厅。')+(floor>=2?' 右侧墙边中段是白墙围合的交通区：电梯门前留走廊，另一侧有折返楼梯，各层井道与门面保持对齐。':'')+' 彩色圆点对应演示椅位，金色折线为本次任务路线。':'点击主三查看图书馆背面，再点击馆舍进入选座空间。';
 $('floorText').textContent=info?((floor===3?'普通阅览桌形态参考现场照片；实际118座仅有照片线索，尚未建立编号坐标映射。 ':floor===5?'备考桌型参考2026年馆方通知：每桌4人，设十字挡板、电源与照明。 ':''))+info.zones.map(z=>z.label).join(' · '):'可逐层比较候选，再查看本次学习任务的取书与设施位置。';
 $('stateCounts').textContent=summarize(data.seats,Date.now()).map(r=>`${r.floor}F ${r.candidate}个候选`).join('　');
 $('selectionTitle').textContent=s?`${seatLabel(s,true)} · ${STATE[classify(s,Date.now()).kind].label}`:'请选择一个位置';
 $('selectionReason').textContent=s?classify(s,Date.now()).reason:'颜色、编号与主页面一致；可使用右侧候选按钮或点击模型圆点。';
 $('choiceReason').textContent=item?[...item.reasons,...item.tradeoffs.map(t=>'取舍：'+t)].join('；'):plan.warnings.join('；');
 $('taskRoute').textContent=item?'路线：'+item.trip.path.map(readableNode).join(' → '):'该位置不是当前推荐候选，不显示任务路线。';
 $('recordTimes').textContent=s?`观测时间 ${new Date(s.obsAt).toLocaleTimeString()}；规则时间 ${new Date(s.rulesAt).toLocaleTimeString()}。点击查看不更新数据时间。`:'';
 $('modelCandidates').replaceChildren();
 for(const i of plan.items){const b=document.createElement('button');b.textContent=seatLabel(i.seat,true);b.onclick=()=>choose(i.seat.id);$('modelCandidates').append(b);}
 $('modeText').textContent=linked?'与主页面实时同步本次模拟会话；修改需求请使用主页面表单。':'独立体验：选择资料、插座和打印需求，再点击生成候选。';
 $('localControls').hidden=linked;
 document.querySelectorAll('[data-floor]').forEach(b=>{const active=Number(b.dataset.floor)===floor&&['cut','top'].includes(view);b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 for(const id of ['campus','rear','cut','top'])$(id).classList.toggle('active',view===id);
 $('expand').disabled=!!floor||!['cut','top'].includes(view);
}
function choose(id){
 const s=data.seats.find(s=>s.id===id);if(!s)return;selected=id;floor=s.floor;showInformation=true;$('informationLayer').checked=true;setView(view==='top'?'top':'cut');textPanel();updateScene();
 if(linked)window.parent.postMessage({type:'zhizuo-select',id},'*');
}
// 文件页面的origin通常是null，因此同时验证发送窗口和有限数据结构，不能只看字符串origin。
window.addEventListener('message',event=>{
 if(event.source!==window.parent||event.data?.type!=='zhizuo-state')return;
 const snapshot=acceptSnapshot(event.data,knownIds);if(!snapshot)return;
 linked=true;data.seats=snapshot.seats;prefs={...prefs,...snapshot.prefs};selected=snapshot.selected;
 showInformation=true;$('informationLayer').checked=true;
 // 只在父页面确实换了楼层/椅位时定位；定时状态同步不打断读者自行观察其他楼层。
 const changed=sourceFloor!==snapshot.floor||sourceSelected!==snapshot.selected;
 sourceFloor=snapshot.floor;sourceSelected=snapshot.selected;if(changed&&!walking)floor=snapshot.floor;
 compute(event.data.generated!==false);if(changed&&!walking)setView(view==='top'?'top':'cut');textPanel();updateScene();
});
for(const r of RESOURCES){const o=document.createElement('option');o.value=r.id;o.textContent=r.title;$('modelResource').append(o);}
$('modelResource').value='software';
$('localGenerate').onclick=()=>{prefs.resource=$('modelResource').value;prefs.power=$('modelPower').checked;prefs.print=$('modelPrint').checked;selected=null;compute();if(selected)floor=data.seats.find(s=>s.id===selected).floor;setView('cut');textPanel();updateScene();};
compute();
function initModel(){
 const host=$('viewport'),scene=new THREE.Scene();scene.background=new THREE.Color('#e9e7df');
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;host.prepend(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(38,1,.06,600),controls=new OrbitControls(camera,renderer.domElement);
 // 允许在中庭从低处仰看采光顶；近景可缩放到桌椅细节，不强制保持俯视。
 controls.enableDamping=true;controls.minPolarAngle=.05;controls.maxPolarAngle=Math.PI*.88;controls.minDistance=2.5;controls.maxDistance=360;
 const lighting=createSceneLighting(scene,renderer);
 const H=createHelpers(),{group}=H;
 const walkScenery=createWalkSurroundings(scene,H),overviewBackground=scene.background.clone();
 const campus=group(scene,'campus');const details=buildExterior(campus,H);buildLibraryEnvironment(details.rearLibrary,H);
 const rear=details.rearLibrary.clone(true);rear.position.z=0;scene.add(rear);
 const floorsRoot=group(scene,'library_cutaway'),floors=buildLibraryFloors(floorsRoot,H),overlay=group(scene,'zhizuo_information');
 const shapeSeatLabels=floors.storeys.flatMap(f=>f.furniture.children.filter(o=>o.userData.layoutRole==='chair'&&!o.userData.seatId).map(o=>({floor:f.info.n,x:o.position.x,z:o.position.z,text:o.userData.displayName+(o.userData.dedicated?' · 专座':'' )})));
 // 不透明实体投射并接收阴影。玻璃和细小叶片不投影，以免玻璃被错误地画成实墙。
 scene.traverse(o=>{if(o.isMesh){o.castShadow=!o.material.transparent&&!/leaf|stem|spines|flute/.test(o.name);o.receiveShadow=!o.material.transparent;}});
 let showFurniture=true,labelOn=true,showRoof=false,showCeiling=false,dirty=true,layer=null;
 let overviewDistance=1;
 const pointPicking=()=>usesPointPicking({view,linked,walking,distance:camera.position.distanceTo(controls.target),overviewDistance});
 function refreshTourHint(){
  const next=nextTourStop({view,floor,expanded}),inspect=pointPicking();
  $('tourHint').hidden=walking;
  const hint=inspect?'点选区域聚焦 · 拖动旋转 · 滚轮缩放':next?'单击继续 → '+next.title:'已到五楼 · 放大后可点选具体位置';
  if($('tourHint').textContent!==hint)$('tourHint').textContent=hint;
  $('tourNext').disabled=walking;
  const caption=inspect?'返回本步全景':next?'下一步：'+next.title:'回到校园楼群';if($('tourNext').textContent!==caption)$('tourNext').textContent=caption;
 }
 function advanceTour(){
  const next=nextTourStop({view,floor,expanded});if(!next)return false;
  floor=next.floor;expanded=next.expanded;$('expand').checked=expanded;
  if(next.view==='cut')enterSeatView();setView(next.view);
  $('viewStatus').textContent=next.title+'。总览单击继续；放大后点选具体位置。';return true;
 }
 const labels=Array.from({length:90},()=>{const e=document.createElement('div');e.className='label';$('labels').append(e);return e;});
 const height=n=>(n-1)*(expanded?9:floors.height);
 function disposeOverlay(){
   // 观测同步后重建图层；释放专属于标记的几何体，保留重复使用的材质。
   overlay.traverse(o=>{if(o.geometry&&!o.geometry.userData.sharedGeometry)o.geometry.dispose();});overlay.clear();
 }
 updateScene=()=>{
   const b=floorBounds(floor||3),indoor=['cut','top'].includes(view);
   lighting.focus(floor?height(floor)+1:12,indoor?Math.max(42,(b.front-b.back)/2+10):view==='campus'?150:75,indoor?(b.front+b.back)/2:0);
   dirty=true;renderer.shadowMap.needsUpdate=true;walkScenery.visible=walking;campus.visible=view==='campus';rear.visible=view==='rear';floorsRoot.visible=['cut','top'].includes(view);overlay.visible=floorsRoot.visible&&showInformation;
   for(const f of floors.storeys){f.root.visible=walking?Math.abs(f.info.n-floor)<=1:!floor||f.info.n===floor;f.root.position.y=height(f.info.n);f.furniture.visible=showFurniture;
     f.ceiling.visible=showFurniture&&showCeiling&&view!=='top';
     for(const m of f.structural.children)if(m.name.includes('beam'))m.visible=view!=='top'&&!showFurniture;
   }
   floors.skylight.visible=showRoof&&showFurniture&&view==='cut'&&!expanded&&(walking||!floor||floor===5);
   disposeOverlay();layer=buildSeatLayer(overlay,H,data.seats,Date.now(),plan,selected,expanded);
   for(const m of layer.markers)m.visible=!floor||m.userData.floor===floor;
   for(const g of layer.resources.children)g.visible=!floor||g.userData.floor===floor;
   for(const line of layer.route.children)line.visible=!floor||line.userData.floors.every(f=>f===floor);
   textPanel();
 };
 setView=v=>{
   const requestedFloor=floor;if(walking)stopWalk(false);floor=requestedFloor;
   view=v;updateScene();const y=floor?height(floor):expanded?18:9;
   if(v==='campus'){camera.position.set(0,82,280);controls.target.set(0,16,-28);}
   else if(v==='rear'){camera.position.set(78,58,-125);controls.target.set(0,8,-26);}
   else if(v==='top'){const b=floorBounds(floor||3),x=(b.left+b.right)/2,z=(b.back+b.front)/2,dist=Math.max((b.right-b.left)/Math.max(.6,camera.aspect),b.front-b.back)/(2*Math.tan(camera.fov*Math.PI/360))*1.12;camera.position.set(x,y+dist,z+.001);controls.target.set(x,y,z);}
   else{const b=floorBounds(floor||3),x=(b.left+b.right)/2,depth=b.front-b.back;camera.position.set(floor===1?80:x+depth*.68,y+(expanded&&!floor?90:floor===1?52:depth*.55),floor===1?104:(b.front+b.back)/2+depth*.88);controls.target.set(x,y+1,floor===1?6:(b.front+b.back)/2);}
   controls.update();overviewDistance=camera.position.distanceTo(controls.target);refreshTourHint();dirty=true;
 };
 function enterSeatView(){showInformation=linked;labelOn=true;showRoof=false;showCeiling=false;$('informationLayer').checked=linked;$('labelToggle').checked=true;$('roofDetails').checked=false;$('ceilingDetails').checked=false;}
 // 建筑页点选只改变相机；只有从选座页接入的会话才会修改已知模拟椅位选择。
 const focusHistory=[];let wideExpanded=false;
 function focusPoint(point,n){
  if(!point||!Number.isFinite(point.x+point.y+point.z)||!Number.isInteger(n)||n<1||n>5)return false;
  if(walking)stopWalk();
  focusHistory.push({eye:camera.position.clone(),target:controls.target.clone(),floor,view,expanded,overviewDistance});if(focusHistory.length>12)focusHistory.shift();
  const localY=point.y-height(n),b=floorBounds(n),top=view==='top';
  floor=n;expanded=false;$('expand').checked=false;setView(top?'top':'cut');
  const target=new THREE.Vector3(Math.max(b.left+.5,Math.min(b.right-.5,point.x)),height(n)+Math.max(.8,Math.min(3,localY+.35)),Math.max(b.back+.5,Math.min(b.front-.5,point.z)));
  controls.target.copy(target);camera.position.copy(target).add(top?new THREE.Vector3(0,22,.001):new THREE.Vector3(10,10,13));controls.update();lighting.focus(height(n)+1,26,target.z);dirty=true;
  $('focusBack').disabled=false;$('wideBack').disabled=false;$('viewStatus').textContent=`已聚焦${n}F所点区域；可继续拖动查看，或返回上一视角。`;return true;
 }
 function previousFocus(){const p=focusHistory.pop();if(!p)return;floor=p.floor;expanded=p.expanded;$('expand').checked=expanded;setView(p.view);camera.position.copy(p.eye);controls.target.copy(p.target);overviewDistance=p.overviewDistance;controls.update();refreshTourHint();dirty=true;$('focusBack').disabled=!focusHistory.length;$('wideBack').disabled=!focusHistory.length;}
 function setWide(on){wideExpanded=on;document.body.classList.toggle('model-wide',on);$('wideTools').hidden=!on;$('wideView').textContent=on?'收起画面':'展开画面';resize();}
 $('focusBack').onclick=previousFocus;$('wideBack').onclick=previousFocus;
 $('wideView').onclick=()=>setWide(!wideExpanded);$('wideExit').onclick=()=>setWide(false);
 window.addEventListener('keydown',e=>{if(e.code==='Escape'&&wideExpanded&&!walking)setWide(false);});
 $('tourNext').onclick=()=>{
  if(pointPicking()){if(view==='top'){floor=0;expanded=true;$('expand').checked=true;setView('cut');}else setView(view);return;}
  if(!advanceTour()){floor=0;expanded=false;$('expand').checked=false;setView('campus');}
 };
 for(const id of ['campus','rear','cut','top'])$(id).onclick=()=>{if(['cut','top'].includes(id))enterSeatView();if(id==='cut'){floor=0;expanded=true;}if(id==='campus'||id==='rear'){floor=0;expanded=false;}if(id==='top'&&!floor)floor=4;$('expand').checked=expanded;setView(id);};
 document.querySelectorAll('[data-floor]').forEach(b=>b.onclick=()=>{if(walking){placeWalker(Number(b.dataset.floor)||3);return;}enterSeatView();floor=Number(b.dataset.floor);expanded=!floor;$('expand').checked=expanded;setView(view==='top'?'top':'cut');});
 function showFacility(kind){
  enterSeatView();expanded=false;showFurniture=true;showInformation=false;labelOn=true;showRoof=false;showCeiling=false;
  floor=kind==='culture'?4:kind==='periodicals'?5:1;$('photoPanel').hidden=true;$('expand').checked=false;$('furniture').checked=true;$('informationLayer').checked=false;
  setView('cut');const y=height(floor),p=kind==='culture'?upperFacilities(4).culture:kind==='cafe'?GROUND_LAYOUT.cafe:kind==='entrance'?{x:0,z:6}:{x:-27,z:2};
  if(kind==='entrance'){camera.position.set(0,50,106);controls.target.set(0,1,6);}
  else{camera.position.set(p.x+18,y+17,p.z+26);controls.target.set(p.x,y+1,p.z);}controls.update();dirty=true;
  $('viewStatus').textContent=kind==='culture'?'四楼东南侧中日文化交流中心。家具及门位为示意。':kind==='cafe'?'右侧从入口向里依次为107研讨室、长条咖啡厅、106工作人员室及电梯交通区；陈设与尺寸示意，不纳入选座监测。':kind==='entrance'?'前台中轴左右等宽，左右后沿基本齐平，左侧书桌与密集书库、右侧专座与咖啡厅均向后延伸。107在右前，106在咖啡厅之后，后部交通区横跨专座后方至右墙，电梯在专座端、楼梯在右墙端，门前两端可通行。':'五楼补齐桌椅外形，同时保留报纸、现刊、过刊与外文书架、后墙存包柜、厕所及交通净空；新增家具不扩大60个模拟样本。';
 }
 $('cultureView').onclick=()=>showFacility('culture');$('periodicalsView').onclick=()=>showFacility('periodicals');
 $('cafeView').onclick=()=>showFacility('cafe');$('entranceView').onclick=()=>showFacility('entrance');
 $('expand').onchange=()=>{expanded=$('expand').checked;setView(view);};$('furniture').onchange=()=>{showFurniture=$('furniture').checked;updateScene();};
 $('roofDetails').onchange=()=>{showRoof=$('roofDetails').checked;updateScene();};$('ceilingDetails').onchange=()=>{showCeiling=$('ceilingDetails').checked;updateScene();};
 $('informationLayer').onchange=()=>{showInformation=$('informationLayer').checked;updateScene();};
 $('labelToggle').onchange=()=>{labelOn=$('labelToggle').checked;dirty=true;};$('resetView').onclick=()=>walking?placeWalker(floor):setView(view);
 // 展示预设也写回滑块，避免界面数值与实际灯光不一致。
 const lightIds={azimuth:'lightAzimuth',elevation:'lightElevation',sun:'lightSun',ambient:'lightAmbient',exposure:'lightExposure'};
 function applyLight(){const raw={shadows:$('lightShadows').checked};for(const [key,id]of Object.entries(lightIds)){raw[key]=Number($(id).value);$(id+'Value').textContent=$(id).value+(key==='azimuth'||key==='elevation'?'°':'');}lighting.apply(raw);dirty=true;}
 function lightPreset(name){for(const [key,id]of Object.entries(lightIds))$(id).value=LIGHT_PRESETS[name][key];$('lightPreset').value=name;applyLight();}
 for(const id of Object.values(lightIds))$(id).oninput=applyLight;
 $('lightShadows').onchange=applyLight;$('lightPreset').onchange=()=>lightPreset($('lightPreset').value);
 $('lightReset').onclick=()=>{$('lightShadows').checked=true;lightPreset('daylight');};lightPreset('daylight');
 $('snapshot').onclick=()=>{renderer.render(scene,camera);renderer.domElement.toBlob(blob=>{if(!blob)return;const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=`嘉庚知座_${view}_${floor||'五层'}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('viewStatus').textContent='已保存三维图层；右侧解释和DOM标签不包含在画布截图内。';});};
 let walker=walkEntry(3),yaw=0,pitch=0,lookDrag=null,savedView=null;
 const held=new Set(),obstacles=[];
 // 包围盒取自已经生成的实体家具；不再手写一份与模型位置可能不同的碰撞地图。
 floorsRoot.updateMatrixWorld(true);
 obstacles.push(...collectWalkObstacles(floorsRoot,THREE.Box3));
 function walkCamera(){camera.position.set(walker.x,walker.y+EYE_HEIGHT,walker.z);camera.rotation.set(pitch,yaw,0,'YXZ');dirty=true;}
 function placeWalker(n){walker=walkEntry(n);floor=n;yaw=0;pitch=0;held.clear();walkCamera();updateScene();renderer.domElement.focus();$('walkStatus').textContent=`${n}F · 拖动转头，WASD / 方向键移动，Esc退出`;$('viewStatus').textContent='第一人称视野；空间、通道和跨层交通均为照片参考示意。';}
 function startWalk(){
  savedView={view,floor,expanded,showFurniture,labelOn,showRoof,showCeiling,showInformation,eye:camera.position.clone(),target:controls.target.clone()};
  walking=true;view='cut';expanded=false;showFurniture=true;labelOn=false;showRoof=true;showCeiling=true;showInformation=false;
  scene.background.set('#c2d5dd');
  controls.enabled=false;camera.fov=68;camera.updateProjectionMatrix();
  $('expand').checked=false;$('furniture').checked=true;$('labelToggle').checked=false;$('roofDetails').checked=true;$('ceilingDetails').checked=true;$('informationLayer').checked=false;
  $('furniture').disabled=true;
  $('walkToggle').textContent='退出自己走';$('walkToggle').classList.toggle('active',true);$('walkToggle').setAttribute('aria-pressed','true');$('walkPad').hidden=false;
  placeWalker(floor||3);renderer.domElement.focus();
 }
 function stopWalk(restore=true){
  if(!walking)return;walking=false;scene.background.copy(overviewBackground);held.clear();lookDrag=null;controls.enabled=true;camera.fov=38;camera.updateProjectionMatrix();
  $('walkToggle').textContent='自己走 · 第一人称';$('walkToggle').classList.toggle('active',false);$('walkToggle').setAttribute('aria-pressed','false');$('walkPad').hidden=true;
  $('furniture').disabled=false;
  if(savedView){({view,floor,expanded,showFurniture,labelOn,showRoof,showCeiling,showInformation}=savedView);camera.position.copy(savedView.eye);controls.target.copy(savedView.target);controls.update();}
  $('expand').checked=expanded;$('furniture').checked=showFurniture;$('labelToggle').checked=labelOn;$('roofDetails').checked=showRoof;$('ceilingDetails').checked=showCeiling;$('informationLayer').checked=showInformation;
  if(restore)updateScene();dirty=true;$('viewStatus').textContent='已退出第一人称，恢复进入前的观察视角。';
 }
 $('walkToggle').onclick=()=>walking?stopWalk():startWalk();
 $('walkStair').onclick=()=>{
  const p=walkStairEntry(floor);if(!p){$('walkStatus').textContent='一楼已是本馆最下层。';return;}
  walker=p;yaw=Math.PI;pitch=-.10;held.clear();walkCamera();
  $('walkStatus').textContent=`${floor}F 下楼口 · 按W/前进沿普通梯下到${floor-1}F；拖动可转向旁边座位区`;
  renderer.domElement.focus();
 };
 $('walkUp').onclick=()=>{
  const p=walkUpEntry(floor);if(!p){$('walkStatus').textContent='五楼已是本馆最上层。';return;}
  walker=p;yaw=0;pitch=.08;held.clear();walkCamera();
  $('walkStatus').textContent=`${floor}F 上楼口 · 按W/前进沿普通梯走到${floor+1}F`;renderer.domElement.focus();
 };
 $('walkExit').onclick=()=>stopWalk();renderer.domElement.tabIndex=0;
 renderer.domElement.style.touchAction='none';
 const keyMove={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
 window.addEventListener('keydown',e=>{
  if(!walking)return;
  if(e.code==='Escape'){e.preventDefault();stopWalk();return;}
  if(/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target?.tagName||''))return;
  if(keyMove[e.code]){e.preventDefault();held.add(keyMove[e.code]);}
 });
 window.addEventListener('keyup',e=>{if(keyMove[e.code])held.delete(keyMove[e.code]);});
 window.addEventListener('blur',()=>{held.clear();lookDrag=null;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){held.clear();lookDrag=null;}});
 document.querySelectorAll('[data-walk]').forEach(b=>{
  b.addEventListener('pointerdown',e=>{if(!walking)return;e.preventDefault();b.setPointerCapture(e.pointerId);held.add(b.dataset.walk);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>held.delete(b.dataset.walk));
 });
 renderer.domElement.addEventListener('pointerdown',e=>{if(!walking)return;lookDrag={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);renderer.domElement.focus();});
 renderer.domElement.addEventListener('pointermove',e=>{if(!walking||!lookDrag)return;yaw-=(e.clientX-lookDrag.x)*.004;pitch=Math.max(-1.25,Math.min(1.25,pitch-(e.clientY-lookDrag.y)*.004));lookDrag={x:e.clientX,y:e.clientY};walkCamera();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,()=>lookDrag=null);
 function tickWalk(dt){
  if(!walking)return;let forward=Number(held.has('forward'))-Number(held.has('back')),side=Number(held.has('right'))-Number(held.has('left'));
  const norm=Math.hypot(forward,side);if(!norm)return;forward/=norm;side/=norm;
  const speed=2.6*dt,dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed;
  const previousFloor=floor;walker=advanceWalk(walker,dx,dz,obstacles);floor=walker.floor;if(floor!==previousFloor)updateScene();walkCamera();
  $('walkStatus').textContent=`${floor}F${walker.onStairs?' · 楼梯上':''} · 拖动转头，WASD / 方向键移动，Esc退出`;
 }
 const raycaster=new THREE.Raycaster();let start=null;
 renderer.domElement.addEventListener('pointerdown',e=>start=e.button===undefined||e.button===0?{x:e.clientX,y:e.clientY,moved:false}:null);
 renderer.domElement.addEventListener('pointermove',e=>{if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)start.moved=true;});
 renderer.domElement.addEventListener('pointercancel',()=>start=null);
 renderer.domElement.addEventListener('pointerup',e=>{
   if(walking)return;
   const down=start;start=null;if(!down||down.moved||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;
   if(!pointPicking()){if(!advanceTour())$('viewStatus').textContent='已到五楼。滚轮放大后可点选位置，或从按钮返回校园楼群。';return;}
   const rect=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);
   if(['cut','top'].includes(view)){
     scene.updateMatrixWorld(true);camera.updateMatrixWorld();
     const pickables=[];floorsRoot.traverseVisible(o=>{if(o.isMesh&&o.name!=='guide_function_tint')pickables.push(o);});
     const hit=raycaster.intersectObjects(pickables,false)[0];
     const marker=showInformation?raycaster.intersectObjects(layer.markers.filter(m=>m.visible),true)[0]:null;
     if(linked&&marker&&(!hit||marker.distance<=hit.distance+1)){choose(marker.object.userData.seatId);const s=data.seats.find(s=>s.id===selected);focusPoint(seatPosition(s,expanded),s.floor);return;}
     if(hit){let p=hit.object;while(p&&!p.userData.floor)p=p.parent;const n=Number(p?.userData.floor);if(n)focusPoint(hit.point,n);return;}
   }
   // 建筑外观放大后，点选只拉近所点建筑，不能误触发下一步。
   if(view==='campus'||view==='rear'){
    const hit=raycaster.intersectObject(view==='campus'?campus:rear,true)[0];if(hit){const before=camera.position.clone().sub(controls.target),distance=before.length();controls.target.copy(hit.point);camera.position.copy(hit.point).add(before.normalize().multiplyScalar(Math.max(8,Math.min(55,distance*.6))));controls.update();dirty=true;}
   }
 });
 renderer.domElement.addEventListener('wheel',()=>{dirty=true;refreshTourHint();});
 function resize(){renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();dirty=true;}
 new ResizeObserver(resize).observe(host);resize();setView('campus');
 // 按照片直接定位近景；内部相机高度随楼层改变，避免观察三楼时仍停在一楼。
 showPhotoDetail=id=>{
  const ref=PHOTO_REFERENCES.find(r=>r.id===id);if(!ref)return;
  if(walking)stopWalk();
  floor=ref.floor;expanded=false;showFurniture=true;labelOn=false;showRoof=ref.roof;showCeiling=ref.ceiling;
  showInformation=['reading','shelves'].includes(ref.id);$('informationLayer').checked=showInformation;
  $('expand').checked=false;$('furniture').checked=true;$('labelToggle').checked=false;$('roofDetails').checked=showRoof;$('ceilingDetails').checked=showCeiling;
  setView(ref.view);const y=ref.view==='cut'&&floor?height(floor):0;
  camera.position.set(ref.eye[0],ref.eye[1]+y,ref.eye[2]);controls.target.set(ref.target[0],ref.target[1]+y,ref.target[2]);controls.update();dirty=true;
  photoPanel(ref);$('viewStatus').textContent=ref.description+' 位置与尺寸为照片参考示意。';
 };
 const initialDetail=window.location?.hash?.match(/^#detail=([a-z]+)$/)?.[1];if(initialDetail)showPhotoDetail(initialDetail);
 const initialFloor=window.location?.hash?.match(/^#floor=([1-5])$/)?.[1];if(initialFloor){floor=Number(initialFloor);setView('cut');}
 // 新分层座位页只传模型位置进行定位，不把自主登记伪装成原60样本的传感观测。
 const initialLocation=window.location?.hash?.match(/^#loc=([1-5]),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
 if(initialLocation){const n=Number(initialLocation[1]),x=Number(initialLocation[2]),z=Number(initialLocation[3]),b=floorBounds(n);if(x>=b.left&&x<=b.right&&z>=b.back&&z<=b.front){floor=n;showInformation=false;setView('cut');focusPoint(new THREE.Vector3(x,height(n)+.2,z),n);}}
 const initialFacility=window.location?.hash?.match(/^#facility=(entrance|cafe|culture|periodicals)$/)?.[1];if(initialFacility)showFacility(initialFacility);
 let lastFrame=performance.now();
 function animate(){
   const nowFrame=performance.now(),dt=Math.min(.05,Math.max(0,(nowFrame-lastFrame)/1000));lastFrame=nowFrame;tickWalk(dt);
   const moved=walking?false:controls.update();refreshTourHint();if(moved||dirty){renderer.render(scene,camera);dirty=false;}
   const entries=[];
   if(['cut','top'].includes(view)&&labelOn){
     for(const s of data.seats.filter(s=>floor&&s.floor===floor)){
       const p=seatPosition(s,expanded);entries.push({text:seatLabel(s)+(showInformation&&plan.items.find(i=>i.seat.id===s.id)?.rank?' · 第'+plan.items.find(i=>i.seat.id===s.id).rank+'优先':'')+(showInformation&&s.id===selected?' · 已选':''),p:new THREE.Vector3(p.x,p.y+.55,p.z),color:showInformation?STATE[classify(s,Date.now()).kind].color:'#637866'});
     }
     for(const g of layer.resources.children)if(showInformation&&g.visible){const p=nodePosition(g.userData.node,data.seats,expanded);entries.push({text:readableNode(g.userData.node),p:new THREE.Vector3(p.x,p.y+1.8,p.z),color:'#3c87aa'});}
     if(floor){
       const b=floorBounds(floor);for(const [text,x,z] of [['北区',-28,0],['南区',28,0],...(floor>1?[['东区',0,b.back+12]]:[])])entries.push({text,p:new THREE.Vector3(x,height(floor)+2,z),color:'#52796b'});
       // 外形座位没有占用数据；靠近后只显示方向编号，不伪装成新增监测座位。
       const near=shapeSeatLabels.filter(s=>s.floor===floor).map(s=>({...s,p:new THREE.Vector3(s.x,height(floor)+1.05,s.z)})).filter(s=>s.p.distanceTo(camera.position)<28).sort((a,b)=>a.p.distanceTo(camera.position)-b.p.distanceTo(camera.position)).slice(0,36);
       for(const s of near)entries.push({text:s.text,p:s.p,color:'#637866'});
     }
     if(!floor)for(let n=1;n<=5;n++)entries.push({text:n+'F',p:new THREE.Vector3(0,height(n)+2,22),color:'#637866'});
     if(floor&&showFurniture){const shelves=floorRackRecords(floor).filter(r=>r.label).map(r=>({...r,p:new THREE.Vector3(r.x,height(floor)+2.5,r.z)})).filter(r=>r.p.distanceTo(camera.position)<65).sort((a,b)=>a.p.distanceTo(camera.position)-b.p.distanceTo(camera.position)).slice(0,14);for(const r of shelves)entries.push({text:r.label,p:r.p,color:'#637866'});}
     if(floor>1&&showFurniture){const f=upperFacilities(floor);for(const r of [...f.toilets.map(t=>({...t,label:'洗手间'})),...f.rooms,...(f.culture?[f.culture]:[]),...(f.lockers?[{...f.lockers,label:'后墙存包柜'}]:[])])entries.push({text:r.label,p:new THREE.Vector3(r.x,height(floor)+3,r.z),color:'#637866'});}
   }
   labels.forEach((el,i)=>{const row=entries[i];if(!row){el.style.display='none';return;}const p=row.p.project(camera);el.textContent=row.text;el.style.borderColor=row.color;el.style.fontSize='10px';el.style.transform='translate(-50%,-50%)';el.style.left=(p.x*.5+.5)*host.clientWidth+'px';el.style.top=(-p.y*.5+.5)*host.clientHeight+'px';el.style.display=Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z<1?'block':'none';});
   requestAnimationFrame(animate);
 }requestAnimationFrame(animate);
 window.zhizuoModel={choose,setView,startWalk,stopWalk,focusPoint,previousFocus,getState:()=>({view,floor,selected,candidates:plan.items.map(i=>i.seat.id),markers:layer.markers.length,expanded,walking,wideExpanded,showInformation,labelOn,pointPicking:pointPicking(),focusTarget:controls.target.toArray()})};
}
try{initModel();}catch(error){
 console.warn('三维初始化失败',error);
 document.body.classList.add('no3d');$('modelError').textContent='本机三维渲染暂不可用；请点击右上角“打开智能选座”使用独立平面座位图。';$('viewStatus').textContent=$('modelError').textContent;$('snapshot').disabled=true;
 for(const id of ['walkToggle','lightPreset','lightAzimuth','lightElevation','lightSun','lightAmbient','lightExposure','lightShadows','lightReset'])$(id).disabled=true;
 setView=v=>{view=v;textPanel();};for(const id of ['campus','rear','cut','top'])$(id).onclick=()=>setView(id);document.querySelectorAll('[data-floor]').forEach(b=>b.onclick=()=>{floor=Number(b.dataset.floor);textPanel();});textPanel();
}
if(window.parent!==window)window.parent.postMessage({type:'zhizuo-ready'},'*');
setInterval(()=>{compute(generated);textPanel();updateScene();},5000);
