"""保留一楼末端交通区，用上层继续向后的公共空间表现同一井道在上层居中。"""
from pathlib import Path
H=Path(__file__).parent
def change(name,old,new):
 p=H/name;t=p.read_text(encoding='utf-8');assert old in t,(name,old[:90]);p.write_text(t.replace(old,new),encoding='utf-8')
change('spatial.js','groundBack:-52.6,upperBack:-52.6','groundBack:-52.6,upperBack:-123.4')
change('spatial.js','// 厕所逐层共用同一组坐标。','// 2026-10-17本人澄清：一楼在交通区后结束，上层继续向后。上层后沿用示意比例使共用井道落在纵深中段，不是实际长度或面积。\n// 厕所逐层共用同一组坐标。')
change('spatial.js',"const culture=floor===4?{x:b.right-5,z:-35.5", "const culture=floor===4?{x:b.right-5,z:b.back+5.5")
change('spatial.js',' const racks=[];',' const racks=[];\n // 上层电梯后方仍有连续馆藏；不把一楼末端误当成二至五楼末端。\n if(floor<5)for(let z=-55;z>floorBounds(floor).back+7;z-=8)for(const x of [-4.8,0,4.8])racks.push({x,z,w:3.5});\n if(floor<5)for(let z=-54;z>floorBounds(floor).back+22;z-=8)for(const x of [-31.4,31.4])racks.push({x,z,w:4.4});')
change('spatial.js','export function deskLayouts(floor){','''function extendedUpperDesks(floor,list){
 // 家具只是外形，不增加感知覆盖或真实座号。保留x=7.2和x=正负20.4的后部过道。
 const b=floorBounds(floor),culture=upperFacilities(floor).culture;
 for(let z=-55;z>b.back+5;z-=8)for(const x of (floor===5?[-25,-17,-9,-1,3.8,13,16.8,25,31]:[-23.7,-10.8,10.8,23.7])){
  const d={x,z,w:floor===5?3:5,d:1.65,dx:floor===5?.7:1.15,dz:floor===5?1.2:1.3,sample:null,partition:floor===5,rearExtension:true};
  if(culture&&Math.abs(d.x-culture.x)<(d.w+culture.w)/2+.7&&Math.abs(d.z-culture.z)<culture.d/2+d.dz+.8)continue;
  list.push(d);
 }
 return list;
}
export function deskLayouts(floor){''')
change('spatial.js','return list.filter(d=>!overlapsTransport(d));','return extendedUpperDesks(floor,list).filter(d=>!overlapsTransport(d));')
change('spatial.js','return list.filter(d=>!overlapsTransport(d)&&','return extendedUpperDesks(floor,list).filter(d=>!overlapsTransport(d)&&')
change('library-layout.js','const b=floorBounds(info.n),xs=[b.left,-18,-6.2,6.2,18,b.right],zs=[b.back+2,-40,-30,-20,-10,0,10,20,32];','const b=floorBounds(info.n),xs=[b.left,-18,-6.2,6.2,18,b.right],zs=[b.back+2,...[-110,-100,-90,-80,-70,-60].filter(z=>z>b.back),-50.6,-40,-30,-20,-10,0,10,20,32];')
change('walk-tests.js',"test('一楼左右延伸区域与上层同一后沿且均有地面',()=>{assert.equal(floorBounds(1).back,floorBounds(2).back);assert.equal(walkSurface(-31,-45,.15).floor,1);assert.equal(walkSurface(30,-27,.15).floor,1);for(let floor=2;floor<=5;floor++)assert.equal(walkSurface(7,-27,(floor-1)*FLOOR_HEIGHT+.15).floor,floor);});", "test('一楼在交通区结束，上层仍有完整后部空间',()=>{assert.ok(floorBounds(1).back>floorBounds(2).back);assert.equal(walkSurface(7,-70,.15),null);for(let floor=2;floor<=5;floor++){assert.equal(walkSurface(7,-70,(floor-1)*FLOOR_HEIGHT+.15).floor,floor);assert.ok(floorBounds(floor).back<TRANSPORT_CORE.back-50);}});")
# 原有连续通路核对扩展到上层新后沿，且绕行实际的交通区门洞，不能穿白墙。
change('scene-export.js',"side<0?[{x:q.x,z:-49.6}]:[{x:q.x,z:TRANSPORT_CORE.approach.z},{x:TRANSPORT_CORE.entry.x,z:TRANSPORT_CORE.approach.z},{x:TRANSPORT_CORE.entry.x,z:TRANSPORT_CORE.back-.6}]", "side<0?[{x:q.x,z:floorBounds(floor).back+3}]:[{x:q.x,z:TRANSPORT_CORE.approach.z},{x:TRANSPORT_CORE.entry.x,z:TRANSPORT_CORE.approach.z},{x:TRANSPORT_CORE.entry.x,z:TRANSPORT_CORE.back-2},{x:q.x,z:TRANSPORT_CORE.back-2},{x:q.x,z:floorBounds(floor).back+3}]")
change('scene-export.js',"for(let i=0;i<950;i++)q=advanceWalk(q,0,-.03,obstacles);assert.ok(q.z<-50", "for(let i=0;i<Math.ceil((-22-(floorBounds(floor).back+2))/.03);i++)q=advanceWalk(q,0,-.03,obstacles);assert.ok(q.z<floorBounds(floor).back+3")
change('scene-export.js',"assert.equal(GROUND_LAYOUT.rightBoundaryZ,floorBounds(1).back);", "assert.equal(GROUND_LAYOUT.rightBoundaryZ,floorBounds(1).back);\nassert.ok(floorBounds(1).back>floorBounds(2).back,'一楼范围小于上层');\nassert.ok(TRANSPORT_CORE.back-floorBounds(1).back<3,'一楼在交通区后结束');\nfor(let f=2;f<=5;f++)assert.ok(Math.abs((floorBounds(f).back+floorBounds(f).front)/2-ELEVATOR_LAYOUT.z)<.01,'上层井道位于纵深中段且后方有空间');")
print('GROUND UNCHANGED; UPPER REAR SPACE EXTENDED WITH SAME SHAFT')
