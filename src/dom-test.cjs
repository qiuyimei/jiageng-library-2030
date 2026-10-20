// 在内存DOM替身中检查界面事件与逻辑连接，不是浏览器兼容或像素验收。
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
class Element{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.value='';this.checked=false;this.hidden=false;this.disabled=false;this.attrs={};this.handlers={};this.files=[];this.dataset={};}
 append(...nodes){this.children.push(...nodes);if(this.id==='resource'&&!this.value)this.value=nodes[0].value;}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]||null;}
 addEventListener(name,fn){this.handlers[name]=fn;}contains(){return false;}click(){if(this.onclick)this.onclick();}
 get selectedOptions(){return [{textContent:this.value}];}
}
const html=fs.readFileSync(__dirname+'/dist/规则与感知技术演示.html','utf8'),ids={};
for(const m of html.matchAll(/\bid="([^"]+)"/g)){ids[m[1]]=new Element();ids[m[1]].id=m[1];}
ids.power.checked=true;ids.quiet.checked=true;ids.floorFilter.value='0';ids.priority.value='books';ids.scenario.value='normal';
const document={getElementById:id=>ids[id],createElement:t=>new Element(t),createElementNS:(ns,t)=>new Element(t),activeElement:null};
const context={document,window:{addEventListener:()=>{}},Date,Blob,URL,setTimeout:()=>{},setInterval:()=>{},console};
vm.runInNewContext(html.match(/<script>([\s\S]*)<\/script>/)[1],context,{timeout:5000});
const api=context.window.zhizuo;
assert.ok(api.getPlan().items.length);assert.equal(ids.floors.children.length,5);assert.ok(ids.map.children.length>12);
assert.equal(ids.modelPanel.hidden,true);assert.equal(ids.modelFrame.dataset.loaded,'0');assert.equal(ids.modelFrame.src,undefined);
ids.modelTab.onclick();assert.equal(ids.modelPanel.hidden,false);assert.equal(ids.modelFrame.src,'建筑与五层展示.html');assert.equal(ids.modelFrame.dataset.loaded,'1');
ids.modelTab.onclick();assert.equal(ids.modelPanel.hidden,true);assert.equal(ids.modelFrame.src,'about:blank');assert.equal(ids.modelFrame.dataset.loaded,'0');
const boardButtons=()=>ids.seatBoard.children.flatMap(row=>row.children[1].children);
assert.equal(boardButtons().length,60);assert.ok(boardButtons().every(b=>/^[北南东][1-9]\d*$/.test(b.children[1].textContent)));assert.ok(!ids.route.textContent.includes('S4-'));assert.equal(boardButtons().filter(b=>b.dataset.rank).length,4);
const fourth=boardButtons().find(b=>b.dataset.rank==='4');assert.ok(fourth);fourth.onclick();assert.equal(api.getSelection().selected,fourth.dataset.seat);assert.equal(api.getSelection().floor,Number(fourth.dataset.seat[1]));
ids.resource.value='loaned';ids.form.handlers.submit({preventDefault(){}});assert.equal(api.getPlan().items.length,0);
ids.resource.value='own';ids.form.handlers.submit({preventDefault(){}});assert.ok(api.getPlan().items.length);
ids.power.handlers.change();assert.equal(api.getPlan(),null);
assert.equal(boardButtons().filter(b=>b.dataset.rank).length,0);
ids.scenario.value='stale';ids.scenario.onchange();assert.equal(api.getPlan().items.length,0);
assert.equal(boardButtons().filter(b=>b.dataset.rank).length,0);
ids.clear.onclick();assert.equal(api.getPlan(),null);assert.equal(api.getData().seats.length,60);
fs.writeFileSync(__dirname+'/dom-results.json',JSON.stringify({passed:12,scope:'内存DOM替身集成检查，含60椅位、四级排序、点击联动、失效熄灭及三维按需加载/收起卸载；非真实浏览器/布局/WebGL验收'},null,2));
console.log('PASS 12 DOM event integration checks');
