/* 本人零基础学习副本：仅排版和解释，原有业务逻辑不变。
 * 全套架构、实例和修改方法请读文档及源码导航。
 */
/* 学习注释：从 three 导入模块；只有构建后单文件网页才可以直接 file 双击运行。 */
import * as THREE from 'three';
/* 学习注释：从 three/examples/jsm/controls/OrbitControls.js 导入模块；只有构建后单文件网页才可以直接 file 双击运行。 */
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
/* 学习注释：从 three/examples/jsm/exporters/GLTFExporter.js 导入模块；只有构建后单文件网页才可以直接 file 双击运行。 */
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
/* 学习注释：从 ./architecture.js 导入模块；只有构建后单文件网页才可以直接 file 双击运行。 */
import { buildExterior, buildLibraryFloors, FLOOR_INFO } from './architecture.js';
/* 学习注释：从 ./library-environment.js 导入模块；只有构建后单文件网页才可以直接 file 双击运行。 */
import { buildLibraryEnvironment } from './library-environment.js';
/* 学习注释：从 ./floor-pilots.js 导入模块；只有构建后单文件网页才可以直接 file 双击运行。 */
import { buildFloorPilots, PILOT_INFO } from './floor-pilots.js';
/* 学习注释：建立 $、host。host：承载 canvas 的 HTML 容器。 */
const $ = (id) => document.getElementById(id),
  host = $('viewport');
/* 学习注释：建立 scene。scene：Three.js 场景对象树。 */
const scene = new THREE.Scene();
/* 学习注释：执行这一句操作：scene.background = new THREE.Color('#e9e7df');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
scene.background = new THREE.Color('#e9e7df');
/* 学习注释：建立 renderer。renderer：向 canvas 绘制像素的 WebGL 渲染器。 */
let renderer;
/* 学习注释：尝试运行可能失败的解析、播放或导出步骤；catch 接住错误，finally（如有）执行收尾。 */
try {
  /* 学习注释：执行这一句操作：renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
} catch (e) {
  /* 学习注释：执行这一句操作：$('fallback').style.display = 'flex';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('fallback').style.display = 'flex';
  /* 学习注释：抛出错误，中断当前正常流程；由外层 try/catch 显示或处理，不能当作规则通过。 */
  throw e;
}
/* 学习注释：执行这一句操作：renderer.setPixelRatio(Math.min(devicePixelRatio, 2));。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
/* 学习注释：执行这一句操作：renderer.shadowMap.enabled = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
renderer.shadowMap.enabled = true;
/* 学习注释：执行这一句操作：renderer.shadowMap.type = THREE.PCFSoftShadowMap;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
/* 学习注释：执行这一句操作：renderer.outputColorSpace = THREE.SRGBColorSpace;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
renderer.outputColorSpace = THREE.SRGBColorSpace;
/* 学习注释：执行这一句操作：renderer.toneMapping = THREE.ACESFilmicToneMapping;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
renderer.toneMapping = THREE.ACESFilmicToneMapping;
/* 学习注释：执行这一句操作：renderer.toneMappingExposure = 1.05;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
renderer.toneMappingExposure = 1.05;
/* 学习注释：执行这一句操作：host.prepend(renderer.domElement);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
host.prepend(renderer.domElement);
/* 学习注释：建立 camera。camera：观察场景的透视相机。 */
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 600);
/* 学习注释：建立 controls。controls：轨道控制器，处理旋转、缩放和观察目标。 */
const controls = new OrbitControls(camera, renderer.domElement);
/* 学习注释：执行这一句操作：controls.enableDamping = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
controls.enableDamping = true;
/* 学习注释：执行这一句操作：controls.dampingFactor = 0.08;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
controls.dampingFactor = 0.08;
/* 学习注释：执行这一句操作：controls.maxPolarAngle = Math.PI * 0.47;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
controls.maxPolarAngle = Math.PI * 0.47;
/* 学习注释：执行这一句操作：controls.minDistance = 20;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
controls.minDistance = 20;
/* 学习注释：执行这一句操作：controls.maxDistance = 360;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
controls.maxDistance = 360;
/* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
scene.add(new THREE.HemisphereLight('#fbf8ee', '#abb9ac', 2.4));
/* 学习注释：建立 sun。 */
const sun = new THREE.DirectionalLight('#fff5df', 3);
/* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
sun.position.set(-18, 40, 24);
/* 学习注释：执行这一句操作：sun.castShadow = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
sun.castShadow = true;
/* 学习注释：执行这一句操作：sun.shadow.mapSize.set(2048, 2048);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
sun.shadow.mapSize.set(2048, 2048);
/* 学习注释：批量修改对象中的列出字段；未列出的属性保留。先看第一参数确认正在修改哪一层的状态。 */
Object.assign(sun.shadow.camera, {
  left: -80,
  right: 80,
  top: 80,
  bottom: -80,
  near: 1,
  far: 160,
});
/* 学习注释：执行这一句操作：sun.shadow.bias = -0.0002;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
sun.shadow.bias = -0.0002;
/* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
scene.add(sun);
/* 学习注释：建立 mats。 */
const mats = {};
/* 学习注释：material：复用相同材质
 * 读取/参数：color和opts对象
 * 产生/改变：按字符串组合键返回或创建MeshStandardMaterial
 * 阅读与修改：共享材质修改会影响所有引用；缓存键依赖选项序列化。 */
function material(color, opts = {}) {
  /* 学习注释：建立 k。 */
  const k = color + JSON.stringify(opts);
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return (mats[k] ??= new THREE.MeshStandardMaterial({
    color,
    roughness: 0.78,
    ...opts,
  }));
}
/* 学习注释：box：长方体几何辅助
 * 读取/参数：parent 名称 尺寸 位置 色与选项
 * 产生/改变：创建Mesh、设置阴影、加入父组并返回
 * 阅读与修改：中心坐标不是左上角；正尺寸与净空由调用方保证。 */
