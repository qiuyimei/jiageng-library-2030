# 实地说明驱动的布局修订

归档于2026-10-22。脚本来自现存制作工作目录，是布局修改过程的证据；工作路径已脱敏，仅供源码比较，不是当前安装入口。

| 修订主题 | 保留的对应文件 | 当前实现位置 |
| --- | --- | --- |
| 前台中轴与左右翼关系 | `revise_axis_materials.py` | `src/spatial.js`、`src/library-layout.js` |
| 上层范围、两侧角落厕所与五楼配置 | `revise_floor_extent.py`、`upper-layout-check.json` | `src/library-layout.js`、`src/photo-details.js` |
| 一楼107、106、咖啡厅与服务空间 | `revise_ground_rooms.py` | `src/photo-details.js`、`src/spatial.js` |
| 一楼后沿与上层延伸的区别 | `revise_rear_depth.py` | `src/spatial.js`、`src/walk.js` |
| 专座后方电梯至侧墙楼梯的交通区 | `revise_terminal_span.py`、`terminal-placement-check.json` | `src/photo-details.js` |
| 设施门面朝向 | `update_ground_facing_text.py` | `src/photo-details.js` |
| 南北/东区书架与桌椅朝向 | `finish_orientation_sources.py` | `src/spatial.js` |
| 区域收紧、标签与界面压缩 | `finish_compact_sources.py` | `src/model.js`、HTML模板 |
| 家具重叠与楼梯通道检查 | `prepare_collision_delivery.py`、`overlap-audit.json` | `src/walk.js`及相应几何测试 |

几何检查是程序检查，不能证明馆舍测量精度、真实WebGL交互或消防/无障碍合规。部分房间功能和尺寸仍为未测量的示意；现场照片属于设计依据，不是已标注的检测训练集。历史记录中存在后续被修订的布置，应以当前源码与文档为准。
