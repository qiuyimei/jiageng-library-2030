/* 中文学习注释副本  原始项目请见01目录
FLOOR_INFO、馆藏分区、楼板轮廓、中庭、结构示意和家具。z箭头函数只帮助生成区域记录。
*/
import * as THREE from 'three';
export const LAYOUT_REFERENCE='https://library.xujc.com/2025/0901/c4536a161543/page.htm';
// Local coordinates follow the guide: east at the top (-Z), north on the left (-X).
// The guide is a collection diagram, not a surveyed architectural or structural drawing.
const z=(label,x,depth,w,d,color,kind='books')=>({label,x,z:depth,w,d,color,kind});
export const FLOOR_INFO=[
 {n:1,title:'公共服务 · 平面待核对',summary:'新版馆藏分布图未提供一楼平面。本层仅保留借阅服务的概念示意，不声称房间和书架位置已核对。',tags:['借阅服务线索','平面未公开','位置待核对'],color:'#9ab8c1',verified:false,zones:[z('借阅服务示意',0,13,10,4,'#9ab8c1','service')]},
 {n:2,title:'A—F 类馆藏',summary:'按2025版导览图：北侧为A、B、C、D类，南侧以F类经济为主，西侧衔接D、E、F类；中央台阶位于西侧方向。',tags:['北侧 A/B/C/D','南侧 F 经济','西侧 D/E/F'],color:'#c9bf72',verified:true,zones:[
  z('A 马列',-12,-19,9,2,'#d8674e'),z('B 哲学宗教',-12,-14,9,6,'#d9c948'),z('B 哲学宗教',-12,-4,9,5,'#d9c948'),z('C 社科总论',-12,2,9,4,'#d68848'),z('D 政治法律',-12,8,9,6,'#99b95e'),z('D 政治法律',-3,18,16,3,'#99b95e'),z('E 军事',6.8,18,2.5,3,'#b69d65'),z('F 经济',12,-13,9,11,'#67abc0'),z('F 经济',12,4,9,14,'#67abc0'),z('F 经济',11,18,5,3,'#67abc0')]},
 {n:3,title:'G/H/I 类与西侧展区',summary:'按2025版导览图：北侧G文化教育及H语言文字，I文学分布于东、南及北侧西端；儿童图书、教材、工具书在东北侧，西侧为展区。',tags:['北侧 G/H','东南侧 I 文学','东北侧儿童/工具书','西侧展区'],color:'#87b9c5',verified:true,zones:[
  z('儿童/教材/工具书',-12,-19,7,4,'#d7c647'),z('I 文学',-7,-19,3.5,4,'#77b5c9'),z('I 文学',0,-19,4.5,4,'#77b5c9'),z('I 文学',11,-19,7,4,'#77b5c9'),z('G 文化教育',-12,-10,8.5,6,'#91b557'),z('G 文化教育',-12,1,8.5,3,'#91b557'),z('H 语言文字',-12,6,8.5,4.5,'#d96751'),z('I 文学',-12,12.5,8.5,4.5,'#77b5c9'),z('I 文学',12,-10,8.5,6,'#77b5c9'),z('I 文学',12,7,8.5,14,'#77b5c9'),z('西侧展区',0,20,21,4,'#d4c5a0','exhibition')]},
 {n:4,title:'J/K 与自然科学、工程技术',summary:'按2025版导览图：北侧为J艺术与K历史地理，南侧为计算机、工程和技术类；西侧为K/N/O/P-R类，东侧有技术类馆藏及中日文化交流中心。',tags:['北侧 J/K','南侧技术馆藏','西侧 K/N/O/P-R','东侧文化交流'],color:'#aaa6bd',verified:true,zones:[
  z('U—Z 综合/交通',-13,-19,4,3,'#6d9b84'),z('TU/TV 建筑水利',-8,-19,3.5,3,'#83b8c0'),z('TU 建筑科学',0,-20,4.5,3,'#83b8c0'),z('TP/TS 技术',8,-19,4,3,'#83b8c0'),z('中日文化交流中心',14,-19,4.5,3,'#c2c7b2','room'),z('J 艺术',-12,-10,9,9,'#d8cc53'),z('J 艺术',-12,0,9,3,'#d8cc53'),z('K 历史地理',-12,8,9,11,'#c46a68'),z('K 历史地理',-12,20,4,3,'#c46a68'),z('N 自然科学总论',-7.5,20,3,3,'#baa579'),z('O 数理化',-1,20,8,3,'#c48aa3'),z('P—R 天文/生物/医学',8,20,8,3,'#cc9569'),z('TP 计算机',12,-9,9,8,'#83b8c0'),z('TP 计算机',12,0,9,3,'#83b8c0'),z('T—TN 工程技术',12,7,9,7,'#b6b6ad'),z('R—S 医药/农业',12,14,9,2.5,'#c69469')]},
 {n:5,title:'东侧备考联盟与北西侧报刊',summary:'按2025版导览图：备考联盟在东侧；北侧排列报纸、现刊、2019—2024过刊和外文原版书，西侧为2013—2018过刊及2015年至今过报。南侧留白范围未擅自指定用途。',tags:['东侧备考联盟','北侧现刊/外文书','西侧过刊/过报','南侧用途待核对'],color:'#bcae81',verified:true,zones:[
  z('备考联盟区',0,-14,27,15,'#a9bc8b','study'),z('报纸',-12,-3.5,8,2,'#c9be68'),z('现刊',-12,1,8,5,'#d7c757'),z('2019—2024 过刊',-12,6.5,8,5,'#83b7ac'),z('外文原版书 YY/YW',-12,13,8,6,'#759b84'),z('2013—2018 过刊',-5,20,9,3,'#c8966c'),z('2015年至今过报',5,20,9,3,'#84b7c7')]}
];

