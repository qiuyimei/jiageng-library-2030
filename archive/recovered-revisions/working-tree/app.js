import {STATE,classify,recommend,summarize,reserveDemo,recheck} from './engine.js';
import {makeData,setScenario,RESOURCES,FLOOR_NAMES,SOURCES} from './data.js';
import {nodePosition,routePoints,readableNode,seatLabel,deskLayouts,deskChairPosition,atriumVoids,EXHIBITION_LAYOUT,GROUND_LAYOUT,ELEVATOR_LAYOUT,TRANSPORT_CORE,floorMapTransform,floorBounds,upperFacilities} from './spatial.js';
// document 是网页文档；通过 id 查找元素，让脚本和页面控件连接起来。
const $=id=>document.getElementById(id);
let data=makeData(Date.now()), floor=4, selected=null, plan=null;
// createElement/textContent 用来显示数据，避免把用户输入作为HTML执行。
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function prefs(){return {resource:$('resource').value,power:$('power').checked,window:$('window').checked,
 quiet:$('quiet').checked,accessible:$('accessible').checked,print:$('print').checked,
 floor:Number($('floorFilter').value),priority:$('priority').value};}
function notify(text){$('notice').textContent=text;}
function drawSummary(){
 $('floors').replaceChildren();
 for(const row of summarize(data.seats,Date.now())){
   const b=el('button',undefined,'floor-card'+(row.floor===floor?' active':''));
   b.append(el('strong',row.floor+'F'),el('span',FLOOR_NAMES[row.floor-1]),
     el('b',`${row.candidate} 个模拟候选`),el('small',`有人 ${row.occupied} · 保留 ${row.protected} · 待核对 ${row.unknown}`));
   b.setAttribute('aria-pressed',String(row.floor===floor));b.onclick=()=>{floor=row.floor;draw();};$('floors').append(b);
 }
}
function svg(tag,attrs,text){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs||{}))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
function drawMap(){
 $('mapTitle').textContent=`${floor}F ${FLOOR_NAMES[floor-1]}`;
 const map=$('map');map.replaceChildren();const {ox,oy,xs,zs:ys}=floorMapTransform(floor),bounds=floorBounds(floor);
 map.append(svg('rect',{x:20,y:20,width:640,height:390,rx:18,fill:'#faf7ef',stroke:'#d4d9cb'}));
 map.append(svg('text',{x:35,y:48,fill:'#64766b','font-size':15},'模拟座位平面  非实际坐标  不用于真实导航'));
 const contour=[[bounds.left,bounds.back],[bounds.right,bounds.back],[bounds.right,bounds.front],[bounds.left,bounds.front]];
 map.append(svg('polygon',{points:contour.map(([x,z])=>`${ox+x*xs},${oy+z*ys}`).join(' '),fill:'#e9e4d7',stroke:'#b6c4b7'}));
 if(floor!==1){
  const facilities=upperFacilities(floor);
  for(const area of facilities.periodicals){map.append(svg('rect',{x:ox+(area.x-area.w/2)*xs,y:oy+(area.z-area.d/2)*ys,width:area.w*xs,height:area.d*ys,fill:area.color,opacity:.4}));map.append(svg('text',{x:ox+area.x*xs,y:oy+(area.z+area.d/2+.8)*ys,'text-anchor':'middle','font-size':9,fill:'#3e6258'},area.label));}
  for(const r of facilities.racks)map.append(svg('rect',{x:ox+(r.x-r.w/2)*xs,y:oy+(r.z-.34)*ys,width:r.w*xs,height:.68*ys,fill:'#674f46'}));
  for(const r of [...facilities.toilets.map(r=>({...r,label:'WC'})),...facilities.rooms.map(r=>({...r,label:'房间带'})),...(facilities.culture?[facilities.culture]:[])]){
   map.append(svg('rect',{x:ox+(r.x-r.w/2)*xs,y:oy+(r.z-r.d/2)*ys,width:r.w*xs,height:r.d*ys,fill:'#d3ded6',stroke:'#668579'}));
   map.append(svg('text',{x:ox+r.x*xs,y:oy+r.z*ys,'text-anchor':'middle',fill:'#355e50','font-size':10},r.label));
  }
  if(facilities.lockers){const l=facilities.lockers;map.append(svg('rect',{x:ox+(l.x-l.w/2)*xs,y:oy+(l.z-l.d/2)*ys,width:l.w*xs,height:l.d*ys,fill:'#91aba2'}));map.append(svg('text',{x:ox+l.x*xs,y:oy+(l.z+2)*ys,'text-anchor':'middle','font-size':10,fill:'#355e50'},'后墙连续存包柜（柜数示意）'));}
 }
 else{
  // 一楼窗边为蓝椅阅览带，内部柜式密集书库不生成可预约座位编号。
  map.append(svg('line',{x1:ox+(bounds.left+.15)*xs,y1:oy+(bounds.back+.5)*ys,x2:ox+(bounds.left+.15)*xs,y2:oy+(bounds.front-.5)*ys,stroke:'#5ba6bf','stroke-width':4}));
  for(const c of [GROUND_LAYOUT.cafe,...GROUND_LAYOUT.rooms]){
   map.append(svg('rect',{x:ox+(c.x-c.w/2)*xs,y:oy+(c.z-c.d/2)*ys,width:c.w*xs,height:c.d*ys,fill:c.id?'#ccd6cd':'#dcc7a8',stroke:'#967959'}));
   map.append(svg('text',{x:ox+c.x*xs,y:oy+c.z*ys,'text-anchor':'middle',fill:'#705942','font-size':10},c.label));
  }
  // 与三维共用柱间墙和沙发背墙，平面图不能仍把已经隔开的区域画成开放柱廊。
  for(const w of [...GROUND_LAYOUT.partitions,...GROUND_LAYOUT.loungeBackWalls])map.append(svg('rect',{x:ox+(w.x-w.w/2)*xs,y:oy+(w.z-w.d/2)*ys,width:Math.max(2,w.w*xs),height:Math.max(2,w.d*ys),fill:'#a2ada4'}));
  for(const t of GROUND_LAYOUT.receivingTables)map.append(svg('rect',{x:ox+(t.x-t.w/2)*xs,y:oy+(t.z-t.d/2)*ys,width:t.w*xs,height:t.d*ys,fill:'#bd9567',stroke:'#987348'}));
  for(const b of GROUND_LAYOUT.compactBlocks){
   map.append(svg('rect',{x:ox+(b.x-b.w/2)*xs,y:oy+(b.z-b.d/2)*ys,width:b.w*xs,height:b.d*ys,fill:'#ccd2d1',stroke:'#879393'}));
   for(let i=0;i<4;i++)map.append(svg('line',{x1:ox+(b.x-b.w/2+b.w*i/4)*xs,y1:oy+(b.z-b.d/2)*ys,x2:ox+(b.x-b.w/2+b.w*i/4)*xs,y2:oy+(b.z+b.d/2)*ys,stroke:'#929e9c'}));
   const rows=Math.floor(b.d/6);for(let i=1;i<rows;i++)map.append(svg('line',{x1:ox+(b.x-b.w/2)*xs,y1:oy+(b.z-b.d/2+b.d*i/rows)*ys,x2:ox+(b.x+b.w/2)*xs,y2:oy+(b.z-b.d/2+b.d*i/rows)*ys,stroke:'#7f8f91'}));
   map.append(svg('text',{x:ox+b.x*xs,y:oy+b.z*ys,'text-anchor':'middle',fill:'#425550','font-size':11},'密集书库'));
  }
  const t=GROUND_LAYOUT.toilet;
  map.append(svg('rect',{x:ox+(t.x-t.w/2)*xs,y:oy+(t.z-t.d/2)*ys,width:t.w*xs,height:t.d*ys,fill:'#ccd8d2',stroke:'#6f8a7d'}));
  map.append(svg('text',{x:ox+t.x*xs,y:oy+t.z*ys,'text-anchor':'middle',fill:'#3e6258','font-size':10},'WC'));
  map.append(svg('line',{x1:ox+(t.x-.525)*xs,y1:oy+(t.z-t.d/2)*ys,x2:ox+(t.x+.525)*xs,y2:oy+(t.z-t.d/2)*ys,stroke:'#325e55','stroke-width':4}));
  for(const p of GROUND_LAYOUT.sofas){map.append(svg('rect',{x:ox+(p.x-1.65)*xs,y:oy+(p.z-.63)*ys,width:3.3*xs,height:1.26*ys,fill:'#e0dbc9',stroke:'#76563e'}));map.append(svg('line',{x1:ox+(p.x-1.5)*xs,y1:oy+(p.z+.52)*ys,x2:ox+(p.x+1.5)*xs,y2:oy+(p.z+.52)*ys,stroke:'#76563e','stroke-width':3}));}
  for(const rack of GROUND_LAYOUT.smallShelves){
  const rw=Math.abs(Math.cos(rack.rotation))*rack.w+Math.abs(Math.sin(rack.rotation))*rack.d,rd=Math.abs(Math.sin(rack.rotation))*rack.w+Math.abs(Math.cos(rack.rotation))*rack.d;
  map.append(svg('rect',{x:ox+(rack.x-rw/2)*xs,y:oy+(rack.z-rd/2)*ys,width:rw*xs,height:rd*ys,fill:'#76563e'}));
  }
  map.append(svg('text',{x:ox,y:oy+29*ys,'text-anchor':'middle',fill:'#6c7e70','font-size':11},'前厅 · 沙发与小书架'));
  map.append(svg('text',{x:ox+GROUND_LAYOUT.dedicated.x*xs,y:oy+GROUND_LAYOUT.dedicated.z*ys,'text-anchor':'middle',fill:'#64607b','font-size':10},'固定专座（资格按馆方规则）'));
  for(const p of GROUND_LAYOUT.printers)map.append(svg('rect',{x:ox+(p.x-.725)*xs,y:oy+(p.z-.6)*ys,width:1.45*xs,height:1.2*ys,fill:'#859093',stroke:'#56636a'}));
  map.append(svg('text',{x:ox+GROUND_LAYOUT.printPoint.x*xs,y:oy+(GROUND_LAYOUT.printPoint.z+2)*ys,'text-anchor':'middle',fill:'#53665d','font-size':10},'打印机排（数量示意）'));
  map.append(svg('line',{x1:ox+TRANSPORT_CORE.left*xs,y1:oy+GROUND_LAYOUT.rightBoundaryZ*ys,x2:ox+TRANSPORT_CORE.right*xs,y2:oy+GROUND_LAYOUT.rightBoundaryZ*ys,stroke:'#6d7772','stroke-width':3}));
  map.append(svg('text',{x:ox+(TRANSPORT_CORE.left+TRANSPORT_CORE.right)/2*xs,y:oy+(GROUND_LAYOUT.rightBoundaryZ-1)*ys,'text-anchor':'middle',fill:'#53665d','font-size':9},'本馆边界'));
 }
 // 同一竖直井道：一楼处于右侧公共通道深处，上层处于右侧中部。
 if(floor>=TRANSPORT_CORE.minFloor){
  const c=TRANSPORT_CORE,s=c.stair;
  map.append(svg('rect',{x:ox+c.left*xs,y:oy+c.back*ys,width:(c.right-c.left)*xs,height:(c.front-c.back)*ys,fill:'#e8e8df',stroke:'#657874','stroke-width':2}));
  for(const exit of c.exits)map.append(svg('line',{x1:ox+(exit.x-exit.width/2)*xs,y1:oy+exit.z*ys,x2:ox+(exit.x+exit.width/2)*xs,y2:oy+exit.z*ys,stroke:'#faf7ef','stroke-width':5}));
  for(const x of [s.leftX,s.rightX]){map.append(svg('rect',{x:ox+(x-s.width/2)*xs,y:oy+s.back*ys,width:s.width*xs,height:(s.front-s.back)*ys,fill:'#b4bcbc',stroke:'#667776'}));for(let i=0;i<10;i++)map.append(svg('line',{x1:ox+(x-s.width/2)*xs,y1:oy+(s.back+(s.front-s.back)*i/10)*ys,x2:ox+(x+s.width/2)*xs,y2:oy+(s.back+(s.front-s.back)*i/10)*ys,stroke:'#60706f'}));}
  map.append(svg('text',{x:ox+(c.left+c.right)/2*xs,y:oy+(c.back-.6)*ys,'text-anchor':'middle',fill:'#506963','font-size':9},'靠右侧墙 · 独立交通区'));
 }
 map.append(svg('rect',{x:ox+(ELEVATOR_LAYOUT.x-1.4)*xs,y:oy+(ELEVATOR_LAYOUT.z-ELEVATOR_LAYOUT.facadeOffset-1.35*ELEVATOR_LAYOUT.facadeScale)*ys,width:2.8*xs,height:2.7*ELEVATOR_LAYOUT.facadeScale*ys,fill:'#809694',stroke:'#3b625c'}));
 map.append(svg('line',{x1:ox+ELEVATOR_LAYOUT.x*xs,y1:oy+ELEVATOR_LAYOUT.z*ys,x2:ox+(ELEVATOR_LAYOUT.x+2)*xs,y2:oy+ELEVATOR_LAYOUT.z*ys,stroke:'#f4e8b8','stroke-width':3}));
 map.append(svg('text',{x:ox+ELEVATOR_LAYOUT.x*xs,y:oy+(ELEVATOR_LAYOUT.z+.3)*ys,'text-anchor':'middle',fill:'#fff','font-size':9},'电梯'));
 for(const hole of atriumVoids(floor))map.append(svg('rect',{x:ox+(hole.x-hole.w/2)*xs,y:oy+(hole.z-hole.d/2)*ys,width:hole.w*xs,height:hole.d*ys,rx:1,fill:hole.transport?'none':'#faf7ef',stroke:'#57746a'}));
 if(floor===3){
  const hall=EXHIBITION_LAYOUT;
  map.append(svg('rect',{x:ox-hall.width*xs/2,y:oy+(hall.z-hall.depth/2)*ys,width:hall.width*xs,height:hall.depth*ys,fill:'#d8e1de',stroke:'#849b94'}));
  for(const board of hall.boards)map.append(svg('rect',{x:ox+board.x*xs-2,y:oy+board.z*ys-5,width:4,height:10,fill:'#4d8aaa'}));
  for(const side of [-1,1])map.append(svg('rect',{x:ox+(side*4.95-1.15)*xs,y:oy+EXHIBITION_LAYOUT.access.back*ys,width:2.3*xs,height:(EXHIBITION_LAYOUT.access.front-EXHIBITION_LAYOUT.access.back)*ys,fill:'#dadcd1'}));
  for(const [name,p]of [['浑仪',hall.armillary],['陶瓷',hall.ceramics],['木雕',hall.smallExhibit]]){map.append(svg('circle',{cx:ox+p.x*xs,cy:oy+p.z*ys,r:5,fill:'#ad7358'}));map.append(svg('text',{x:ox+6+p.x*xs,y:oy+p.z*ys,fill:'#5a6050','font-size':9},name));}
  map.append(svg('text',{x:291,y:204,fill:'#425d64','font-size':11},'3F中央展厅'));
 }
 map.append(svg('text',{x:295,y:62,fill:'#64766b','font-size':13},'中庭/通道示意'));
 map.append(svg('text',{x:70,y:395,fill:'#766345','font-size':13},floor===1?'一楼前厅、专座与设施示意 · 编号与三维共用':'两侧馆藏参考区 · 与三维使用同一座位编号'));
 for(const desk of deskLayouts(floor)){
   const x=ox+desk.x*xs,y=oy+desk.z*ys;
   const a=desk.rotation||0,w=Math.abs(Math.cos(a))*desk.w+Math.abs(Math.sin(a))*desk.d,d=Math.abs(Math.sin(a))*desk.w+Math.abs(Math.cos(a))*desk.d;
   map.append(svg('rect',{x:x-w*xs/2,y:y-d*ys/2,width:w*xs,height:d*ys,rx:2,fill:'#d5c8a8',stroke:'#a9987a'}));
   if(desk.partition)map.append(svg('line',{x1:x-desk.w*xs/2,y1:y,x2:x+desk.w*xs/2,y2:y,stroke:'#576e77','stroke-width':2}));
   if(desk.sample===null)for(let j=0;j<4;j++){const p=deskChairPosition(desk,j);map.append(svg('circle',{cx:ox+p.x*xs,cy:oy+p.z*ys,r:5,fill:'#247796'}));}
 }
 for(const seat of data.seats.filter(s=>s.floor===floor)){
   const state=classify(seat,Date.now()),meta=STATE[state.kind],rank=plan?.items.find(i=>i.seat.id===seat.id)?.rank,g=svg('g',{role:'button',tabindex:0,'aria-label':`${seatLabel(seat,true)} ${rank?'第'+rank+'优先 ':''}${meta.label} ${state.reason}`});
   if(rank)g.append(svg('circle',{cx:seat.x,cy:seat.y,r:12,fill:'#f9cf67',opacity:.48,'pointer-events':'none'}));
   g.append(svg('circle',{cx:seat.x,cy:seat.y,r:7,fill:meta.color,stroke:selected===seat.id?'#e4b33b':'#ffffff','stroke-width':selected===seat.id?4:1}));
   if(rank)g.append(svg('text',{x:seat.x,y:seat.y+3.2,'text-anchor':'middle','font-size':9,fill:'#fff','font-weight':700,'pointer-events':'none'},String(rank)));
   const upper=(Number(seat.id.slice(-2))-1)%4<2;
   const rightSlot=(Number(seat.id.slice(-2))-1)%2===1;
   g.append(svg('text',{x:seat.x+(rightSlot?3:-3),y:seat.y+(upper?-10:17),fill:'#263e37','font-size':8.5,'font-weight':700,'text-anchor':rightSlot?'start':'end'},seatLabel(seat)));
   const choose=()=>{selected=seat.id;draw();};g.addEventListener('click',choose);
   g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();choose();}});map.append(g);
 }
 const item=plan?.items.find(i=>i.seat.id===selected);
 if(item){
   const points=routePoints(item.trip.path,data.seats);
   // 只画本层的连廊折线；跨层连接保留在文字路线和五层三维整体中。
   for(let i=1;i<points.length;i++)if(points[i-1].floor===floor&&points[i].floor===floor)
     map.append(svg('line',{x1:ox+points[i-1].x*xs,y1:oy+points[i-1].z*ys,x2:ox+points[i].x*xs,y2:oy+points[i].z*ys,stroke:'#d4a433','stroke-width':3,'pointer-events':'none'}));
 }
 for(const node of [plan?.source?.mode==='shelf'?plan.source.node:null,prefs().print?'print':null]){
   if(!node)continue;const p=nodePosition(node,data.seats);if(p.floor!==floor)continue;
   map.append(svg('circle',{cx:ox+p.x*xs,cy:oy+p.z*ys,r:8,fill:node==='print'?'#956daf':'#3c87aa'}));
   map.append(svg('text',{x:ox+10+p.x*xs,y:oy+p.z*ys,fill:'#263e37','font-size':11},readableNode(node)));
 }
}
function drawSeatBoard(){
 // 这张表与推荐卡、平面和三维读同一组编号。发光只表示本次推荐，不代表锁座或实体灯具。
 const out=$('seatBoard');out.replaceChildren();
 const ranks=new Map((plan?.items||[]).map(item=>[item.seat.id,item.rank]));
 $('boardStatus').textContent=plan?.items.length?`本次亮起 ${plan.items.length} 个优先位置。数字表示当前需求的排序，点击查看理由与路线。`:'当前没有有效推荐，优先灯已熄灭。调整需求并生成，或核对数据。';
 for(let n=1;n<=5;n++){
  const row=el('section',undefined,'seat-board-row');row.append(el('strong',n+'F'));
  const chairs=el('div',undefined,'seat-board-chairs');
  for(const seat of data.seats.filter(s=>s.floor===n)){
   const state=classify(seat,Date.now()),rank=ranks.get(seat.id),b=el('button',undefined,'seat-light'+(rank?' ranked rank-'+rank:'')+(selected===seat.id?' chosen':''));
   b.dataset.seat=seat.id;b.dataset.rank=rank?String(rank):'';b.dataset.state=state.kind;
   b.setAttribute('aria-label',`${seatLabel(seat,true)} ${rank?'第'+rank+'优先，':''}${STATE[state.kind].label}，${state.reason}`);b.setAttribute('aria-pressed',String(selected===seat.id));
   b.append(el('b',rank?'第'+rank+'优先':STATE[state.kind].label),el('span',seatLabel(seat)));
   b.onclick=()=>{selected=seat.id;floor=seat.floor;draw();};chairs.append(b);
  }
  row.append(chairs);out.append(row);
 }
}
function drawDetail(){
 const out=$('seatDetail');out.replaceChildren();
 if(!selected){out.append(el('p','点击座位，查看观测与使用权为什么会得出这个状态。'));return;}
 const seat=data.seats.find(s=>s.id===selected),state=recheck(data.seats,selected,Date.now());
 out.append(el('h3',`${seatLabel(seat,true)} · ${STATE[state.kind].label}`),el('p',state.reason));
 out.append(el('small',`观测：${seat.observed} · 规则：${seat.booking} · 来源：演示或本机测试导入`));
 out.append(el('small',`观测时间：${new Date(seat.obsAt).toLocaleTimeString()}；规则时间：${new Date(seat.rulesAt).toLocaleTimeString()}。两种记录分别核对。`));
 if(state.kind==='candidate'){
   const b=el('button','确认模拟预约','primary');b.onclick=()=>{
     const result=reserveDemo(data.seats,selected,Date.now());notify(result.message);plan=null;draw();generate();
   };out.append(b);
 }
 if(seat.booking==='mine'){
   const b=el('button','释放本次模拟预约');b.onclick=()=>{seat.booking='free';plan=null;draw();generate();notify('模拟预约已释放。没有操作真实座位系统。');};out.append(b);
 }
 out.append(el('p','真实座位须通过馆方系统办理。本页按钮只修改本页假数据。','small'));
}
function drawResults(){
 const out=$('results');out.replaceChildren();$('download').disabled=!plan;
 if(!plan){out.append(el('p','设置本次需求后生成候选。必须条件变化时，旧候选自动清除。','muted'));return;}
 for(const warning of plan.warnings)out.append(el('p',warning,'warning'));
 plan.items.forEach((item,index)=>{
   const card=el('article',undefined,'result');
   card.append(el('h3',`${index+1}. ${seatLabel(item.seat,true)}`));
   for(const r of item.reasons)card.append(el('p','✓ '+r));
   for(const t of item.tradeoffs)card.append(el('p','取舍：'+t,'muted'));
   card.append(el('small','推荐不等于锁座；路线是模拟通道的计算结果。'));
   const b=el('button','在座位图中查看');b.onclick=()=>{floor=item.seat.floor;selected=item.seat.id;draw();$('map').scrollIntoView?.({behavior:'smooth',block:'center'});};card.append(b);out.append(card);
 });
}
function sendModel(){
 const frame=$('modelFrame');if(!$('modelPanel').hidden&&frame.dataset.loaded==='1'&&frame.contentWindow)frame.contentWindow.postMessage({type:'zhizuo-state',seats:data.seats,prefs:prefs(),selected,floor,generated:!!plan},'*');
}
function draw(){drawSummary();drawSeatBoard();drawMap();drawDetail();drawResults();
 const item=plan?.items.find(i=>i.seat.id===selected);
 $('route').textContent=item?'本次模拟任务路线：'+item.trip.path.map(readableNode).join(' → '):selected?'此位置不在当前候选中；请核对状态或重新生成。':'选择候选后，平面和三维将显示同一条任务路线。';
 sendModel();
}
function generate(){plan=recommend(data.seats,prefs(),data.graph,RESOURCES,Date.now());
 if(!selected&&plan.items.length){selected=plan.items[0].seat.id;floor=plan.items[0].seat.floor;}
 draw();}
