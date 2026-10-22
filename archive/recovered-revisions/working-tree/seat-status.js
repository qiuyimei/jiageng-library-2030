// 读者自助登记的数据规则。没有摄像头输入，也没有连接真实预约或校内身份系统。
// 三维、单层座位图和座位卡片统一读取spatial中的实际示意椅位，不另画少量假座位。
import {floorSeatRecords,deskLayouts,deskChairPosition} from './spatial.js';
export const STORE_KEY='jiageng-zhizuo-reader-reports-v1';
export const STATUS={
 unknown:{label:'待核对',color:'#7a8791',short:'？'},
 available:{label:'离座登记',color:'#28785f',short:'空'},
 occupied:{label:'有人登记',color:'#b65b4b',short:'人'},
 away:{label:'暂离登记',color:'#b28b3e',short:'暂'},
 items:{label:'有物待核对',color:'#927b9b',short:'物'},
 protected:{label:'馆方专座',color:'#7a6d51',short:'专'}
};
const regionCode={北:'N',南:'S',东:'E'};
export function createSeatCatalog(){
 const result=[];
 for(let floor=1;floor<=5;floor++){
  const desks=deskLayouts(floor);
  for(const p of floorSeatRecords(floor)){
   // 对照同一个桌椅生成器找桌型；桌型是模型属性，不冒充现场插座巡检。
   const desk=desks.find(d=>[0,1,2,3].some(slot=>{const q=deskChairPosition(d,slot);return Math.abs(q.x-p.x)<.001&&Math.abs(q.z-p.z)<.001;}));
   result.push({...p,floor,sampleId:p.id,
    id:`F${floor}-${regionCode[p.region]}${p.label.slice(1).padStart(3,'0')}`,
    signature:`${floor}|${p.x.toFixed(3)}|${p.z.toFixed(3)}`,
    deskKey:`${floor}|${desk.x}|${desk.z}|${desk.rotation||0}`,
    // 模型两侧外围桌排均视为临窗带；按桌中心判定，避免同桌两侧椅子被分成两类。
    window:Math.abs(desk.x)>=23.5,power:!!desk.partition,partition:!!desk.partition});
  }
 }
 // 页面按楼层、北南东区域和自然序号排列，不能直接沿几何装配次序从北47之类的位置开头。
 return result.sort((a,b)=>a.floor-b.floor||['北','南','东'].indexOf(a.region)-['北','南','东'].indexOf(b.region)||Number(a.label.slice(1))-Number(b.label.slice(1)));
}
export function reportState(seat,record,now=Date.now()){
 if(seat.dedicated)return {...STATUS.protected,kind:'protected',reason:'固定专座资格由馆方管理，本机不办理使用权。'};
 if(!record||record.signature!==seat.signature||!Number.isFinite(record.at)||!Number.isFinite(record.until)||record.at>now+5000||record.until<=now||record.until<=record.at)
  return {...STATUS.unknown,kind:'unknown',reason:record?'登记已过期或不匹配，须现场核对；不会自动变为空位。':'尚无有效登记，不能据此认定无人。'};
 if(!['occupied','away','items','available'].includes(record.kind))return {...STATUS.unknown,kind:'unknown',reason:'登记状态无效。'};
 return {...STATUS[record.kind],kind:record.kind,at:record.at,until:record.until,owner:record.owner,source:record.source,
  reason:record.kind==='available'?'读者近期登记已离座，仍需现场核对及遵守馆方规则。':'读者自行登记，未经传感器或馆方系统核验。'};
}
export function readReports(text,catalog,now=Date.now()){
 // 只接收已知椅位、已知状态及有限时长；不接收身份、HTML或改变馆方专座规则的字段。
 try{
  if(typeof text!=='string'||text.length>1500000)return {};
  const raw=JSON.parse(text),known=new Map(catalog.map(s=>[s.id,s]));if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
  const out={};
  for(const [id,r] of Object.entries(raw)){
   const seat=known.get(id);
   if(!seat||seat.dedicated||!r||!['occupied','away','available','items'].includes(r.kind)||typeof r.owner!=='string'||r.owner.length>90||r.signature!==seat.signature)continue;
   if(!Number.isFinite(r.at)||!Number.isFinite(r.until)||r.at>now+5000||r.until<=r.at||r.until-r.at>4*60*60*1000)continue;
   out[id]={kind:r.kind,owner:r.owner,signature:r.signature,at:r.at,until:r.until,source:r.source==='example'?'example':'reader'};
  }
  return out;
 }catch{return {};}
}
export function changeReport(catalog,reports,{id,kind,owner,minutes=120,confirmed=false},now=Date.now()){
 const seat=catalog.find(s=>s.id===id);
 if(!seat||seat.dedicated)return {ok:false,message:'该位置不存在，或属于须按馆方规则办理的专座。'};
 if(!owner||typeof owner!=='string'||owner.length>90)return {ok:false,message:'本机登记标识无效。'};
 if(!confirmed)return {ok:false,message:'请先确认你已在座位现场核对。'};
 if(!['occupied','away','available','items'].includes(kind))return {ok:false,message:'不支持的登记操作。'};
 const old=reports[id],state=reportState(seat,old,now);
 // 不允许把别人的有效“有人/暂离/有物”登记一键清掉；错误记录须由授权管理流程处理。
 if(['occupied','away','items'].includes(state.kind)&&old.owner!==owner)return {ok:false,message:'这里已有其他登记；请现场核对或联系工作人员，不能覆盖对方记录。'};
 if(['away','available'].includes(kind)&&(!old||old.owner!==owner||!['occupied','away'].includes(old.kind)))return {ok:false,message:'请使用本人已入座的登记办理暂离或离座。'};
 const other=catalog.find(s=>s.id!==id&&reports[s.id]?.owner===owner&&['occupied','away'].includes(reportState(s,reports[s.id],now).kind));
 if(kind==='occupied'&&other)return {ok:false,message:`本机仍有${other.floor}F ${other.label}的在座登记，请先办理离座。`};
 const ttl=kind==='available'?15:kind==='away'?15:kind==='items'?15:[30,60,120,240].includes(Number(minutes))?Number(minutes):120;
 const record={kind,owner,signature:seat.signature,at:now,until:now+ttl*60000,source:'reader'};
 return {ok:true,reports:{...reports,[id]:record},record,message:kind==='available'?'已记录本人离座；15分钟后转为待核对。':kind==='away'?'已登记暂离；15分钟后转为待核对，不自动释放。':kind==='items'?'已登记有物待核对，不作为空位推荐。':'已记录本人入座；到期后转为待核对，不自动释放。'};
}
export function makeExampleReports(catalog,now=Date.now()){
 // 展示模式载入的合成记录。每条都标明example，不能冒充馆内实时采集。
 const out={};let i=0;
 for(const s of catalog){
  if(s.dedicated)continue;const n=i++%10,kind=n<3?'available':n<6?'occupied':n===6?'away':n===7?'items':null;
  if(kind)out[s.id]={kind,owner:'example-'+s.id,signature:s.signature,at:now,until:now+(kind==='occupied'?120:15)*60000,source:'example'};
 }
 return out;
}
export function suggestSeats(catalog,reports,prefs,now=Date.now()){
 const target={economy:2,literature:3,technology:4,periodicals:5}[prefs.subject];
 const ranked=catalog.filter(s=>!s.dedicated&&(!prefs.floor||s.floor===prefs.floor)&&(!prefs.region||s.region===prefs.region)&&(!prefs.power||s.power))
  .filter(s=>reportState(s,reports[s.id],now).kind==='available')
  .map(s=>{
   const reasons=['近期有离座登记，需到场复核'],tradeoffs=[];let score=100-s.floor*3;
   if(target){if(s.floor===target){score+=35;reasons.push('与所选主题馆藏同层示意');}else tradeoffs.push('所选主题主要在另一楼层');}
   if(prefs.window){if(s.window){score+=18;reasons.push('匹配模型靠窗位置');}else tradeoffs.push('未匹配靠窗偏好');}
   if(prefs.power)reasons.push('模型采用带电源的挡板桌型，现场仍需核对');
   if(prefs.print){score-=Math.abs(s.x-13.5)*.05+Math.abs(s.z-18)*.05+(s.floor-1)*5;reasons.push('将与一楼打印点的示意距离纳入比较');}
   return {seat:s,score,reasons,tradeoffs};
  }).sort((a,b)=>b.score-a.score||a.seat.id.localeCompare(b.seat.id));
 const picked=[];
 while(ranked.length&&picked.length<4){
  // 两侧临窗且分数相同时，交替提供方向选择；不降低得分或放宽硬条件。
  const previous=picked.at(-1)?.seat.region;
  const opposite={北:'南',南:'北'}[previous]||'北';
  const alternate=prefs.window&&previous?ranked.findIndex(r=>r.score===ranked[0].score&&r.seat.window&&r.seat.region===opposite):-1;
  picked.push(ranked.splice(alternate>=0?alternate:0,1)[0]);
 }
 return picked.map((r,i)=>({...r,rank:i+1}));
}
