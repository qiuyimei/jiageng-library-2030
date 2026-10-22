"""上层缩短、电梯外形及南北显示名同步；内部座位主键保持不变。"""
from pathlib import Path
H=Path(__file__).parent
def edit(name,changes):
 p=H/name;t=p.read_text(encoding='utf-8')
 for a,b in changes:
  assert a in t,(name,a[:100]);t=t.replace(a,b)
 p.write_text(t,encoding='utf-8')
edit('app.js',[
 ('nodePosition,routePoints,readableNode,','nodePosition,routePoints,readableNode,seatLabel,'),
 ('${seat.id} ${rank?', '${seatLabel(seat,true)} ${rank?'),
 ("'text-anchor':'middle'},seat.id)","'text-anchor':'middle'},seatLabel(seat))"),
 ("el('span',seat.id)","el('span',seatLabel(seat))"),
 ('`${seat.id} · ${STATE', '`${seatLabel(seat,true)} · ${STATE'),
 ('${index+1}. ${item.seat.id} · ${item.seat.floor}F','${index+1}. ${seatLabel(item.seat,true)}'),
 ('${i.seat.id} ${i.seat.floor}F','${seatLabel(i.seat,true)}'),
 ("x:ox+(ELEVATOR_LAYOUT.x-1.35)*xs,y:oy+(ELEVATOR_LAYOUT.z-1.4)*ys,width:2.7*xs,height:2.8*ys", "x:ox+(ELEVATOR_LAYOUT.x-1.4)*xs,y:oy+(ELEVATOR_LAYOUT.z-ELEVATOR_LAYOUT.facadeOffset-1.35*ELEVATOR_LAYOUT.facadeScale)*ys,width:2.8*xs,height:2.7*ELEVATOR_LAYOUT.facadeScale*ys")])
edit('model.js',[
 ('seatPosition,nodePosition,readableNode,','seatPosition,nodePosition,readableNode,seatLabel,'),
 ('`${s.id} · ${STATE','`${seatLabel(s,true)} · ${STATE'),
 ("b.textContent=i.seat.id+' · '+i.seat.floor+'F'","b.textContent=seatLabel(i.seat,true)"),
 ('showFurniture=true,labelOn=false,','showFurniture=true,labelOn=true,'),
 ('showInformation=linked;labelOn=linked;', 'showInformation=linked;labelOn=true;'),
 ("$('labelToggle').checked=linked", "$('labelToggle').checked=true"),
 ('showInformation=false;labelOn=false;showRoof=false;', 'showInformation=false;labelOn=true;showRoof=false;'),
 ("for(const s of data.seats.filter(s=>!floor||s.floor===floor))", "for(const s of data.seats.filter(s=>floor&&s.floor===floor))"),
 ("text:s.id+(plan.items.find(i=>i.seat.id===s.id)?.rank?' · 第'+plan.items.find(i=>i.seat.id===s.id).rank+'优先':'')+(s.id===selected?' · 已选':'')", "text:seatLabel(s)+(showInformation&&plan.items.find(i=>i.seat.id===s.id)?.rank?' · 第'+plan.items.find(i=>i.seat.id===s.id).rank+'优先':'')+(showInformation&&s.id===selected?' · 已选':'')"),
 ("color:STATE[classify(s,Date.now()).kind].color", "color:showInformation?STATE[classify(s,Date.now()).kind].color:'#637866'"),
 ("for(const g of layer.resources.children)if(g.visible)", "for(const g of layer.resources.children)if(showInformation&&g.visible)"),
 ("if(floor&&showFurniture)for(const z", "if(!floor)for(let n=1;n<=5;n++)entries.push({text:n+'F',p:new THREE.Vector3(0,height(n)+2,22),color:'#637866'});\n     if(floor&&showFurniture)for(const z")])
# 让按钮从校园逐步进入馆内，再给全景与自己走；展开/返回是辅助操作。
p=H/'model-template.html';t=p.read_text(encoding='utf-8')
start=t.index('<div class="viewer-toolbar">');end=t.index('</div>',start)+6
t=t[:start]+'''<div class="viewer-toolbar"><button id="campus">校园楼群</button><button id="rear">图书馆外观</button><button id="cut">空间模型</button><button id="top">平面俯瞰</button><button id="resetView">全景</button><button id="walkToggle" aria-pressed="false">自己走</button><button id="wideView">展开画面</button><button id="focusBack" disabled>返回上一视角</button></div>'''+t[end:]
t=t.replace('id="labelToggle" type="checkbox">编号与分区文字','id="labelToggle" type="checkbox" checked>座位小标签')
p.write_text(t,encoding='utf-8')
edit('walk-tests.js',[("assert.ok(floorBounds(floor).back<TRANSPORT_CORE.back-50)","assert.ok(floorBounds(floor).back<TRANSPORT_CORE.back-20);assert.ok(floorBounds(floor).back>TRANSPORT_CORE.back-35)")])
edit('scene-export.js',[("assert.ok(Math.abs((floorBounds(f).back+floorBounds(f).front)/2-ELEVATOR_LAYOUT.z)<.01,'上层井道位于纵深中段且后方有空间')", "assert.ok(TRANSPORT_CORE.back-floorBounds(f).back>20&&TRANSPORT_CORE.back-floorBounds(f).back<35,'上层保留有限后区，电梯位置固定，不再按数学中点无限补长')")])
edit('content.py',[("上层back=-123.4","上层back=-78.6"),("上层还有连续后部空间；不是对实际面积", "上层还有较短的连续后部空间；不是对实际面积")])
edit('template.html',[("60个模拟椅位按编号排列，表格不是全馆真实平面。", "60个模拟椅位按南1、南2、北1、北2等样式显示，南北分区与真实座号坐标仍待核对，表格不是全馆真实平面。")])
print('上层范围、加宽电梯、南北显示名、标签及按钮顺序已同步')
