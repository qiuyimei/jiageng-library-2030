import * as THREE from '../model3d_deps/node_modules/three/build/three.module.js';
// West/library-facing landscape. Relationship follows official photographs;
// shoreline, paving and signs are schematic, not surveyed construction details.
export function buildLibraryEnvironment(parent,H){
 const {group,box,cylinder,material,plant}=H;
 const g=group(parent,'library_lakeside_environment');g.userData={schematic:true,reference:'https://www.xujc.com/info/y48rxy9g.html'};
 box(g,'library_rear_approach',112,.22,22,0,-.78,-33,'#cecfbf');
 box(g,'library_walkway',108,.12,6,0,-.60,-28.5,'#e1dccb');
 box(g,'lakeside_green_strip',108,.18,5,0,-.67,-38,'#879d78');
 box(g,'shore_walk',108,.18,4.2,0,-.57,-42.5,'#c8bda4');
 for(const x of [-19,19]){box(g,'entry_planting_bed',7,.4,5,x,-.38,-32,'#a8b78f');for(const dx of [-2,0,2])plant(g,x+dx,-32,1.15);}
 for(const x of [-43,-29,29,43])for(const zz of [-30,-39])plant(g,x,zz,2.2);
 // Low central terrace steps connect the library axis to the waterfront.
 for(let i=0;i<5;i++)box(g,'lake_axis_terrace_step',22-i*.9,.18,1.0,0,-.56-i*.13,-39.5-i*.85,'#c2b9a5');
 for(const x of [-24,24])box(g,'waterfront_viewing_platform',16,.28,7,x,-.63,-47,'#c8b69a');
 const shore=new THREE.Shape();shore.moveTo(-56,46);shore.quadraticCurveTo(-62,72,-45,83);shore.quadraticCurveTo(0,98,48,81);shore.quadraticCurveTo(65,67,56,46);shore.lineTo(-56,46);
 const water=new THREE.Mesh(new THREE.ShapeGeometry(shore,36),material('#638f87',{roughness:.28,metalness:.30}));water.rotation.x=-Math.PI/2;water.position.y=-1.12;water.name='library_front_lake_water';g.add(water);
 // A shoreline edge, restrained ripples and distant planting make the setting legible.
 for(const side of [-1,1]){box(g,'lake_stone_edge',38,.25,.8,side*37,-.8,-46,'#bdb7a5');for(let k=0;k<13;k++)plant(g,side*(53+Math.sin(k*.5)*2),-48-k*2.4,1.9);}
 for(let k=0;k<10;k++){const pts=[];for(let i=0;i<=20;i++)pts.push(new THREE.Vector3(-44+i*4.4,-1.105,-52-k*3+Math.sin(i*.4+k)*.26));const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.018,4,false),material('#a1b6ab'));m.name='lake_surface_ripple';g.add(m);}
 for(const x of [-32,-16,16,32]){box(g,'shore_bench_seat',3,.12,.65,x,.12,-42,'#a99677');box(g,'shore_bench_back',3,.55,.09,x,.45,-41.7,'#a99677');for(const dx of [-1.2,1.2])box(g,'shore_bench_support',.13,.56,.5,x+dx,-.2,-42,'#697e71');}
 for(const x of [-42,-28,28,42]){cylinder(g,'walk_light',.075,3.4,x,1.1,-27,'#667c72');box(g,'walk_light_head',.65,.12,.4,x,2.84,-27,'#eee6cd');}
 function sign(text,w,h,x,y,z,name){const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=240;const ctx=canvas.getContext('2d');ctx.fillStyle='#e6dfce';ctx.fillRect(0,0,1600,240);ctx.fillStyle='#355b50';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 94px Microsoft YaHei';ctx.fillText(text,800,120,1500);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.82,side:THREE.DoubleSide}));mesh.rotation.y=Math.PI;mesh.position.set(x,y,z);mesh.name=name;parent.add(mesh);return mesh;}
 sign('厦门大学嘉庚学院图书馆',12,1.8,0,5.6,-22.7,'library_entrance_name_sign');
 box(g,'library_wayfinding_monument',6,2.2,.42,-11,.48,-27,'#d8d1bd');sign('图书馆 · LIBRARY',5.6,1.0,-11,.7,-27.24,'library_west_wayfinding_sign');
 // The signs communicate the entrance; exact on-site lettering needs photo verification.
 return g;
}
