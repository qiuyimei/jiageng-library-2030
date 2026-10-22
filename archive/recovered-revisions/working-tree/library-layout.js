import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createPhotoDetails} from './photo-details.js';
import {deskLayouts,deskChairPosition,seatPosition,physicalSeatLabel,atriumVoids,EXHIBITION_LAYOUT,GROUND_LAYOUT,ELEVATOR_LAYOUT,TRANSPORT_CORE,floorBounds,upperFacilities,READING_BAY_LAYOUT} from './spatial.js';
export const LAYOUT_REFERENCE='https://library.xujc.com/2025/0901/c4536a161543/page.htm';
// Local coordinates follow the guide: east at the top (-Z), north on the left (-X).
// The guide is a collection diagram, not a surveyed architectural or structural drawing.
const z=(label,x,depth,w,d,color,kind='books')=>({label,x,z:depth,w,d,color,kind});
export const displayZone=source=>source.perimeterPlacement?source:source.kind==='books'&&Math.abs(source.x)>=11&&Math.abs(source.z)<17?{...source,x:Math.sign(source.x)*15.5,w:3.6}:source;
export const FLOOR_INFO=[
 {n:1,title:'靠窗阅览 · 固定专座 · 前厅服务',summary:'本人确认：左侧窗边阅览，右侧为固定专座，电梯在专座后方略靠左，黑色门面朝右侧通道。左侧书库五排，台后书库保留；前厅沙发朝馆内，左右两区各两张沙发、中间一个沿地砖线纵向书架，厕所门朝阅览桌。正式坐标、桌型与数量未测绘。',tags:['靠窗阅览','固定专座','服务台后书库','前厅休息'],color:'#9ab8c1',verified:false,zones:[z('左侧靠窗阅览',-15,0,5.5,32,'#c7ddd8','study'),z('柜式密集书库',-9,-2,5,30,'#b6c4cd','storage'),z('台后密集书库',0,.4,7.2,16,'#b6c4cd','storage'),z('固定专座参考区',10.9,2.75,6.4,20.5,'#c5c7d8','study'),z('前厅休息',0,26,28,12,'#e3dcc5','service'),z('电脑服务台',0,13,10,4,'#9ab8c1','service')]},
 {n:2,title:'A—F 类馆藏',summary:'按2025版导览图：北侧为A、B、C、D类，南侧以F类经济为主，西侧衔接D、E、F类；中央台阶位于西侧方向。',tags:['北侧 A/B/C/D','南侧 F 经济','西侧 D/E/F'],color:'#c9bf72',verified:true,zones:[
  z('A 马列',-12,-19,9,2,'#d8674e'),z('B 哲学宗教',-12,-14,9,6,'#d9c948'),z('B 哲学宗教',-12,-4,9,5,'#d9c948'),z('C 社科总论',-12,2,9,4,'#d68848'),z('D 政治法律',-12,8,9,6,'#99b95e'),z('D 政治法律',-3,18,16,3,'#99b95e'),z('E 军事',6.8,18,2.5,3,'#b69d65'),z('F 经济',12,-13,9,11,'#67abc0'),z('F 经济',12,4,9,14,'#67abc0'),z('F 经济',11,18,5,3,'#67abc0')]},
 {n:3,title:'G/H/I 类与中央展厅',summary:'按2025版导览图：北侧G文化教育及H语言文字，I文学分布于东、南及北侧西端；儿童图书、教材、工具书在东北侧，西侧为展区。',tags:['北侧 G/H','东南侧 I 文学','东北侧儿童/工具书','三楼中央展厅'],color:'#87b9c5',verified:true,zones:[
  z('儿童/教材/工具书',-12,-19,7,4,'#d7c647'),z('I 文学',-7,-19,3.5,4,'#77b5c9'),z('I 文学',0,-19,4.5,4,'#77b5c9'),z('I 文学',11,-19,7,4,'#77b5c9'),z('G 文化教育',-12,-10,8.5,6,'#91b557'),z('G 文化教育',-12,1,8.5,3,'#91b557'),z('H 语言文字',-12,6,8.5,4.5,'#d96751'),z('I 文学',-12,12.5,8.5,4.5,'#77b5c9'),z('I 文学',12,-10,8.5,6,'#77b5c9'),z('I 文学',12,7,8.5,14,'#77b5c9'),z('西侧展区',0,20,21,4,'#d4c5a0','exhibition')]},
 {n:4,title:'J/K 与自然科学、工程技术',summary:'按2025版导览图：北侧为J艺术与K历史地理，南侧为计算机、工程和技术类；西侧为K/N/O/P-R类，东侧有技术类馆藏及中日文化交流中心。',tags:['北侧 J/K','南侧技术馆藏','西侧 K/N/O/P-R','东侧文化交流'],color:'#aaa6bd',verified:true,zones:[
  z('U—Z 综合/交通',-13,-19,4,3,'#6d9b84'),z('TU/TV 建筑水利',-8,-19,3.5,3,'#83b8c0'),z('TU 建筑科学',0,-20,4.5,3,'#83b8c0'),z('TP/TS 技术',8,-19,4,3,'#83b8c0'),z('中日文化交流中心',14,-19,4.5,3,'#c2c7b2','room'),z('J 艺术',-12,-10,9,9,'#d8cc53'),z('J 艺术',-12,0,9,3,'#d8cc53'),z('K 历史地理',-12,8,9,11,'#c46a68'),z('K 历史地理',-12,20,4,3,'#c46a68'),z('N 自然科学总论',-7.5,20,3,3,'#baa579'),z('O 数理化',-1,20,8,3,'#c48aa3'),z('P—R 天文/生物/医学',8,20,8,3,'#cc9569'),z('TP 计算机',12,-9,9,8,'#83b8c0'),z('TP 计算机',12,0,9,3,'#83b8c0'),z('T—TN 工程技术',12,7,9,7,'#b6b6ad'),z('R—S 医药/农业',12,14,9,2.5,'#c69469')]},
 {n:5,title:'东侧备考联盟与北西侧报刊',summary:'按2025版导览图：备考联盟在东侧；北侧排列报纸、现刊、2019—2024过刊和外文原版书，西侧为2013—2018过刊及2015年至今过报。南侧留白范围未擅自指定用途。',tags:['东侧备考联盟','北侧现刊/外文书','西侧过刊/过报','南侧用途待核对'],color:'#bcae81',verified:true,zones:[
  z('备考联盟区',0,-14,27,15,'#a9bc8b','study'),z('报纸',-12,-3.5,8,2,'#c9be68'),z('现刊',-12,1,8,5,'#d7c757'),z('2019—2024 过刊',-12,6.5,8,5,'#83b7ac'),z('外文原版书 YY/YW',-12,13,8,6,'#759b84'),z('2013—2018 过刊',-5,20,9,3,'#c8966c'),z('2015年至今过报',5,20,9,3,'#84b7c7')]}
];

