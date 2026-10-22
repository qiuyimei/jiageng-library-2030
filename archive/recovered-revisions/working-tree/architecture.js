import * as THREE from 'three';

// Photo-guided geometry. Dimensions and internal locations are schematic.
export function buildExterior(parent, H) {
 const {group,box,cylinder,material,plant}=H;
 parent.userData={description:'Photo-guided Zhangzhou campus Main Building 3, schematic dimensions; floors 6-12 are administrative context, not added library area',reference:'https://arch.xmu.edu.cn/info/1013/13073.htm'};
 const roofGroups=[];
 function line(name,pts,r,col,root=parent){const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(10,Math.min(24,pts.length*2)),r,6,false),material(col));m.name=name;m.castShadow=true;root.add(m);return m;}
 function beam(root,name,a,b,w,col){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b);const m=new THREE.Mesh(new THREE.BoxGeometry(w,p.distanceTo(q),w),material(col));m.position.copy(p).add(q).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),q.clone().sub(p).normalize());m.name=name;m.castShadow=true;root.add(m);return m;}
 function roof(name,w,d,pitch,base,x,z){
  const g=group(parent,name);g.position.set(x,base,z);roofGroups.push(g);
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
 box(parent,'library_plaza',126,.25,88,0,-.7,5,'#d8d5c8');
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
 box(portico,'library_glass_entry',7.4,3.4,.15,0,5.4,23.35,'#648b86',{metalness:.4,roughness:.23});
 for(let i=0;i<24;i++)box(portico,'wide_entrance_step',12.4,.18,.56,0,-.15+i*.18,38.7-i*.55,'#bfc1b5');
 for(const x of [-6.4,6.4])line('entrance_handrail',[[x,.45,38.6],[x,4.95,25.9]],.055,'#71847c',portico);
 // Four five-storey companion blocks give the documented one-main/four-secondary context.
 for(const x of [-47,-31,31,47]){
  const block=group(parent,'five_floor_companion_context');
  box(block,'white_teaching_block',12.5,18.6,35,x,9.2,-1,'#e9e7dc');
  for(let n=0;n<5;n++)for(const dx of [-4.2,-1.4,1.4,4.2])box(block,'companion_window',1.25,2.2,.09,x+dx,1.8+n*3.5,16.58,'#8b9d96');
  roof('companion_east_sea_breeze_pavilion',14,15,3.4,20.5,x,10.8);roof('companion_rear_pavilion',14,16,3.4,20.5,x,-12.0);
 }
 // Landscape is deliberately subordinate to the architectural profile.
 for(const x of [-55,-24,24,55])for(const z of [28,41])plant(parent,x,z,2.1);
 const detailCount=parent.children.length;
 return {roofGroups,detailCount};
}

export const FLOOR_INFO = [
 {n:1,title:'借阅与公共服务',summary:'借阅总台、密集书库、自助文印及咖啡休憩；入口与垂直交通在剖切中可见。',tags:['借阅服务','密集书库','自助文印','休憩座位'],color:'#9ab8c1'},
 {n:2,title:'社科书库与阅读',summary:'以A-F类社科馆藏及图书漂流为公开资料中的功能线索，示意书架、阅读桌与中庭回廊。',tags:['A-F类馆藏','图书漂流','开放阅读','中庭回廊'],color:'#bbac85'},
 {n:3,title:'人文阅读与交流',summary:'以G/H/I/K类馆藏、展览和研讨功能为线索。绿色框表示本方案建议的柔性学习试点，位置属于设计设想。',tags:['人文馆藏','展览交流','预约研讨','柔性试点设想'],color:'#82ac98'},
 {n:4,title:'艺术与科技阅读',summary:'以艺术、自然科学与工程技术馆藏、新书和易书功能为线索，示意书库和专注阅读座位。',tags:['艺术与科技','新书展示','易书交流','专注阅读'],color:'#9fa6bd'},
 {n:5,title:'报刊与备考学习',summary:'以报刊、外文原版书与备考联盟为线索，示意独立阅读桌、外文书架和安静自习。',tags:['报刊阅读','外文原版书','备考学习','安静自习'],color:'#b9a190'}
];

