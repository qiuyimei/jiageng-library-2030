import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRuleInput, evaluateLegacyCandidate, createPilotState, pilotReducer, mapRuleObservationToPilot, selectResourceEntries} from '../training-engine.mjs';
const normal = {zone:'B',people:4,confidence:.9,durationSec:150,vacancySec:0,acoustic:true,available:true,objection:false,sensorFault:false,reserved:false};
test('合格B区输入产生候选',()=>assert.equal(evaluateLegacyCandidate(normal).allowed,true));
for(const [name,patch,reason] of [
  ['固定静音',{zone:'A'},'convertible'],['低置信度',{confidence:.4},'confidence'],
  ['持续不足',{durationSec:119},'duration'],['容量超限',{people:13},'capacity'],
  ['声学未通过',{acoustic:false},'acoustic'],['异议',{objection:true},'objection'],
  ['预约',{reserved:true},'reservation'],['故障',{sensorFault:true},'sensor'],['不可用',{available:false},'available']
]) test(name+'阻止转换',()=>assert.ok(evaluateLegacyCandidate({...normal,...patch}).failed.includes(reason)));
test('冷却未结束阻止建议',()=>assert.ok(evaluateLegacyCandidate(normal,32400,33000).failed.includes('cooldown')));
for(const [name,patch] of [['额外身份字段',{name:'测试'}],['负人数',{people:-1}],['小数人数',{people:3.5}],['字符串置信度',{confidence:'0.9'}],['非布尔条件',{reserved:'false'}],['非法区域',{zone:'Z'}],['超限时间',{vacancySec:7201}]]) test(name+'拒绝导入',()=>assert.throws(()=>validateRuleInput({...normal,...patch})));
test('没有待审建议不能批准',()=>assert.equal(pilotReducer(createPilotState(3),{type:'approve',expectedVersion:0}).result,'no-pending'));
test('请求到批准只改变申请楼层',()=>{const others=Array.from({length:5},(_,i)=>createPilotState(i+1));let st=pilotReducer(others[2],{type:'request'}).state;assert.equal(st.mode,'normal');st=pilotReducer(st,{type:'approve',expectedVersion:0}).state;assert.equal(st.mode,'active');assert.equal(others[2].mode,'normal');assert.equal(others[4].mode,'normal');});
test('修改条件立即使待审建议失效',()=>{let st=pilotReducer(createPilotState(3),{type:'request'}).state;st=pilotReducer(st,{type:'conditions',reserved:true}).state;assert.equal(st.pending,null);assert.equal(st.version,1);assert.equal(pilotReducer(st,{type:'approve',expectedVersion:0}).result,'no-pending');});
test('版本不一致禁止旧批准',()=>{const st=pilotReducer(createPilotState(3),{type:'request'}).state;assert.equal(pilotReducer(st,{type:'approve',expectedVersion:99}).result,'stale-approval');});
test('五楼只激活静音提示',()=>{const st=pilotReducer(createPilotState(5),{type:'request'}).state;assert.equal(pilotReducer(st,{type:'approve',expectedVersion:0}).result,'quiet-prompts-only');});
const active=()=>pilotReducer(pilotReducer(createPilotState(3),{type:'request'}).state,{type:'approve',expectedVersion:0}).state;
test('无人未满300秒不恢复',()=>assert.equal(pilotReducer(active(),{type:'restore',vacancySec:299,staffConfirmed:true}).result,'wait-for-continuous-vacancy'));
test('实体复原没有馆员确认不完成',()=>assert.equal(pilotReducer(active(),{type:'restore',vacancySec:300}).result,'await-staff-confirmation'));
test('恢复后冷却并阻止再次申请',()=>{const st=pilotReducer(active(),{type:'restore',vacancySec:300,staffConfirmed:true}).state;assert.equal(pilotReducer(st,{type:'request'}).result,'blocked');assert.equal(pilotReducer(st,{type:'advance',seconds:599}).result,'cooldown-not-finished');assert.equal(pilotReducer(st,{type:'advance',seconds:600}).state.cooldown,false);});
test('进行中有异议进入人工审核',()=>{const st=pilotReducer(active(),{type:'conditions',objection:true}).state;assert.equal(st.manualReview,true);assert.equal(pilotReducer(st,{type:'restore',vacancySec:300,staffConfirmed:true}).result,'manual-review');});
test('无同意不返回资源',()=>assert.deepEqual(selectResourceEntries('生态',false,[{tags:['生态']}]),[]));
test('无匹配也保留通用检索',()=>assert.equal(selectResourceEntries('材料',true,[{title:'目录',url:'https://catalog.xujc.com',tags:[],generic:true}]).length,1));
test('映射不会授权实体动作',()=>{const x=mapRuleObservationToPilot({people:4,source:'simulation'},{floor:3,zoneId:'WEST_EXHIBITION_CANDIDATE'});assert.equal(x.conversionAuthorized,false);assert.equal(x.floor,3);});
test('拒绝将真实数据混入教学模拟',()=>assert.throws(()=>mapRuleObservationToPilot({people:4,source:'live'},{floor:3,zoneId:'X'})));
