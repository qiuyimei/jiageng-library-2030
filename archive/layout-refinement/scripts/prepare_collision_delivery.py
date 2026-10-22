"""保留本次检查源码与结果，更新私有学习材料，不增加公开提交范围。"""
from pathlib import Path
import json
H=Path(__file__).parent
def change(name,a,b):
 p=H/name;t=p.read_text(encoding='utf-8');assert a in t,(name,a[:90]);p.write_text(t.replace(a,b),encoding='utf-8')
change('make_visuals.py','4F · 南1模拟预约记录继续保留','本次模拟预约记录继续保留')
change('content.py','真实60个状态样本没有变成全馆覆盖。','60个状态样本没有变成全馆覆盖。')
change('content.py','真实南北座号位置仍待核对。','真实北、南、东座号位置仍待核对。') if '真实南北座号位置仍待核对。' in (H/'content.py').read_text(encoding='utf-8') else None
with (H/'content.py').open('a',encoding='utf-8') as f:f.write("\nFUNCTION_GUIDE.update({'assignRegionalSamples':'二至五楼分别在北、南、东区域选一张示意桌，每桌4个模拟状态；不改变60个状态记录的总数。'})\n")
change('content.py','编号覆盖模型外形座位，但只有60个位置有模拟占用状态；','编号覆盖模型外形座位，但只有60个位置有模拟占用状态；')
# 说明实际修复的交叉类别与检查边界，不作全网格或实测保证。
p=H/'content.py';t=p.read_text(encoding='utf-8');t=t.replace('后部文化中心仍按东南功能方位示意，','穿模复核调整了三楼木雕后桌排、一楼柜式书库与柱子、四楼贴柱书架、五楼部分桌椅；书架用中央隔板及双侧书列表现两面陈列。独立家具之间及其与所列墙柱的包围盒交叉已检查，同一家具内部装配不算作独立穿模。该检查不能代替所有三角面或真实浏览器验收。后部文化中心仍按东南功能方位示意，');p.write_text(t,encoding='utf-8')
change('package_current.py',"copy(H/'terminal-placement-check.json',OWN,'验证记录/后部贯通交通区核对.json')", "copy(H/'terminal-placement-check.json',OWN,'验证记录/后部贯通交通区核对.json')\ncopy(H/'overlap-audit.json',OWN,'验证记录/家具实体交叉与双面书架核对.json')")
change('package_current.py',"# 初次提交成果的明确清单：", "audit_text='在代码包目录另存以下两个文件，完成npm install后执行node run-overlap-audit.cjs。检查按独立家具组的包围盒计算，跳过同一桌椅组内部装配；结果不等于完整三角面或浏览器验收。\\n\\n'\nfor name in ['audit-overlaps.js','run-overlap-audit.cjs']:audit_text+='===== '+name+' =====\\n'+(H/name).read_text(encoding='utf-8')+'\\n\\n'\nwrite(craft,'穿模核对说明与执行源码.txt',audit_text)\n# 初次提交成果的明确清单：")
change('package_current.py','厕所已扩大，字号不变。','厕所已扩大，字号不变。小标签按左北、右南、上东显示模型编号；近景可见未监测外形座位的编号，不将它们算入状态覆盖。书架两面均有书；上层新增后区已缩短，井道及门前点不动，电梯外形沿墙加宽。')
change('record_final_review_20261015.py'," 'evidence':", " 'collision_check':read('overlap-audit.json'),\n 'evidence':")
print('穿模核对及方向标签的交付来源已更新')
