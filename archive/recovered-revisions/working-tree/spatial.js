// 平面图、三维模型和路线共用的空间数据。单位仅为模型坐标，未经过现场测绘。
// 座位的编号与使用权来自data.js；此模块只决定如何把相同编号放在示意空间里。
export const FLOOR_HEIGHT=4.8;
// 普通直梯连接一至三楼；扶梯仅一至二楼，弧形小退台仅二至三楼。
// 起止位置是照片关系的模型坐标，尚未用尺量过，不是馆内导航数据。
export const STAIR_LAYOUT={
 1:{kind:'lower',start:19,end:11.5,terraces:false,escalator:true},2:{kind:'lower',start:9.5,end:2,terraces:true,escalator:false},
 3:{kind:'upper',start:-1.2,end:-8.7},4:{kind:'upper',start:-10.7,end:-18.2}
};
// 展板立面为竖幅，平面朝向也沿大厅纵向摆放；rotation供平面图与三维共同读取。
// 从退台侧看：浑仪、白色陶瓷、木雕依次向后，之后是纵向书桌及更后方书架。
export const EXHIBITION_LAYOUT={floor:3,x:0,z:-8,width:14.8,depth:20,
 boards:[-14,-10,-6,-3].flatMap(z=>[-3.3,3.3].map(x=>({x,z,rotation:x<0?Math.PI/2:-Math.PI/2}))),
 ceramics:{x:-.4,z:-6.6},armillary:{x:-.4,z:.4},smallExhibit:{x:0,z:-15.8},
 access:{back:-1,front:1.8},rearSeatingZ:-22.8,rearShelvesZ:-27};
// 一楼相对位置由用户补充：正面左侧靠窗阅览，内部为柜式密集书库，右侧有打印机排。
// 以前台中心x=0为统一中轴；两侧外边界相距相等，不再让一楼和上层宽度不一致。
export const LIBRARY_FOOTPRINT={axisX:0,halfWidth:34.4,front:34,groundBack:-52.6,upperBack:-78.6};
// 2026-10-17本人修订：上层新增后区缩短，一楼不动；保留同一井道后方的有限空间，不强求电梯在数学中点。
// 厕所逐层共用同一组坐标。一楼按此前确认只保留左厕，上层有左右两处；不编造室内洁具。
export const TOILET_LAYOUT=[-1,1].map(side=>({x:side*(LIBRARY_FOOTPRINT.halfWidth-3.4),z:30.75,w:6.5,d:6.2,doorRotation:Math.PI}));
export const GROUND_LAYOUT={windowX:-31.4,deskZ:[-44,-36,-28,-20,-12,-4,4,12],frontZ:34,hallZ:20.5,
 // 右侧柜群放到服务台后；左侧柜群保留。专座区与闭架书库是不同用途。
 // 左侧柜群与窗边桌排一起向后补长；柜数只用于表现空间，不是现场资产清单。
 // 左侧阅览和柜库向后接至上层相同纵深；只延展外形，不虚构真实座号与柜数。
 compactBlocks:[{x:-21.7,z:-17,w:5,d:60},{x:0,z:-16.8,w:7.2,d:50.4}],
 // 本人2026-10-18补充：服务台后的中央黑色区域两侧为柱间实墙，不是敞开的柱廊。
 // 两道墙沿x=±6.2的原柱线连接；前端停在服务台后，保留入口及中庭梯的接近空间。
 partitions:[-6.2,6.2].map(x=>({x,z:-20.6,w:.18,d:63.2})),
 // 密集书库与后部收书室之间保留横向通道；小桌仅为收书区外形，不生成可选座位。
 receivingTables:[-43.8,-47,-50.2].map(z=>({x:-4.6,z,w:1.55,d:.9})),
 // 本人补充：打印和专座向大厅内侧移，原右翼长条区域用于咖啡厅。
 dedicated:{x:13.9,z:-14.75,w:6.4,d:55.5,rows:[-37,-31,-25,-19,-13,-7,-1,5,11]},
 printers:[10.2,12.4,14.6,16.8].map(x=>({x,z:16})),printPoint:{x:13.5,z:18},rightBoundaryZ:LIBRARY_FOOTPRINT.groundBack,
 toilet:TOILET_LAYOUT[0],
 // 咖啡厅在一楼右侧，由本人确认且馆方2026活动通知证实存在；尺寸和陈设只作示意。
 cafe:{x:26.8,z:-8.9,w:11.6,d:49.2,label:'咖啡厅',verifiedUse:true},
 // 房号与用途来自本人最新现场说明；门宽、家具和尺寸均为示意，工作室不参与选座。
 rooms:[{x:26,z:25.3,w:13,d:12.2,label:'107 研讨室',id:'107',staffOnly:false},
        {x:30.8,z:-38.3,w:6.2,d:6.2,label:'106 工作室',id:'106',staffOnly:true},
        {x:2.3,z:-48.6,w:6.8,d:6.4,label:'收书室',id:'receiving',staffOnly:true,bookStorage:true}],
 // 两侧休息组各整体向外移6.2模型单位，让中央入口及两侧楼梯前的直行通道敞开。
 // 每组仍为两张沙发夹一个纵向书架；沙发向入口移，靠在前端墙的馆内一面。
 loungeBackWalls:[-12.1,12.1].map(x=>({x,z:32,w:11.8,d:.18})),
 sofas:[-9.6,-3.7,3.7,9.6].map(x=>({x:x+Math.sign(x)*6.2,z:31.15,rotation:Math.PI})),
 // 竖向小书架向馆内错开，末端与背墙留缝，避免穿墙；横向仍夹在同组两张沙发中间。
 smallShelves:[-6.65,6.65].map(x=>({x:x+Math.sign(x)*6.2,z:30.1,w:3.2,d:.5,rotation:Math.PI/2})),serviceBypass:{x:19.1,z:-41.7}};
