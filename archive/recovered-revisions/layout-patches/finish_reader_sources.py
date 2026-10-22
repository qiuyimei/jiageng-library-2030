"""将当前分层座位、自助登记和一楼隔墙修改接入交付流程。只运行一次。"""
from pathlib import Path
import json,re
H=Path(__file__).parent
extra=['seat-status.js','seat-page.js','seat-page.html','seat-status-tests.js','seat-page-dom-test.cjs']
for name,var in [('package_current.py','files'),('check_photo_package.py','source_files'),('make_documents.py','files')]:
 p=H/name;t=p.read_text(encoding='utf-8');pattern=rf"({var}\s*=\s*\[)([^\]]+)(\])";m=re.search(pattern,t);assert m,name
 t=t[:m.start(3)]+','+','.join(repr(n) for n in extra)+t[m.start(3):]
 if name=='package_current.py':
  t=t.replace('30个源文件','35个源文件').replace('两个HTML','全部HTML').replace('两个页面','独立页面')
  t=t.replace('共88项逻辑、空间与内存事件检查','共129项逻辑、空间、自助登记与内存事件检查').replace('完成88项检查','完成129项检查').replace('验证：88项','验证：129项')
  t=t.replace('node model-controls-test.cjs。','node model-controls-test.cjs、node seat-status-tests.js、node seat-page-dom-test.cjs。')
  t=t.replace('1. 打开选座Demo：默认数据库资料、必须插座、顺路打印。五层座位表最多点亮4个位置，标第1至4优先；点击推荐查看平面、理由与路线；三维辅助定位需要时在下方展开。','1. 从00_打开查看.html进入分层选座，每层列出完整模型阅览椅位（1012把为模型数，非馆内统计），按区域和状态分页。下方平面图与三维共用桌椅布局；点击详情可在三维定位。到座登记页可办理本人入座、暂离或离座；未登记或过期均待核对。')
  t=t.replace('2. 改条件后旧灯熄灭；模拟确认后切突然有人并复核，预约记录保留。过期与离线撤回候选及路线。这里的亮灯是界面效果，没有安装实体椅灯。','2. 自助登记保存在同一浏览器本机，未连接全馆后台。手动载入示例才显示演示占用；不采集人脸或视频，不替代馆方预约。规则与感知技术演示单独保留60个测试样本；它与完整模型登记数据分开。亮灯是界面效果，没有安装实体椅灯。')
  t=t.replace('选座页三维按需在下方展开，收起即卸载。','分层选座页不加载三维；从座位详情打开对应三维位置。可选规则研究页保留按需加载、收起即卸载。')
  t=t.replace('5. 方案Word/PDF，','一楼服务台后柱间墙已连接，后部收书室与木桌补入，密集书库延长且留通道，沙发向入口移动并靠墙。\n5. 方案Word/PDF，')
  t=t.replace("public_files=['嘉庚知座_创新方案.pdf']","public_files=['嘉庚知座_创新方案.pdf','本轮使用说明/分层选座与到座登记说明.pdf','本轮使用说明/答辩现场讲解顺序.txt']")
  t=t.replace("'model-controls-results.json','document-check.json'","'model-controls-results.json','seat-status-results.json','seat-page-dom-results.json','reader-release-check.json','document-check.json'")
  t=t.replace("'[ ] 主页面与三维均能打开；60个模拟椅位表可见，默认最多4个优先位置。'","'[ ] 分层选座首页有五层入口，各层完整模型座位可分页，平面可分区缩放；到座登记可写入、暂离、离座并回读。'")
  t=t.replace('[ ] 主页面与三维均能打开；60个模拟椅位表可见，默认最多4个优先位置。','[ ] 五层独立界面、完整模型阅览座位、分页与分区、缩放和同源三维定位正常。\n[ ] 到座登记需现场勾选；本人暂离/离座可用，过期转待核对；本机存储正常。\n[ ] 可选规则研究页60个样本及四级优先正常。')
 if name=='check_photo_package.py':
  t=t.replace("OWN/'Demo/建筑与五层展示.html',","OWN/'Demo/建筑与五层展示.html', OWN/'Demo/到座登记.html', OWN/'Demo/规则与感知技术演示.html',")
  t=t.replace('== 16','== 16').replace('source_files_match=30','source_files_match=len(source_files)').replace('demo_html_match=2',"demo_html_match=len(list((HERE/'dist').glob('*.html')))")
 if name=='make_documents.py':
  t=t.replace("'source_files_in_line_guide':30","'source_files_in_line_guide':35").replace('2026-10-16','2026-10-18')
  t=t.replace('当前状态：软件原型与本地视觉技术验证；馆内实时接口及现场准确率尚未验证。','当前状态：完整模型分层选座与本机读者自助登记；规则融合和视觉另作技术研究演示。未连接全馆共享、真实预约或感知接口。')
 p.write_text(t,encoding='utf-8')
