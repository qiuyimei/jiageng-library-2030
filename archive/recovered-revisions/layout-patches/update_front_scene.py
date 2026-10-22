from pathlib import Path
import json
H=Path(__file__).parent
def edit(name,pairs):
 p=H/name;s=p.read_text(encoding='utf-8')
 for a,b in pairs:assert a in s,(name,a);s=s.replace(a,b)
 p.write_text(s,encoding='utf-8')
p=H/'app.js';s=p.read_text(encoding='utf-8')
start=s.index('function drawMap(){');end=s.index('\nfunction drawDetail',start)
part=s[start:end]
part=part.replace(" const map=$('map');map.replaceChildren();"," const map=$('map');map.replaceChildren();const oy=floor===1?177:215,ys=floor===1?5.4:7;")
part=part.replace('215+','oy+').replace('*7','*ys').replace('desk.d*3.5','desk.d*ys/2').replace('y:y-d*3.5','y:y-d*ys/2')
part=part.replace('oy+20*ys','oy+(GROUND_LAYOUT.printPoint.z+2)*ys')
part=part.replace("'左侧靠窗阅览 · 柜式密集书库 · 与三维共用座位编号'","'一楼前厅、专座与设施示意 · 编号与三维共用'")
anchor="  for(const p of GROUND_LAYOUT.printers)"
addition="""  const t=GROUND_LAYOUT.toilet;
  map.append(svg('rect',{x:340+(t.x-t.w/2)*12,y:oy+(t.z-t.d/2)*ys,width:t.w*12,height:t.d*ys,fill:'#ccd8d2',stroke:'#6f8a7d'}));
  map.append(svg('text',{x:340+t.x*12,y:oy+t.z*ys,'text-anchor':'middle',fill:'#3e6258','font-size':10},'WC'));
  for(const p of GROUND_LAYOUT.sofas)map.append(svg('rect',{x:340+(p.x-1.65)*12,y:oy+(p.z-.63)*ys,width:3.3*12,height:1.26*ys,fill:'#e0dbc9',stroke:'#76563e'}));
  const rack=GROUND_LAYOUT.smallShelf;
  map.append(svg('rect',{x:340+(rack.x-rack.w/2)*12,y:oy+(rack.z-rack.d/2)*ys,width:rack.w*12,height:rack.d*ys,fill:'#76563e'}));
  map.append(svg('text',{x:340,y:oy+29*ys,'text-anchor':'middle',fill:'#6c7e70','font-size':11},'前厅 · 沙发与小书架'));
  map.append(svg('text',{x:340+GROUND_LAYOUT.dedicated.x*12,y:oy-8*ys,'text-anchor':'middle',fill:'#64607b','font-size':10},'固定专座（资格按馆方规则）'));
"""
assert anchor in part;part=part.replace(anchor,addition+anchor)
door=" map.append(svg('text',{x:340+ELEVATOR_LAYOUT.x*12"
part=part.replace(door," if(floor===1)map.append(svg('line',{x1:340+ELEVATOR_LAYOUT.x*12,y1:oy+ELEVATOR_LAYOUT.z*ys,x2:340+(ELEVATOR_LAYOUT.x-2)*12,y2:oy+ELEVATOR_LAYOUT.z*ys,stroke:'#f4e8b8','stroke-width':3}));\n"+door)
s=s[:start]+part+s[end:];p.write_text(s,encoding='utf-8')
edit('library-layout.js',[("title:'靠窗阅览 · 密集书库 · 公共服务',summary:'按用户确认的相对关系：正面左侧靠窗座位，内部柜式密集书库，电脑服务台、右侧打印机排及深处电梯入口；正式坐标与数量仍未测绘。',tags:['左侧靠窗座位','内部密集书库','打印机排','右侧电梯']","title:'靠窗阅览 · 固定专座 · 前厅服务',summary:'本人确认：左侧窗边阅览，右侧电梯旁为固定专座，密集书库在左侧与电脑台后方；扩大前厅，补左侧洗手间、两个木框沙发和小书架，打印机排后移。正式坐标、桌型与数量未测绘。',tags:['靠窗阅览','固定专座','服务台后书库','前厅休息']"),
 ("z('柜式密集书库',10.4,2,6,22,'#b6c4cd','storage')","z('台后密集书库',0,.4,7.2,16,'#b6c4cd','storage'),z('固定专座参考区',10.9,2.75,6.4,20.5,'#c5c7d8','study'),z('前厅休息',0,26,28,12,'#e3dcc5','service')")])
edit('photo-details.js',[
 (" function ceiling(parent,n){\n  const g=group(parent,'photo_suspended_ceiling');g.visible=false;"," function ceiling(parent,n){\n  const g=group(parent,'photo_suspended_ceiling');g.visible=false;const depth=n===1?56:39,centerZ=n===1?6:0,endZ=n===1?32:19;"),
 ("11.55,.07,39,x,4.35,0","11.55,.07,depth,x,4.35,centerZ"),
 (".012,.018,39,x+dx,4.30,0",".012,.018,depth,x+dx,4.30,centerZ"),
 ("z<=19;z+=1","z<=endZ;z+=1"),
 ("z<=16;z+=8","z<=(n===1?32:16);z+=8"),
 ("z<=17;z+=6","z<=(n===1?33:17);z+=6"),
 ("for(const z of [-18,-12,-6,0,6,12,18])","for(const z of n===1?[-18,-12,-6,0,6,12,18,24,30]:[-18,-12,-6,0,6,12,18])"),
 (".15,.011,38,x+xx,.159,0",".15,.011,n===1?54:38,x+xx,.159,n===1?6:0"),
 ("z<=17;z+=4.25","z<=(n===1?33:17);z+=4.25"),
 (".10,.065,38,-17.9,y,0",".10,.065,n===1?54:38,-17.9,y,n===1?6:0")])
edit('model.js',[
 ('一楼左侧靠窗阅览，内部是柜式密集书库；电脑前台保留，右侧有打印机排和公共通道深处的电梯入口。','一楼左侧窗边阅览，右侧为固定专座；电脑台后与左侧为密集书库，打印机排已后移。前厅保留宽敞通道，左侧洗手间、两个木框白坐垫沙发和小书架可见。一楼电梯门朝馆内。'),
 ("view==='rear'?75:expanded?65:36","view==='rear'?75:expanded?65:floor===1?42:36"),
 ("camera.position.set(0,y+92,.001);controls.target.set(0,y,0)","camera.position.set(0,y+92,floor===1?6.001:.001);controls.target.set(0,y,floor===1?6:0)"),
 ("floor?58:77);controls.target.set(0,y+1,0)","floor===1?68:floor?58:77);controls.target.set(0,y+1,floor===1?6:0)")])
p=H/'photo-reference.js';s=p.read_text(encoding='utf-8');refs=json.loads(s[s.index('['):s.rindex(']')+1])
for r in refs:
 if r['id']=='counter':r.update(label='一楼：前厅与电脑服务台',eye=[22,13,43],target=[0,1.6,13],description='R61确认电脑服务台，R07/R09确认木框白坐垫沙发和低矮书架；前厅、左侧洗手间、右侧专座与台后书库按本人确认相对布置，数量和尺寸示意。')
p.write_text('// 相机定位和照片依据；尺寸未测绘。\nexport const PHOTO_REFERENCES='+json.dumps(refs,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
(H.parent/'photo_reference_20261014/reference-scenes.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
print('Updated expanded ground-floor scene, SVG and photo camera.')
