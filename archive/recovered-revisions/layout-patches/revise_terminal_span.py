"""后部交通区从专座后方横向贯通到右墙，电梯和楼梯分别占两端。"""
from pathlib import Path
H=Path(__file__).parent
def change(name,old,new):
 p=H/name;t=p.read_text(encoding='utf-8');assert old in t,(name,old[:80]);p.write_text(t.replace(old,new),encoding='utf-8')
change('spatial.js','ELEVATOR_LAYOUT={x:24.6,z:-44.7,landing:{x:26.7,z:-44.7},groundRotation:Math.PI/2,groundLanding:{x:26.7,z:-44.7}}','ELEVATOR_LAYOUT={x:13.9,z:-44.7,landing:{x:16,z:-44.7},groundRotation:Math.PI/2,groundLanding:{x:16,z:-44.7}}')
change('spatial.js','TRANSPORT_CORE={minFloor:1,left:23.05','TRANSPORT_CORE={minFloor:1,left:10.7')
change('spatial.js','{x:26.7,z:-43','{x:16,z:-43')
change('spatial.js','{x:26.7,z:-50.1','{x:16,z:-50.1')
change('spatial.js','corridorX:26.7','corridorX:16')
change('spatial.js','// 电梯靠专座一侧、楼梯靠外墙一侧，末端共用一块白墙交通区，外围留通道。','// 末端交通区从专座区的左边线x=10.7横向接至右墙x=34.2：电梯在x=13.9，楼梯在最右端。\n// 两者共用一整块白墙交通空间；不是把电梯和楼梯都塞在右墙旁的小盒子里。')
change('spatial-tests.js',"TRANSPORT_CORE.left>20,'侧边交通区与中庭梯保留独立距离'", "TRANSPORT_CORE.left-6.2>=4,'后部交通区仍与中庭梯保留独立距离'")
change('scene-export.js',"TRANSPORT_CORE.left>20,'侧墙交通区不得与中庭楼梯相连'", "TRANSPORT_CORE.left-6.2>=4,'后部交通区不得与中庭楼梯相连'")
change('scene-export.js',"for(let i=0;i<2220;i++)q=advanceWalk(q,0,-.03,obstacles);assert.ok(q.z<-48,'左右加宽翼部连续过道必须可走：'+floor+'/'+side);", "for(let i=0;i<1950;i++)q=advanceWalk(q,0,-.03,obstacles);if(side>0){assert.ok(q.z<TRANSPORT_CORE.front+1.5,'右翼应接到后部交通区前');q.z=TRANSPORT_CORE.approach.z;for(const target of [{x:TRANSPORT_CORE.entry.x,z:q.z},{x:TRANSPORT_CORE.entry.x,z:TRANSPORT_CORE.back-.6}]){const dx=target.x-q.x,dz=target.z-q.z,n=Math.ceil(Math.hypot(dx,dz)/.03);for(let i=0;i<n;i++)q=advanceWalk(q,dx/n,dz/n,obstacles);assert.ok(Math.hypot(q.x-target.x,q.z-target.z)<.04,'右翼经过完整交通区两端开口到后沿');}}assert.ok(q.z<-48,'左右加宽翼部连续过道必须可走：'+floor+'/'+side);")
change('scene-export.js',"assert.ok(ELEVATOR_LAYOUT.x<TRANSPORT_CORE.stair.leftX,'靠专座侧为电梯，靠外墙侧为楼梯');", "assert.equal(TRANSPORT_CORE.left,GROUND_LAYOUT.dedicated.x-GROUND_LAYOUT.dedicated.w/2,'交通区横跨专座后方到侧墙');\nassert.equal(ELEVATOR_LAYOUT.x,GROUND_LAYOUT.dedicated.x,'电梯须在专座后方这一端');\nassert.ok(TRANSPORT_CORE.stair.leftX>ELEVATOR_LAYOUT.x+10,'靠外墙端为楼梯，两者不能挤成同侧小盒子');")
# 检查右翼纵向走廊接入横向交通区，再从其后门到达后沿。
change('scene-export.js',"for(let i=0;i<2400;i++)rightRear=advanceWalk(rightRear,0,-.03,obstacles);\nassert.ok(rightRear.z<-50,'新增右翼应有从大厅贯通后沿的走廊');", "for(let i=0;i<2050;i++)rightRear=advanceWalk(rightRear,0,-.03,obstacles);\nassert.ok(rightRear.z<TRANSPORT_CORE.front+1.5,'新增右翼须接到横向交通区前方');\nrightRear.z=TRANSPORT_CORE.approach.z;\nfor(const target of [{x:TRANSPORT_CORE.entry.x,z:rightRear.z},{x:TRANSPORT_CORE.entry.x,z:TRANSPORT_CORE.back-.6}]){const dx=target.x-rightRear.x,dz=target.z-rightRear.z,n=Math.ceil(Math.hypot(dx,dz)/.03);for(let i=0;i<n;i++)rightRear=advanceWalk(rightRear,dx/n,dz/n,obstacles);assert.ok(Math.hypot(rightRear.x-target.x,rightRear.z-target.z)<.04,'从专座旁接入末端交通区并贯通后沿');}")
change('content.py','交通区left=23.05、right=34.2','交通区left=10.7、right=34.2')
change('content.py','电梯井道x=24.6','电梯井道x=13.9')
change('content.py','前门x=26.7','前门x=16')
change('content.py','末端交通区电梯靠专座侧、楼梯靠外墙侧；后部留横向通路。','末端交通区从专座后方横跨至右侧墙，电梯位于专座这一端，楼梯位于右墙那一端，中间保留通行空间。')
for name in ['model.js','photo-reference.js','package_current.py','check_upper_delivery.py','record_final_review_20261015.py','deck_build/build_deck.mjs']:
 p=H/name;t=p.read_text(encoding='utf-8').replace('电梯靠专座侧、楼梯靠右墙侧','交通区横跨专座后方至右墙，电梯在专座端、楼梯在右墙端').replace('末端电梯门前两端可通行','后部交通区横跨专座后方至右墙，电梯在专座端、楼梯在右墙端，门前两端可通行')
 if name=='deck_build/build_deck.mjs':t=t.replace('final-rear-depth','final-terminal-span').replace('.codex-finalizer-rear-depth','.codex-finalizer-terminal-span')
 p.write_text(t,encoding='utf-8')
print('TERMINAL CORE SPANS DEDICATED DESKS TO RIGHT WALL')
