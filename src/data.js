// 所有编号、座位坐标、设施属性、书目和路径都是假数据，不代表真实馆内状态。
// 2025馆方导览只提供馆藏大类参考；没有提供这里的逐座坐标和实时接口。
import {mapPosition,routePoints} from './spatial.js';
export const SOURCES=[
 ['比赛要求','https://library.xujc.com/2026/0624/c4495a171029/page.htm'],
 ['积分专座依据','https://library.xujc.com/_t1901/2026/0901/c5024a172493/page.htm'],
 ['选座规则','https://library.xujc.com/_t1901/zwyy/list.htm'],
 ['备考联盟规则','https://library.xujc.com/2026/0909/c5024a172696/page.htm'],
 ['馆藏布局参考','https://library.xujc.com/2025/0901/c4536a161543/page.htm'],
 ['馆方座谈','https://library.xujc.com/2026/0616/c4495a170597/page.htm'],
 ['哈佛空间筛选','https://library.harvard.edu/services-tools/find-space'],
 ['康奈尔馆藏与楼层图','https://olinuris.library.cornell.edu/olin-floor-maps/olin-fifth-floor'],
 ['牛津资料获取','https://www.bodleian.ox.ac.uk/services/borrow/request'],
 ['昆士兰拥挤度','https://web.library.uq.edu.au/visit/using-library-study-spaces/study-space-availability']
];
export const RESOURCES=[
 {id:'own',title:'自带材料或使用电子资料',subject:'none',mode:'own'},
 {id:'literature',title:'演示条目 文学阅读资料',subject:'literature',mode:'shelf',node:'books3'},
 {id:'software',title:'演示条目 数据库学习资料',subject:'software',mode:'shelf',node:'books4'},
 {id:'economy',title:'演示条目 经济学学习资料',subject:'economy',mode:'shelf',node:'books2'},
 {id:'special',title:'演示条目 限指定地点阅览资料',subject:'literature',mode:'request',allowedFloors:[3]},
 {id:'loaned',title:'演示条目 已借出的资料',subject:'software',mode:'loaned'},
 {id:'unknown',title:'演示条目 位置正在调整',subject:'software',mode:'unknown'}
];
export const SUBJECTS=['service','economy','literature','software','periodicals'];
export const FLOOR_NAMES=['服务区域示意','经济与社科示意','文学与语言示意','工程技术示意','报刊与专座示意'];

export function makeData(now) {
  const graph={entry:[],print:[]}, seats=[];
  // 每条连接使用无量纲的路径代价。accessible 表示演示图里是否允许少楼梯路径。
  const edge=(a,b,weight,accessible=true)=>{
    graph[a]??=[];graph[b]??=[];
    graph[a].push({to:b,weight,accessible});graph[b].push({to:a,weight,accessible});
  };
  const walk=(a,b)=>{
    const points=routePoints([a,b],seats);
    return points.slice(1).reduce((sum,p,i)=>sum+Math.abs(p.x-points[i].x)+Math.abs(p.z-points[i].z),0);
  };
  for(let f=1;f<=5;f++){
    graph['hall'+f]=[];graph['books'+f]=[];
    edge('hall'+f,'books'+f,walk('hall'+f,'books'+f));
    graph['elevator'+f]=[];edge('hall'+f,'elevator'+f,walk('hall'+f,'elevator'+f));
    if(f>1){edge('hall'+(f-1),'hall'+f,12,false);edge('elevator'+(f-1),'elevator'+f,18,true);}
    for(let i=1;i<=12;i++){
      const id=`S${f}-${String(i).padStart(2,'0')}`,node='seat'+id;
      const point=mapPosition({id,floor:f});
      seats.push({id,node,floor:f,...point,
        subject:SUBJECTS[f-1],policy:f===5?'exclusive':'ordinary',
        booking:i===3?'reserved':i===6?'away':'free',
        observed:i%5===0?'occupied':i===8?'items':i===11?'unknown':'clear',
        quality:i===11?.3:.95,obsAt:now,rulesAt:now,ruleOnline:true,
        power:i%3!==1,window:f===1||i<=4,quiet:i%4!==0,disabled:i===12});
      edge('hall'+f,node,walk('hall'+f,node));
    }
  }
  edge('entry','hall1',walk('entry','hall1'));edge('hall1','print',walk('hall1','print'));
  return {seats,graph};
}

export function setScenario(data,name,now,selectedId=null){
  // 演示情境只改变内存数据。没有随机伪装成实际馆内刷新。
  for(const s of data.seats){s.obsAt=now;s.rulesAt=now;s.ruleOnline=true;}
  if(name==='stale')for(const s of data.seats)s.obsAt=now-120_000;
  if(name==='offline')for(const s of data.seats)s.ruleOnline=false;
  if(name==='full')for(const s of data.seats)if(s.policy==='ordinary'&&s.booking==='free')s.observed='occupied';
  if(name==='conflict'){
    const s=data.seats.find(x=>x.id===selectedId)||data.seats.find(x=>x.booking==='free'&&x.observed==='clear'&&!x.disabled);
    if(s)s.observed='occupied';
  }
  return data;
}