function box(parent, name, w, h, d, x, y, z, color, opts = {}) {
  /* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color, opts));
  /* 学习注释：执行这一句操作：m.name = name;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  m.name = name;
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  m.position.set(x, y, z);
  /* 学习注释：执行这一句操作：m.castShadow = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  m.castShadow = true;
  /* 学习注释：执行这一句操作：m.receiveShadow = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  m.receiveShadow = true;
  /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
  parent.add(m);
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return m;
}
/* 学习注释：cylinder：圆柱或截锥辅助
 * 读取/参数：半径 高度 坐标 色 顶部半径
 * 产生/改变：12段圆柱体Mesh加入父节点
 * 阅读与修改：低面数为显示效率，不能据此估计真实圆构件。 */
function cylinder(parent, name, r, h, x, y, z, color, rTop = r) {
  /* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, r, h, 12), material(color));
  /* 学习注释：执行这一句操作：m.name = name;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  m.name = name;
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  m.position.set(x, y, z);
  /* 学习注释：执行这一句操作：m.castShadow = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  m.castShadow = true;
  /* 学习注释：执行这一句操作：m.receiveShadow = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  m.receiveShadow = true;
  /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
  parent.add(m);
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return m;
}
/* 学习注释：sphere：球形展示对象
 * 读取/参数：半径 位置 色
 * 产生/改变：球Mesh用于植株或人头示意
 * 阅读与修改：不是人体或植物真实重建。 */
function sphere(parent, name, r, x, y, z, color) {
  /* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), material(color));
  /* 学习注释：执行这一句操作：m.name = name;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  m.name = name;
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  m.position.set(x, y, z);
  /* 学习注释：执行这一句操作：m.castShadow = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  m.castShadow = true;
  /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
  parent.add(m);
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return m;
}
/* 学习注释：group：建立命名对象层级
 * 读取/参数：parent和name
 * 产生/改变：创建THREE.Group、加入父节点并返回
 * 阅读与修改：父变换会传给子对象，理解局部与世界坐标。 */
function group(parent, name) {
  /* 学习注释：建立 g。g：当前几何组合组；以所在函数定义为准。 */
  const g = new THREE.Group();
  /* 学习注释：执行这一句操作：g.name = name;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  g.name = name;
  /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
  parent.add(g);
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return g;
}
/* 学习注释：建立 interior。 */
const interior = group(scene, 'concept_interior');
/* 学习注释：建立 exterior。exterior：包含主一至主五的校园背景组。 */
const exterior = group(scene, 'jiageng_building_impression');
/* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
exterior.visible = false;
/* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
interior.userData = {
  description: 'A-D concept zones, not a measured floor plan',
  units: 'conceptual meters',
};
/* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
exterior.userData = {
  description:
    'Architectural impression, not a surveyed reconstruction; upper tower not assigned to library',
};
/* 学习注释：执行这一句操作：box(scene, 'ground', 260, 0.2, 340, 0, -1.7, -35, '#e4e4d8');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(scene, 'ground', 260, 0.2, 340, 0, -1.7, -35, '#e4e4d8');
/* 学习注释：plant：组合花盆 植株与叶团
 * 读取/参数：parent X Z scale
 * 产生/改变：返回以给定位置为原点的组
 * 阅读与修改：主要是场景语境，不是声学吸声计算。 */
function plant(parent, x, z, scale = 1) {
  /* 学习注释：建立 p。p：局部试点配置、三维点或 DOM 段落，以当前函数为准。 */
  const p = group(parent, 'planter');
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  p.position.set(x, 0, z);
  /* 学习注释：执行这一句操作：p.scale.setScalar(scale);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  p.scale.setScalar(scale);
  /* 学习注释：执行这一句操作：cylinder(p, 'terracotta_pot', 0.35, 0.6, 0, 0.3, 0, '#b99d79', 0.48);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  cylinder(p, 'terracotta_pot', 0.35, 0.6, 0, 0.3, 0, '#b99d79', 0.48);
  /* 学习注释：执行这一句操作：cylinder(p, 'stem', 0.035, 1.2, 0, 1.0, 0, '#6c7350');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  cylinder(p, 'stem', 0.035, 1.2, 0, 1.0, 0, '#6c7350');
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 i。 */
  let i = 0; i < 5; i++) {
    /* 学习注释：建立 a。 */
    const a = i * 2.3;
    /* 学习注释：执行这一句操作：sphere(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    sphere(
      p,
      'foliage',
      0.38,
      Math.cos(a) * 0.28,
      1.25 + i * 0.12,
      Math.sin(a) * 0.28,
      '#6e9270',
    );
  }
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return p;
}
/* 学习注释：chair：组合椅座 椅背与四腿
 * 读取/参数：parent X Z rotation color
 * 产生/改变：返回椅子组
 * 阅读与修改：几何没有碰撞体、承载、脚轮或防倾倒属性。 */
function chair(parent, x, z, rot = 0, col = '#738f86') {
  /* 学习注释：建立 g。g：当前几何组合组；以所在函数定义为准。 */
  const g = group(parent, 'chair');
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  g.position.set(x, 0, z);
  /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
  g.rotation.y = rot;
  /* 学习注释：执行这一句操作：box(g, 'seat', 0.64, 0.12, 0.63, 0, 0.56, 0, col);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(g, 'seat', 0.64, 0.12, 0.63, 0, 0.56, 0, col);
  /* 学习注释：执行这一句操作：box(g, 'back', 0.64, 0.62, 0.1, 0, 0.92, -0.27, col);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(g, 'back', 0.64, 0.62, 0.1, 0, 0.92, -0.27, col);
  /* 学习注释：逐项遍历 [-0.24, 0.24]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 a。 */
  const a of [-0.24, 0.24])
    /* 学习注释：逐项遍历 [-0.23, 0.23]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 b。 */
    const b of [-0.23, 0.23])
      /* 学习注释：执行这一句操作：box(g, 'leg', 0.045, 0.5, 0.045, a, 0.25, b, '#68736d');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(g, 'leg', 0.045, 0.5, 0.045, a, 0.25, b, '#68736d');
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return g;
}
/* 学习注释：table：组合桌板与四腿
 * 读取/参数：parent X Z width depth
 * 产生/改变：返回桌组，桌板约在0.83高度
 * 阅读与修改：这些尺度为概念，不当作采购规格。 */
function table(parent, x, z, w = 2.5, d = 1.3) {
  /* 学习注释：建立 g。g：当前几何组合组；以所在函数定义为准。 */
  const g = group(parent, 'table');
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  g.position.set(x, 0, z);
  /* 学习注释：执行这一句操作：box(g, 'oak_worktop', w, 0.13, d, 0, 0.83, 0, '#cbb891');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(g, 'oak_worktop', w, 0.13, d, 0, 0.83, 0, '#cbb891');
  /* 学习注释：逐项遍历 [-w / 2 + 0.18, w / 2 - 0.18]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 a。 */
  const a of [-w / 2 + 0.18, w / 2 - 0.18])
    /* 学习注释：逐项遍历 [-d / 2 + 0.15, d / 2 - 0.15]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 b。 */
    const b of [-d / 2 + 0.15, d / 2 - 0.15])
      /* 学习注释：执行这一句操作：box(g, 'table_leg', 0.08, 0.77, 0.08, a, 0.39, b, '#a2aaa0');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(g, 'table_leg', 0.08, 0.77, 0.08, a, 0.39, b, '#a2aaa0');
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return g;
}
/* 学习注释：bookcase：创建早期概念场景的细节书架
 * 读取/参数：parent 位置 旋转 宽度
 * 产生/改变：组合书架及单本彩色示意书
 * 阅读与修改：主要用于保留的A至D旧几何；五层用rack函数。 */
function bookcase(parent, x, z, rot = 0, w = 2.6) {
  /* 学习注释：建立 g。g：当前几何组合组；以所在函数定义为准。 */
  const g = group(parent, 'bookcase');
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  g.position.set(x, 0, z);
  /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
  g.rotation.y = rot;
  /* 学习注释：执行这一句操作：box(g, 'back', w, 2.2, 0.1, 0, 1.1, -0.24, '#baa985');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(g, 'back', w, 2.2, 0.1, 0, 1.1, -0.24, '#baa985');
  /* 学习注释：逐项遍历 [-w / 2, w / 2]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 a。 */
  const a of [-w / 2, w / 2]) /* 学习注释：执行这一句操作：box(g, 'side', 0.1, 2.2, 0.55, a, 1.1, 0, '#baa985');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(g, 'side', 0.1, 2.2, 0.55, a, 1.1, 0, '#baa985');
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 row。 */
  let row = 0; row < 4; row++) {
    /* 学习注释：建立 y。 */
    const y = 0.15 + row * 0.55;
    /* 学习注释：执行这一句操作：box(g, 'shelf', w, 0.07, 0.56, 0, y, 0, '#b4a481');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(g, 'shelf', w, 0.07, 0.56, 0, y, 0, '#b4a481');
    /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
    for (/* 学习注释：建立 n。 */
    let n = 0; n < 12; n++) {
      /* 学习注释：建立 colors。 */
      const colors = ['#789084', '#b4a16d', '#8093a1', '#b47b67', '#9b8a9d'];
      /* 学习注释：建立 h。 */
      const h = 0.29 + (n % 4) * 0.035;
      /* 学习注释：建立 b。 */
      const b = box(
        g,
        'book',
        0.12,
        h,
        0.3,
        -w / 2 + 0.21 + (n * (w - 0.32)) / 12,
        y + h / 2 + 0.06,
        0.01,
        colors[(n + row) % 5],
      );
      /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
      b.rotation.z = n % 5 === 0 ? 0.1 : 0;
    }
  }
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return g;
}
/* 学习注释：railing：早期概念中庭玻璃栏板
 * 读取/参数：位置与宽深
 * 产生/改变：创建半透明栏板
 * 阅读与修改：透明程度只管画面，不代表安全或声学性能。 */
