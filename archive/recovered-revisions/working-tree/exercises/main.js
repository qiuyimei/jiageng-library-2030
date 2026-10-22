// 入门工程只含十个合成座位，用来从零练习数据、规则、SVG与三维。
// 它不是主应用，也不代表馆内实时数据。每个函数都保持较短，便于独立重写。
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

// $只负责根据唯一id取元素；后面不用反复写document.getElementById。
const $ = id => document.getElementById(id);
// 主键id给程序使用，label给人看；这里只展示一层十把练习椅子。
const seats = Array.from({length:10}, (_, i) => ({
  id: 'practice-'+i,
  label: (i<5 ? '北' : '南')+(i%5+1),
  floor:1,
  x:i<5 ? -5 : 5,
  z:(i%5)*3-6,
  window:i%2===0,
  dedicated:i===9
}));
// 固定状态只是演示输入；先给几条近期离座，确保初次学习可看见推荐。
const started = Date.now();
let records = Object.fromEntries(seats.slice(0,8).map((s,i) => [s.id, {
  kind:i%3===0 ? 'occupied' : 'available',
  until:started+15*60000
}]));
// selected是选中项，ranked是候选。它们都不等于已预约。
let selected=null;
let ranked=[];
let renderer=null;
let controls=null;
let scene=null;
let camera=null;
const colors={unknown:'#7a8791',available:'#28785f',occupied:'#b65b4b',protected:'#7a6d51'};

// 第一步：把原始记录规范成状态。先保护专座，再检查时效。
function state(seat, now=Date.now()) {
  if (seat.dedicated) return 'protected';
  const record=records[seat.id];
  if (!record || !Number.isFinite(record.until) || record.until<=now) return 'unknown';
  return ['occupied','available'].includes(record.kind) ? record.kind : 'unknown';
}

// 第二步：硬资格过滤与偏好排序分开；不足四个就按实际数量显示。
function recommend() {
  const windowWanted=$('window').checked;
  ranked=seats
    .filter(s => state(s)==='available')
    .map(s => ({seat:s,score:100+(windowWanted && s.window ? 18 : 0)}))
    .sort((a,b) => b.score-a.score || a.seat.id.localeCompare(b.seat.id))
    .slice(0,4);
  draw();
}

// 第三步：用命名空间建立SVG。普通createElement不一定生成正确的SVG节点。
function svg(tag, attrs, text) {
  const node=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for (const [name,value] of Object.entries(attrs)) node.setAttribute(name,String(value));
  if (text!==undefined) node.textContent=text;
  return node;
}

// 第四步：相同座位x/z在SVG中变成x/y，和三维使用同一数组。
function drawMap() {
  const map=$('map');
  map.replaceChildren();
  const focus=seats.find(s => s.id===selected);
  // 选中后只改变观察范围，不移动椅子；复位按钮把selected清空即可。
  map.setAttribute('viewBox',focus ? `${focus.x-4} ${focus.z-4} 8 8` : '-9 -10 18 20');
  for (const seat of seats) {
    const rank=ranked.findIndex(r => r.seat.id===seat.id);
    const group=svg('g',{tabindex:0,role:'button','aria-label':seat.label+' '+state(seat)});
    group.append(svg('rect',{
      x:seat.x-1,y:seat.z-.6,width:2,height:1.2,rx:.15,
      fill:rank>=0 ? '#e3bd52' : colors[state(seat)]
    }));
    group.append(svg('text',{x:seat.x,y:seat.z+.16,'text-anchor':'middle','font-size':.45,fill:'white'},seat.label));
    // 鼠标与键盘共用同一个选择动作，避免只有鼠标能操作。
    const choose=()=>{selected=seat.id;draw();};
    group.addEventListener('click',choose);
    group.addEventListener('keydown',e=>{if(e.key==='Enter'){choose();}});
    map.append(group);
  }
}

// 第五步：候选按钮用真实文本，不能把用户输入塞进innerHTML。
function draw() {
  drawMap();
  $('results').replaceChildren();
  for (const [i,row] of ranked.entries()) {
    const button=document.createElement('button');
    button.type='button';
    button.textContent=`第${i+1}优先 ${row.seat.label} · ${row.score}分`;
    button.onclick=()=>{selected=row.seat.id;draw();};
    $('results').append(button);
  }
  const seat=seats.find(s=>s.id===selected);
  $('detail').textContent=seat ? `${seat.label}：${state(seat)}；仅为练习示意，到现场还需核对。` : '点击图中座位或优先项。';
}

// 第六步：一次简单文字解析，只认“靠窗”和否定词，先让用户确认。
let parsed=null;
$('parse').onclick=()=>{
  const text=$('demand').value.trim();
  parsed=text.includes('靠窗') ? !/不靠窗|不要靠窗/.test(text) : null;
  $('preview').textContent=parsed===null ? '未提取临窗条件，请手动选择。' : '临窗偏好：'+(parsed ? '是' : '否')+'；确认后才应用。';
  $('apply').disabled=parsed===null;
};
$('demand').oninput=()=>{parsed=null;$('apply').disabled=true;};
$('apply').onclick=()=>{if(parsed!==null){$('window').checked=parsed;recommend();}};
$('generate').onclick=recommend;
$('reset').onclick=()=>{selected=null;draw();};

// 第七步：建立十椅三维。只在点击进入时创建，返回后不常驻动画循环。
function showThree() {
  $('flat').hidden=true;
  $('three').hidden=false;
  const host=$('viewport');
  if (!renderer) {
    renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
    renderer.setSize(host.clientWidth,420);
    host.append(renderer.domElement);
    scene=new THREE.Scene();
    scene.background=new THREE.Color('#ecebe3');
    camera=new THREE.PerspectiveCamera(45,host.clientWidth/420,.1,100);
    camera.position.set(16,18,18);
    controls=new OrbitControls(camera,renderer.domElement);
    // 事件驱动绘制，没有requestAnimationFrame永久循环。
    controls.addEventListener('change',()=>renderer.render(scene,camera));
    scene.add(new THREE.HemisphereLight('#ffffff','#69856d',2));
    const ground=new THREE.Mesh(new THREE.BoxGeometry(18,.15,20),new THREE.MeshStandardMaterial({color:'#ded9c6'}));
    ground.position.y=-.1;scene.add(ground);
    for (const seat of seats) {
      const chair=new THREE.Mesh(new THREE.BoxGeometry(1,.6,1),new THREE.MeshStandardMaterial({color:'#247796'}));
      chair.position.set(seat.x,.3,seat.z);
      chair.userData.seatId=seat.id;
      scene.add(chair);
    }
  }
  const target=seats.find(s=>s.id===selected);
  controls.target.set(target?.x||0,0,target?.z||0);
  controls.update();renderer.render(scene,camera);
}
$('open3d').onclick=showThree;
// 第八步：本练习在同一页切面板，保留变量。正式项目的跨页快照见seat-navigation.js。
$('back').onclick=()=>{$('three').hidden=true;$('flat').hidden=false;draw();};
draw();

// 学完后可依次补：JSON保存、现场确认、暂离、过期测试、分页与真正的跨页恢复。
// 不要把本练习中简化的records写法当成正式系统的认证与使用权实现。
