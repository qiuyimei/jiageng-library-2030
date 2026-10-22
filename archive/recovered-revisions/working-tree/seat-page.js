// 分层选座与读者自助登记界面。所有文字通过textContent写入，不执行外部登记里的HTML。
import {createSeatCatalog,STORE_KEY,STATUS,reportState,readReports,changeReport,makeExampleReports,suggestSeats} from './seat-status.js';
import {floorBounds,deskLayouts,atriumVoids,GROUND_LAYOUT,ELEVATOR_LAYOUT,TRANSPORT_CORE,upperFacilities,EXHIBITION_LAYOUT,STAIR_LAYOUT} from './spatial.js';
import {FLOOR_INFO,floorRackRecords} from './library-layout.js';
import {initSeatVoice,parseSeatDemand} from './seat-voice.js';
const $=id=>document.getElementById(id),catalog=createSeatCatalog(),params=new URLSearchParams(location.search),checkin=params.get('mode')==='checkin';
let floor=0,selected=null,page=0,zoom=1,mapFocus=null,recommendations=[],storageOK=true,reports={},messageTimer,lastStamp='',view='map',demo=true,attempted=false;
const pageSize=16,clientKey=STORE_KEY+'-client';
let owner;
try{owner=localStorage.getItem(clientKey);if(!owner){owner='local-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem(clientKey,owner);}reports=readReports(localStorage.getItem(STORE_KEY)||'{}',catalog);demo=localStorage.getItem(STORE_KEY+'-demo')!=='off';}catch{storageOK=false;owner='memory-'+Date.now();}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function button(text,run,cls){const b=el('button',text,cls);b.type='button';b.onclick=run;return b;}
function notify(text){$('message').textContent=text;$('message').hidden=false;clearTimeout(messageTimer);messageTimer=setTimeout(()=>$('message').hidden=true,6500);}
function load(){if(storageOK)try{reports=readReports(localStorage.getItem(STORE_KEY)||'{}',catalog);}catch{storageOK=false;}}
function save(next){reports=next;if(storageOK)try{localStorage.setItem(STORE_KEY,JSON.stringify(next));}catch{storageOK=false;notify('浏览器没有允许本地保存，登记仅保留在当前页面内存。');}}
function time(t){return new Date(t).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});}
function currentSeats(){return catalog.filter(s=>s.floor===floor&&(!$('regionFilter').value||s.region===$('regionFilter').value)&&(!$('stateFilter').value||reportState(s,reports[s.id]).kind===$('stateFilter').value));}
function preferences(){return {subject:$('subject').value,floor:$('searchRange').value==='all'?0:floor,window:$('windowPreference').checked,power:$('powerPreference').checked,print:$('printPreference').checked};}
function counts(n){const seats=catalog.filter(s=>s.floor===n),out={total:seats.length};for(const k of Object.keys(STATUS))out[k]=seats.filter(s=>reportState(s,reports[s.id]).kind===k).length;return out;}
function writeURL(){
 const p=new URLSearchParams();if(checkin)p.set('mode','checkin');if(selected)p.set('seat',selected);
 const url='嘉庚知座.html'+(p.toString()?'?'+p:'')+(floor?'#floor='+floor:'');
 try{history.replaceState(null,'',url);}catch{/* 文件浏览器不允许改地址时，页面内导航仍可使用。 */}
}
function selectFloor(n,keepSelected=false){
 floor=n;page=0;zoom=1;mapFocus=null;recommendations=[];attempted=false;if(!keepSelected)selected=null;
 $('regionFilter').value='';$('stateFilter').value='';$('physicalConfirm').checked=false;writeURL();draw();
}
function selectSeat(id,scroll=true){
 const s=catalog.find(s=>s.id===id);if(!s)return;
 if(floor!==s.floor){floor=s.floor;page=0;$('regionFilter').value='';$('stateFilter').value='';}
 if($('regionFilter').value&&$('regionFilter').value!==s.region)$('regionFilter').value=s.region;
 if($('stateFilter').value&&$('stateFilter').value!==reportState(s,reports[s.id]).kind)$('stateFilter').value='';
 selected=id;$('physicalConfirm').checked=false;
 const index=currentSeats().findIndex(s=>s.id===id);if(index>=0)page=Math.floor(index/pageSize);
 writeURL();draw();if(scroll)$('seatDetail').scrollIntoView({behavior:'smooth',block:'center'});
}
// 快捷定位始终先找到同一把模型椅子，再切换视图；列表页码由完整清单索引计算。
function locateSeat(id,targetView='map',focusIds=[id],priority=false){
 const s=catalog.find(s=>s.id===id);if(!s)return;
 // 区域或状态筛选不能把要定位的座位藏起来；推荐条件本身保持不变。
 $('regionFilter').value='';$('stateFilter').value='';view=targetView;zoom=1;
 mapFocus=targetView==='map'?{floor:s.floor,ids:focusIds,priority}:null;
 selectSeat(id,false);
 const panel=$(targetView==='map'?'planPanel':'listContent');
 if(targetView==='map'){$('mapStage').scrollLeft=0;$('mapStage').scrollTop=0;}
 panel.scrollIntoView({behavior:'smooth',block:'center'});
 if(targetView==='list')Array.from($('seatCards').children).find(b=>b.dataset.seat===id)?.focus?.({preventScroll:true});
}
function locatePriority(id,targetView=view){
 if(!recommendations.some(r=>r.seat.id===id))return;
 locateSeat(id,targetView,[id],true);
}
function focusPriorityArea(){
 // 跨层推荐时先看当前层；本层没有推荐则直接进入第1优先所在楼层。
 const local=recommendations.filter(r=>r.seat.floor===floor),first=local[0]||recommendations[0];if(!first)return;
 const ids=recommendations.filter(r=>r.seat.floor===first.seat.floor).map(r=>r.seat.id);
 locateSeat(first.seat.id,'map',ids,true);
}
function refreshExamples(){const next=makeExampleReports(catalog);for(const [id,r] of Object.entries(reports))if(r.source==='reader')next[id]=r;save(next);}
function setDemo(value){demo=value;if(storageOK)try{localStorage.setItem(STORE_KEY+'-demo',value?'on':'off');}catch{};}
function loadExamples(){load();setDemo(true);refreshExamples();recommendations=[];attempted=false;draw();notify('展示模式已就绪：颜色和候选使用示例状态，本人登记保留。');}
function drawView(){ $('listContent').hidden=view!=='list';$('planPanel').hidden=view!=='map';$('showMap').className=view==='map'?'active':'';$('showList').className=view==='list'?'active':'';drawPriorityNavigation();}
function drawPriorityNavigation(){
 $('priorityTools').hidden=checkin||!recommendations.length;
 $('focusPriorityArea').hidden=view!=='map';
 $('priorityHint').textContent=view==='map'?'点击优先项，放大到座位附近':'点击优先项，直接跳到所在页';
 const out=$('priorityJumps');out.replaceChildren();
 for(const r of recommendations){
  const b=button(`第${r.rank}优先 · ${r.seat.floor}F ${r.seat.label}`,()=>locatePriority(r.seat.id),r.seat.id===selected?'active':'');
  b.setAttribute('aria-label',`第${r.rank}优先 ${r.seat.floor}楼 ${r.seat.label}，`+(view==='map'?'放大定位':'跳到所在列表页'));
  b.setAttribute('aria-pressed',String(r.seat.id===selected));out.append(b);
 }
}
function drawOverview(){
 $('floorCards').replaceChildren();$('floorNav').replaceChildren();
 for(let n=1;n<=5;n++){
  const c=counts(n),tile=button('',()=>selectFloor(n),'floor-tile');tile.append(el('strong',n+'F'),el('span',FLOOR_INFO[n-1].title),el('span',`模型椅位 ${c.total} · 离座登记 ${c.available}`),el('small',`有人/暂离 ${c.occupied+c.away} · 待核对 ${c.unknown} · 专座 ${c.protected}`));$('floorCards').append(tile);
  const tab=button(n+'F',()=>selectFloor(n),n===floor?'active':'');tab.setAttribute('aria-current',n===floor?'page':'false');$('floorNav').append(tab);
 }
}
function drawRecommendations(){
 const out=$('recommendations');out.replaceChildren();
 if(!recommendations.length){out.append(el('p',attempted?($('powerPreference').checked?'当前范围没有带电源且可初筛的模型座位。已保留你的条件，可点击下方比较五层。':'当前范围没有符合条件的近期离座记录。可切换展示模式，或调整范围。'):'选好需求，点击生成。展示模式已准备好示例状态。','small'));if(attempted)out.append(button($('powerPreference').checked?'保留条件，比较五层':'载入演示状态',()=>{if($('powerPreference').checked){$('searchRange').value='all';generate();}else{loadExamples();generate();}}));return;}
 for(const r of recommendations){
  const card=el('article',undefined,'result');card.append(el('strong','第 '+r.rank+' 优先'),el('h3',r.seat.floor+'F · '+r.seat.label));
  for(const reason of r.reasons)card.append(el('p',reason));for(const reason of r.tradeoffs)card.append(el('p','取舍：'+reason));
  const actions=el('div',undefined,'priority-actions');actions.append(button('图中定位',()=>locatePriority(r.seat.id,'map')),button('跳到列表页',()=>locatePriority(r.seat.id,'list')));card.append(actions);out.append(card);
 }
}
function drawCards(){
 const rows=currentSeats(),pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,pages-1);
 $('boardTitle').textContent=floor+'F · '+($('regionFilter').value||'全层')+'座位表';
 $('boardDescription').textContent=`当前条件共 ${rows.length} 把模型椅子，每页最多 ${pageSize} 个；各页使用同一份完整椅位清单。`;
 const out=$('seatCards');out.replaceChildren();
 for(const s of rows.slice(page*pageSize,(page+1)*pageSize)){
  const state=reportState(s,reports[s.id]),rank=recommendations.find(r=>r.seat.id===s.id)?.rank;
  const b=button('',()=>selectSeat(s.id),'seat'+(s.id===selected?' selected':'')+(rank?' ranked':''));b.dataset.kind=state.kind;
  b.dataset.seat=s.id;
  b.append(el('strong',s.label),el('small',rank?'第'+rank+'优先 · '+state.label:state.label));b.setAttribute('aria-label',floor+'楼 '+s.label+' '+state.label+(rank?' 第'+rank+'优先':''));b.setAttribute('aria-pressed',String(s.id===selected));out.append(b);
 }
 if(!rows.length)out.append(el('p','这一层在当前区域或状态条件下没有匹配座位。','empty'));
 $('pagination').textContent=(page+1)+' / '+pages+' 页';$('previousPage').disabled=page===0;$('nextPage').disabled=page>=pages-1;
}
function drawDetail(){
 const s=catalog.find(s=>s.id===selected),out=$('seatDetail');out.hidden=!s;out.replaceChildren();
 for(const name of ['arrive','away','leave','items'])$(name).disabled=!s||s.dedicated;
 if(!s){$('checkinTitle').textContent='选择座位后办理到座登记';return;}
 const r=reports[s.id],state=reportState(s,r),rank=recommendations.find(i=>i.seat.id===s.id)?.rank;
 out.append(el('h3',s.floor+'F · '+s.label+(rank?' · 第'+rank+'优先':'')),el('p',state.label+'：'+state.reason));
 out.append(el('p','来源：'+(r?.source==='example'?'展示模式的示例登记':r?'读者主动登记':'暂无登记')+(state.at?' · 更新 '+time(state.at)+' · 到期 '+time(state.until):''),'small'));
 const links=el('div',undefined,'detail-actions');
  const locate=el('a','在座位图定位');locate.href='#planPanel';locate.onclick=e=>{e.preventDefault();locateSeat(s.id,'map');};
 const model=el('a','在三维中查看这个位置 ↗');model.href='建筑与五层展示.html#loc='+[s.floor,s.x,s.z].join(',');model.target='_blank';model.rel='noopener';links.append(locate,model);
 if(!checkin){const a=el('a','我已到座，办理登记 →');a.href='嘉庚知座.html?mode=checkin&seat='+s.id+'#floor='+floor;links.append(a);}else links.append(button('到座登记操作 ↓',()=>$('checkinPanel').scrollIntoView({behavior:'smooth',block:'center'})));
 out.append(links);$('checkinTitle').textContent=s.floor+'F · '+s.label+' · 本人到座登记';
 $('checkinExplanation').textContent=s.dedicated?'这里是馆方固定专座，本机不办理资格或使用权。':'选择本人的实际到座状态。登记不会替代图书馆原有预约或签到；不要远程占座或代替别人登记。';
 const mine=catalog.filter(s=>reports[s.id]?.owner===owner&&['occupied','away'].includes(reportState(s,reports[s.id]).kind));$('myReports').replaceChildren();
 for(const s of mine)$('myReports').append(button('本机当前登记：'+s.floor+'F '+s.label,()=>selectSeat(s.id)));
}
function svg(tag,attrs,text){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;}
function drawPlan(){
 const map=$('floorPlan'),b=floorBounds(floor),region=$('regionFilter').value,rows=catalog.filter(s=>s.floor===floor&&(!region||s.region===region));map.replaceChildren();
 let left=b.left-1,right=b.right+1,back=b.back-1,front=b.front+1;
 if(region&&rows.length){left=Math.max(left,Math.min(...rows.map(s=>s.x))-5);right=Math.min(right,Math.max(...rows.map(s=>s.x))+5);back=Math.max(back,Math.min(...rows.map(s=>s.z))-4);front=Math.min(front,Math.max(...rows.map(s=>s.z))+4);}
 // 改变SVG的可视范围，直接将目标居中放大；不放大整个网页，也不依赖用户拖滚动条。
 if(mapFocus?.floor===floor){
  const targets=rows.filter(s=>mapFocus.ids.includes(s.id));
  if(targets.length){left=Math.max(b.left-1,Math.min(...targets.map(s=>s.x))-8);right=Math.min(b.right+1,Math.max(...targets.map(s=>s.x))+8);back=Math.max(b.back-1,Math.min(...targets.map(s=>s.z))-8);front=Math.min(b.front+1,Math.max(...targets.map(s=>s.z))+8);}
 }
 // 初始完整适配固定窗口；放大时才在窗口内滚动，绝不把整个网页撑成数千像素高。
 const width=right-left,depth=front-back;map.setAttribute('viewBox',`${left} ${back} ${width} ${depth}`);map.setAttribute('preserveAspectRatio','xMidYMid meet');map.style.width=zoom*100+'%';map.style.height=zoom*100+'%';$('zoomText').textContent=mapFocus?(zoom===1?(mapFocus.priority?'推荐局部':'座位局部'):'局部 · '+Math.round(zoom*100)+'%'):zoom===1?'适配窗口':Math.round(zoom*100)+'%';
 const rect=(x,z,w,d,color,stroke,extra={})=>map.append(svg('rect',{x:x-w/2,y:z-d/2,width:w,height:d,fill:color,...(stroke?{stroke,'stroke-width':.06}:{}),...extra}));
 const label=(x,z,text,size=.7,color='#50675d')=>map.append(svg('text',{x,y:z,'font-size':size,'text-anchor':'middle',fill:color},text));
 rect((b.left+b.right)/2,(b.back+b.front)/2,b.right-b.left,b.front-b.back,'#e9e6d9','#a8b5aa');
 for(const h of atriumVoids(floor))rect(h.x,h.z,h.w,h.d,'#f7f6f0','#a2ada7');
 for(const r of floorRackRecords(floor))rect(r.x,r.z,r.rotation?1.04:r.w,r.rotation?r.w:1.04,'#78614f');
 if(floor===1){
  for(const r of GROUND_LAYOUT.compactBlocks)rect(r.x,r.z,r.w,r.d,'#b4c0c3','#738685');
  for(const r of [GROUND_LAYOUT.cafe,...GROUND_LAYOUT.rooms]){rect(r.x,r.z,r.w,r.d,r.id?'#d1ddd4':'#ddc9ab','#8c998e');label(r.x,r.z,r.label,.72);}
  for(const w of [...GROUND_LAYOUT.partitions,...GROUND_LAYOUT.loungeBackWalls])rect(w.x,w.z,w.w,w.d,'#7d8982');
  for(const p of GROUND_LAYOUT.receivingTables)rect(p.x,p.z,p.w,p.d,'#bd9567');
  for(const p of GROUND_LAYOUT.sofas)rect(p.x,p.z,3.3,1.3,'#dedbd0','#80664d');
  for(const s of GROUND_LAYOUT.smallShelves)rect(s.x,s.z,s.d,s.w,'#7d624c');
  for(const p of GROUND_LAYOUT.printers)rect(p.x,p.z,1.45,1.2,'#7d8b8e');
  const t=GROUND_LAYOUT.toilet;rect(t.x,t.z,t.w,t.d,'#c4d2c8','#7f958b');label(t.x,t.z,'WC');
  rect(0,13,6.6,1.8,'#985a45');label(0,16,'电脑服务台',.7);
 }else{
  const f=upperFacilities(floor);for(const t of f.toilets){rect(t.x,t.z,t.w,t.d,'#c4d2c8','#7f958b');label(t.x,t.z,'WC');}
  for(const r of [...f.rooms,...(f.culture?[f.culture]:[])]){rect(r.x,r.z,r.w,r.d,'#d1ddd4','#87988d');label(r.x,r.z,r.label,.58);}
  if(f.lockers)rect(f.lockers.x,f.lockers.z,f.lockers.w,f.lockers.d,'#94aca0');
 }
 const c=TRANSPORT_CORE;rect((c.left+c.right)/2,(c.back+c.front)/2,c.right-c.left,c.front-c.back,'#d5dbd1','#71887b');label(24,-46,'电梯 / 侧楼梯',.7);rect(ELEVATOR_LAYOUT.x,ELEVATOR_LAYOUT.z-ELEVATOR_LAYOUT.facadeOffset,2.8,2.7*ELEVATOR_LAYOUT.facadeScale,'#6f8587');
 const stair=STAIR_LAYOUT[floor];if(stair)for(const side of [-1,1]){rect(side*4.65,(stair.start+stair.end)/2,1.45,stair.start-stair.end,'#8d9590');label(side*4.65,(stair.start+stair.end)/2,'楼梯',.5);}
 if(floor===3){const e=EXHIBITION_LAYOUT;for(const [point,name,color] of [[e.armillary,'金球','#b89b4d'],[e.ceramics,'白瓷','#dde1d5'],[e.smallExhibit,'木雕','#9c7951']]){rect(point.x,point.z,2.5,1.7,color,'#7c7d67');label(point.x,point.z+.2,name,.5);}}
 for(const d of deskLayouts(floor)){const a=d.rotation||0;rect(d.x,d.z,d.w,d.d,'#e1d4ad','#aaa188',{transform:`rotate(${-a*180/Math.PI} ${d.x} ${d.z})`});}
 for(const s of rows){
  const state=reportState(s,reports[s.id]),rank=recommendations.find(r=>r.seat.id===s.id)?.rank,chosen=s.id===selected;
  // 用有间距的椅位方块代替互相堆叠的圆点；数字放框内，完整名称可键盘或鼠标查看。
  const g=svg('g',{'data-seat':s.id,role:'button',tabindex:0,'aria-label':s.floor+'F '+s.label+' '+state.label});
  g.append(svg('rect',{x:s.x-.60,y:s.z-.43,width:1.2,height:.86,rx:.14,fill:rank?'#f7d36c':state.color,stroke:chosen?'#112f29':rank?'#a77925':'#ffffff','stroke-width':chosen?.16:.06}));
  g.append(svg('text',{x:s.x,y:s.z+.15,'text-anchor':'middle','font-size':.43,'font-weight':700,fill:rank?'#604312':'#fff'},s.label.slice(1)));
  g.append(svg('title',{},s.label+' · '+state.label+(rank?' · 第'+rank+'优先':'')));
  if(rank)g.append(svg('text',{x:s.x,y:s.z-.7,'text-anchor':'middle','font-size':.48,'font-weight':700,fill:'#80580f'},'优'+rank));
  const choose=()=>selectSeat(s.id);g.addEventListener('click',choose);g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();choose();}});map.append(g);
 }
 label(-20,b.front-1.5,'北区 · 左侧',.85);label(20,b.front-1.5,'南区 · 右侧',.85);if(floor>1)label(0,b.back+2,'东区 · 上方',.85);
}
function draw(){
 if(mapFocus?.priority&&mapFocus.ids.some(id=>!recommendations.some(r=>r.seat.id===id)))mapFocus=null;
 lastStamp=JSON.stringify(reports)+'|'+catalog.map(s=>reportState(s,reports[s.id]).kind).join(',');
 drawOverview();$('landing').hidden=!!floor;$('floorView').hidden=!floor;$('checkinPanel').hidden=!checkin;$('recommendPanel').hidden=checkin;
 $('scopeNotice').textContent=demo?'展示模式 · 有人、离座等颜色来自示例记录，非馆内实时数据。可直接生成推荐；本人登记会保留。':'本人登记模式 · 只按本机有效登记初筛；没有记录的座位显示待核对。未连接全馆后台或正式预约。';
 if(!floor)return;
 $('floorTitle').textContent=floor+'F · '+FLOOR_INFO[floor-1].title;$('floorDescription').textContent=checkin?'这是本层到座登记界面。先选择座位，再核对现场和登记动作。':'座位图与列表切换查看；模型两侧临窗桌排均可参与偏好排序。';$('floorModel').href='建筑与五层展示.html#floor='+floor;
 const c=counts(floor);$('floorStats').replaceChildren(el('span','模型椅位 '+c.total),el('span','离座登记 '+c.available),el('span','有人登记 '+c.occupied),el('span','暂离 '+c.away),el('span','待核对 '+c.unknown),el('span','馆方专座 '+c.protected));
 drawRecommendations();drawCards();drawDetail();drawPlan();drawView();
 $('scopeNotice').textContent=demo?'展示模式 · 有人、离座等颜色来自示例记录，非馆内实时数据。可直接生成推荐；本人登记会保留。':'本人登记模式 · 只按本机有效登记初筛；没有记录的座位显示待核对。未连接全馆后台或正式预约。';
 if(!storageOK)$('scopeNotice').textContent='当前浏览器未允许本地存储：登记只在当前页面内存有效，关闭即丢失。本机演示不接入摄像头、全馆共享后台或真实预约。';
}
function act(kind){load();const result=changeReport(catalog,reports,{id:selected,kind,owner,minutes:Number($('duration').value),confirmed:$('physicalConfirm').checked});if(result.ok){save(result.reports);recommendations=[];$('physicalConfirm').checked=false;draw();}notify(result.message);}
if(checkin){$('pageTitle').textContent='嘉庚知座 · 到座自助登记';$('pageLead').textContent='到现场后，由本人选择座位并登记。来源和时间公开说明，不采集人脸或视频。';$('modeLink').textContent='返回分层选座 →';$('modeLink').href='嘉庚知座.html';}
for(const [kind,data] of Object.entries(STATUS)){const span=el('span'),dot=el('i');dot.style.background=data.color;span.append(dot,document.createTextNode(data.label));$('legend').append(span);}
$('loadExample').onclick=$('exampleOnFloor').onclick=loadExamples;
$('clearExample').onclick=()=>{load();setDemo(false);save(Object.fromEntries(Object.entries(reports).filter(([,r])=>r.source!=='example')));recommendations=[];attempted=false;draw();notify('已切换本人登记模式；未知位置保持待核对。');};
$('showMap').onclick=()=>{view='map';drawView();};$('showList').onclick=()=>{view='list';drawView();};
$('backFloors').onclick=()=>selectFloor(0);
for(const id of ['regionFilter','stateFilter'])$(id).onchange=()=>{page=0;zoom=1;mapFocus=null;drawCards();drawPlan();};
$('previousPage').onclick=()=>{page--;drawCards();};$('nextPage').onclick=()=>{page++;drawCards();};
function generate(){load();if(demo)refreshExamples();attempted=true;mapFocus=null;zoom=1;recommendations=suggestSeats(catalog,reports,preferences());draw();}
$('preferenceForm').onsubmit=e=>{e.preventDefault();generate();};
for(const id of ['subject','searchRange','windowPreference','powerPreference','printPreference'])$(id).onchange=()=>{voiceControl.invalidate();recommendations=[];attempted=false;mapFocus=null;zoom=1;drawRecommendations();drawCards();drawPlan();drawPriorityNavigation();};
$('zoomIn').onclick=()=>{zoom=Math.min(3,zoom+.25);drawPlan();};$('zoomOut').onclick=()=>{zoom=Math.max(1,zoom-.25);drawPlan();};$('resetZoom').onclick=()=>{zoom=1;mapFocus=null;drawPlan();$('mapStage').scrollLeft=0;$('mapStage').scrollTop=0;};
$('focusPriorityArea').onclick=focusPriorityArea;
for(const id of ['arrive','away','leave','items'])$(id).onclick=()=>act({arrive:'occupied',away:'away',leave:'available',items:'items'}[id]);
window.addEventListener('storage',e=>{if(e.key===STORE_KEY){load();recommendations=[];draw();}});
// 降低空闲损耗：十秒才重核状态，到后台时停止绘图，没有三维持续运行。
setInterval(()=>{if(document.hidden)return;load();const stamp=JSON.stringify(reports)+'|'+catalog.map(s=>reportState(s,reports[s.id]).kind).join(',');if(stamp===lastStamp)return;if(recommendations.length)recommendations=suggestSeats(catalog,reports,preferences());draw();},10000);
const initial=catalog.find(s=>s.id===params.get('seat')),hashFloor=Number(location.hash.match(/^#floor=([1-5])$/)?.[1]||0);
if(initial){selected=initial.id;floor=initial.floor;page=Math.floor(catalog.filter(s=>s.floor===floor).findIndex(s=>s.id===selected)/pageSize);}else floor=hashFloor;
window.addEventListener('hashchange',()=>{const n=Number(location.hash.match(/^#floor=([1-5])$/)?.[1]||0);if(n!==floor)selectFloor(n);});
const voiceControl=initSeatVoice({get:$,getCurrent:preferences,onConfirm:p=>{
 if(p.floor&&p.floor!==floor)selectFloor(p.floor);
 if(p.subject!==undefined)$('subject').value=p.subject;
 if(p.range!==undefined)$('searchRange').value=p.range;
 for(const [key,id] of [['window','windowPreference'],['power','powerPreference'],['print','printPreference']])if(p[key]!==undefined)$(id).checked=p[key];
 generate();
}});
if(demo&&!checkin)refreshExamples();draw();
// 暴露只读状态快照供内存事件检查，不包含匿名标识，也不提供绕过登记规则的入口。
window.zhizuoSeatPage={parseDemand:parseSeatDemand,getState:()=>({floor,selected,checkin,demo,view,seatCount:catalog.length,page,region:$('regionFilter').value,recommendations:recommendations.map(r=>r.seat.id),mapFocus:mapFocus?{floor:mapFocus.floor,ids:[...mapFocus.ids]}:null,storageOK})};