function railing(parent, x, z, w, d) {
  /* 学习注释：执行这一句操作：box(parent, 'glass_balustrade', w, 0.95, d, x, 1.7, z, '#bed7d1', {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(parent, 'glass_balustrade', w, 0.95, d, x, 1.7, z, '#bed7d1', {
    transparent: true,
    opacity: 0.42,
    metalness: 0.15,
  });
}
// Conceptual atrium floor: no field dimensions are claimed.
/* 学习注释：逐项遍历 [
 *   ['west', 14, 26, -11, 0],
 *   ['east', 14, 26, 11, 0],
 *   ['north', 8, 5, 0, -10.5],
 *   ['south', 8, 13, 0, 6.5],
 * ]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 name、w、d、x、z。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const [name, w, d, x, z] of [
  ['west', 14, 26, -11, 0],
  ['east', 14, 26, 11, 0],
  ['north', 8, 5, 0, -10.5],
  ['south', 8, 13, 0, 6.5],
])
  /* 学习注释：执行这一句操作：box(interior, 'floor_' + name, w, 0.26, d, x, 0, z, '#e5dfce');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(interior, 'floor_' + name, w, 0.26, d, x, 0, z, '#e5dfce');
/* 学习注释：执行这一句操作：box(interior, 'atrium_lower_floor', 7.5, 0.15, 8, 0, -1.35, -4, '#cfdbc9');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'atrium_lower_floor', 7.5, 0.15, 8, 0, -1.35, -4, '#cfdbc9');
/* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
plant(interior, 0, -4, 1.7).position.y = -1.27;
/* 学习注释：执行这一句操作：box(interior, 'A_blue_zone', 12, 0.035, 13, -11, 0.16, -4.3, '#d4e3e7');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'A_blue_zone', 12, 0.035, 13, -11, 0.16, -4.3, '#d4e3e7');
/* 学习注释：执行这一句操作：box(interior, 'B_green_zone', 12, 0.035, 13, 11, 0.16, -4.3, '#d4e4d5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'B_green_zone', 12, 0.035, 13, 11, 0.16, -4.3, '#d4e4d5');
/* 学习注释：执行这一句操作：box(interior, 'C_heritage_zone', 12, 0.035, 7, -11, 0.16, 8.4, '#e5d8b9');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'C_heritage_zone', 12, 0.035, 7, -11, 0.16, 8.4, '#e5d8b9');
/* 学习注释：执行这一句操作：box(interior, 'D_booking_zone', 12, 0.035, 7, 11, 0.16, 8.4, '#dfdce9');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'D_booking_zone', 12, 0.035, 7, 11, 0.16, 8.4, '#dfdce9');
/* 学习注释：执行这一句操作：box(interior, 'back_wall', 36, 3.2, 0.28, 0, 1.6, -13, '#f3efe5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'back_wall', 36, 3.2, 0.28, 0, 1.6, -13, '#f3efe5');
/* 学习注释：执行这一句操作：box(interior, 'left_cut_wall', 0.28, 0.75, 26, -18, 0.375, 0, '#e8e3d7');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'left_cut_wall', 0.28, 0.75, 26, -18, 0.375, 0, '#e8e3d7');
/* 学习注释：执行这一句操作：box(interior, 'right_cut_wall', 0.28, 0.75, 26, 18, 0.375, 0, '#e8e3d7');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'right_cut_wall', 0.28, 0.75, 26, 18, 0.375, 0, '#e8e3d7');
/* 学习注释：逐项遍历 [-15, -10, -5, 0, 5, 10, 15]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const x of [-15, -10, -5, 0, 5, 10, 15]) {
  /* 学习注释：执行这一句操作：box(interior, 'window', 3.8, 1.95, 0.08, x, 1.9, -12.8, '#a9c6c6', {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(interior, 'window', 3.8, 1.95, 0.08, x, 1.9, -12.8, '#a9c6c6', {
    transparent: true,
    opacity: 0.52,
    metalness: 0.1,
  });
  /* 学习注释：执行这一句操作：box(interior, 'window_frame', 0.12, 2.4, 0.18, x - 1.95, 1.9, -12.68, '#e9e3d3');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(interior, 'window_frame', 0.12, 2.4, 0.18, x - 1.95, 1.9, -12.68, '#e9e3d3');
}
/* 学习注释：逐项遍历 [-4, 4]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const x of [-4, 4]) /* 学习注释：执行这一句操作：railing(interior, x, -4, 0.08, 8);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
railing(interior, x, -4, 0.08, 8);
/* 学习注释：执行这一句操作：railing(interior, 0, -8, 8, 0.08);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
railing(interior, 0, -8, 8, 0.08);
/* 学习注释：执行这一句操作：railing(interior, 0, 0, 8, 0.08);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
railing(interior, 0, 0, 8, 0.08);
/* 学习注释：逐项遍历 [-3.5, 3.5]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const x of [-3.5, 3.5])
  /* 学习注释：逐项遍历 [-9, 2]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 z。 */
  const z of [-9, 2])
    /* 学习注释：执行这一句操作：box(interior, 'atrium_column', 0.3, 4.7, 0.3, x, 2.35, z, '#ede6d5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(interior, 'atrium_column', 0.3, 4.7, 0.3, x, 2.35, z, '#ede6d5');
// Upper gallery fragment conveys the documented high atrium without assigning a real floor.
/* 学习注释：执行这一句操作：box(interior, 'upper_gallery', 36, 0.16, 2.1, 0, 4.3, -11.5, '#ede6d5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'upper_gallery', 36, 0.16, 2.1, 0, 4.3, -11.5, '#ede6d5');
/* 学习注释：执行这一句操作：box(interior, 'gallery_rail', 36, 0.85, 0.06, 0, 4.85, -10.45, '#b7cdc3', {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'gallery_rail', 36, 0.85, 0.06, 0, 4.85, -10.45, '#b7cdc3', {
  transparent: true,
  opacity: 0.32,
});
/* 学习注释：建立 zoneA。 */
const zoneA = group(interior, 'A_fixed_quiet_24_seats');
/* 学习注释：逐项遍历 [-14.5, -11, -7.5]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const x of [-14.5, -11, -7.5])
  /* 学习注释：逐项遍历 [-7.8, -2.6]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 z。 */
  const z of [-7.8, -2.6]) {
    /* 学习注释：执行这一句操作：table(zoneA, x, z, 2.55, 1.45);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    table(zoneA, x, z, 2.55, 1.45);
    /* 学习注释：逐项遍历 [-0.63, 0.63]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 dx。 */
    const dx of [-0.63, 0.63]) {
      /* 学习注释：执行这一句操作：chair(zoneA, x + dx, z - 0.95, 0, '#7994a0');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      chair(zoneA, x + dx, z - 0.95, 0, '#7994a0');
      /* 学习注释：执行这一句操作：chair(zoneA, x + dx, z + 0.95, Math.PI, '#7994a0');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      chair(zoneA, x + dx, z + 0.95, Math.PI, '#7994a0');
    }
    /* 学习注释：执行这一句操作：box(zoneA, 'desk_divider', 2.3, 0.36, 0.045, x, 1.08, z, '#dde8e6');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(zoneA, 'desk_divider', 2.3, 0.36, 0.045, x, 1.08, z, '#dde8e6');
  }
/* 学习注释：执行这一句操作：bookcase(zoneA, -11, -11.4, 0, 9);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
bookcase(zoneA, -11, -11.4, 0, 9);
/* 学习注释：执行这一句操作：plant(zoneA, -16.8, 1.5);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
plant(zoneA, -16.8, 1.5);
/* 学习注释：建立 zoneC。 */
const zoneC = group(interior, 'C_heritage_8_seats');
/* 学习注释：逐项遍历 [-13.8, -8.4]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const x of [-13.8, -8.4]) {
  /* 学习注释：执行这一句操作：table(zoneC, x, 8.6, 2.8, 1.45);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  table(zoneC, x, 8.6, 2.8, 1.45);
  /* 学习注释：逐项遍历 [-0.7, 0.7]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 dx。 */
  const dx of [-0.7, 0.7]) {
    /* 学习注释：执行这一句操作：chair(zoneC, x + dx, 7.65, 0, '#ab9566');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    chair(zoneC, x + dx, 7.65, 0, '#ab9566');
    /* 学习注释：执行这一句操作：chair(zoneC, x + dx, 9.55, Math.PI, '#ab9566');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    chair(zoneC, x + dx, 9.55, Math.PI, '#ab9566');
  }
}
/* 学习注释：执行这一句操作：bookcase(zoneC, -11, 5.1, 0, 8.5);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
bookcase(zoneC, -11, 5.1, 0, 8.5);
/* 学习注释：执行这一句操作：plant(zoneC, -16.6, 10.8);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
plant(zoneC, -16.6, 10.8);
/* 学习注释：建立 zoneD。 */
const zoneD = group(interior, 'D_booked_room_8_seats');
/* 学习注释：执行这一句操作：table(zoneD, 11, 8.7, 6.2, 1.6);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
table(zoneD, 11, 8.7, 6.2, 1.6);
/* 学习注释：逐项遍历 [8.7, 10.2, 11.8, 13.3]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const x of [8.7, 10.2, 11.8, 13.3]) {
  /* 学习注释：执行这一句操作：chair(zoneD, x, 7.55, 0, '#8f8aab');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  chair(zoneD, x, 7.55, 0, '#8f8aab');
  /* 学习注释：执行这一句操作：chair(zoneD, x, 9.85, Math.PI, '#8f8aab');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  chair(zoneD, x, 9.85, Math.PI, '#8f8aab');
}
/* 学习注释：逐项遍历 [
 *   [5, 8.6, 0.08, 7.5],
 *   [17, 8.6, 0.08, 7.5],
 *   [11, 12.2, 12, 0.08],
 * ]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 x、z、w、d。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const [x, z, w, d] of [
  [5, 8.6, 0.08, 7.5],
  [17, 8.6, 0.08, 7.5],
  [11, 12.2, 12, 0.08],
])
  /* 学习注释：执行这一句操作：box(zoneD, 'booking_glass', w, 1.8, d, x, 1.05, z, '#b9c2d5', {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(zoneD, 'booking_glass', w, 1.8, d, x, 1.05, z, '#b9c2d5', {
    transparent: true,
    opacity: 0.24,
  });
/* 学习注释：执行这一句操作：box(zoneD, 'display', 3.4, 1.1, 0.08, 11, 1.6, 5.1, '#405d57');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(zoneD, 'display', 3.4, 1.1, 0.08, 11, 1.6, 5.1, '#405d57');
/* 学习注释：建立 zoneB。 */
const zoneB = group(interior, 'B_flexible_12_seats');
/* 学习注释：执行这一句操作：bookcase(zoneB, 11, -11.4, 0, 9);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
bookcase(zoneB, 11, -11.4, 0, 9);
/* 学习注释：执行这一句操作：plant(zoneB, 16.5, 1.3);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
plant(zoneB, 16.5, 1.3);
/* 学习注释：建立 moving。 */
const moving = [];
/* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
for (/* 学习注释：建立 n。 */
let n = 0; n < 3; n++) {
  /* 学习注释：建立 g。g：当前几何组合组；以所在函数定义为准。 */
  const g = group(zoneB, 'mobile_table_group_' + n);
  /* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x = 7.4 + n * 3.6;
  /* 学习注释：执行这一句操作：table(g, 0, 0, 2.5, 1.5);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  table(g, 0, 0, 2.5, 1.5);
  /* 学习注释：逐项遍历 [-0.63, 0.63]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 dx。 */
  const dx of [-0.63, 0.63]) {
    /* 学习注释：执行这一句操作：chair(g, dx, -1, 0);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    chair(g, dx, -1, 0);
    /* 学习注释：执行这一句操作：chair(g, dx, 1, Math.PI);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    chair(g, dx, 1, Math.PI);
  }
  /* 学习注释：建立 a、b。 */
  const a = new THREE.Vector3(x, 0, -4.2),
    b = new THREE.Vector3(x, 0, -4.2);
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  g.position.copy(a);
  /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
  moving.push({ object: g, read: a, discuss: b, readRot: 0, discussRot: 0 });
}
// Move the three desk groups from staggered reading rows into one shared worktable.
/* 学习注释：执行这一句操作：moving[0].read.set(7.6, 0, -7.3);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
moving[0].read.set(7.6, 0, -7.3);
/* 学习注释：执行这一句操作：moving[1].read.set(12.0, 0, -4.1);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
moving[1].read.set(12.0, 0, -4.1);
/* 学习注释：执行这一句操作：moving[2].read.set(7.6, 0, -0.8);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
moving[2].read.set(7.6, 0, -0.8);
/* 学习注释：执行这一句操作：moving[0].discuss.set(8.3, 0, -4.3);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
moving[0].discuss.set(8.3, 0, -4.3);
/* 学习注释：执行这一句操作：moving[1].discuss.set(11.0, 0, -4.3);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
moving[1].discuss.set(11.0, 0, -4.3);
/* 学习注释：执行这一句操作：moving[2].discuss.set(13.7, 0, -4.3);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
moving[2].discuss.set(13.7, 0, -4.3);
/* 学习注释：建立 partition。 */
const partition = group(zoneB, 'concept_acoustic_enclosure');
/* 学习注释：逐项遍历 [
 *   [5.2, -4, 0.1, 13.2],
 *   [11.85, 2.5, 10.3, 0.1],
 *   [17, -4, 0.1, 13.2],
 * ]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 x、z、w、d。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const [x, z, w, d] of [
  [5.2, -4, 0.1, 13.2],
  [11.85, 2.5, 10.3, 0.1],
  [17, -4, 0.1, 13.2],
]) {
  /* 学习注释：建立 panel。 */
  const panel = box(partition, 'partition_panel', w, 2.5, d, x, 1.4, z, '#a3c1b1', {
    transparent: true,
    opacity: 0.28,
  });
  /* 学习注释：执行这一句操作：panel.castShadow = false;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  panel.castShadow = false;
}
/* 学习注释：建立 ribs。 */
const ribs = [];
/* 学习注释：逐项遍历 [5.2, 6.7, 11.1, 14, 17]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const x of [5.2, 6.7, 11.1, 14, 17])
  /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
  ribs.push(box(partition, 'frame', 0.045, 2.5, 0.05, x, 1.4, 2.5, '#758f81'));
/* 学习注释：执行这一句操作：box(partition, 'door_threshold', 1.5, 0.08, 0.08, 5.95, 0.19, 2.5, '#b8cbaa');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(partition, 'door_threshold', 1.5, 0.08, 0.08, 5.95, 0.19, 2.5, '#b8cbaa');
/* 学习注释：建立 door。 */
const door = box(
  partition,
  'inward_open_door',
  1.45,
  2.4,
  0.065,
  5.45,
  1.35,
  1.8,
  '#a3c1b1',
  { transparent: true, opacity: 0.26 },
);
/* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
door.rotation.y = -1.25;
/* 学习注释：执行这一句操作：door.castShadow = false;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
door.castShadow = false;
/* 学习注释：建立 people。 */
const people = group(zoneB, 'four_mock_participants');
/* 学习注释：逐项遍历 [
 *   [0, 8.3, -5.3],
 *   [1, 11, -5.3],
 *   [2, 11, -3.3],
 *   [3, 13.7, -3.3],
 * ]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 n、x、z。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
const [n, x, z] of [
  [0, 8.3, -5.3],
  [1, 11, -5.3],
  [2, 11, -3.3],
  [3, 13.7, -3.3],
]) {
  /* 学习注释：建立 p。p：局部试点配置、三维点或 DOM 段落，以当前函数为准。 */
  const p = group(people, 'mock_reader_' + n);
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  p.position.set(x, 0, z);
  /* 学习注释：执行这一句操作：cylinder(p, 'body', 0.2, 0.6, 0, 0.93, 0, n % 2 ? '#bd926d' : '#718a94', 0.15);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  cylinder(p, 'body', 0.2, 0.6, 0, 0.93, 0, n % 2 ? '#bd926d' : '#718a94', 0.15);
  /* 学习注释：执行这一句操作：sphere(p, 'head', 0.18, 0, 1.39, 0, '#d3b898');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  sphere(p, 'head', 0.18, 0, 1.39, 0, '#d3b898');
  /* 学习注释：执行这一句操作：box(p, 'legs', 0.33, 0.36, 0.27, 0, 0.5, 0, '#606b70');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(p, 'legs', 0.33, 0.36, 0.27, 0, 0.5, 0, '#606b70');
}
/* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
people.visible = false;
// Permanent route and reception remain outside the moving zone.
/* 学习注释：执行这一句操作：box(interior, 'main_route', 36, 0.025, 2.0, 0, 0.18, 3.55, '#e9e5d5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'main_route', 36, 0.025, 2.0, 0, 0.18, 3.55, '#e9e5d5');
/* 学习注释：执行这一句操作：box(interior, 'entry_route', 4.5, 0.025, 9, 0, 0.18, 8.2, '#e9e5d5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'entry_route', 4.5, 0.025, 9, 0, 0.18, 8.2, '#e9e5d5');
/* 学习注释：执行这一句操作：box(interior, 'service_desk', 2.4, 0.95, 1.0, -0.2, 0.5, 9.5, '#b8bdad');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'service_desk', 2.4, 0.95, 1.0, -0.2, 0.5, 9.5, '#b8bdad');
/* 学习注释：执行这一句操作：box(interior, 'desk_top', 2.6, 0.1, 1.15, -0.2, 1.02, 9.5, '#cdbb99');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
box(interior, 'desk_top', 2.6, 0.1, 1.15, -0.2, 1.02, 9.5, '#cdbb99');
/* 学习注释：执行这一句操作：plant(interior, 2.9, 11.4);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
plant(interior, 2.9, 11.4);
/* 学习注释：执行这一句操作：plant(interior, -3.1, 11.4);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
plant(interior, -3.1, 11.4);
/* 学习注释：逐项遍历 [4.2, 7.0, 11.5]，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 z。 */
const z of [4.2, 7.0, 11.5]) {
  /* 学习注释：建立 a。 */
  const a = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 3), material('#acb799'));
  /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
  a.rotation.x = Math.PI / 2;
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  a.position.set(1.8, 0.22, z);
  /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
  interior.add(a);
}
/* 学习注释：建立 helpers。 */
const helpers = { group, box, cylinder, material, plant, chair, table };
/* 学习注释：建立 exteriorDetails。 */
const exteriorDetails = buildExterior(exterior, helpers);
/* 学习注释：执行这一句操作：buildLibraryEnvironment(exteriorDetails.rearLibrary, helpers);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
buildLibraryEnvironment(exteriorDetails.rearLibrary, helpers);
/* 学习注释：建立 libraryExterior。libraryExterior：只展示主三背面馆舍及景观的对象组。 */
const libraryExterior = exteriorDetails.rearLibrary.clone(true);
/* 学习注释：执行这一句操作：libraryExterior.name = 'main_3_library_rear_only';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
libraryExterior.name = 'main_3_library_rear_only';
/* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
libraryExterior.position.z = 0;
/* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
libraryExterior.visible = false;
/* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
scene.add(libraryExterior);
/* 学习注释：建立 buildingFloors。buildingFloors：五层内部模型的共同父组。 */
const buildingFloors = group(scene, 'five_floor_library_cutaway');
/* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
buildingFloors.visible = false;
/* 学习注释：建立 floorModel。floorModel：五层构建函数返回的 storeys、height、skylight。 */
const floorModel = buildLibraryFloors(buildingFloors, helpers);

