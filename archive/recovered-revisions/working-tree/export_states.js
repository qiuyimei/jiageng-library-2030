// 方案演示图来自规则引擎真实计算输出；这不是浏览器截图。
import fs from 'node:fs';
import {makeData,setScenario,RESOURCES} from './data.js';
import {recommend,classify,reserveDemo} from './engine.js';
const now=1780000000000,prefs={resource:'software',power:true,window:true,quiet:true,accessible:false,print:true,floor:0,priority:'books'};
const states=[];
for(const mode of ['normal','stale','offline','full','loaned','conflict']){
 const d=makeData(now);let p={...prefs};
 if(mode==='loaned')p.resource='loaned';
 else if(mode==='conflict'){reserveDemo(d.seats,'S4-01',now);setScenario(d,'conflict',now,'S4-01');}
 else if(mode!=='normal')setScenario(d,mode,now);
 const plan=recommend(d.seats,p,d.graph,RESOURCES,now);
 states.push({mode,plan,seats:d.seats.map(s=>({...s,state:classify(s,now)}))});
}
fs.writeFileSync(new URL('./states.json',import.meta.url),JSON.stringify(states,null,2));
