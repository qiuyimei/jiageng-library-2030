/* 中文学习注释副本  原始项目请见01目录
渲染、辅助几何、旧概念组、新场景组、相机、状态、按钮、拾取、导出、标签、帧循环与调试接口的入口。
*/
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {buildExterior,buildLibraryFloors,FLOOR_INFO} from './architecture.js';
import {buildLibraryEnvironment} from './library-environment.js';
import {buildFloorPilots,PILOT_INFO} from './floor-pilots.js';
const $=id=>document.getElementById(id),host=$('viewport');
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9e7df');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});}catch(e){$('fallback').style.display='flex';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.prepend(renderer.domElement);
const camera=new THREE.PerspectiveCamera(38,1,.1,600);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.maxPolarAngle=Math.PI*.47;controls.minDistance=20;controls.maxDistance=360;
scene.add(new THREE.HemisphereLight('#fbf8ee','#abb9ac',2.4));const sun=new THREE.DirectionalLight('#fff5df',3);sun.position.set(-18,40,24);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-80,right:80,top:80,bottom:-80,near:1,far:160});sun.shadow.bias=-.0002;scene.add(sun);
const mats={};
/* material
职责：复用相同材质
输入：color和opts对象
结果：按字符串组合键返回或创建MeshStandardMaterial
注意：共享材质修改会影响所有引用；缓存键依赖选项序列化。 */
function material(color,opts={}){const k=color+JSON.stringify(opts);return mats[k]??=new THREE.MeshStandardMaterial({color,roughness:.78,...opts});}

/* box
职责：长方体几何辅助
输入：parent 名称 尺寸 位置 色与选项
结果：创建Mesh、设置阴影、加入父组并返回
注意：中心坐标不是左上角；正尺寸与净空由调用方保证。 */
function box(parent,name,w,h,d,x,y,z,color,opts={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color,opts));m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}

/* cylinder
职责：圆柱或截锥辅助
输入：半径 高度 坐标 色 顶部半径
结果：12段圆柱体Mesh加入父节点
注意：低面数为显示效率，不能据此估计真实圆构件。 */
function cylinder(parent,name,r,h,x,y,z,color,rTop=r){const m=new THREE.Mesh(new THREE.CylinderGeometry(rTop,r,h,12),material(color));m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}

/* sphere
职责：球形展示对象
输入：半径 位置 色
结果：球Mesh用于植株或人头示意
注意：不是人体或植物真实重建。 */
function sphere(parent,name,r,x,y,z,color){const m=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),material(color));m.name=name;m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}

/* group
职责：建立命名对象层级
输入：parent和name
结果：创建THREE.Group、加入父节点并返回
注意：父变换会传给子对象，理解局部与世界坐标。 */
function group(parent,name){const g=new THREE.Group();g.name=name;parent.add(g);return g;}
const interior=group(scene,'concept_interior');const exterior=group(scene,'jiageng_building_impression');exterior.visible=false;
interior.userData={description:'A-D concept zones, not a measured floor plan',units:'conceptual meters'};exterior.userData={description:'Architectural impression, not a surveyed reconstruction; upper tower not assigned to library'};
box(scene,'ground',260,.2,340,0,-1.7,-35,'#e4e4d8');

/* plant
职责：组合花盆 植株与叶团
输入：parent X Z scale
结果：返回以给定位置为原点的组
注意：主要是场景语境，不是声学吸声计算。 */
function plant(parent,x,z,scale=1){const p=group(parent,'planter');p.position.set(x,0,z);p.scale.setScalar(scale);cylinder(p,'terracotta_pot',.35,.6,0,.3,0,'#b99d79',.48);cylinder(p,'stem',.035,1.2,0,1.0,0,'#6c7350');for(let i=0;i<5;i++){const a=i*2.3;sphere(p,'foliage',.38,Math.cos(a)*.28,1.25+i*.12,Math.sin(a)*.28,'#6e9270');}return p;}

