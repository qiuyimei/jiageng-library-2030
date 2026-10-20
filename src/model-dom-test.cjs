// 模型脚本在内存DOM替身中的会话同步与退化检查，不调用真实浏览器/WebGL。
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class E{
 constructor(){this.children=[];this.handlers={};this.style={};this.dataset={};this.checked=false;this.classList={toggle:()=>{},add:()=>{}};}
 append(...n){this.children.push(...n);}replaceChildren(...n){this.children=n;}setAttribute(){}addEventListener(n,f){this.handlers[n]=f;}
}
const html=fs.readFileSync(__dirname+'/dist/建筑与五层展示.html','utf8'),ids={},floorButtons=[0,1,2,3,4,5].map(n=>{const e=new E();e.dataset.floor=String(n);return e;});
for(const m of html.matchAll(/\bid="([^"]+)"/g))ids[m[1]]=new E();
const messages=[],listeners={},parent={postMessage:r=>messages.push(r)},window={parent,addEventListener:(n,f)=>listeners[n]=f};
const document={getElementById:id=>ids[id],createElement:()=>new E(),createElementNS:()=>new E(),querySelectorAll:()=>floorButtons,body:new E()};
const c={window,document,Date,URL,Blob,AbortController,performance,devicePixelRatio:1,setInterval:()=>{},setTimeout:()=>{},console:{log(){},error(){},warn(){}}};
vm.runInNewContext(html.match(/<script>([\s\S]*)<\/script>/)[1],c,{timeout:5000});
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name);};
test('WebGL退化时保留同步数据并显示错误提示',()=>{assert.equal(ids.modelCandidates.children.length,4);assert.match(ids.modelError.textContent,/暂不可用/);assert.match(ids.taskRoute.textContent,/取书点/);});
test('模型加载向父页面请求同步',()=>assert.equal(messages[0].type,'zhizuo-ready'));
ids.modelCandidates.children[0].onclick();
test('点击候选显示对应椅位',()=>assert.match(ids.selectionTitle.textContent,/4F · [北南东][1-9]\d*/));
// 从主页面实际生成的data模块加载同一份数据，故测试用异步import初始化快照。
(async()=>{
 const {seatLabel}=await import('./spatial.js');const {makeData}=await import('./data.js'),d=makeData(Date.now()),prefs={resource:'software',power:true,print:true,priority:'books'};
 listeners.message({source:parent,data:{type:'zhizuo-state',seats:d.seats,prefs,selected:'S4-09',floor:4,generated:true}});
 test('接收父会话并显示同一编号',()=>{assert.ok(ids.selectionTitle.textContent.startsWith(seatLabel('S4-09',true)));assert.ok(ids.localControls.hidden);});
 ids.modelCandidates.children[1].onclick();
 test('子页面选择回传已知编号',()=>assert.equal(messages.at(-1).type,'zhizuo-select'));
 const before=ids.selectionTitle.textContent;
 listeners.message({source:{},data:{type:'zhizuo-state',seats:d.seats,prefs,selected:'S4-01',floor:4}});
 test('外部窗口不能改写会话',()=>assert.equal(ids.selectionTitle.textContent,before));
 listeners.message({source:parent,data:{type:'zhizuo-state',seats:d.seats,prefs,selected:'S4-09',floor:4,generated:false}});
 test('条件改变未重新生成时无旧候选',()=>{assert.equal(ids.modelCandidates.children.length,0);assert.match(ids.taskRoute.textContent,/不是当前推荐/);});
 for(const s of d.seats)s.obsAt=Date.now()-120000;
 listeners.message({source:parent,data:{type:'zhizuo-state',seats:d.seats,prefs,selected:'S4-09',floor:4,generated:true}});
 test('过期观测同步退化且撤回路线',()=>{assert.match(ids.selectionTitle.textContent,/待核对/);assert.equal(ids.modelCandidates.children.length,0);});
 fs.writeFileSync(__dirname+'/model-dom-results.json',JSON.stringify({passed,scope:'内存DOM模型消息与WebGL失败分支；不是浏览器/WebGL实测'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
