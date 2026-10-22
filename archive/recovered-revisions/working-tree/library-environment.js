/* 本人零基础学习副本：仅排版和解释，原有业务逻辑不变。
 * 全套架构、实例和修改方法请读文档及源码导航。
 */
/* 学习注释：从 three 导入模块；只有构建后单文件网页才可以直接 file 双击运行。 */
import * as THREE from 'three';
// West/library-facing landscape. Relationship follows official photographs;
// shoreline, paving and signs are schematic, not surveyed construction details.
export /* 学习注释：buildLibraryEnvironment：创建湖畔场景
 * 读取/参数：馆舍parent和辅助H
 * 产生/改变：添加平台、路灯、绿化、湖面及标识
 * 阅读与修改：标识挂在parent，景观组有些对象层级不同。 */
function buildLibraryEnvironment(parent, H) {
  /* 学习注释：建立 group、box、cylinder、material、plant。material：材质工具或材质对象。 */
  const { group, box, cylinder, material, plant } = H;
  /* 学习注释：建立 g。g：当前几何组合组；以所在函数定义为准。 */
  const g = group(parent, 'library_lakeside_environment');
  /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
  g.userData = {
    schematic: true,
    reference: 'https://www.xujc.com/info/y48rxy9g.html',
  };
  /* 学习注释：执行这一句操作：box(g, 'library_rear_approach', 112, 0.22, 22, 0, -0.78, -33, '#cecfbf');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(g, 'library_rear_approach', 112, 0.22, 22, 0, -0.78, -33, '#cecfbf');
  /* 学习注释：执行这一句操作：box(g, 'library_walkway', 108, 0.12, 6, 0, -0.6, -28.5, '#e1dccb');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(g, 'library_walkway', 108, 0.12, 6, 0, -0.6, -28.5, '#e1dccb');
  /* 学习注释：执行这一句操作：box(g, 'lakeside_green_strip', 108, 0.18, 5, 0, -0.67, -38, '#879d78');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(g, 'lakeside_green_strip', 108, 0.18, 5, 0, -0.67, -38, '#879d78');
  /* 学习注释：执行这一句操作：box(g, 'shore_walk', 108, 0.18, 4.2, 0, -0.57, -42.5, '#c8bda4');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(g, 'shore_walk', 108, 0.18, 4.2, 0, -0.57, -42.5, '#c8bda4');
  /* 学习注释：逐项遍历 [-19, 19]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-19, 19]) {
    /* 学习注释：执行这一句操作：box(g, 'entry_planting_bed', 7, 0.4, 5, x, -0.38, -32, '#a8b78f');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(g, 'entry_planting_bed', 7, 0.4, 5, x, -0.38, -32, '#a8b78f');
    /* 学习注释：逐项遍历 [-2, 0, 2]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 dx。 */
    const dx of [-2, 0, 2]) /* 学习注释：执行这一句操作：plant(g, x + dx, -32, 1.15);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    plant(g, x + dx, -32, 1.15);
  }
  /* 学习注释：逐项遍历 [-43, -29, 29, 43]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-43, -29, 29, 43]) /* 学习注释：逐项遍历 [-30, -39]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 zz。 */
  const zz of [-30, -39]) /* 学习注释：执行这一句操作：plant(g, x, zz, 2.2);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  plant(g, x, zz, 2.2);
  // Low central terrace steps connect the library axis to the waterfront.
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 i。 */
  let i = 0; i < 5; i++)
    /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(
      g,
      'lake_axis_terrace_step',
      22 - i * 0.9,
      0.18,
      1.0,
      0,
      -0.56 - i * 0.13,
      -39.5 - i * 0.85,
      '#c2b9a5',
    );
  /* 学习注释：逐项遍历 [-24, 24]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-24, 24])
    /* 学习注释：执行这一句操作：box(g, 'waterfront_viewing_platform', 16, 0.28, 7, x, -0.63, -47, '#c8b69a');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(g, 'waterfront_viewing_platform', 16, 0.28, 7, x, -0.63, -47, '#c8b69a');
  /* 学习注释：建立 shore。 */
  const shore = new THREE.Shape();
  /* 学习注释：执行这一句操作：shore.moveTo(-56, 46);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  shore.moveTo(-56, 46);
  /* 学习注释：执行这一句操作：shore.quadraticCurveTo(-62, 72, -45, 83);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  shore.quadraticCurveTo(-62, 72, -45, 83);
  /* 学习注释：执行这一句操作：shore.quadraticCurveTo(0, 98, 48, 81);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  shore.quadraticCurveTo(0, 98, 48, 81);
  /* 学习注释：执行这一句操作：shore.quadraticCurveTo(65, 67, 56, 46);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  shore.quadraticCurveTo(65, 67, 56, 46);
  /* 学习注释：执行这一句操作：shore.lineTo(-56, 46);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  shore.lineTo(-56, 46);
  /* 学习注释：建立 water。 */
  const water = new THREE.Mesh(
    new THREE.ShapeGeometry(shore, 36),
    material('#638f87', { roughness: 0.28, metalness: 0.3 }),
  );
  /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
  water.rotation.x = -Math.PI / 2;
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  water.position.y = -1.12;
  /* 学习注释：执行这一句操作：water.name = 'library_front_lake_water';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  water.name = 'library_front_lake_water';
  /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
  g.add(water);
  // A shoreline edge, restrained ripples and distant planting make the setting legible.
  /* 学习注释：逐项遍历 [-1, 1]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 side。 */
  const side of [-1, 1]) {
    /* 学习注释：执行这一句操作：box(g, 'lake_stone_edge', 38, 0.25, 0.8, side * 37, -0.8, -46, '#bdb7a5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(g, 'lake_stone_edge', 38, 0.25, 0.8, side * 37, -0.8, -46, '#bdb7a5');
    /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
    for (/* 学习注释：建立 k。 */
    let k = 0; k < 13; k++)
      /* 学习注释：执行这一句操作：plant(g, side * (53 + Math.sin(k * 0.5) * 2), -48 - k * 2.4, 1.9);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      plant(g, side * (53 + Math.sin(k * 0.5) * 2), -48 - k * 2.4, 1.9);
  }
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 k。 */
  let k = 0; k < 10; k++) {
    /* 学习注释：建立 pts。pts：二维或三维点列。 */
    const pts = [];
    /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
    for (/* 学习注释：建立 i。 */
    let i = 0; i <= 20; i++)
      /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
      pts.push(
        new THREE.Vector3(
          -44 + i * 4.4,
          -1.105,
          -52 - k * 3 + Math.sin(i * 0.4 + k) * 0.26,
        ),
      );
    /* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.018, 4, false),
      material('#a1b6ab'),
    );
    /* 学习注释：执行这一句操作：m.name = 'lake_surface_ripple';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    m.name = 'lake_surface_ripple';
    /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
    g.add(m);
  }
  /* 学习注释：逐项遍历 [-32, -16, 16, 32]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-32, -16, 16, 32]) {
    /* 学习注释：执行这一句操作：box(g, 'shore_bench_seat', 3, 0.12, 0.65, x, 0.12, -42, '#a99677');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(g, 'shore_bench_seat', 3, 0.12, 0.65, x, 0.12, -42, '#a99677');
    /* 学习注释：执行这一句操作：box(g, 'shore_bench_back', 3, 0.55, 0.09, x, 0.45, -41.7, '#a99677');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(g, 'shore_bench_back', 3, 0.55, 0.09, x, 0.45, -41.7, '#a99677');
    /* 学习注释：逐项遍历 [-1.2, 1.2]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 dx。 */
    const dx of [-1.2, 1.2])
      /* 学习注释：执行这一句操作：box(g, 'shore_bench_support', 0.13, 0.56, 0.5, x + dx, -0.2, -42, '#697e71');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(g, 'shore_bench_support', 0.13, 0.56, 0.5, x + dx, -0.2, -42, '#697e71');
  }
  /* 学习注释：逐项遍历 [-42, -28, 28, 42]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-42, -28, 28, 42]) {
    /* 学习注释：执行这一句操作：cylinder(g, 'walk_light', 0.075, 3.4, x, 1.1, -27, '#667c72');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    cylinder(g, 'walk_light', 0.075, 3.4, x, 1.1, -27, '#667c72');
    /* 学习注释：执行这一句操作：box(g, 'walk_light_head', 0.65, 0.12, 0.4, x, 2.84, -27, '#eee6cd');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(g, 'walk_light_head', 0.65, 0.12, 0.4, x, 2.84, -27, '#eee6cd');
  }
  /* 学习注释：sign：用文字Canvas生成标牌贴图
   * 读取/参数：text、宽高、位置和name
   * 产生/改变：CanvasTexture贴到Plane并加入parent
   * 阅读与修改：需浏览器DOM；标识文字和现场准确位置未测。 */
  function sign(text, w, h, x, y, z, name) {
    /* 学习注释：建立 canvas。 */
    const canvas = document.createElement('canvas');
    /* 学习注释：执行这一句操作：canvas.width = 1600;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    canvas.width = 1600;
    /* 学习注释：执行这一句操作：canvas.height = 240;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    canvas.height = 240;
    /* 学习注释：建立 ctx。 */
    const ctx = canvas.getContext('2d');
    /* 学习注释：执行这一句操作：ctx.fillStyle = '#e6dfce';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    ctx.fillStyle = '#e6dfce';
    /* 学习注释：执行这一句操作：ctx.fillRect(0, 0, 1600, 240);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    ctx.fillRect(0, 0, 1600, 240);
    /* 学习注释：执行这一句操作：ctx.fillStyle = '#355b50';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    ctx.fillStyle = '#355b50';
    /* 学习注释：执行这一句操作：ctx.textAlign = 'center';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    ctx.textAlign = 'center';
    /* 学习注释：执行这一句操作：ctx.textBaseline = 'middle';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    ctx.textBaseline = 'middle';
    /* 学习注释：执行这一句操作：ctx.font = 'bold 94px Microsoft YaHei';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    ctx.font = 'bold 94px Microsoft YaHei';
    /* 学习注释：执行这一句操作：ctx.fillText(text, 800, 120, 1500);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    ctx.fillText(text, 800, 120, 1500);
    /* 学习注释：建立 tex。 */
    const tex = new THREE.CanvasTexture(canvas);
    /* 学习注释：执行这一句操作：tex.colorSpace = THREE.SRGBColorSpace;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    tex.colorSpace = THREE.SRGBColorSpace;
    /* 学习注释：建立 mesh。 */
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.82,
        side: THREE.DoubleSide,
      }),
    );
    /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
    mesh.rotation.y = Math.PI;
    /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
    mesh.position.set(x, y, z);
    /* 学习注释：执行这一句操作：mesh.name = name;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    mesh.name = name;
    /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
    parent.add(mesh);
    /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
    return mesh;
  }
  /* 学习注释：执行这一句操作：sign('厦门大学嘉庚学院图书馆', 12, 1.8, 0, 5.6, -22.7, 'library_entrance_name_sign');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  sign('厦门大学嘉庚学院图书馆', 12, 1.8, 0, 5.6, -22.7, 'library_entrance_name_sign');
  /* 学习注释：执行这一句操作：box(g, 'library_wayfinding_monument', 6, 2.2, 0.42, -11, 0.48, -27, '#d8d1bd');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(g, 'library_wayfinding_monument', 6, 2.2, 0.42, -11, 0.48, -27, '#d8d1bd');
  /* 学习注释：执行这一句操作：sign('图书馆 · LIBRARY', 5.6, 1.0, -11, 0.7, -27.24, 'library_west_wayfinding_sign');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  sign('图书馆 · LIBRARY', 5.6, 1.0, -11, 0.7, -27.24, 'library_west_wayfinding_sign');
  // The signs communicate the entrance; exact on-site lettering needs photo verification.
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return g;
}
