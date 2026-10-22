from pathlib import Path
import re, shutil
H=Path(__file__).parent
def edit(name,fn):
 p=H/name;t=p.read_text(encoding='utf-8');p.write_text(fn(t),encoding='utf-8')
css='''.seat-board-row{display:grid;grid-template-columns:45px 1fr;gap:12px;align-items:center;margin:14px 0}.seat-board-chairs{display:grid;grid-template-columns:repeat(12,minmax(55px,1fr));gap:7px}.seat-light{min-height:72px;padding:6px 2px;font-size:10px;background:#eef1ea;border:1px solid #c4cdc1;color:#53645a}.seat-light b,.seat-light span{display:block}.seat-light span{margin-top:8px;font-size:11px}.seat-light[data-state=occupied]{background:#f0d9d3;color:#83463c}.seat-light[data-state=protected]{background:#eee4cb;color:#806026}.seat-light[data-state=unknown]{background:#e1e5e7;color:#596970}.seat-light[data-state=mine]{background:#d1e5f0;color:#285e83}.seat-light.ranked{border:2px solid #bb8732;background:#fff0b4;box-shadow:0 0 14px #d4a4338a;color:#5d4217}.seat-light.rank-1{background:#ffdf6c;box-shadow:0 0 18px #d4a433b0}.seat-light.chosen{outline:3px solid #22765c;outline-offset:2px}.seat-board-help{font-size:12px;color:#65756c}@media(max-width:1100px){.seat-board-chairs{grid-template-columns:repeat(6,minmax(55px,1fr))}}@media(max-width:600px){.seat-board-chairs{grid-template-columns:repeat(4,minmax(50px,1fr))}.seat-board-row{grid-template-columns:30px 1fr}}'''
def template(t):
 t=t.replace('比较三个候选','比较最多四个优先位置').replace('生成三个候选方案','生成优先座位')
 t=t.replace('</style>',css+'</style>')
 mark='<div class="floors" id="floors" aria-label="五层状态总览"></div>'
 assert mark in t
 return t.replace(mark,mark+'<section class="panel" style="margin-bottom:22px"><h2>发光座位表与本次优先级</h2><p id="boardStatus" aria-live="polite"></p><div id="seatBoard" aria-label="五层模拟座位优先级表"></div><p class="seat-board-help">60个模拟椅位按编号排列，表格不是全馆真实平面。第1至4优先来自当前推荐结果，点击可联动平面、理由与三维。发光表示建议，不是锁座；数据过期、规则离线或条件改变时撤回优先灯。</p></section>')
edit('template.html',template)
edit('tests.js',lambda t:t.replace('推荐最多三个且全满足规则','推荐最多四个且全满足规则').replace('r.items.length,3','r.items.length,4'))
edit('model-dom-test.cjs',lambda t:t.replace('ids.modelCandidates.children.length,3','ids.modelCandidates.children.length,4'))
edit('walk-tests.js',lambda t:t.replace("二三楼新增横向翼部有楼面，一四五楼同位置没有楼板","二至五楼新增横向翼部有楼面，一楼不扩大").replace('walkSurface(27.4,17','walkSurface(-27.4,17').replace('floor===2||floor===3','floor>1'))
def modelTemplate(t):
 t=re.sub(r'(<button id="walkStair">定位下楼口</button>){2,}',r'\1',t)
 mark='<button data-floor="5">5F</button></div>'
 return t.replace(mark,mark+'<div><button id="cultureView">中日文化交流中心 · 4F</button><button id="periodicalsView">报刊与外文书 · 5F</button></div>')
edit('model-template.html',modelTemplate)
def model(t):
 mark=" $('expand').onchange=()=>{expanded=$('expand').checked;setView(view);};"
 assert mark in t
 new=""" function showFacility(kind){
  enterSeatView();expanded=false;showFurniture=true;showInformation=false;labelOn=true;showRoof=false;showCeiling=false;
  floor=kind==='culture'?4:5;$('photoPanel').hidden=true;$('expand').checked=false;$('furniture').checked=true;$('informationLayer').checked=false;
  setView('cut');const y=height(floor),p=kind==='culture'?upperFacilities(4).culture:{x:-27,z:2};
  camera.position.set(p.x+18,y+17,p.z+26);controls.target.set(p.x,y+1,p.z);controls.update();dirty=true;
  $('viewStatus').textContent=kind==='culture'?'四楼东南侧中日文化交流中心。家具及门位为示意。':'五楼北/西侧保留报纸、现刊、过刊与外文原版书，东侧为备考联盟。';
 }
 $('cultureView').onclick=()=>showFacility('culture');$('periodicalsView').onclick=()=>showFacility('periodicals');
"""
 t=t.replace(mark,new+mark)
 t=t.replace("text:s.id+(s.id===selected?' · 已选':'')","text:s.id+(plan.items.find(i=>i.seat.id===s.id)?.rank?' · 第'+plan.items.find(i=>i.seat.id===s.id).rank+'优先':'')+(s.id===selected?' · 已选':'')")
 t=t.replace("...f.rooms,...(f.lockers?","...f.rooms,...(f.culture?[f.culture]:[]),...(f.lockers?")
 t=t.replace('右侧中段是白墙围合的交通区','右侧墙边中段是白墙围合的交通区')
 return t
edit('model.js',model)
poster=Path('<user-home>/.codex/generated_images/01a12714-1060-7cd2-b76c-72afc5fd51a8/exec-903d798c-be24-4e4c-a40f-ba0bebb74ce9.png')
dest=H/'aigc';dest.mkdir(exist_ok=True);shutil.copy2(poster,dest/'01_暖光选座海报.png')
print('Updated priority UI and facility shortcuts. Copied AIGC poster 01.')
