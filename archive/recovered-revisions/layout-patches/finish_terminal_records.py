from pathlib import Path
import json,hashlib
H=Path(__file__).parent
for name in ['package_current.py','record_final_review_20261015.py','check_upper_delivery.py']:
 p=H/name;t=p.read_text(encoding='utf-8').replace('电梯在右侧墙边独立白墙交通区内','后部交通区横跨专座后方至右墙，电梯在专座端、侧楼梯在右墙端').replace('电梯在右墙独立白墙交通区','后部白墙交通区由专座后方贯通至右墙，专座端为电梯、右墙端为侧楼梯')
 p.write_text(t,encoding='utf-8')
# 单独记录最新相对位置及验算所用的实际文件，避免只写“已检查”。
scene=json.loads((H/'scene-check.json').read_text(encoding='utf-8'))
(H/'terminal-placement-check.json').write_text(json.dumps({
 'date':'2026-10-16','user_correction':'后方整块横向贯通；专座端电梯，右墙端楼梯',
 'model_units_unmeasured':True,'core':{'left':10.7,'right':34.2,'front':-43,'back':-50.1},
 'lift':{'x':13.9,'z':-44.7,'door_faces':'+X'},'stairs_x':[29.45,31.15],
 'same_shaft_all_floors':True,'actual_geometry_walk_checks':scene['walk_geometry_checks'],
 'tested_core_lateral_connection_on_floors':[1,2,3,4,5],
 'browser_webgl_acceptance':'未执行；几何检查不代替浏览器验收',
 'scene_source_sha256':hashlib.sha256((H/'spatial.js').read_bytes()).hexdigest()
 },ensure_ascii=False,indent=2),encoding='utf-8')
p=H/'package_current.py';t=p.read_text(encoding='utf-8')
t=t.replace("copy(H/'upper-delivery-check.json',OWN,'验证记录/上层完整空间核对.json')", "copy(H/'upper-delivery-check.json',OWN,'验证记录/上层完整空间核对.json')\ncopy(H/'terminal-placement-check.json',OWN,'验证记录/后部贯通交通区核对.json')")
p.write_text(t,encoding='utf-8')
print('RECORDED TERMINAL SPAN AND ACTUAL WALK CHECKS')
