// 使用真实Three.js几何和内存事件，替换渲染器与Orbit输入层；不启动或伪造浏览器验收。
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),esbuild=require('esbuild'),THREE=require('three');
class E{
 constructor(tag='DIV'){this.tagName=tag;this.children=[];this.handlers={};this.style={};this.dataset={};this.checked=false;this.value='';this.clientWidth=850;this.clientHeight=610;this.classList={toggle(){},add(){}};}
 append(...n){this.children.push(...n);}prepend(...n){this.children.unshift(...n);}replaceChildren(...n){this.children=n;}
 setAttribute(k,v){this[k]=v;}addEventListener(n,f){(this.handlers[n]??=[]).push(f);}emit(n,e={}){for(const f of this.handlers[n]||[])f({preventDefault(){},target:this,...e});}
 focus(){}setPointerCapture(){}getBoundingClientRect(){return {left:0,top:0,width:850,height:610};}
 getContext(){return {fillRect(){},fillText(){}};}
}
let rendered=null,rendererState=null,lastScene=null;class TestRenderer{constructor(){this.domElement=new E('CANVAS');this.shadowMap={};rendererState=this;}setPixelRatio(){}setSize(){}render(scene,camera){lastScene=scene;rendered={position:camera.position.clone(),rotation:camera.rotation.clone(),fov:camera.fov};}}
class TestControls{constructor(camera,element){this.camera=camera;this.target=new THREE.Vector3();this.enabled=true;element.addEventListener('wheel',e=>{if(this.enabled)this.camera.position.sub(this.target).multiplyScalar(e.deltaY<0?.7:1/.7).add(this.target);});}update(){if(this.enabled)this.camera.lookAt(this.target);return false;}}
const template=fs.readFileSync(__dirname+'/model-template.html','utf8'),ids={};
for(const m of template.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)){const e=ids[m[1]]=new E(m[0].slice(1).split(/[\s>]/)[0].toUpperCase());e.checked=/\bchecked\b/.test(m[0]);e.value=m[0].match(/\bvalue="([^"]+)"/)?.[1]||'';}
const buttons=Array.from({length:6},(_,n)=>{const b=new E('BUTTON');b.dataset.floor=String(n);return b;}),walkButtons=['forward','back','left','right'].map(direction=>{const b=new E('BUTTON');b.dataset.walk=direction;return b;});
const listeners={},window={TestRenderer,TestControls,location:{hash:''},addEventListener:(n,f)=>(listeners[n]??=[]).push(f)};window.parent=window;
const document={getElementById:id=>ids[id],createElement:tag=>new E(tag.toUpperCase()),querySelectorAll:s=>s==='[data-floor]'?buttons:s==='[data-walk]'?walkButtons:[],body:new E(),addEventListener(){},hidden:false};
let frame=null,time=0;const c={window,document,Date,URL,Blob,AbortController,devicePixelRatio:1,performance:{now:()=>time},setInterval(){},setTimeout(){},console,ResizeObserver:class{observe(){}},requestAnimationFrame:f=>frame=f};
const source=fs.readFileSync(__dirname+'/model.js','utf8').replace('new THREE.WebGLRenderer(','new window.TestRenderer(').replace('new OrbitControls(','new window.TestControls(');
const result=esbuild.buildSync({stdin:{contents:source,resolveDir:__dirname,sourcefile:'model.js'},nodePaths:(process.env.NODE_PATH||'').split(require('node:path').delimiter).filter(Boolean),bundle:true,write:false,format:'iife',platform:'browser',target:'es2020'});
vm.runInNewContext(result.outputFiles[0].text,c,{timeout:15000});assert.ok(window.zhizuoModel,'模型初始化应完成');const originalInformation=window.zhizuoModel.getState().showInformation;
function step(){time+=30;frame();}function key(type,code){for(const f of listeners[type]||[])f({code,target:ids.viewport,preventDefault(){}});}
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name);}
test('空白单击导览按校园、馆外、整体、展开和一至五楼平面依次前进',()=>{
 step();assert.equal(window.zhizuoModel.getState().view,'campus');assert.equal(rendered.position.x,0);assert.ok(rendered.position.z>0);
 const canvas=ids.viewport.children[0];
 for(const expected of [{view:'rear',floor:0,expanded:false},{view:'cut',floor:0,expanded:false},{view:'cut',floor:0,expanded:true},...[1,2,3,4,5].map(floor=>({view:'top',floor,expanded:false}))]){
  canvas.emit('pointerdown',{clientX:1,clientY:1,pointerId:1});canvas.emit('pointerup',{clientX:1,clientY:1,pointerId:1});step();const state=window.zhizuoModel.getState();for(const key of ['view','floor','expanded'])assert.equal(state[key],expected[key]);
 }
 ids.campus.onclick();step();assert.equal(window.zhizuoModel.getState().view,'campus');
});
test('拖动后回到原点也不会误翻页，放大点选不会跳下一步',()=>{
 const canvas=ids.viewport.children[0];canvas.emit('pointerdown',{clientX:425,clientY:305,pointerId:1});canvas.emit('pointermove',{clientX:475,clientY:305});canvas.emit('pointerup',{clientX:425,clientY:305,pointerId:1});step();assert.equal(window.zhizuoModel.getState().view,'campus');
 canvas.emit('wheel',{deltaY:-100});step();assert.equal(window.zhizuoModel.getState().pointPicking,true);canvas.emit('pointerdown',{clientX:425,clientY:305,pointerId:1});canvas.emit('pointerup',{clientX:425,clientY:305,pointerId:1});step();assert.equal(window.zhizuoModel.getState().view,'campus');ids.campus.onclick();step();assert.equal(window.zhizuoModel.getState().pointPicking,false);
});
test('独立按钮进入第一人称，相机无人物',()=>{ids.walkToggle.onclick();step();assert.equal(window.zhizuoModel.getState().walking,true);assert.equal(rendered.fov,68);assert.equal(ids.walkPad.hidden,false);});
test('按前进键实际移动相机',()=>{const z=rendered.position.z;key('keydown','KeyW');for(let i=0;i<10;i++)step();key('keyup','KeyW');assert.ok(rendered.position.z<z-.5);});
test('拖动画面能够转头',()=>{const r=rendered.rotation.y;const canvas=ids.viewport.children[0];canvas.emit('pointerdown',{clientX:100,clientY:100,pointerId:1});canvas.emit('pointermove',{clientX:150,clientY:100});canvas.emit('pointerup',{});step();assert.ok(Math.abs(rendered.rotation.y-r)>.1);});
test('漫游中楼层按钮定位到三楼',()=>{buttons[3].onclick();step();assert.equal(window.zhizuoModel.getState().floor,3);assert.ok(Math.abs(rendered.position.y-11.4)<.001);});
test('触控前进按钮也移动视野',()=>{const z=rendered.position.z;walkButtons[0].emit('pointerdown',{pointerId:2});for(let i=0;i<10;i++)step();walkButtons[0].emit('pointerup');assert.ok(rendered.position.z<z-.5);});
test('失去焦点不继续移动',()=>{key('keydown','KeyW');for(const f of listeners.blur)f();step();const z=rendered.position.z;step();assert.equal(rendered.position.z,z);});
test('退出恢复观察视角及图层',()=>{key('keydown','Escape');step();assert.equal(window.zhizuoModel.getState().walking,false);assert.equal(rendered.fov,38);assert.equal(ids.walkPad.hidden,true);assert.equal(ids.informationLayer.checked,originalInformation);});
test('光影预设实际改变光源、曝光及阴影开关',()=>{ids.lightPreset.value='evening';ids.lightPreset.onchange();assert.equal(Number(ids.lightElevation.value),18);assert.equal(ids.lightElevationValue.textContent,'18°');assert.equal(rendererState.toneMappingExposure,1.05);assert.equal(lastScene.children.find(o=>o.isDirectionalLight).intensity,2.7);ids.lightShadows.checked=false;ids.lightShadows.onchange();assert.equal(rendererState.shadowMap.enabled,false);ids.lightReset.onclick();assert.equal(Number(ids.lightElevation.value),54);assert.equal(rendererState.shadowMap.enabled,true);});
test('夕阳西下有低角度暖阳、弱补光和室内阴影范围',()=>{buttons[3].onclick();step();ids.lightPreset.value='golden';ids.lightPreset.onchange();const suns=lastScene.children.filter(o=>o.isDirectionalLight);assert.equal(Number(ids.lightElevation.value),9);assert.ok(suns[0].color.r>suns[0].color.b);assert.ok(suns[1].intensity>0&&suns[1].intensity<suns[0].intensity);assert.ok(suns[0].shadow.camera.right>60&&suns[0].shadow.camera.right<75);});
test('一楼上楼口后连续前进可实际走到二楼，退出后收起室外背景',()=>{
 buttons[1].onclick();ids.walkToggle.onclick();ids.walkUp.onclick();step();assert.equal(lastScene.getObjectByName('walk_window_surroundings').visible,true);key('keydown','KeyW');for(let i=0;i<125;i++)step();key('keyup','KeyW');assert.equal(window.zhizuoModel.getState().floor,2);key('keydown','Escape');step();assert.equal(lastScene.getObjectByName('walk_window_surroundings').visible,false);
});
test('下楼口按钮后按前进能够由三楼下到二楼',()=>{buttons[3].onclick();ids.walkToggle.onclick();ids.walkStair.onclick();step();const y=rendered.position.y;key('keydown','KeyW');for(let i=0;i<99;i++)step();key('keyup','KeyW');assert.ok(rendered.position.y<y-4);assert.equal(window.zhizuoModel.getState().floor,2);key('keydown','Escape');});
test('中日交流中心按钮定位四楼及其区域',()=>{ids.cultureView.onclick();step();assert.equal(window.zhizuoModel.getState().floor,4);const centre=lastScene.getObjectByName('upper_cultural_exchange_centre').getWorldPosition(new THREE.Vector3());assert.ok(Math.abs(rendered.position.z-centre.z-26)<.01);assert.match(ids.viewStatus.textContent,/中日文化交流中心/);});
test('设施按钮分别定位报刊、咖啡厅和前台中轴',()=>{ids.periodicalsView.onclick();step();assert.equal(window.zhizuoModel.getState().floor,5);assert.match(ids.viewStatus.textContent,/现刊/);assert.match(ids.floorText.textContent,/外文原版书/);ids.cafeView.onclick();step();assert.equal(window.zhizuoModel.getState().floor,1);assert.match(ids.viewStatus.textContent,/107.*咖啡厅.*106/);ids.entranceView.onclick();step();assert.equal(window.zhizuoModel.getState().floor,1);assert.equal(rendered.position.x,0);assert.match(ids.viewStatus.textContent,/前台.*左右.*等宽/);});

