嘉庚知座当前源码  集成版1.0

本目录是可运行实现，逐行代码对照.html是学习读本，不替代这些源文件。
普通使用打开作品展示中的成品HTML，不需要Node。
开发：在本目录开终端，npm ci；npm run test:core；npm run build。
输出：dist/嘉庚知座.html、建筑与五层展示.html、规则与感知技术演示.html、到座登记.html。
普通页面使用文字、展示状态与本机登记；可选本地语音另见语音服务。
Node包固定Three.js 0.180.0、esbuild 0.25.10；锁文件用于复现。

主应用：seat-page + seat-status + seat-voice + seat-navigation。
三维：model + spatial + library-layout + architecture + photo-details + walk + lighting。
导览：model-tour；清晰度与展开：model-presentation；历史弹窗：model-history。
独立60合成样本研究页：app + engine + data + space-layer。
可选单帧视觉实验：vision.py、download_model.py、fixtures与模型来源记录。
本地语音服务：voice_server.py；需要独立Vosk依赖和中文模型，不是Node依赖。

test:core运行纯规则、坐标、步行、需求解析、快照与独立历史控制器检查。
保留的DOM内存脚本不是浏览器/WebGL实测；没有把它们的通过数当成现场验收。
模型目录为1052把生成椅位，并非学校官方座位统计。
图像参考资料用于空间研究，不是已完成标注的训练集。
没有校内预约、真实身份、全馆共享后台或摄像头接入。

维护：改源码或模板 → 相关测试 → 重新构建 → 人工检查真实浏览器与目标屏幕。
不要提交node_modules、原声录音、私人形象、照片全集、模型权重和秘密凭据。
