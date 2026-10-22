"""同步通道修订的学习说明和交付注记。"""
from pathlib import Path
import json,hashlib
H=Path(__file__).parent
p=H/'content.py';t=p.read_text(encoding='utf-8')
for a,b in [
 ('左侧五排及服务台后密集书库','向后延长的左侧柜库及服务台后密集书库'),
 ('serviceBypass让电梯路线绕过打印机右端','serviceBypass使电梯路线绕开内移后的打印与专座'),
 ('井道中心位于专座后方略靠左','井道中心位于右墙独立交通区内'),
 ('二至五楼TRANSPORT_CORE保存白墙边界、前侧门洞','一至五楼TRANSPORT_CORE保存白墙边界、前后两端门洞'),
 ('面朝馆内的四个沙发和左右两区中间的纵向小书架。','面朝馆内的四个沙发和左右两区中间的纵向小书架。每组保持两张沙发夹一个书架，左组整体左移、右组整体右移6.2模型单位；留出中央及两侧上楼接近线，位置只示意，不代表实测净宽。'),
]:
 assert a in t,a;t=t.replace(a,b)
p.write_text(t,encoding='utf-8')
p=H/'spatial.js';t=p.read_text(encoding='utf-8').replace('井道略向左后方移到专座后侧；各层共用井道中心','井道保持在已确认的右墙交通区；各层共用井道中心');p.write_text(t,encoding='utf-8')
p=H/'package_current.py';t=p.read_text(encoding='utf-8').replace('嘉庚知座 · 2026-10-15完整交付','嘉庚知座 · 2026-10-16完整交付')
t=t.replace('1F至3F深灰无栏杆直梯及扶梯','1F至3F深灰无栏杆普通直梯，扶梯仅1F至2F')
t=t.replace('前厅、沙发、竖向小书架、左窗阅览','前厅两组沙发与竖向小书架各向左右外移，为中央入口及两侧上楼接近线留空；左窗阅览')
p.write_text(t,encoding='utf-8')
p=H/'make_documents.py';t=p.read_text(encoding='utf-8').replace('2026-10-15','2026-10-16');p.write_text(t,encoding='utf-8')
p=H/'finish_rooms_records.py';t=p.read_text(encoding='utf-8').replace('本轮依据本人现场补充修订相对位置，未进行测绘。','本轮依据本人现场补充修订相对位置，未进行测绘。左右两组沙发和中间书架分别向左右外移，保持内部排列，给入口和楼梯前留通道。')
t=t.replace("t=t.replace('一楼右侧补入咖啡厅；四楼'", "t=t.replace(\"'date':'2026-10-15'\",\"'date':'2026-10-16'\")\nt=t.replace('一楼右侧补入咖啡厅；四楼'")
p.write_text(t,encoding='utf-8')
p=H/'layout-research-audit.json';a=json.loads(p.read_text(encoding='utf-8'));a['lounge_revision_20261016']={'basis':'本人要求两侧沙发与书架各向外平移','model_offset':6.2,'unit':'未测量模型单位','scope':'每侧两张沙发和一个书架整体移动，内部间距及朝向保持；几何检查中央和两侧入口直行通道'};p.write_text(json.dumps(a,ensure_ascii=False,indent=2),encoding='utf-8')
# 保留上一轮已经逐页看过的图像签名，供新版Word导出后仅复核变更页。
(H/'rooms-slide-baseline.json').write_text(json.dumps({p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (H/'deck_build/renders').glob('slide-*.png')}),encoding='utf-8')
print('SYNCED lounge positions and learning explanations')
