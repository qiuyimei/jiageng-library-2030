from pathlib import Path
import json
H=Path(__file__).parent
p=H/'content.py';t=p.read_text(encoding='utf-8').replace("MANUAL.append(('23 建筑页面", "MANUAL.append(('20 建筑页面")
p.write_text(t,encoding='utf-8')
p=H/'make_documents.py';t=p.read_text(encoding='utf-8').replace("'20 核心函数速查'","'21 核心函数速查'").replace("'21 完整核心源码及阅读注释'","'22 完整核心源码及阅读注释'").replace("'22 三维与其余源码的阅读索引'","'23 三维与其余源码的阅读索引'")
p.write_text(t,encoding='utf-8')
p=H/'deck_build/build_deck.mjs';t=p.read_text(encoding='utf-8').replace('spec.body.length===5?88:102','spec.body.length===5?83:102')
t=t.replace('核心是选座，三维辅助理解位置。','核心是平面选座，建筑展示使用独立页面；三维辅助定位需要时在选座页下方展开。')
p.write_text(t,encoding='utf-8')
p=H/'package_current.py';t=p.read_text(encoding='utf-8').replace('3. 三维可选','3. 建筑展示与平面选座分为两个页面；建筑页点选区域聚焦、返回上一视角或展开画面，细节收在更多展示选项；选座页三维按需在下方展开，收起即卸载。厕所已扩大，字号不变。三维可选')
p.write_text(t,encoding='utf-8')
p=H/'model.js';t=p.read_text(encoding='utf-8').replace("'五层选座总览'","'五层空间总览'")
p.write_text(t,encoding='utf-8')
# 更新相对位置核对，明确上层增加的是未测绘示意外形。
scene=json.loads((H/'scene-check.json').read_text(encoding='utf-8'))
p=H/'terminal-placement-check.json';d=json.loads(p.read_text(encoding='utf-8'));d.update(date='2026-10-17',ground_ends_at_core=True,upper_continues_behind_same_shaft=True,floor_extents=[r['bounds'] for r in scene['placement_checks']],toilets_enlarged_schematic=True,architecture_and_seat_pages_separated=True,point_focus_and_wide_view=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
print('FINISHED SOURCES')
