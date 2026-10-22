// 第一人称漫游的空间约束。只移动相机，不创建人物，也不更改任何座位状态。
import {FLOOR_HEIGHT,STAIR_LAYOUT,atriumVoids,GROUND_LAYOUT,TRANSPORT_CORE,floorBounds} from './spatial.js';
export const EYE_HEIGHT=1.65;
export const WALK_RADIUS=.20;
// 浏览器和离线几何验证共用障碍名；包围盒来自最终摆放的真实对象。
export const WALK_OBSTACLE_NAMES=new Set(['reading_desk','chair','table','guide_book_rack','upper_toilet','seminar_wall','seminar_lintel','upper_rear_wall_lockers','photo_red_wood_service_counter','photo_white_storage_lockers','ceramic_tree_display','armillary_display','photo_information_kiosk','photo_abstract_wood_sculpture','photo_white_lounge_sofas','photo_exhibition_potted_plant','photo_blue_exhibition_board','white_atrium_column','photo_atrium_granite_pilaster','third_floor_low_stone_exhibit_edge','compact_storage_cabinet','schematic_printer','user_elevator_landing','ground_nonlibrary_boundary_wall','ground_wood_sofa','ground_small_display_shelf','ground_toilet','transport_core_white_wall','transport_core_stone_dado','transport_core_dark_skirt']);
export function collectWalkObstacles(root,Box3){
 root.updateMatrixWorld(true);const out=[];
 root.traverse(o=>{if(WALK_OBSTACLE_NAMES.has(o.name)||o.name.startsWith('reading_chair_')){const b=new Box3().setFromObject(o);out.push({name:o.name,minX:b.min.x,maxX:b.max.x,minY:b.min.y,maxY:b.max.y,minZ:b.min.z,maxZ:b.max.z});}});
 return out;
}
// 咖啡厅家具没有选座编号，仍参与漫游碰撞；不能从桌椅和吧台中穿过。
for(const name of ['cafe_partition_wall','cafe_service_counter','cafe_reading_table','cafe_chair'])WALK_OBSTACLE_NAMES.add(name);
// 有房号的房间按墙段和门洞阻挡，不用整块包围盒封住研讨室；106工作室不提供选座数据。
for(const name of ['ground_room_wall','ground_room_lintel','staff_work_desk','ground_partition_wall','ground_partition_skirt','ground_receiving_wood_table','receiving_book_shelf'])WALK_OBSTACLE_NAMES.add(name);
export function walkEntry(floor){
 // 入口放在公共过道，不落在桌椅、挑空或展品里。楼层按钮可直接定位。
 return {x:floor===1?7.5:7.0,z:floor===1?GROUND_LAYOUT.frontZ-3:18.0,y:(floor-1)*FLOOR_HEIGHT+.15,floor};
}
export function walkStairEntry(floor){
 // 上一段梯的终点后退半步就是本层下楼口，Y仍在本层楼面。
 // 相机面向+Z后，前进即可沿该段普通梯下行，不穿展品退台或扶梯。
 if(floor<2)return null;
 return {x:4.65,z:STAIR_LAYOUT[floor-1].end-.45,y:(floor-1)*FLOOR_HEIGHT+.15,floor};
}
export function walkSurface(x,z,feetY){
 // 先用全馆外框做快速排除，随后按脚底所在楼层检查该层边界。
 if(x < floorBounds(3).left+.7||x>floorBounds(3).right-.7||z < floorBounds(3).back+.4||z>GROUND_LAYOUT.frontZ-.3)return null;
 const stairs=[];
 // 白墙交通区的折返梯与普通中庭梯独立计算；两段半层高度由同一个共享配置生成。
 const cs=TRANSPORT_CORE.stair,run=cs.front-cs.back;
 for(let floor=TRANSPORT_CORE.minFloor;floor<5;floor++){
  const base=(floor-1)*FLOOR_HEIGHT+.15;let y=null;
  if(z>=cs.back&&z<=cs.front){
   if(Math.abs(x-cs.leftX)<=cs.width/2-WALK_RADIUS)y=base+(cs.front-z)/run*FLOOR_HEIGHT/2;
   if(Math.abs(x-cs.rightX)<=cs.width/2-WALK_RADIUS)y=base+FLOOR_HEIGHT/2+(z-cs.back)/run*FLOOR_HEIGHT/2;
  }else if(z<cs.back&&z>=cs.landingBack+.05&&x>=cs.leftX-.5&&x<=cs.rightX+.5)y=base+FLOOR_HEIGHT/2;
  if(y!==null&&Math.abs(y-feetY)<.48)stairs.push({y,floor:Math.min(5,Math.floor((y-.15+.01)/FLOOR_HEIGHT)+1),onStairs:true});
 }
 for(const [level,c] of Object.entries(STAIR_LAYOUT)){
  const floor=Number(level),base=(floor-1)*FLOOR_HEIGHT+.15;
  // 步行仅走普通梯；扶梯和中央展陈退台只展示外形。
  if(Math.abs(Math.abs(x)-4.65)>.52||z<c.end||z>c.start)continue;
  const y=base+(c.start-z)/(c.start-c.end)*FLOOR_HEIGHT;
  if(Math.abs(y-feetY)<.48)stairs.push({y,floor:Math.min(5,Math.floor((y-.15+.01)/FLOOR_HEIGHT)+1),onStairs:true});
 }
 if(stairs.length)return stairs.sort((a,b)=>Math.abs(a.y-feetY)-Math.abs(b.y-feetY))[0];
 const surfaces=[];
 for(let floor=1;floor<=5;floor++){
  const y=(floor-1)*FLOOR_HEIGHT+.15;if(Math.abs(y-feetY)>.36)continue;
  const b=floorBounds(floor);
  if(x<b.left+.7||x>b.right-.7||z<b.back+.4||z>b.front-.3)continue;
  // 一楼电梯后方属于别的建筑，示意漫游停在本馆边界前。
  if(floor===1&&x>TRANSPORT_CORE.left-.3&&z<GROUND_LAYOUT.rightBoundaryZ)continue;
  // 三楼出口放在实体楼板上；不以虚拟平台覆盖楼梯孔洞。
  if(atriumVoids(floor).some(h=>Math.abs(x-h.x)<h.w/2+WALK_RADIUS&&z>h.back+.001&&z<h.front-.001))continue;
  // 退台是展品陈列基础，不能作为平地穿过去。
  if(floor===2&&Math.abs(x)<3.85&&z>=2&&z<=9.5)continue;
  surfaces.push({y,floor,onStairs:false});
 }
 return surfaces[0]||null;
}
export function walkBlocked(x,z,y,obstacles=[]){
 return obstacles.some(b=>y+.25<b.maxY&&y+EYE_HEIGHT>b.minY&&x>b.minX-WALK_RADIUS&&x<b.maxX+WALK_RADIUS&&z>b.minZ-WALK_RADIUS&&z<b.maxZ+WALK_RADIUS);
}
export function advanceWalk(position,dx,dz,obstacles=[]){
 // 分小步检查，避免低帧率时一步跨过桌子或护栏；碰到障碍可沿边滑动。
 let p={...position};const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));
 function tryAxis(x,z){const s=walkSurface(x,z,p.y);if(s&&!walkBlocked(x,z,s.y,obstacles))p={x,z,...s};}
 for(let i=0;i<steps;i++){
  tryAxis(p.x+dx/steps,p.z); // 先尝试左右移动；若被挡住，保留当前位置。
  tryAxis(p.x,p.z+dz/steps); // 再尝试前后移动，所以墙边仍可沿另一个方向滑动。
 }
 return p;
}
