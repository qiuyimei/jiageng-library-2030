"""同步文字依据和本轮空间修订；不改变智能选座主线。"""
from pathlib import Path
H=Path(__file__).parent
def edit(name,pairs):
 p=H/name;t=p.read_text(encoding='utf-8')
 for old,new in pairs:
  assert old in t,(name,old)
  t=t.replace(old,new)
 p.write_text(t,encoding='utf-8')
edit('spatial.js',[
 ('// 二至五楼右侧中段为白墙围合的交通区。','// 一至五楼右侧中段为白墙围合的独立交通区。'),
 ('// 二至五楼共用拓宽范围；井道仍与一楼对齐，右侧交通区靠侧墙。','// 一至五楼以前台x=0为中轴共用左右等宽范围；井道逐层对齐，交通区独立贴右墙。'),
 ('// 扩展安排在馆内方向，不在交通区右边再加书架翼。','// 交通区位于右翼最外侧，与中庭梯之间保留阅览区域和连续过道。'),
 ('// 一楼前厅更深，平面只缩放显示范围；原始模型坐标及座位编号仍不变。','// 根据本层统一边界居中缩放平面；家具、座位状态和路线从同一坐标投影。')])
edit('library-layout.js',[
 ('// 上层统一接回一楼前沿，背部为阅览/研讨补足空间；二三楼横向轴线以电梯为准。','// 各层横向以前台中心为轴等宽；上层背部保留阅览/研讨空间。'),
 ("z('备考联盟区',-8.2,-36,49,29", "z('备考联盟区',0,-36,66,29")])
edit('content.py',[
 ('一楼保持已核对布置。四楼东南侧明确呈现', '一楼也以前台中轴拓宽，并补入右侧咖啡厅；各层厕所位置对齐，电梯收进右侧墙边独立交通区。四楼东南侧明确呈现'),
 ('一楼保持left=-18、right=18、back=-22、front=34。二至五楼统一为left=-34.4、right=18、back=-52.6、front=34，宽52.4、深86.6模型单位。把横向扩展放在馆内方向，同时让白墙交通区的right=17.8与侧墙18邻接，保留ELEVATOR_LAYOUT的同一竖直井道。', '一至五楼统一以前台x=0为中轴，left=-34.4、right=34.4，左右等宽，总宽68.8模型单位。一楼back=-22、front=34，上层back=-52.6、front=34。右侧白墙交通区left=23.05、right=34.2，靠侧墙且与中庭楼梯分开；电梯井道x=24.6、z=-9.3逐层对齐。TOILET_LAYOUT使上下厕所同位，一楼保留左厕，上层左右均有厕所。一楼右侧咖啡厅表现实际功能，室内陈设仅为示意。'),
 ('一楼保持原投影，上层按52.4宽、86.6深示意外框缩放。', '各层按68.8宽及本层纵深的示意外框居中缩放。'),
 ('二至五楼新增空间都有可行走楼面，而一楼保持原范围。', '一至五楼左右新增空间都有可行走楼面；一楼后沿仍保留-22。'),
 ('右侧交通区的前门x=10.3、z=-7.6，先沿x=7.2走到z=-6.35，再横向进门', '右侧交通区的前门x=26.7、z=-7.6，先沿x=19.1走到z=-6.35，再横向进门')])
edit('make_service_materials.py',[
 ('target=(-8.2,15.4,-9.3)','target=(0,15.4,-9.3)'),
 ('target=(-8.2,20.2,-9.3)','target=(0,20.2,-9.3)'),
 ('二至五楼同样拓宽，右侧墙边交通区，厕所位于两角；一楼保留。','各层以前台中轴左右等宽；右墙独立交通区、厕所上下对齐，一楼右侧有咖啡厅。')])
edit('deck_build/build_deck.mjs',[
 ('二至五楼均拓宽，一楼保持已核对布置。','一至五楼以前台为中轴左右等宽；电梯位于右侧墙边独立交通区，各层厕所上下对齐，一楼右侧补有咖啡厅。')])
p=H/'photo-details.js';t=p.read_text(encoding='utf-8')
start=t.index("  const g=group(parent,'photo_suspended_ceiling');g.visible=false;const depth=n===1?")
end=t.index(' function floorFinishes(',start);t=t[:start]+' }\n'+t[end:]
start=t.index('  // 深色地砖带只画在现有实体楼板上，不能跨过中央中庭孔洞。')
end=t.index(' function balcony(',start);t=t[:start]+' }\n'+t[end:]
p.write_text(t,encoding='utf-8')
print('SYNCED 本轮前台中轴及咖啡厅说明')