// 当前显示的空间关系由本人现场补充；导览图的大类信息不等于建筑实测尺寸。
for(const info of FLOOR_INFO)if(info.n>1){
 info.summary+=' 二至五楼均补足横向和后部空间，右侧中段白墙交通区贴侧墙，西端两角为厕所。尺寸、桌数与房间门位未测绘。';
 if(info.n===4){info.zones=info.zones.filter(v=>v.kind!=='room');info.tags.push('东南侧中日文化交流中心');}
 if(info.n===5){
  info.title='备考联盟 · 报刊阅览 · 外文书 · 存包柜';
  info.tags=['东侧备考联盟','北侧报纸/现刊/过刊/外文书','西侧过刊/过报','后墙存包柜'];
  info.zones=[z('备考联盟区',0,-36,66,29,'#a9bc8b','study'),...upperFacilities(5).periodicals.map(a=>({...a,kind:'books'}))].map(v=>({...v,perimeterPlacement:true}));
 }
}

// 前台中心统一为x=0；分区外形与桌号仍是示意数据，不能推断实测尺寸。
FLOOR_INFO[0].title='靠窗阅览 · 专座 · 右侧咖啡厅';
FLOOR_INFO[0].summary='以前台中心为中轴，左右等宽；左侧窗边桌排与密集书库向后延至上层相同纵深。打印和固定专座内移至服务台后书库一侧，入口右前为107研讨室，后接长条咖啡厅，再由106工作人员室衔接右墙电梯交通区。电梯门前走廊两端均有开口；井道、厕所逐层对齐。一至二楼有普通梯与扶梯，二至三楼仅保留普通梯。以上相对关系来自本人补充，尺寸、陈设及数量均为示意。';
FLOOR_INFO[0].summary+=' 服务台后中央黑色区域沿两侧柱线以实墙分隔，台后密集书库延长并留出后部通道；右后角为收书室，旁边有木色小桌。入口两组沙发贴前端墙，纵向小书架仍在每组两张沙发之间。';
FLOOR_INFO[0].tags=['左窗阅览','固定专座','电脑服务台','右侧咖啡厅','前台中轴'];
FLOOR_INFO[0].zones=[z('左侧靠窗阅览',GROUND_LAYOUT.windowX,-16,5.5,64,'#c7ddd8','study'),...GROUND_LAYOUT.compactBlocks.map(b=>z(b.x<0?'柜式密集书库':'台后密集书库',b.x,b.z,b.w,b.d,'#b6c4cd','storage')),z('固定专座参考区',GROUND_LAYOUT.dedicated.x,GROUND_LAYOUT.dedicated.z,GROUND_LAYOUT.dedicated.w,GROUND_LAYOUT.dedicated.d,'#c5c7d8','study'),z('前厅休息',0,26,28,12,'#e3dcc5','service'),z('电脑服务台',0,13,10,4,'#9ab8c1','service'),z('咖啡厅',GROUND_LAYOUT.cafe.x,GROUND_LAYOUT.cafe.z,GROUND_LAYOUT.cafe.w,GROUND_LAYOUT.cafe.d,'#dcc7a8','service'),...GROUND_LAYOUT.rooms.map(r=>z(r.label,r.x,r.z,r.w,r.d,'#ccd6cd','service'))];

