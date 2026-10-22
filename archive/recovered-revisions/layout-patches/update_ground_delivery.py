from pathlib import Path
import json,hashlib
H=Path(__file__).parent
def replace(name,pairs):
 p=H/name;s=p.read_text(encoding='utf-8')
 for a,b in pairs:
  if a not in s:
   assert b in s,(name,a);continue
  s=s.replace(a,b)
 p.write_text(s,encoding='utf-8')
before={str(p.relative_to(H/'qa')):hashlib.sha256(p.read_bytes()).hexdigest() for p in (H/'qa').rglob('page-*.png')}
(H/'ground-doc-before.json').write_text(json.dumps(before),encoding='utf-8')
replace('app.js',[("y:215+2*7,width:2.3*12,height:2.2*7","y:215+EXHIBITION_LAYOUT.access.back*7,width:2.3*12,height:(EXHIBITION_LAYOUT.access.front-EXHIBITION_LAYOUT.access.back)*7")])
replace('model.js',[
 ('三楼为竖向展板、相邻浑仪与陶瓷展品、边缘花盆、后排座位和更后方的书架；楼梯出口留有进入座位区的通道。','三楼从前向后是金球、白色陶瓷、木雕和纵向书桌，最后是书架；上下两段梯之间的平台可横向进入两侧座位区。'),
 ('一楼保留带电脑的红木服务台、普通直梯与扶梯；没有弧形展陈小退台。','一楼左侧靠窗阅览，内部是柜式密集书库；电脑前台保留，右侧有打印机排和公共通道深处的电梯入口。'),
 ('两旁是无栏杆直梯与扶梯。','两旁是黑灰色无栏杆直梯与扶梯。'),
 ('只移动视野，不生成或修改预约。','“定位下楼口”可转向本层普通梯。只移动视野，不生成或修改预约。')])
replace('model-template.html',[
 ('<button id="walkExit">退出</button>','<button id="walkStair">定位下楼口</button><button id="walkExit">退出</button>'),
 ('<option value="evening">傍晚暖光</option>','<option value="evening">傍晚暖光</option><option value="golden">夕阳西下</option>'),
 ('方向、亮度、曝光和阴影。','方向、亮度、曝光和阴影，也可选“夕阳西下”体验低角度暖阳。')])
refs=H/'photo-reference.js';s=refs.read_text(encoding='utf-8');items=json.loads(s[s.index('['):s.rindex(']')+1])
for r in items:
 if r['id']=='ceramics':r.update(eye=[3,3.1,-1.8],target=[-.4,1.8,-6.6],description='三楼白色陶瓷展品位于金球后方、木雕前方；按本人确认的前后顺序摆放，形态参考R34。')
 if r['id']=='wood':r['description']='三楼金球后接白色陶瓷，再接R51木雕、底座、金色立柱和红色围绳；木雕后方是纵向书桌与座位，再后方为书架。'
 if r['id']=='exhibition':r['description']='三楼前后顺序：金球、白色陶瓷、木雕、纵向书桌、书架。竖幅展板沿纵向陈列，边缘为花盆；两段梯之间留有横向进入座位区的平台。'
 if r['id']=='stairs':r['description']='二至三楼才有弧形小退台；两侧黑灰色无栏杆普通梯连接一至三楼，三楼出口不覆盖下层踏步，一楼电脑前台保留。'
refs.write_text('// 照片入口与相机定位共用；相对顺序依据用户确认，尺寸未测绘。\nexport const PHOTO_REFERENCES='+json.dumps(items,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
scene=H.parent/'photo_reference_20261014/reference-scenes.json';j=json.loads(scene.read_text(encoding='utf-8'))
if isinstance(j,list):scene.write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8')
replace('content.py',[
 ('相邻陶瓷与浑仪位置','从前向后的金球、白色陶瓷、木雕位置'),
 ('后方再接座位带和更后方书架。','白色陶瓷在金球之后、木雕之前；木雕后接旋转90度的纵向书桌和更后方书架。'),
 ('跨层代价仍是演示参数；不是现实米数、时间或电梯位置。','各层elevator节点使用同一井道坐标，跨层代价仍是演示参数；不是现实米数、时间或无障碍认证。'),
 ('导出检查要求只有三楼有展板','GROUND_LAYOUT描述一楼左侧窗边桌椅、柜式密集书库和打印机排，ELEVATOR_LAYOUT描述竖直对齐的电梯。数量及尺寸为示意。deskChairPosition先计算局部椅位再按桌角度投影，三楼后桌旋转Math.PI/2后平面与三维一致。导出检查要求只有三楼有展板'),
 ('可选晴天日光、柔和室内、傍晚暖光。','可选晴天日光、柔和室内、傍晚暖光与夕阳西下。低角度暖阳配合冷色暗部、弱反射补光和较紧的室内阴影范围；这是实时展示近似，未经现场照度标定。'),
 ('三楼两侧的平台例外允许从梯口横向进入座位区。','三楼平台位于两段梯之间的实体楼板，不覆盖下层末段踏步。walkStairEntry定位本层下楼口，相机朝向+Z；按前进可沿普通梯下楼。collectWalkObstacles从实际模型提取柜体、桌椅、展品和电梯的边界，几何检查也使用同一份障碍列表。')])
replace('package_outputs.py',[
 ('三楼竖幅展板纵向布置、浑仪旁红框陶瓷、盆栽边缘、后排座位与更后方书架、两侧通行口','三楼从前向后为金球、白色陶瓷、木雕、纵向书桌、书架，盆栽边缘与两侧通行口保留'),
 ('一楼带电脑前台；二至三楼弧形退台','一楼左侧靠窗阅览、柜式密集书库、打印机排、右侧电梯及带电脑前台；二至三楼弧形退台'),
 ('Esc退出；楼层按钮直接定位','Esc退出；“定位下楼口”朝向本层普通梯，楼层按钮直接定位'),
 ('曝光及阴影。','曝光及阴影，可选择夕阳西下。')])
print('Updated reference captions, model text, learning content and delivery notes.')