/* chair
职责：组合椅座 椅背与四腿
输入：parent X Z rotation color
结果：返回椅子组
注意：几何没有碰撞体、承载、脚轮或防倾倒属性。 */
function chair(parent,x,z,rot=0,col='#738f86'){const g=group(parent,'chair');g.position.set(x,0,z);g.rotation.y=rot;box(g,'seat',.64,.12,.63,0,.56,0,col);box(g,'back',.64,.62,.10,0,.92,-.27,col);for(const a of [-.24,.24])for(const b of [-.23,.23])box(g,'leg',.045,.5,.045,a,.25,b,'#68736d');return g;}

/* table
职责：组合桌板与四腿
输入：parent X Z width depth
结果：返回桌组，桌板约在0.83高度
注意：这些尺度为概念，不当作采购规格。 */
function table(parent,x,z,w=2.5,d=1.3){const g=group(parent,'table');g.position.set(x,0,z);box(g,'oak_worktop',w,.13,d,0,.83,0,'#cbb891');for(const a of [-w/2+.18,w/2-.18])for(const b of [-d/2+.15,d/2-.15])box(g,'table_leg',.08,.77,.08,a,.39,b,'#a2aaa0');return g;}

/* bookcase
职责：创建早期概念场景的细节书架
输入：parent 位置 旋转 宽度
结果：组合书架及单本彩色示意书
注意：主要用于保留的A至D旧几何；五层用rack函数。 */
function bookcase(parent,x,z,rot=0,w=2.6){const g=group(parent,'bookcase');g.position.set(x,0,z);g.rotation.y=rot;box(g,'back',w,2.2,.1,0,1.1,-.24,'#baa985');for(const a of [-w/2,w/2])box(g,'side',.1,2.2,.55,a,1.1,0,'#baa985');for(let row=0;row<4;row++){const y=.15+row*.55;box(g,'shelf',w,.07,.56,0,y,0,'#b4a481');for(let n=0;n<12;n++){const colors=['#789084','#b4a16d','#8093a1','#b47b67','#9b8a9d'];const h=.29+(n%4)*.035;const b=box(g,'book',.12,h,.30,-w/2+.21+n*(w-.32)/12,y+h/2+.06,.01,colors[(n+row)%5]);b.rotation.z=(n%5===0)?.1:0;}}return g;}

/* railing
职责：早期概念中庭玻璃栏板
输入：位置与宽深
结果：创建半透明栏板
注意：透明程度只管画面，不代表安全或声学性能。 */
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
buildLibraryEnvironment(exteriorDetails.rearLibrary,helpers);
const libraryExterior=exteriorDetails.rearLibrary.clone(true);libraryExterior.name='main_3_library_rear_only';libraryExterior.position.z=0;libraryExterior.visible=false;scene.add(libraryExterior);
const buildingFloors=group(scene,'five_floor_library_cutaway');buildingFloors.visible=false;
const floorModel=buildLibraryFloors(buildingFloors,helpers);

const pilots=buildFloorPilots(floorModel.storeys,helpers);
let floorSelection=0,expanded=false,showFurniture=true,showSkylight=false,view='exterior',proposalOn=false,labelsOn=true,renderDirty=true;
const pilotStates=pilots.map(()=>({active:false,pending:false,cooldown:false,progress:0,target:0,objection:false,reserved:false,message:'选择本层方案，查看常态与目标用途。',kind:'normal'}));
const current=()=>floorSelection?pilotStates[floorSelection-1]:null;
const info=()=>floorSelection?PILOT_INFO[floorSelection-1]:null;

/* floorOffset
职责：计算楼层展示高度
输入：楼层n、expanded与floorModel.height
结果：返回(n-1)乘4.8或9
注意：9是展开显示间距，不是实际层高。 */
function floorOffset(n){return (n-1)*(expanded?9:floorModel.height);}

