import * as THREE from 'three';
import {classify,STATE} from './engine.js';
import {seatPosition,nodePosition,routePoints} from './spatial.js';
// 在建筑模型上添加信息图层：彩色标记表示状态，不是拟建家具或新装设备。
export function buildSeatLayer(root,H,seats,now,plan,selected,expanded=false){
  const {group,cylinder,material,box}=H,markers=[],candidateIds=new Set(plan.items.map(i=>i.seat.id));
  for(const seat of seats){
    const p=seatPosition(seat,expanded),state=classify(seat,now),g=group(root,'state_'+seat.id);
    g.position.set(p.x,p.y,p.z);g.userData={seatId:seat.id,floor:seat.floor,state:state.kind};
    // 平面的圆盘与竖起的圆点让颜色在俯瞰、斜视和骨架模式中都容易辨认。
    cylinder(g,'status_disc',.6,.1,0,.08,0,STATE[state.kind].color);
    cylinder(g,'status_stem',.035,.75,0,.48,0,STATE[state.kind].color);
    cylinder(g,'status_dot',.22,.13,0,.95,0,STATE[state.kind].color);
    if(candidateIds.has(seat.id)||seat.id===selected){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(seat.id===selected?.88:.75,.085,8,32),material(seat.id===selected?'#d4a433':'#edf2e4'));
      ring.rotation.x=-Math.PI/2;ring.position.y=.18;ring.name='candidate_or_selection_ring';g.add(ring);
    }
    g.traverse(o=>o.userData.seatId=seat.id);markers.push(g);
  }
  const resources=group(root,'learning_task_points');
  for(const [node,color]of [[plan.source?.mode==='shelf'?plan.source.node:null,'#3c87aa'],['print','#956daf']]){
    if(!node||node==='print'&&!plan.prefs?.print)continue;
    const p=nodePosition(node,seats,expanded);if(!p)continue;
    const g=group(resources,'task_'+node);g.userData={floor:p.floor,node};g.position.set(p.x,p.y,p.z);
    box(g,'task_point',.85,.55,.85,0,.35,0,color);cylinder(g,'task_pole',.035,.9,0,.9,0,color);
  }
  // 只有当前仍在候选集中的选择才画任务路线；不为占用或未知座位保留过期路线。
  const item=plan.items.find(i=>i.seat.id===selected),route=group(root,'selected_task_route');
  if(item){
    const pts=routePoints(item.trip.path,seats,expanded);
    for(let i=1;i<pts.length;i++){
      const a=pts[i-1],b=pts[i],va=new THREE.Vector3(a.x,a.y+.2,a.z),vb=new THREE.Vector3(b.x,b.y+.2,b.z);
      if(va.distanceTo(vb)<.0001)continue;
      const m=new THREE.Mesh(new THREE.CylinderGeometry(.10,.10,va.distanceTo(vb),6),material('#d4a433'));
      m.position.copy(va).add(vb).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vb.clone().sub(va).normalize());
      m.name='graph_route_segment';m.userData={floors:[a.floor,b.floor]};route.add(m);
    }
  }
  return {markers,resources,route};
}