// 本人2026-10-16确认左右后沿基本齐平：右翼全深，专座和咖啡厅延长，106后移。
// 末端交通区从专座区的左边线x=10.7横向接至右墙x=34.2：电梯在x=13.9，楼梯在最右端。
// 两者共用一整块白墙交通空间；不是把电梯和楼梯都塞在右墙旁的小盒子里。
// 同一电梯井道不随楼层横向偏移。各层入口的“深处/中部”取决于公共通道的范围。
// 用户现场修订：井道保持在已确认的右墙交通区；各层共用井道中心，一楼黑色门面反向朝右侧通道。
export const ELEVATOR_LAYOUT={x:13.9,z:-44.7,landing:{x:16,z:-44.7},groundRotation:Math.PI/2,groundLanding:{x:16,z:-44.7},facadeScale:2.4,facadeOffset:1.9};
export const elevatorLanding=floor=>ELEVATOR_LAYOUT.landing;
// 一至五楼的白墙交通区共用井道坐标；一楼从专座尽头接入。位置关系由本人补充，墙长、梯宽及踏步均为示意。
// 门前是走廊，另一侧为折返楼梯；门前走廊前后两端都开口，不能把白墙整块当作可穿越的实体盒子。
export const TRANSPORT_CORE={minFloor:1,left:10.7,right:34.2,back:-50.1,front:-43,
 // 右侧外围白墙接到侧墙；入口朝馆内前方走廊，拓宽不在井道外侧再造一个翼部。
 entry:{x:16,z:-43,width:1.6,face:'front'},
 // 电梯门前走廊两端均开口；并非给电梯轿厢另外复制一扇门。
 exits:[{x:16,z:-43,width:1.6,face:'front'},{x:16,z:-50.1,width:1.6,face:'back'}],
 approach:{x:19.1,z:-41.7},corridorX:16,
 stair:{leftX:29.45,rightX:31.15,width:1.4,front:-44.6,back:-49.4,landingBack:-49.95}};