/* isFloorView
职责：判断当前是否室内楼层视图
输入：view
结果：floors/pilot/floorPlan时为true
注意：用于共享模型显示和侧栏，不执行业务判断。 */
function isFloorView(){return ['floors','pilot','floorPlan'].includes(view);}

/* isArchitectureView
职责：判断校园或馆舍视图
输入：view
结果：exterior/library时为true
注意：与isFloorView决定不同控制区可见。 */
function isArchitectureView(){return view==='exterior'||view==='library';}

/* syncFloorVisibility
职责：同步楼层和子对象可见性
输入：floorSelection/expanded/proposalOn等
结果：更新层高、家具、梁、试点和采光顶可见
注意：隐藏不等于删除，结构位置签名不能检测可见性。 */
function syncFloorVisibility(){renderDirty=true;for(const f of floorModel.storeys){f.root.visible=!floorSelection||f.info.n===floorSelection;f.root.position.y=floorOffset(f.info.n);f.furniture.visible=showFurniture;for(const m of f.structural.children)if(m.name.includes('beam'))m.visible=(!proposalOn&&view!=='floorPlan')||!showFurniture;const p=pilots[f.info.n-1];p.root.visible=proposalOn&&showFurniture;for(const old of p.replaced)old.visible=!proposalOn;}floorModel.skylight.visible=showSkylight&&!floorSelection&&!expanded;}

