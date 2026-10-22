from pathlib import Path
H=Path(__file__).parent
def change(name,a,b):
 p=H/name;t=p.read_text(encoding='utf-8');assert a in t,(name,a[:80]);p.write_text(t.replace(a,b),encoding='utf-8')
change('spatial-tests.js','seatPosition,seatLabel,mapPosition,','seatPosition,seatLabel,seatRegionAt,mapPosition,')
change('spatial-tests.js',"assert.equal(new Set(seats.map(s=>seatLabel(s))).size,12);assert.equal(seatLabel(seats[0]),'南1');assert.equal(seatLabel(seats[6]),'北1');assert.equal(seats[0].id,'S'+f+'-01');", "assert.equal(new Set(seats.map(s=>seatLabel(s))).size,12);for(const s of seats){const p=seatPosition(s);assert.ok(seatLabel(s).startsWith(seatRegionAt(p.x,p.z,f)));}if(f>1)assert.deepEqual([...new Set(seats.map(s=>seatLabel(s)[0]))].sort(),['东','北','南'].sort());assert.equal(seats[0].id,'S'+f+'-01');")
change('dom-test.cjs','/^[南北][1-6]$/','/^[北南东][1-9]\\d*$/')
change('model-dom-test.cjs','/4F · [南北][1-6]/','/4F · [北南东][1-9]\\d*/')
change('model-dom-test.cjs',"const {makeData}=await import('./data.js'),d=", "const {seatLabel}=await import('./spatial.js');const {makeData}=await import('./data.js'),d=")
change('model-dom-test.cjs',"assert.match(ids.selectionTitle.textContent,/4F · 北3/)","assert.ok(ids.selectionTitle.textContent.startsWith(seatLabel('S4-09',true)))")
change('model-controls-test.cjs','/^[南北][1-6]/','/^[北南东][1-9]\\d*/')
change('template.html','60个模拟椅位按南1、南2、北1、北2等样式显示，南北分区与真实座号坐标仍待核对，表格不是全馆真实平面。','60个模拟状态样本使用北、南、东编号，方向为左北、右南、上东；模型编号与真实逐座坐标仍待核对，表格不是全馆真实平面。')
change('model-template.html','选择楼层，点击地面或家具即可聚焦。拖动旋转，滚轮缩放。','选择楼层，点击地面或家具即可聚焦。拖动旋转，滚轮缩放。平面固定方向：左北、右南、上东。')
change('content.py','seatLabel把内部S主键转为每层南1至南6、北1至北6的显示名，表格、平面、模型标签、候选和任务卡一致；真实南北座号位置仍待核对。','seatLabel按模型椅位生成方向编号：左翼北、右翼南、电梯后方的上方区域东。编号覆盖模型外形座位，但只有60个位置有模拟占用状态；二至五楼的状态样本各取北、南、东4个。一楼保留窗边12个样本，固定专座只有外形与资格说明。模型标签、座位表、候选、路线和任务卡共用名称，真实逐座编号仍待核对。')
change('content.py','在二至五楼纵深中段','在二至五楼仍有后方空间')
with (H/'content.py').open('a',encoding='utf-8') as f:f.write("\nFUNCTION_GUIDE.update({'seatRegionAt':'按固定平面方向确定北、南、东；此边界是模型分区，不是实测座位分区表。','floorSeatRecords':'遍历同一层全部桌旁椅位，按方向和坐标排序生成示意编号并缓存；外形座位不会因此获得占用状态。','physicalSeatLabel':'按模型椅子坐标查询同一显示名，供实体桌牌和近景标签共用。'})\n")
change('make_service_materials.py','按编号列出五层60个样本；真实空间位置另由平面和三维表达','北、南、东编号与位置联动；60个模拟状态样本，不是全馆实际座号表')
# 更新复制源和交付日期；不要再运行旧的布局修改脚本。
for name in ['package_current.py','record_final_review_20261015.py','check_upper_delivery.py','finish_viewer_delivery.py']:
 p=H/name;t=p.read_text(encoding='utf-8').replace('2026-10-17','2026-10-18');p.write_text(t,encoding='utf-8')
change('finish_viewer_delivery.py',"r['scene_source_sha256']=", "r['floor_extents']=[v['bounds'] for v in json.loads((H/'scene-check.json').read_text(encoding='utf-8'))['placement_checks']]\nr['label_orientation']='左北、右南、上东；模型方向编号，非真实座号对照'\nr['scene_source_sha256']=")
print('方向编号、两面书架与穿模修复的检查和资料源已同步')
