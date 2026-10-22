from pathlib import Path
H=Path(__file__).parent
p=H/'app.js';t=p.read_text(encoding='utf-8').replace('ELEVATOR_LAYOUT,TRANSPORT_CORE}', 'ELEVATOR_LAYOUT,TRANSPORT_CORE,floorMapTransform,floorBounds,upperFacilities}')
a=t.index('function drawMap(){');b=t.index('function drawDetail(){');s=t[a:b]
s=s.replace('const oy=floor===1?177:215,ys=floor===1?5.4:7;', 'const {ox,oy,xs,zs:ys}=floorMapTransform(floor),bounds=floorBounds(floor);')
s=s.replace('340', 'ox').replace('*12','*xs').replace('*6','*xs/2')
old="map.append(svg('rect',{x:124,y:61,width:432,height:308,rx:3,fill:'#e9e4d7',stroke:'#b6c4b7'}));"
new="map.append(svg('rect',floor===1?{x:124,y:61,width:432,height:308,rx:3,fill:'#e9e4d7',stroke:'#b6c4b7'}:{x:ox+bounds.left*xs,y:oy+bounds.back*ys,width:(bounds.right-bounds.left)*xs,height:(bounds.front-bounds.back)*ys,rx:3,fill:'#e9e4d7',stroke:'#b6c4b7'}));"
assert old in s;s=s.replace(old,new)
start=s.index('if(floor!==1)');end=s.index('\n else{',start)
s=s[:start]+'''if(floor!==1){
  const facilities=upperFacilities(floor);
  for(const r of facilities.racks)map.append(svg('rect',{x:ox+(r.x-r.w/2)*xs,y:oy+(r.z-.34)*ys,width:r.w*xs,height:.68*ys,fill:'#674f46'}));
  for(const r of [...facilities.toilets.map(r=>({...r,label:'WC'})),...facilities.rooms.map(r=>({...r,label:'研讨室'}))]){
   map.append(svg('rect',{x:ox+(r.x-r.w/2)*xs,y:oy+(r.z-r.d/2)*ys,width:r.w*xs,height:r.d*ys,fill:'#d3ded6',stroke:'#668579'}));
   map.append(svg('text',{x:ox+r.x*xs,y:oy+r.z*ys,'text-anchor':'middle',fill:'#355e50','font-size':10},r.label));
  }
  if(facilities.lockers){const l=facilities.lockers;map.append(svg('rect',{x:ox+(l.x-l.w/2)*xs,y:oy+(l.z-l.d/2)*ys,width:l.w*xs,height:l.d*ys,fill:'#91aba2'}));map.append(svg('text',{x:ox+l.x*xs,y:oy+(l.z+2)*ys,'text-anchor':'middle','font-size':10,fill:'#355e50'},'后墙连续存包柜（柜数示意）'));}
  if(floor===2||floor===3)map.append(svg('line',{x1:ox+ELEVATOR_LAYOUT.x*xs,y1:oy+bounds.back*ys,x2:ox+ELEVATOR_LAYOUT.x*xs,y2:oy+bounds.front*ys,stroke:'#c59846','stroke-dasharray':'4 4','stroke-width':1}));
 }'''+s[end:]
t=t[:a]+s+t[b:];p.write_text(t,encoding='utf-8')
p=H/'library-layout.js';t=p.read_text(encoding='utf-8');pos=t.index('\nexport function buildLibraryFloors')
t=t[:pos]+'''\n// 当前显示的空间关系由本人现场补充；导览图的大类信息不等于建筑实测尺寸。
for(const info of FLOOR_INFO)if(info.n>1){
 info.summary+=' 本人补充：上层前部与一楼前沿相齐，两端有厕所；二至四楼前后有书架、后方有研讨室。二三楼横向以电梯为轴两翼等长，尺寸及房间数量未测绘。';
 if(info.n===5){info.title='连续学习座位 · 后墙存包柜';info.summary='展示范围按本人现场说明以座位为主，后墙为连续存包柜，两侧有厕所。馆方2026-09-14通知证实五楼存包柜存在；柜数、桌数和精确坐标未测绘。2025导览图的报刊等馆藏信息另供查询，不能据本区域示意推断全楼馆藏撤除。';info.tags=['连续学习区','后墙存包柜','两侧厕所','实地尺寸待核对'];info.zones=[z('连续学习座位示意',0,27,24,12,'#a9bc8b','study')];}
}
'''+t[pos:];p.write_text(t,encoding='utf-8')
p=H/'spatial.js';t=p.read_text(encoding='utf-8').replace('[-12,-4,4,12,18]','[-12,-4,4,12,15]');p.write_text(t,encoding='utf-8')
p=H/'photo-details.js';t=p.read_text(encoding='utf-8').replace("0,1.65,-l.d/2);","0,1.65,-l.d/2,'#e0e3da');");p.write_text(t,encoding='utf-8')
print('Upper floor facilities, map projection and explanatory labels updated')
