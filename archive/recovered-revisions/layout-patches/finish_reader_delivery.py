"""同步当前网页、登记记录及核对说明；不重建或伪造浏览器验收。"""
from pathlib import Path
import json,hashlib,ast,html,re,shutil
from content import FUNCTION_GUIDE
H=Path(__file__).parent;OWN=H.parents[1]/'outputs/12_嘉庚知座_统一方案/本人保留'
# 只重建逐行HTML，避免再次改动已经校对的Word分页。
module=ast.parse((H/'make_documents.py').read_text(encoding='utf-8'))
nodes=[n for n in module.body if isinstance(n,ast.FunctionDef) and n.name in ['annotation','source_html']]
env={'HERE':H,'OUT':OWN,'FUNCTION_GUIDE':FUNCTION_GUIDE,'html':html,'re':re}
exec(compile(ast.Module(body=nodes,type_ignores=[]),'line-guide','exec'),env);env['source_html']()
p=H/'document-check.json';doccheck=json.loads(p.read_text(encoding='utf-8'));doccheck['source_files_in_line_guide']=36;p.write_text(json.dumps(doccheck,ensure_ascii=False,indent=2),encoding='utf-8')
shutil.copytree(H/'dist',OWN/'Demo',dirs_exist_ok=True)
r=json.loads((H/'terminal-placement-check.json').read_text(encoding='utf-8'));scene=json.loads((H/'scene-check.json').read_text(encoding='utf-8'))
r.update(date='2026-10-18',actual_geometry_walk_checks=scene['walk_geometry_checks'],scene_source_sha256=hashlib.sha256((H/'spatial.js').read_bytes()).hexdigest())
r['ground_counter_rear_walls_and_receiving_room']=scene['ground_layout'];(H/'terminal-placement-check.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
result={'date':'2026-10-18','reader_status_rules':json.loads((H/'seat-status-results.json').read_text(encoding='utf-8')),'reader_page_memory_events':json.loads((H/'seat-page-dom-results.json').read_text(encoding='utf-8')),'physical_model_match':json.loads((H/'reader-geometry-check.json').read_text(encoding='utf-8')),'hub':'00_打开查看.html','entry_pages':['Demo/建筑与五层展示.html','Demo/嘉庚知座.html','Demo/到座登记.html','Demo/规则与感知技术演示.html'],'scope':'模型椅位非真实统计；读者申报非传感确认；本机保存非全馆共享；无浏览器验收','state_source':'主动登记或展示模式示例，未启用摄像头','ownership':'本机匿名标识仅演示本人操作，不是校内认证','expired_state':'unknown','evidence':'独立27项登记规则、41项新界面内存事件；同源模型实体交叉与通道检查；三张设计图及三张一楼几何图已人工查看','browser_checked':False}
(H/'reader-release-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
(OWN/'建模核对/查看说明.txt').write_text('模型核对图来自同源Three.js几何离线投影，非浏览器截图或测绘图。\n本轮一楼新增：电脑服务台后两侧柱间实墙；台后密集书库后延并留通道；黑色区域右后角收书室和旁边三张木色小桌；两组沙发移近入口并贴背墙，小书架仍夹在两张沙发之间且不伸入墙。\n固定平面方向左北、右南、上东。完整模型阅览椅位进入分层登记界面，规则研究模块另用60个样本；模型数量非真实统计。\n电梯和上层范围沿用当前已确认相对位置。\n实际独立家具与所列墙柱的包围盒交叉检查为0处；墙体与内嵌柱按装配处理。这不是完整三角面、现场通道或浏览器验收。\n',encoding='utf-8')
craft=OWN/'制作工具';craft.mkdir(exist_ok=True)
(craft/'本轮登记展示图与说明制作源码.txt').write_text('这些脚本用于本次离线设计图及说明，路径为制作时的工作目录；不是可直接部署的后台。可运行网页源码在代码包，按README安装依赖后npm run build可重建四个HTML。\n\n'+ '\n\n'.join('===== '+n+' =====\n'+(H/n).read_text(encoding='utf-8') for n in ['export-reader.cjs','make_reader_materials.py']),encoding='utf-8')
print('分层网页、同源数据与交付说明已同步')
