import * as THREE from 'three';
export const PILOT_INFO=[
 {n:1,title:'服务导览与高峰分流',location:'服务层候选区；一楼位置待现场核验',x:0,z:4,w:14,d:9,color:'#378a9a',normal:'集中咨询',active:'导览 / 咨询分流',trigger:'模拟咨询排队6人，启用第二个引导点。',action:'两台新增移动导览台分开，分别承接找书与咨询。排队线保持在候选区内。',protect:'不改变借阅总台、密集书库或出入口；现场核对平面后再选址。',metric:'排队等待、路线完成率、人工介入次数',phase:'第二阶段：先核对一楼服务平面'},
 {n:2,title:'阅读支持与无声结对',location:'南侧西端阅读边缘候选位',x:12,z:14.3,w:5,d:4,color:'#509981',normal:'独立研读',active:'无声结对',trigger:'模拟2名读者申请结对阅读，且候选桌位空闲。',action:'两张新增小桌并拢，用电子便签协作；需要说话时引导预约研讨室。',protect:'A—F馆藏、现有预约及阅读安静程度；书架和回廊不移动。',metric:'空闲桌利用率、干扰反馈、资源点击率',phase:'第二阶段：小范围阅读边缘试点'},
 {n:3,title:'西侧展区与无声共创',location:'2025导览标示的西侧展区',x:0,z:20,w:18,d:3.5,color:'#b88c4e',normal:'展览 / 自由阅读',active:'预约共创',trigger:'模拟预约一场无声主题共创；馆员核对展览档期。',action:'新增折叠阅读桌汇成两组，共8个示意座位；移动展板转向外围展示。',protect:'G/H/I馆藏、中庭台阶、回廊和展览档期。有声讨论转入现有研讨室。',metric:'预约完成、展览利用、邻近投诉、复原时间',phase:'第一阶段：优先在三楼验证流程'},
 {n:4,title:'学科检索与项目协作',location:'南侧技术类馆藏旁阅读边缘候选位',x:12,z:17,w:5,d:2.6,color:'#837ea5',normal:'个人检索',active:'项目检索协作',trigger:'模拟课程小组需要建筑、计算机等跨类资料。',action:'新增检索小桌并拢，资源屏由单主题切换为项目清单；保持无声协作。',protect:'J/K与工程技术馆藏、东侧文化交流功能及通道；讨论仍需预约房间。',metric:'检索任务成功率、学科资源访问、馆员反馈',phase:'第三阶段：联合学科馆员完善资源清单'},
 {n:5,title:'安静备考与预约保护',location:'东侧备考联盟；保留原有桌椅布局',x:0,z:-14,w:27,d:15,color:'#78965e',normal:'固定安静备考',active:'静音席位引导',trigger:'模拟备考高峰，显示空闲候选席位及预约保护。',action:'只开启桌边无声提示：绿色为本次可选，金色为有效预约；不移动备考桌椅。',protect:'备考用途、有效预约、原有桌椅与安静环境；五楼不转换为研讨空间。',metric:'找座耗时、预约冲突、安静满意度',phase:'第二阶段：先做席位信息提示'}
];
export function buildFloorPilots(storeys,H){
 const {group,box,table,chair}=H;const pilots=[];
 function move(p,obj,x,z,tx,tz,rot=0,tr=rot){obj.position.set(x,0,z);obj.rotation.y=rot;p.moving.push({object:obj,read:new THREE.Vector3(x,0,z),active:new THREE.Vector3(tx,0,tz),readRot:rot,activeRot:tr});}
 for(const info of PILOT_INFO){const floor=storeys[info.n-1],root=group(floor.root,'proposed_floor_'+info.n+'_pilot');root.visible=false;root.userData={proposal:true,surveyed:false,title:info.title,location:info.location};const p={info,root,moving:[],activeObjects:[],replaced:[]};
  box(root,'proposed_candidate_zone',info.w,.026,info.d,info.x,.225,info.z,info.color,{transparent:true,opacity:.28});
  for(const dz of [-info.d/2,info.d/2])box(root,'proposed_zone_border',info.w,.026,.08,info.x,.24,info.z+dz,info.color);
  for(const dx of [-info.w/2,info.w/2])box(root,'proposed_zone_border',.08,.026,info.d,info.x+dx,.24,info.z,info.color);
  if(info.n===1){for(const side of [-1,1]){const kiosk=group(root,'proposed_mobile_guidance');box(kiosk,'guidance_base',1.8,.9,.9,0,.55,0,'#b9c9bc');box(kiosk,'guidance_screen',1.3,.6,.08,0,1.25,-.28,info.color);move(p,kiosk,side*1.2,4,side*4.1,3.3);}for(const x of [-4,4])for(let z=5;z<8;z+=1.2){const arrow=box(root,'proposed_queue_prompt',.7,.025,.45,x,.27,z,info.color);p.activeObjects.push(arrow);}}
  else if(info.n===2||info.n===4){const z=info.z;for(const side of [-1,1]){const t=table(root,0,0,1.6,.75);move(p,t,info.x+side*1.1,z,info.x+side*.80,z);for(const dz of [-.82,.82]){const c=chair(root,0,0,dz>0?Math.PI:0,info.color);c.scale.setScalar(.78);move(p,c,info.x+side*1.1,z+dz,info.x+side*.8,z+dz,dz>0?Math.PI:0);}}const screen=box(root,'proposed_resource_prompt',.95,.35,.07,info.x,1.13,z-.3,info.color);p.activeObjects.push(screen);}
  else if(info.n===3){const old=floor.furniture.children.find(g=>g.userData.zone==='西侧展区');if(old)p.replaced.push(old);for(let i=0;i<4;i++){const xx=-6+i*4,tx=i<2?-4.6+(i%2)*1.9:2.7+(i%2)*1.9;const t=table(root,0,0,1.8,.78);move(p,t,xx,20,tx,20);for(const dz of [-.95,.95]){const c=chair(root,0,0,dz>0?Math.PI:0,info.color);c.scale.setScalar(.85);move(p,c,xx,20+dz,tx,20+dz,dz>0?Math.PI:0);}}for(const x of [-7,0,7]){const board=group(root,'proposed_mobile_exhibition_board');box(board,'board',2.2,1.5,.10,0,1.1,0,'#b4c6b5');box(board,'graphic',1.95,1.1,.04,0,1.18,-.08,'#b9a383');move(p,board,x,18.7,x,21.7);}}
  else{for(const x of [-10,-5,0,5,10])for(const z of [-18,-12,-7]){const marker=box(root,'proposed_quiet_seat_prompt',2.3,.05,.18,x,.97,z-.42,x===0?'#c39e4b':'#739b68');marker.userData.reserved=x===0;p.activeObjects.push(marker);}}
  p.apply=t=>{for(const m of p.moving){m.object.position.lerpVectors(m.read,m.active,t);m.object.rotation.y=m.readRot+(m.activeRot-m.readRot)*t;}for(const a of p.activeObjects)a.visible=t>.4;};p.apply(0);pilots.push(p);
 }
 return pilots;
}
