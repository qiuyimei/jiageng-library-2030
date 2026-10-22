"""Synchronize current scene descriptions and preserve hashes for document review."""
from pathlib import Path
import hashlib, json
here=Path(__file__).parent
before={str(p.relative_to(here/'qa')):hashlib.sha256(p.read_bytes()).hexdigest() for p in (here/'qa').rglob('page-*.png')}
(here/'front-doc-before.json').write_text(json.dumps(before),encoding='utf-8')
def edit(name,pairs):
    p=here/name;s=p.read_text(encoding='utf-8')
    for old,new in pairs:
        assert old in s,(name,old)
        s=s.replace(old,new)
    p.write_text(s,encoding='utf-8')
edit('content.py',[
    ('GROUND_LAYOUT描述一楼左侧窗边桌椅、左侧及服务台后密集书库、右侧固定专座、后移打印机排、厕所、两个沙发和小书架。',
     'GROUND_LAYOUT描述一楼左侧窗边桌椅、左侧五排及服务台后密集书库、右侧固定专座、后移打印机排、厕所、面朝馆内的两个沙发和左沙发旁纵向小书架。厕所门朝后方阅览桌排。'),
    ('ELEVATOR_LAYOUT的井道位置各层不变，groundRotation只将一楼门转向馆内，groundLanding对应一楼门前点。',
     'ELEVATOR_LAYOUT的井道中心位于专座后方略靠左，各层竖直对齐；groundRotation使一楼黑色门面朝右侧通道，groundLanding对应门前点。'),
    ("'elevatorLanding':'按楼层返回门前点，一楼转向后的门前点与其他楼层不同，井道中心保持对齐。'",
     "'elevatorLanding':'按楼层返回门前点，一楼黑色门面朝右侧通道，对应门前点在井道右侧；各层井道中心保持对齐。'")
])
edit('model.js',[
    ('前厅保留宽敞通道，左侧洗手间、两个木框白坐垫沙发和小书架可见。一楼电梯门朝馆内。',
     '左侧密集书库有五排，台后书库保留。前厅沙发转向馆内，小书架移到左沙发旁沿地砖线纵向摆放，厕所门朝阅览桌。电梯在专座后方略靠左，黑色门面朝右侧通道。'),
    ('“定位下楼口”可转向本层普通梯。“定位下楼口”可转向本层普通梯。“定位下楼口”可转向本层普通梯。',
     '“定位下楼口”可转向本层普通梯。')
])
edit('photo-reference.js',[
    ('前厅、左侧洗手间、右侧专座与台后书库按本人确认相对布置，数量和尺寸示意。',
     '前厅沙发朝馆内，小书架沿地砖线纵向摆在左沙发旁；厕所门朝桌排，左书库五排，专座后电梯略靠左且黑色门面反向。位置按本人确认，数量和尺寸示意。')
])
edit('prepare_photo_delivery.py',[
    ('同一井道竖直对齐且一楼门朝馆内的电梯',
     '专座后方略靠左、各层井道竖直对齐且一楼黑色门面朝右侧通道的电梯'),
    ('前厅两个木框白坐垫沙发、小书架、左侧洗手间',
     '前厅两个朝馆内的木框白坐垫沙发、左沙发旁沿地砖线纵向小书架、门朝阅览桌的左侧洗手间'),
    ('左侧与台后柜式密集书库','左侧五排与台后柜式密集书库')
])
edit('package_outputs.py',[
    ('右侧电梯门朝馆内','专座后略靠左的电梯黑色门面朝右侧通道'),
    ('电梯原位转向馆内','电梯在专座后方略向左后移，黑色门面朝右侧通道，各层井道竖直对齐'),
    ('左窗阅览前方补厕所，楼梯前补两张木框白垫沙发和低矮小书架',
     '左窗阅览前方的厕所门朝阅览桌；左侧密集书库五排，台后书库保留；楼梯前两张木框白垫沙发朝馆内，小书架纵向放在左沙发旁、沿地砖线摆放')
])
edit('finalize_front_review.py',[
    ('一楼电梯原位转向馆内，门前点随朝向更新，跨层连线仍经同一竖直井道。',
     '左侧密集书库五排，台后书库保留；沙发朝馆内，书架在左沙发旁纵向沿地砖线摆放，厕所门朝阅览桌。一楼电梯在专座后方略向左后移，黑色门面朝右侧通道，门前点随朝向更新，跨层连线仍经同一竖直井道。')
])
print('Updated current scene descriptions; baseline PDF page hashes preserved.')