/* 学习注释：建立 pilots。pilots：每层试点对象及 apply 插值函数。 */
const pilots = buildFloorPilots(floorModel.storeys, helpers);
/* 学习注释：建立 floorSelection、expanded、showFurniture、showSkylight、view、proposalOn、labelsOn、renderDirty。floorSelection：0 表示全部，1-5 表示当前楼层。expanded：是否把楼层拉开显示；展开间距不是实际层高。showFurniture：是否显示馆藏设施和试点。showSkylight：是否显示可选中庭顶盖。view：当前展示模式标识；控制对象可见和相机。proposalOn：是否展示拟议试点层。labelsOn：控制 HTML 浮动标注是否显示。renderDirty：画面变化后需要重画的标志。 */
let floorSelection = 0,
  expanded = false,
  showFurniture = true,
  showSkylight = false,
  view = 'exterior',
  proposalOn = false,
  labelsOn = true,
  renderDirty = true;
/* 学习注释：建立 pilotStates。pilotStates：五份彼此独立的楼层状态。 */
const pilotStates = pilots.map(() => ({
  active: false,
  pending: false,
  cooldown: false,
  progress: 0,
  target: 0,
  objection: false,
  reserved: false,
  message: '选择本层方案，查看常态与目标用途。',
  kind: 'normal',
}));
/* 学习注释：建立 current。 */
const current = () => (floorSelection ? pilotStates[floorSelection - 1] : null);
/* 学习注释：建立 info。 */
const info = () => (floorSelection ? PILOT_INFO[floorSelection - 1] : null);
/* 学习注释：floorOffset：计算楼层展示高度
 * 读取/参数：楼层n、expanded与floorModel.height
 * 产生/改变：返回(n-1)乘4.8或9
 * 阅读与修改：9是展开显示间距，不是实际层高。 */
function floorOffset(n) {
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return (n - 1) * (expanded ? 9 : floorModel.height);
}
/* 学习注释：isFloorView：判断当前是否室内楼层视图
 * 读取/参数：view
 * 产生/改变：floors/pilot/floorPlan时为true
 * 阅读与修改：用于共享模型显示和侧栏，不执行业务判断。 */
function isFloorView() {
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return ['floors', 'pilot', 'floorPlan'].includes(view);
}
/* 学习注释：isArchitectureView：判断校园或馆舍视图
 * 读取/参数：view
 * 产生/改变：exterior/library时为true
 * 阅读与修改：与isFloorView决定不同控制区可见。 */
function isArchitectureView() {
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return view === 'exterior' || view === 'library';
}
/* 学习注释：syncFloorVisibility：同步楼层和子对象可见性
 * 读取/参数：floorSelection/expanded/proposalOn等
 * 产生/改变：更新层高、家具、梁、试点和采光顶可见
 * 阅读与修改：隐藏不等于删除，结构位置签名不能检测可见性。 */
function syncFloorVisibility() {
  /* 学习注释：执行这一句操作：renderDirty = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  renderDirty = true;
  /* 学习注释：逐项遍历 floorModel.storeys，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 f。 */
  const f of floorModel.storeys) {
    /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
    f.root.visible = !floorSelection || f.info.n === floorSelection;
    /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
    f.root.position.y = floorOffset(f.info.n);
    /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
    f.furniture.visible = showFurniture;
    /* 学习注释：逐项遍历 f.structural.children，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
    const m of f.structural.children)
      /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 m.name.includes('beam')。 */
      if (m.name.includes('beam'))
        /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
        m.visible = (!proposalOn && view !== 'floorPlan') || !showFurniture;
    /* 学习注释：建立 p。p：局部试点配置、三维点或 DOM 段落，以当前函数为准。 */
    const p = pilots[f.info.n - 1];
    /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
    p.root.visible = proposalOn && showFurniture;
    /* 学习注释：逐项遍历 p.replaced，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 old。 */
    const old of p.replaced) /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
    old.visible = !proposalOn;
  }
  /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
  floorModel.skylight.visible = showSkylight && !floorSelection && !expanded;
}
/* 学习注释：toast：短时显示保存或导出反馈
 * 读取/参数：提示文本
 * 产生/改变：显示toast并重置3秒隐藏计时
 * 阅读与修改：只管界面消息，不表示设备执行成功。 */
