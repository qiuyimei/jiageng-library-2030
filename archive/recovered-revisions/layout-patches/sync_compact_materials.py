"""把显示名带入展示材料，保留内部主键用于计算与核对。"""
from pathlib import Path
import json,hashlib
H=Path(__file__).parent
def edit(name,changes):
 p=H/name;t=p.read_text(encoding='utf-8')
 for a,b in changes:
  assert a in t,(name,a[:100]);t=t.replace(a,b)
 p.write_text(t,encoding='utf-8')
edit('export_states.js',[
 ('seatPosition,nodePosition','seatPosition,nodePosition,seatLabel'),
 ('for(const item of plan.items)item.seat.modelPosition=seatPosition(item.seat);', 'for(const s of d.seats)s.displayName=seatLabel(s);\n for(const item of plan.items)item.seat.modelPosition=seatPosition(item.seat);')])
edit('make_visuals.py',[
 ('S4-01模拟预约记录','4F · 南1模拟预约记录'),
 ("item['seat']['id']}","item['seat']['displayName']}"),
 ("+item['seat']['id']+' · '","+item['seat']['displayName']+' · '")])
edit('make_service_materials.py',[("s['id'],size,width=cw-18", "s['displayName'],size,width=cw-18")])
edit('deck_build/build_deck.mjs',[
 ("i.seat.id+'  '+i.seat.floor+'F'", "i.seat.displayName+'  '+i.seat.floor+'F'"),
 ("final-viewer-20261017", "final-compact-labels-20261017"),
 (".codex-finalizer-viewer-20261017", ".codex-finalizer-compact-labels-20261017")])
# 本轮仅变更过的页需要重新审阅；基线是上一轮实际审阅完成的图像。
base={str(p.relative_to(H/'qa')):hashlib.sha256(p.read_bytes()).hexdigest() for p in (H/'qa').glob('*/page-*.png')}
(H/'compact-page-baseline.json').write_text(json.dumps(base,ensure_ascii=False),encoding='utf-8')
base={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (H/'deck_build/renders').glob('slide-*.png')}
(H/'compact-slide-baseline.json').write_text(json.dumps(base),encoding='utf-8')
for name in ['review_rear_depth.py','review_document_pages.py','prepare_final_rear_qa.py','sync_axis_presentation.py','package_current.py','finish_viewer_delivery.py','finish_rear_details.py']:
 p=H/name;t=p.read_text(encoding='utf-8').replace('qa_viewer_20261017','qa_compact_20261017').replace('viewer-page-baseline.json','compact-page-baseline.json').replace('viewer-slide-baseline.json','compact-slide-baseline.json').replace('viewer-slide-review.json','compact-slide-review.json').replace('final-viewer-20261017','final-compact-labels-20261017').replace('.codex-finalizer-viewer-20261017','.codex-finalizer-compact-labels-20261017')
 p.write_text(t,encoding='utf-8')
edit('content.py',[
 ('建筑页默认隐藏选座信息图层；从平面页接入同一会话后，才显示对应的模拟状态。', '建筑页默认隐藏选座状态图层，但单层保留南1、南2、北1、北2等小标签；从平面页接入同一会话后，才显示对应的模拟状态。'),
 ('新增长度和面积均没有测绘依据，正式部署必须换成授权楼层图与逐座数据。', '上层后区已按本人修订缩短，电梯外形沿墙加宽而井道及门前点不动。南北标签使用seatLabel把内部主键转为显示名；60个样本每层南1至南6、北1至北6，尚未核对真实逐座位置。新增长度和面积均没有测绘依据，正式部署必须换成授权楼层图与逐座数据。')])
# 内存界面检查新增显示名约束，不修改已有稳定主键和总测试数。
edit('dom-test.cjs',[("assert.equal(boardButtons().length,60);", "assert.equal(boardButtons().length,60);assert.ok(boardButtons().every(b=>/^[南北][1-6]$/.test(b.children[1].textContent)));assert.ok(!ids.route.textContent.includes('S4-'));" )])
edit('spatial-tests.js',[("seatPosition,mapPosition,", "seatPosition,seatLabel,mapPosition,"),
 ("const bounds=floorBounds(f);", "assert.equal(new Set(seats.map(s=>seatLabel(s))).size,12);assert.equal(seatLabel(seats[0]),'南1');assert.equal(seatLabel(seats[6]),'北1');assert.equal(seats[0].id,'S'+f+'-01');\n   const bounds=floorBounds(f);")])
edit('model.js',[("wideExpanded,showInformation,focusTarget", "wideExpanded,showInformation,labelOn,focusTarget")])
(H/'qa_compact_20261017').mkdir(exist_ok=True)
print('展示材料、学习文档和新审阅基线已准备')
