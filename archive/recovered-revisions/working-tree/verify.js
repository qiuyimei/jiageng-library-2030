// 学习用的可重复检查：只使用Node自带断言和本项目服务模块，不启动浏览器。
import assert from 'node:assert/strict';
import {createPlan,SOURCES} from './service.js';
const base={task:'book',topic:'软件工程',subject:'auto',speaking:false,condition:'normal'};
let checks=0;
// 每一次check都先执行检查函数。断言失败会抛出错误，脚本不会假称通过。
function check(name,fn){fn();checks++;console.log('通过：'+name);}
check('找书先查官方目录；只显示大类参考',()=>{const p=createPlan(base);assert.equal(p.floor,4);assert(p.steps[0].includes('官方检索'));assert(p.steps.some(s=>s.includes('不能证明')));});
check('位置调整同时撤掉高亮和旧定位文字',()=>{const p=createPlan({...base,condition:'changed'});assert.equal(p.floor,0);assert.equal(p.zone,null);assert(!p.steps.some(s=>s.includes('模型定位到')));});
check('状态未知时不定位',()=>{const p=createPlan({...base,condition:'unknown'});assert.equal(p.floor,0);assert.equal(p.zone,null);});
check('研讨室已满不扩容到阅览区',()=>{const p=createPlan({...base,task:'group',speaking:true,condition:'full'});assert.equal(p.floor,0);assert.equal(p.mode,'unavailable');assert(p.steps.some(s=>s.includes('不开展有声讨论')));});
check('外部服务离线时不确认库存',()=>{const p=createPlan({...base,condition:'offline'});assert(p.cautions.some(s=>s.includes('无法确认当前库存')));});
check('没有主题索引时不编造楼层',()=>{assert.equal(createPlan({...base,topic:'没有索引的资料'}).floor,0);});
check('非法任务与情境被拒绝',()=>{assert.throws(()=>createPlan({...base,task:'move'}));assert.throws(()=>createPlan({...base,condition:'fake'}));});
check('特色资源没有虚构全文和实体位置',()=>{const p=createPlan({...base,task:'culture'});assert.equal(p.floor,0);assert(p.steps.some(s=>s.includes('不声称已取得')));});
check('280种组合都不写预约、不控设备、不改家具',()=>{
 for(const task of ['book','study','group','culture'])for(const condition of ['normal','changed','offline','full','unknown'])for(const subject of ['auto','software','architecture','history','literature','language','economics'])for(const speaking of [false,true]){
 const p=createPlan({...base,task,condition,subject,speaking});assert.equal(p.writesReservation,false);assert.equal(p.controlsEquipment,false);assert.equal(p.changesFurniture,false);assert(p.sources.every(s=>SOURCES[s]));
 }
});
console.log(`完成${checks}项服务模块检查。浏览器、图形与实地效果须另行验证。`);
