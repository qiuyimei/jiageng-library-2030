import * as THREE from 'three';
import {STAIR_LAYOUT,EXHIBITION_LAYOUT,GROUND_LAYOUT,ELEVATOR_LAYOUT,TRANSPORT_CORE,floorBounds,upperFacilities} from './spatial.js';

// 2026-10-14收到的70张现场照片用于确定外形与材质；以下坐标仍是模型比例。
// 装饰对象不产生座位编号，不参与预约、占用识别或路线图的可用性判断。
export function createPhotoDetails(H){
 const {group,box,cylinder,material,plant,table,chair}=H;
 const sphereGeometries=new Map(),ringGeometries=new Map();
 function tube(parent,name,points,r,color){
  const geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(8,points.length*5),r,6,false);
  const mesh=new THREE.Mesh(geometry,material(color));mesh.name=name;parent.add(mesh);return mesh;
 }
 function sphere(parent,name,r,x,y,z,color,scale=[1,1,1]){
  if(!sphereGeometries.has(r)){const geo=new THREE.SphereGeometry(r,10,7);geo.userData.sharedGeometry=true;sphereGeometries.set(r,geo);}
  const mesh=new THREE.Mesh(sphereGeometries.get(r),material(color));mesh.position.set(x,y,z);mesh.scale.set(...scale);mesh.name=name;parent.add(mesh);return mesh;
 }
 function ring(parent,name,r,t,x,y,z,color,rotation=[0,0,0]){
  const key=`${r}:${t}`;if(!ringGeometries.has(key)){const geo=new THREE.TorusGeometry(r,t,6,28);geo.userData.sharedGeometry=true;ringGeometries.set(key,geo);}
  const mesh=new THREE.Mesh(ringGeometries.get(key),material(color,{metalness:.35,roughness:.5}));mesh.position.set(x,y,z);mesh.rotation.set(...rotation);mesh.name=name;parent.add(mesh);return mesh;
 }
 function lathe(parent,name,profile,x,y,z,color){
  const mesh=new THREE.Mesh(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),18),material(color,{roughness:.5}));mesh.position.set(x,y,z);mesh.name=name;parent.add(mesh);return mesh;
 }
 function sign(parent,text,w,h,x,y,z,color='#f0ebe0',ink='#253f4c',rotation=0){
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material(color,{side:THREE.DoubleSide}));
  // 离线几何导出保留牌面；在浏览器中再生成文字纹理，不加载网络图片。
  if(typeof document!=='undefined'){
   const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');
   ctx.fillStyle=color;ctx.fillRect(0,0,1024,256);ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 82px Microsoft YaHei';ctx.fillText(text,512,128,970);
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;mesh.material=new THREE.MeshStandardMaterial({map:texture,roughness:.7,side:THREE.DoubleSide});
  }
  mesh.name='photo_sign_'+text;mesh.position.set(x,y,z);mesh.rotation.y=rotation;parent.add(mesh);return mesh;
 }
 function flutedColumn(parent,x,z,height=4.3){
  const g=group(parent,'photo_granite_fluted_column');g.position.set(x,0,z);
  cylinder(g,'column_base',.56,.15,0,.075,0,'#b8b9b2');cylinder(g,'fluted_column_core',.40,height-.40,0,height/2,0,'#c6c8c2');
  for(let i=0;i<16;i++){const a=i*Math.PI/8;const flute=cylinder(g,'column_flute',.029,height-.65,Math.cos(a)*.405,height/2,Math.sin(a)*.405,'#aeb3ae');flute.userData.decoration=true;}
  cylinder(g,'column_neck',.44,.12,0,height-.18,0,'#d0d1c7');cylinder(g,'column_capital',.56,.16,0,height-.045,0,'#d8d8ce');return g;
 }
 function squareColumn(parent,x,z,height=4.35){
  const g=group(parent,'photo_atrium_granite_pilaster');g.position.set(x,0,z);
  box(g,'stone_pilaster',.69,height,.65,0,height/2,0,'#c4c7c3');
  for(const x of [-.25,-.15,-.05,.05,.15,.25])box(g,'stone_vertical_flute',.024,height-.5,.026,x,height/2,-.34,'#a9aeab');
  box(g,'ionic_capital_band',1.10,.23,.86,0,height-.16,0,'#c6c8c2');
  for(const x of [-.45,.45]){const volute=cylinder(g,'rolled_stone_capital',.18,.80,x,height-.26,0,'#c3c6c1');volute.rotation.x=Math.PI/2;}
  return g;
 }
 function foliage(parent,x,y,z,length=1.4){
  const g=group(parent,'photo_trailing_vines');g.position.set(x,y,z);
  for(let k=0;k<4;k++){
   const xx=(k-1.5)*.19,len=length*(.68+(k%3)*.16);
   tube(g,'vine_stem',[[xx,0,0],[xx+.04,-len*.45,.04],[xx-.06,-len,.02]],.011,'#617451');
   for(let j=1;j<=5;j++)sphere(g,'vine_leaf',.065,xx+(j%2?.075:-.075),-len*j/5,.045,['#52724d','#6d8c58'][j%2],[1.2,.5,.75]);
  }
  return g;
 }
 function bonsai(parent,x,z){
  const g=group(parent,'photo_large_banyan_bonsai');g.position.set(x,0,z);
  lathe(g,'dark_stone_bonsai_pot',[[.76,0],[1,.12],[1.14,.75],[1.17,.87],[1.03,.9]],0,0,0,'#595e50');
  ring(g,'bonsai_pot_rim',1.15,.06,0,.86,0,'#8f927a',[Math.PI/2,0,0]);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;tube(g,'exposed_banyan_root',[[Math.cos(a)*.70,.90,Math.sin(a)*.70],[Math.cos(a)*.32,1.50,Math.sin(a)*.32],[.02,2.55,0]],.08,'#81745d');}
  tube(g,'banyan_trunk',[[0,1,0],[.18,2.2,.06],[0,3.3,0]],.13,'#73684f');
  for(const [bx,by,bz,r] of [[-.65,2.4,0,.65],[.58,3,.12,.70],[-.33,3.55,-.05,.61],[.35,4.1,0,.52]]){
   tube(g,'banyan_branch',[[0,by-.4,0],[bx*.6,by-.15,bz],[bx,by,bz]],.065,'#776a4e');sphere(g,'trimmed_bonsai_crown',r,bx,by,bz,'#497149',[1.15,.68,.9]);
  }
  return g;
 }
 function cloverPanel(parent,x,z){
  const g=group(parent,'photo_plum_shaped_window');g.position.set(x,0,z);
  // 花形是通透开口：石材边框和红砖面都避开孔洞，不用蓝玻璃贴片封住它。
  for(const xx of [-1.55,1.55])box(g,'granite_window_side_jamb',.40,3.8,.24,xx,2.1,0,'#bbbdb5');
  box(g,'granite_window_top_lintel',3.5,.24,.24,0,4.05,0,'#bbbdb5');
  box(g,'granite_window_lower_wall',2.65,2.1,.24,0,1.15,0,'#bbbdb5');
  const outline=new THREE.Shape(),inner=new THREE.Path();
  // 四瓣曲线由半径函数生成；这里复现照片的窗形，不宣称每条石材曲线已测量。
  for(let i=0;i<=72;i++){const a=i/72*Math.PI*2,r=.63+.13*Math.cos(4*a),p=[r*Math.cos(a),r*Math.sin(a)];i?outline.lineTo(...p):outline.moveTo(...p);}
  for(let i=72;i>=0;i--){const a=i/72*Math.PI*2,r=.50+.115*Math.cos(4*a),p=[r*Math.cos(a),r*Math.sin(a)];i===72?inner.moveTo(...p):inner.lineTo(...p);}
  outline.closePath();inner.closePath();outline.holes.push(inner);
  const brickShape=new THREE.Shape();brickShape.moveTo(-1.325,2.125);brickShape.lineTo(1.325,2.125);brickShape.lineTo(1.325,3.975);brickShape.lineTo(-1.325,3.975);brickShape.closePath();
  const brickHole=new THREE.Path();for(let i=72;i>=0;i--){const a=i/72*Math.PI*2,r=.50+.115*Math.cos(4*a),p=[r*Math.cos(a),3.12+r*Math.sin(a)];i===72?brickHole.moveTo(...p):brickHole.lineTo(...p);}brickHole.closePath();brickShape.holes.push(brickHole);
  const brick=new THREE.Mesh(new THREE.ExtrudeGeometry(brickShape,{depth:.09,bevelEnabled:false}),material('#9d5749',{side:THREE.DoubleSide}));brick.name='red_brick_panel_with_open_plum_hole';brick.position.z=-.19;g.add(brick);
  const frame=new THREE.Mesh(new THREE.ExtrudeGeometry(outline,{depth:.09,bevelEnabled:false}),material('#d3d1c2'));frame.name='plum_window_stone_frame';frame.position.set(0,3.12,-.24);g.add(frame);
  for(const xx of [-1.15,0,1.15]){box(g,'drinking_point_stone_divider',.13,1.65,.75,xx,.82,-.45,'#b9c0b5');}
  box(g,'drinking_point_sill',2.4,.13,.8,0,.84,-.43,'#aeb5ad');
  for(const xx of [-.58,.58]){cylinder(g,'small_drinking_tap',.035,.21,xx,1.05,-.46,'#858f90');box(g,'drinking_basin',.7,.09,.45,xx,.93,-.45,'#a4b0ab');}
  return g;
 }
 function bicycle(parent,x,z,rot,color){
  const g=group(parent,'photo_parked_bicycle');g.position.set(x,0,z);g.rotation.y=rot;
  for(const xx of [-.63,.63]){
   ring(g,'bicycle_tire',.36,.034,xx,.39,0,'#303d3b');ring(g,'bicycle_rim',.32,.012,xx,.39,0,'#aeb8b2');
   for(let i=0;i<8;i++){const a=i*Math.PI/4;tube(g,'bicycle_spoke',[[xx,.39,0],[xx+.32*Math.cos(a),.39+.32*Math.sin(a),0]],.005,'#b6bcb3');}
  }
  for(const pair of [[[0,.45,0],[-.43,1.0,0]],[[-.43,1,0],[.45,1.05,0]],[[.45,1.05,0],[0,.45,0]],[[0,.45,0],[-.63,.39,0]],[[-.63,.39,0],[-.43,1,0]],[[.45,1.05,0],[.63,.39,0]]])tube(g,'bicycle_frame',pair,.025,color);
  box(g,'bicycle_saddle',.28,.06,.19,-.42,1.10,0,'#39413d');tube(g,'bicycle_handle',[[.45,1.05,0],[.39,1.3,0],[.39,1.3,-.20]],.024,'#777f7a');
  box(g,'bicycle_basket',.35,.20,.25,.59,1.08,0,'#aeb7aa');return g;
 }
 function starLight(parent,x,z){
  cylinder(parent,'photo_plaza_lamp_post',.055,6.2,x,3.1,z,'#8c9790');
  for(let i=0;i<4;i++){const a=i*Math.PI/2;tube(parent,'plaza_lamp_arm',[[x,5.7,z],[x+Math.cos(a)*.5,6.15,z+Math.sin(a)*.5],[x+Math.cos(a)*1.0,6.3,z+Math.sin(a)*1.0]],.033,'#8c9790');const head=box(parent,'plaza_lamp_head',.55,.08,.17,x+Math.cos(a)*1.03,6.3,z+Math.sin(a)*1.03,'#c4ccc1');head.rotation.y=-a;}
 }
 function exterior(root){
  const g=group(root,'photo_exterior_details');g.userData={photoReference:[1,2,3,4,5,6,10,62,63,64,65,66,67,68,69,70,71],placement:'示意，未测绘'};
  // 照片中的两组柱廊位于宽格栅下方；入口中央保持可通行。
  for(const side of [-1,1]){
   const columns=group(g,'photo_three_column_bay');columns.userData={side,role:'outer_column_group'};
   for(const distance of [10.7,13.5,16.3])flutedColumn(columns,side*distance,-23.4,4.7);
   const panel=cloverPanel(g,side*7.4,-25.1);panel.userData={side,role:'inner_flower_opening',photoReference:71};
   bonsai(g,side*7.4,-27.0);
   // 花窗下两旁还有较矮的柱子；不能把它们混入外侧三根通高圆柱。
   for(const dx of [-1.8,1.8])flutedColumn(g,side*7.4+dx,-25.1,1.85);
  }
  for(const x of [-7.4,7.4]){
   // 门廊照片可见方格吊顶；此处只表现局部，不封住剖切空间。
   for(let dx=-1.6;dx<=1.6;dx+=.22)box(g,'portico_ceiling_lattice_long',.025,.06,3.6,x+dx,4.2,-24.4,'#c3c4b5');
   for(let z=-26.1;z<=-22.7;z+=.22)box(g,'portico_ceiling_lattice_cross',3.3,.06,.025,x,4.2,z,'#c3c4b5');
  }
  for(let i=0;i<8;i++)box(g,'wide_stone_library_step',40,.14,.66,0,-.14+i*.14,-28.0+i*.64,'#c5c6bc');
  for(const x of [-17,0,17])for(let y=.5;y<3.7;y+=.42)box(g,'stone_base_horizontal_joint',3.55,.018,.02,x,y,-22.36,'#919c96');
  for(const x of [-18.5,18.5]){box(g,'facade_light_fixture',.23,.055,.19,x,3.85,-22.8,'#717e79');sphere(g,'schematic_camera_housing',.12,x,3.68,-23.03,'#bbc3bb');sphere(g,'schematic_camera_dark_cap',.087,x,3.64,-23.08,'#455550');}
  sign(g,'图书馆 · LIBRARY',7.5,.70,0,4.45,-22.74,'#d6d8ce','#35564d',Math.PI);
  return g;
 }
 function landscape(root){
  const g=group(root,'photo_plaza_details');
  // 格状石材广场、停放自行车与枝状路灯只用于场所辨认，不生成导航节点。
  for(const x of [-48,-32,-16,0,16,32,48])box(g,'plaza_stone_joint_x',.04,.018,14,x,-.445,-32,'#87978f');
  for(let z=-37;z<=-26;z+=2.0)box(g,'plaza_stone_joint_z',104,.018,.035,0,-.445,z,'#87978f');
  for(const side of [-1,1])for(let n=0;n<8;n++)bicycle(g,side*(24+n*1.25),-30-(n%2)*1.1,side*.18,['#536c69','#a43f35','#9b9a78','#afb9ae'][n%4]);
  for(const x of [-35,35])starLight(g,x,-37);return g;
 }
 function interiorFrame(parent,x,z,n){
  if(Math.abs(x)<10&&n<=3)return squareColumn(parent,x,z);
  return box(parent,'white_atrium_column',.55,4.35,.55,x,2.20,z,'#e7e7df');
 }
 function pottedFlower(parent,x,z){
  const g=group(parent,'photo_exhibition_potted_plant');g.position.set(x,.17,z);
  cylinder(g,'gold_green_flower_pot',.22,.42,0,.21,0,'#adac57',.29);
  ring(g,'cream_flower_pot_rim',.29,.035,0,.44,0,'#dedcc2',[Math.PI/2,0,0]);
  // 花盆中伸出的叶片和花朵向上生长；这组不生成垂挂藤蔓。
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7,h=.6+(i%3)*.15;
   tube(g,'potted_flower_stem',[[0,.4,0],[Math.cos(a)*.13,h*.8,Math.sin(a)*.13],[Math.cos(a)*.27,h,Math.sin(a)*.27]],.015,'#557957');
   const leaf=sphere(g,'potted_broad_leaf',.18,Math.cos(a)*.26,h,Math.sin(a)*.26,'#49744c',[.6,1.3,.22]);leaf.rotation.set(.45,a,.5);
   if(i%2===0)sphere(g,'red_anthurium_flower',.105,Math.cos(a)*.18,h+.19,Math.sin(a)*.18,'#b85052',[1.1,.5,.65]);
  }return g;
 }
 function railDetails(parent,x,back,front){
  for(let level=0;level<5;level++)box(parent,'black_horizontal_atrium_rail',.055,.025,front-back,x,.36+level*.16,(back+front)/2,'#303b39');
  for(let z=back+.6;z<front;z+=2.0){box(parent,'black_atrium_rail_post',.055,1.1,.055,x,.60,z,'#2f3937');}
  for(let z=back+1.2;z<front-.5;z+=4.5){
   // 照片中红色实心栏板在黑栏杆后方，下沿再接盆槽和藤蔓。
   box(parent,'photo_red_gallery_infill',.10,.55,2.35,x, .82,z,'#9c4f3b');
   box(parent,'ledge_plant_container',.35,.23,2.1,x,.25,z,'#8a9e77');for(const dz of [-.7,0,.7])foliage(parent,x,.32,z+dz,1.35);
  }
 }
 function circulation(parent,floor,height){
  const config=STAIR_LAYOUT[floor];if(!config)return;
  const {start,end,kind}=config,run=start-end;
  const g=group(parent,kind==='lower'?'photo_lower_terraces_and_stairs':'photo_upper_gallery_stairs');
  g.userData={floor,connects:[floor,floor+1],kind,photoReference:kind==='lower'?72:32};
  // 下部才有宽弧形展陈退台。三楼以上不再复制退台或自动扶梯。
  if(config.terraces)for(let tier=1;tier<=6;tier++){
   const radius=3.6,depth=(7-tier)*run/6;
   const shape=new THREE.Shape();shape.moveTo(-radius,0);shape.lineTo(radius,0);shape.lineTo(radius,-depth+.7);shape.quadraticCurveTo(0,-depth-1.1,-radius,-depth+.7);shape.lineTo(-radius,0);shape.closePath();
   const geo=new THREE.ExtrudeGeometry(shape,{depth:tier*height/6,bevelEnabled:false});geo.rotateX(-Math.PI/2);
   const mesh=new THREE.Mesh(geo,material('#b4b8b4',{roughness:.52}));mesh.name='curved_stone_display_terrace';mesh.position.set(0,.05,end);g.add(mesh);
   if(tier%2===0){
    const z=end+depth-.1,y=tier*height/6;
    for(const x of [-1.3,1.3]){box(g,'terrace_glass_display_case',.5,.38,.42,x,y+.25,z,'#b7d0c4',{transparent:true,opacity:.28});cylinder(g,'schematic_ceramic_exhibit',.07,.20,x,y+.17,z,'#c1c8b3');}
   }
  }
  function inclinedMember(name,x,y0,y1,width,thickness,color){
   const a=new THREE.Vector3(x,y0,start),b=new THREE.Vector3(x,y1,end),direction=b.clone().sub(a);
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,thickness,direction.length()),material(color));mesh.name=name;mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction.normalize());g.add(mesh);return mesh;
  }
  for(const side of [-1,1]){
   const x=side*4.65,w=1.45;
   for(let step=0;step<26;step++){
    const y=(step+1)*height/26,z=start-(step+.5)*run/26;
    // 上部踏板由倾斜梯板承托；下部踏步依托石材基础。
    box(g,kind==='lower'?'lower_black_stair_tread':'upper_black_stair_tread',w,kind==='lower'?y:.14,run/26+.015,x,kind==='lower'?y/2:y-.07,z,kind==='lower'?'#596166':'#333c3a');
    box(g,'light_stair_nosing',w+.02,.028,.045,x,y+.01,z+run/52,'#d3d5cb');
   }
   if(kind==='upper')inclinedMember('upper_white_stair_waist',x,-.18,height-.18,w+.1,.18,'#e4e5dd');
   if(kind==='upper')for(const dx of [-w/2,w/2]){
    inclinedMember('upper_white_sloping_side_panel',x+dx,.02,height+.02,.11,.62,'#e4e5dd');
    tube(g,'stair_brown_handrail',[[x+dx,1.10,start],[x+dx,height+1.10,end]],.055,'#76543a');
    for(let k=0;k<5;k++)tube(g,'stair_black_horizontal_rail',[[x+dx,.32+k*.15,start],[x+dx,height+.32+k*.15,end]],.016,'#303b39');
    for(let i=0;i<=9;i++){const y=i*height/9,z=start-i*run/9;box(g,'stair_black_baluster',.034,1,.035,x+dx,y+.60,z,'#374440');}
   }
   if(config.escalator){
    const ex=side*5.82,ew=.72;
    for(let step=0;step<26;step++){const y=(step+1)*height/26,z=start-(step+.5)*run/26;box(g,'lower_escalator_ribbed_step',ew,.14,run/26,ex,y-.07,z,'#7c8885');}
    inclinedMember('lower_escalator_metal_body',ex,-.25,height-.25,ew+.12,.26,'#929b95');
    for(const dx of [-.44,.44]){
     tube(g,'lower_escalator_black_handrail',[[ex+dx,1.04,start+.3],[ex+dx,1.10,start],[ex+dx,height+1.1,end],[ex+dx,height+1.04,end-.05]],.055,'#303a38');
     for(let i=0;i<10;i++){const y=i*height/9,z=start-i*run/9;box(g,'lower_escalator_glass_strip',.032,1,.78,ex+dx,y+.56,z,'#a2c1bb',{transparent:true,opacity:.35});}
    }
   }
  }
  return g;
 }
 function ceiling(parent,n){
  if(n>=1){
   const g=group(parent,'photo_suspended_ceiling');g.visible=false;const b=floorBounds(n),depth=b.front-b.back-1,center=(b.front+b.back)/2;
   const bands=[{x:-12.2,w:11.55},{x:12.2,w:11.55},{x:(b.left-18)/2,w:-18-b.left-.4},...(n===1?[{x:20.55,w:4.7},{x:28.65,w:10.9,back:GROUND_LAYOUT.rightBoundaryZ}]:[{x:(18+b.right)/2,w:b.right-18-.4}])];
   for(const band of bands){
    const back=band.back??b.back,depth=b.front-back-1,center=(b.front+back)/2;
    box(g,'white_ceiling_tiles',band.w,.07,depth,band.x,4.35,center,'#e6e7df');
    for(let x=band.x-band.w/2+.5;x<band.x+band.w/2;x++)box(g,'ceiling_tile_joint',.012,.018,depth,x,4.30,center,'#adb4aa');
    for(let z=back+1;z<b.front;z++)box(g,'ceiling_tile_cross_joint',band.w,.018,.012,band.x,4.30,z,'#adb4aa');
    for(let z=back+4;z<b.front-2;z+=8)for(const dx of [-2,2]){box(g,'recessed_strip_light',.28,.02,2.2,band.x+dx,4.25,z,'#c2c8ba');box(g,'white_light_tube',.035,.025,2.07,band.x+dx,4.22,z,'#f9fcdf');}
   }
   g.userData={decoration:true,floor:n};return g;
  }
 }
 function floorFinishes(parent,n){
  const g=group(parent,'photo_floor_and_window_details');
  if(n>=1){
   const b=floorBounds(n),depth=b.front-b.back-1,center=(b.front+b.back)/2;
   const bands=[{x:-12.2,w:11.5},{x:12.2,w:11.5},{x:(b.left-18)/2,w:-18-b.left-.4},...(n===1?[{x:20.55,w:4.7},{x:28.65,w:10.9,back:GROUND_LAYOUT.rightBoundaryZ}]:[{x:(18+b.right)/2,w:b.right-18-.4}])];
   for(const band of bands){
    const back=band.back??b.back,depth=b.front-back-1,center=(b.front+back)/2;
    for(let z=back+2;z<b.front;z+=6)box(g,'black_floor_grid_cross',band.w,.011,.16,band.x,.159,z,'#37433f',{roughness:.28});
    for(const x of [band.x-band.w/2,band.x,band.x+band.w/2])box(g,'black_floor_grid_long',.15,.011,depth,x,.159,center,'#37433f',{roughness:.28});
   }
   // 中央有挑空的部分不铺实心地砖，前后新增部分则是实体楼面。
   box(g,'black_west_gallery_floor',11.8,.012,b.front-20,0,.16,(20+b.front)/2,'#343f3c',{roughness:.25});
   box(g,'black_rear_gallery_floor',11.8,.012,-22-b.back,0,.16,(-22+b.back)/2,'#343f3c',{roughness:.25});
   if(n===1)box(g,'black_atrium_lobby_floor',11.9,.012,33,0,.16,-1,'#343f3c',{roughness:.22});
   if(n===2||n===4)box(g,'black_stair_intermediate_landing',12.2,.012,2,0,.16,n===2?10.5:-9.7,'#343f3c',{roughness:.22});
   if(n===3){const {x,z,width,depth:d}=EXHIBITION_LAYOUT;box(g,'third_floor_central_exhibition_ground',width,.014,d,x,.17,z,'#303b39',{roughness:.20});for(const xx of [-6.8,-2.4,2.4,6.8])box(g,'exhibition_white_floor_grid_long',.08,.009,d,xx,.182,z,'#cdd0c5');for(let zz=-17;zz<2;zz+=3.5)box(g,'exhibition_white_floor_grid_cross',width,.009,.08,0,.182,zz,'#cdd0c5');for(const xx of [-3.3,3.3])for(const zz of [-14,-3]){const c=new THREE.Mesh(new THREE.RingGeometry(.60,.86,36),material('#d5d7cc',{side:THREE.DoubleSide}));c.name='exhibition_white_floor_circle';c.rotation.x=-Math.PI/2;c.position.set(xx,.19,zz);g.add(c);}}
   for(let z=b.back+.8;z<b.front-4.1;z+=4.25){box(g,'north_black_window_frame',.10,3.7,.09,b.left+.1,2.25,z,'#323e3b');box(g,'north_window_glass',.04,3.45,4.1,b.left-.01,2.25,z+2.03,'#a4c2b8',{transparent:true,opacity:.24});}
   for(const y of [.70,2.5,4.05])box(g,'north_window_horizontal_frame',.10,.065,depth,b.left+.1,y,center,'#303b39');
   // 右侧连续窗墙为侧边交通区提供边界参照，不能让白墙块看起来悬在大厅中央。
   const rightBack=n===1?GROUND_LAYOUT.rightBoundaryZ:b.back,rightDepth=b.front-rightBack-1;
   for(let z=rightBack+.8;z<b.front-4.1;z+=4.25){
    box(g,'south_black_window_frame',.10,3.7,.09,b.right-.1,2.25,z,'#323e3b');
    if(z+4.1<TRANSPORT_CORE.back||z>TRANSPORT_CORE.front)box(g,'south_window_glass',.04,3.45,4.1,b.right+.01,2.25,z+2.03,'#a4c2b8',{transparent:true,opacity:.15});
   }
   for(const y of [.70,2.5,4.05])box(g,'south_window_horizontal_frame',.10,.065,rightDepth,b.right-.1,y,(b.front+rightBack)/2,'#303b39');
   const rearRight=b.right;
   for(let x=b.left+.8;x<rearRight-4.1;x+=4.25){box(g,'east_black_window_frame',.08,3.7,.10,x,2.25,b.back+.2,'#303b39');box(g,'east_window_glass',4.1,3.45,.035,x+2.03,2.25,b.back+.13,'#adc5bb',{transparent:true,opacity:.22});}
   for(const y of [.70,2.5,4.05])box(g,'east_window_horizontal_frame',rearRight-b.left-1,.065,.10,(b.left+rearRight)/2,y,b.back+.2,'#303b39');
   return g;
  }
 }
 function balcony(parent,back,floor){
  if(floor===3){
   // 三楼退台顶边的绿化是独立花盆；两边留出下部直梯的出口，不横栏封口。
   const g=group(parent,'photo_third_floor_potted_edge');
   box(g,'third_floor_low_stone_exhibit_edge',7.1,.48,.17,0,.38,back-.20,'#3c4741');
   for(const x of [-3.1,-2.25,-1.4,-.55,.3,1.15,2,2.85])pottedFlower(g,x,back-.45);
   return g;
  }
  const g=group(parent,'photo_curved_green_balcony');const shape=new THREE.Shape();
  shape.moveTo(-3.2,0);shape.quadraticCurveTo(0,-1.8,3.2,0);shape.lineTo(-3.2,0);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:false});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,material('#d6d8ce'));mesh.name='curved_balcony_nose';mesh.position.set(0,.13,back);g.add(mesh);
  tube(g,'balcony_brown_top_rail',[[-3.2,1.1,back],[0,1.1,back+1.05],[3.2,1.1,back]],.065,'#795640');
  for(let x=-3;x<=3;x+=.6){const zz=back+1.05*(1-(x/3.2)**2);box(g,'balcony_gray_parapet',.61,.68,.09,x,.60,zz,'#bfcac0');box(g,'photo_red_gallery_infill',.61,.52,.08,x,.91,zz-.07,'#9c4f3b');foliage(g,x,.40,zz+.08,1.7);}
  return g;
 }
 function kiosk(parent,x,z,color='#963c36'){
  const g=group(parent,'photo_information_kiosk');g.position.set(x,0,z);
  box(g,'kiosk_base',1.05,.15,.72,0,.12,0,'#929d93');box(g,'kiosk_column',.87,1.95,.16,0,1.15,0,color);
  box(g,'kiosk_black_screen',.68,1.27,.025,0,1.39,.10,'#263c37');box(g,'kiosk_screen_content',.60,1.08,.027,0,1.41,.116,'#b1cbd0');
  sign(g,'信息展示',.55,.20,0,1.83,.137,'#dae9e2','#31534a');return g;
 }
 function lobby(parent){
  const g=group(parent,'photo_lobby_furnishings');
  const counter=group(g,'photo_red_wood_service_counter');counter.position.set(0,0,13);counter.scale.x=.80;
  box(counter,'service_wood_body',8,1.07,1.60,0,.69,0,'#9b4b35');
  // 服务台照片可见轻微弧形前缘；用轮廓挤出桌面，再用分段面板表达红木柜门。
  const topShape=new THREE.Shape();topShape.moveTo(-4.1,.88);topShape.lineTo(4.1,.88);topShape.lineTo(4.1,-.84);topShape.quadraticCurveTo(0,-1.54,-4.1,-.84);topShape.closePath();
  const topGeo=new THREE.ExtrudeGeometry(topShape,{depth:.12,bevelEnabled:false});topGeo.rotateX(-Math.PI/2);
  const topMesh=new THREE.Mesh(topGeo,material('#43463d'));topMesh.name='curved_service_worktop';topMesh.position.y=1.22;counter.add(topMesh);
  for(let n=0;n<6;n++){const x=-3.34+n*1.336,z=.85+.35*(1-(x/4.1)**2);const panel=box(counter,'red_wood_counter_panel',1.32,1.07,.10,x,.69,z,'#aa513a');panel.rotation.y=Math.atan(.04375*x);box(counter,'silver_counter_trim',.036,1.05,.065,x+.66,.70,z,'#c9c7a9');}
  for(const x of [-3.2,-1.92,-.64,.64,1.92,3.2]){box(counter,'service_monitor',.60,.43,.08,x,1.65,.15,'#2d3431');box(counter,'service_monitor_lit_screen',.53,.36,.012,x,1.65,.198,'#9bbbc5',{emissive:'#769fae',emissiveIntensity:.28});box(counter,'monitor_stand',.06,.20,.07,x,1.40,.15,'#485449');box(counter,'service_keyboard',.48,.035,.18,x,1.35,.48,'#8d9592');}
  box(counter,'motto_backdrop',9.5,1.8,.08,0,2.20,-1.30,'#dedfd3');sign(counter,'自强不息  止于至善',8.8,.90,0,2.3,-1.24,'#dedfd3','#263d5a');
  const lockers=group(g,'photo_white_storage_lockers');lockers.position.set(-14,0,-16);
  for(let i=0;i<12;i++){const x=(i%6-2.5)*.52,y=Math.floor(i/6)*.93+.60;box(lockers,'white_locker_door',.50,.90,.86,x,y,0,'#e7e8dc');box(lockers,'locker_handle',.027,.13,.025,x+.16,y,.446,'#4b5550');}
  for(const x of [-13,13]){plant(g,x,29,1.15);}
  for(const x of [-5,5])lathe(g,'red_display_vase',[[.25,0],[.32,.12],[.40,.75],[.24,1.45],[.16,1.72],[.23,1.9]],x,.16,7,'#803d40');
  return g;
 }
 function groundServices(parent){
  const g=group(parent,'user_ground_floor_services');g.userData={floor:1,source:'用户确认的相对布局，更新2026-10-18；数量和尺寸为示意'};
  // 连接服务台后方原柱线，形成左右两道实墙；柱子仍作为墙体中的构件保留。
  // 前厅两段沙发背墙与中央入口分开，不能把入口整面封死。
  for(const w of [...GROUND_LAYOUT.partitions,...GROUND_LAYOUT.loungeBackWalls]){
   box(g,'ground_partition_wall',w.w,4.05,w.d,w.x,2.17,w.z,'#e3e4dc');
   box(g,'ground_partition_skirt',w.w+.015,.16,w.d+.015,w.x,.25,w.z,'#65716b');
  }
  const printers=group(g,'ground_printer_row');
  for(const {x,z}of GROUND_LAYOUT.printers){
   const p=group(printers,'schematic_printer');p.position.set(x,0,z);
   box(p,'printer_cabinet',1.45,1.1,1.2,0,.7,0,'#c8ccca');box(p,'printer_dark_base',1.4,.14,1.15,0,.22,0,'#536168');
   box(p,'printer_scanner_lid',1.42,.15,1.17,0,1.34,0,'#737f86');box(p,'printer_paper_output',.93,.13,.17,0,.98,.64,'#3f4c54');
   box(p,'printer_control_screen',.34,.16,.15,.36,1.47,.35,'#7ca0ac');
   for(const y of [.45,.72])box(p,'printer_tray_handle',.43,.045,.035,0,y,.63,'#7b8789');
  }
  sign(g,'自助打印机排  示意',7.5,.40,GROUND_LAYOUT.printPoint.x,2.0,GROUND_LAYOUT.printPoint.z-.3,'#e3e9e3','#415c61');
  sign(g,'固定专座  资格按馆方规则',6.0,.36,GROUND_LAYOUT.dedicated.x,1.7,GROUND_LAYOUT.dedicated.z,'#d9e3e9','#4a5b74');
  // 密集书库按柜体陈列，柜体之间仅留检修/取书缝隙，不能把这里计成座位区。
  for(const b of GROUND_LAYOUT.compactBlocks){
   const block=group(g,'ground_compact_storage_block');block.position.set(b.x,0,b.z);block.userData={role:'compact_storage',w:b.w,d:b.d};
   box(block,'compact_storage_floor',b.w,.025,b.d,0,.18,0,'#c4cbd0');
   const length=5.2,rows=Math.floor(b.d/6),count=b.columns||4;
   for(let row=0;row<rows;row++){
    const zz=(row-(rows-1)/2)*6;
    for(let i=0;i<count;i++){
     const x=(i-(count-1)/2)*(b.w/count),cab=group(block,'compact_storage_cabinet');cab.position.set(x,0,zz);
     box(cab,'closed_archive_cabinet_body',b.w/count-.12,2.45,length,0,1.42,0,'#b7c0c4');
     box(cab,'archive_cabinet_end_panel',b.w/count-.13,2.46,.09,0,1.42,length/2,'#a6b2b7');
     box(cab,'archive_vertical_door_seam',.025,2.2,.025,0,1.42,length/2+.06,'#89989e');
     ring(cab,'archive_handwheel',.14,.018,.21,1.22,length/2+.075,'#546873');
     sign(cab,'密集书库',.70,.20,0,2.14,length/2+.061,'#e7ece6','#455c63');
    }
    for(const x of [-b.w/2+.12,b.w/2-.12])box(block,'compact_storage_floor_rail',.05,.035,5.5,x,.205,zz,'#70858f');
   }
  }
  // 黑色区域后端、收书室旁的一排木色小桌。它们用于说明现场陈设，不加入选座样本。
  for(const p of GROUND_LAYOUT.receivingTables){
   const t=table(g,p.x,p.z,p.w,p.d);t.name='ground_receiving_wood_table';
   t.userData={floor:1,role:'receiving_support_table',monitoredSeats:false};
   for(const m of t.children)if(m.name==='cream_worktop'||m.name==='dark_desktop_edge')m.material=material(m.name==='cream_worktop'?'#bd9567':'#987348');
  }
  // R07、R09可见木框、白坐垫休息家具和展示架；用户确认左右两区各两张沙发，中间一个书架。
  for(const p of GROUND_LAYOUT.sofas){
   const sofa=group(g,'ground_wood_sofa');sofa.position.set(p.x,0,p.z);sofa.rotation.y=p.rotation;sofa.userData={photoReference:[7,9]};
   box(sofa,'sofa_wood_frame',3.3,.17,1.25,0,.36,0,'#76563e');
   box(sofa,'sofa_white_cushion',2.96,.20,1.02,0,.54,.04,'#e4e3d9');
   box(sofa,'sofa_white_back',2.96,.65,.20,0,.90,-.45,'#e8e6db');
   for(const x of [-1.62,1.62]){box(sofa,'sofa_wood_arm',.13,.13,1.3,x,.86,0,'#78553b');for(const z of [-.56,.56])box(sofa,'sofa_wood_leg',.12,.81,.12,x,.48,z,'#765139');}
   for(let x=-1.45;x<=1.45;x+=.42)box(sofa,'sofa_back_wood_slat',.075,.66,.075,x,.78,-.57,'#765139');
  }
  for(const s of GROUND_LAYOUT.smallShelves){const rack=group(g,'ground_small_display_shelf');rack.position.set(s.x,0,s.z);rack.rotation.y=s.rotation;
  for(const x of [-s.w/2,s.w/2])box(rack,'display_rack_end',.13,1.7,.55,x,1.05,0,'#705242');
  box(rack,'display_rack_back',s.w,1.65,.055,0,1.05,-.20,'#604b40');
  for(let row=0;row<3;row++){const yy=.34+row*.5;box(rack,'display_rack_shelf',s.w,.055,.52,0,yy,0,'#6d5241');
   for(let col=0;col<8;col++)box(rack,'schematic_display_book',.20,.30+(col%3)*.025,.08,-1.35+col*.38,yy+.20,.16,['#8295a0','#c7bdab','#a98872','#6a8b7c'][col%4]);
  }
  sign(rack,'图书推荐  示意',2.3,.20,0,1.91,.10,'#dedfce','#475d57');
  }
  const t=GROUND_LAYOUT.toilet,wc=group(g,'ground_toilet');wc.position.set(t.x,0,t.z);wc.userData={source:'用户确认左侧窗边阅览前方；室内细节未测'};
  // 外框按本人描述扩大为角落两乘两格。内部是可进入的陈设示意，未取得内部实景测绘。
  wc.userData.interior='schematic, not photo verified';
  box(wc,'ground_toilet_floor',t.w,.035,t.d,0,.18,0,'#b9b5a4');
  for(const x of [-t.w/2,t.w/2])box(wc,'ground_toilet_wall',.18,4.2,t.d,x,2.25,0,'#deddd2');
  box(wc,'ground_toilet_wall',t.w,4.2,.18,0,2.25,t.d/2,'#deddd2');
  // 门洞保留真实几何开口，避免再把整个房间当成不透明方块。
  const doorWidth=1.7,wallWidth=(t.w-doorWidth)/2;
  for(const side of [-1,1])box(wc,'ground_toilet_wall',wallWidth,4.2,.18,side*(doorWidth/2+wallWidth/2),2.25,-t.d/2,'#deddd2');
  box(wc,'ground_toilet_wall',doorWidth,1.2,.18,0,3.75,-t.d/2,'#deddd2');
  for(let x=-t.w/2+1;x<t.w/2;x+=1.6)box(wc,'ground_toilet_tile_joint',.012,.005,t.d-.2,x,.204,0,'#969b8d');
  for(let z=-t.d/2+1;z<t.d/2;z+=1.6)box(wc,'ground_toilet_tile_joint',t.w-.2,.005,.012,0,.204,z,'#969b8d');
  const basin=group(wc,'ground_toilet_basin');basin.position.set(-t.w/2+1.4,0,0);
  box(basin,'warm_basin_cabinet',1.4,.72,5.8,0,.62,0,'#9c907a');
  box(basin,'stone_basin_counter',1.55,.12,6,0,1.05,0,'#c6cec5');
  for(const z of [-1.8,0,1.8]){box(basin,'white_washbasin',.95,.12,1.05,0,1.15,z,'#edf0e5');cylinder(basin,'basin_tap',.035,.22,-.42,1.34,z,'#9eafb0');box(wc,'mirror_glass',.045,1.3,1.4,-t.w/2+.14,2.05,z,'#9dbbb6',{metalness:.7,roughness:.2});}
  for(const z of [-2,1.4,4.5]){
   const stall=group(wc,'ground_toilet_stall');stall.position.set(t.w/2-1.6,0,z);
   for(const dz of [-1.45,1.45])box(stall,'stall_partition',2.6,2.1,.09,0,1.45,dz,'#bfc9c1');
   box(stall,'stall_door',.09,1.95,2.6,-1.3,1.4,0,'#98aba5');
   box(stall,'stall_handle',.08,.06,.24,-1.37,1.3,-.7,'#d5dbd2');
  }
  // 阅览桌在厕所后方（-Z），入口开在这一侧，朝向桌排而不是横向朝前厅。
  const door=box(wc,'toilet_door',1.05,2.2,.045,-doorWidth/2-.08,1.30,-t.d/2+.56,'#859b98');door.rotation.y=Math.PI/2;door.userData={normal:[0,0,-1],open:true};
  sign(wc,'WC  洗手间',1.65,.32,0,2.55,-t.d/2-.07,'#4c776e','#f4f4e8',t.doorRotation);
  sign(wc,'内部陈设示意',2.5,.3,0,2.9,t.d/2-.13,'#cbd8ce','#47645b',Math.PI);
  // 一楼公众可达通道在右侧电梯后终止；后方建筑不作为馆内座位或资源区。
  // 一楼左右后沿已由本人确认齐平；移除旧的中途截断墙，避免阻挡新增区域。
  // 咖啡厅作为实际功能区补入，家具数量、吧台设备和材质没有现场依据，明确标注为示意。
  // 两个有房号的空间按本人最新说明定位，绝不把工作人员室作为可推荐座位。
  for(const r of GROUND_LAYOUT.rooms){
   const room=group(g,'ground_room_'+r.id);room.position.set(r.x,0,r.z);
   room.userData={floor:1,room:r.id,staffOnly:r.staffOnly,monitoredSeats:false,source:'本人2026-10-15现场补充；室内家具与尺寸为示意'};
   box(room,'ground_room_floor',r.w,.025,r.d,0,.18,0,r.staffOnly?'#cbd6d0':'#d7d5be');
   // 门在朝向馆内的左侧墙，墙分成两段，使漫游能够走过实际门洞。
   for(const z of [-r.d/2,r.d/2])box(room,'ground_room_wall',r.w,2.8,.14,0,1.55,z,'#e3e4db');
   box(room,'ground_room_wall',.14,2.8,r.d,r.w/2,1.55,0,'#e3e4db');
   const gap=1.7;
   for(const side of [-1,1])box(room,'ground_room_wall',.14,2.8,(r.d-gap)/2,-r.w/2,1.55,side*(r.d+gap)/4,'#e3e4db');
   box(room,'ground_room_lintel',.14,.6,gap,-r.w/2,2.65,0,'#e3e4db');
   sign(room,r.label,r.staffOnly?5.7:7,.62,0,3.2,-r.d/2+.11,'#55756a','#f5f1e5');
   if(r.bookStorage){
    // 收书室只表现内部收纳架，没有普通选座椅、电脑或未经确认的房号。
    for(const z of [-1.65,1.65]){
     const shelf=group(room,'receiving_book_shelf');shelf.position.set(1.7,0,z);
     for(const x of [-1.15,1.15])box(shelf,'receiving_shelf_side',.10,2.05,.5,x,1.2,0,'#967550');
     for(let row=0;row<4;row++){
      const y=.35+row*.48;box(shelf,'receiving_shelf_board',2.3,.065,.5,0,y,0,'#b08b5e');
      for(let i=0;i<9;i++)box(shelf,'receiving_stored_book',.15,.29+(i%3)*.025,.32,-.88+i*.22,y+.19,0,['#a9b2a4','#d2c7af','#8d9b9c'][i%3]);
     }
    }
    sign(room,'图书收纳 · 非选座区',5.7,.30,0,2.6,-r.d/2+.12,'#e7e9df','#5b7366');
   }else if(r.staffOnly){
    const t=table(room,.5,0,2.7,1.1);t.name='staff_work_desk';chair(room,.5,1.05,Math.PI);
    box(room,'schematic_staff_monitor',.8,.5,.08,.5,1.25,-.15,'#43534e');
    sign(room,'工作人员空间 · 不参与选座',5.7,.30,0,2.6,-r.d/2+.12,'#e7e9df','#5b7366');
   }else{
    for(const z of [-2.8,2.8]){table(room,0,z,4.7,1.35);for(const x of [-1.4,1.4])for(const dz of [-1.1,1.1])chair(room,x,z+dz,dz<0?0:Math.PI);}
    sign(room,'房号由本人提供 · 陈设示意',7,.30,0,2.6,-r.d/2+.12,'#e7e9df','#5b7366');
   }
  }
  const c=GROUND_LAYOUT.cafe,cafe=group(g,'ground_cafe');cafe.position.set(c.x,0,c.z);
  cafe.userData={floor:1,role:'cafe',source:'本人2026-10-15补充：107之后的长条区，咖啡厅与电梯之间有106工作室；陈设与尺寸未测绘',monitoredSeats:false};
  box(cafe,'cafe_floor',c.w,.025,c.d,0,.18,0,'#d8c7ab');
  box(cafe,'cafe_partition_wall',.14,2.8,c.d,c.w/2,1.55,0,'#e4dfd3');
  box(cafe,'cafe_partition_wall',c.w,2.8,.14,0,1.55,-c.d/2,'#e4dfd3');
  // 朝大厅的左侧入口完全敞开，展示柜和座椅不占门前通道。
  sign(cafe,'咖啡厅',4.7,.70,0,3.25,-c.d/2+.10,'#705942','#f4ead5');
  sign(cafe,'一楼右侧 · 陈设示意',6.7,.36,0,2.60,-c.d/2+.11,'#e9e2d3','#695b49');
  const bar=group(cafe,'cafe_service_counter');bar.position.set(1,0,-c.d/2+1.4);
  box(bar,'cafe_counter_wood',7.2,1.05,1.1,0,.72,0,'#94795c');box(bar,'cafe_counter_top',7.4,.12,1.24,0,1.3,0,'#d2c5ae');
  box(bar,'schematic_coffee_machine',.85,.65,.50,1.3,1.69,-.03,'#485451');
  for(const x of [-1.8,-1.2,-.6]){cylinder(bar,'schematic_coffee_cup',.11,.18,x,1.48,.2,'#ece8da');cylinder(bar,'coffee_cup_saucer',.17,.025,x,1.38,.2,'#ede9df');}
  for(const x of [-3.3,2.1])for(let z=-c.d/2+6;z<c.d/2-2;z+=6){
   const t=table(cafe,x,z,2.4,1.05);t.name='cafe_reading_table';
   for(const dz of [-1.05,1.05]){const seat=chair(cafe,x,z+dz,dz<0?0:Math.PI,'#758b85');seat.name='cafe_chair';}
  }
  return g;
 }
 function elevator(parent,floor){
  const root=group(parent,'user_elevator_landing');root.position.set(ELEVATOR_LAYOUT.x,0,ELEVATOR_LAYOUT.z);root.rotation.y=ELEVATOR_LAYOUT.groundRotation;root.userData={floor,role:'elevator',source:'本人说明；各层同一井道和门前点不动，电梯外形沿墙加宽，接近占满所属小块；尺寸未测绘'};
  // 只拉宽外形，向交通区后壁填充；保持已确认的门前坐标和两端通道，不能挡路。
  const g=group(root,'wide_elevator_body');g.scale.x=ELEVATOR_LAYOUT.facadeScale;g.position.x=ELEVATOR_LAYOUT.facadeOffset;
  box(g,'elevator_shaft_back',2.7,4.35,.16,0,2.32,-1.4,'#c4c9c7');
  for(const x of [-1.35,1.35])box(g,'elevator_shaft_side',.14,4.35,2.8,x,2.32,0,'#c4c9c7');
  box(g,'elevator_door_lintel',2.7,.52,.14,0,3.70,1.36,'#b4bebf');
  for(const x of [-.52,.52])box(g,'elevator_closed_door',1.02,2.70,.10,x,1.57,1.36,'#35464b',{metalness:.45,roughness:.45});
  box(g,'elevator_door_center_seam',.025,2.70,.12,0,1.57,1.38,'#40555b');box(g,'elevator_call_panel',.15,.38,.04,1.20,1.25,1.44,'#526b72');
  for(const y of [1.17,1.31])sphere(g,'elevator_call_button',.035,1.20,y,1.47,'#ccd7d5');
  sign(g,`${floor}F  电梯示意`,2.0,.36,0,3.67,1.46,'#e3e9e6','#344f59');
  return root;
 }
 function upperRooms(parent,floor){
  const layout=upperFacilities(floor),g=group(parent,'user_upper_facilities');
  // 各层同为四格厕所；上层仅画围合外轮廓，不编造内部洁具或真实性别分区。
  for(const t of layout.toilets){const wc=group(g,'upper_toilet');wc.position.set(t.x,0,t.z);wc.userData={floor,source:'本人确认上层两侧均有厕所；具体尺寸未测绘'};box(wc,'toilet_room_shell',t.w,2.65,t.d,0,1.48,0,'#d1d7d3');box(wc,'toilet_door',1.05,2.2,.045,0,1.30,-t.d/2-.035,'#859b98');sign(wc,'WC 洗手间',1.7,.32,0,2.55,-t.d/2-.07,'#4c776e','#f4f4e8',Math.PI);}
  // 研讨室门洞朝前方公共通道，墙体独立碰撞，不能把整个房间当不可进入的实心盒子。
  for(const r of layout.rooms){const room=group(g,'upper_seminar_room');room.position.set(r.x,0,r.z);room.userData={floor,source:'2025官方图外围房间带；几何分段不是实际房间清单，当前用途与门位待核验'};
   for(const x of [-r.w/2,r.w/2])box(room,'seminar_wall',.12,2.7,r.d,x,1.5,0,'#e0e4db');box(room,'seminar_wall',r.w,2.7,.12,0,1.5,-r.d/2,'#e0e4db');
   const door=1.5;for(const side of [-1,1])box(room,'seminar_wall',(r.w-door)/2,2.7,.12,side*(r.w+door)/4,1.5,r.d/2,'#e0e4db');box(room,'seminar_lintel',door,.5,.13,0,2.6,r.d/2,'#e0e4db');
   sign(room,r.label+' · 示意',4.4,.32,0,2.48,r.d/2+.08,'#e5e8dd','#49645c');table(room,0,0,3.2,1.15);for(const x of [-1.05,0,1.05])for(const z of [-1.15,1.15])chair(room,x,z,z<0?0:Math.PI);}
  if(layout.lockers){const l=layout.lockers,row=group(g,'upper_rear_wall_lockers');row.position.set(l.x,0,l.z);row.userData={floor,source:'本人确认五楼后墙连续存包柜；馆方2026-09-14通知确认存包柜存在，柜数未核验'};box(row,'locker_rear_wall',l.w,3.0,.10,0,1.65,-l.d/2,'#e0e3da');
   // 小柜门只有示意序列，没有真实柜号、使用人或可申领状态。
   for(let col=0;col<40;col++)for(let level=0;level<4;level++){const x=-l.w/2+(col+.5)*l.w/40,y=.50+level*.59;box(row,'schematic_locker_door',l.w/40-.035,.55,l.d,x,y,0,'#d5ded7');box(row,'locker_handle',.035,.13,.04,x+.22,y,l.d/2+.02,'#667b72');}
   sign(row,'存包柜 · 柜数示意',6,.36,0,2.95,l.d/2+.08,'#e5e9df','#49625a');}
  if(layout.culture){
   const r=layout.culture,room=group(g,'upper_cultural_exchange_centre');room.position.set(r.x,0,r.z);room.userData={floor,source:'2025馆藏图四楼东南侧中日文化交流中心；家具仅为示意'};
   for(const x of [-r.w/2,r.w/2])box(room,'seminar_wall',.12,2.7,r.d,x,1.5,0,'#e0e4db');box(room,'seminar_wall',r.w,2.7,.12,0,1.5,-r.d/2,'#e0e4db');
   for(const side of [-1,1])box(room,'seminar_wall',(r.w-1.8)/2,2.7,.12,side*(r.w+1.8)/4,1.5,r.d/2,'#e0e4db');
   box(room,'seminar_lintel',1.8,.5,.13,0,2.6,r.d/2,'#e0e4db');
   sign(room,'中日文化交流中心',6.8,.48,0,2.65,r.d/2+.10,'#f0e7d4','#664f3b');
   sign(room,'日文书刊与交流空间  家具示意',6.7,.30,0,2.10,r.d/2+.10,'#eee8db','#667464');
   table(room,0,-.2,3.8,1.5);for(const x of [-1.3,0,1.3])for(const z of [-1.6,1.6])chair(room,x,z,z<0?0:Math.PI);
   for(const x of [-3,3]){box(room,'culture_display_bookcase',1.2,2.0,.4,x,1.2,-3.5,'#9b8167');for(let y=.5;y<2.1;y+=.5)box(room,'culture_bookcase_shelf',1.15,.055,.43,x,y,-3.5,'#c2ae92');}
  }
  return g;
 }
 function transportCore(parent,floor,height){
  const c=TRANSPORT_CORE,s=c.stair,g=group(parent,'user_white_transport_core');g.userData={floor,source:'本人确认白墙、电梯与门前楼梯关系；R47/R53仅作墙面材质参考，尺寸未测绘'};
  const walls=group(g,'transport_core_walls');
  function wall(w,d,x,z){
   box(walls,'transport_core_white_wall',w,4.05,d,x,2.17,z,'#e8e8df');
   box(walls,'transport_core_stone_dado',w+.01,1.0,d+.01,x,.68,z,'#d3d2c6');
   box(walls,'transport_core_dark_skirt',w+.025,.15,d+.025,x,.245,z,'#394340');
  }
  const width=c.right-c.left,depth=c.front-c.back;
  wall(.16,depth,c.left,(c.back+c.front)/2);wall(.16,depth,c.right,(c.back+c.front)/2);
  // 门前走廊的前后两端都开口。只分割外围墙，不改变电梯井道位置和黑色门面朝向。
  for(const exit of c.exits){
   const low=exit.x-exit.width/2,high=exit.x+exit.width/2;
   wall(low-c.left,.16,(c.left+low)/2,exit.z);wall(c.right-high,.16,(high+c.right)/2,exit.z);
   box(walls,'transport_core_entry_lintel',exit.width,1.15,.18,exit.x,3.62,exit.z,'#e8e8df');
  }
  sign(g,'电梯 · 楼梯  示意',2.5,.30,c.entry.x,2.85,c.front+.10,'#e2e5dd','#3d5d57');
  box(g,'transport_core_hall_floor',width-.2,.015,depth-.2,(c.left+c.right)/2,.164,(c.back+c.front)/2,'#e6e4d9');
  sign(g,'相对位置示意 · 未测绘',3.1,.23,c.entry.x,2.95,c.front-.11,'#ecece4','#68786e',Math.PI);
  const stair=group(g,'transport_core_return_stair');stair.userData={floor,connects:floor<5?[floor,floor+1]:[4,5],source:'本人确认电梯门前有楼梯；折返外形示意'};
  if(floor<5){
   const run=s.front-s.back,count=14;
   for(let i=0;i<count;i++){
    const rise=(i+1)*height/(count*2),z=s.front-(i+.5)*run/count;
    box(stair,'transport_stair_tread',s.width,rise,run/count+.012,s.leftX,rise/2+.15,z,'#596166');
    const upper=height/2+(i+1)*height/(count*2),uz=s.back+(i+.5)*run/count;
    box(stair,'transport_stair_tread',s.width,.15,run/count+.012,s.rightX,upper+.075,uz,'#596166');
   }
   box(stair,'transport_stair_mid_landing',3.2,.16,.60,(s.leftX+s.rightX)/2,height/2+.07,(s.back+s.landingBack)/2,'#596166');
  }else{
   box(stair,'transport_stair_top_landing',s.width,.06,1.05,s.rightX,.19,s.front+.45,'#596166');
   sign(stair,'楼梯向下  示意',1.7,.25,s.rightX,1.3,s.front+.4,'#e5e8df','#455c56');
  }
  return g;
 }
 function woodSculpture(parent){
  // R51木雕位于三楼展厅后方；仅以抽象轮廓复现，不伪造雕刻纹样和作者署名。
  const wood=group(parent,'photo_abstract_wood_sculpture');wood.position.set(EXHIBITION_LAYOUT.smallExhibit.x,0,EXHIBITION_LAYOUT.smallExhibit.z);wood.userData={floor:3,photoReference:51};
  box(wood,'wood_sculpture_plinth',2.8,.22,1.8,0,.25,0,'#b6b7a3');
  for(let i=0;i<6;i++)tube(wood,'abstract_wood_branch',[[Math.sin(i)*.6,.5,Math.cos(i)*.3],[Math.sin(i+1)*.8,1.3+i*.18,0],[Math.cos(i)*.5,2.2+i*.12,.2]],.12,'#806b48');
  for(const x of [-1.9,1.9])for(const z of [-1.3,1.3]){cylinder(wood,'gold_exhibit_rope_post',.06,.94,x,.58,z,'#bba353');sphere(wood,'gold_post_head',.12,x,1.08,z,'#c5b36e');}
  for(const x of [-1.9,1.9])tube(wood,'red_exhibit_rope',[[x,.98,-1.3],[x,.73,0],[x,.98,1.3]],.025,'#9d393b');
  return wood;
 }
 function teapot(parent,x,y,z,s=.18){
  const g=group(parent,'schematic_white_teapot');g.position.set(x,y,z);g.scale.setScalar(s);
  sphere(g,'teapot_body',1,0,0,0,'#e8ece0',[1,.77,.75]);cylinder(g,'teapot_lid',.58,.09,0,.75,0,'#eef0e6');sphere(g,'teapot_lid_knob',.13,0,.90,0,'#ebeee2');
  ring(g,'teapot_handle',.58,.13,-1,0,0,'#edf0e5');tube(g,'teapot_spout',[[.6,-.1,0],[1.05,.03,0],[1.30,.55,0]],.20,'#e9eee1');return g;
 }
 function exhibition(parent){
  const g=group(parent,'photo_third_floor_central_exhibition');g.userData={floor:3,role:'central_exhibition',photoReference:73};
  const ceramics=group(g,'ceramic_tree_display');ceramics.position.set(EXHIBITION_LAYOUT.ceramics.x,0,EXHIBITION_LAYOUT.ceramics.z);
  ceramics.scale.setScalar(.8);
  box(ceramics,'red_display_platform',2.8,.1,1.6,0,.23,0,'#b64649');
  for(const x of [-1.3,1.3])for(const z of [-.73,.73])box(ceramics,'red_display_case_frame',.045,4.0,.045,x,2.25,z,'#ad3e43');
  for(const z of [-.73,.73])box(ceramics,'display_case_top_frame',2.65,.05,.04,0,4.25,z,'#a84042');
  lathe(ceramics,'white_tree_base',[[.27,0],[.31,.1],[.20,.95],[.34,1.25],[.12,1.40]],0,.3,0,'#e4e9de');
  for(let j=0;j<4;j++)for(let i=0;i<7;i++){const a=i*Math.PI*2/7,r=.28+j*.16;teapot(ceramics,Math.cos(a)*r,1.50+j*.51,Math.sin(a)*.40,.14+(j%2)*.025);}
  const arm=group(g,'armillary_display');arm.position.set(EXHIBITION_LAYOUT.armillary.x,0,EXHIBITION_LAYOUT.armillary.z);
  box(arm,'red_wood_armillary_base',2.6,1.40,1.7,0,.87,0,'#9a5039');
  for(const y of [.2,1.4])box(arm,'wood_pedestal_moulding',2.8,.14,1.9,0,y,0,'#b0633f');
  for(const rot of [[0,0,0],[Math.PI/2,0,0],[0,Math.PI/2,0],[.70,.70,0]])ring(arm,'gold_armillary_ring',.77,.035,0,2.36,0,'#bda45c',rot);
  for(const x of [-.73,.73])tube(arm,'abstract_armillary_support',[[x,1.57,0],[x*1.3,1.85,0],[x*.8,2.50,0]],.07,'#b49c53');
  // 展板只装在三楼中央展厅：两边陈列，中央留出观看和通行的空间。
  for(const {x,z,rotation} of EXHIBITION_LAYOUT.boards){
   const board=group(g,'photo_blue_exhibition_board');board.position.set(x,0,z);board.rotation.y=rotation;board.userData={floor:3,role:'exhibition_board'};
   box(board,'exhibition_stand_base',1.42,.12,.58,0,.22,0,'#69756e');box(board,'exhibition_board_support',.07,.47,.09,0,.46,0,'#68766e');
   box(board,'black_exhibition_board_back',1.23,2.05,.09,0,1.52,0,'#263b40');box(board,'blue_exhibition_board_face',1.17,1.99,.025,0,1.52,.057,'#4d8aaa');
   box(board,'white_exhibition_content',1.02,1.48,.027,0,1.40,.074,'#dce5db');
   sign(board,'展览内容示意',1.05,.25,0,2.28,.090,'#4d8aaa','#f2f2e9');
  }
  // 三楼后方是R51木雕和围绳，不用书架或无依据的金色小摆件代替。
  woodSculpture(g);
  kiosk(g,3.9,-12);return g;
 }
 function lounge(parent){
  const g=group(parent,'photo_white_lounge_sofas');g.position.set(-13,0,19.5);
  // 白色休息家具只表达照片中的公共休息区，不增加可预约的状态样本。
  for(const x of [-1.6,1.6]){
   box(g,'sofa_low_base',2.7,.25,1.10,x,.31,0,'#b8b7a6');box(g,'white_sofa_cushion',2.45,.21,.90,x,.54,.03,'#e5e4d6');
   box(g,'white_sofa_back',2.7,.58,.22,x,.79,-.43,'#dfdfd1');for(const dx of [-1.30,1.30])box(g,'white_sofa_arm',.18,.43,1.05,x+dx,.68,0,'#dfdfd1');
  }
  return g;
 }
 function skylight(parent,height){
  const g=group(parent,'photo_glazed_atrium_roof');g.position.y=height*5-.35;g.visible=false;
  for(let z=-18;z<=17;z+=3.5){box(g,'dark_roof_transverse_beam',12.8,.20,.18,0,.40,z,'#6b7d78');
   for(let x=-5.75;x<=5.8;x+=1.15){box(g,'glass_roof_panel',1.05,.035,3.30,x,.47,z+1.6,'#bfd5ce',{transparent:true,opacity:.35});
    // 白色波浪状遮阳片参考采光顶照片，仅表现其分段轮廓。
    const pts=[];for(let i=0;i<=8;i++)pts.push([x,.20-.17*Math.sin(i/8*Math.PI),z+i*3.3/8]);tube(g,'white_roof_shade',pts,.075,'#eceee1');}
  }
  for(const x of [-6.3,0,6.3])box(g,'roof_longitudinal_beam',.13,.19,39,x,.4,0,'#6d8078');return g;
 }
 return {exterior,landscape,interiorFrame,railDetails,circulation,ceiling,floorFinishes,balcony,lobby,groundServices,elevator,transportCore,upperRooms,exhibition,lounge,skylight,bonsai,sign};
}