p=H/'content.py'
with p.open('a',encoding='utf-8') as f:
 f.write('''
# 当前服务入口与技术研究模块的统一说明。自助登记是现阶段交互来源，感知是可选后续路线。
PROPOSAL[0][1].insert(1,'现阶段可运行入口采用读者自主登记，不要求学生安装监控。完整模型阅览椅位按一至五楼分别展示，读者到现场后选择座位并登记本人入座、暂离或离座。记录注明读者申报来源和时间，未登记或过期进入待核对。全馆共享状态、真实预约和校内身份尚未接入；模型数量和编号不能当成真实座位统计。')
PROPOSAL.append(('12 分层座位与读者自主登记',['座位入口由三维同源桌椅数据生成，分别展示一至五楼，支持北、南、东分区、状态过滤和每页48把椅子的座位卡。完整模型中共有1012把阅览椅，属于示意模型数量，含固定专座；咖啡厅及研讨室内部陈设椅不纳入普通选座。正式上线必须替换为馆方授权逐座清单。','读者登记界面与选座界面分开。选择座位后，用户勾选已在现场核对并遵守馆方规则，再登记本人入座、暂离、离座或有物待核对。本机匿名标识仅用于演示本人后续办理；它不是校内身份认证。不能覆盖别人有效的有人或暂离登记，也不能因此取消预约或开放专座资格。','在座登记可选30分钟、1小时、2小时或4小时；暂离、有物与离座登记15分钟到期。到期统一转为待核对，绝不把超时推断为空位。有效离座登记只可作为初筛信息，最多给出四个位置及主题、临窗和示意设施距离的解释；到场仍要复核。','本机浏览器保存椅位主键、布局签名、动作、时间与匿名标识，不采集姓名、学号、视频或人脸。若不允许本地保存，就明确提示仅当前内存有效。全馆手机和入口大屏需要共享数据库、身份校验、并发控制、错误纠正和维护职责才能同步。','产品入口的完整椅位登记，与规则研究入口的60个可重复样本分属不同模块。研究入口用于验证预约、观测与资源规则，单帧视觉用于检验技术可行性；它们没有冒充真实全馆感知。AI在后续可将自然语言任务转为可核对的筛选条件，但不能越过使用权、时效和可靠性约束。']))
for title,paras,*rest in PROPOSAL:
 for i,p in enumerate(paras):
  if '共83项' in p:paras[i]=p[:p.index('当前已执行')]+'当前完成129项程序检查，包括88项规则、空间、步行与内存事件检查，以及25项自主登记规则和16项新分层页面内存事件检查。检查不等于真实浏览器、全馆同步、用户调研或馆内准确率验收。'
MANUAL.insert(0,('本手册的阅读入口',['先打开00_打开查看.html，这是答辩、模型、座位服务和文件的总入口。当前产品入口是Demo/嘉庚知座.html，先选楼层再看完整模型阅览椅位；到座登记可从独立按钮进入。Demo/规则与感知技术演示.html用于学习原有规则研究模块的60个模拟样本，模块范围不同，不能将其数量或观测当成全馆真实状态。','新增分层页面的35个完整源文件均收在代码包及逐行学习页。seat-status.js处理读者登记规则，seat-page.js处理楼层、分页、筛选与点位联动，seat-page.html负责样式和结构。这里的登记仅保存在本机浏览器，正式共享服务仍需馆方后台与身份系统。']))
MANUAL.append(('分层选座和自助登记实现',['createSeatCatalog遍历floorSeatRecords，将每把阅览椅的楼层、北南东标签、坐标与桌型组成列表。主键形式为F3-N001，布局签名包含坐标。这样既能生成完整座位表，也能识别搬动后的旧登记，避免将旧记录错误挂在新位置。','readReports只读已知椅位及有限状态和时间；reportState把没有记录、超时或签名不一致归为待核对，固定专座始终由馆方资格限制。changeReport要求现场确认，保护他人的有效在座或暂离记录，禁止本机同时登记多个在座位置；本机匿名标识不是安全认证，后台必须重新执行所有规则。','seat-page按楼层显示独立界面，卡片每页48个；完整平面椅位方块来自同一坐标。书架由floorRackRecords统一导出，三维和二维不分别维护。点击推荐可跳到相应楼层，点击详情可自动选择区域、放大平面或通过loc参数在三维聚焦。没有状态变化时计时器不重绘，后台标签页停止更新，三维不在本页持续加载。','suggestSeats只初筛有效离座登记并返回最多四个位置；主题楼层、模型临窗和桌型只用于规则解释。没有登记不等于无人，未标记电源的模型座位不能通过电源硬条件。登记来源example明确代表主动载入的示例，不能说成馆内实时结果。','一楼实墙、后部收书室和小桌在GROUND_LAYOUT定义；photo-details建立实际墙段并纳入walk的碰撞对象。台后柜库延伸至后部但与收书室保留通道。前厅沙发前移靠背墙，纵向小书架稍向馆内错开，避免伸入墙体。几何检查验证不能横穿新墙，且服务台后可步行至收书室。']))
FUNCTION_GUIDE.update({'createSeatCatalog':'按三维同源阅览椅位生成完整目录，附布局签名，模型数量不当成真实统计。','reportState':'区分有效读者登记、待核对及馆方专座；过期不自动推断空位。','readReports':'验证本机持久化记录的椅位、签名、状态与有限时间，拒绝未知数据。','changeReport':'处理本人入座、暂离、离座与有物登记；保护其他记录，现场确认是业务前提。','suggestSeats':'从有效离座登记中初筛最多四个位置，说明主题与模型偏好的取舍。','floorRackRecords':'为二维平面图和三维装配输出相同的示意书架位置。'})
''')
# 扩充最新导出记录，不再把延长后的柜库数量写死为48。
p=H/'scene-export.js';t=p.read_text(encoding='utf-8').replace('schematic_compact_cabinets:48','schematic_compact_cabinets:GROUND_LAYOUT.compactBlocks.reduce((n,b)=>n+Math.floor(b.d/6)*4,0)').replace("rooms:['107研讨室','106工作人员室']","rooms:['107研讨室','106工作人员室','收书室'],counter_side_partition_walls:2,receiving_wood_tables:3,sofas_against_front_wall:true")
p.write_text(t,encoding='utf-8')
print('源文件清单、学习说明、创新方案及分包范围已更新')