function toast(t) {
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('toast').textContent = t;
  /* 学习注释：执行这一句操作：$('toast').style.display = 'block';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('toast').style.display = 'block';
  /* 学习注释：执行这一句操作：clearTimeout(toast.timer);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  clearTimeout(toast.timer);
  /* 学习注释：执行这一句操作：toast.timer = setTimeout(() => ($('toast').style.display = 'none'), 3000);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  toast.timer = setTimeout(() => ($('toast').style.display = 'none'), 3000);
}
/* 学习注释：status：保存当前层的状态提示
 * 读取/参数：文本t和kind
 * 产生/改变：同时更新当前pilotState消息及DOM
 * 阅读与修改：不是后端日志，刷新不保留。 */
function status(t, kind = 'normal') {
  /* 学习注释：建立 st。st：当前楼层状态，包含 active/pending/cooldown/target/progress。 */
  const st = current();
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 st。 */
  if (st) {
    /* 学习注释：执行这一句操作：st.message = t;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    st.message = t;
    /* 学习注释：执行这一句操作：st.kind = kind;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    st.kind = kind;
  }
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('status').textContent = t;
  /* 学习注释：执行这一句操作：$('status').dataset.kind = kind;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('status').dataset.kind = kind;
}
/* 学习注释：blockReason：给当前试点提供阻止理由
 * 读取/参数：current状态
 * 产生/改变：按未选层 异议 预约 冷却返回原因
 * 阅读与修改：没有检测声学、真实时段或人数，不能夸大核验范围。 */
function blockReason() {
  /* 学习注释：建立 st。st：当前楼层状态，包含 active/pending/cooldown/target/progress。 */
  const st = current();
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return !st
    ? '请先选择一至五楼中的一个试点。'
    : st.objection
      ? '邻近读者有异议，停止本次变更，由馆员沟通。'
      : st.reserved
        ? '本次候选资源已有预约，保留原安排。'
        : st.cooldown
          ? '正在模拟冷却期，推进10分钟后可再申请。'
          : '';
}
/* 学习注释：syncUI：从状态刷新整页三维控制
 * 读取/参数：view、选层、配置与pilotStates
 * 产生/改变：更新文字、禁用、面包屑、图例和条件
 * 阅读与修改：innerHTML数据来自固定配置；未来外部数据应安全构建DOM。 */
function syncUI() {
  /* 学习注释：建立 floorMode、st、p、f。st：当前楼层状态，包含 active/pending/cooldown/target/progress。p：局部试点配置、三维点或 DOM 段落，以当前函数为准。 */
  const floorMode = isFloorView(),
    st = current(),
    p = info(),
    f = FLOOR_INFO.find((f) => f.n === floorSelection);
  /* 学习注释：执行这一句操作：$('floorBar').hidden = !floorMode;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('floorBar').hidden = !floorMode;
  /* 学习注释：执行这一句操作：$('floorPanel').hidden = !floorMode;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('floorPanel').hidden = !floorMode;
  /* 学习注释：执行这一句操作：$('pilotPanel').hidden = !floorMode || !proposalOn;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('pilotPanel').hidden = !floorMode || !proposalOn;
  /* 学习注释：执行这一句操作：$('pilotConditions').hidden = !floorMode || !proposalOn || !st;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('pilotConditions').hidden = !floorMode || !proposalOn || !st;
  /* 学习注释：执行这一句操作：$('pilotZones').hidden = !floorMode || !proposalOn;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('pilotZones').hidden = !floorMode || !proposalOn;
  /* 学习注释：执行这一句操作：$('architecturePanel').hidden = !isArchitectureView();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('architecturePanel').hidden = !isArchitectureView();
  /* 学习注释：更新控件能否点击。这是界面层限制，批准函数仍要独立复核状态和约束。 */
  $('approve').disabled = !st?.pending;
  /* 学习注释：更新控件能否点击。这是界面层限制，批准函数仍要独立复核状态和约束。 */
  $('restore').disabled = !st?.active;
  /* 学习注释：更新控件能否点击。这是界面层限制，批准函数仍要独立复核状态和约束。 */
  $('request').disabled = !st || st.active;
  /* 学习注释：更新控件能否点击。这是界面层限制，批准函数仍要独立复核状态和约束。 */
  $('reading').disabled = !st;
  /* 学习注释：执行这一句操作：$('advance').hidden = !st?.cooldown;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('advance').hidden = !st?.cooldown;
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('reading').textContent = p ? p.normal : '常态用途';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('request').textContent = p ? '生成' + p.active + '建议' : '选择楼层后生成建议';
  /* 学习注释：执行这一句操作：$('reading').classList.toggle('active', !!st && !st.active);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('reading').classList.toggle('active', !!st && !st.active);
  /* 学习注释：执行这一句操作：$('objection').checked = !!st?.objection;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('objection').checked = !!st?.objection;
  /* 学习注释：执行这一句操作：$('reserved').checked = !!st?.reserved;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('reserved').checked = !!st?.reserved;
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('status').textContent = st
    ? st.message
    : '全馆方案总览：点击楼层，查看位置与转换流程。';
  /* 学习注释：执行这一句操作：$('status').dataset.kind = st ? st.kind : 'normal';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('status').dataset.kind = st ? st.kind : 'normal';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('pilotHeading').textContent = p ? p.n + 'F · ' + p.title : '一至五楼 · 分层试点';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('pilotLocation').textContent = p
    ? '拟议位置：' + p.location
    : '每层按用途制定方案；彩色边界为候选试点范围。';
  /* 学习注释：执行这一句操作：$('pilotFacts').innerHTML = p。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('pilotFacts').innerHTML = p
    ? '<b>触发情境</b><p>' +
      p.trigger +
      '</p><b>方案动作</b><p>' +
      p.action +
      '</p><b>保护条件</b><p>' +
      p.protect +
      '</p><b>评估指标</b><p>' +
      p.metric +
      '</p><b>推进顺序</b><p>' +
      p.phase +
      '</p>'
    : PILOT_INFO.map(
        (q) =>
          '<p><b>' +
          q.n +
          'F ' +
          q.title +
          '</b><br>' +
          q.normal +
          ' → ' +
          q.active +
          '</p>',
      ).join('');
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('architectureHeading').textContent =
    view === 'library' ? '图书馆 · 馆舍与湖畔环境' : '主一至主五 · 完整楼群';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('architectureDescription').textContent =
    view === 'library'
      ? '保留主三后部馆舍及入口标识、平台、湖岸和绿化。湖畔全景、入口近景均可查看；点击馆舍进入内部剖切。'
      : '主一、主二、主四、主五的纵深与主三完整纵深对齐。转到背面可看湖畔关系，点击中央主三进入图书馆。';
  /* 学习注释：逐项遍历 ['libraryBack', 'lakeView', 'entryView', 'enterCutaway']，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 id。 */
  const id of ['libraryBack', 'lakeView', 'entryView', 'enterCutaway'])
    /* 学习注释：执行这一句操作：$(id).hidden = view !== 'library';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    $(id).hidden = view !== 'library';
  /* 学习注释：执行这一句操作：$('locateLibrary').hidden = view === 'library';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('locateLibrary').hidden = view === 'library';
  /* 学习注释：执行这一句操作：$('campusBack').hidden = view === 'library';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('campusBack').hidden = view === 'library';
  /* 学习注释：执行这一句操作：$('facadeFront').hidden = view === 'library';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('facadeFront').hidden = view === 'library';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('breadcrumb').textContent = floorMode
    ? '校园楼群 › 主三背面图书馆 › ' +
      (floorSelection ? floorSelection + 'F' : '五层总览') +
      (proposalOn ? ' › 本层方案' : ' › 馆藏参照')
    : view === 'library'
      ? '校园楼群 › 主三背面图书馆与湖畔'
      : '校园楼群 · 点主三进入图书馆';
  /* 学习注释：执行这一句操作：$('legend').hidden = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('legend').hidden = true;
  /* 学习注释：执行这一句操作：$('floorLegend').hidden = !floorMode;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('floorLegend').hidden = !floorMode;
  /* 学习注释：执行这一句操作：$('floorLegend').innerHTML =。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('floorLegend').innerHTML =
    '东上西下 / 北左南右 · 2025馆藏分区参照<br>' +
    (proposalOn
      ? '彩色边界 = 拟议试点；桌椅数量与选址为示意'
      : '柱梁与尺寸为示意 · 点击方案试点查看设计叠加');
  /* 学习注释：执行这一句操作：document.querySelectorAll('[data-floor]').forEach((e) => {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  document.querySelectorAll('[data-floor]').forEach((e) => {
    /* 学习注释：建立 a。 */
    const a = +e.dataset.floor === floorSelection;
    /* 学习注释：执行这一句操作：e.classList.toggle('active', a);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    e.classList.toggle('active', a);
    /* 学习注释：设置 DOM/SVG 属性；查看第一个参数确认这是尺寸、样式、可访问状态还是绘图路径。 */
    e.setAttribute('aria-pressed', String(a));
  });
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('explode').textContent = expanded ? '合拢楼层' : '分层展开';
  /* 学习注释：更新控件能否点击。这是界面层限制，批准函数仍要独立复核状态和约束。 */
  $('explode').disabled = !!floorSelection;
  /* 学习注释：更新控件能否点击。这是界面层限制，批准函数仍要独立复核状态和约束。 */
  $('skylight').disabled = !!floorSelection || expanded;
  /* 学习注释：执行这一句操作：$('floorPilot').hidden = !floorSelection;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('floorPilot').hidden = !floorSelection;
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('floorPilot').textContent = proposalOn ? '查看本层馆藏参照' : '叠加本层试点方案';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('floorHeading').textContent = f
    ? floorSelection + 'F · ' + f.title
    : '五层整体剖切';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('floorDescription').textContent = f
    ? f.summary
    : '按2025版馆藏导览分别建立二至五楼；一楼仅概念示意。可点选楼层、展开或看骨架。';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('floorTags').textContent = f
    ? f.tags.join(' · ')
    : '从同一楼层模型切换剖切、方案、俯瞰';
  /* 学习注释：执行这一句操作：$('collectionList').innerHTML = f。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  $('collectionList').innerHTML = f
    ? f.zones
        .map(
          (z) =>
            '<span style="border-left:3px solid ' +
            z.color +
            '">' +
            z.label +
            '</span>',
        )
        .join('')
    : '选择楼层，查看馆藏与本层试点。';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('viewTitle').textContent = floorMode
    ? proposalOn
      ? p
        ? p.n +
          'F ' +
          p.title +
          ' · ' +
          (st.active ? p.active : st.pending ? '等待确认' : p.normal)
        : '全馆五层方案总览'
      : $('floorHeading').textContent
    : view === 'library'
      ? '图书馆与湖畔平台'
      : '嘉庚主楼群 · 完整纵深';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  $('viewDescription').textContent = floorMode
    ? proposalOn
      ? p
        ? p.action
        : '各层试点叠加于同一剖切模型，选一层可操作；候选位置需现场核验。'
      : '剖切与俯瞰使用同一楼层。馆藏参照和拟议设计可以切换对照。'
    : view === 'library'
      ? '湖面、平台、步行道、入口和馆舍组成完整场景。几何尺度与标识为展示示意。'
      : '从楼与主三共用前后端纵深；背面湖畔可旋转查看。';
  /* 学习注释：逐项遍历 ['interior', 'exterior', 'library', 'floors', 'top']，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 id。 */
  const id of ['interior', 'exterior', 'library', 'floors', 'top'])
    /* 学习注释：执行这一句操作：$(id).classList.toggle(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    $(id).classList.toggle(
      'active',
      id === 'interior'
        ? floorMode && proposalOn && view !== 'floorPlan'
        : id === 'top'
          ? view === 'floorPlan'
          : id === 'floors'
            ? floorMode && !proposalOn && view !== 'floorPlan'
            : id === view,
    );
}
/* 学习注释：setView：切换场景并给相机默认机位
 * 读取/参数：目标视图v及当前选层状态
 * 产生/改变：控制可见组、方案叠加、相机与UI
 * 阅读与修改：interior按钮被映射到新pilot，不显示旧A至D场景。 */