// 二维座位图与三维共用书架清单，避免两边各自简化后位置又不一致。
function zoneRackRecords(source){
 const a=displayZone(source),out=[];if(a.kind!=='books')return out;
 const rows=Math.max(1,Math.floor(a.d/(a.w<4?3:3.3))),cols=a.w<4?1:a.w>12?4:a.w>7?2:1;
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)out.push({x:a.x+(col-(cols-1)/2)*Math.min(3.6,a.w/cols),z:a.z+(row-(rows-1)/2)*(a.w<4?2.5:2.6),w:Math.min(2.9,a.w/cols-.4-(a.w<4?.1:0))});
 return out;
}
function resolveRackPlacement(r,floor){
 let {x,z,w}=r;
 if(floor===4&&z===20&&(Math.abs(x-6.2)<.01||Math.abs(x+7.5)<.01))z=22;
 if(floor===4&&x===8&&z===-19)x=16.1;
 if(x+w/2>TRANSPORT_CORE.left&&x-w/2<TRANSPORT_CORE.right&&z+.4>TRANSPORT_CORE.back&&z-.4<TRANSPORT_CORE.front)return null;
 return {...r,x,z,w};
}
export function floorRackRecords(floor){
 if(floor===1)return [];
 const info=FLOOR_INFO.find(i=>i.n===floor),p=READING_BAY_LAYOUT,out=[];
 // 南北书架长边沿X横排：一排四个端板书架，沿Z形成多个阅读组。
 for(const side of [-1,1]){
  if(floor===5&&side>0)continue; // 五楼南翼保持备考阅览，北翼为报刊/外文馆藏。
  const sources=floor===5?upperFacilities(5).periodicals:info.zones.filter(z=>z.kind==='books'&&Math.sign(z.x)===side);
  for(const [rowIndex,depth] of p.wingRows.entries())for(const x of p.rackXs){
   const label=floor===5?sources[rowIndex%sources.length]?.label:sources.slice().sort((a,b)=>Math.abs(a.z-depth)-Math.abs(b.z-depth))[0]?.label;
   out.push({x:side*x,z:depth,w:p.rackWidth,rotation:0,label:label||'馆藏书架',layoutRegion:side<0?'北':'南',bankRow:depth});
  }
 }
 // 东区最深处才是书架，长边沿Z竖排；桌椅不插在这些书架之间。
 for(const x of p.eastRackXs)for(const depth of p.eastRackZs){
  const sources=info.zones.filter(z=>z.kind==='books'),label=floor===5?'报刊与外文书示意':sources.slice().sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0]?.label;
  out.push({x,z:depth,w:p.eastRackWidth,rotation:Math.PI/2,label:label||'东区馆藏',layoutRegion:'东',bankRow:x});
 }
 // 西端原有藏书带保留，厕所和z=17横向连廊都不挪动。
 if(floor===5){
  for(const source of upperFacilities(5).racks.filter(r=>r.z>23))out.push({...source,rotation:0,label:rackWestLabel(source),layoutRegion:'西'});
 }else{
  for(const x of [-8,-3.5,1,5.5,10])for(const depth of [23.5,29.5])out.push({x,z:depth,w:3.5,rotation:0,label:'西侧馆藏',layoutRegion:'西'});
 }
 return out.map(r=>resolveRackPlacement(r,floor)).filter(Boolean);
}
function rackWestLabel(r){return r.x<0?'2013—2018 过刊':'2015年至今过报';}