export 
/* buildLibraryFloors
职责：创建五层内部与结构示意
输入：parent、H、FLOOR_INFO
结果：返回storeys、height=4.8与可选skylight
注意：楼层数组顺序与n-1关联，首层平面未核对。 */
function buildLibraryFloors(parent,H){
 const {group,box,cylinder,material,chair,table}=H,height=4.8,storeys=[];
 
/* slab
职责：按楼层轮廓创建楼板与中庭洞口
输入：楼层info及root
结果：Shape与holes拉伸为楼板Mesh
注意：轮廓和洞口为示意，没有导入CAD或结构计算。 */
function slab(root,info){
  const shape=new THREE.Shape();let pts=[[-18,-22],[18,-22],[18,20],[11,20],[11,22],[-11,22],[-11,20],[-18,20]];
  if(info.n===4)pts=[[-18,-22],[-11,-22],[-11,-23],[-6,-23],[-6,-25],[6,-25],[6,-23],[11,-23],[11,-22],[18,-22],[18,22],[-18,22]];
  if(info.n===5)pts=[[-18,-20],[-14,-20],[-14,-22],[-7,-22],[-7,-24],[7,-24],[7,-22],[14,-22],[14,-20],[18,-20],[18,22],[6,22],[6,24],[-6,24],[-6,22],[-18,22]];
  pts.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  if(info.n>1){const back=({2:-17,3:-11,4:-7,5:-5})[info.n],front=16,w=6.1;const hole=new THREE.Path();hole.moveTo(-w,-back);hole.lineTo(w,-back);hole.lineTo(w,-front);hole.lineTo(-w,-front);hole.closePath();shape.holes.push(hole);}
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.25,bevelEnabled:false});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,material('#e9e4d7'));mesh.position.y=-.1;mesh.name='guide_outline_floor_slab';mesh.receiveShadow=true;root.add(mesh);
 }
 
/* rail
职责：创建栏杆横向构件
输入：位置与宽深
结果：加入上横杆与下横杆
注意：栏杆示意不能当实际高度或安全规范证明。 */
function rail(root,x,z,w,d){box(root,'atrium_rail_top',w,.065,d,x,1.15,z,'#57746a');box(root,'atrium_rail_lower',w,.035,d,x,.65,z,'#688177');}
 
/* rack
职责：组合展示书架
输入：位置、宽度与旋转
结果：背板立柱层板及彩色书组，返回组
注意：书数与图书真实条目不对应，便于看分区。 */
function rack(root,x,z,w=3,rot=0){const r=group(root,'guide_book_rack');r.position.set(x,0,z);r.rotation.y=rot;box(r,'rack_back',w,2.15,.08,0,1.22,-.28,'#bca47f');for(const xx of [-w/2,w/2])box(r,'rack_upright',.08,2.15,.62,xx,1.22,0,'#c7b78e');for(let row=0;row<4;row++){const yy=.23+row*.51;box(r,'shelf',w,.06,.64,0,yy,0,'#baa782');for(let col=0;col<5;col++)box(r,'book_cluster',w/5-.03,.31,.37,-w*.4+col*w/5,yy+.20,.03,['#789587','#ba9c70','#8faab5','#bc8775','#9d99b0'][(row+col)%5]);}return r;}
 
