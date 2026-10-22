/* 本人零基础学习副本：仅排版和解释，原有业务逻辑不变。
 * 全套架构、实例和修改方法请读文档及源码导航。
 */
/* 学习注释：从 three 导入模块；只有构建后单文件网页才可以直接 file 双击运行。 */
import * as THREE from 'three';
export /* 学习注释：建立 LAYOUT_REFERENCE。 */
const LAYOUT_REFERENCE =
  'https://library.xujc.com/2025/0901/c4536a161543/page.htm';
// Local coordinates follow the guide: east at the top (-Z), north on the left (-X).
// The guide is a collection diagram, not a surveyed architectural or structural drawing.
/* 学习注释：建立 z。 */
const z = (label, x, depth, w, d, color, kind = 'books') => ({
  label,
  x,
  z: depth,
  w,
  d,
  color,
  kind,
});
export /* 学习注释：建立 FLOOR_INFO。FLOOR_INFO：楼层功能资料；二维位置来自示意资料而非现场测绘。 */
const FLOOR_INFO = [
  {
    n: 1,
    title: '公共服务 · 平面待核对',
    summary:
      '新版馆藏分布图未提供一楼平面。本层仅保留借阅服务的概念示意，不声称房间和书架位置已核对。',
    tags: ['借阅服务线索', '平面未公开', '位置待核对'],
    color: '#9ab8c1',
    verified: false,
    zones: [z('借阅服务示意', 0, 13, 10, 4, '#9ab8c1', 'service')],
  },
  {
    n: 2,
    title: 'A—F 类馆藏',
    summary:
      '按2025版导览图：北侧为A、B、C、D类，南侧以F类经济为主，西侧衔接D、E、F类；中央台阶位于西侧方向。',
    tags: ['北侧 A/B/C/D', '南侧 F 经济', '西侧 D/E/F'],
    color: '#c9bf72',
    verified: true,
    zones: [
      z('A 马列', -12, -19, 9, 2, '#d8674e'),
      z('B 哲学宗教', -12, -14, 9, 6, '#d9c948'),
      z('B 哲学宗教', -12, -4, 9, 5, '#d9c948'),
      z('C 社科总论', -12, 2, 9, 4, '#d68848'),
      z('D 政治法律', -12, 8, 9, 6, '#99b95e'),
      z('D 政治法律', -3, 18, 16, 3, '#99b95e'),
      z('E 军事', 6.8, 18, 2.5, 3, '#b69d65'),
      z('F 经济', 12, -13, 9, 11, '#67abc0'),
      z('F 经济', 12, 4, 9, 14, '#67abc0'),
      z('F 经济', 11, 18, 5, 3, '#67abc0'),
    ],
  },
  {
    n: 3,
    title: 'G/H/I 类与西侧展区',
    summary:
      '按2025版导览图：北侧G文化教育及H语言文字，I文学分布于东、南及北侧西端；儿童图书、教材、工具书在东北侧，西侧为展区。',
    tags: ['北侧 G/H', '东南侧 I 文学', '东北侧儿童/工具书', '西侧展区'],
    color: '#87b9c5',
    verified: true,
    zones: [
      z('儿童/教材/工具书', -12, -19, 7, 4, '#d7c647'),
      z('I 文学', -7, -19, 3.5, 4, '#77b5c9'),
      z('I 文学', 0, -19, 4.5, 4, '#77b5c9'),
      z('I 文学', 11, -19, 7, 4, '#77b5c9'),
      z('G 文化教育', -12, -10, 8.5, 6, '#91b557'),
      z('G 文化教育', -12, 1, 8.5, 3, '#91b557'),
      z('H 语言文字', -12, 6, 8.5, 4.5, '#d96751'),
      z('I 文学', -12, 12.5, 8.5, 4.5, '#77b5c9'),
      z('I 文学', 12, -10, 8.5, 6, '#77b5c9'),
      z('I 文学', 12, 7, 8.5, 14, '#77b5c9'),
      z('西侧展区', 0, 20, 21, 4, '#d4c5a0', 'exhibition'),
    ],
  },
  {
    n: 4,
    title: 'J/K 与自然科学、工程技术',
    summary:
      '按2025版导览图：北侧为J艺术与K历史地理，南侧为计算机、工程和技术类；西侧为K/N/O/P-R类，东侧有技术类馆藏及中日文化交流中心。',
    tags: ['北侧 J/K', '南侧技术馆藏', '西侧 K/N/O/P-R', '东侧文化交流'],
    color: '#aaa6bd',
    verified: true,
    zones: [
      z('U—Z 综合/交通', -13, -19, 4, 3, '#6d9b84'),
      z('TU/TV 建筑水利', -8, -19, 3.5, 3, '#83b8c0'),
      z('TU 建筑科学', 0, -20, 4.5, 3, '#83b8c0'),
      z('TP/TS 技术', 8, -19, 4, 3, '#83b8c0'),
      z('中日文化交流中心', 14, -19, 4.5, 3, '#c2c7b2', 'room'),
      z('J 艺术', -12, -10, 9, 9, '#d8cc53'),
      z('J 艺术', -12, 0, 9, 3, '#d8cc53'),
      z('K 历史地理', -12, 8, 9, 11, '#c46a68'),
      z('K 历史地理', -12, 20, 4, 3, '#c46a68'),
      z('N 自然科学总论', -7.5, 20, 3, 3, '#baa579'),
      z('O 数理化', -1, 20, 8, 3, '#c48aa3'),
      z('P—R 天文/生物/医学', 8, 20, 8, 3, '#cc9569'),
      z('TP 计算机', 12, -9, 9, 8, '#83b8c0'),
      z('TP 计算机', 12, 0, 9, 3, '#83b8c0'),
      z('T—TN 工程技术', 12, 7, 9, 7, '#b6b6ad'),
      z('R—S 医药/农业', 12, 14, 9, 2.5, '#c69469'),
    ],
  },
  {
    n: 5,
    title: '东侧备考联盟与北西侧报刊',
    summary:
      '按2025版导览图：备考联盟在东侧；北侧排列报纸、现刊、2019—2024过刊和外文原版书，西侧为2013—2018过刊及2015年至今过报。南侧留白范围未擅自指定用途。',
    tags: ['东侧备考联盟', '北侧现刊/外文书', '西侧过刊/过报', '南侧用途待核对'],
    color: '#bcae81',
    verified: true,
    zones: [
      z('备考联盟区', 0, -14, 27, 15, '#a9bc8b', 'study'),
      z('报纸', -12, -3.5, 8, 2, '#c9be68'),
      z('现刊', -12, 1, 8, 5, '#d7c757'),
      z('2019—2024 过刊', -12, 6.5, 8, 5, '#83b7ac'),
      z('外文原版书 YY/YW', -12, 13, 8, 6, '#759b84'),
      z('2013—2018 过刊', -5, 20, 9, 3, '#c8966c'),
      z('2015年至今过报', 5, 20, 9, 3, '#84b7c7'),
    ],
  },
];

