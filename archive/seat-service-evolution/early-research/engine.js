// 嘉庚知座的纯逻辑模块。这里不访问摄像头、不访问校内系统，也不操作网页。
// 纯逻辑的意义是：同一份输入总得到同一份结果，便于测试和学习。
export const STATE = {
  candidate: {label:'可选候选', color:'#22765c'},
  occupied: {label:'实际有人', color:'#b55246'},
  protected: {label:'使用权保留', color:'#a57926'},
  unknown: {label:'状态待核对', color:'#687a88'},
  unavailable: {label:'条件不允许', color:'#7a6585'},
  mine: {label:'本次模拟预约', color:'#286da0'}
};
// 这是演示中使用的数据时效阈值，不是图书馆正式发布的规则。
export const MAX_AGE = 90_000;

export function classify(seat, now) {
  // 使用权规则先判断。无人或摄像头掉线，都不会消除已有的合法预约。
  if (seat.booking === 'reserved' || seat.booking === 'away')
    return {kind:'protected', reason:seat.booking==='away'?'合法暂离，保留原使用权':'已有预约，不向他人推荐'};
  if (seat.policy !== 'ordinary')
    return {kind:'protected', reason:'模拟专座或限制区域，本会话未取得使用资格'};
  // timestamp 是毫秒时间戳；缺失、来自未来或过期都属于不可信记录。
  const fresh = t => Number.isFinite(t) && t <= now && now-t <= MAX_AGE;
  if (!seat.ruleOnline || !fresh(seat.rulesAt))
    return {kind:'unknown', reason:'使用规则接口离线或记录过期'};
  if (!fresh(seat.obsAt) || !Number.isFinite(seat.quality) || seat.quality < 0.7 || seat.quality > 1 || seat.observed==='unknown')
    return {kind:'unknown', reason:'观测过期、遮挡或质量不足'};
  if (seat.observed==='occupied')
    return {kind:'occupied', reason:seat.booking==='mine'?'本次模拟预约与现场观测冲突，请核对':'检测到有人，暂不推荐'};
  if (seat.observed==='items')
    return {kind:'unknown', reason:'未见人但有物品，不能认定为空座'};
  // 未定义的观测值必须拒绝，不能因拼写错误默认变绿。
  if (seat.observed!=='clear') return {kind:'unknown', reason:'观测状态不支持'};
  if (seat.disabled) return {kind:'unavailable', reason:'模拟设施维护中'};
  if (seat.booking==='mine') return {kind:'mine', reason:'仅演示中确认，未在馆方系统预约'};
  if (seat.booking!=='free') return {kind:'unknown', reason:'预约状态不支持'};
  return {kind:'candidate', reason:'演示观测与模拟规则均允许，真实使用仍需官方确认'};
}

// Dijkstra 求图上的最短路。图里的边是通道连接，不是图片中的直线。
export function shortest(graph, start, end, accessible=false) {
  if (!graph[start] || !graph[end]) return null;
  const distance = {[start]:0}, previous={}, pending = new Set(Object.keys(graph));
  while (pending.size) {
    let u=null;
    for (const n of pending) if (u===null || (distance[n]??Infinity)<(distance[u]??Infinity)) u=n;
    if (!Number.isFinite(distance[u])) break;
    pending.delete(u); if(u===end) break;
    for(const edge of graph[u]) {
      if(accessible && !edge.accessible) continue;
      if(!pending.has(edge.to) || !Number.isFinite(edge.weight) || edge.weight<0) continue;
      const alt=distance[u]+edge.weight;
      if(alt<(distance[edge.to]??Infinity)){distance[edge.to]=alt;previous[edge.to]=u;}
    }
  }
  if(!Number.isFinite(distance[end]))return null;
  const path=[end];while(path[0]!==start){if(!previous[path[0]])return null;path.unshift(previous[path[0]]);}
  return {cost:distance[end], path};
}

// 只有最多两个任务停靠点，所以枚举访问顺序足够，不需要复杂优化模型。
export function route(graph, stops, target, accessible=false) {
  const orders=stops.length===2?[stops,[...stops].reverse()]:[stops];
  let best=null;
  for(const order of orders) {
    const nodes=['entry',...order,target];let cost=0,path=['entry'],valid=true;
    for(let i=1;i<nodes.length;i++){
      const part=shortest(graph,nodes[i-1],nodes[i],accessible);
      if(!part){valid=false;break;}cost+=part.cost;path.push(...part.path.slice(1));
    }
    if(valid&&(!best||cost<best.cost))best={cost,path,stops:order};
  }
  return best;
}

