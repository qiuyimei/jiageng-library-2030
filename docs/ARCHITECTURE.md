# 架构与验证

## 主应用数据流

`spatial.deskLayouts` → `deskChairPosition` → `floorSeatRecords` → `seat-status.createSeatCatalog`，从共享桌椅数据生成目录。平面、列表与三维定位复用这些坐标。

`表单或语音文本` → `parseSeatDemand` → `用户确认` → `suggestSeats` → `四优先及取舍`。语音不直接办理入座，规则排序不冒充训练模型。

`现场核对` → `changeReport` → `本机JSON` → `reportState` → `地图/列表/候选`。专座先保护；过期、无记录与有物不当成确定空位。

## 三维及返回

Three.js负责几何、相机、光照、射线点选；`model-tour`维护九阶段展示状态；`walk`用共享楼板孔洞、楼梯坡面与世界包围盒限制移动。展开层间距18与行走模型层高4.8分开。

`seat-navigation`只编码有限UI状态。三维返回时按当前记录撤回失效候选，清空现场确认；URL胶囊不包含完整登记或身份，也不是可用性凭证。

## 独立研究链

`data`生成60个合成样本，`engine`研究规则/观测融合、非负权图最短路与最多两个停靠点顺序，`app`展示结果。它不与主应用的1052把模型椅位混作现场覆盖统计。

可选`vision.py`只做指定图片的单帧person/ROI实验，未检出人返回unknown。`voice_server.py`采用预训练Vosk，在回环服务内处理有限WAV。两条链都没有全馆真实部署结论。

## 测试口径

规则28项、空间10项、步行15项、主登记27项、中文条件14项、往返14项、历史控制器8项，以及导览8次状态转移分别记录。它们验证给定输入下的规则与结构，不合并成识别准确率。浏览器、WebGL、声音、真实接口、用户效果与现场政策仍需独立验收。

## 修改路径

- 状态/时效/权重：`seat-status.js`与对应测试。
- 椅位/方向/通道：`spatial.js`、`library-layout.js`与空间/步行检查。
- 文字解析：`seat-voice.js`与`tests/seat-demand.mjs`。
- 视角/导航：`model.js`、`model-tour.js`、`model-presentation.js`。
- 返程恢复：`seat-navigation.js`、页面捕获/恢复和往返测试。

可运行的十座位入门工程在`src/exercises/`，按其README构建；它只用于学习，未实现正式认证或预约。