for(const resource of RESOURCES){const o=el('option',resource.title);o.value=resource.id;$('resource').append(o);}
$('resource').value='software';$('print').checked=true;
$('form').addEventListener('submit',e=>{e.preventDefault();generate();notify('候选已更新。数据与书目均为模拟，当前没有馆内实时接口。');});
for(const id of ['resource','power','window','quiet','accessible','print','floorFilter','priority'])$(id).addEventListener('change',()=>{plan=null;draw();});
$('scenario').onchange=()=>{
 const name=$('scenario').value;
 if(name==='normal'){data=makeData(Date.now());selected=null;}
 else setScenario(data,name,Date.now(),selected);
 plan=null;draw();generate();notify('已切换人为设置的演示情境：'+$('scenario').selectedOptions[0].textContent);
};
$('recheck').onclick=()=>{
 // 刷新并不会将过期观测改成新观测；只有新输入才能改变观测时间。
 const state=selected?recheck(data.seats,selected,Date.now()):null;
 generate();draw();notify(state?state.reason:'已重新计算。没有伪造摄像头或预约系统的新数据。');
};
$('clear').onclick=()=>{data=makeData(Date.now());plan=null;selected=null;$('scenario').value='normal';$('route').textContent='';draw();notify('演示已重置；所有输入仅在本页内存中。');};
$('modelTab').onclick=()=>{
 $('modelPanel').hidden=!$('modelPanel').hidden;
 const frame=$('modelFrame');
 if(!$('modelPanel').hidden){if(frame.dataset.loaded!=='1'){frame.dataset.loaded='1';frame.src='建筑与五层展示.html';}sendModel();$('modelPanel').scrollIntoView?.({behavior:'smooth',block:'start'});}
 else{frame.dataset.loaded='0';frame.src='about:blank';}
};
$('sendFloor').onclick=()=>{
 sendModel();
};
$('modelFrame').addEventListener('load',sendModel);
// 平面选座默认不加载三维；需要时由用户展开，收起即卸载，避免后台继续绘制。
$('modelPanel').hidden=true;$('modelFrame').dataset.loaded='0';
// 只有自己的iframe能返回座位选择；编号必须已存在于本页数据，不接受外部窗口的指令。
window.addEventListener('message',event=>{
 if(event.source!==$('modelFrame').contentWindow)return;
 if(event.data?.type==='zhizuo-ready'){sendModel();return;}
 if(event.data?.type!=='zhizuo-select')return;
 const s=data.seats.find(s=>s.id===event.data.id);if(s){selected=s.id;floor=s.floor;draw();}
});
$('download').onclick=()=>{
 if(!plan)return;
 const text=['嘉庚知座本次演示任务卡','数据、书目、座位及路线均为模拟；非实际预约。',
  RESOURCES.find(r=>r.id===prefs().resource).title,...plan.warnings,
  ...plan.items.flatMap(i=>[`${seatLabel(i.seat,true)}`,...i.reasons,...i.tradeoffs,'模拟路线：'+i.trip.path.map(readableNode).join(' → ')])].join('\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=el('a');a.href=url;a.download='嘉庚知座_演示任务卡.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('import').onchange=async()=>{
 try{
   const f=$('import').files[0];if(!f)return;if(f.size>200_000)throw Error('文件过大');
   const raw=JSON.parse(await f.text());if(!Array.isArray(raw.observations))throw Error('缺少 observations 数组');
   let count=0;
   for(const r of raw.observations){const s=data.seats.find(x=>x.id===r.id);if(!s)continue;
     if(!['occupied','unknown','items','clear'].includes(r.observed))continue;
     // 导入只能修改观测，不能授予预约权或改写专座资格。
     s.observed=r.observed;s.quality=Number.isFinite(r.quality)&&r.quality>=0&&r.quality<=1?r.quality:0;s.obsAt=Number.isFinite(r.obsAt)?r.obsAt:0;count++;
   }
   plan=null;draw();generate();notify(`导入 ${count} 个本机测试观测。预约规则仍为模拟，不能用于实际选座。`);
 }catch(error){notify('无法导入：'+error.message);}finally{$('import').value='';}
};
for(const [title,url]of SOURCES){const a=el('a',title);a.href=url;a.target='_blank';a.rel='noopener';$('sources').append(a);}
draw();generate();
// 仅供自动化逻辑检查和学习。没有实时摄像头、预约接口或训练满意度模型。
window.zhizuo={getData:()=>data,getPlan:()=>plan,getSelection:()=>({selected,floor}),generate,selectFloor:n=>{floor=n;draw();},classify};
// 到期必须撤回旧候选。定时检查只读旧时间戳，绝不冒充收到新观测。
// 每5秒更新可能重建座位按钮；键盘用户正在地图内操作时只更新候选，地图由手动复核更新。
setInterval(()=>{
 if(plan)plan=recommend(data.seats,prefs(),data.graph,RESOURCES,Date.now());
 drawSummary();drawDetail();drawResults();
 if(!$('seatBoard').contains(document.activeElement))drawSeatBoard();
 if(!document.getElementById('map').contains(document.activeElement))drawMap();sendModel();
},5000);
