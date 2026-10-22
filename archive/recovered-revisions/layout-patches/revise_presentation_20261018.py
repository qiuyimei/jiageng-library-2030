from pathlib import Path
H=Path(__file__).parent
p=H/'seat-page.html';s=p.read_text(encoding='utf-8')
s=s.replace('载入示例登记','重置演示状态').replace('移除示例登记','仅用本人登记')
s=s.replace('偏好模型临窗位置','偏好两侧临窗桌排')
s=s.replace('每层有独立界面；全部模型椅位均列出，专座另作标记。','先选楼层；座位图与列表切换查看，专座另作标记。')
s=s.replace('<section class="panel"><div class="list-head">','<section class="panel" id="seatWorkspace"><div class="toolbar view-switch"><button id="showMap" class="active">座位图</button><button id="showList">座位列表</button><span class="small">同一楼层，两种查看方式</span></div><div class="list-head">',1)
s=s.replace('<div id="seatCards" class="board">','<div id="listContent" hidden><div id="seatCards" class="board">',1)
s=s.replace('<div id="seatDetail" class="seat-detail" hidden aria-live="polite"></div></section>','</div><div id="seatDetail" class="seat-detail" hidden aria-live="polite"></div><div id="planMount"></div></section>',1)
start=s.index('<section class="panel" id="planPanel">');end=s.index('</section>',start)+len('</section>')
plan=s[start:end].replace('class="panel"','class="plan-pane"',1).replace('与三维同源的单层座位图','本层座位图').replace('重置</button>','适配窗口</button>')
plan=plan.replace('拖动滚动条查看完整楼层，或先选择北、南、东分区。编号放在椅位框内，数字为本区座号；点击椅位与上方座位卡联动。示意坐标，不用于真实导航。','初始完整适配窗口。选择北、南、东分区看局部；需要时再放大。左右外围桌排均标为临窗带。点击椅位查看详情。')
s=s[:start]+s[end:];s=s.replace('<div id="planMount"></div>',plan)
s=s.replace('</style>', '''
/* 选座工作区保持有限高度，完整清单通过分页访问。 */
.top-inner,main{max-width:1240px}.panel{padding:18px;margin-bottom:16px}.top-inner{padding-top:14px;padding-bottom:14px}.heading{margin-top:12px}h1{font-size:28px}.stats{margin:8px 0}.legend{margin:10px 0}.board{grid-template-columns:repeat(8,minmax(0,1fr));gap:8px;margin-top:12px}.seat{min-height:62px;padding:7px 3px}.seat strong{font-size:15px}.seat-pages{margin-top:12px}.view-switch{margin-bottom:14px}.view-switch span{margin-left:auto}.list-head h2{font-size:18px}.list-head p{font-size:12px}.map-stage{height:clamp(300px,49vh,460px);min-height:0;max-height:460px;overflow:auto}.plan{max-width:none;min-width:100%;min-height:100%;background:#e8e5d8}.plan-pane h2{font-size:18px}.results:has(>.small){display:flex;align-items:center}.result{padding:10px 12px}.result p{margin:4px 0}.notice{padding:9px 14px}.floor-tile{min-height:135px;padding:18px}.floor-grid{gap:10px;margin:16px 0}.floor-tile strong{font-size:28px}.seat-detail{padding:14px}.check-form{max-width:none}
@media(max-width:650px){.board{grid-template-columns:repeat(4,1fr)}.map-stage{height:360px}.view-switch span{display:none}.filters{gap:10px}.result{padding:12px}}
</style>''')
p.write_text(s,encoding='utf-8')
# Replace obsolete help text without changing the model geometry.
p=H/'seat-page.js';s=p.read_text(encoding='utf-8').replace("'手动载入的演示登记'","'展示模式的示例登记'")
s=s.replace("'这是本层完整模型座位界面。卡片用于选座，下面的单层图用于核对位置。'","'座位图与列表切换查看；模型两侧临窗桌排均可参与偏好排序。'")
p.write_text(s,encoding='utf-8')
