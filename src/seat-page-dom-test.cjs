// 只使用内存DOM替身，不启动浏览器或预览服务。检查实际打包脚本的页面导航和登记事件。
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class E{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.value='';this.checked=false;this.disabled=false;this.hidden=false;this.style={};this.dataset={};this.attrs={};this.events={};}
 append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=[...nodes];}
 setAttribute(k,v){this.attrs[k]=String(v);}addEventListener(k,f){this.events[k]=f;}scrollIntoView(){}
 querySelector(selector){const id=selector.match(/data-seat="([^"]+)"/)?.[1];return this.children.find(e=>e.attrs?.['data-seat']===id)||null;}
}
const html=fs.readFileSync(__dirname+'/dist/嘉庚知座.html','utf8'),script=html.match(/<script>([\s\S]*)<\/script>/)[1],storage=new Map();
function boot(checkin=false,Recognition=null){
 const ids={};for(const m of html.matchAll(/\bid="([^"]+)"/g))ids[m[1]]=new E();
 ids.subject.value='own';ids.searchRange.value='current';ids.duration.value='120';
 const events={},timers=[],window={addEventListener:(n,f)=>events[n]=f},document={getElementById:id=>ids[id],createElement:t=>new E(t),createElementNS:(ns,t)=>new E(t),createTextNode:t=>({textContent:t}),addEventListener:(n,f)=>events[n]=f,hidden:false};
 const context={document,window,SpeechRecognition:Recognition,location:{search:checkin?'?mode=checkin':'',hash:'',hostname:''},history:{replaceState(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},URLSearchParams,Date,Math,console,setTimeout(){},clearTimeout(){},setInterval:f=>timers.push(f)};
 vm.runInNewContext(script,context,{timeout:10000});return {ids,api:window.zhizuoSeatPage,events,timers,document};
}
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name);}
const a=boot(),i=a.ids;
test('初始为五层入口且不加载三维',()=>{assert.equal(i.floorCards.children.length,5);assert.equal(a.api.getState().floor,0);assert.equal((html.match(/<iframe/g)||[]).length,0);});
i.floorCards.children[0].onclick();
test('点击一楼进入独立楼层界面',()=>{assert.equal(a.api.getState().floor,1);assert.equal(i.landing.hidden,true);assert.equal(i.floorView.hidden,false);});
test('完整清单每页16个，默认只显示适配窗口的平面',()=>{assert.equal(i.seatCards.children.length,16);assert.equal(i.nextPage.disabled,false);assert.ok(a.api.getState().seatCount>500);assert.equal(i.listContent.hidden,true);assert.equal(i.planPanel.hidden,false);assert.equal(i.floorPlan.style.height,'100%');assert.equal(i.floorPlan.style.width,'100%');});
test('展示模式无需手动载入就能生成四优先',()=>{i.preferenceForm.onsubmit({preventDefault(){}});assert.equal(a.api.getState().recommendations.length,4);assert.equal(a.api.getState().demo,true);});
test('列表与平面互斥显示，不重复铺满页面',()=>{i.showList.onclick();assert.equal(i.listContent.hidden,false);assert.equal(i.planPanel.hidden,true);i.showMap.onclick();assert.equal(i.listContent.hidden,true);assert.equal(i.planPanel.hidden,false);});
test('下一页继续列出本层座位',()=>{const text=i.seatCards.children[0].children[0].textContent;i.nextPage.onclick();assert.equal(a.api.getState().page,1);assert.notEqual(i.seatCards.children[0].children[0].textContent,text);});
i.floorNav.children[2].onclick();
test('三楼有自己的完整椅位图',()=>{assert.equal(a.api.getState().floor,3);assert.ok(i.floorPlan.children.filter(e=>e.attrs?.['data-seat']).length>100);});
test('区域筛选同步卡片与平面椅位',()=>{i.regionFilter.value='南';i.regionFilter.onchange();assert.ok(i.seatCards.children.every(e=>e.children[0].textContent.startsWith('南')));assert.ok(i.floorPlan.children.filter(e=>e.attrs?.['data-seat']).every(e=>e.attrs['data-seat'].startsWith('F3-S')));});
test('选择卡片后显示登记与三维定位链接',()=>{i.seatCards.children[0].onclick();assert.equal(i.seatDetail.hidden,false);const links=i.seatDetail.children.at(-1).children;assert.ok(links.some(e=>e.href?.includes('#loc=3,')));assert.ok(links.some(e=>e.href?.includes('mode=checkin&seat=')));});
test('显式载入示例后可推荐四优先',()=>{i.exampleOnFloor.onclick();i.preferenceForm.onsubmit({preventDefault(){}});assert.equal(a.api.getState().recommendations.length,4);});
function assertTargetVisible(id){
 const g=i.floorPlan.children.find(e=>e.attrs?.['data-seat']===id);assert.ok(g,id);
 const [left,back,width,depth]=i.floorPlan.attrs.viewBox.split(' ').map(Number),x=Number(g.children[0].attrs.x)+.6,z=Number(g.children[0].attrs.y)+.43;
 assert.ok(x>=left&&x<=left+width&&z>=back&&z<=back+depth,'目标椅位必须处于放大后的可视区域');
}
test('推荐区一键聚焦本层优先座位且保持固定窗口',()=>{
 assert.equal(i.priorityTools.hidden,false);assert.equal(i.priorityJumps.children.length,4);i.focusPriorityArea.onclick();
 const s=a.api.getState();assert.equal(s.view,'map');assert.equal(s.mapFocus.ids.length,4);s.recommendations.forEach(assertTargetVisible);assert.equal(i.floorPlan.style.height,'100%');
});
test('单个优先快捷按钮直接放大目标附近',()=>{
 const id=a.api.getState().recommendations[0];i.priorityJumps.children[0].onclick();assert.equal(a.api.getState().selected,id);assert.equal(a.api.getState().mapFocus.ids.length,1);
 assert.ok(Number(i.floorPlan.attrs.viewBox.split(' ')[2])<=16.01);assertTargetVisible(id);assert.equal(i.zoomText.textContent,'推荐局部');
});
test('推荐卡片直接跳到目标列表页并标出座位',()=>{
 const id=a.api.getState().recommendations[0];i.nextPage.onclick();i.recommendations.children[0].children.at(-1).children[1].onclick();
 assert.equal(a.api.getState().view,'list');assert.equal(i.listContent.hidden,false);assert.equal(i.planPanel.hidden,true);assert.equal(i.focusPriorityArea.hidden,true);
 const b=i.seatCards.children.find(e=>e.dataset.seat===id);assert.ok(b);assert.equal(b.attrs['aria-pressed'],'true');
 const all=i.floorPlan.children.filter(e=>e.attrs?.['data-seat']).map(e=>e.attrs['data-seat']);assert.equal(a.api.getState().page,Math.floor(all.indexOf(id)/16));
});
test('列表中的第四优先快捷按钮跳到其所在页',()=>{
 const id=a.api.getState().recommendations[3];i.previousPage.onclick();i.priorityJumps.children[3].onclick();assert.equal(a.api.getState().selected,id);assert.equal(a.api.getState().view,'list');assert.ok(i.seatCards.children.some(e=>e.dataset.seat===id));
});
test('快捷定位清除会隐藏目标的浏览筛选，原推荐保留',()=>{
 const ids=[...a.api.getState().recommendations];i.regionFilter.value='东';i.stateFilter.value='occupied';i.regionFilter.onchange();i.priorityJumps.children[0].onclick();
 assert.equal(i.regionFilter.value,'');assert.equal(i.stateFilter.value,'');assert.deepEqual([...a.api.getState().recommendations],ids);assert.ok(i.seatCards.children.some(e=>e.dataset.seat===ids[0]));
});
test('推荐卡片切回座位图定位，适配窗口可恢复全层',()=>{
 i.recommendations.children[0].children.at(-1).children[0].onclick();assert.equal(a.api.getState().view,'map');assertTargetVisible(a.api.getState().selected);i.resetZoom.onclick();assert.equal(a.api.getState().mapFocus,null);assert.ok(Number(i.floorPlan.attrs.viewBox.split(' ')[2])>60);
});
test('修改需求撤回旧推荐',()=>{i.priorityJumps.children[0].onclick();i.windowPreference.checked=true;i.windowPreference.onchange();assert.equal(a.api.getState().recommendations.length,0);assert.equal(i.priorityTools.hidden,true);assert.equal(a.api.getState().mapFocus,null);});
test('带电源硬条件不暗中放宽，能显式转为跨层比较',()=>{i.powerPreference.checked=true;i.powerPreference.onchange();i.preferenceForm.onsubmit({preventDefault(){}});assert.equal(a.api.getState().recommendations.length,0);i.recommendations.children.at(-1).onclick();assert.equal(i.searchRange.value,'all');assert.equal(a.api.getState().recommendations.length,4);assert.ok(a.api.getState().recommendations.every(id=>id.startsWith('F5-')));i.powerPreference.checked=false;});
test('跨层推荐可直接切到五楼，保留四个结果及快捷入口',()=>{
 i.priorityJumps.children[1].onclick();assert.equal(a.api.getState().floor,5);assert.equal(a.api.getState().recommendations.length,4);assert.equal(i.priorityJumps.children.length,4);assertTargetVisible(a.api.getState().selected);i.resetZoom.onclick();
});
test('缩放只改变平面展示',()=>{const count=i.floorPlan.children.length;i.zoomIn.onclick();assert.equal(i.zoomText.textContent,'125%');assert.equal(i.floorPlan.children.length,count);});
// 清除主动载入的示例，保留任何本人登记；再用登记模式体验真实动作分支。
i.clearExample.onclick();const c=boot(true),j=c.ids;j.floorCards.children[0].onclick();j.seatCards.children[0].onclick();
test('移除示例后模式持续关闭，新页面不偷偷补状态',()=>{assert.equal(c.api.getState().demo,false);assert.equal(j.seatCards.children.filter(e=>e.dataset.kind==='available').length,0);});
test('登记模式显示独立登记面板',()=>{assert.equal(j.checkinPanel.hidden,false);assert.equal(j.recommendPanel.hidden,true);});
test('未确认现场核对不能入座',()=>{j.arrive.onclick();assert.ok(j.message.textContent.includes('现场'));});
test('确认入座写入本机记录并点亮有人',()=>{j.physicalConfirm.checked=true;j.arrive.onclick();assert.ok(j.seatDetail.children[1].textContent.includes('有人登记'));});
test('同一存储的新页面能读回登记',()=>{const another=boot();another.ids.floorCards.children[0].onclick();assert.ok(another.ids.seatCards.children.some(e=>e.dataset.kind==='occupied'));});
test('本人暂离与离座流程可运行',()=>{j.physicalConfirm.checked=true;j.away.onclick();assert.ok(j.seatDetail.children[1].textContent.includes('暂离登记'));j.physicalConfirm.checked=true;j.leave.onclick();assert.ok(j.seatDetail.children[1].textContent.includes('离座登记'));});
test('没有状态变化时定时器不重绘座位',()=>{const first=j.seatCards.children[0];c.timers[0]();assert.equal(j.seatCards.children[0],first);});
const parse=t=>JSON.parse(JSON.stringify(a.api.parseDemand(t)));
test('一句话提取文学、临窗和打印，尚不更改表单',()=>{assert.deepEqual(parse('我想在文学资料附近安静阅读，喜欢靠窗，稍后需要打印').patch,{subject:'literature',window:true,print:true});});
test('不靠窗、不打印与不用电源正确处理否定',()=>{assert.deepEqual(parse('我不靠窗，不需要打印，不用电源').patch,{window:false,print:false,power:false});});
test('明确楼层作为比较范围，不偷偷改成全馆',()=>{assert.deepEqual(parse('三楼读文学').patch,{subject:'literature',floor:3,range:'current'});assert.equal(parse('不限楼层，想靠窗').patch.range,'all');});
test('软电源偏好不擅自升级为必须条件',()=>{const r=parse('最好有插座');assert.equal(r.patch.power,undefined);assert.ok(r.notes.some(s=>s.includes('必须条件')));});
test('主题冲突或多层表达保留待确认',()=>{assert.equal(parse('文学和计算机，二楼三楼都可以').patch.subject,undefined);assert.equal(parse('二楼三楼').patch.floor,undefined);});
test('无法实现的相邻与噪声条件不伪造支持',()=>{const r=parse('想安静，两人一起坐相邻的位置');assert.deepEqual(r.patch,{});assert.ok(r.notes.some(s=>s.includes('尚未实现')));assert.ok(r.notes.some(s=>s.includes('噪声')));});
test('无关文字及矛盾临窗要求不编造选项',()=>{assert.deepEqual(parse('今天天气很好').patch,{});assert.equal(parse('想靠窗但又不要靠窗').patch.window,undefined);});
const v=boot(),vi=v.ids;vi.loadExample.onclick();vi.floorCards.children[2].onclick();
test('文字解析先展示条件，确认后才自动推荐',()=>{vi.voiceText.value='文学资料，喜欢靠窗，之后打印';vi.voiceParse.onclick();assert.equal(vi.subject.value,'own');assert.equal(v.api.getState().recommendations.length,0);assert.equal(vi.voiceApply.disabled,false);vi.voiceApply.onclick();assert.equal(vi.subject.value,'literature');assert.equal(vi.windowPreference.checked,true);assert.equal(vi.printPreference.checked,true);assert.equal(v.api.getState().recommendations.length,4);assert.equal(v.api.getState().selected,null);});
test('修改转写文字使未确认条件失效',()=>{vi.voiceText.value='需要插座';vi.voiceParse.onclick();assert.equal(vi.voiceApply.disabled,false);vi.voiceText.value='你好';vi.voiceText.oninput();assert.equal(vi.voiceApply.disabled,true);});
test('语音条件可切楼层，不触发到座登记',()=>{vi.voiceText.value='二楼看经济资料，不靠窗，不打印';vi.voiceParse.onclick();vi.voiceApply.onclick();assert.equal(v.api.getState().floor,2);assert.equal(vi.subject.value,'economy');assert.equal(vi.windowPreference.checked,false);assert.equal(vi.printPreference.checked,false);assert.equal(v.api.getState().checkin,false);});
(async()=>{
 await vi.voiceStart.onclick();test('不支持语音接口时提示文字与离线入口，无假转写',()=>{assert.equal(vi.voiceText.value,'');assert.equal(vi.voiceApply.disabled,true);assert.ok(vi.voiceStatus.textContent.includes('没有语音识别接口'));assert.equal(vi.localVoiceHelp.open,true);});
 let latest;class Speech{constructor(){latest=this;this.aborted=false;}start(){this.onstart?.();}stop(){this.onend?.();}abort(){this.aborted=true;}}
 const spoken=boot(false,Speech),si=spoken.ids;si.loadExample.onclick();si.floorCards.children[1].onclick();await si.voiceStart.onclick();
 const result=[{transcript:'我想三楼看文学，靠窗，之后打印'}];result.isFinal=true;latest.onresult({results:[result]});latest.onend();
 test('模拟浏览器识别结果进入可编辑文字，仍需确认',()=>{assert.equal(si.voiceText.value,'我想三楼看文学，靠窗，之后打印');assert.equal(si.subject.value,'own');assert.equal(si.voiceApply.disabled,false);si.voiceApply.onclick();assert.equal(spoken.api.getState().floor,3);assert.equal(spoken.api.getState().recommendations.length,4);});
 await si.voiceStart.onclick();latest.onerror({error:'not-allowed'});latest.onend();test('麦克风被拒时不伪造结果或推荐',()=>{assert.ok(si.voiceStatus.textContent.includes('权限'));assert.equal(si.voiceApply.disabled,true);assert.equal(si.voiceStart.disabled,false);});
 await si.voiceStart.onclick();spoken.document.hidden=true;spoken.events.visibilitychange();test('页面隐藏立即取消识别，不自动继续收音',()=>{assert.equal(latest.aborted,true);assert.equal(si.voiceStart.disabled,false);assert.equal(si.voiceStop.disabled,true);});
 fs.writeFileSync(__dirname+'/seat-page-dom-results.json',JSON.stringify({passed,scope:'实际打包脚本的内存DOM和语音回调替身检查；非真实浏览器、麦克风或跨设备同步验收'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