// 一至五楼以前台x=0为中轴共用左右等宽范围；井道逐层对齐，交通区独立贴右墙。
// 交通区位于右翼最外侧，与中庭梯之间保留阅览区域和连续过道。所有数字都是未测绘模型单位。
export function floorBounds(floor){
 const {axisX,halfWidth,groundBack,upperBack}=LIBRARY_FOOTPRINT,left=axisX-halfWidth,right=axisX+halfWidth;
 // 上层后区用较短的示意延伸，保留一楼、电梯坐标和已确认的门前通道；尺寸尚未测量。
 return {left,right,back:floor===1?groundBack:upperBack,front:GROUND_LAYOUT.frontZ};
}
export function floorMapTransform(floor){
 const b=floorBounds(floor),xs=Math.min(12,560/(b.right-b.left)),zs=Math.min(5.4,300/(b.front-b.back));
 return {ox:340-(b.left+b.right)/2*xs,oy:211-(b.back+b.front)/2*zs,xs,zs};
}
// 设施与家具仍读同一份布局，避免三维新增房间后，平面图和漫游遗漏它们。
export function upperFacilities(floor){
 if(floor===1)return {toilets:[],rooms:[],racks:[],lockers:null,culture:null,periodicals:[]};
 // 西端两角；外轮廓贴边，门朝馆内。这里不编造厕所内部或性别分配。
 const b=floorBounds(floor),toilets=TOILET_LAYOUT.map(t=>({...t}));
 // 官方2025图在东端两侧画有连续房间，不能只在楼板末端放两间相同研讨室。
 // 这里画外围房间带的外形分段，未确认当前用途的分段仅标“功能房间”，不编造房号。
 const culture=floor===4?{x:b.right-5,z:b.back+5.5,w:8,d:9,label:'中日文化交流中心',verifiedUse:true}:null;
 const rooms=floor<5?[b.left+4.2,b.right-4.2].flatMap(x=>[b.back+4,b.back+10.5,b.back+17].filter(z=>!(floor===4&&x>0&&z<b.back+14)).map(z=>({x,z,w:6.2,d:5.5,label:floor===3?'研讨 / 功能房间带':'外围功能房间带',verifiedUse:false}))).filter(r=>!(r.x+r.w/2>TRANSPORT_CORE.left-.5&&r.z+r.d/2>TRANSPORT_CORE.back-.5&&r.z-r.d/2<TRANSPORT_CORE.front+.5)&&!(culture&&Math.abs(r.x-culture.x)<(r.w+culture.w)/2+.5&&Math.abs(r.z-culture.z)<(r.d+culture.d)/2+.5)):[];
 const racks=[];
 // 上层电梯后方仍有连续馆藏；不把一楼末端误当成二至五楼末端。
 if(floor<5)for(let z=-55;z>floorBounds(floor).back+7;z-=8)for(const x of [-4.8,0,4.8])racks.push({x,z,w:3.5});
 if(floor<5)for(let z=-54;z>floorBounds(floor).back+22;z-=8)for(const x of [-31.4,31.4])racks.push({x,z,w:4.4});
 const periodicals=floor===5?[
  {x:-27,z:-12,w:10,d:3,label:'报纸',color:'#c9be68'},
  {x:-27,z:-5,w:10,d:6,label:'现刊',color:'#d7c757'},
  {x:-27,z:4,w:10,d:6,label:'2019—2024 过刊',color:'#83b7ac'},
  {x:-27,z:14,w:10,d:8,label:'外文原版书 YY/YW',color:'#759b84'},
  {x:-15.5,z:27,w:15,d:6,label:'2013—2018 过刊',color:'#c8966c'},
  {x:1.5,z:27,w:15,d:6,label:'2015年至今过报',color:'#84b7c7'}]:[];
 for(const area of periodicals){const rows=Math.max(1,Math.floor(area.d/3.3)),cols=area.w>12?4:2;for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)racks.push({x:area.x+(col-(cols-1)/2)*Math.min(3.6,area.w/cols),z:area.z+(row-(rows-1)/2)*2.6,w:2.9,periodical:true});}
 if(floor<5){
  // 前部书架排与背部馆藏带都保留横向通道；不创造未经核验的书架号。
  for(const x of [-8,-3.5,1,5.5,10])for(const z of [23.5,29.5])racks.push({x,z,w:3.5});
  for(const x of [-4.8,0,4.8])for(const z of (floor===3?[-33,-35,-44]:[-26,-35,-44]))racks.push({x,z,w:3.5});
  for(const side of [-1,1])for(const z of [-28,-22,-18,-12,-6,0,6,12,18,24]){
   const x=side*(LIBRARY_FOOTPRINT.halfWidth-3);
   if(x>TRANSPORT_CORE.left&&z>TRANSPORT_CORE.back-.5&&z<TRANSPORT_CORE.front+.5)continue;
   racks.push({x,z,w:4.4});
  }
 }
 // 官方馆藏图把中日文化交流中心放在四楼东南侧。只示意室内家具，不臆造实景装修。
 // 交流中心仍在四楼东侧；模型内为共用交通区让位，不主张测绘坐标。
 return {toilets,rooms,racks,culture,periodicals,lockers:floor===5?{x:(b.left+b.right)/2,z:b.back+.65,w:b.right-b.left-2,d:.75}:null};
}
export function projectFloorPoint(x,z,floor){
 // 根据本层统一边界居中缩放平面；家具、座位状态和路线从同一坐标投影。
 const t=floorMapTransform(floor);return {x:t.ox+x*t.xs,y:t.oy+z*t.zs};
}
export function deskChairPosition(desk,slot){
 // 先算桌内椅位，再按桌子的Y轴旋转投影；桌、椅和俯瞰共用这个函数。
 const x=slot%2?desk.dx:-desk.dx,z=slot<2?-desk.dz:desk.dz,a=desk.rotation||0;
 return {x:desk.x+Math.cos(a)*x+Math.sin(a)*z,z:desk.z-Math.sin(a)*x+Math.cos(a)*z,rotation:(slot<2?0:Math.PI)+a};
}
// 楼板孔洞由平面图和三维共用；三楼保留中央展厅实体地面。
// 二楼和四楼的两块孔洞之间分别留出下部、上部楼梯的中间平台。
export function atriumVoids(floor){
 const ranges=({2:[[-17,9.5],[11.5,16]],3:[[2,16]],4:[[-20,-10.7],[-8.7,16]],5:[[-18.2,16]]})[floor]||[];
 const holes=ranges.map(([back,front])=>({x:0,z:(back+front)/2,w:12.2,d:front-back,back,front}));
 // 折返梯需要穿过上层楼板；不能在梯子上方保留一块实心楼板。
 if(floor>TRANSPORT_CORE.minFloor){const s=TRANSPORT_CORE.stair;holes.push({x:(s.leftX+s.rightX)/2,z:(s.landingBack+s.front)/2,w:3.6,d:s.front-s.landingBack,back:s.landingBack,front:s.front,transport:true});}
 return holes;
}
// 桌椅占地与交通区外扩净空相交时移除外形桌；样本桌位于中庭两侧，不受影响。
function overlapsTransport(d){const c=TRANSPORT_CORE;return d.x+d.w/2+.6>c.left&&d.x-d.w/2-.6<c.right&&d.z+d.dz+.9>c.back&&d.z-d.dz-.9<c.front;}
function extendedUpperDesks(floor,list){
 // 家具只是外形，不增加感知覆盖或真实座号。保留x=7.2和x=正负20.4的后部过道。
 const b=floorBounds(floor),culture=upperFacilities(floor).culture;
 for(let z=-55;z>b.back+5;z-=8)for(const x of (floor===5?[-25,-17,-9,-1,3.8,13,16.8,25,31]:[-23.7,-10.8,10.8,23.7])){
  const d={x,z,w:floor===5?3:5,d:1.65,dx:floor===5?.7:1.15,dz:floor===5?1.2:1.3,sample:null,partition:floor===5,rearExtension:true};
  if(culture&&Math.abs(d.x-culture.x)<(d.w+culture.w)/2+.7&&Math.abs(d.z-culture.z)<culture.d/2+d.dz+.8)continue;
  list.push(d);
 }
 return list;
}
function assignRegionalSamples(floor,list){
 // 四个样本位于北翼、四个位于南翼、四个位于东侧后区；未扩大60个状态样本总数。
 for(const d of list)d.sample=null;
 const choose=(region,x,z)=>list.filter(d=>seatRegionAt(d.x,d.z,floor)===region&&(floor!==5||d.partition)).sort((a,b)=>Math.abs(a.x-x)+Math.abs(a.z-z)-Math.abs(b.x-x)-Math.abs(b.z-z))[0];
 [choose('北',-10.8,0),choose('南',10.8,0),choose('东',-10.8,-55)].forEach((d,i)=>{if(d)d.sample=i;});
 return list;
}
// 2026-10-19本人现场修订：南北翼横向书架成组，东端竖向藏书与阅览边带分开。
// 坐标仅表达相对布局；书架、桌椅和平面图共用这些参数，不据此声称馆内实测数量。
export const READING_BAY_LAYOUT={
 wingRows:[-35,-22,-8,6],rackXs:[16.2,19,21.8,24.6],rackWidth:2.6,
 innerDeskX:10.8,windowDeskX:31.4,deskOffsets:[-2.6,2.6],
 eastRackXs:[-21.8,-15.8,-9.8,-3.8,3.8,9.8,15.8,21.8],eastRackZs:[-69.4,-74.2],eastRackWidth:4.4,
 outerAisleX:27.4,rearAisleX:20.4,eastShelfFront:-67.2
};
function groupedUpperDesks(floor){
 const p=READING_BAY_LAYOUT,list=[];
 const add=(x,z,extra={})=>list.push({x,z,w:5,d:1.65,dx:1.15,dz:1.3,sample:null,partition:false,...extra});
 // 每组书架的内侧、靠窗侧各两张桌子；两桌沿通道排列，不挤到书架之间。
 for(const side of [-1,1])for(const row of p.wingRows)for(const x of [p.innerDeskX,p.windowDeskX])for(const dz of p.deskOffsets){
  const nearExhibition=floor===3&&row===-22&&x===p.innerDeskX;
  add(side*(nearExhibition?13.8:x),row+(nearExhibition?Math.sign(dz)*3:dz),{wingBay:true,baySide:side,bayRow:row,windowBand:x===p.windowDeskX});
 }
 for(const side of [-1,1])for(const x of [p.innerDeskX,p.windowDeskX])add(side*x,20.5,{windowBand:x===p.windowDeskX});
 // 东区桌椅沿中央长方形区域的两边和端部排布；最深处独立留给书架。
 for(const x of [-10.8,10.8])for(const z of [-55.5,-60,-64.5])add(x,z,{eastReadingEdge:true,partition:floor===5});
 for(const x of [-3.5,3.5])for(const z of [-55.5,-63])add(x,z,{eastReadingEdge:true,partition:floor===5});
 if(floor!==4)for(const x of [-23.7,23.7])add(x,-55.5,{eastReadingEdge:true,partition:floor===5});
 if(floor===3){
  // 木雕之后的四张纵向桌继续保留，展厅、楼梯出口和展品位置均不改变。
  for(const x of [-9.6,-3.2,3.2,9.6])add(x,EXHIBITION_LAYOUT.rearSeatingZ,{w:3.6,d:1.2,dz:.86,rotation:Math.PI/2,rearRow:true});
  add(0,-33,{eastReadingEdge:true});
 }
 if(floor===5){
  // 五楼保留大量备考桌及报刊阅览，不把整层替换成普通书库。
  const exam={w:3,d:1.65,dx:.7,dz:1.2,partition:true};
  for(const x of [-17,17])add(x,-55.5,exam);
  for(const x of [-25,-17,17,25])add(x,-62.6,exam);
  for(const x of [-3.8,3.8])for(const z of [-28,-36,-44,-50])add(x,z,exam);
  for(const side of [-1,1])for(const x of [p.innerDeskX,p.windowDeskX])for(const z of [-14.8,13.2])add(side*x,z,{windowBand:x===p.windowDeskX});
  for(const x of [16.8,24])for(const z of [-35,-23.5,-6.8,6])add(x,z,exam);
  for(const x of [-p.innerDeskX,-p.windowDeskX])add(x,-42,{windowBand:x===-p.windowDeskX});
 }
 return assignRegionalSamples(floor,list);
}
export function deskLayouts(floor){
  if(floor===1)return [
   ...GROUND_LAYOUT.deskZ.map(z=>({x:GROUND_LAYOUT.windowX,z,w:4.8,d:1.65,dx:1.15,dz:1.3,sample:[-12,-4,4].includes(z)?[-12,-4,4].indexOf(z):null,partition:false,windowBand:true})),
   // 一楼固定专座以浅色长桌、蓝椅、书立表现。五楼十字挡板改造资料不能证明一楼桌型。
   // 这些椅子只有外形，没有seatId和可用状态，不能被普通选座流程推荐。
   ...[12.3,15.5].flatMap(x=>GROUND_LAYOUT.dedicated.rows.map(z=>({x,z,w:2.6,d:1.4,dx:.65,dz:1.15,sample:null,partition:false,dedicated:true})))
  ];
  return groupedUpperDesks(floor);
}

