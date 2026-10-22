import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {buildExterior, buildLibraryFloors, FLOOR_INFO} from './architecture.js';
import {buildLibraryEnvironment} from './library-environment.js';
const $=id=>document.getElementById(id),host=$('viewport');let showFloor=()=>{};
function initModel(){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e9e7df');
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.prepend(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(38,1,.1,600), controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=12;controls.maxDistance=360;
 scene.add(new THREE.HemisphereLight('#fffaf0','#aabb9b',2.5));const sun=new THREE.DirectionalLight('#fff6e3',3);sun.position.set(-18,50,30);scene.add(sun);
 const materials=new Map();
 function material(color,options={}){const key=color+JSON.stringify(options);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.8,...options}));return materials.get(key);}
 function group(parent,name){const g=new THREE.Group();g.name=name;parent.add(g);return g;}
 function box(parent,name,w,h,d,x,y,z,color,options={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color,options));m.name=name;m.position.set(x,y,z);parent.add(m);return m;}
 function cylinder(parent,name,r,h,x,y,z,color,rTop=r){const m=new THREE.Mesh(new THREE.CylinderGeometry(rTop,r,h,12),material(color));m.name=name;m.position.set(x,y,z);parent.add(m);return m;}
 function plant(parent,x,z,scale=1){const g=group(parent,'planter');g.position.set(x,0,z);g.scale.setScalar(scale);cylinder(g,'pot',.35,.6,0,.3,0,'#b99d79',.48);cylinder(g,'stem',.04,1.4,0,1,0,'#687650');for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.4,10,6),material('#73976d'));m.position.set(Math.cos(i*2)*.2,1.35+i*.12,Math.sin(i*2)*.2);g.add(m);}return g;}
 function table(parent,x,z,w=2.5,d=1.3){const g=group(parent,'table');g.position.set(x,0,z);box(g,'oak_worktop',w,.13,d,0,.83,0,'#cbb891');for(const a of [-w/2+.18,w/2-.18])for(const b of [-d/2+.15,d/2-.15])box(g,'table_leg',.08,.77,.08,a,.39,b,'#a2aaa0');return g;}
 function chair(parent,x,z,rot=0,col='#738f86'){const g=group(parent,'chair');g.position.set(x,0,z);g.rotation.y=rot;box(g,'seat',.64,.12,.63,0,.56,0,col);box(g,'back',.64,.62,.1,0,.92,-.27,col);for(const a of [-.24,.24])for(const b of [-.23,.23])box(g,'leg',.045,.5,.045,a,.25,b,'#68736d');return g;}
 const helpers={group,box,cylinder,material,plant,table,chair};
 box(scene,'ground',260,.2,340,0,-1.7,-35,'#e4e4d8');
 const campus=group(scene,'campus');const details=buildExterior(campus,helpers);buildLibraryEnvironment(details.rearLibrary,helpers);
 const rear=details.rearLibrary.clone(true);rear.position.z=0;scene.add(rear);
 const floorsRoot=group(scene,'library_cutaway'),floors=buildLibraryFloors(floorsRoot,helpers);
 let floor=0,view='rear',expanded=false,showFurniture=true,selectedZone=null,dirty=true,labelOn=true;
 // 定位层只生成平面边框。它不创建新桌椅，也不改变既有家具的位置。
 const highlight=group(scene,'information_highlight');
 const zoneLabels=Array.from({length:18},()=>{const el=document.createElement('div');el.className='label';$('labels').append(el);return el;});
 const height=n=>(n-1)*(expanded?9:floors.height);
 function updateHighlight(){
   while(highlight.children.length){const obj=highlight.children[0];obj.geometry?.dispose();highlight.remove(obj);}
   const z=FLOOR_INFO.find(f=>f.n===floor)?.zones.find(z=>z.label===selectedZone);
   if(!z||!['cut','top'].includes(view))return;
   const y=height(floor)+.4;
   for(const dx of [-z.w/2,z.w/2])box(highlight,'reference_highlight_border',.13,.06,z.d,z.x+dx,y,z.z,'#285e50');
   for(const dz of [-z.d/2,z.d/2])box(highlight,'reference_highlight_border',z.w,.06,.13,z.x,y,z.z+dz,'#285e50');
 }
 function sync(){
   dirty=true;campus.visible=view==='campus';rear.visible=view==='rear';floorsRoot.visible=['cut','top'].includes(view);
   for(const f of floors.storeys){f.root.visible=!floor||f.info.n===floor;f.root.position.y=height(f.info.n);f.furniture.visible=showFurniture;
     for(const m of f.structural.children)if(m.name.includes('beam'))m.visible=view!=='top'&&!showFurniture;
   }
   const info=FLOOR_INFO.find(f=>f.n===floor);
   $('floorTitle').textContent=view==='campus'?'主一至主五 · 校园建筑意象':view==='rear'?'主三背面 · 图书馆与湖畔':info?`${floor}F · ${info.title}`:'五层整体 · 馆藏与结构示意';
   $('floorSummary').textContent=['cut','top'].includes(view)?info?info.summary+' 位置以当前官方目录和现场标识为准。':'一楼待核对；二至五楼使用2025馆藏导览的相对分区。模型尺寸不是实测。':'原有建筑外观、主三背面、标识、湖畔和平台继续使用。点击馆舍可进入剖切。';
   $('floorText').textContent=info?info.zones.map(z=>z.label).join(' · '):'';
   $('expand').disabled=!!floor||!['cut','top'].includes(view);
   document.querySelectorAll('[data-floor]').forEach(b=>{const active=+b.dataset.floor===floor&&['cut','top'].includes(view);b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
   for(const id of ['campus','rear','cut','top'])$(id).classList.toggle('active',view===id);
   updateHighlight();
 }
 function setView(v){view=v;sync();const y=floor?height(floor):expanded?18:9;
   if(v==='campus'){camera.position.set(130,106,175);controls.target.set(0,16,-28);}
   else if(v==='rear'){camera.position.set(78,58,-125);controls.target.set(0,8,-26);}
   else if(v==='top'){camera.position.set(0,y+92,.001);controls.target.set(0,y,0);}
   else{camera.position.set(floor?44:61,y+(expanded&&!floor?55:36),floor?58:77);controls.target.set(0,y+1,0);}
   controls.update();dirty=true;
 }
 function selectFloor(n,zone=null){floor=Math.max(0,Math.min(5,Number(n)||0));selectedZone=zone;setView(view==='top'?'top':'cut');}
 showFloor=selectFloor;
 // 只接受父页面发来的、范围为1到5的楼层消息，不接受字符串脚本。
 window.addEventListener('message',event=>{
  if(event.source!==window.parent || event.data?.type!=='zhizuo-floor')return;
  const n=event.data.floor;if(Number.isInteger(n)&&n>=1&&n<=5)selectFloor(n);
 });
 for(const id of ['campus','rear','cut','top'])$(id).onclick=()=>{if(id==='top'&&!floor)floor=3;setView(id);};
 document.querySelectorAll('[data-floor]').forEach(b=>b.onclick=()=>selectFloor(b.dataset.floor));
 $('resetView').onclick=()=>setView(view);$('expand').onchange=()=>{expanded=$('expand').checked;setView(view);};
 $('furniture').onchange=()=>{showFurniture=$('furniture').checked;sync();};$('labelToggle').onchange=()=>{labelOn=$('labelToggle').checked;dirty=true;};
 $('snapshot').onclick=()=>{renderer.render(scene,camera);renderer.domElement.toBlob(blob=>{if(!blob)return;const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=`嘉庚知座_${view}_${floor||'五层'}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('viewStatus').textContent='已发起保存效果图；任务卡文字不包含在三维截图内。';});};
 const raycaster=new THREE.Raycaster();let start=null;
 renderer.domElement.addEventListener('pointerdown',e=>start={x:e.clientX,y:e.clientY});
 renderer.domElement.addEventListener('pointerup',e=>{if(!start||Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)return;const rect=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);
   if(view==='campus'){const hit=raycaster.intersectObject(campus,true)[0];if(hit){let p=hit.object;while(p&&!p.userData.main3)p=p.parent;if(p)setView('rear');}}
   else if(view==='rear'){const hit=raycaster.intersectObject(rear,true)[0];if(hit&&!/lake|shore|walk|ground/.test(hit.object.name)){floor=0;setView('cut');}}
   else{const hit=raycaster.intersectObjects(floors.storeys.filter(f=>f.root.visible).map(f=>f.root),true)[0];if(hit){let p=hit.object;while(p&&!p.userData.floor)p=p.parent;if(p)selectFloor(p.userData.floor);}}
 });
 function resize(){renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();dirty=true;}new ResizeObserver(resize).observe(host);resize();setView('rear');
 function animate(){const moved=controls.update();if(moved||dirty){renderer.render(scene,camera);dirty=false;}
   const zones=FLOOR_INFO.find(f=>f.n===floor)?.zones||[];
   for(let i=0;i<zoneLabels.length;i++){const el=zoneLabels[i],z=zones[i];el.textContent=z?.label||'';if(z&&labelOn&&showFurniture&&['cut','top'].includes(view)){
     const p=new THREE.Vector3(z.x,height(floor)+2.6,z.z).project(camera);el.style.left=(p.x*.5+.5)*host.clientWidth+'px';el.style.top=(-p.y*.5+.5)*host.clientHeight+'px';el.style.display=Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z<1?'block':'none';
   }else el.style.display='none';}requestAnimationFrame(animate);
 }requestAnimationFrame(animate);
 // 调试接口用于验证家具的局部位置不变。楼层拉开是模型观看方式，不是搬楼板。
 function furnitureSignature(){return floors.storeys.map(f=>{const items=[];f.furniture.traverse(o=>{items.push([o.name,...o.position.toArray(),...o.rotation.toArray().slice(0,3)]);});return items;});}
 window.zhizuoModel={selectFloor,setView,getState:()=>({view,floor,selectedZone,visibleFloors:floors.storeys.filter(f=>f.root.visible).map(f=>f.info.n),expanded,showFurniture,triangles:renderer.info.render.triangles,furnitureSignature:furnitureSignature(),hasMovingFurniture:false})};
}
try{initModel();}catch(error){document.body.classList.add('no3d');$('modelError').textContent='三维显示暂不可用。可点击楼层查看分区文字，或返回主页面查看候选。';$('snapshot').disabled=true;showFloor=n=>{
 const info=FLOOR_INFO.find(f=>f.n===n);$('floorTitle').textContent=info?`${n}F · ${info.title}`:'楼层文字参考';$('floorSummary').textContent=info?info.summary:'模型仅用于导览参考，当前状态未核验。';$('floorText').textContent=info?info.zones.map(z=>z.label).join(' · '):'';
};document.querySelectorAll('[data-floor]').forEach(b=>b.onclick=()=>showFloor(+b.dataset.floor));}
