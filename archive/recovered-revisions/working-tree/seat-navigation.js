// 选座 → 三维 → 选座的界面快照。只保存界面条件，不保存录音、身份或登记记录。
// 放在URL的片段（#后面），不要求不同file页面共享sessionStorage。
const choose=(v,allowed,fallback)=>allowed.includes(v)?v:fallback;
const number=(v,min,max,fallback)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
const text=(v,max=160)=>typeof v==='string'?v.slice(0,max):'';
export function cleanSeatSnapshot(raw,knownSeats){
 if(!raw||typeof raw!=='object'||raw.version!==1)return null;
 const known=new Map(knownSeats.map(s=>[s.id,s]));
 const selected=known.has(raw.selected)?raw.selected:null;
 const floor=selected?known.get(selected).floor:Math.round(number(raw.floor,0,5,0));
 const f=raw.form||{},scroll=raw.scroll||{};
 const candidates=[],seen=new Set();
 for(const row of Array.isArray(raw.candidates)?raw.candidates.slice(0,4):[]){
  if(!known.has(row?.id)||seen.has(row.id))continue;seen.add(row.id);
  candidates.push({id:row.id,score:number(row.score,-100000,100000,0),reasons:(Array.isArray(row.reasons)?row.reasons:[]).slice(0,6).map(s=>text(s)),tradeoffs:(Array.isArray(row.tradeoffs)?row.tradeoffs:[]).slice(0,6).map(s=>text(s))});
 }
 let mapFocus=null;
 if(raw.mapFocus&&raw.mapFocus.floor===floor&&Array.isArray(raw.mapFocus.ids)){
  const ids=[...new Set(raw.mapFocus.ids.filter(id=>known.get(id)?.floor===floor))].slice(0,4);
  if(ids.length)mapFocus={floor,ids,priority:raw.mapFocus.priority===true};
 }
 return {version:1,checkin:raw.checkin===true,floor,selected,page:Math.floor(number(raw.page,0,1000,0)),zoom:number(raw.zoom,1,3,1),view:choose(raw.view,['map','list'],'map'),attempted:raw.attempted===true,mapFocus,candidates,
  form:{subject:choose(f.subject,['own','economy','literature','technology','periodicals'],'own'),searchRange:choose(f.searchRange,['current','all'],'current'),regionFilter:choose(f.regionFilter,['','北','南','东'],''),stateFilter:choose(f.stateFilter,['','unknown','available','occupied','away','items','protected'],''),windowPreference:f.windowPreference===true,powerPreference:f.powerPreference===true,printPreference:f.printPreference===true,duration:choose(String(f.duration),['30','60','120','240'],'120'),voiceText:text(f.voiceText,500)},
  scroll:{x:number(scroll.x,0,100000,0),y:number(scroll.y,0,100000,0),mapX:number(scroll.mapX,0,100000,0),mapY:number(scroll.mapY,0,100000,0)}};
}
export function encodeSeatSnapshot(snapshot){
 const json=JSON.stringify(snapshot);if(json.length>16000)throw new Error('界面快照过大');
 return btoa(Array.from(new TextEncoder().encode(json),v=>String.fromCharCode(v)).join('')).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decodeSeatSnapshot(value,knownSeats){
 try{if(typeof value!=='string'||value.length>32000||!/^[\w-]+$/.test(value))return null;
  const raw=value.replaceAll('-','+').replaceAll('_','/'),bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
  return cleanSeatSnapshot(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)),knownSeats);
 }catch{return null;}
}
export function modelNavigationURL(focusHash,snapshot){
 const hash=/^#(?:loc=[1-5],-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?|floor=[1-5])$/.test(focusHash)?focusHash:'';
 return '建筑与五层展示.html'+(hash||'#overview=1')+'&return='+encodeSeatSnapshot(snapshot);
}
export function seatReturnNavigation(hash){
 const capsule=new URLSearchParams(String(hash||'').replace(/^#/,'' )).get('return');
 if(!capsule||capsule.length>32000||!/^[\w-]+$/.test(capsule))return null;
 // 只返回本地固定选座页，不能用片段构造任意网址或javascript跳转。
 let checkin=false;
 try{const raw=capsule.replaceAll('-','+').replaceAll('_','/');checkin=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(raw),c=>c.charCodeAt(0)))).checkin===true;}catch{return null;}
 return '嘉庚知座.html'+(checkin?'?mode=checkin':'')+'#resume='+capsule;
}
export function restoreSeatCandidates(snapshot,catalog,reports,stateAt){
 const known=new Map(catalog.map(s=>[s.id,s]));
 // 保留原比较顺序，但过期、已有人或有物的候选不能因返回操作而继续亮作可用。
 return snapshot.candidates.filter(r=>{const s=known.get(r.id);return s&&!s.dedicated&&stateAt(s,reports[s.id]).kind==='available';}).map((r,i)=>({seat:known.get(r.id),score:r.score,reasons:r.reasons,tradeoffs:r.tradeoffs,rank:i+1}));
}