export function buildLibraryFloors(parent,H){
 const {group,box,cylinder,material,chair,table}=H,height=4.8,storeys=[],photo=createPhotoDetails(H);
 function slab(root,info){
  const shape=new THREE.Shape();let pts=[[-18,-22],[18,-22],[18,20],[11,20],[11,22],[-11,22],[-11,20],[-18,20]];
  if(info.n===4)pts=[[-18,-22],[-11,-22],[-11,-23],[-6,-23],[-6,-25],[6,-25],[6,-23],[11,-23],[11,-22],[18,-22],[18,22],[-18,22]];
  if(info.n===5)pts=[[-18,-20],[-14,-20],[-14,-22],[-7,-22],[-7,-24],[7,-24],[7,-22],[14,-22],[14,-20],[18,-20],[18,22],[6,22],[6,24],[-6,24],[-6,22],[-18,22]];
  if(info.n===1){const b=floorBounds(1);pts=[[b.left,b.back],[b.right,b.back],[b.right,b.front],[b.left,b.front]];}
  // 各层横向以前台中心为轴等宽；上层背部保留阅览/研讨空间。
  if(info.n>1){const b=floorBounds(info.n);pts=[[b.left,b.back],[b.right,b.back],[b.right,b.front],[b.left,b.front]];}
  pts.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  for(const {x,z,w,d} of atriumVoids(info.n)){const hole=new THREE.Path();hole.moveTo(x-w/2,-z+d/2);hole.lineTo(x+w/2,-z+d/2);hole.lineTo(x+w/2,-z-d/2);hole.lineTo(x-w/2,-z-d/2);hole.closePath();shape.holes.push(hole);}
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.25,bevelEnabled:false});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,material('#ecebe1',{roughness:.46}));mesh.position.y=-.1;mesh.name='guide_outline_floor_slab';mesh.receiveShadow=true;root.add(mesh);
 }
 function rail(root,x,z,w,d){box(root,'atrium_rail_top',w,.10,d,x,1.15,z,'#684c36');box(root,'atrium_rail_lower',w,.035,d,x,.65,z,'#363f3d');}
 function rack(root,x,z,w=3,rot=0){
  // 两处西侧书架绕开柱脚；四楼技术架与样本桌留开，馆藏大类及左右两翼不变。
  let ancestor=root;while(ancestor&&!ancestor.userData.floor)ancestor=ancestor.parent;const floor=ancestor?.userData.floor;
  const resolved=resolveRackPlacement({x,z,w},floor);if(!resolved)return null;({x,z,w}=resolved);
  const r=group(root,'guide_book_rack');r.position.set(x,0,z);r.rotation.y=rot;
  const spineGroups=new Map();
  // 深棕色端板和黑色钢架参考已提供的阅览区照片；不据此改动馆藏位置。
  // 独立书架两面都有书：中央薄隔板，两侧各自陈列，不用背板封死另一面。
  box(r,'dark_rack_back',w,2.15,.055,0,1.22,0,'#3b3634');
  for(const xx of [-w/2,w/2]){
   box(r,'brown_rack_end_panel',.12,2.32,1.04,xx,1.25,0,'#674f46');
   for(const side of [-1,1])box(r,'black_rack_frame',.055,2.15,.055,xx+(xx<0?.09:-.09),1.22,side*.46,'#2c302f');
  }
  for(let row=0;row<4;row++){
   const yy=.23+row*.51;box(r,'black_metal_shelf',w,.055,1.0,0,yy,0,'#2d3130');
   // 固定色序和高度便于复刻；这些书脊只是外形，不能当成真实书目。
   const count=Math.max(8,Math.floor(w/.14)),step=(w-.22)/count;
   for(const side of [-1,1])for(let col=0;col<count;col++){
    const h=.26+((row*7+col*3)%5)*.022;
    const color=['#dddace','#eae7dd','#a1a799','#9daeb0','#bdab91','#9e7d73','#b9b8a7'][(row*3+col)%7];
    const geometry=new THREE.BoxGeometry(step*.82,h,.36);geometry.translate(-w/2+.11+step*(col+.5),yy+h/2+.03,side*.24);
    if(!spineGroups.has(color))spineGroups.set(color,[]);spineGroups.get(color).push(geometry);
   }
  }
  // 同一书架同色书脊合并为一个Mesh，降低细化后每帧的绘制次数。
  for(const [color,geometries] of spineGroups){const mesh=new THREE.Mesh(mergeGeometries(geometries,false),material(color));mesh.name='schematic_book_spines';r.add(mesh);geometries.forEach(geometry=>geometry.dispose());}
  return r;
 }
 function furnishZone(root,source){
  // 馆藏只按大类相对方位参考；侧边书架压缩到外缘，给照片中的长桌阅览带留出空间。
  const zone=displayZone(source);
  const g=group(root,'guide_zone_'+zone.label);g.userData.zone=zone.label;box(g,'guide_function_tint',zone.w,.032,zone.d,zone.x,.18,zone.z,zone.color,{transparent:true,opacity:.55});
  if(zone.kind==='books'){
   // 书架实体统一由floorRackRecords生成，区域这里只保留馆藏提示底色。
  }else if(zone.kind==='study'){
   // 桌椅由统一布局建立；本区域保留备考分区底色，避免重复生成不同数量的座位。
  }else if(zone.kind==='exhibition'){
   // 三楼展示板与展品另装入中央实体展厅，不跟着馆藏色块移到西端。
  }else if(zone.kind==='room'){
   box(g,'cultural_room_low_partition',zone.w,.7,.08,zone.x,.5,zone.z-zone.d/2,'#c7d0c1');table(g,zone.x,zone.z,2.5,1.1);chair(g,zone.x,zone.z+1,Math.PI);
  }else{ /* 服务台在一楼照片细节组中建立，避免两套柜台重叠。 */ }
 }
 for(const info of FLOOR_INFO){const f=group(parent,'library_floor_'+info.n);f.position.y=(info.n-1)*height;f.userData={floor:info.n,title:info.title,reference:info.verified?LAYOUT_REFERENCE:'One-floor plan absent from 2025 guide',orientation:'east=-Z; north=-X',surveyed:false};const structural=group(f,'guide_outline_and_frame'),furniture=group(f,'guide_collection_zones');slab(structural,info);
  if(info.n===1){
   const b=floorBounds(1),xs=[b.left,-18,-6.2,6.2,18,b.right];
   const zs=[b.back+2,-40,-30,-20,-10,0,10,20,32];
   for(const x of xs)for(const zz of zs)if(!(x>TRANSPORT_CORE.left&&zz<GROUND_LAYOUT.rightBoundaryZ))photo.interiorFrame(structural,x,zz,info.n);
   for(const x of xs){const back=x>TRANSPORT_CORE.left?GROUND_LAYOUT.rightBoundaryZ:b.back;box(structural,'schematic_beam',.42,.28,b.front-back,x,4.42,(b.front+back)/2,'#e2ddcd');}
   for(const zz of zs)for(let i=1;i<xs.length;i++){const right=zz<GROUND_LAYOUT.rightBoundaryZ?Math.min(xs[i],TRANSPORT_CORE.left):xs[i];if(right>xs[i-1])box(structural,'side_gallery_beam',right-xs[i-1],.28,.40,(right+xs[i-1])/2,4.42,zz,'#e2ddcd');}
  }else{
   const b=floorBounds(info.n),xs=[b.left,-18,-6.2,6.2,18,b.right],zs=[b.back+2,...[-110,-100,-90,-80,-70,-60].filter(z=>z>b.back),-50.6,-40,-30,-20,-10,0,10,20,32];
   for(const x of xs)for(const zz of zs)photo.interiorFrame(structural,x,zz,info.n);
   for(const x of xs)box(structural,'schematic_beam',.42,.28,b.front-b.back,x,4.42,(b.front+b.back)/2,'#e2ddcd');
   for(const zz of zs)for(let i=1;i<xs.length;i++)box(structural,'side_gallery_beam',xs[i]-xs[i-1],.28,.40,(xs[i]+xs[i-1])/2,4.42,zz,'#e2ddcd');
  }
  if(info.n>1){
   for(const hole of atriumVoids(info.n))for(const x of [hole.x-hole.w/2+.05,hole.x+hole.w/2-.05]){
    // 三楼直梯出口旁的两段平台通往座位区，栏杆从平台后方再开始。
    const railBack=hole.back;
    rail(structural,x,(railBack+hole.front)/2,.06,hole.front-railBack);if(!hole.transport)photo.railDetails(structural,x,railBack,hole.front);
   }
   if(info.n===3)for(const side of [-1,1]){
    // 此出口在上下两段梯之间的实体楼板上，不能覆盖二至三楼最后的踏步。
    box(structural,'third_floor_seating_access_landing',2.3,.025,2.8,side*4.95,.17,.4,'#dadcd1');
    photo.sign(structural,side<0?'← 阅览座位区':'阅览座位区 →',2.6,.34,side*6.9,1.55,1.6,'#e5ede7','#375f56');
    // 只封平台朝挑空的一边，朝座位区的方向不加横杆。
    // 平台朝座位区保持敞开；不在横向通行方向增加栏板。
   }
   const first=atriumVoids(info.n)[0];photo.balcony(structural,first.back,info.n);
  }
  photo.circulation(structural,info.n,height);
  photo.floorFinishes(furniture,info.n);if(info.n===1){photo.lobby(furniture);photo.groundServices(furniture);}if(info.n===3){photo.lounge(furniture);photo.exhibition(furniture);}
  photo.elevator(furniture,info.n);
  if(info.n>=TRANSPORT_CORE.minFloor)photo.transportCore(structural,info.n,height);
  // 用户补充的上层厕所、后部研讨室和五楼存包柜；房间不再用无名小色块代替。
  if(info.n>1)photo.upperRooms(furniture,info.n);
  for(const zone of info.zones){
   // 三楼大厅后先画座位，再在靠窗端画书架；馆藏大类的相对方位保持导览依据。
   const source={...zone,floor:info.n};
   if(info.n===3&&source.kind==='books'&&source.z<=-17){source.z=EXHIBITION_LAYOUT.rearShelvesZ;source.d=1.0;}
   // 五楼书架从upperFacilities生成一次，平面、三维共用；区域底色仍保留。
   furnishZone(furniture,info.n===5&&source.kind==='books'?{...source,kind:'study'}:source);
  }
  if(info.n>1)for(const r of floorRackRecords(info.n)){const entity=rack(furniture,r.x,r.z,r.w,r.rotation||0);if(entity)entity.userData.collectionLabel=r.label||'馆藏书架';}
  // 桌椅与状态标记共用deskLayouts和seatPosition。蓝椅、浅桌、并排通道参考现场照片。
  for(const desk of deskLayouts(info.n)){
   const deskKey=`${info.n}|${desk.x}|${desk.z}|${desk.rotation||0}`;
   const tg=table(furniture,desk.x,desk.z,desk.w,desk.d);tg.rotation.y=desk.rotation||0;tg.name='reading_desk';tg.userData={deskKey,layoutRole:'desk',deskSample:desk.sample,rearRow:!!desk.rearRow,windowBand:!!desk.windowBand,dedicated:!!desk.dedicated};
   if(desk.dedicated){
    // 书立和学习材料仅表现专座用途，不伪造真实桌号或专座归属。
    for(const dx of [-.65,.65])for(const dz of [-.28,.28]){
     box(tg,'dedicated_bookend',.035,.35,.26,dx,.99,dz,'#8497a0');
     for(let i=0;i<3;i++)box(tg,'schematic_study_book',.06,.29+i*.018,.22,dx+.09+i*.065,.99,dz,['#bfa88a','#748f95','#d1cbb3'][i]);
    }
   }
   if(desk.partition){box(tg,'exam_cross_partition_a',desk.w,.55,.04,0,1.15,0,'#cad8d9');box(tg,'exam_cross_partition_b',.04,.55,desk.d,0,1.15,0,'#cad8d9');
    box(tg,'desk_power_strip',.28,.07,.20,0,.94,0,'#576b6e');for(const dx of [-.72,.72])box(tg,'desk_reading_light',.42,.035,.06,dx,1.4,0,'#ececd8');}
   for(let slot=0;slot<4;slot++){
    const p=deskChairPosition(desk,slot),cg=chair(furniture,p.x,p.z,p.rotation,'#247796');
    cg.userData={deskKey,layoutRole:'chair',floor:info.n,displayName:physicalSeatLabel(info.n,p.x,p.z),dedicated:!!desk.dedicated};
    if(desk.sample!==null){const id=`S${info.n}-${String(desk.sample*4+slot+1).padStart(2,'0')}`;cg.userData.seatId=id;cg.name='reading_chair_'+id;cg.traverse(o=>o.userData.seatId=id);
     // 桌牌使用演示编号，不能写成未经核验的馆内真实座号。
     const placard=photo.sign(tg,cg.userData.displayName,.48,.14,slot%2?desk.dx:-desk.dx,.892,slot<2?-desk.d*.36:desk.d*.36,'#f0f0e3','#314c53');placard.rotation.x=-Math.PI/2;
    }
   }
  }
  const ceiling=photo.ceiling(f,info.n);
  storeys.push({info,root:f,structural,furniture,ceiling});
 }
 const skylight=photo.skylight(parent,height);
 parent.userData={reference:LAYOUT_REFERENCE,collectionPositions:'2025 published diagram',orientation:'east=-Z; north=-X',surveyedDimensions:false,structuralLayout:'schematic'};
 return {storeys,height,skylight};
}