export /* 学习注释：buildLibraryFloors：创建五层内部与结构示意
 * 读取/参数：parent、H、FLOOR_INFO
 * 产生/改变：返回storeys、height=4.8与可选skylight
 * 阅读与修改：楼层数组顺序与n-1关联，首层平面未核对。 */
function buildLibraryFloors(parent, H) {
  /* 学习注释：建立 group、box、cylinder、material、chair、table、height、storeys。material：材质工具或材质对象。storeys：按一至五楼排列的楼层对象数组。 */
  const { group, box, cylinder, material, chair, table } = H,
    height = 4.8,
    storeys = [];
  /* 学习注释：slab：按楼层轮廓创建楼板与中庭洞口
   * 读取/参数：楼层info及root
   * 产生/改变：Shape与holes拉伸为楼板Mesh
   * 阅读与修改：轮廓和洞口为示意，没有导入CAD或结构计算。 */
  function slab(root, info) {
    /* 学习注释：建立 shape。shape：平面轮廓，用于生成带洞口的楼板。 */
    const shape = new THREE.Shape();
    /* 学习注释：建立 pts。pts：二维或三维点列。 */
    let pts = [
      [-18, -22],
      [18, -22],
      [18, 20],
      [11, 20],
      [11, 22],
      [-11, 22],
      [-11, 20],
      [-18, 20],
    ];
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 info.n === 4。 */
    if (info.n === 4)
      /* 学习注释：执行这一句操作：pts = [。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      pts = [
        [-18, -22],
        [-11, -22],
        [-11, -23],
        [-6, -23],
        [-6, -25],
        [6, -25],
        [6, -23],
        [11, -23],
        [11, -22],
        [18, -22],
        [18, 22],
        [-18, 22],
      ];
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 info.n === 5。 */
    if (info.n === 5)
      /* 学习注释：执行这一句操作：pts = [。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      pts = [
        [-18, -20],
        [-14, -20],
        [-14, -22],
        [-7, -22],
        [-7, -24],
        [7, -24],
        [7, -22],
        [14, -22],
        [14, -20],
        [18, -20],
        [18, 22],
        [6, 22],
        [6, 24],
        [-6, 24],
        [-6, 22],
        [-18, 22],
      ];
    /* 学习注释：执行这一句操作：pts.forEach(([x, z], i) => (i ? shape.lineTo(x, -z) : shape.moveTo(x, -z)));。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    pts.forEach(([x, z], i) => (i ? shape.lineTo(x, -z) : shape.moveTo(x, -z)));
    /* 学习注释：执行这一句操作：shape.closePath();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    shape.closePath();
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 info.n > 1。 */
    if (info.n > 1) {
      /* 学习注释：建立 back、front、w。 */
      const back = { 2: -17, 3: -11, 4: -7, 5: -5 }[info.n],
        front = 16,
        w = 6.1;
      /* 学习注释：建立 hole。 */
      const hole = new THREE.Path();
      /* 学习注释：执行这一句操作：hole.moveTo(-w, -back);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      hole.moveTo(-w, -back);
      /* 学习注释：执行这一句操作：hole.lineTo(w, -back);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      hole.lineTo(w, -back);
      /* 学习注释：执行这一句操作：hole.lineTo(w, -front);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      hole.lineTo(w, -front);
      /* 学习注释：执行这一句操作：hole.lineTo(-w, -front);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      hole.lineTo(-w, -front);
      /* 学习注释：执行这一句操作：hole.closePath();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      hole.closePath();
      /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
      shape.holes.push(hole);
    }
    /* 学习注释：建立 geo。geo：局部创建的几何对象。 */
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: false });
    /* 学习注释：执行这一句操作：geo.rotateX(-Math.PI / 2);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    geo.rotateX(-Math.PI / 2);
    /* 学习注释：建立 mesh。 */
    const mesh = new THREE.Mesh(geo, material('#e9e4d7'));
    /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
    mesh.position.y = -0.1;
    /* 学习注释：执行这一句操作：mesh.name = 'guide_outline_floor_slab';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    mesh.name = 'guide_outline_floor_slab';
    /* 学习注释：执行这一句操作：mesh.receiveShadow = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    mesh.receiveShadow = true;
    /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
    root.add(mesh);
  }
  /* 学习注释：rail：创建栏杆横向构件
   * 读取/参数：位置与宽深
   * 产生/改变：加入上横杆与下横杆
   * 阅读与修改：栏杆示意不能当实际高度或安全规范证明。 */
  function rail(root, x, z, w, d) {
    /* 学习注释：执行这一句操作：box(root, 'atrium_rail_top', w, 0.065, d, x, 1.15, z, '#57746a');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(root, 'atrium_rail_top', w, 0.065, d, x, 1.15, z, '#57746a');
    /* 学习注释：执行这一句操作：box(root, 'atrium_rail_lower', w, 0.035, d, x, 0.65, z, '#688177');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(root, 'atrium_rail_lower', w, 0.035, d, x, 0.65, z, '#688177');
  }
  /* 学习注释：rack：组合展示书架
   * 读取/参数：位置、宽度与旋转
   * 产生/改变：背板立柱层板及彩色书组，返回组
   * 阅读与修改：书数与图书真实条目不对应，便于看分区。 */
  function rack(root, x, z, w = 3, rot = 0) {
    /* 学习注释：建立 r。 */
    const r = group(root, 'guide_book_rack');
    /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
    r.position.set(x, 0, z);
    /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
    r.rotation.y = rot;
    /* 学习注释：执行这一句操作：box(r, 'rack_back', w, 2.15, 0.08, 0, 1.22, -0.28, '#bca47f');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(r, 'rack_back', w, 2.15, 0.08, 0, 1.22, -0.28, '#bca47f');
    /* 学习注释：逐项遍历 [-w / 2, w / 2]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 xx。 */
    const xx of [-w / 2, w / 2])
      /* 学习注释：执行这一句操作：box(r, 'rack_upright', 0.08, 2.15, 0.62, xx, 1.22, 0, '#c7b78e');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(r, 'rack_upright', 0.08, 2.15, 0.62, xx, 1.22, 0, '#c7b78e');
    /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
    for (/* 学习注释：建立 row。 */
    let row = 0; row < 4; row++) {
      /* 学习注释：建立 yy。 */
      const yy = 0.23 + row * 0.51;
      /* 学习注释：执行这一句操作：box(r, 'shelf', w, 0.06, 0.64, 0, yy, 0, '#baa782');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(r, 'shelf', w, 0.06, 0.64, 0, yy, 0, '#baa782');
      /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
      for (/* 学习注释：建立 col。 */
      let col = 0; col < 5; col++)
        /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(
          r,
          'book_cluster',
          w / 5 - 0.03,
          0.31,
          0.37,
          -w * 0.4 + (col * w) / 5,
          yy + 0.2,
          0.03,
          ['#789587', '#ba9c70', '#8faab5', '#bc8775', '#9d99b0'][(row + col) % 5],
        );
    }
    /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
    return r;
  }
  /* 学习注释：furnishZone：按功能区类型填充示意设施
   * 读取/参数：zone中的kind、边界与位置
   * 产生/改变：创建色块、书架或学习/展览/服务对象
   * 阅读与修改：自动排数不是现场容量；未知kind走服务示意分支。 */
  function furnishZone(root, zone) {
    /* 学习注释：建立 g。g：当前几何组合组；以所在函数定义为准。 */
    const g = group(root, 'guide_zone_' + zone.label);
    /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
    g.userData.zone = zone.label;
    /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(
      g,
      'guide_function_tint',
      zone.w,
      0.032,
      zone.d,
      zone.x,
      0.18,
      zone.z,
      zone.color,
      { transparent: true, opacity: 0.55 },
    );
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 zone.kind === 'books'。 */
    if (zone.kind === 'books') {
      /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 zone.w < 4。 */
      if (zone.w < 4) {
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 k。 */
        let k = 0; k < Math.max(1, Math.floor(zone.d / 3)); k++)
          /* 学习注释：执行这一句操作：rack(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          rack(
            g,
            zone.x,
            zone.z + (k - (Math.max(1, Math.floor(zone.d / 3)) - 1) / 2) * 2.5,
            Math.min(2.9, zone.w - 0.5),
          );
      } else {
        /* 学习注释：建立 rows、cols。 */
        const rows = Math.max(1, Math.floor(zone.d / 3.3)),
          cols = zone.w > 12 ? 4 : zone.w > 7 ? 2 : 1;
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 r。 */
        let r = 0; r < rows; r++)
          /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
          for (/* 学习注释：建立 c。 */
          let c = 0; c < cols; c++)
            /* 学习注释：执行这一句操作：rack(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
            rack(
              g,
              zone.x + (c - (cols - 1) / 2) * Math.min(3.6, zone.w / cols),
              zone.z + (r - (rows - 1) / 2) * 2.6,
              Math.min(2.9, zone.w / cols - 0.4),
            );
      }
    } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 zone.kind === 'study'。 */
    if (zone.kind === 'study') {
      /* 学习注释：逐项遍历 [-10, -5, 0, 5, 10]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-10, -5, 0, 5, 10])
        /* 学习注释：逐项遍历 [-18, -12, -7]，每轮使用一个元素；不是复制整个场景。 */
        for (/* 学习注释：建立 zz。 */
        const zz of [-18, -12, -7]) {
          /* 学习注释：执行这一句操作：table(g, x, zz, 3.3, 1.1);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          table(g, x, zz, 3.3, 1.1);
          /* 学习注释：逐项遍历 [-0.8, 0.8]，每轮使用一个元素；不是复制整个场景。 */
          for (/* 学习注释：建立 dx。 */
          const dx of [-0.8, 0.8]) {
            /* 学习注释：执行这一句操作：chair(g, x + dx, zz - 0.95, 0);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
            chair(g, x + dx, zz - 0.95, 0);
            /* 学习注释：执行这一句操作：chair(g, x + dx, zz + 0.95, Math.PI);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
            chair(g, x + dx, zz + 0.95, Math.PI);
          }
        }
    } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 zone.kind === 'exhibition'。 */
    if (zone.kind === 'exhibition') {
      /* 学习注释：逐项遍历 [-7, 0, 7]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-7, 0, 7]) {
        /* 学习注释：执行这一句操作：box(g, 'west_exhibition_panel', 3, 1.6, 0.12, x, 1.1, zone.z, '#b2c3b5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(g, 'west_exhibition_panel', 3, 1.6, 0.12, x, 1.1, zone.z, '#b2c3b5');
        /* 学习注释：执行这一句操作：box(g, 'exhibition_graphic', 2.65, 1.15, 0.05, x, 1.2, zone.z - 0.1, '#b49d7f');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(g, 'exhibition_graphic', 2.65, 1.15, 0.05, x, 1.2, zone.z - 0.1, '#b49d7f');
      }
    } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 zone.kind === 'room'。 */
    if (zone.kind === 'room') {
      /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(
        g,
        'cultural_room_low_partition',
        zone.w,
        0.7,
        0.08,
        zone.x,
        0.5,
        zone.z - zone.d / 2,
        '#c7d0c1',
      );
      /* 学习注释：执行这一句操作：table(g, zone.x, zone.z, 2.5, 1.1);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      table(g, zone.x, zone.z, 2.5, 1.1);
      /* 学习注释：执行这一句操作：chair(g, zone.x, zone.z + 1, Math.PI);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      chair(g, zone.x, zone.z + 1, Math.PI);
    } else {
      /* 学习注释：执行这一句操作：box(g, 'service_counter', 8, 1.03, 1.6, zone.x, 0.7, zone.z, '#b2bdac');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(g, 'service_counter', 8, 1.03, 1.6, zone.x, 0.7, zone.z, '#b2bdac');
      /* 学习注释：逐项遍历 [-2, 0, 2]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-2, 0, 2])
        /* 学习注释：执行这一句操作：box(g, 'service_terminal', 0.65, 0.4, 0.1, x, 1.48, zone.z - 0.3, '#506d62');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(g, 'service_terminal', 0.65, 0.4, 0.1, x, 1.48, zone.z - 0.3, '#506d62');
    }
  }
  /* 学习注释：逐项遍历 FLOOR_INFO，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 info。 */
  const info of FLOOR_INFO) {
    /* 学习注释：建立 f。 */
    const f = group(parent, 'library_floor_' + info.n);
    /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
    f.position.y = (info.n - 1) * height;
    /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
    f.userData = {
      floor: info.n,
      title: info.title,
      reference: info.verified
        ? LAYOUT_REFERENCE
        : 'One-floor plan absent from 2025 guide',
      orientation: 'east=-Z; north=-X',
      surveyed: false,
    };
    /* 学习注释：建立 structural、furniture。 */
    const structural = group(f, 'guide_outline_and_frame'),
      furniture = group(f, 'guide_collection_zones');
    /* 学习注释：执行这一句操作：slab(structural, info);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    slab(structural, info);
    /* 学习注释：逐项遍历 [-18, -6.2, 6.2, 18]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-18, -6.2, 6.2, 18])
      /* 学习注释：逐项遍历 [-20, -10, 0, 10, 20]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 zz。 */
      const zz of [-20, -10, 0, 10, 20])
        /* 学习注释：执行这一句操作：box(structural, 'schematic_column', 0.4, 4.35, 0.4, x, 2.25, zz, '#e0dacb');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(structural, 'schematic_column', 0.4, 4.35, 0.4, x, 2.25, zz, '#e0dacb');
    /* 学习注释：逐项遍历 [-18, -6.2, 6.2, 18]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-18, -6.2, 6.2, 18])
      /* 学习注释：执行这一句操作：box(structural, 'schematic_beam', 0.42, 0.28, 42, x, 4.42, 0, '#e2ddcd');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(structural, 'schematic_beam', 0.42, 0.28, 42, x, 4.42, 0, '#e2ddcd');
    /* 学习注释：逐项遍历 [-20, -10, 0, 10, 20]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 zz。 */
    const zz of [-20, -10, 0, 10, 20])
      /* 学习注释：逐项遍历 [-12, 12]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-12, 12])
        /* 学习注释：执行这一句操作：box(structural, 'side_gallery_beam', 12, 0.28, 0.4, x, 4.42, zz, '#e2ddcd');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(structural, 'side_gallery_beam', 12, 0.28, 0.4, x, 4.42, zz, '#e2ddcd');
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 info.n > 1。 */
    if (info.n > 1) {
      /* 学习注释：建立 east、length。 */
      const east = { 2: -17, 3: -11, 4: -7, 5: -5 }[info.n],
        length = 16 - east;
      /* 学习注释：逐项遍历 [-6.05, 6.05]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-6.05, 6.05]) {
        /* 学习注释：执行这一句操作：rail(structural, x, (east + 16) / 2, 0.06, length);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        rail(structural, x, (east + 16) / 2, 0.06, length);
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 zz。 */
        let zz = east; zz < 16; zz += 2.5)
          /* 学习注释：执行这一句操作：box(structural, 'rail_post', 0.045, 1.1, 0.045, x, 0.62, zz, '#64796e');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          box(structural, 'rail_post', 0.045, 1.1, 0.045, x, 0.62, zz, '#64796e');
      }
      /* 学习注释：执行这一句操作：rail(structural, 0, 16, 12, 0.06);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      rail(structural, 0, 16, 12, 0.06);
    }
    /* 学习注释：建立 landingZ。 */
    const landingZ = { 1: 19, 2: 14, 3: 9, 4: 3, 5: -3 }[info.n];
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 info.n < 5。 */
    if (info.n < 5) {
      /* 学习注释：逐项遍历 [-4.7, 4.7]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-4.7, 4.7])
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 step。 */
        let step = 0; step < 22; step++) {
          /* 学习注释：建立 y。 */
          const y = ((step + 1) * height) / 22;
          /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          box(
            structural,
            'central_stair_tread',
            1.45,
            y,
            0.29,
            x,
            y / 2,
            landingZ - step * 0.265,
            '#c8c8ba',
          );
        }
      /* 学习注释：建立 shape。shape：平面轮廓，用于生成带洞口的楼板。 */
      const shape = new THREE.Shape();
      /* 学习注释：执行这一句操作：shape.moveTo(-3.8, 0);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      shape.moveTo(-3.8, 0);
      /* 学习注释：执行这一句操作：shape.absarc(0, 0, 3.8, Math.PI, 0, true);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      shape.absarc(0, 0, 3.8, Math.PI, 0, true);
      /* 学习注释：执行这一句操作：shape.lineTo(-3.8, 0);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      shape.lineTo(-3.8, 0);
      /* 学习注释：建立 geo。geo：局部创建的几何对象。 */
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
      /* 学习注释：执行这一句操作：geo.rotateX(Math.PI / 2);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      geo.rotateX(Math.PI / 2);
      /* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
      const m = new THREE.Mesh(geo, material('#d5d0c0'));
      /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
      m.position.set(0, 0.2, landingZ);
      /* 学习注释：执行这一句操作：m.name = 'photo_guided_curved_landing';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      m.name = 'photo_guided_curved_landing';
      /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
      structural.add(m);
    }
    // Sanitary/service rooms are at the corners; room labels are shown only where the guide supports them.
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 info.n > 1。 */
    if (info.n > 1)
      /* 学习注释：逐项遍历 [-16, 16]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-16, 16])
        /* 学习注释：逐项遍历 [-19, 20]，每轮使用一个元素；不是复制整个场景。 */
        for (/* 学习注释：建立 zz。 */
        const zz of [-19, 20]) {
          /* 学习注释：执行这一句操作：box(furniture, 'corner_service_room', 3.2, 0.45, 3.0, x, 0.35, zz, '#dae1d7');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          box(furniture, 'corner_service_room', 3.2, 0.45, 3.0, x, 0.35, zz, '#dae1d7');
          /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          box(
            furniture,
            'service_partition',
            0.07,
            1.8,
            3.0,
            x - 1.5,
            1.03,
            zz,
            '#d2d9d0',
          );
        }
    /* 学习注释：逐项遍历 info.zones，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 zone。 */
    const zone of info.zones) /* 学习注释：执行这一句操作：furnishZone(furniture, zone);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    furnishZone(furniture, zone);
    // Seats are illustrative. Keep the centre and unassigned guide areas open.
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 info.n === 2 || info.n === 3 || info.n === 4。 */
    if (info.n === 2 || info.n === 3 || info.n === 4)
      /* 学习注释：逐项遍历 [-8.4, 8.4]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-8.4, 8.4]) {
        /* 学习注释：执行这一句操作：table(furniture, x, 14.5, 1.8, 0.9);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        table(furniture, x, 14.5, 1.8, 0.9);
        /* 学习注释：执行这一句操作：chair(furniture, x, 15.4, Math.PI);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        chair(furniture, x, 15.4, Math.PI);
      }
    /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
    storeys.push({ info, root: f, structural, furniture });
  }
  /* 学习注释：建立 skylight。 */
  const skylight = group(parent, 'optional_atrium_skylight');
  /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
  skylight.visible = false;
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  skylight.position.y = height * 5;
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 i。 */
  let i = 0; i < 8; i++) {
    /* 学习注释：建立 zz。 */
    const zz = -13 + i * 4;
    /* 学习注释：建立 pts。pts：二维或三维点列。 */
    const pts = [];
    /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
    for (/* 学习注释：建立 n。 */
    let n = 0; n <= 16; n++) {
      /* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x = -6 + n * 0.75;
      /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
      pts.push(new THREE.Vector3(x, 1.5 * (1 - (x / 6) ** 2), zz));
    }
    /* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.09, 6, false),
      material('#c8d1c3'),
    );
    /* 学习注释：执行这一句操作：m.name = 'photo_guided_skylight_frame';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    m.name = 'photo_guided_skylight_frame';
    /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
    skylight.add(m);
  }
  /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
  parent.userData = {
    reference: LAYOUT_REFERENCE,
    collectionPositions: '2025 published diagram',
    orientation: 'east=-Z; north=-X',
    surveyedDimensions: false,
    structuralLayout: 'schematic',
  };
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return { storeys, height, skylight };
}