function setView(v) {
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 v === 'interior' || v === 'pilot'。 */
  if (v === 'interior' || v === 'pilot') {
    /* 学习注释：执行这一句操作：proposalOn = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    proposalOn = true;
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 v === 'interior' && !floorSelection。 */
    if (v === 'interior' && !floorSelection) /* 学习注释：执行这一句操作：floorSelection = 3;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    floorSelection = 3;
    /* 学习注释：执行这一句操作：v = 'pilot';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    v = 'pilot';
  } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 v === 'floors'。 */
  if (v === 'floors') /* 学习注释：执行这一句操作：proposalOn = false;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  proposalOn = false;
  else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 v === 'top'。 */
  if (v === 'top') {
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 !floorSelection。 */
    if (!floorSelection) /* 学习注释：执行这一句操作：floorSelection = 3;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    floorSelection = 3;
    /* 学习注释：执行这一句操作：v = 'floorPlan';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    v = 'floorPlan';
  }
  /* 学习注释：执行这一句操作：view = v;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  view = v;
  /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
  interior.visible = false;
  /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
  exterior.visible = v === 'exterior';
  /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
  libraryExterior.visible = v === 'library';
  /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
  buildingFloors.visible = isFloorView();
  /* 学习注释：执行这一句操作：syncFloorVisibility();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  syncFloorVisibility();
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 v === 'exterior'。 */
  if (v === 'exterior') {
    /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
    camera.position.set(130, 106, 175);
    /* 学习注释：执行这一句操作：controls.target.set(0, 16, -28);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    controls.target.set(0, 16, -28);
  } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 v === 'library'。 */
  if (v === 'library') {
    /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
    camera.position.set(78, 58, -125);
    /* 学习注释：执行这一句操作：controls.target.set(0, 8, -26);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    controls.target.set(0, 8, -26);
  } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 isFloorView()。 */
  if (isFloorView()) {
    /* 学习注释：建立 y。 */
    const y = floorSelection ? floorOffset(floorSelection) : expanded ? 17 : 9;
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 v === 'floorPlan'。 */
    if (v === 'floorPlan') {
      /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
      camera.position.set(0, y + 93, 0.001);
      /* 学习注释：执行这一句操作：controls.target.set(0, y, 0);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      controls.target.set(0, y, 0);
    } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 floorSelection。 */
    if (floorSelection) {
      /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
      camera.position.set(44, y + 36, 58);
      /* 学习注释：执行这一句操作：controls.target.set(0, y + 1, 0);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      controls.target.set(0, y + 1, 0);
    } else {
      /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
      camera.position.set(61, expanded ? 67 : 47, 77);
      /* 学习注释：执行这一句操作：controls.target.set(0, expanded ? 18 : 10, 0);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      controls.target.set(0, expanded ? 18 : 10, 0);
    }
  }
  /* 学习注释：更新轨道控制及阻尼后相机；改变 position 或 target 后需要同步。 */
  controls.update();
  /* 学习注释：执行这一句操作：syncUI();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  syncUI();
}
/* 学习注释：setFloor：选择0至5层
 * 读取/参数：输入n
 * 产生/改变：限制范围后按当前叠加状态切换视图
 * 阅读与修改：0是总览；平面俯瞰与本层状态保留。 */
function setFloor(n) {
  /* 学习注释：执行这一句操作：floorSelection = Math.max(0, Math.min(5, Number(n) || 0));。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  floorSelection = Math.max(0, Math.min(5, Number(n) || 0));
  /* 学习注释：执行这一句操作：setView(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  setView(
    view === 'floorPlan' && floorSelection
      ? 'floorPlan'
      : proposalOn
        ? 'pilot'
        : 'floors',
  );
}
/* 学习注释：goCamera：切换视图后设置特定机位
 * 读取/参数：v、pos数组、target数组
 * 产生/改变：设置camera和controls.target并更新
 * 阅读与修改：只改变观察方向，不改变建筑地理位置。 */
function goCamera(v, pos, target) {
  /* 学习注释：执行这一句操作：setView(v);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  setView(v);
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  camera.position.set(...pos);
  /* 学习注释：执行这一句操作：controls.target.set(...target);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  controls.target.set(...target);
  /* 学习注释：更新轨道控制及阻尼后相机；改变 position 或 target 后需要同步。 */
  controls.update();
}
/* 学习注释：逐项遍历 ['interior', 'exterior', 'library', 'top']，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 id。 */
const id of ['interior', 'exterior', 'library', 'top'])
  /* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
  $(id).onclick = () => setView(id);
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('floors').onclick = () => {
  /* 学习注释：执行这一句操作：floorSelection = 0;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  floorSelection = 0;
  /* 学习注释：执行这一句操作：setView('floors');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  setView('floors');
};
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('reset').onclick = () => setView(view);
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('locateLibrary').onclick = () => setView('library');
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('enterCutaway').onclick = () => {
  /* 学习注释：执行这一句操作：floorSelection = 0;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  floorSelection = 0;
  /* 学习注释：执行这一句操作：setView('floors');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  setView('floors');
};
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('campusBack').onclick = () => goCamera('exterior', [114, 96, -190], [0, 15, -45]);
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('libraryBack').onclick = () => goCamera('library', [0, 23, -85], [0, 14, -1]);
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('lakeView').onclick = () => goCamera('library', [52, 22, -88], [0, 10, -29]);
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('entryView').onclick = () => goCamera('library', [21, 10, -44], [0, 6, -22]);
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('facadeFront').onclick = () => goCamera('exterior', [0, 40, 192], [0, 21, -12]);
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('roofDetail').onclick = () =>
  view === 'library'
    ? goCamera('library', [40, 47, -54], [0, 24, -8])
    : goCamera('exterior', [39, 62, 49], [0, 40, -3]);
/* 学习注释：执行这一句操作：document。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
document
  .querySelectorAll('[data-floor]')
  .forEach((el) => (el.onclick = () => setFloor(el.dataset.floor)));
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('explode').onclick = () => {
  /* 学习注释：执行这一句操作：expanded = !expanded;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  expanded = !expanded;
  /* 学习注释：执行这一句操作：setView(proposalOn ? 'pilot' : 'floors');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  setView(proposalOn ? 'pilot' : 'floors');
};
/* 学习注释：绑定输入变化入口，用来重算条件、使旧建议失效或同步界面；不是后台数据推送。 */
$('furniture').onchange = () => {
  /* 学习注释：执行这一句操作：showFurniture = $('furniture').checked;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  showFurniture = $('furniture').checked;
  /* 学习注释：执行这一句操作：syncFloorVisibility();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  syncFloorVisibility();
};
/* 学习注释：绑定输入变化入口，用来重算条件、使旧建议失效或同步界面；不是后台数据推送。 */
$('skylight').onchange = () => {
  /* 学习注释：执行这一句操作：showSkylight = $('skylight').checked;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  showSkylight = $('skylight').checked;
  /* 学习注释：执行这一句操作：syncFloorVisibility();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  syncFloorVisibility();
};
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('floorPilot').onclick = () => setView(proposalOn ? 'floors' : 'pilot');
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('atriumView').onclick = () => {
  /* 学习注释：执行这一句操作：floorSelection = 0;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  floorSelection = 0;
  /* 学习注释：执行这一句操作：expanded = false;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  expanded = false;
  /* 学习注释：执行这一句操作：goCamera('floors', [0, 5.8, 17.8], [0, 10, -16]);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  goCamera('floors', [0, 5.8, 17.8], [0, 10, -16]);
};
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('reading').onclick = () => {
  /* 学习注释：建立 st。st：当前楼层状态，包含 active/pending/cooldown/target/progress。 */
  const st = current();
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 !st。 */
  if (!st) /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return;
  /* 学习注释：批量修改对象中的列出字段；未列出的属性保留。先看第一参数确认正在修改哪一层的状态。 */
  Object.assign(st, { active: false, pending: false, cooldown: false, target: 0 });
  /* 学习注释：执行这一句操作：status('已重置本层常态用途。此按钮为演示复位。');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  status('已重置本层常态用途。此按钮为演示复位。');
  /* 学习注释：执行这一句操作：syncUI();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  syncUI();
};
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('pilotFocus').onclick = () => {
  /* 学习注释：建立 q。q：当前楼层试点配置。 */
  const q = info();
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 !q。 */
  if (!q) /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return;
  /* 学习注释：执行这一句操作：setView('pilot');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  setView('pilot');
  /* 学习注释：执行这一句操作：renderDirty = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  renderDirty = true;
  /* 学习注释：建立 y、d。 */
  const y = floorOffset(q.n),
    d = q.n === 5 ? 32 : q.n === 3 ? 23 : q.n === 1 ? 20 : 14;
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  camera.position.set(q.x + d * 0.68, y + d * 0.76, q.z + d);
  /* 学习注释：执行这一句操作：controls.target.set(q.x, y + 0.8, q.z);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  controls.target.set(q.x, y + 0.8, q.z);
  /* 学习注释：更新轨道控制及阻尼后相机；改变 position 或 target 后需要同步。 */
  controls.update();
};
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('request').onclick = () => {
  /* 学习注释：建立 st。st：当前楼层状态，包含 active/pending/cooldown/target/progress。 */
  const st = current();
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 !st。 */
  if (!st) /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return;
  /* 学习注释：建立 reason。 */
  const reason = blockReason();
  /* 学习注释：执行这一句操作：st.pending = !reason;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  st.pending = !reason;
  /* 学习注释：执行这一句操作：status(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  status(
    reason ||
      '建议已生成：' + info().active + '。尚未执行，请馆员核对候选范围和安静要求。',
    reason ? 'blocked' : 'pending',
  );
  /* 学习注释：执行这一句操作：syncUI();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  syncUI();
};
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('approve').onclick = () => {
  /* 学习注释：建立 st。st：当前楼层状态，包含 active/pending/cooldown/target/progress。 */
  const st = current();
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 !st?.pending。 */
  if (!st?.pending) /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return;
  /* 学习注释：建立 reason。 */
  const reason = blockReason();
  /* 学习注释：执行这一句操作：st.pending = false;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  st.pending = false;
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 reason。 */
  if (reason) /* 学习注释：执行这一句操作：status(reason, 'blocked');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  status(reason, 'blocked');
  else {
    /* 学习注释：执行这一句操作：st.active = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    st.active = true;
    /* 学习注释：执行这一句操作：st.target = 1;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    st.target = 1;
    /* 学习注释：执行这一句操作：status(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    status(
      '馆员已确认：' +
        info().active +
        '。' +
        (floorSelection === 5
          ? '仅显示静音提示，桌椅和有效预约保持不变。'
          : '本次只演示新增试点设施；实际调整由工作人员实施。'),
    );
  }
  /* 学习注释：执行这一句操作：syncUI();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  syncUI();
};
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('restore').onclick = () => {
  /* 学习注释：建立 st。st：当前楼层状态，包含 active/pending/cooldown/target/progress。 */
  const st = current();
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 !st。 */
  if (!st) /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return;
  /* 学习注释：批量修改对象中的列出字段；未列出的属性保留。先看第一参数确认正在修改哪一层的状态。 */
  Object.assign(st, { active: false, pending: false, cooldown: true, target: 0 });
  /* 学习注释：执行这一句操作：status('已模拟连续无人5分钟：恢复本层常态，并进入10分钟冷却期。');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  status('已模拟连续无人5分钟：恢复本层常态，并进入10分钟冷却期。');
  /* 学习注释：执行这一句操作：syncUI();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  syncUI();
};
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('advance').onclick = () => {
  /* 学习注释：建立 st。st：当前楼层状态，包含 active/pending/cooldown/target/progress。 */
  const st = current();
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 st。 */
  if (st) {
    /* 学习注释：执行这一句操作：st.cooldown = false;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    st.cooldown = false;
    /* 学习注释：执行这一句操作：status('已推进模拟时钟10分钟，可再次申请。');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    status('已推进模拟时钟10分钟，可再次申请。');
    /* 学习注释：执行这一句操作：syncUI();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    syncUI();
  }
};
/* 学习注释：逐项遍历 ['objection', 'reserved']，每轮使用一个元素；不是复制整个场景。 */
for (/* 学习注释：建立 id。 */
const id of ['objection', 'reserved'])
  /* 学习注释：绑定输入变化入口，用来重算条件、使旧建议失效或同步界面；不是后台数据推送。 */
  $(id).onchange = () => {
    /* 学习注释：建立 st。st：当前楼层状态，包含 active/pending/cooldown/target/progress。 */
    const st = current();
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 !st。 */
    if (!st) /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
    return;
    /* 学习注释：执行这一句操作：st[id] = $(id).checked;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    st[id] = $(id).checked;
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 st.pending。 */
    if (st.pending) {
      /* 学习注释：执行这一句操作：st.pending = false;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      st.pending = false;
      /* 学习注释：执行这一句操作：status('条件改变，旧建议失效，需要重新核对。', 'blocked');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      status('条件改变，旧建议失效，需要重新核对。', 'blocked');
    } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 st.active && st[id]。 */
    if (st.active && st[id])
      /* 学习注释：执行这一句操作：status('出现新约束：馆员接管，模型不会自动移动进行中的设施。', 'blocked');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      status('出现新约束：馆员接管，模型不会自动移动进行中的设施。', 'blocked');
    /* 学习注释：执行这一句操作：syncUI();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    syncUI();
  };
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('labels').onclick = () => {
  /* 学习注释：执行这一句操作：labelsOn = !labelsOn;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  labelsOn = !labelsOn;
  /* 学习注释：设置 DOM/SVG 属性；查看第一个参数确认这是尺寸、样式、可访问状态还是绘图路径。 */
  $('labels').setAttribute('aria-pressed', String(labelsOn));
};
/* 学习注释：建立 raycaster。raycaster：从屏幕指向场景，求鼠标命中的对象。 */
const raycaster = new THREE.Raycaster();
/* 学习注释：建立 pointerStart。pointerStart：记录按下位置，用距离区分点选与拖动。 */
let pointerStart = null;
/* 学习注释：注册事件监听器：浏览器在事件发生时才调用回调。此行不是立即执行里面的业务操作。 */
renderer.domElement.addEventListener(
  'pointerdown',
  (e) => (pointerStart = { x: e.clientX, y: e.clientY }),
);
/* 学习注释：注册事件监听器：浏览器在事件发生时才调用回调。此行不是立即执行里面的业务操作。 */
renderer.domElement.addEventListener('pointerup', (e) => {
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 !pointerStart || Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 5。 */
  if (
    !pointerStart ||
    Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 5
  )
    /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
    return;
  /* 学习注释：建立 r。 */
  const r = renderer.domElement.getBoundingClientRect();
  /* 学习注释：执行这一句操作：raycaster.setFromCamera(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  raycaster.setFromCamera(
    new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    ),
    camera,
  );
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 isFloorView()。 */
  if (isFloorView()) {
    /* 学习注释：建立 hit。 */
    const hit = raycaster.intersectObjects(
      floorModel.storeys.filter((f) => f.root.visible).map((f) => f.root),
      true,
    )[0];
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 hit。 */
    if (hit) {
      /* 学习注释：建立 o。 */
      let o = hit.object;
      /* 学习注释：重复检查条件 o && !o.userData.floor；本项目常用于沿 parent 向上查找楼层或主三标记。 */
      while (o && !o.userData.floor) /* 学习注释：执行这一句操作：o = o.parent;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      o = o.parent;
      /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 o。 */
      if (o) /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
      setFloor(o.userData.floor);
    }
  } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 view === 'exterior'。 */
  if (view === 'exterior') {
    /* 学习注释：建立 hit。 */
    const hit = raycaster.intersectObject(exterior, true)[0];
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 hit。 */
    if (hit) {
      /* 学习注释：建立 o。 */
      let o = hit.object;
      /* 学习注释：重复检查条件 o && !o.userData.main3；本项目常用于沿 parent 向上查找楼层或主三标记。 */
      while (o && !o.userData.main3) /* 学习注释：执行这一句操作：o = o.parent;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      o = o.parent;
      /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 o。 */
      if (o) /* 学习注释：执行这一句操作：setView('library');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      setView('library');
    }
  } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 view === 'library'。 */
  if (view === 'library') {
    /* 学习注释：建立 hit。 */
    const hit = raycaster.intersectObject(libraryExterior, true)[0];
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 hit && !hit.object.name.includes('lake') && !hit.object.name.includes('shore')。 */
    if (
      hit &&
      !hit.object.name.includes('lake') &&
      !hit.object.name.includes('shore')
    ) {
      /* 学习注释：执行这一句操作：floorSelection = 0;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      floorSelection = 0;
      /* 学习注释：执行这一句操作：setView('floors');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      setView('floors');
    }
  }
});
/* 学习注释：download：下载当前Blob资源
 * 读取/参数：blob及name
 * 产生/改变：创建临时下载链接，1秒后释放ObjectURL
 * 阅读与修改：触发下载不等于用户已保存成功；应检查本机文件。 */
function download(blob, name) {
  /* 学习注释：建立 a。 */
  const a = document.createElement('a');
  /* 学习注释：执行这一句操作：a.href = URL.createObjectURL(blob);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  a.href = URL.createObjectURL(blob);
  /* 学习注释：执行这一句操作：a.download = name;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  a.download = name;
  /* 学习注释：执行这一句操作：a.click();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  a.click();
  /* 学习注释：执行这一句操作：setTimeout(() => URL.revokeObjectURL(a.href), 1000);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
/* 学习注释：exportName：按可见状态生成下载名称
 * 读取/参数：view、floorSelection、proposalOn与expanded
 * 产生/改变：返回相应中文GLB文件名
 * 阅读与修改：名字区分用途，不能证明模型坐标已实测。 */
function exportName() {
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return view === 'exterior'
    ? '嘉庚建筑意象.glb'
    : view === 'library'
      ? '主三背面_图书馆外观.glb'
      : proposalOn
        ? floorSelection
          ? '图书馆_' +
            floorSelection +
            '楼_试点' +
            (current().active ? '启用' : '常态') +
            '.glb'
          : '图书馆_五层试点总览.glb'
        : floorSelection
          ? '图书馆_' + floorSelection + '楼_空间剖切.glb'
          : expanded
            ? '图书馆_五层展开.glb'
            : '图书馆_五层整体剖切.glb';
}
/* 学习注释：exportGLB：导出可见模型快照
 * 读取/参数：当前场景与GLTFExporter
 * 产生/改变：异步返回二进制GLB，单层克隆归零高度
 * 阅读与修改：只导当前可见对象；动画未完成时可能导出中间态。 */
async function exportGLB() {
  /* 学习注释：建立 root。root：当前组合对象的父节点或待导出对象。 */
  let root =
    view === 'exterior'
      ? exterior
      : view === 'library'
        ? libraryExterior
        : floorSelection
          ? floorModel.storeys[floorSelection - 1].root.clone(true)
          : buildingFloors;
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 floorSelection && isFloorView()。 */
  if (floorSelection && isFloorView()) /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  root.position.y = 0;
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true });
}
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('export').onclick = async () => {
  /* 学习注释：尝试运行可能失败的解析、播放或导出步骤；catch 接住错误，finally（如有）执行收尾。 */
  try {
    /* 学习注释：更新控件能否点击。这是界面层限制，批准函数仍要独立复核状态和约束。 */
    $('export').disabled = true;
    /* 学习注释：执行这一句操作：download(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    download(
      new Blob([await exportGLB()], { type: 'model/gltf-binary' }),
      exportName(),
    );
    /* 学习注释：执行这一句操作：toast('当前场景已导出');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    toast('当前场景已导出');
  } catch (e) {
    /* 学习注释：执行这一句操作：toast('导出失败：' + e.message);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    toast('导出失败：' + e.message);
    /* 学习注释：执行这一句操作：console.error(e);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    console.error(e);
  } finally {
    /* 学习注释：更新控件能否点击。这是界面层限制，批准函数仍要独立复核状态和约束。 */
    $('export').disabled = false;
  }
};
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
$('snapshot').onclick = () => {
  /* 学习注释：按当前相机把场景画到 canvas。状态变化不会自动变成屏幕像素，需要这一绘制调用。 */
  renderer.render(scene, camera);
  /* 学习注释：执行这一句操作：renderer.domElement.toBlob(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  renderer.domElement.toBlob(
    (b) => download(b, exportName().replace('.glb', '.png')),
    'image/png',
  );
};
/* 学习注释：resize：调整画布和相机比例
 * 读取/参数：host宽高
 * 产生/改变：更新renderer尺寸 aspect和投影矩阵
 * 阅读与修改：需保留宿主有效尺寸；不是重新创建所有几何。 */
function resize() {
  /* 学习注释：执行这一句操作：renderDirty = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  renderDirty = true;
  /* 学习注释：执行这一句操作：renderer.setSize(host.clientWidth, host.clientHeight);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  renderer.setSize(host.clientWidth, host.clientHeight);
  /* 学习注释：执行这一句操作：camera.aspect = host.clientWidth / host.clientHeight;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  camera.aspect = host.clientWidth / host.clientHeight;
  /* 学习注释：执行这一句操作：camera.updateProjectionMatrix();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  camera.updateProjectionMatrix();
}
/* 学习注释：执行这一句操作：new ResizeObserver(resize).observe(host);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
new ResizeObserver(resize).observe(host);
/* 学习注释：执行这一句操作：resize();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
resize();
/* 学习注释：执行这一句操作：setView('exterior');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
setView('exterior');
/* 学习注释：建立 floorLabels。floorLabels：楼层浮动标注 DOM 及对应编号。 */
const floorLabels = floorModel.storeys.map((f) => {
  /* 学习注释：建立 el。 */
  const el = document.createElement('button');
  /* 学习注释：执行这一句操作：el.className = 'model-label floor-model-label';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  el.className = 'model-label floor-model-label';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  el.textContent = f.info.n + 'F · ' + f.info.title;
  /* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
  el.onclick = () => setFloor(f.info.n);
  /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
  $('labelsLayer').append(el);
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return { el, n: f.info.n };
});
/* 学习注释：建立 functionLabels。functionLabels：馆藏区域浮动文字 DOM。 */
const functionLabels = Array.from({ length: 18 }, () => {
  /* 学习注释：建立 el。 */
  const el = document.createElement('div');
  /* 学习注释：执行这一句操作：el.className = 'model-label function-label';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  el.className = 'model-label function-label';
  /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
  $('labelsLayer').append(el);
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return el;
});
/* 学习注释：建立 pilotLabels。pilotLabels：拟议试点浮动标注 DOM。 */
const pilotLabels = pilots.map((p) => {
  /* 学习注释：建立 el。 */
  const el = document.createElement('button');
  /* 学习注释：执行这一句操作：el.className = 'model-label pilot-model-label';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  el.className = 'model-label pilot-model-label';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  el.textContent = p.info.n + 'F 拟议 · ' + p.info.title;
  /* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
  el.onclick = () => {
    /* 学习注释：执行这一句操作：floorSelection = p.info.n;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    floorSelection = p.info.n;
    /* 学习注释：执行这一句操作：setView('pilot');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    setView('pilot');
  };
  /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
  $('labelsLayer').append(el);
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return el;
});
/* 学习注释：建立 main3Label。main3Label：进入主三背面馆舍的标注按钮。 */
const main3Label = document.createElement('button');
/* 学习注释：执行这一句操作：main3Label.className = 'model-label floor-model-label';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
main3Label.className = 'model-label floor-model-label';
/* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
main3Label.textContent = '主三 · 进入背面图书馆';
/* 学习注释：绑定按钮点击入口，回调函数里的状态变化在点击后发生。先沿 id 找到模板里的同名控件。 */
main3Label.onclick = () => setView('library');
/* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
$('labelsLayer').append(main3Label);
/* 学习注释：建立 directions。directions：东南西北方向标注及局部坐标。 */
const directions = [
  ['东区', 0, -27],
  ['北区', -22, 0],
  ['南区', 22, 0],
  ['西区', 0, 26],
].map(([text, x, z]) => {
  /* 学习注释：建立 el。 */
  const el = document.createElement('div');
  /* 学习注释：执行这一句操作：el.className = 'model-label direction-label';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  el.className = 'model-label direction-label';
  /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
  el.textContent = text;
  /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
  $('labelsLayer').append(el);
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return { el, x, z };
});
/* 学习注释：positionLabel：把3D标签定位到2D界面
 * 读取/参数：DOM元素、Vector3与visible
 * 产生/改变：投影后写left/top与display
 * 阅读与修改：会修改传入Vector3；未做完整遮挡和重叠排布。 */
function positionLabel(el, pos, visible) {
  /* 学习注释：建立 p。p：局部试点配置、三维点或 DOM 段落，以当前函数为准。 */
  const p = pos.project(camera);
  /* 学习注释：执行这一句操作：el.style.left = (p.x * 0.5 + 0.5) * host.clientWidth + 'px';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  el.style.left = (p.x * 0.5 + 0.5) * host.clientWidth + 'px';
  /* 学习注释：执行这一句操作：el.style.top = (-p.y * 0.5 + 0.5) * host.clientHeight + 'px';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  el.style.top = (-p.y * 0.5 + 0.5) * host.clientHeight + 'px';
  /* 学习注释：执行这一句操作：el.style.display =。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  el.style.display =
    visible && labelsOn && p.z < 1 && Math.abs(p.x) < 1.02 && Math.abs(p.y) < 1.02
      ? 'block'
      : 'none';
}
/* 学习注释：建立 last。last：上一动画帧的毫秒时间。 */
let last = performance.now();
/* 学习注释：animate：每帧更新动画 控件与标签
 * 读取/参数：requestAnimationFrame时间now
 * 产生/改变：推进各层progress、按需绘制、更新标签并再次请求帧
 * 阅读与修改：没有实体控制、碰撞或声音计算，帧循环仍持续。 */
function animate(now) {
  /* 学习注释：建立 dt。dt：两帧间的秒数，上限 .08 防止卡顿后跳跃。 */
  const dt = Math.min((now - last) / 1000, 0.08);
  /* 学习注释：执行这一句操作：last = now;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  last = now;
  /* 学习注释：建立 animated。 */
  let animated = false;
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 i。 */
  let i = 0; i < pilots.length; i++) {
    /* 学习注释：建立 st。st：当前楼层状态，包含 active/pending/cooldown/target/progress。 */
    const st = pilotStates[i];
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 st.progress !== st.target。 */
    if (st.progress !== st.target) /* 学习注释：执行这一句操作：animated = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    animated = true;
    /* 学习注释：执行这一句操作：st.progress =。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    st.progress =
      Math.abs(st.target - st.progress) < 0.002
        ? st.target
        : st.progress + (st.target - st.progress) * Math.min(1, dt * 2.8);
    /* 学习注释：执行这一句操作：pilots[i].apply(st.progress);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    pilots[i].apply(st.progress);
  }
  /* 学习注释：建立 cameraChanged。 */
  const cameraChanged = controls.update();
  /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 animated || cameraChanged || renderDirty。 */
  if (animated || cameraChanged || renderDirty) {
    /* 学习注释：按当前相机把场景画到 canvas。状态变化不会自动变成屏幕像素，需要这一绘制调用。 */
    renderer.render(scene, camera);
    /* 学习注释：执行这一句操作：renderDirty = false;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    renderDirty = false;
  }
  /* 学习注释：逐项遍历 floorLabels，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 l。 */
  const l of floorLabels)
    /* 学习注释：执行这一句操作：positionLabel(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    positionLabel(
      l.el,
      new THREE.Vector3(-20.5, floorOffset(l.n) + 1.25, 20),
      isFloorView() && (!floorSelection || floorSelection === l.n),
    );
  /* 学习注释：建立 f。 */
  const f = FLOOR_INFO.find((f) => f.n === floorSelection);
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 i。 */
  let i = 0; i < functionLabels.length; i++) {
    /* 学习注释：建立 zone。 */
    const zone = f?.zones[i];
    /* 学习注释：以普通文字更新 DOM；不会把主动输入的主题当 HTML 运行，数据内容和页面结构分开。 */
    functionLabels[i].textContent = zone?.label || '';
    /* 学习注释：执行这一句操作：positionLabel(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    positionLabel(
      functionLabels[i],
      new THREE.Vector3(zone?.x || 0, floorOffset(floorSelection) + 2.5, zone?.z || 0),
      isFloorView() && floorSelection > 0 && showFurniture && !!zone,
    );
  }
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 i。 */
  let i = 0; i < pilots.length; i++) {
    /* 学习注释：建立 p。p：局部试点配置、三维点或 DOM 段落，以当前函数为准。 */
    const p = pilots[i].info;
    /* 学习注释：执行这一句操作：positionLabel(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    positionLabel(
      pilotLabels[i],
      new THREE.Vector3(p.x, floorOffset(p.n) + 3.4, p.z),
      isFloorView() &&
        proposalOn &&
        showFurniture &&
        (!floorSelection || floorSelection === p.n),
    );
  }
  /* 学习注释：逐项遍历 directions，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 d。 */
  const d of directions)
    /* 学习注释：执行这一句操作：positionLabel(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    positionLabel(
      d.el,
      new THREE.Vector3(d.x, floorOffset(floorSelection) + 0.4, d.z),
      isFloorView() && !!floorSelection,
    );
  /* 学习注释：执行这一句操作：positionLabel(main3Label, new THREE.Vector3(0, 26, 17), view === 'exterior');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  positionLabel(main3Label, new THREE.Vector3(0, 26, 17), view === 'exterior');
  /* 学习注释：预约下一帧。浏览器给回调时间戳，形成持续动画循环；不是立即递归调用导致栈溢出。 */
  requestAnimationFrame(animate);
}
/* 学习注释：预约下一帧。浏览器给回调时间戳，形成持续动画循环；不是立即递归调用导致栈溢出。 */
requestAnimationFrame(animate);
/* 学习注释：signature：取得对象的位置旋转摘要
 * 读取/参数：root对象树
 * 产生/改变：收集Mesh名称 局部位置与旋转
 * 阅读与修改：不含可见性、尺寸或材质；不能当全面几何一致性证明。 */
function signature(root) {
  /* 学习注释：建立 a。 */
  const a = [];
  /* 学习注释：执行这一句操作：root.traverse((o) => {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  root.traverse((o) => {
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 o.isMesh。 */
    if (o.isMesh)
      /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
      a.push([o.name, ...o.position.toArray(), ...o.rotation.toArray().slice(0, 3)]);
  });
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return a;
}
/* 学习注释：执行这一句操作：window.modelApp = {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
window.modelApp = {
  setView,
  setFloor,
  exportGLB,
  exportName,
  getState: () => ({
    view,
    proposalOn,
    floorSelection,
    expanded,
    showFurniture,
    showSkylight,
    visibleFloors: floorModel.storeys
      .filter((f) => f.root.visible)
      .map((f) => f.info.n),
    floorHeights: floorModel.storeys.map((f) => f.root.position.y),
    mode: current()?.active ? 'active' : 'normal',
    pending: !!current()?.pending,
    cooldown: !!current()?.cooldown,
    progress: current()?.progress || 0,
    pilotStates: pilotStates.map((s) => ({ ...s })),
    pilotInfo: PILOT_INFO,
    movableTables: floorSelection
      ? pilots[floorSelection - 1].moving.map((m) => m.object.position.toArray())
      : [],
    protectedSignature: floorModel.storeys.map((f) => ({
      n: f.info.n,
      structure: signature(f.structural),
      collections: signature(f.furniture),
    })),
    meshCount: renderer.info.render.triangles,
  }),
};
/* 学习注释：执行这一句操作：window.modelApp.getArchitectureState = () => ({。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
window.modelApp.getArchitectureState = () => ({
  campusVisible: exterior.visible,
  libraryOnlyVisible: libraryExterior.visible,
  companions: exterior.children
    .filter((x) => x.name === 'five_floor_companion_context')
    .map((g) => ({ name: g.userData.building, extent: g.userData.longitudinalExtent })),
  main3Extent: [-68, 23],
  environmentNames: libraryExterior
    .getObjectByName('library_lakeside_environment')
    .children.map((m) => m.name),
  hasEntranceSign: !!libraryExterior.getObjectByName('library_entrance_name_sign'),
});
/* 学习注释：执行这一句操作：window.modelApp.floorPickPoint = (n) => {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
window.modelApp.floorPickPoint = (n) => {
  /* 学习注释：建立 r、p。p：局部试点配置、三维点或 DOM 段落，以当前函数为准。 */
  const r = host.getBoundingClientRect(),
    p = new THREE.Vector3(15, floorOffset(n) + 0.25, 19).project(camera);
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return {
    x: r.left + (p.x * 0.5 + 0.5) * r.width,
    y: r.top + (-p.y * 0.5 + 0.5) * r.height,
  };
};