/* furnishZone
职责：按功能区类型填充示意设施
输入：zone中的kind、边界与位置
结果：创建色块、书架或学习/展览/服务对象
注意：自动排数不是现场容量；未知kind走服务示意分支。 */
function furnishZone(root,zone){const g=group(root,'guide_zone_'+zone.label);g.userData.zone=zone.label;box(g,'guide_function_tint',zone.w,.032,zone.d,zone.x,.18,zone.z,zone.color,{transparent:true,opacity:.55});
  if(zone.kind==='books'){
   if(zone.w<4){for(let k=0;k<Math.max(1,Math.floor(zone.d/3));k++)rack(g,zone.x,zone.z+(k-(Math.max(1,Math.floor(zone.d/3))-1)/2)*2.5,Math.min(2.9,zone.w-.5));}
   else{const rows=Math.max(1,Math.floor(zone.d/3.3)),cols=zone.w>12?4:zone.w>7?2:1;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)rack(g,zone.x+(c-(cols-1)/2)*Math.min(3.6,zone.w/cols),zone.z+(r-(rows-1)/2)*2.6,Math.min(2.9,zone.w/cols-.4));}
  }else if(zone.kind==='study'){
   for(const x of [-10,-5,0,5,10])for(const zz of [-18,-12,-7]){table(g,x,zz,3.3,1.1);for(const dx of [-.8,.8]){chair(g,x+dx,zz-.95,0);chair(g,x+dx,zz+.95,Math.PI);}}
  }else if(zone.kind==='exhibition'){
   for(const x of [-7,0,7]){box(g,'west_exhibition_panel',3,1.6,.12,x,1.10,zone.z,'#b2c3b5');box(g,'exhibition_graphic',2.65,1.15,.05,x,1.2,zone.z-.1,'#b49d7f');}
  }else if(zone.kind==='room'){
   box(g,'cultural_room_low_partition',zone.w,.7,.08,zone.x,.5,zone.z-zone.d/2,'#c7d0c1');table(g,zone.x,zone.z,2.5,1.1);chair(g,zone.x,zone.z+1,Math.PI);
  }else{box(g,'service_counter',8,1.03,1.6,zone.x,.7,zone.z,'#b2bdac');for(const x of [-2,0,2])box(g,'service_terminal',.65,.4,.10,x,1.48,zone.z-.3,'#506d62');}
 }
 for(const info of FLOOR_INFO){const f=group(parent,'library_floor_'+info.n);f.position.y=(info.n-1)*height;f.userData={floor:info.n,title:info.title,reference:info.verified?LAYOUT_REFERENCE:'One-floor plan absent from 2025 guide',orientation:'east=-Z; north=-X',surveyed:false};const structural=group(f,'guide_outline_and_frame'),furniture=group(f,'guide_collection_zones');slab(structural,info);
  for(const x of [-18,-6.2,6.2,18])for(const zz of [-20,-10,0,10,20])box(structural,'schematic_column',.4,4.35,.4,x,2.25,zz,'#e0dacb');
  for(const x of [-18,-6.2,6.2,18])box(structural,'schematic_beam',.42,.28,42,x,4.42,0,'#e2ddcd');
  for(const zz of [-20,-10,0,10,20])for(const x of [-12,12])box(structural,'side_gallery_beam',12,.28,.40,x,4.42,zz,'#e2ddcd');
  if(info.n>1){const east=({2:-17,3:-11,4:-7,5:-5})[info.n],length=16-east;for(const x of [-6.05,6.05]){rail(structural,x,(east+16)/2,.06,length);for(let zz=east;zz<16;zz+=2.5)box(structural,'rail_post',.045,1.1,.045,x,.62,zz,'#64796e');}rail(structural,0,16,12,.06);}
  const landingZ=({1:19,2:14,3:9,4:3,5:-3})[info.n];
  if(info.n<5){for(const x of [-4.7,4.7])for(let step=0;step<22;step++){const y=(step+1)*height/22;box(structural,'central_stair_tread',1.45,y,.29,x,y/2,landingZ-step*.265,'#c8c8ba');}
   const shape=new THREE.Shape();shape.moveTo(-3.8,0);shape.absarc(0,0,3.8,Math.PI,0,true);shape.lineTo(-3.8,0);const geo=new THREE.ExtrudeGeometry(shape,{depth:.20,bevelEnabled:false});geo.rotateX(Math.PI/2);const m=new THREE.Mesh(geo,material('#d5d0c0'));m.position.set(0,.2,landingZ);m.name='photo_guided_curved_landing';structural.add(m);}
  // Sanitary/service rooms are at the corners; room labels are shown only where the guide supports them.
  if(info.n>1)for(const x of [-16,16])for(const zz of [-19,20]){box(furniture,'corner_service_room',3.2,.45,3.0,x,.35,zz,'#dae1d7');box(furniture,'service_partition',.07,1.8,3.0,x-1.5,1.03,zz,'#d2d9d0');}
  for(const zone of info.zones)furnishZone(furniture,zone);
  // Seats are illustrative. Keep the centre and unassigned guide areas open.
  if(info.n===2||info.n===3||info.n===4)for(const x of [-8.4,8.4]){table(furniture,x,14.5,1.8,.9);chair(furniture,x,15.4,Math.PI);}
  storeys.push({info,root:f,structural,furniture});
 }
 const skylight=group(parent,'optional_atrium_skylight');skylight.visible=false;skylight.position.y=height*5;
 for(let i=0;i<8;i++){const zz=-13+i*4;const pts=[];for(let n=0;n<=16;n++){const x=-6+n*.75;pts.push(new THREE.Vector3(x,1.5*(1-(x/6)**2),zz));}const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.09,6,false),material('#c8d1c3'));m.name='photo_guided_skylight_frame';skylight.add(m);}
 parent.userData={reference:LAYOUT_REFERENCE,collectionPositions:'2025 published diagram',orientation:'east=-Z; north=-X',surveyedDimensions:false,structuralLayout:'schematic'};
 return {storeys,height,skylight};
}
