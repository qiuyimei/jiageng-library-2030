from pathlib import Path
import json,hashlib
HERE=Path(__file__).parent
(HERE/'walk-doc-before.json').write_text(json.dumps({str(f.relative_to(HERE/'qa')):hashlib.sha256(f.read_bytes()).hexdigest() for f in (HERE/'qa').glob('*/page-*.png')}),encoding='utf-8')
newfiles="'walk.js','lighting.js','walk-tests.js','model-controls-test.cjs',"
for name in ['make_documents.py','package_outputs.py','check_photo_package.py']:
 p=HERE/name;s=p.read_text(encoding='utf-8');s=s.replace("'photo-reference.js','build.cjs'", "'photo-reference.js',"+newfiles+"'build.cjs'")
 s=s.replace('source_files_in_line_guide\':26','source_files_in_line_guide\':30').replace('source_files_match=26','source_files_match=30')
 if name=='make_documents.py':
  s=s.replace("'vision.py','build.cjs']", "'vision.py','walk.js','lighting.js','build.cjs']")
  s=s.replace("'202020' if name=='Title' else '263E37'", "'000000' if name in ['Title','Subtitle','Heading 1','Heading 2','Heading 3'] else '263E37'")
 if name=='package_outputs.py':
  s=s.replace("'scene-check.json','document-check.json'", "'scene-check.json','walk-results.json','model-controls-results.json','document-check.json'")
  s=s.replace('26个源文件','30个源文件').replace('24个源文件','30个源文件')
  s=s.replace('一至三楼退台直梯扶梯','二至三楼弧形退台、一至三楼无栏杆直梯与扶梯')
  s=s.replace('三楼中央实体展厅与展板集中布置；','三楼竖幅展板纵向布置、浑仪旁红框陶瓷、盆栽边缘、后排座位与更后方书架、两侧通行口；一楼带电脑前台；')
  s=s.replace('浏览器验收。\\n展示数据重建：','浏览器验收。\\n新增漫游检查：node walk-tests.js；新增内存控制检查：node model-controls-test.cjs。\\n展示数据重建：')
  s=s.replace('3. 切换1F至5F、五层整体/展开、骨架、俯瞰与馆舍外观。','3. 切换1F至5F、整体/展开、骨架、俯瞰与馆舍外观。点击“自己走”，用WASD/方向键移动、拖动转头，画面按钮也可移动，Esc退出；楼层按钮直接定位。展开“光影调节”，调日光方向、高度、环境亮度、曝光及阴影。')
 p.write_text(s,encoding='utf-8')
p=HERE/'portal.html';s=p.read_text(encoding='utf-8').replace('26个源文件','30个源文件').replace('看1—3楼退台与扶梯、3—5楼普通梯，以及三楼中央展厅。','看二至三楼小退台、上部普通梯、三楼展厅与后排座位。模型内可点击“自己走”，也可调节光影。');p.write_text(s,encoding='utf-8')
p=HERE/'prepare_photo_delivery.py';s=p.read_text(encoding='utf-8').replace('一至三楼弧形石材退台','仅二至三楼的弧形石材退台').replace('三楼中央完整展厅与展板','三楼中央竖幅展板、浑仪旁陶瓷、盆栽边缘、后排座位与更后方书架').replace('深色栏杆、弧形栏板与垂挂绿植','深色栏杆、红色实心栏板、弧形栏板与垂挂绿植').replace('切楼层仍看同一套模型。','切楼层仍看同一套模型。另有“自己走”按钮进入无人物第一人称，WASD/方向键或画面按钮移动、拖动转头；光影面板可调日光和曝光。');p.write_text(s,encoding='utf-8')
p=HERE/'content.py';s=p.read_text(encoding='utf-8').replace('26个源文件','30个源文件').replace('24个源文件','30个源文件');p.write_text(s,encoding='utf-8')