export function seatPosition(seat,expanded=false){
  // 编号对应实体桌椅模型里的一个椅子位置，而不是独立悬空点。
  const index=Number(seat.id.split('-')[1])-1;
  const desk=deskLayouts(seat.floor).find(d=>d.sample===Math.floor(index/4)),slot=index%4;
  const p=deskChairPosition(desk,slot);return {x:p.x,y:(seat.floor-1)*(expanded?9:FLOOR_HEIGHT)+0.5,z:p.z,floor:seat.floor};
}
export function mapPosition(seat){
  // SVG从同一个模型坐标投影，缩放与平移只影响画面，不改变座位编号和状态。
  const p=seatPosition(seat);return projectFloorPoint(p.x,p.z,seat.floor);
}
export function nodePosition(node,seats,expanded=false){
  const seat=seats.find(s=>s.node===node);if(seat)return seatPosition(seat,expanded);
  let floor=1,x=7,z=17;
  if(node==='entry'){x=0;z=GROUND_LAYOUT.frontZ-2;}
  else if(node==='print'){({x,z}=GROUND_LAYOUT.printPoint);}
  else if(/^elevator[1-5]$/.test(node)){floor=Number(node.slice(-1));({x,z}=elevatorLanding(floor));}
  else if(/^hall[1-5]$/.test(node)){floor=Number(node.slice(-1));if(floor===1)z=GROUND_LAYOUT.hallZ;}
  else if(/^books[1-5]$/.test(node)){
    floor=Number(node.slice(-1));x=floor===5?-13.4:13.4;
    z=({1:13,2:-13,3:7,4:-9,5:21})[floor];
  }else return null;
  return {x,y:(floor-1)*(expanded?9:FLOOR_HEIGHT)+0.5,z,floor};
}
export function routePoints(path,seats,expanded=false){
  // 将通道图的节点序列转成示意折线。两侧之间先经z=17的公共连廊，避开中央孔洞。
  // 跨层折线只是图中的连接示意，不宣称这里就是实际电梯或楼梯的位置。
  const points=[];
  const add=p=>{const last=points.at(-1);if(!last||last.x!==p.x||last.y!==p.y||last.z!==p.z)points.push(p);};
  for(const node of path){
    const b=nodePosition(node,seats,expanded);if(!b)return [];
    const a=points.at(-1);if(!a){add(b);continue;}
    if(a.floor!==b.floor){
      if(node.startsWith('elevator')){add({...a,x:ELEVATOR_LAYOUT.x,z:ELEVATOR_LAYOUT.z});add({...b,x:ELEVATOR_LAYOUT.x,z:ELEVATOR_LAYOUT.z});}
      else{add({...a,x:7,z:17});add({...b,x:7,z:17});}
    }
    else if(node.startsWith('elevator')||Math.abs(a.x-elevatorLanding(a.floor).x)<.01&&Math.abs(a.z-elevatorLanding(a.floor).z)<.01){
      // 沿右侧通道接近电梯，不从密集书库或阅览桌中间横穿。
      const hallway=a.floor===1?GROUND_LAYOUT.hallZ:17,outsideX=a.floor===1?TRANSPORT_CORE.approach.x:READING_BAY_LAYOUT.outerAisleX,entryZ=TRANSPORT_CORE.approach.z;
      // 一楼从专座后方进入；上层穿过白墙前门，再在门前走廊转向电梯，避开折返梯。
      if(node.startsWith('elevator')){add({...a,z:hallway});add({...a,x:outsideX,z:hallway});add({...b,x:outsideX,z:entryZ});add({...b,z:entryZ});}
      else{add({...a,z:entryZ});add({...a,x:outsideX,z:entryZ});add({...b,x:outsideX,z:hallway});add({...b,z:hallway});}
    }
    else if(a.floor===5&&(Math.abs(a.x)<6.1||Math.abs(b.x)<6.1)){
      // 五楼东侧备考示例位于孔洞以东；先沿侧边通道到该排，再横向进入，不能穿孔洞。
      if(Math.abs(a.x)<6.1)add({...a,x:7});
      if(Math.abs(b.x)<6.1)add({...b,x:7});else add({...a,x:7,z:b.z});
    }
    else if(a.x*b.x<0){const corridor=a.floor===1?GROUND_LAYOUT.hallZ:17;add({...a,z:corridor});add({...b,z:corridor});}
    else if(Math.abs(a.x)>7.01){add({...a,x:Math.sign(a.x)*7});add({...b,x:Math.sign(b.x)*7});}
    else if(a.x!==b.x&&a.z!==b.z)add({...a,z:b.z});
    add(b);
  }
  return points;
}
// 按本人确认的平面方向命名：左北、右南、上东。编号来自模型，实际馆内逐座对照尚未取得。
const floorSeatLabelCache=new Map();
export function seatRegionAt(x,z,floor=2){return floor>1&&z<TRANSPORT_CORE.back-2?'东':x<0?'北':'南';}
export function floorSeatRecords(floor){
 if(floorSeatLabelCache.has(floor))return floorSeatLabelCache.get(floor);
 const records=[];
 for(const d of deskLayouts(floor))for(let slot=0;slot<4;slot++){
  const p=deskChairPosition(d,slot);records.push({...p,region:seatRegionAt(p.x,p.z,floor),dedicated:!!d.dedicated,
   id:d.sample===null?null:`S${floor}-${String(d.sample*4+slot+1).padStart(2,'0')}`});
 }
 for(const region of ['北','南','东'])records.filter(r=>r.region===region).sort((a,b)=>a.z-b.z||a.x-b.x).forEach((r,i)=>r.label=region+(i+1));
 floorSeatLabelCache.set(floor,records);return records;
}
export function physicalSeatLabel(floor,x,z){return floorSeatRecords(floor).find(p=>Math.abs(p.x-x)<.001&&Math.abs(p.z-z)<.001)?.label||seatRegionAt(x,z,floor)+'区';}
export function seatLabel(value,withFloor=false){
 const id=typeof value==='string'?value:value?.id,m=/^S([1-5])-(\d{2})$/.exec(id||'');
 if(!m)return String(id||'');const n=Number(m[2]);if(n<1||n>12)return id;
 const name=floorSeatRecords(Number(m[1])).find(r=>r.id===id)?.label||id;return withFloor?m[1]+'F · '+name:name;
}
export function readableNode(node){
  if(node==='entry')return '1F入口';if(node==='print')return '1F打印点';
  if(node.startsWith('elevator'))return node.slice(-1)+'F电梯入口';
  if(node.startsWith('hall'))return node.slice(-1)+'F通道';
  if(node.startsWith('books'))return node.slice(-1)+'F取书点';
  return seatLabel(node.replace(/^seat/,''),true);
}
export function acceptSnapshot(raw,knownIds){
  // postMessage只接收有限结构数据；不接受HTML、脚本、图片或新增的任意座位编号。
  if(!raw||!Array.isArray(raw.seats)||raw.seats.length!==knownIds.length)return null;
  const seen=new Set(),seats=[];
  for(const s of raw.seats){
    if(!knownIds.includes(s.id)||seen.has(s.id)||!Number.isInteger(s.floor)||s.floor<1||s.floor>5)return null;
    if(s.id.slice(1,2)!==String(s.floor))return null;
    if(!['free','mine','reserved','away'].includes(s.booking)||!['ordinary','exclusive'].includes(s.policy))return null;
    if(!['clear','occupied','items','unknown'].includes(s.observed))return null;
    seen.add(s.id);seats.push({...s});
  }
  return {seats,prefs:raw.prefs&&typeof raw.prefs==='object'?{...raw.prefs}:{},selected:seen.has(raw.selected)?raw.selected:null,
    floor:Number.isInteger(raw.floor)&&raw.floor>=1&&raw.floor<=5?raw.floor:4};
}
