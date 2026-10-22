# 选座服务与交互演进

2026-10-22补充归档。`early-research` 是现存早期规则/感知研究源码，不是当前主选座页；两条链路在当前仓库中继续明确区分。

| 演进 | 早期/证据 | 当前对应 |
| --- | --- | --- |
| 从研究样本到全模型椅位目录 | 早期`data.js`、`engine.js` | `src/seat-status.js`、`src/spatial.js` |
| 分层图与目录列表，地图不再挤满全页 | 早期`template.html` | `src/seat-page.html`、`seat-page.js` |
| 四优先及图表快捷定位 | 推荐规则与当前测试 | `suggestSeats`、候选点击与分页定位 |
| 读者本人登记 | 本机状态设计 | `seat-status.js`：有效期、他人记录与专座保护 |
| 文字/可选语音表达 | 条件确认流程 | `seat-voice.js`、可选`voice_server.py` |
| 三维查看后回到刚才条件 | `navigation-check.json` | `seat-navigation.js`：有限快照、白名单路由、返回时复核 |
| 工具栏精简及空白处导览 | `toolbar-check.json`、`tour-sequence-check.json` | `model-tour.js`、`model-presentation.js` |
| 历史版本视频小弹窗 | `history-ui-check.json` | `model-history.js`：按需载入、关闭暂停 |

当前1052把模型椅子按楼层生成目录，是模型统计，尚未与馆方真实座号逐一校准。状态来自本机登记或明确标记的展示记录，设备共享、校方接口和实地效果仍待实施。独立60样本研究页的Dijkstra路径不能被表述成主页面已经部署的全馆导航。
