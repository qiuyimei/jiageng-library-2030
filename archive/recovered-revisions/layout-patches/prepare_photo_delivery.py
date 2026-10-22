"""为本人包制作照片目录；原图不会复制到提交候选包。"""
from pathlib import Path
from PIL import Image,ImageOps
import json,shutil,html
HERE=Path(__file__).parent;ROOT=HERE.parents[1]
DATA=ROOT/'work/photo_reference_20261014'
OWN=ROOT/'outputs/12_嘉庚知座_统一方案/本人保留'
OUT=OWN/'照片参考';(OUT/'照片').mkdir(parents=True,exist_ok=True);(OUT/'缩略图').mkdir(exist_ok=True)
photos=json.loads((DATA/'photos.json').read_text(encoding='utf-8'))
analysis=json.loads((DATA/'photo-analysis.json').read_text(encoding='utf-8'))
references=json.loads((DATA/'reference-scenes.json').read_text(encoding='utf-8'))
for row in photos:
    dest=OUT/f'照片/R{row["id"]:02d}.jpg';shutil.copy2(row['file'],dest)
    with Image.open(dest) as im:ImageOps.contain(im.convert('RGB'),(480,360)).save(OUT/f'缩略图/R{row["id"]:02d}.jpg',quality=89)
shutil.copy2(DATA/'photo-analysis.json',OUT/'照片提取记录.json')
groups=list(dict.fromkeys(row['group'] for row in analysis))
parts=['''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>嘉庚图书馆 照片与模型细节对照</title><style>
body{font:14px/1.7 Microsoft YaHei,sans-serif;background:#f3f6f3;color:#163239;margin:0}main{max-width:1240px;margin:auto;padding:32px 24px}a{color:#16675f;text-underline-offset:4px}h1{font-size:30px}h2{font-size:23px;margin-top:36px}.muted{color:#526b70}.note{background:#fff7e7;padding:14px 18px;border-left:4px solid #caa45b}.nav{display:flex;gap:12px;flex-wrap:wrap}.nav a{background:white;border:1px solid #d6e2df;border-radius:6px;padding:6px 10px;text-decoration:none}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{background:white;border:1px solid #d6e2df;padding:16px;border-radius:9px;min-width:0}.card h3{font-size:16px;margin:8px 0}.card p{font-size:12px;color:#526b70}.card img{width:100%;height:250px;object-fit:contain;background:#edf0e9}.scenes{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.scene{padding:14px;background:#e6efe8;border-radius:8px}.scene p{font-size:12px;margin:8px 0}code{font-size:12px;overflow-wrap:anywhere}a:focus-visible{outline:3px solid #b89048}@media(max-width:800px){.grid,.scenes{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.grid,.scenes{grid-template-columns:1fr}main{padding:24px 16px}}</style><main><a href="../00_打开查看.html">← 返回项目入口</a><h1>嘉庚图书馆 照片与模型细节对照</h1><p>73张现场照片已按六类阅读和记录。可先进入18个细节视角，再点原图核对外形。</p><div class="note">本页供本人查看。原图包含现场人员，仅保留在本人包中。模型复现可见形态，照片不能确定的尺寸、数量和位置仍按示意处理；未完成摄影测量或完整真实座号校准。</div><h2>进入模型中的细节</h2><div class="scenes">''']
for ref in references:
    parts.append(f'<article class="scene"><a href="../Demo/建筑与五层展示.html#detail={ref["id"]}" target="_blank" rel="noopener">{html.escape(ref["label"])} ↗</a><p>R{ref["photo"]:02d} · {html.escape(ref["description"])}</p></article>')