/* toast
职责：短时显示保存或导出反馈
输入：提示文本
结果：显示toast并重置3秒隐藏计时
注意：只管界面消息，不表示设备执行成功。 */
function toast(t){$('toast').textContent=t;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',3000);}

/* status
职责：保存当前层的状态提示
输入：文本t和kind
结果：同时更新当前pilotState消息及DOM
注意：不是后端日志，刷新不保留。 */
function status(t,kind='normal'){const st=current();if(st){st.message=t;st.kind=kind;}$('status').textContent=t;$('status').dataset.kind=kind;}

/* blockReason
职责：给当前试点提供阻止理由
输入：current状态
结果：按未选层 异议 预约 冷却返回原因
注意：没有检测声学、真实时段或人数，不能夸大核验范围。 */
function blockReason(){const st=current();return !st?'请先选择一至五楼中的一个试点。':st.objection?'邻近读者有异议，停止本次变更，由馆员沟通。':st.reserved?'本次候选资源已有预约，保留原安排。':st.cooldown?'正在模拟冷却期，推进10分钟后可再申请。':'';}

/* syncUI
职责：从状态刷新整页三维控制
输入：view、选层、配置与pilotStates
结果：更新文字、禁用、面包屑、图例和条件
注意：innerHTML数据来自固定配置；未来外部数据应安全构建DOM。 */
function syncUI(){
 const floorMode=isFloorView(),st=current(),p=info(),f=FLOOR_INFO.find(f=>f.n===floorSelection);
 $('floorBar').hidden=!floorMode;$('floorPanel').hidden=!floorMode;$('pilotPanel').hidden=!floorMode||!proposalOn;$('pilotConditions').hidden=!floorMode||!proposalOn||!st;$('pilotZones').hidden=!floorMode||!proposalOn;$('architecturePanel').hidden=!isArchitectureView();
 $('approve').disabled=!st?.pending;$('restore').disabled=!st?.active;$('request').disabled=!st||st.active;$('reading').disabled=!st;$('advance').hidden=!st?.cooldown;
 $('reading').textContent=p?p.normal:'常态用途';$('request').textContent=p?'生成'+p.active+'建议':'选择楼层后生成建议';$('reading').classList.toggle('active',!!st&&!st.active);
 $('objection').checked=!!st?.objection;$('reserved').checked=!!st?.reserved;$('status').textContent=st?st.message:'全馆方案总览：点击楼层，查看位置与转换流程。';$('status').dataset.kind=st?st.kind:'normal';
 $('pilotHeading').textContent=p?p.n+'F · '+p.title:'一至五楼 · 分层试点';
 $('pilotLocation').textContent=p?'拟议位置：'+p.location:'每层按用途制定方案；彩色边界为候选试点范围。';
 $('pilotFacts').innerHTML=p?'<b>触发情境</b><p>'+p.trigger+'</p><b>方案动作</b><p>'+p.action+'</p><b>保护条件</b><p>'+p.protect+'</p><b>评估指标</b><p>'+p.metric+'</p><b>推进顺序</b><p>'+p.phase+'</p>':PILOT_INFO.map(q=>'<p><b>'+q.n+'F '+q.title+'</b><br>'+q.normal+' → '+q.active+'</p>').join('');
 $('architectureHeading').textContent=view==='library'?'图书馆 · 馆舍与湖畔环境':'主一至主五 · 完整楼群';
 $('architectureDescription').textContent=view==='library'?'保留主三后部馆舍及入口标识、平台、湖岸和绿化。湖畔全景、入口近景均可查看；点击馆舍进入内部剖切。':'主一、主二、主四、主五的纵深与主三完整纵深对齐。转到背面可看湖畔关系，点击中央主三进入图书馆。';
 for(const id of ['libraryBack','lakeView','entryView','enterCutaway'])$(id).hidden=view!=='library';$('locateLibrary').hidden=view==='library';$('campusBack').hidden=view==='library';$('facadeFront').hidden=view==='library';
 $('breadcrumb').textContent=floorMode?'校园楼群 › 主三背面图书馆 › '+(floorSelection?floorSelection+'F':'五层总览')+(proposalOn?' › 本层方案':' › 馆藏参照'):view==='library'?'校园楼群 › 主三背面图书馆与湖畔':'校园楼群 · 点主三进入图书馆';
 $('legend').hidden=true;$('floorLegend').hidden=!floorMode;$('floorLegend').innerHTML='东上西下 / 北左南右 · 2025馆藏分区参照<br>'+(proposalOn?'彩色边界 = 拟议试点；桌椅数量与选址为示意':'柱梁与尺寸为示意 · 点击方案试点查看设计叠加');
 document.querySelectorAll('[data-floor]').forEach(e=>{const a=+e.dataset.floor===floorSelection;e.classList.toggle('active',a);e.setAttribute('aria-pressed',String(a));});
 $('explode').textContent=expanded?'合拢楼层':'分层展开';$('explode').disabled=!!floorSelection;$('skylight').disabled=!!floorSelection||expanded;$('floorPilot').hidden=!floorSelection;$('floorPilot').textContent=proposalOn?'查看本层馆藏参照':'叠加本层试点方案';
 $('floorHeading').textContent=f?floorSelection+'F · '+f.title:'五层整体剖切';$('floorDescription').textContent=f?f.summary:'按2025版馆藏导览分别建立二至五楼；一楼仅概念示意。可点选楼层、展开或看骨架。';$('floorTags').textContent=f?f.tags.join(' · '):'从同一楼层模型切换剖切、方案、俯瞰';
 $('collectionList').innerHTML=f?f.zones.map(z=>'<span style="border-left:3px solid '+z.color+'">'+z.label+'</span>').join(''):'选择楼层，查看馆藏与本层试点。';
 $('viewTitle').textContent=floorMode?(proposalOn?(p?p.n+'F '+p.title+' · '+(st.active?p.active:st.pending?'等待确认':p.normal):'全馆五层方案总览'):$('floorHeading').textContent):view==='library'?'图书馆与湖畔平台':'嘉庚主楼群 · 完整纵深';
 $('viewDescription').textContent=floorMode?(proposalOn?(p?p.action:'各层试点叠加于同一剖切模型，选一层可操作；候选位置需现场核验。'):'剖切与俯瞰使用同一楼层。馆藏参照和拟议设计可以切换对照。'):view==='library'?'湖面、平台、步行道、入口和馆舍组成完整场景。几何尺度与标识为展示示意。':'从楼与主三共用前后端纵深；背面湖畔可旋转查看。';
 for(const id of ['interior','exterior','library','floors','top'])$(id).classList.toggle('active',id==='interior'?floorMode&&proposalOn&&view!=='floorPlan':id==='top'?view==='floorPlan':id==='floors'?floorMode&&!proposalOn&&view!=='floorPlan':id===view);
}

/* setView
职责：切换场景并给相机默认机位
输入：目标视图v及当前选层状态
结果：控制可见组、方案叠加、相机与UI
注意：interior按钮被映射到新pilot，不显示旧A至D场景。 */
function setView(v){
 if(v==='interior'||v==='pilot'){proposalOn=true;if(v==='interior'&&!floorSelection)floorSelection=3;v='pilot';}
 else if(v==='floors')proposalOn=false;
 else if(v==='top'){if(!floorSelection)floorSelection=3;v='floorPlan';}
 view=v;interior.visible=false;exterior.visible=v==='exterior';libraryExterior.visible=v==='library';buildingFloors.visible=isFloorView();syncFloorVisibility();
 if(v==='exterior'){camera.position.set(130,106,175);controls.target.set(0,16,-28);}
 else if(v==='library'){camera.position.set(78,58,-125);controls.target.set(0,8,-26);}
 else if(isFloorView()){const y=floorSelection?floorOffset(floorSelection):expanded?17:9;if(v==='floorPlan'){camera.position.set(0,y+93,.001);controls.target.set(0,y,0);}else if(floorSelection){camera.position.set(44,y+36,58);controls.target.set(0,y+1,0);}else{camera.position.set(61,expanded?67:47,77);controls.target.set(0,expanded?18:10,0);}}
 controls.update();syncUI();
}

/* setFloor
职责：选择0至5层
输入：输入n
结果：限制范围后按当前叠加状态切换视图
注意：0是总览；平面俯瞰与本层状态保留。 */
function setFloor(n){floorSelection=Math.max(0,Math.min(5,Number(n)||0));setView(view==='floorPlan'&&floorSelection?'floorPlan':proposalOn?'pilot':'floors');}

/* goCamera
职责：切换视图后设置特定机位
输入：v、pos数组、target数组
结果：设置camera和controls.target并更新
注意：只改变观察方向，不改变建筑地理位置。 */
function goCamera(v,pos,target){setView(v);camera.position.set(...pos);controls.target.set(...target);controls.update();}
for(const id of ['interior','exterior','library','top'])$(id).onclick=()=>setView(id);
 $('floors').onclick=()=>{floorSelection=0;setView('floors');};$('reset').onclick=()=>setView(view);$('locateLibrary').onclick=()=>setView('library');$('enterCutaway').onclick=()=>{floorSelection=0;setView('floors');};
 $('campusBack').onclick=()=>goCamera('exterior',[114,96,-190],[0,15,-45]);$('libraryBack').onclick=()=>goCamera('library',[0,23,-85],[0,14,-1]);$('lakeView').onclick=()=>goCamera('library',[52,22,-88],[0,10,-29]);$('entryView').onclick=()=>goCamera('library',[21,10,-44],[0,6,-22]);$('facadeFront').onclick=()=>goCamera('exterior',[0,40,192],[0,21,-12]);
 $('roofDetail').onclick=()=>view==='library'?goCamera('library',[40,47,-54],[0,24,-8]):goCamera('exterior',[39,62,49],[0,40,-3]);
 document.querySelectorAll('[data-floor]').forEach(el=>el.onclick=()=>setFloor(el.dataset.floor));$('explode').onclick=()=>{expanded=!expanded;setView(proposalOn?'pilot':'floors');};$('furniture').onchange=()=>{showFurniture=$('furniture').checked;syncFloorVisibility();};$('skylight').onchange=()=>{showSkylight=$('skylight').checked;syncFloorVisibility();};$('floorPilot').onclick=()=>setView(proposalOn?'floors':'pilot');
 $('atriumView').onclick=()=>{floorSelection=0;expanded=false;goCamera('floors',[0,5.8,17.8],[0,10,-16]);};
 $('reading').onclick=()=>{const st=current();if(!st)return;Object.assign(st,{active:false,pending:false,cooldown:false,target:0});status('已重置本层常态用途。此按钮为演示复位。');syncUI();};
 $('pilotFocus').onclick=()=>{const q=info();if(!q)return;setView('pilot');renderDirty=true;const y=floorOffset(q.n),d=q.n===5?32:q.n===3?23:q.n===1?20:14;camera.position.set(q.x+d*.68,y+d*.76,q.z+d);controls.target.set(q.x,y+.8,q.z);controls.update();};
 $('request').onclick=()=>{const st=current();if(!st)return;const reason=blockReason();st.pending=!reason;status(reason||'建议已生成：'+info().active+'。尚未执行，请馆员核对候选范围和安静要求。',reason?'blocked':'pending');syncUI();};
 $('approve').onclick=()=>{const st=current();if(!st?.pending)return;const reason=blockReason();st.pending=false;if(reason)status(reason,'blocked');else{st.active=true;st.target=1;status('馆员已确认：'+info().active+'。'+(floorSelection===5?'仅显示静音提示，桌椅和有效预约保持不变。':'本次只演示新增试点设施；实际调整由工作人员实施。'));}syncUI();};
 $('restore').onclick=()=>{const st=current();if(!st)return;Object.assign(st,{active:false,pending:false,cooldown:true,target:0});status('已模拟连续无人5分钟：恢复本层常态，并进入10分钟冷却期。');syncUI();};$('advance').onclick=()=>{const st=current();if(st){st.cooldown=false;status('已推进模拟时钟10分钟，可再次申请。');syncUI();}};
 for(const id of ['objection','reserved'])$(id).onchange=()=>{const st=current();if(!st)return;st[id]=$(id).checked;if(st.pending){st.pending=false;status('条件改变，旧建议失效，需要重新核对。','blocked');}else if(st.active&&st[id])status('出现新约束：馆员接管，模型不会自动移动进行中的设施。','blocked');syncUI();};
 $('labels').onclick=()=>{labelsOn=!labelsOn;$('labels').setAttribute('aria-pressed',String(labelsOn));};
 const raycaster=new THREE.Raycaster();let pointerStart=null;renderer.domElement.addEventListener('pointerdown',e=>pointerStart={x:e.clientX,y:e.clientY});renderer.domElement.addEventListener('pointerup',e=>{if(!pointerStart||Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>5)return;const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);if(isFloorView()){const hit=raycaster.intersectObjects(floorModel.storeys.filter(f=>f.root.visible).map(f=>f.root),true)[0];if(hit){let o=hit.object;while(o&&!o.userData.floor)o=o.parent;if(o)setFloor(o.userData.floor);}}else if(view==='exterior'){const hit=raycaster.intersectObject(exterior,true)[0];if(hit){let o=hit.object;while(o&&!o.userData.main3)o=o.parent;if(o)setView('library');}}else if(view==='library'){const hit=raycaster.intersectObject(libraryExterior,true)[0];if(hit&&!hit.object.name.includes('lake')&&!hit.object.name.includes('shore')){floorSelection=0;setView('floors');}}});
 
