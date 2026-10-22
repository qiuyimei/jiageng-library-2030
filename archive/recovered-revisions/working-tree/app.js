import {STATE,classify,recommend,summarize,reserveDemo,recheck} from './engine.js';
import {makeData,setScenario,RESOURCES,FLOOR_NAMES,SOURCES} from './data.js';
// document 是网页文档；通过 id 查找元素，让脚本和页面控件连接起来。
const $=id=>document.getElementById(id);
let data=makeData(Date.now()), floor=3, selected=null, plan=null;
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
 const map=$('map');map.replaceChildren();
 map.append(svg('rect',{x:20,y:20,width:640,height:390,rx:18,fill:'#faf7ef',stroke:'#d4d9cb'}));
 map.append(svg('text',{x:35,y:48,fill:'#64766b','font-size':15},'模拟座位平面  非实际坐标  不用于真实导航'));
 map.append(svg('rect',{x:45,y:68,width:52,height:315,rx:6,fill:'#d6c6a3'}));
 for(let i=0;i<6;i++)map.append(svg('line',{x1:52,y1:83+i*47,x2:90,y2:83+i*47,stroke:'#937855','stroke-width':5}));
 map.append(svg('text',{x:40,y:401,fill:'#766345','font-size':13},'馆藏区域示意'));
 for(const seat of data.seats.filter(s=>s.floor===floor)){
   const state=classify(seat,Date.now()),meta=STATE[state.kind],g=svg('g',{role:'button',tabindex:0,'aria-label':`${seat.id} ${meta.label} ${state.reason}`});
   g.append(svg('rect',{x:seat.x,y:seat.y,width:112,height:76,rx:9,fill:meta.color,stroke:selected===seat.id?'#e4b33b':'#ffffff','stroke-width':selected===seat.id?5:2}));
   g.append(svg('text',{x:seat.x+9,y:seat.y+23,fill:'#fff','font-size':14,'font-weight':700},seat.id));
   g.append(svg('text',{x:seat.x+9,y:seat.y+44,fill:'#fff','font-size':12},meta.label));
   g.append(svg('text',{x:seat.x+9,y:seat.y+63,fill:'#fff','font-size':11},seat.power?'插座示意':'未标注插座'));
   const choose=()=>{selected=seat.id;drawDetail();drawMap();};g.addEventListener('click',choose);
   g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();choose();}});map.append(g);
 }
}
function drawDetail(){
 const out=$('seatDetail');out.replaceChildren();
 if(!selected){out.append(el('p','点击座位，查看观测与使用权为什么会得出这个状态。'));return;}
 const seat=data.seats.find(s=>s.id===selected),state=recheck(data.seats,selected,Date.now());
 out.append(el('h3',`${seat.id} · ${STATE[state.kind].label}`),el('p',state.reason));
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
   card.append(el('h3',`${index+1}. ${item.seat.id} · ${item.seat.floor}F`));
   for(const r of item.reasons)card.append(el('p','✓ '+r));
   for(const t of item.tradeoffs)card.append(el('p','取舍：'+t,'muted'));
   card.append(el('small','推荐不等于锁座；路线是模拟通道的计算结果。'));
   const b=el('button','查看座位与路线');b.onclick=()=>{floor=item.seat.floor;selected=item.seat.id;draw();$('route').textContent='模拟路线：'+item.trip.path.join(' → ');};card.append(b);out.append(card);
 });
}
function draw(){drawSummary();drawMap();drawDetail();drawResults();}
function generate(){plan=recommend(data.seats,prefs(),data.graph,RESOURCES,Date.now());drawResults();
 $('route').textContent=plan.items.length?'选择候选查看模拟路线。':'';}
for(const resource of RESOURCES){const o=el('option',resource.title);o.value=resource.id;$('resource').append(o);}
$('form').addEventListener('submit',e=>{e.preventDefault();generate();notify('候选已更新。数据与书目均为模拟，当前没有馆内实时接口。');});
for(const id of ['resource','power','window','quiet','accessible','print','floorFilter','priority'])$(id).addEventListener('change',()=>{plan=null;$('route').textContent='';drawResults();});
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
 if(!$('modelPanel').hidden){const frame=$('modelFrame');if(!frame.getAttribute('src'))frame.src='建筑与五层展示.html';}
};
$('sendFloor').onclick=()=>{
 if($('modelFrame').contentWindow)$('modelFrame').contentWindow.postMessage({type:'zhizuo-floor',floor},'*');
};
$('download').onclick=()=>{
 if(!plan)return;
 const text=['嘉庚知座本次演示任务卡','数据、书目、座位及路线均为模拟；非实际预约。',
  RESOURCES.find(r=>r.id===prefs().resource).title,...plan.warnings,
  ...plan.items.flatMap(i=>[`${i.seat.id} ${i.seat.floor}F`,...i.reasons,...i.tradeoffs,'模拟路线：'+i.trip.path.join(' → ')])].join('\n');
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
window.zhizuo={getData:()=>data,getPlan:()=>plan,generate,selectFloor:n=>{floor=n;draw();},classify};
// 到期必须撤回旧候选。定时检查只读旧时间戳，绝不冒充收到新观测。
// 每5秒更新可能重建座位按钮；键盘用户正在地图内操作时只更新候选，地图由手动复核更新。
setInterval(()=>{
 if(plan)plan=recommend(data.seats,prefs(),data.graph,RESOURCES,Date.now());
 drawSummary();drawDetail();drawResults();
 if(!document.getElementById('map').contains(document.activeElement))drawMap();
},5000);