parts.append('</div><h2>查看照片提取记录</h2><nav class="nav" aria-label="照片分类">')
for i,group in enumerate(groups):parts.append(f'<a href="#g{i}">{html.escape(group)}</a>')
parts.append('</nav>')
for i,group in enumerate(groups):
    parts.append(f'<section id="g{i}"><h2>{html.escape(group)}</h2><div class="grid">')
    for row in analysis:
        if row['group']!=group:continue
        n=row['id'];parts.append(f'<article class="card"><a href="照片/R{n:02d}.jpg" target="_blank" rel="noopener"><img src="缩略图/R{n:02d}.jpg" alt="参考照片R{n:02d} {html.escape(group)}" loading="lazy"></a><h3>R{n:02d} · {html.escape(group)}</h3><p>{html.escape(row["keypoints"])}</p><p>{html.escape(row["scope"])}</p><code>{html.escape(row["file"])}</code></article>')
    parts.append('</div></section>')
parts.append('<p class="muted">原70张拍摄水印日期为2026年10月13日，另有3张用户补充示图，本次整理日期为2026年10月14日。图书馆外观与家具细节不改变使用权规则，照片中的人员未建模为可识别人物。</p></main></html>')
(OUT/'照片与模型对照.html').write_text(''.join(parts),encoding='utf-8')
(OUT/'模型细化说明.txt').write_text('''照片细化说明 2026-10-14

操作：从项目首页进入三维模型，在“按照片定位细节”下拉框选择18个近景之一；右侧显示相应照片。可开关玻璃采光顶、吊顶灯具、座位状态与路线。切楼层仍看同一套模型。另有“自己走”按钮进入无人物第一人称，WASD/方向键或画面按钮移动、拖动转头；光影面板可调日光和曝光，夕阳西下预设采用低角度暖阳与冷暗部；定位下楼口可找到普通梯。

馆外：连续水平格栅、柱廊圆柱与凹槽、石材台阶、位于三柱组内侧且向外凸出的通透梅花开口、红砖嵌面、饮水隔间、方格吊顶、大型榕树盆景、广场拼缝、枝状灯与自行车停放。
馆内：五层采光中庭、钢架和玻璃顶、遮阳分段、仅二至三楼的弧形石材退台、两侧黑灰色直梯与静态扶梯，三至五楼两侧普通梯与四楼平台、三楼中央竖幅展板、从前向后的金球、白色陶瓷、木雕、纵向书桌、更后方书架与盆栽边缘、凹槽柱和柱头、深色栏杆、红色实心栏板、弧形栏板与垂挂绿植、窗带、吊顶灯具、通风口、浅色地砖与深色格带。
阅览与服务：按本人确认补入一楼左侧靠窗桌椅、左侧五排与台后柜式密集书库、右侧固定专座、后移打印机排、前厅左右两区各两个朝馆内的木框白坐垫沙发、各区中间沿地砖线纵向小书架、门朝阅览桌的左侧洗手间、专座后方略靠左、各层井道竖直对齐且一楼黑色门面朝右侧通道的电梯，柜体、打印机、专座桌型与数量均为示意；带孔蓝椅、深色扶手、长桌板式支撑和金属底脚、深棕端板黑色钢架书架、红木服务台和校训字样、白色寄包柜、信息展示屏、陶瓷展陈与金色浑仪的概括形态、三楼展厅木雕轮廓与围绳。

模型层次：photo-details.js生成静态部件；photo-reference.js记录18个细节依据与相机视角；library-layout.js与architecture.js将细节装入室内和馆外；spatial.js保留60个状态样本的桌椅位置；新增普通桌排不加入状态样本；space-layer.js绘制状态、候选和任务路线。

照片能确认外形，不能据此宣称拥有全馆测绘图。所有尺寸、精确朝向、数量与家具位置仍需现场核验。除一楼标志和既有三楼南区牌签线索外，单张照片不强行推断拍摄楼层。展陈为概括的几何形态，不是扫描复刻或真实作品命名。扶梯没有动态运行、安全控制或导流接口。装饰与展陈不参加选座计数。

本次原图只保留在本人包。提交候选包仅含方案、几何投影展示和演示，不放人物照片、可编辑模型或代码。
''',encoding='utf-8')
print('73 originals and thumbnails, 17 linked detail entries created')
