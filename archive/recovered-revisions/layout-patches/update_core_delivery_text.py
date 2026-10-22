"""Synchronize the current five-floor core and two paired lounge areas."""
from pathlib import Path
import hashlib,json
here=Path(__file__).parent
before={str(p.relative_to(here/'qa')):hashlib.sha256(p.read_bytes()).hexdigest() for p in (here/'qa').rglob('page-*.png')}
(here/'front-doc-before.json').write_text(json.dumps(before),encoding='utf-8')
for name in ['content.py','model.js','photo-reference.js','library-layout.js','prepare_photo_delivery.py','package_outputs.py','finalize_front_review.py']:
    p=here/name;s=p.read_text(encoding='utf-8')
    for old,new in [
      ('面朝馆内的两个沙发和左沙发旁纵向小书架','面朝馆内的四个沙发和左右两区中间的纵向小书架'),
      ('两个木框白垫沙发、小书架','左右两区各两个木框白垫沙发和中间小书架'),
      ('两个木框白垫沙发和小书架','左右两区各两个木框白垫沙发和中间小书架'),
      ('两个木框沙发和小书架','左右两区各两个木框沙发和中间小书架'),
      ('楼梯前两张木框白垫沙发朝馆内，小书架纵向放在左沙发旁、沿地砖线摆放','楼梯前左右两区各两张木框白垫沙发朝馆内，每区中间的小书架沿地砖线纵向摆放'),
      ('前厅两个朝馆内的木框白坐垫沙发、左沙发旁沿地砖线纵向小书架','前厅左右两区各两个朝馆内的木框白坐垫沙发、各区中间沿地砖线纵向小书架'),
      ('前厅沙发转向馆内，小书架移到左沙发旁沿地砖线纵向摆放','前厅左右两区各两张沙发朝馆内，中间各有一个沿地砖线纵向书架'),
      ('小书架沿地砖线纵向摆在左沙发旁','左右两区各两张沙发，中间各有一个沿地砖线纵向书架'),
      ('小书架在左沙发旁沿地砖线纵向摆放','左右两区各两张沙发、中间一个沿地砖线纵向书架'),
      ('groundRotation使一楼黑色门面朝右侧通道，groundLanding对应门前点','groundRotation使五层黑色门面朝右侧门前走廊，elevatorLanding对应同一门前点'),
      ('一楼黑色门面朝右侧通道，对应门前点在井道右侧','五层黑色门面朝右侧门前走廊，对应门前点在井道右侧'),
      ('17个照片','18个细节'),('17个视角','18个视角'),('17个近景','18个近景'),('17个细节','18个细节'),('34个视图','35个视图'),('73项规则','75项规则')
    ]:s=s.replace(old,new)
    p.write_text(s,encoding='utf-8')
content_path=here/'content.py';s=content_path.read_text(encoding='utf-8')
s=s.replace('照片用于外形核对，尺寸与坐标未测绘；','五层电梯共用井道，二至五楼右侧中段有白墙围合的电梯与侧楼梯交通区，其相对关系由本人补充。照片用于外形核对，尺寸与坐标未测绘；')
s=s.replace('各层竖直对齐；groundRotation','各层竖直对齐；二至五楼TRANSPORT_CORE保存白墙边界、侧门和折返梯两段半层高度，楼板为梯子留洞，桌椅避开交通区。groundRotation')
s=s.replace('一楼转向后的门前点与其他楼层不同','各层门前点随同一门朝向定位')
s=s.replace('二楼和四楼的两块孔洞之间分别留出下部、上部楼梯的中间平台。','二楼和四楼的两块中庭孔洞之间分别留出下部、上部楼梯的中间平台。侧楼梯的楼板孔洞由TRANSPORT_CORE单独生成。')
content_path.write_text(s,encoding='utf-8')
model_path=here/'model.js';s=model_path.read_text(encoding='utf-8')
s=s.replace("+' 彩色圆点对应演示椅位，金色折线为本次任务路线。'","+(floor>=2?' 右侧中段是白墙围合的交通区：电梯门前留走廊，另一侧有折返楼梯，各层井道与门面保持对齐。':'')+' 彩色圆点对应演示椅位，金色折线为本次任务路线。'")
model_path.write_text(s,encoding='utf-8')
refs_path=here/'photo-reference.js';text=refs_path.read_text(encoding='utf-8');prefix=text.split('export const PHOTO_REFERENCES=',1)[0]
refs=json.loads(text.split('export const PHOTO_REFERENCES=',1)[1].strip().rstrip(';'))
assert len(refs)==17
refs.append(dict(id='traffic',label='二至五楼：白墙电梯楼梯区',photo=47,src='../照片参考/照片/R47.jpg',floor=3,view='cut',eye=[23,9,-.5],target=[11.4,1.1,-11.0],roof=False,ceiling=False,description='本人确认电梯位于右侧中段，门前是走廊和楼梯，四周白墙围合。R47/R53只支持白墙、灰石墙脚和踢脚线外形，未拍到该交通区全貌；折返梯、门洞和尺寸为示意，各层井道竖直对齐。'))
refs_path.write_text(prefix+'export const PHOTO_REFERENCES='+json.dumps(refs,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
data=here.parents[1]/'work/photo_reference_20261014';(data/'reference-scenes.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
p=here/'check_photo_package.py';s=p.read_text(encoding='utf-8').replace('len(refs) == 17','len(refs) == 18').replace("len({r['id'] for r in refs}) == 17","len({r['id'] for r in refs}) == 18").replace('photo_detail_entries=17','photo_detail_entries=18');p.write_text(s,encoding='utf-8')
p=here/'make_visuals.py';s=p.read_text(encoding='utf-8').replace('17个照片近景','18个细节近景');p.write_text(s,encoding='utf-8')
print('Synchronized 18 detail views, two lounge pairs and the five-floor elevator core.')