export function buildLibraryFloors(parent, H) {
 const {group,box,cylinder,material,plant,chair,table}=H;
 const storeys=[],height=4.8;
 const palette=['#719187','#bba26c','#8b9eac','#bd816f','#978da3'];
 function rack(root,x,z,rot=0,w=3.0,h=2.4){
  const g=group(root,'schematic_book_rack');g.position.set(x,0,z);g.rotation.y=rot;
  box(g,'rack_back',w,h,.09,0,h/2,-.30,'#bea77e');for(const xx of [-w/2,w/2])box(g,'rack_side',.09,h,.72,xx,h/2,0,'#c5b58e');
  const perColor=Array.from({length:5},()=>[]);
  for(let row=0;row<4;row++){const yy=.18+row*.56;box(g,'rack_shelf',w,.07,.72,0,yy,0,'#bea77e');for(let k=0;k<15;k++){
   const bh=.29+(k%4)*.025,bx=-w/2+.16+k*(w-.3)/15;const geo=new THREE.BoxGeometry(.10,bh,.39);geo.translate(bx,yy+bh/2+.055,.055);perColor[(k+row)%5].push(geo);
  }}
  for(let col=0;col<5;col++){const positions=[],normals=[];for(const geo of perColor[col]){const raw=geo.toNonIndexed();positions.push(...raw.attributes.position.array);normals.push(...raw.attributes.normal.array);geo.dispose();raw.dispose();}const merged=new THREE.BufferGeometry();merged.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));merged.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));const m=new THREE.Mesh(merged,material(palette[col]));m.name='books_palette_'+col;g.add(m);}
  return g;
 }
 function readers(root,x,z,n=4,col='#829c90'){table(root,x,z,n===4?2.5:4.3,1.4);for(const dx of n===4?[-.62,.62]:[-1.4,0,1.4]){chair(root,x+dx,z-.99,0,col);chair(root,x+dx,z+.99,Math.PI,col);}}
 function carrels(root,x,z,count=4){for(let n=0;n<count;n++){const xx=x+n*1.55;table(root,xx,z,1.35,.82);chair(root,xx,z+1.0,Math.PI,'#a1aba2');box(root,'quiet_desk_divider',.05,.57,.85,xx-.65,1.13,z,'#d9dacc');box(root,'quiet_desk_back',1.3,.57,.05,xx,1.13,z-.42,'#d9dacc');}}
 function room(root,x,z,w,d,col){const g=group(root,'schematic_reserved_room');box(g,'room_tint',w,.025,d,x,.19,z,col);for(const [xx,zz,ww,dd] of [[x-w/2,z,.06,d],[x+w/2,z,.06,d],[x,z-d/2,w,.06]])box(g,'cutaway_room_glass',ww,2.25,dd,xx,1.35,zz,'#b9cbc7',{transparent:true,opacity:.17});readers(g,x,z,6);box(g,'meeting_screen',2.2,1.05,.06,x,1.8,z-d/2+.1,'#435f59');return g;}
 function landing(root,z){const shape=new THREE.Shape();shape.moveTo(-3.5,0);shape.absarc(0,0,3.5,Math.PI,0,true);shape.lineTo(-3.5,0);const geo=new THREE.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:false,curveSegments:26});geo.rotateX(Math.PI/2);const mesh=new THREE.Mesh(geo,material('#d8d4c6'));mesh.position.set(0,.16,z);mesh.name='curved_central_landing';mesh.receiveShadow=true;root.add(mesh);}
 for(const info of FLOOR_INFO){
  const f=group(parent,'library_floor_'+info.n);f.position.y=(info.n-1)*height;f.userData.floor=info.n;f.userData.title=info.title;f.userData.referenceDate='2018 published functional guide, schematic locations';
  const structural=group(f,'open_frame_and_gallery'),furniture=group(f,'furniture_and_function_schematic');
  // Open-front ring galleries, with no opaque facade or ceiling above the selected floor.
  for(const [name,w,d,x,z] of [['left',12,48,-12,0],['right',12,48,12,0],['front',12,6,0,21],['back',12,6,0,-21]])box(structural,'ring_slab_'+name,w,.25,d,x,0,z,'#e8e3d5');
  if(info.n===1)box(structural,'atrium_ground',11.9,.20,36,0,-.03,0,'#e4dfd0');
  for(const x of [-18,-6,6,18])for(const z of [-22,-13,-4,5,14,22]){
   box(structural,'exposed_column',.40,height-.3,.40,x,height/2-.1,z,'#e4decd');
  }
  for(const x of [-18,-6,6,18])box(structural,'longitudinal_beam',.45,.34,48,x,height-.24,0,'#e5dfcc');
  for(const z of [-22,-13,-4,5,14,22]){box(structural,'side_gallery_beam',12,.32,.42,-12,height-.24,z,'#e5dfcc');box(structural,'side_gallery_beam',12,.32,.42,12,height-.24,z,'#e5dfcc');}
  // Dark metal rails and continuous planters reflect the photographic atrium details.
  if(info.n>1){for(const x of [-5.9,5.9]){for(const yy of [.73,1.28])box(structural,'gallery_dark_rail',.045,.045,36,x,yy,0,'#536e67');for(let z=-18;z<=18;z+=2.2)box(structural,'gallery_rail_post',.045,1.15,.045,x,.78,z,'#6b8176');}
   for(const z of [-18,18])box(structural,'end_gallery_rail',12,.06,.06,0,1.28,z,'#5d756b');}
  for(const x of [-6.25,6.25])for(const z of [-14,-6,2,10]){box(structural,'gallery_planter',.65,.48,2.5,x,.52,z,'#ba7350');box(structural,'planter_greenery',.58,.45,2.3,x,.98,z,'#759374');}
  const centralZ=17-(info.n-1)*8.4;landing(structural,centralZ);
  if(info.n<5){
   const run=8.4,steps=26;
   for(const x of [-4.55,4.55]){
    for(let s=0;s<steps;s++)box(structural,'central_side_stair_step',1.9,(s+1)*height/steps,run/steps+.03,x,(s+1)*height/steps/2,centralZ-(s+.5)*run/steps,'#c4c5b9');
    const a=new THREE.Vector3(x,1.16,centralZ+.2),b=new THREE.Vector3(x,height+1.16,centralZ-run);
    for(const dx of [-1.0,1.0]){const geo=new THREE.CylinderGeometry(.035,.035,a.distanceTo(b),6);const m=new THREE.Mesh(geo,material('#5d7970'));m.position.copy(a).add(b).multiplyScalar(.5);m.position.x+=dx;m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());m.name='stair_handrail';structural.add(m);}
   }
  }
  const zoneTint=info.color;
  for(const x of [-12,12])box(furniture,'function_floor_tint',10.8,.025,38,x,.15,-.2,zoneTint,{transparent:true,opacity:.18});
  // Floor-specific furniture avoids five copies of the same generic room.
  if(info.n===1){
   for(const x of [-15,-11,-7.5])for(const z of [-14,-8,-2,4])rack(furniture,x,z,Math.PI/2,3.8,2.6);
   box(furniture,'borrow_service_counter',8.5,1.03,1.9,10,.66,13,'#b4bbab');box(furniture,'service_counter_top',8.8,.12,2.1,10,1.23,13,'#cbb693');
   for(const x of [7.5,10,12.5]){box(furniture,'service_terminal',.8,.4,.12,x,1.55,12.8,'#3b5b52');box(furniture,'self_print_unit',1.0,1.1,.9,x,.73,6,'#d2d7d1');}
   for(const x of [9,14])for(const z of [-12,-5]){cylinder(furniture,'cafe_round_table',.85,.12,x,.88,z,'#c6b58f');cylinder(furniture,'cafe_table_support',.12,.78,x,.43,z,'#88978c');chair(furniture,x-.95,z,Math.PI/2);chair(furniture,x+.95,z,-Math.PI/2);}
   for(const z of [-6,2,10])box(furniture,'low_exhibition_plinth',3.1,.45,1.5,0,.46,z,'#d1d5c5');
  }else if(info.n===2){
   for(const x of [-14,-9,9,14])for(const z of [-15,-8,-1])rack(furniture,x,z,0,3.2);
   for(const x of [-12,12])for(const z of [7,14])readers(furniture,x,z,6);
   rack(furniture,0,21,0,5.0,1.5);
  }else if(info.n===3){
   for(const x of [-14,-9])for(const z of [-14,-7,0])rack(furniture,x,z,0,3.0);
   for(const z of [-15,-10])rack(furniture,12,z,0,7.6);
   readers(furniture,-12,8,6);readers(furniture,-12,15,6);
   room(furniture,12,15,9.5,7.5,'#cfdae0');room(furniture,-12,-20,9.5,5.5,'#d9dfe0');
   for(const x of [-3.7,0,3.7]){box(furniture,'exhibition_panel',1.7,1.8,.14,x,1.16,21,'#b3c5bb');box(furniture,'exhibition_art',1.5,1.2,.03,x,1.20,21.09,'#a8997c');}
   // This patch is explicitly an added project proposal, not a claimed existing allocation.
   const pilot=group(furniture,'proposed_flexible_learning_pilot');pilot.userData.pilot=true;
   box(pilot,'proposed_pilot_tint',10.2,.045,13.2,12,.20,2.7,'#9cc4a8');
   for(const [xx,zz] of [[7.0,2.7],[17.0,2.7]])box(pilot,'proposal_outline_side',.06,.08,13.2,xx,.28,zz,'#397e65');
   for(const zz of [-3.9,9.3])box(pilot,'proposal_outline_end',10,.08,.06,12,.28,zz,'#397e65');
   for(const z of [-1,5.5])readers(pilot,12,z,4,'#749b84');
  }else if(info.n===4){
   for(const x of [-14,-9,9,14])for(const z of [-15,-8,-1])rack(furniture,x,z,0,3.0);
   for(const x of [-15,-10,7,12])carrels(furniture,x,12,2);
   rack(furniture,-12,20.7,0,7,1.5);rack(furniture,12,20.7,0,7,1.5);
  }else{
   for(const z of [-14,-7,0])rack(furniture,-12,z,0,7.5);
   for(const z of [-13,-7,-1,5,11,17])carrels(furniture,7.5,z,6);
   readers(furniture,-12,9,6);readers(furniture,-12,16,6);
   for(const x of [-3.5,0,3.5]){const stand=group(furniture,'periodical_display');box(stand,'periodical_body',2.4,1.3,.7,x,.83,21,'#b8af95');for(let n=0;n<4;n++){const m=box(stand,'magazine_cover',.38,.57,.045,x- .8+n*.52,1.42,21.12,palette[n]);m.rotation.x=-.3;}}
  }
  for(const x of [-16.6,16.6])plant(furniture,x,20,1.0);
  storeys.push({info,root:f,structural,furniture});
 }
 // Roof is optional; the initial cutaway remains open for direct interior viewing.
 const skylight=group(parent,'optional_atrium_skylight');skylight.visible=false;skylight.position.y=height*5-.05;
 for(let i=0;i<9;i++){const z=-18+i*4.5;const pts=[];for(let n=0;n<=20;n++){const x=-6+n*.6;pts.push(new THREE.Vector3(x,1.35*(1-(x/6)**2),z));}const curve=new THREE.CatmullRomCurve3(pts);const m=new THREE.Mesh(new THREE.TubeGeometry(curve,28,.11,6,false),material('#cfd7c8'));m.name='arched_skylight_frame';skylight.add(m);}
 box(skylight,'skylight_translucent_plane',12,.05,37,0,.35,0,'#c7d7cf',{transparent:true,opacity:.19});
 parent.userData={description:'Five-storey atrium cutaway; historical public floor functions, schematic geometry and locations; no claim of surveyed structural accuracy'};
 return {storeys,height,skylight};
}
