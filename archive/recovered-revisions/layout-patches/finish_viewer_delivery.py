"""当前页面分工的交付文字与几何来源记录；不改变模型和推荐数据。"""
from pathlib import Path
import json,hashlib,shutil
H=Path(__file__).parent
OWN=H.parents[1]/'outputs/12_嘉庚知座_统一方案/本人保留'
p=H/'package_current.py'
t=p.read_text(encoding='utf-8').replace('点击任何推荐联动平面、三维椅位、理由及路线。','点击推荐查看平面、理由与路线；三维辅助定位需要时在下方展开。')
t=t.replace('[ ] 主页面与三维均能打开；60个模拟椅位表可见，默认最多4个优先位置。','[ ] 建筑页没有并列筛选面板；选座页默认不加载三维，展开后显示，收起后卸载。\n[ ] 建筑页点击实体区域靠近，返回上一视角与展开画面可用；厕所扩大，字号不变。\n[ ] 主页面与三维均能打开；60个模拟椅位表可见，默认最多4个优先位置。')
p.write_text(t,encoding='utf-8')
p=H/'terminal-placement-check.json'
r=json.loads(p.read_text(encoding='utf-8'))
scene=json.loads((H/'scene-check.json').read_text(encoding='utf-8'))
r['date']='2026-10-18'
r['floor_extents']=[v['bounds'] for v in scene['placement_checks']]
r['actual_geometry_walk_checks']=scene['walk_geometry_checks']
r['label_orientation']='左北、右南、上东；模型方向编号，非真实座号对照'
r['bookshelf_check']=json.loads((H/'overlap-audit.json').read_text(encoding='utf-8'))
r['scene_source_sha256']=hashlib.sha256((H/'spatial.js').read_bytes()).hexdigest()
r['viewer_memory_checks']={'main_page':12,'model_data':8,'model_controls':15,'actual_browser_checked':False}
p.write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
proof=OWN/'建模核对'
shutil.copy2(H/'qa_compact_20261017/楼层范围与同井道对照.png',proof/'楼层范围与同井道对照.png')
(proof/'查看说明.txt').write_text('这些图来自交互模型同源几何的静态投影，不是浏览器截图或实测建筑图。\n建筑展示和平面选座是两个网页：Demo/建筑与五层展示.html 只看空间，点击区域聚焦，细节收在更多展示选项；Demo/嘉庚知座.html 用单层座位图筛选、亮灯及排序，需要时在下方展开三维定位。\n同一示意比例对照图说明：一楼在当前交通区后结束；二至五楼同一井道后方仍有空间，新增后区已缩短。模型单位不是实测尺寸。\n一楼保留左侧厕所，上层两侧均有，厕所位置对齐且已扩大，字号保持原样。\n前台、107研讨室、咖啡厅、106工作人员室、打印专座和五楼报刊与桌椅保留；位置按本人补充，尺寸与家具数量为示意。\n固定平面方向为左北、右南、上东，标签与平面选座共用编号；模拟数据仍只有60个椅位。两侧保留书架，独立书架两面均有实体书列。\n当前独立桌椅、书架、柜体、展品与所列墙柱的包围盒交叉检查为0处；检查不覆盖全部三角网格，也不等于真实浏览器验收。\n',encoding='utf-8')
print('当前页面说明与来源记录已同步')