export function recommend(seats, prefs, graph, resources, now) {
  const source=resources.find(r=>r.id===prefs.resource)||resources[0];
  const warnings=[];
  // 所有书目都是演示条目。缺少获取条件时，停止资料相关推荐，而不是编造位置。
  if(source.mode==='loaned') return {items:[],warnings:['演示资料已借出。请选择自带材料或另一演示条目。'],source};
  if(source.mode==='unknown') return {items:[],warnings:['资料位置未确认，无法形成可靠的取书与选座组合。'],source};
  if(source.mode==='request') warnings.push('演示资料需要申请调取；以下展示阅览位置，不代表资料已经到馆。');
  const stops=[];
  if(source.mode==='shelf')stops.push(source.node);
  if(prefs.print)stops.push('print');
  const items=[];
  for(const seat of seats){
    const state=classify(seat,now);
    // 硬条件先过滤：可使用、插座、指定楼层、资料阅览范围和路线通达。
    if(!['candidate','mine'].includes(state.kind))continue;
    if(prefs.power&&!seat.power)continue;
    if(prefs.floor&&seat.floor!==prefs.floor)continue;
    if(source.allowedFloors&&!source.allowedFloors.includes(seat.floor))continue;
    const trip=route(graph,stops,seat.node,prefs.accessible);
    if(!trip)continue;
    const subject=source.subject==='none'||seat.subject===source.subject;
    const reasons=[],tradeoffs=[];
    let score=100-trip.cost*1.2;
    if(subject){score+=prefs.priority==='books'?35:15;reasons.push(source.subject==='none'?'本次自带材料，不要求靠近特定书架':'匹配本次馆藏主题');}
    else tradeoffs.push('与本次馆藏主题不在同一区域');
    if(seat.power)reasons.push('示意插座可用');
    if(prefs.window){if(seat.window){score+=18;reasons.push('匹配临窗偏好');}else tradeoffs.push('不是临窗位置');}
    if(prefs.quiet){if(seat.quiet){score+=22;reasons.push('标注为静读区域');}else tradeoffs.push('未标注为静读区域');}
    if(prefs.priority==='walk')score-=trip.cost*1.5;
    reasons.push(`模拟路径代价 ${trip.cost}，不是实测米数或分钟`);
    items.push({seat,state,score,trip,reasons,tradeoffs});
  }
  // 排序分数表示相对偏好，不是“满意度概率”，也不是检测置信度。
  items.sort((a,b)=>b.score-a.score||a.seat.id.localeCompare(b.seat.id));
  if(!items.length)warnings.push('没有满足必须条件的候选。请主动调整条件，系统不会放宽使用权规则。');
  return {items:items.slice(0,3),warnings,source};
}

export function summarize(seats,now) {
  return [1,2,3,4,5].map(floor=>{
    const row={floor,total:0,candidate:0,occupied:0,protected:0,unknown:0,unavailable:0,mine:0};
    for(const seat of seats.filter(s=>s.floor===floor)){row.total++;row[classify(seat,now).kind]++;}
    return row;
  });
}

export function reserveDemo(seats,id,now) {
  const seat=seats.find(s=>s.id===id);
  if(!seat||classify(seat,now).kind!=='candidate')return {ok:false,message:'状态已变化，模拟确认失败，请重新选择。'};
  // 这里只修改本页的假数据；不是对真实座位上锁，也没有调用馆方服务。
  seat.booking='mine';return {ok:true,message:'本次模拟预约已确认；真实预约仍需馆方系统办理。'};
}

export function recheck(seats,id,now){
  const seat=seats.find(s=>s.id===id);
  if(!seat)return {kind:'unknown',reason:'座位不存在'};
  const state=classify(seat,now);
  if(seat.booking==='mine'&&state.kind!=='mine')
    return {...state,reason:state.reason+'。保留模拟预约记录，不自动取消或处罚。',conflict:true};
  return state;
}
