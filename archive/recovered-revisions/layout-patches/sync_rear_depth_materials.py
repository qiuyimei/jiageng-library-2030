from pathlib import Path
import json
H=Path(__file__).parent
def revise(name,replacements):
 p=H/name;t=p.read_text(encoding='utf-8')
 for a,b in replacements:
  assert a in t,(name,a[:80]);t=t.replace(a,b)
 p.write_text(t,encoding='utf-8')
revise('photo-reference.js',[( '      23,\n      13,\n      -0.5','      38,\n      16,\n      -27'),('      11.4,\n      1.1,\n      -11.0','      27,\n      1.1,\n      -46'),('本人确认电梯位于右侧中段','本人最新确认一楼右侧后沿与左侧基本齐平；专座后方的交通区内电梯靠专座侧、楼梯靠右墙侧')])
revise('app.js',[("y:oy-8*ys", "y:oy+GROUND_LAYOUT.dedicated.z*ys")])
revise('model.js',[("左侧书桌与密集书库向后延伸。打印及专座内移，右翼补107、咖啡厅、106，电梯门前两端可通行。", "左右后沿基本齐平，左侧书桌与密集书库、右侧专座与咖啡厅均向后延伸。107在右前，106在咖啡厅之后，末端电梯门前两端可通行。")])
revise('make_visuals.py',[("左侧桌排和柜库延长；打印专座内移，右侧107、长条咖啡厅及106按本人说明定位，数量与尺寸示意。", "左右后沿齐平，专座与咖啡厅补长；106后移，末端电梯与侧梯逐层对齐。数量与尺寸示意。")])
revise('content.py',[
 ('二至五楼右侧中段有白墙围合的电梯与侧楼梯交通区','各层共用右侧靠墙的白墙电梯与侧楼梯交通区'),
 ('右侧中段电梯与侧楼梯由白墙围合并贴侧墙','右侧电梯与侧楼梯由白墙围合并贴侧墙'),
 ('右侧32把示意椅子没有seatId','右侧固定专座外形椅子没有seatId'),
 ('一楼左侧桌排及柜库延长；右侧电梯之后的其他建筑从楼板轮廓与步行边界中排除。','一楼左右后沿按本人最新确认基本齐平，去除旧的右翼中途截断。左侧桌排及柜库、右侧固定专座和咖啡厅均向后延展。107仍在右前，106移到咖啡厅后，末端交通区电梯靠专座侧、楼梯靠外墙侧；后部留横向通路。'),
 ('z=-9.3逐层对齐','z=-44.7逐层对齐'),
 ('本轮按本人说明同步修改一楼的纵深、窗边阅览、内移的专座与打印、107研讨室、咖啡厅及106工作人员室。','本轮按本人说明同步修改一楼左右后沿、窗边阅览、延长的专座和咖啡厅、后移的106工作人员室及末端交通区；107和内移打印点保留。'),
 ('前门x=26.7、z=-7.6，先沿x=19.1走到z=-6.35','前门x=26.7、z=-43，先沿x=19.1走到z=-41.7')])
for name in ['check_upper_delivery.py','record_final_review_20261015.py','package_current.py','sync_axis_presentation.py']:
 p=H/name;t=p.read_text(encoding='utf-8')
 t=t.replace('一楼左后延伸','一楼左右后沿齐平、右翼专座及咖啡厅补长、106后移').replace('一楼左侧桌排及柜库延至上层同等纵深','一楼左右后沿基本齐平，左侧桌排及柜库、右侧固定专座和咖啡厅均补至完整纵深，106后移至咖啡厅与末端交通区之间')
 t=t.replace('一楼左侧桌排及柜库延长；右侧电梯之后的其他建筑从楼板轮廓与步行边界中排除','一楼左右后沿基本齐平，右侧专座与咖啡厅补长，106后移，末端交通区与各层井道对齐')
 t=t.replace('左后部延至上层纵深','左右后沿基本齐平，右侧专座和咖啡厅补长、106后移，末端为电梯与侧梯')
 t=t.replace('2026-10-15本人修订','2026-10-16本人确认').replace('建模依据核查日期：2026-10-15','建模依据整理日期：2026-10-16')
 t=t.replace('final-rooms/','final-rear-depth/').replace('.codex-finalizer-rooms/','.codex-finalizer-rear-depth/').replace('qa_rooms_20261015','qa_rear_depth_20261016')
 p.write_text(t,encoding='utf-8')
revise('deck_build/build_deck.mjs',[("final-rooms", "final-rear-depth"),(".codex-finalizer-rooms", ".codex-finalizer-rear-depth"),("打印与专座内移，电梯厅两端开口。", "打印内移，左右后沿基本齐平，专座与咖啡厅补长，106后移至末端交通区之前；电梯厅两端开口。")])
revise('preview_rooms_update.py',[("qa_rooms_20261015", "qa_rear_depth_20261016"),("[13.9,1,-1]", "[13.9,1,-19]"),("[26.8,1,6.5]", "[26.8,1,-8.9]"),("[30.8,1,-5.4]", "[30.8,1,-38.3]"),("[26.7,1,-11]", "[26.7,1,-46]"),("(26.7,60,-9.29),(26.7,5,-9.3),[],17", "(26.7,60,-46.69),(26.7,5,-46.7),[],17")])
print('SYNCED NEW DEPTH DESCRIPTIONS')
