"""用本人最新现场说明同步材料文字和检查记录；不会公开任何文件。"""
from pathlib import Path
import json,hashlib
H=Path(__file__).parent
baseline={str(p.relative_to(H/'qa')):hashlib.sha256(p.read_bytes()).hexdigest() for p in (H/'qa').rglob('page-*.png')}
(H/'rooms-reviewed-page-baseline.json').write_text(json.dumps(baseline),encoding='utf-8')
def edit(name,pairs):
 p=H/name;t=p.read_text(encoding='utf-8')
 for a,b in pairs:
  if a in t:t=t.replace(a,b)
  else:assert b in t,(name,a)
 p.write_text(t,encoding='utf-8')
edit('model.js',[("同时保留报刊书架、后墙存包柜", "同时保留报纸、现刊、过刊与外文书架、后墙存包柜")])
edit('photo-reference.js',[("两侧为无栏杆普通直梯和静态扶梯。一楼保留电脑前台", "二至三楼两侧只保留无栏杆普通直梯，扶梯仅在一至二楼。一楼保留电脑前台")])
edit('scene-export.js',[("schematic_compact_cabinets:28,left_compact_rows:5", "schematic_compact_cabinets:48,left_compact_rows:10"),
 ("lift_left_of_dedicated_center:true", "dedicated_desks_moved_inward:true,lift_hall_exits:2,rooms:['107研讨室','106工作人员室'],cafe_in_right_long_strip:true,extended_left_rear:true")])
edit('content.py',[
 ("一楼back=-22、front=34，上层back=-52.6、front=34。", "各层back=-52.6、front=34，一楼左侧桌排及柜库延长；右侧电梯之后的其他建筑从楼板轮廓与步行边界中排除。"),
 ("一楼后沿仍保留-22。", "一楼左后部现与上层纵深一致，右后非本馆区域仍不可走。"),
 ("一楼右侧咖啡厅表现实际功能，室内陈设仅为示意。", "一楼右前为107研讨室，后接长条咖啡厅，106工作人员室位于咖啡厅与电梯之间；打印及固定专座移向服务台后书库一侧。房号和相对关系由本人补充，陈设仅为示意。"),
 ("本轮按本人说明同步修改一楼的左右范围、窗边阅览、右侧专座和咖啡厅。", "本轮按本人说明同步修改一楼的纵深、窗边阅览、内移的专座与打印、107研讨室、咖啡厅及106工作人员室。"),
 ("交通区入口朝馆内前方走廊，沿柱饰外侧的完整通道接近电梯。", "电梯门前走廊前后两端均有门洞，沿柱饰外侧的完整通道接近电梯；两端开口指电梯厅而非轿厢复制双门。"),
 ("下部直梯与扶梯、上部普通梯", "下部直梯与仅一至二楼的扶梯、上部普通梯"),
 ("二至三楼才有弧形展陈小退台。", "二至三楼才有弧形展陈小退台，仅保留普通直梯，不设扶梯。"),
])
# 不能保留早先把二至三楼也写成有扶梯的句子。
p=H/'content.py';t=p.read_text(encoding='utf-8')
t=t.replace('一至三楼为灰黑色无栏杆直梯及静态扶梯', '一至二楼为灰黑色无栏杆直梯及静态扶梯，二至三楼仅有普通直梯')
t=t.replace('模型不编造正式房号、房间预约资格或接口；未知用途标功能房间带。','除本人提供的107研讨室、106工作人员室外，模型不编造正式房号、预约资格或接口；未知用途标功能房间带。')
p.write_text(t,encoding='utf-8')
edit('deck_build/build_deck.mjs',[
 ("一楼右侧补有咖啡厅。", "一楼右前107研讨室，之后长条咖啡厅和106工作人员室；打印与专座内移，电梯厅两端开口。"),
 (".codex-finalizer-axis", ".codex-finalizer-rooms"),("final-axis", "final-rooms")])
edit('sync_axis_presentation.py',[("final-axis/", "final-rooms/"),(".codex-finalizer-axis/", ".codex-finalizer-rooms/"),
 ("qa_axis_20261015", "qa_rooms_20261015"),
 ("陈设与尺寸为示意。\\n", "107位于右前，咖啡厅在其后长条区，106工作室夹在咖啡厅和电梯之间；打印专座已内移。电梯厅两端均开口，左后部延至上层纵深，五楼补桌椅外形。陈设与尺寸为示意。\\n")])
edit('package_current.py',[(".codex-finalizer-axis/", ".codex-finalizer-rooms/"),
 ("各层厕所位置对齐，一楼右侧补入咖啡厅；", "各层厕所位置对齐；一楼左后延伸，打印专座内移，右侧107、咖啡厅、106顺次衔接，电梯厅两端开口；"),
 ("一楼右侧补入咖啡厅，功能由本人说明且2026官方活动通知确认，室内家具和尺寸未测绘。", "一楼左侧桌排及柜库延至上层同等纵深。入口右前是107研讨室，后接长条咖啡厅及106工作人员室，再到电梯；打印与专座向服务台后书库一侧内移。电梯厅前后两端均开口。扶梯只保留一至二楼，二至三楼仅普通梯。五楼补齐桌椅外形，保留报刊与过道。房号和相对位置由本人补充，家具数量和尺寸未测绘。")])
edit('portal.html',[("一楼右侧补入咖啡厅，电梯收进右侧靠墙的独立交通区；各层厕所位置对齐。", "一楼左后部补长，打印和专座内移；右翼107研讨室、长条咖啡厅、106工作室依次衔接电梯厅，门前两端均可通行。五楼补齐桌椅，扶梯仅保留一至二楼。")])
audit=json.loads((H/'layout-research-audit.json').read_text(encoding='utf-8'))
audit['rooms_revision_20261015']={'basis':'本人本轮现场说明与澄清，房号未经独立馆方平面交叉核验',
 'corrections':['电梯井道不动，门前厅前后两端开口','原右前咖啡厅改107研讨室，原右条打印专座区改咖啡厅','咖啡厅与电梯之间106工作人员室','打印专座向服务台后柜库一侧内移','一楼左后部与上层同深，桌排柜库延长','五楼补桌椅外形并保留报刊柜列及通道','一至二楼有普通梯与扶梯；二至三楼仅普通梯'],
 'limits':'家具、桌数、柜数与建筑尺寸均为示意；新增家具不增加60个模拟监测座位，工作人员室不参与推荐'}
(H/'layout-research-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
print('SYNCED room revision into source explanations, deck, portal and package builder')
