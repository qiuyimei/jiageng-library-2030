十座位入门复刻工程
在源码目录安装依赖后运行npm run practice，打开dist/十座位复刻练习.html。
先读main.js，函数按state → recommend → svg/drawMap → draw → parse → showThree排列。
从空目录复刻顺序：
1. 写template的静态表单和SVG容器。
2. 自己建立十条seats和records，打印一个状态。
3. 写state，验证专座与过期。
4. 写recommend，先筛选，再排序，再slice(0,4)。
5. 写SVG工厂与drawMap，点座位改变selected。
6. 写候选按钮、文字解析与确认，避免自动登记。
7. 写showThree，复用同一份seats坐标。
8. 写面板返回，保留选择；再读正式项目的跨页快照。
每一步单独运行；看懂后隐藏参考重写，不要只复制整个文件。
练习没有真实认证、存储、登记、暂离与馆方预约，不可作为正式系统使用。
