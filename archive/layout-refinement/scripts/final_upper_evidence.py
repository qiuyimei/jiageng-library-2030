from pathlib import Path
import json,hashlib
H=Path(__file__).parent
# 这77页已完成逐页视觉复核：52页新查看，25页与先前复核的像素完全一致。
rows={}
for i,info in enumerate(json.loads((H/'pdf-review.json').read_text(encoding='utf-8'))):
 for n in range(1,info['pages']+1):
  p=H/'qa'/str(i)/f'page-{n:02d}.png';rows[str(p.relative_to(H/'qa'))]=hashlib.sha256(p.read_bytes()).hexdigest()
(H/'front-doc-before.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
p=H/'content.py';t=p.read_text(encoding='utf-8')
t=t.replace('后部back为-30，用于完整呈现后部功能。','后部back按2乘电梯Z减front计算为-52.6，在示意比例中让电梯前后纵深相等，完整呈现后部功能。')
t=t.replace('rooms是二至四楼后部研讨室','rooms是二至四楼后部外围房间带').replace('房间每侧一间、存包柜160个示意门格','房间带每侧三个外形分段、存包柜160个示意门格')
t=t.replace('二至四楼补前后书架及后方研讨室','二至四楼补前后书架及外围房间带').replace('房间、柜数、尺寸未测绘；','房间用途、柜数、尺寸待核；')
t=t.replace('上层静态厕所、研讨室、书架和五楼后墙柜列','上层静态厕所、外围房间带、书架和五楼后墙柜列').replace('有门洞的研讨室和五楼后墙存包柜','有门洞的外围房间带和五楼后墙存包柜')
t+='''
MANUAL[10][1].append('本次额外核对厦大官方2024漳州校区图书馆指南第14至18页的一至五楼平面、第56页的研讨室照片与数量说明，以及嘉庚馆方2025馆藏图。两版图朝向与馆藏分区不相同，当前大类采用2025图；2024图用于建筑与设施关系的交叉核查。2024资料记录7间研讨室，但不能据此把模型里的每个房间分段都认作当前可预约研讨室。模型不编造正式房号、房间预约资格或接口；未知用途标功能房间带。两条方向的扩展尺度是本人确认的相对关系，不是从官方图测出的米数。')
'''
p.write_text(t,encoding='utf-8')
p=H/'make_documents.py';t=p.read_text(encoding='utf-8');anchor=" ('2025馆藏参考','https://library.xujc.com/2025/0901/c4536a161543/page.htm'),";assert anchor in t
t=t.replace(anchor,anchor+"\n ('厦大2024漳州校区官方指南（14—18页平面，56页研讨室）','https://library.xmu.edu.cn/contentfiles/xinsheng/2024ZhangzhouGuide.pdf'),\n ('2026五楼存包柜通知','https://library.xujc.com/2026/0914/c5024a172765/page.htm'),\n ('当前研讨室预约入口','https://xyfw.xujc.com/index/discuss/index.html'),")
p.write_text(t,encoding='utf-8')
p=H/'model-template.html';t=p.read_text(encoding='utf-8');triple='<option value="golden">夕阳西下</option>'*3;t=t.replace(triple,'<option value="golden">夕阳西下</option>')
t=t.replace('<details class="lighting">','<details class="lighting"><summary>布局资料依据</summary><p>方位与馆藏参考馆方2025图，建筑交通另核对厦大2024指南。桌数、柜数、房间用途和尺寸仍需现场核验。</p><a href="https://library.xujc.com/2025/0901/c4536a161543/page.htm" target="_blank" rel="noopener">2025馆藏布局</a> · <a href="https://library.xmu.edu.cn/contentfiles/xinsheng/2024ZhangzhouGuide.pdf#page=16" target="_blank" rel="noopener">官方楼层平面图</a></details><details class="lighting">',1)
p.write_text(t,encoding='utf-8')
evidence={'checked':'2026-10-14','primary_sources':[
 {'url':'https://library.xmu.edu.cn/contentfiles/xinsheng/2024ZhangzhouGuide.pdf','published':'2024-09','visually_read_pages':[14,15,16,17,18,56],'findings':['一至五楼的外轮廓、外围房间、侧边电梯与楼梯、中庭和两侧厕所','五楼平面有座位区、书包柜与报刊图书区，不能说全楼没有其他功能','第56页7间研讨室为2024快照，不保证2026数量']},
 {'url':'https://library.xujc.com/2025/0901/c4536a161543/page.htm','published':'2025-09-01','visual_local_copy':'work/model3d_v3/reference_layout_full.png','findings':['东在上、西在下，北在左、南在右','电梯在南侧中段交通区，前后馆藏区域延续','2024图的馆藏分类与2025图存在差异，当前分类采用2025图','外围标房号，不能把每个房号自动认作研讨室']},
 {'url':'https://library.xujc.com/2026/0914/c5024a172765/page.htm','findings':['馆方确认五楼存包柜存在，不提供柜列尺寸或本模型的示意门格数量']},
 {'url':'https://xyfw.xujc.com/index/discuss/index.html','findings':['研讨室通过官方系统申请；本模型不代理申请']}],
 'user_confirmations':['一楼保留已确认布置','二三楼横向及电梯前后均补完整','三楼金球、白瓷、木雕、纵向书桌顺序保留','上层两侧有厕所，五楼后方有存包柜'],
 'not_verified':['建筑长度和宽度的米数','全部座号、桌数、柜数','2026各房间的当前用途和准确门位','完整消防和无障碍通行测量'],
 'model_dimensions_basis':'用户确认的相对长度关系与未测量模型单位；官方图只核对方位和空间组成，未声称1:1复刻'}
(H/'layout-research-audit.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding='utf-8')
p=H/'package_outputs.py';t=p.read_text(encoding='utf-8').replace('二至四楼前后书架及后部研讨室','二至四楼前后书架及外围房间带')
pos=t.index("ban={");t=t[:pos]+"shutil.copy2(HERE/'layout-research-audit.json',OWN/'验证记录/官方布局资料核对.json')\n"+t[pos:];p.write_text(t,encoding='utf-8')
print('Official evidence, final document content and model reference links prepared')
