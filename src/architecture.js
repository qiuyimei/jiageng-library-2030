import * as THREE from 'three';
import {createPhotoDetails} from './photo-details.js';

// Photo-guided geometry. Dimensions and internal locations are schematic.
export function buildExterior(parent, H) {
 const {group,box,cylinder,material,plant}=H;
 const photo=createPhotoDetails(H);
 parent.userData={description:'Photo-guided Zhangzhou campus Main Building 3, schematic dimensions; floors 6-12 are administrative context, not added library area',reference:'https://arch.xmu.edu.cn/info/1013/13073.htm'};
 const roofGroups=[];
 function line(name,pts,r,col,root=parent){const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(10,Math.min(24,pts.length*2)),r,6,false),material(col));m.name=name;m.castShadow=true;root.add(m);return m;}
 function beam(root,name,a,b,w,col){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b);const m=new THREE.Mesh(new THREE.BoxGeometry(w,p.distanceTo(q),w),material(col));m.position.copy(p).add(q).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),q.clone().sub(p).normalize());m.name=name;m.castShadow=true;root.add(m);return m;}
 function roof(name,w,d,pitch,base,x,z,root=parent){
  const g=group(root,name);g.position.set(x,base,z);roofGroups.push(g);
  const nx=36,nz=16;
  function height(u,v){return pitch*Math.pow(1-v,.79)+1.55*Math.pow(Math.abs(u),9)*(.78+.22*v)+.32*v*v;}
  for(const side of [-1,1]){
   const arr=[],uv=[],ind=[];
   for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const u=i/nx*2-1,v=j/nz;arr.push(u*w/2,height(u,v),side*v*d/2);uv.push(i/nx,j/nz);}
   for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=i*(nz+1)+j,b=a+nz+1;ind.push(a,b,a+1,b,b+1,a+1);}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ind);geo.computeVertexNormals();
   const m=new THREE.Mesh(geo,material('#cb5d35',{side:THREE.DoubleSide,roughness:.87}));m.name='orange_curved_roof_tiles';m.castShadow=true;g.add(m);
   // Tile ribs run down each pitch, following its curved profile.
   for(let i=0;i<=28;i++){const u=i/28*2-1;const pts=[];for(let j=0;j<=8;j++){const v=j/8;pts.push([u*w/2,height(u,v)+.028,side*v*d/2]);}line('tile_rib',pts,.026,'#ae4b2c',g);}
   for(const v of [.23,.48,.72,.93]){const pts=[];for(let i=0;i<=16;i++){const u=i/16*2-1;pts.push([u*w/2,height(u,v)+.025,side*v*d/2]);}line('tile_course',pts,.021,'#e47d4c',g);}
   const eave=[];for(let i=0;i<=24;i++){const u=i/24*2-1;eave.push([u*w/2,height(u,1)-.05,side*d/2]);}
   line('white_upturned_eave',eave,.11,'#eee6d4',g);line('dark_eave_fascia',eave.map(p=>[p[0],p[1]-.24,p[2]]),.15,'#775b43',g);
  }
  const ridge=[];for(let i=0;i<=24;i++){const u=i/24*2-1;ridge.push([u*w/2,pitch+.25+1.30*Math.pow(Math.abs(u),9),0]);}line('swallowtail_ridge',ridge,.16,'#e5ded0',g);
  for(const side of [-1,1])line('raised_swallowtail_tip',[[side*w*.44,pitch+.54,0],[side*w*.50,pitch+1.5,0],[side*w*.515,pitch+1.8,0]],.15,'#e9e4d8',g);
  // Exposed end frames and white bargeboards convey the photographed open gables.
  for(const sx of [-1,1]){
   const xx=sx*w*.475;
   for(const sz of [-1,1]){const pts=[];for(let j=0;j<=16;j++){const v=j/16;pts.push([xx,height(.95,v)+.12,sz*v*d/2]);}line('white_gable_bargeboard',pts,.13,'#eee9df',g);beam(g,'gable_diagonal',[xx,.45,sz*d*.36],[xx,pitch-.55,0],.18,'#e0ddd0');}
   beam(g,'gable_tie',[xx,.52,-d*.36],[xx,.52,d*.36],.22,'#dedbcb');
   for(const zz of [-d*.30,0,d*.30])box(g,'ventilated_roof_support',.22,1.8,.25,xx, -.68,zz,'#8e6b4a');
  }
  for(const xx of [-w*.32,0,w*.32])for(const zz of [-d*.38,d*.38]){box(g,'roof_timber_post',.28,1.9,.28,xx,-.70,zz,'#876345');box(g,'wood_bracket',1.35,.22,.38,xx,-.05,zz,'#a77c51');beam(g,'bracket_diagonal',[xx-.65,-.12,zz],[xx,-1.0,zz],.16,'#946b46');}
  return g;
 }
 box(parent,'campus_plaza',126,.25,134,0,-.7,-16,'#d8d5c8');
 // Main library podium: a long five-storey building, with a taller central block.
 const main=group(parent,'main_building_3_library_podium');
 box(main,'five_floor_library_body',40,19.7,48,0,9.8,-1,'#ebe9e1');
 for(const x of [-16,-10,10,16])box(main,'facade_vertical_piers',1.2,20.4,48.5,x,10.05,-1,'#f4f2ea');
 for(let n=0;n<5;n++){
  const y=2.1+n*3.8;
  for(const x of [-17,-14,-11,-8,-5,5,8,11,14,17]){box(main,'podium_front_window',1.6,2.35,.10,x,y,23.12,'#748f8d',{metalness:.2,roughness:.33});box(main,'front_window_sill',1.88,.12,.25,x,y-1.16,23.24,'#cfcdc4');}
  for(const x of [-20.1,20.1])for(let z=-20;z<=19;z+=4.2){box(main,'side_long_window',.10,2.1,1.8,x,y,z,'#809898');box(main,'window_vertical_mullion',.14,2.15,.09,x,y,z,'#c2c7bc');}
  box(main,'podium_floor_band',40.5,.18,48.4,0,y+1.55,-1,'#cfd0c8');
 }
 box(main,'granite_base',40.7,2.7,48.7,0,1.08,-1,'#b7baaf');
 // Two strong white piers flank the recessed glass centre of the twelve-storey block.
 const tower=group(parent,'twelve_floor_central_block');
 box(tower,'tower_core',21.5,43,19,0,21.4,-3,'#e5e4dc');
 for(const z of [10,-18])box(tower,'stepped_roof_white_support',21.5,37.6,12,0,18.7,z,'#eae8df');
 for(const x of [-8.8,-4.5,4.5,8.8])box(tower,'tall_white_pier',2.15,43.6,19.7,x,21.6,-3,'#f1eee5');
 for(let n=0;n<12;n++){
  const y=1.9+n*3.45;
  for(const x of [-8.8,8.8]){box(tower,'pier_small_window',.83,1.1,.09,x,y,7.01,'#6d8586');box(tower,'pier_small_window_back',.83,1.1,.09,x,y,-13.03,'#758c8a');}
  for(const x of [-6.5,0,6.5]){const w=x===0?6.0:1.95;box(tower,'recessed_glass_front',w,2.55,.10,x,y,6.63,'#758e86',{metalness:.3,roughness:.27});box(tower,'horizontal_glass_mullion',w,.12,.18,x,y+.36,6.78,'#d6d7c9');}
  box(tower,'central_floor_spandrel',7.1,.48,.20,0,y-1.18,6.80,'#d9dcd1');
 }
 // Front stepped block and side louvers prevent the blank-box appearance of the earlier model.
 for(const x of [-8.8,-4.5,4.5,8.8])box(tower,'stepped_front_white_pier',2.15,38.1,.38,x,18.95,16.08,'#f1eee5');
 for(let n=0;n<11;n++){
  const y=1.9+n*3.45;
  for(const x of [-8.8,8.8])box(tower,'stepped_pier_small_window',.83,1.1,.09,x,y,16.32,'#6d8586');
  for(const x of [-6.5,0,6.5]){const w=x===0?6:1.95;box(tower,'front_stepped_glass',w,2.55,.10,x,y,16.25,'#708e86');box(tower,'front_stepped_mullion',w,.12,.15,x,y+.36,16.35,'#d7d9cc');}
  box(tower,'stepped_front_spandrel',7.1,.48,.18,0,y-1.18,16.35,'#dfe2d5');
 }
 for(const x of [-8.8,-4.5,4.5,8.8])box(tower,'stepped_rear_white_pier',2.15,38.1,.38,x,18.95,-24.1,'#f1eee5');
 for(let n=0;n<11;n++){
  const y=1.9+n*3.45;
  for(const x of [-8.8,8.8])box(tower,'stepped_rear_pier_window',.83,1.1,.09,x,y,-24.32,'#728b86');
  for(const x of [-6.5,0,6.5]){const w=x===0?6:1.95;box(tower,'rear_stepped_glass',w,2.55,.10,x,y,-24.26,'#7c9990');box(tower,'rear_glass_mullion',w,.12,.15,x,y+.36,-24.37,'#d7d9cc');if(x!==0)box(tower,'rear_terracotta_spandrel',1.95,.66,.12,x,y-1.05,-24.40,'#ba563e');}
 }
 for(const x of [-10.86,10.86]){
  for(const z of [-21,-14,-7,0,7,14])box(tower,'side_white_vertical_pier',.28,37.9,1.08,x,18.88,z,'#f2efe7');
  for(let n=5;n<11;n++){const y=1.9+n*3.45;for(const z of [-18,-10,-2,6,13]){box(tower,'side_tall_window',.10,2.0,1.45,x,y,z,'#7a9290');for(let k=0;k<4;k++)box(tower,'side_window_louver',.16,.055,1.5,x,y-.7+k*.45,z,'#c6cebe');}}
 }
 for(let n=6;n<11;n++)for(let k=0;k<10;k++)box(tower,'visible_stair_silhouette',.52,.14,.14,-2.45+k*.54,1.1+n*3.45+k*.20,16.45,'#edf0e4');
 // Low, staggered roof pavilions and the elevated main roof with open support frames.
 roof('highest_open_double_eave_roof',25,23,6.4,45.1,0,-3);
 roof('secondary_roof_front',25,18,4.0,39.4,0,11);
 roof('secondary_roof_back',25,18,4.0,39.4,0,-18);
 roof('podium_roof_left_front',11.6,16,3.15,21.6,-14.6,13.4);
 roof('podium_roof_right_front',11.6,16,3.15,21.6,14.6,13.4);
 roof('podium_roof_left_back',11.6,17,3.15,21.6,-14.6,-16);
 roof('podium_roof_right_back',11.6,17,3.15,21.6,14.6,-16);
 // Elevated entrance and connected portico. Arc outlines are visible against stone piers.
 const portico=group(parent,'raised_portico_and_entrance');
 box(portico,'portico_gallery_floor',85,.30,6.5,0,4.15,27,'#dedbd0');box(portico,'portico_terrace',40,.35,7.5,0,4.35,23.9,'#d8d4c7');
 for(let x=-40;x<=40;x+=4){box(portico,'granite_colonnade_pier',.60,4.1,.70,x,1.95,28.5,'#c3c5b8');box(portico,'capital',1.05,.27,1.0,x,4.02,28.5,'#ddd9cb');}
 box(portico,'portico_upper_edge',85,.30,6.5,0,6.95,27,'#e3dfd0');
 for(let x=-40;x<40;x+=4){const pts=[];for(let n=0;n<=20;n++){const t=Math.PI-n/20*Math.PI;pts.push([x+2+1.68*Math.cos(t),4.82+1.48*Math.sin(t),30.29]);}line('granite_arch_outline',pts,.13,'#c9c9bc',portico);}
 box(portico,'east_campus_glass_entry',7.4,3.4,.15,0,5.4,23.35,'#648b86',{metalness:.4,roughness:.23});
 for(let i=0;i<24;i++)box(portico,'wide_entrance_step',12.4,.18,.56,0,-.15+i*.18,38.7-i*.55,'#bfc1b5');
 for(const x of [-6.4,6.4])line('entrance_handrail',[[x,.45,38.6],[x,4.95,25.9]],.055,'#71847c',portico);
 // Rear library wing: separate from the eastern administrative frontage.
 // The west facade follows the official library photos, not a mirrored front facade.
 const rearLibrary=group(parent,'main_3_rear_library');rearLibrary.position.z=-46;
 rearLibrary.userData={library:true,description:'Main 3 west/rear library wing; photo-guided massing and 2025 guide orientation; estimated dimensions'};
 // 一层柱廊留空，花形开口后面不再被整块建筑体遮住；高处仍保留馆舍体量。
 box(rearLibrary,'library_five_floor_body',40,17.2,44,0,12.8,0,'#e9e8df');
 box(rearLibrary,'library_granite_base',40.5,2.1,44.5,0,.9,0,'#b8b9af');
 for(const x of [-7.4,7.4])box(rearLibrary,'rear_inner_white_pier',6,17.5,.70,x,12.95,-23.6,'#eeeadd');
 for(const x of [-19.4,19.4])box(rearLibrary,'rear_outer_white_pier',2.7,21.8,.52,x,10.65,-22.10,'#eeeadd');
 for(const [x,w] of [[-13.5,9.2],[0,5.7],[13.5,9.2]]){
  box(rearLibrary,'rear_continuous_glass_bay',w,15.5,.13,x,11.8,-22.31,'#79958c');
  for(let k=0;k<24;k++)box(rearLibrary,'rear_broad_horizontal_louver',w+.25,.13,.58,x,5.7+k*.53,-22.63,'#c7cabe');
 }
 for(let f=0;f<5;f++){
  const y=1.5+f*4.15;
  box(rearLibrary,'rear_horizontal_floor_joint',40.4,.08,.08,0,y,-22.22,'#c7c8bd');
  for(const x of [-7.4,7.4])if(y>4)box(rearLibrary,'rear_pier_slit',2.7,.22,.10,x,y+1.1,-24.0,'#7d9790');
  for(const x of [-20.20,20.20])for(const z of [-16,-9,-2,5,12,19]){
   box(rearLibrary,'library_side_vertical_pier',.38,21.6,1.1,x,10.6,z,'#edece1');
   box(rearLibrary,'library_side_glass',.12,3.1,4.0,x,y+.6,z+2.5,'#7d9790');
   for(let k=0;k<6;k++)box(rearLibrary,'library_side_louver',.30,.10,4.1,x,y-.5+k*.48,z+2.5,'#c6cabf');
  }
 }
 box(rearLibrary,'west_library_portal',5.8,.38,3.4,0,4.52,-23.1,'#c9ccbf');
 box(rearLibrary,'west_library_glass_entry',5.5,3.15,.14,0,1.95,-22.56,'#759b92');
 for(const x of [-3,-1,1,3])box(rearLibrary,'west_entry_mullion',.07,3.0,.19,x,2,-22.69,'#d6d9cb');
 for(let i=0;i<5;i++)box(rearLibrary,'west_threshold_step',11.5,.16,.5,0,-.2+i*.16,-25.5+i*.48,'#c4c6b8');
 for(const x of [-16,0,16]){box(rearLibrary,'roof_pier_extension',3.5,2.7,3.0,x,22.45,-18.0,'#edece1');cylinder(rearLibrary,'roof_round_vent',.42,.08,x,23.15,-19.56,'#658079').rotation.x=Math.PI/2;}
 roof('library_west_open_pavilion',43,22,6.4,25.1,0,-12.1,rearLibrary);
 roof('library_east_low_pavilion',43,21,4.0,23.3,0,12.1,rearLibrary);
 for(const x of [-16,-8,0,8,16])box(rearLibrary,'rear_exposed_roof_post',.42,3.4,.42,x,23.55,-20.7,'#916c4a');
 for(const x of [-21.9,21.9])for(const z of [-18,-8,2,12])plant(rearLibrary,x,z,1.55);
 photo.exterior(rearLibrary);
 // Four five-storey companion blocks give the documented one-main/four-secondary context.
 for(const x of [-47,-31,31,47]){
  const block=group(parent,'five_floor_companion_context');
  block.userData={building:({'-47':'主一','-31':'主二','31':'主四','47':'主五'})[x],longitudinalExtent:[-68,23],estimated:true};
  box(block,'white_teaching_block',12.5,18.6,91,x,9.2,-22.5,'#e9e7dc');
  for(let n=0;n<5;n++){
   for(const dx of [-4.2,-1.4,1.4,4.2])for(const zz of [23.06,-68.06])box(block,'companion_end_window',1.25,2.2,.09,x+dx,1.8+n*3.5,zz,'#8b9d96');
   for(let zz=-64;zz<23;zz+=5.3)for(const side of [-1,1]){box(block,'companion_side_window',.09,2.2,2.1,x+side*6.29,1.8+n*3.5,zz,'#8b9d96');box(block,'companion_side_pier',.2,18.6,.48,x+side*6.32,9.2,zz+2.5,'#efece2');}
  }
  for(const [i,zz] of [14,-8,-31,-59].entries())roof('companion_longitudinal_pavilion_'+i,14,23.5,3.4,20.5,x,zz,block);
 }
 // Landscape is deliberately subordinate to the architectural profile.
 for(const x of [-55,-24,24,55])for(const z of [28,41])plant(parent,x,z,2.1);
 const detailCount=parent.children.length;
 const main3Parts=parent.children.filter(g=>g===main||g===tower||g===portico||g===rearLibrary||roofGroups.slice(0,7).includes(g));
 for(const part of main3Parts)part.userData.main3=true;
 return {roofGroups,detailCount,rearLibrary,main3Parts};
}

export {FLOOR_INFO,buildLibraryFloors} from './library-layout.js';