/* download
职责：下载当前Blob资源
输入：blob及name
结果：创建临时下载链接，1秒后释放ObjectURL
注意：触发下载不等于用户已保存成功；应检查本机文件。 */
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
 
/* exportName
职责：按可见状态生成下载名称
输入：view、floorSelection、proposalOn与expanded
结果：返回相应中文GLB文件名
注意：名字区分用途，不能证明模型坐标已实测。 */
function exportName(){return view==='exterior'?'嘉庚建筑意象.glb':view==='library'?'主三背面_图书馆外观.glb':proposalOn?(floorSelection?'图书馆_'+floorSelection+'楼_试点'+(current().active?'启用':'常态')+'.glb':'图书馆_五层试点总览.glb'):floorSelection?'图书馆_'+floorSelection+'楼_空间剖切.glb':expanded?'图书馆_五层展开.glb':'图书馆_五层整体剖切.glb';}
 
/* exportGLB
职责：导出可见模型快照
输入：当前场景与GLTFExporter
结果：异步返回二进制GLB，单层克隆归零高度
注意：只导当前可见对象；动画未完成时可能导出中间态。 */
async function exportGLB(){let root=view==='exterior'?exterior:view==='library'?libraryExterior:floorSelection?floorModel.storeys[floorSelection-1].root.clone(true):buildingFloors;if(floorSelection&&isFloorView())root.position.y=0;return new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});}
 $('export').onclick=async()=>{try{$('export').disabled=true;download(new Blob([await exportGLB()],{type:'model/gltf-binary'}),exportName());toast('当前场景已导出');}catch(e){toast('导出失败：'+e.message);console.error(e);}finally{$('export').disabled=false;}};
 $('snapshot').onclick=()=>{renderer.render(scene,camera);renderer.domElement.toBlob(b=>download(b,exportName().replace('.glb','.png')),'image/png');};
 
