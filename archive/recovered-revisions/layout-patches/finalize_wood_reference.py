from pathlib import Path
import json
HERE=Path(__file__).parent;DATA=HERE.parent/'photo_reference_20261014'
p=HERE/'photo-reference.js';s=p.read_text(encoding='utf-8');refs=json.loads(s[s.index('['):s.rindex(']')+1]);by={r['id']:r for r in refs}
by['wood'].update(label='三楼展厅后方：木雕与围绳',floor=3,eye=[5,3.6,-9.2],target=[0,1.2,-15.8],ceiling=False,description='R51木雕在三楼展厅后方，保留概括木雕、底座、金色立柱和红色围绳；其后是座位，再更后方是靠窗书架。')
by['exhibition']['description']=by['exhibition']['description'].replace('小展品','木雕围绳展陈')
p.write_text('// 照片对照入口；坐标为照片关系示意，未测绘。\nexport const PHOTO_REFERENCES='+json.dumps(refs,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
(DATA/'reference-scenes.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
for name in ['model.js','content.py','prepare_photo_delivery.py','package_outputs.py']:
 p=HERE/name;s=p.read_text(encoding='utf-8').replace('小展品','木雕围绳展陈');p.write_text(s,encoding='utf-8')
p=DATA/'photo-analysis.json';rows=json.loads(p.read_text(encoding='utf-8'))
for row in rows:
 if row['id']==51:
  for k,v in row.items():
   if isinstance(v,str):row[k]=v.replace('入口','三楼展厅后方')
  row['placement_confirmation']='2026-10-14由用户确认在三楼展厅后方；原图确认木雕轮廓、底座、金色柱与红色围绳。'
p.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
