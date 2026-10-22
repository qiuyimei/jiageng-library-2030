import * as THREE from 'three';
// 光影参数只影响展示效果，不改变占用数据，也不是现场照度测量。
export const LIGHT_PRESETS={
 daylight:{azimuth:145,elevation:54,sun:2.4,ambient:1.6,exposure:1.05},
 soft:{azimuth:220,elevation:65,sun:1.0,ambient:2.1,exposure:1.0},
 evening:{azimuth:220,elevation:18,sun:2.7,ambient:1.1,exposure:1.05},
 golden:{azimuth:195,elevation:9,sun:3.0,ambient:.95,exposure:1.1}
};
export function createSceneLighting(scene,renderer){
 const ambient=new THREE.HemisphereLight('#fffaf0','#aabb9b',1.6),sun=new THREE.DirectionalLight('#fff1df',2.4);
 // 较弱的反向补光近似墙面和地面反射，保留暖阳与冷暗部的差别。
 // 这是简化的实时灯光，并非物理日照或照度模拟。
 const bounce=new THREE.DirectionalLight('#e8eef1',.32),center=new THREE.Vector3(0,9,0);
 scene.add(ambient,sun,sun.target,bounce,bounce.target);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-65;sun.shadow.camera.right=65;sun.shadow.camera.top=65;sun.shadow.camera.bottom=-65;sun.shadow.camera.near=.1;sun.shadow.camera.far=240;
 sun.shadow.bias=-.00012;sun.shadow.normalBias=.025;sun.shadow.radius=3;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 let current={};function placeSun(c){
  const a=c.azimuth*Math.PI/180,e=c.elevation*Math.PI/180,r=110;
  sun.position.set(Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r).add(center);sun.target.position.copy(center);
  bounce.position.set(-Math.cos(a)*30,25,-Math.sin(a)*30).add(center);bounce.target.position.copy(center);
 }
 return {focus(y=9,extent=36,z=0){
  // 室内使用较紧的阴影范围，提高踏板、柱子和展板阴影的清晰度。
  center.set(0,y,z);const cam=sun.shadow.camera;cam.left=-extent;cam.right=extent;cam.top=extent;cam.bottom=-extent;cam.updateProjectionMatrix();if(current.azimuth!==undefined)placeSun(current);renderer.shadowMap.needsUpdate=true;
 },apply(raw){
  const finite=(v,f)=>Number.isFinite(Number(v))?Number(v):f;
  const c={azimuth:finite(raw.azimuth,145),elevation:Math.max(5,Math.min(85,finite(raw.elevation,54))),sun:Math.max(0,Math.min(4,finite(raw.sun,2.4))),ambient:Math.max(.1,Math.min(3,finite(raw.ambient,1.6))),exposure:Math.max(.4,Math.min(1.8,finite(raw.exposure,1.05)))};
  current=c;placeSun(c);sun.intensity=c.sun;ambient.intensity=c.ambient;bounce.intensity=c.ambient*.22;renderer.toneMappingExposure=c.exposure;
  const warmth=THREE.MathUtils.clamp((30-c.elevation)/22,0,1);
  sun.color.set('#fff6e3').lerp(new THREE.Color('#ffbc73'),warmth);
  ambient.color.set('#e4eff5').lerp(new THREE.Color('#eed8c1'),warmth*.6);
  ambient.groundColor.set('#acb7ab').lerp(new THREE.Color('#79868f'),warmth*.7);
  bounce.color.set('#edf2f4').lerp(new THREE.Color('#ffddaa'),warmth*.5);
  // 暖色天空背景与物体受光一起变化，避免只把整个画面染成黄色。
  if(scene.background?.isColor)scene.background.set('#e9e7df').lerp(new THREE.Color('#d9b995'),warmth*.72);
  renderer.shadowMap.enabled=raw.shadows!==false;renderer.shadowMap.needsUpdate=true;return c;
 }};
}
