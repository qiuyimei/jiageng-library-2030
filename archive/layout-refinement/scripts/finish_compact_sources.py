from pathlib import Path
H=Path(__file__).parent
def edit(name,changes):
 p=H/name;t=p.read_text(encoding='utf-8')
 for a,b in changes:
  assert a in t,(name,a[:80]);t=t.replace(a,b)
 p.write_text(t,encoding='utf-8')
edit('content.py',[
 ('三维页默认隐藏选座信息图层；从平面页接入同一会话后，才显式显示对应的模拟状态。','三维页默认隐藏选座状态图层，单层默认显示南1、南2、北1、北2等小标签；从平面页接入同一会话后，才显式显示对应的模拟状态。'),
 ('同一井道在这些楼层处于纵深中段。','电梯井道和门前点维持已确认的位置，不再为了让它处于数学中点而过度补长。'),
 ('新增长度和面积均没有测绘依据，正式部署必须换成授权楼层图与逐座数据。','上层后区已按本人修订缩短，电梯外形沿墙加宽而井道及门前点不动。seatLabel把内部S主键转为每层南1至南6、北1至北6的显示名，表格、平面、模型标签、候选和任务卡一致；真实南北座号位置仍待核对。新增长度和面积均没有测绘依据，正式部署必须换成授权楼层图与逐座数据。')])
with (H/'content.py').open('a',encoding='utf-8') as f:f.write("\nFUNCTION_GUIDE.update({'seatLabel':'把稳定内部S主键转为南/北显示编号，可附加楼层；不改变预约、状态和路径，也不代表取得真实逐座坐标。'})\n")
edit('dom-test.cjs',[("assert.equal(boardButtons().length,60);", "assert.equal(boardButtons().length,60);assert.ok(boardButtons().every(b=>/^[南北][1-6]$/.test(b.children[1].textContent)));assert.ok(!ids.route.textContent.includes('S4-'));" )])
edit('spatial-tests.js',[("seatPosition,mapPosition,", "seatPosition,seatLabel,mapPosition,"),
 ("const bounds=floorBounds(f);", "assert.equal(new Set(seats.map(s=>seatLabel(s))).size,12);assert.equal(seatLabel(seats[0]),'南1');assert.equal(seatLabel(seats[6]),'北1');assert.equal(seats[0].id,'S'+f+'-01');\n   const bounds=floorBounds(f);")])
edit('model.js',[("wideExpanded,showInformation,focusTarget", "wideExpanded,showInformation,labelOn,focusTarget")])
edit('model-controls-test.cjs',[("assert.ok(suns[0].shadow.camera.right>80)", "assert.ok(suns[0].shadow.camera.right>60&&suns[0].shadow.camera.right<75)"),
 ("buttons[1].onclick();ids.top.onclick();step();previousEye=", "buttons[1].onclick();ids.top.onclick();step();assert.equal(window.zhizuoModel.getState().labelOn,true);assert.ok(ids.labels.children.some(e=>/^[南北][1-6]/.test(e.textContent||'')));previousEye=")])
(H/'qa_compact_20261017').mkdir(exist_ok=True)
print('缩短后区和南北标签的代码及说明已完成')
