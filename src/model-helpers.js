import * as THREE from 'three';
// 交互模型与离线效果图使用同一套几何工厂，避免展示和源程序各画各的。
export function createHelpers(){
 const materials=new Map();
 const geometries=new Map();let chairBackGeometry=null;
 // 重复的椅腿、柜门等共用几何体；每个Mesh仍有自己的位置和座位标识。
 function cachedGeometry(key,create){if(!geometries.has(key)){const geo=create();geo.userData.sharedGeometry=true;geometries.set(key,geo);}return geometries.get(key);}
 function material(color,options={}){const key=color+JSON.stringify(options);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.8,...(options.transparent?{depthWrite:false}:{}),...options}));return materials.get(key);}
 function group(parent,name){const g=new THREE.Group();g.name=name;parent.add(g);return g;}
 function box(parent,name,w,h,d,x,y,z,color,options={}){const geo=cachedGeometry(`box:${w}:${h}:${d}`,()=>new THREE.BoxGeometry(w,h,d));const m=new THREE.Mesh(geo,material(color,options));m.name=name;m.position.set(x,y,z);parent.add(m);return m;}
 function cylinder(parent,name,r,h,x,y,z,color,rTop=r){const geo=cachedGeometry(`cylinder:${rTop}:${r}:${h}`,()=>new THREE.CylinderGeometry(rTop,r,h,10));const m=new THREE.Mesh(geo,material(color));m.name=name;m.position.set(x,y,z);parent.add(m);return m;}
 function plant(parent,x,z,scale=1){const g=group(parent,'planter');g.position.set(x,0,z);g.scale.setScalar(scale);cylinder(g,'pot',.35,.6,0,.3,0,'#b99d79',.48);cylinder(g,'stem',.04,1.4,0,1,0,'#687650');const m=new THREE.Mesh(new THREE.SphereGeometry(.4,8,6),material('#73976d'));m.position.y=1.6;g.add(m);return g;}
 function table(parent,x,z,w=2.5,d=1.3){
  // 整张桌子是一个Group；外层仍可按同一个位置绑定四个座位，外观细化不会改变座位编号。
  const g=group(parent,'table');g.position.set(x,0,z);
  // 现场照片中的桌面是浅奶油色，边缘有较深的包边，而不是整块黄色木板。
  box(g,'dark_desktop_edge',w+.025,.10,d+.025,0,.78,0,'#4e504c');
  box(g,'cream_worktop',w,.085,d,0,.835,0,'#e1dfc7',{roughness:.53});
  if(w>=3.5){
   // 普通长桌参考照片中的板式支撑与横向金属底脚；尺寸仍为展示比例。
   for(const a of [-w*.32,w*.32]){
    box(g,'wooden_desk_pedestal',.16,.72,d*.72,a,.38,0,'#a49378');
    box(g,'metal_pedestal_foot',.27,.065,d*.96,a,.045,0,'#939a9b',{metalness:.5,roughness:.4});
   }
   box(g,'desk_lower_stretcher',w*.65,.11,.12,0,.30,0,'#a39a81');
  }else{
   // 小桌及备考示例桌保留独立金属腿，不根据一张普通阅览桌照片推断全部桌型。
   for(const a of [-w/2+.18,w/2-.18])for(const b of [-d/2+.15,d/2-.15])box(g,'table_leg',.08,.77,.08,a,.39,b,'#a2aaa0');
  }
  return g;
 }
 function chair(parent,x,z,rot=0,col='#247796'){
  const g=group(parent,'chair');g.position.set(x,0,z);g.rotation.y=rot;
  box(g,'blue_seat',.72,.10,.68,0,.56,0,col,{roughness:.46});
  // 用带孔的二维轮廓挤出椅背：孔是穿透的真实几何，不是贴在表面的圆点。
  const backOutline=new THREE.Shape();backOutline.moveTo(-.34,0);backOutline.lineTo(-.36,.35);
  backOutline.quadraticCurveTo(-.36,.52,0,.55);backOutline.quadraticCurveTo(.36,.52,.36,.35);
  backOutline.lineTo(.34,0);backOutline.closePath();
  for(const y of [.14,.27,.40])for(const x of [-.24,-.12,0,.12,.24]){
   const hole=new THREE.Path();hole.absarc(x,y,.014,0,Math.PI*2,true);backOutline.holes.push(hole);
  }
  if(!chairBackGeometry){chairBackGeometry=new THREE.ExtrudeGeometry(backOutline,{depth:.055,bevelEnabled:true,bevelSize:.007,bevelThickness:.007,bevelSegments:1,curveSegments:5});chairBackGeometry.userData.sharedGeometry=true;}
  const backGeo=chairBackGeometry;
  const back=new THREE.Mesh(backGeo,material(col,{roughness:.46}));back.name='blue_perforated_back';back.position.set(0,.68,-.33);back.rotation.x=-.06;g.add(back);
  for(const a of [-.28,.28])for(const b of [-.25,.25])box(g,'metal_chair_leg',.045,.51,.045,a,.28,b,'#9aa7ac');
  for(const a of [-.40,.40]){box(g,'dark_armrest',.07,.06,.45,a,.83,-.02,'#343e43');box(g,'arm_support',.04,.28,.04,a,.69,.12,'#9aa7ac');}
  return g;
 }
 return {group,box,cylinder,material,plant,table,chair};
}
