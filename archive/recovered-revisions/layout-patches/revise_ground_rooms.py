"""同步本轮本人现场补充；不触及发布或微信。"""
from pathlib import Path
H=Path(__file__).parent
def replace(name, pairs):
 p=H/name;t=p.read_text(encoding='utf-8')
 for a,b in pairs:
  if a in t:t=t.replace(a,b)
  else:assert b in t,(name,a)
 p.write_text(t,encoding='utf-8')
replace('scene-export.js',[
 ("assert.equal(names.includes('lower_escalator_ribbed_step'),lower);","assert.equal(names.includes('lower_escalator_ribbed_step'),f.info.n===1);"),
 ("assert.equal(cabinets.length,28);","assert.equal(cabinets.length,GROUND_LAYOUT.compactBlocks.reduce((n,b)=>n+Math.floor(b.d/6)*4,0));"),
 ("assert.equal(rowZ.size,5);","assert.equal(rowZ.size,10);"),
 ("assert.ok(lift.position.x<GROUND_LAYOUT.dedicated.x,'电梯位于专座后方偏左');","assert.ok(GROUND_LAYOUT.dedicated.x<GROUND_LAYOUT.cafe.x-GROUND_LAYOUT.cafe.w/2,'专座内移，咖啡厅占原右翼长条区域');"),
 ("lower_escalators:lower,","lower_escalators:f.info.n===1,"),
 ("assert.ok(GROUND_LAYOUT.cafe.x>0);","assert.ok(GROUND_LAYOUT.cafe.x>0);assert.ok(f.furniture.getObjectByName('ground_room_107'));assert.ok(f.furniture.getObjectByName('ground_room_106'));assert.equal(TRANSPORT_CORE.exits.length,2);assert.equal(core.getObjectsByProperty('name','transport_core_entry_lintel').length,2);"),
])
replace('spatial.js',[
 ('// 左侧沿纵向有五排；中心向前移3，使原有四排不动，仅在靠楼梯的前端增加第五排。','// 左侧柜群与窗边桌排一起向后补长；柜数只用于表现空间，不是现场资产清单。'),
 ('从交通区前侧门洞进入，不能把白墙整块当作可穿越的实体盒子。','门前走廊前后两端都开口，不能把白墙整块当作可穿越的实体盒子。'),
])
replace('photo-details.js',[
 ("const bands=[{x:-12.2,w:11.55},{x:12.2,w:11.55},{x:(b.left-18)/2,w:-18-b.left-.4},{x:(18+b.right)/2,w:b.right-18-.4}];", "const bands=[{x:-12.2,w:11.55},{x:12.2,w:11.55},{x:(b.left-18)/2,w:-18-b.left-.4},...(n===1?[{x:20.55,w:4.7},{x:28.65,w:10.9,back:GROUND_LAYOUT.rightBoundaryZ}]:[{x:(18+b.right)/2,w:b.right-18-.4}])];"),
 ("for(const band of bands){\n    box(g,'white_ceiling_tiles'", "for(const band of bands){\n    const back=band.back??b.back,depth=b.front-back-1,center=(b.front+back)/2;\n    box(g,'white_ceiling_tiles'"),
 ("for(let z=b.back+1;z<b.front;z++)box(g,'ceiling_tile_cross_joint'", "for(let z=back+1;z<b.front;z++)box(g,'ceiling_tile_cross_joint'"),
 ("for(let z=b.back+4;z<b.front-2;z+=8)", "for(let z=back+4;z<b.front-2;z+=8)"),
 ("const bands=[{x:-12.2,w:11.5},{x:12.2,w:11.5},{x:(b.left-18)/2,w:-18-b.left-.4},{x:(18+b.right)/2,w:b.right-18-.4}];", "const bands=[{x:-12.2,w:11.5},{x:12.2,w:11.5},{x:(b.left-18)/2,w:-18-b.left-.4},...(n===1?[{x:20.55,w:4.7},{x:28.65,w:10.9,back:GROUND_LAYOUT.rightBoundaryZ}]:[{x:(18+b.right)/2,w:b.right-18-.4}])];"),
 ("for(const band of bands){\n    for(let z=b.back+2;", "for(const band of bands){\n    const back=band.back??b.back,depth=b.front-back-1,center=(b.front+back)/2;\n    for(let z=back+2;"),
 ("for(let z=b.back+.8;z<b.front-4.1;z+=4.25){\n    box(g,'south_black_window_frame'", "const rightBack=n===1?GROUND_LAYOUT.rightBoundaryZ:b.back,rightDepth=b.front-rightBack-1;\n   for(let z=rightBack+.8;z<b.front-4.1;z+=4.25){\n    box(g,'south_black_window_frame'"),
 (".10,.065,depth,b.right-.1,y,center", ".10,.065,rightDepth,b.right-.1,y,(b.front+rightBack)/2"),
 ("for(let x=b.left+.8;x<b.right-4.1;x+=4.25)", "const rearRight=n===1?TRANSPORT_CORE.left:b.right;\n   for(let x=b.left+.8;x<rearRight-4.1;x+=4.25)"),
 ("b.right-b.left-1,.065,.10,(b.left+b.right)/2,y,b.back+.2", "rearRight-b.left-1,.065,.10,(b.left+rearRight)/2,y,b.back+.2"),
])
print('UPDATED ground rooms, two exits, extended left wing, 5F furniture and escalator scope')