test('点击实体地面直接聚焦，保持原有座位数据',()=>{
 buttons[1].onclick();ids.top.onclick();step();assert.equal(window.zhizuoModel.getState().labelOn,true);assert.ok(ids.labels.children.some(e=>/^[北南东][1-9]\d*/.test(e.textContent||'')));const selected=window.zhizuoModel.getState().selected;
 const camera=new THREE.PerspectiveCamera(rendered.fov,850/610,.06,600);camera.position.copy(rendered.position);camera.rotation.copy(rendered.rotation);camera.updateMatrixWorld();
 const p=new THREE.Vector3(-10,.16,-25).project(camera),canvas=ids.viewport.children[0],e={clientX:(p.x+1)*425,clientY:(1-p.y)*305,pointerId:2};canvas.emit('pointerdown',e);canvas.emit('pointerup',e);step();
 const state=window.zhizuoModel.getState();assert.equal(state.floor,1);assert.ok(Math.abs(state.focusTarget[0]+10)<.03&&Math.abs(state.focusTarget[2]+25)<.03);assert.equal(state.selected,selected);assert.equal(state.markers,60);
 assert.equal(window.zhizuoModel.focusPoint({x:NaN,y:0,z:0},1),false);
});
test('展开和收起画面不改变楼层与座位',()=>{const selected=window.zhizuoModel.getState().selected;ids.wideView.onclick();step();assert.equal(window.zhizuoModel.getState().wideExpanded,true);assert.equal(ids.wideTools.hidden,false);ids.wideExit.onclick();step();assert.equal(window.zhizuoModel.getState().wideExpanded,false);assert.equal(ids.wideTools.hidden,true);assert.equal(window.zhizuoModel.getState().selected,selected);});
fs.writeFileSync(__dirname+'/model-controls-results.json',JSON.stringify({passed,scope:'真实Three.js射线点选与几何、内存键盘/拖动/触控/展开/灯光事件；渲染器和Orbit输入层替身，不等于浏览器/WebGL实测'},null,2));