/* resize
职责：调整画布和相机比例
输入：host宽高
结果：更新renderer尺寸 aspect和投影矩阵
注意：需保留宿主有效尺寸；不是重新创建所有几何。 */
function resize(){renderDirty=true;renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(host);resize();setView('exterior');
 const floorLabels=floorModel.storeys.map(f=>{const el=document.createElement('button');el.className='model-label floor-model-label';el.textContent=f.info.n+'F · '+f.info.title;el.onclick=()=>setFloor(f.info.n);$('labelsLayer').append(el);return {el,n:f.info.n};});
 const functionLabels=Array.from({length:18},()=>{const el=document.createElement('div');el.className='model-label function-label';$('labelsLayer').append(el);return el;});
 const pilotLabels=pilots.map(p=>{const el=document.createElement('button');el.className='model-label pilot-model-label';el.textContent=p.info.n+'F 拟议 · '+p.info.title;el.onclick=()=>{floorSelection=p.info.n;setView('pilot');};$('labelsLayer').append(el);return el;});
 const main3Label=document.createElement('button');main3Label.className='model-label floor-model-label';main3Label.textContent='主三 · 进入背面图书馆';main3Label.onclick=()=>setView('library');$('labelsLayer').append(main3Label);
 const directions=[['东区',0,-27],['北区',-22,0],['南区',22,0],['西区',0,26]].map(([text,x,z])=>{const el=document.createElement('div');el.className='model-label direction-label';el.textContent=text;$('labelsLayer').append(el);return {el,x,z};});
 
/* positionLabel
职责：把3D标签定位到2D界面
输入：DOM元素、Vector3与visible
结果：投影后写left/top与display
注意：会修改传入Vector3；未做完整遮挡和重叠排布。 */
function positionLabel(el,pos,visible){const p=pos.project(camera);el.style.left=((p.x*.5+.5)*host.clientWidth)+'px';el.style.top=((-p.y*.5+.5)*host.clientHeight)+'px';el.style.display=visible&&labelsOn&&p.z<1&&Math.abs(p.x)<1.02&&Math.abs(p.y)<1.02?'block':'none';}
 let last=performance.now();
/* animate
职责：每帧更新动画 控件与标签
输入：requestAnimationFrame时间now
结果：推进各层progress、按需绘制、更新标签并再次请求帧
注意：没有实体控制、碰撞或声音计算，帧循环仍持续。 */
function animate(now){const dt=Math.min((now-last)/1000,.08);last=now;let animated=false;for(let i=0;i<pilots.length;i++){const st=pilotStates[i];if(st.progress!==st.target)animated=true;st.progress=Math.abs(st.target-st.progress)<.002?st.target:st.progress+(st.target-st.progress)*Math.min(1,dt*2.8);pilots[i].apply(st.progress);}const cameraChanged=controls.update();if(animated||cameraChanged||renderDirty){renderer.render(scene,camera);renderDirty=false;}for(const l of floorLabels)positionLabel(l.el,new THREE.Vector3(-20.5,floorOffset(l.n)+1.25,20),isFloorView()&&(!floorSelection||floorSelection===l.n));const f=FLOOR_INFO.find(f=>f.n===floorSelection);for(let i=0;i<functionLabels.length;i++){const zone=f?.zones[i];functionLabels[i].textContent=zone?.label||'';positionLabel(functionLabels[i],new THREE.Vector3(zone?.x||0,floorOffset(floorSelection)+2.5,zone?.z||0),isFloorView()&&floorSelection>0&&showFurniture&&!!zone);}for(let i=0;i<pilots.length;i++){const p=pilots[i].info;positionLabel(pilotLabels[i],new THREE.Vector3(p.x,floorOffset(p.n)+3.4,p.z),isFloorView()&&proposalOn&&showFurniture&&(!floorSelection||floorSelection===p.n));}for(const d of directions)positionLabel(d.el,new THREE.Vector3(d.x,floorOffset(floorSelection)+.4,d.z),isFloorView()&&!!floorSelection);positionLabel(main3Label,new THREE.Vector3(0,26,17),view==='exterior');requestAnimationFrame(animate);}requestAnimationFrame(animate);
 
/* signature
职责：取得对象的位置旋转摘要
输入：root对象树
结果：收集Mesh名称 局部位置与旋转
注意：不含可见性、尺寸或材质；不能当全面几何一致性证明。 */
function signature(root){const a=[];root.traverse(o=>{if(o.isMesh)a.push([o.name,...o.position.toArray(),...o.rotation.toArray().slice(0,3)]);});return a;}
 window.modelApp={setView,setFloor,exportGLB,exportName,getState:()=>({view,proposalOn,floorSelection,expanded,showFurniture,showSkylight,visibleFloors:floorModel.storeys.filter(f=>f.root.visible).map(f=>f.info.n),floorHeights:floorModel.storeys.map(f=>f.root.position.y),mode:current()?.active?'active':'normal',pending:!!current()?.pending,cooldown:!!current()?.cooldown,progress:current()?.progress||0,pilotStates:pilotStates.map(s=>({...s})),pilotInfo:PILOT_INFO,movableTables:floorSelection?pilots[floorSelection-1].moving.map(m=>m.object.position.toArray()):[],protectedSignature:floorModel.storeys.map(f=>({n:f.info.n,structure:signature(f.structural),collections:signature(f.furniture)})),meshCount:renderer.info.render.triangles})};
 window.modelApp.getArchitectureState=()=>({campusVisible:exterior.visible,libraryOnlyVisible:libraryExterior.visible,companions:exterior.children.filter(x=>x.name==='five_floor_companion_context').map(g=>({name:g.userData.building,extent:g.userData.longitudinalExtent})),main3Extent:[-68,23],environmentNames:libraryExterior.getObjectByName('library_lakeside_environment').children.map(m=>m.name),hasEntranceSign:!!libraryExterior.getObjectByName('library_entrance_name_sign')});
 window.modelApp.floorPickPoint=n=>{const r=host.getBoundingClientRect(),p=new THREE.Vector3(15,floorOffset(n)+.25,19).project(camera);return{x:r.left+(p.x*.5+.5)*r.width,y:r.top+(-p.y*.5+.5)*r.height};};
