/* 本人零基础学习副本：仅排版和解释，原有业务逻辑不变。
 * 全套架构、实例和修改方法请读文档及源码导航。
 */
/* 学习注释：从 three 导入模块；只有构建后单文件网页才可以直接 file 双击运行。 */
import * as THREE from 'three';

// Photo-guided geometry. Dimensions and internal locations are schematic.
export /* 学习注释：buildExterior：创建完整校园与后部馆舍
 * 读取/参数：parent和H中的几何辅助函数
 * 产生/改变：返回roofGroups/detailCount/rearLibrary/main3Parts
 * 阅读与修改：外观估计与照片参照，不用于工程；高部只作背景。 */
function buildExterior(parent, H) {
  /* 学习注释：建立 group、box、cylinder、material、plant。material：材质工具或材质对象。 */
  const { group, box, cylinder, material, plant } = H;
  /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
  parent.userData = {
    description:
      'Photo-guided Zhangzhou campus Main Building 3, schematic dimensions; floors 6-12 are administrative context, not added library area',
    reference: 'https://arch.xmu.edu.cn/info/1013/13073.htm',
  };
  /* 学习注释：建立 roofGroups。roofGroups：屋盖组列表，用于管理建筑对象。 */
  const roofGroups = [];
  /* 学习注释：line：沿曲线创建细管构件
   * 读取/参数：点列pts、半径r、材质色与父节点
   * 产生/改变：CatmullRomCurve3加TubeGeometry后加入对象树
   * 阅读与修改：用于檐口瓦纹等，不是结构或声学求解。 */
  function line(name, pts, r, col, root = parent) {
    /* 学习注释：建立 curve。 */
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    /* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(
        curve,
        Math.max(10, Math.min(24, pts.length * 2)),
        r,
        6,
        false,
      ),
      material(col),
    );
    /* 学习注释：执行这一句操作：m.name = name;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    m.name = name;
    /* 学习注释：执行这一句操作：m.castShadow = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    m.castShadow = true;
    /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
    root.add(m);
    /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
    return m;
  }
  /* 学习注释：beam：用两点定义方向梁
   * 读取/参数：起止a/b、宽w和颜色
   * 产生/改变：按距离建Box，再用四元数对齐
   * 阅读与修改：两点重合时方向无意义，新增配置应检查长度。 */
  function beam(root, name, a, b, w, col) {
    /* 学习注释：建立 p、q。p：局部试点配置、三维点或 DOM 段落，以当前函数为准。q：当前楼层试点配置。 */
    const p = new THREE.Vector3(...a),
      q = new THREE.Vector3(...b);
    /* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, p.distanceTo(q), w),
      material(col),
    );
    /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
    m.position.copy(p).add(q).multiplyScalar(0.5);
    /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      q.clone().sub(p).normalize(),
    );
    /* 学习注释：执行这一句操作：m.name = name;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    m.name = name;
    /* 学习注释：执行这一句操作：m.castShadow = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    m.castShadow = true;
    /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
    root.add(m);
    /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
    return m;
  }
  /* 学习注释：roof：生成曲面屋盖与檐脊细节
   * 读取/参数：宽深、坡高、基准位置与父组
   * 产生/改变：两侧网格、瓦纹、翘檐、屋脊与支撑组合
   * 阅读与修改：嵌套height决定形态，材质DoubleSide不是实体厚度。 */
  function roof(name, w, d, pitch, base, x, z, root = parent) {
    /* 学习注释：建立 g。g：当前几何组合组；以所在函数定义为准。 */
    const g = group(root, name);
    /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
    g.position.set(x, base, z);
    /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
    roofGroups.push(g);
    /* 学习注释：建立 nx、nz。 */
    const nx = 36,
      nz = 16;
    /* 学习注释：height：计算屋面顶点高度
     * 读取/参数：横向u与坡向v，以及pitch
     * 产生/改变：返回高度标量供屋面与檐线使用
     * 阅读与修改：高次abs(u)主要强调端部上翘；不是实测屋面公式。 */
    function height(u, v) {
      /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
      return (
        pitch * Math.pow(1 - v, 0.79) +
        1.55 * Math.pow(Math.abs(u), 9) * (0.78 + 0.22 * v) +
        0.32 * v * v
      );
    }
    /* 学习注释：逐项遍历 [-1, 1]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 side。 */
    const side of [-1, 1]) {
      /* 学习注释：建立 arr、uv、ind。arr：连续顶点坐标数组。uv：贴图坐标数组，不是现实经纬度。ind：三角面索引数组。 */
      const arr = [],
        uv = [],
        ind = [];
      /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
      for (/* 学习注释：建立 i。 */
      let i = 0; i <= nx; i++)
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 j。 */
        let j = 0; j <= nz; j++) {
          /* 学习注释：建立 u、v。 */
          const u = (i / nx) * 2 - 1,
            v = j / nz;
          /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
          arr.push((u * w) / 2, height(u, v), (side * v * d) / 2);
          /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
          uv.push(i / nx, j / nz);
        }
      /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
      for (/* 学习注释：建立 i。 */
      let i = 0; i < nx; i++)
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 j。 */
        let j = 0; j < nz; j++) {
          /* 学习注释：建立 a、b。 */
          const a = i * (nz + 1) + j,
            b = a + nz + 1;
          /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
          ind.push(a, b, a + 1, b, b + 1, a + 1);
        }
      /* 学习注释：建立 geo。geo：局部创建的几何对象。 */
      const geo = new THREE.BufferGeometry();
      /* 学习注释：设置 DOM/SVG 属性；查看第一个参数确认这是尺寸、样式、可访问状态还是绘图路径。 */
      geo.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      /* 学习注释：设置 DOM/SVG 属性；查看第一个参数确认这是尺寸、样式、可访问状态还是绘图路径。 */
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      /* 学习注释：执行这一句操作：geo.setIndex(ind);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      geo.setIndex(ind);
      /* 学习注释：执行这一句操作：geo.computeVertexNormals();。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      geo.computeVertexNormals();
      /* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
      const m = new THREE.Mesh(
        geo,
        material('#cb5d35', { side: THREE.DoubleSide, roughness: 0.87 }),
      );
      /* 学习注释：执行这一句操作：m.name = 'orange_curved_roof_tiles';。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      m.name = 'orange_curved_roof_tiles';
      /* 学习注释：执行这一句操作：m.castShadow = true;。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      m.castShadow = true;
      /* 学习注释：把对象加入父组或把 DOM 加进页面；构造对象后若没有加入，当前场景/页面不会显示它。 */
      g.add(m);
      // Tile ribs run down each pitch, following its curved profile.
      /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
      for (/* 学习注释：建立 i。 */
      let i = 0; i <= 28; i++) {
        /* 学习注释：建立 u。 */
        const u = (i / 28) * 2 - 1;
        /* 学习注释：建立 pts。pts：二维或三维点列。 */
        const pts = [];
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 j。 */
        let j = 0; j <= 8; j++) {
          /* 学习注释：建立 v。 */
          const v = j / 8;
          /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
          pts.push([(u * w) / 2, height(u, v) + 0.028, (side * v * d) / 2]);
        }
        /* 学习注释：执行这一句操作：line('tile_rib', pts, 0.026, '#ae4b2c', g);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        line('tile_rib', pts, 0.026, '#ae4b2c', g);
      }
      /* 学习注释：逐项遍历 [0.23, 0.48, 0.72, 0.93]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 v。 */
      const v of [0.23, 0.48, 0.72, 0.93]) {
        /* 学习注释：建立 pts。pts：二维或三维点列。 */
        const pts = [];
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 i。 */
        let i = 0; i <= 16; i++) {
          /* 学习注释：建立 u。 */
          const u = (i / 16) * 2 - 1;
          /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
          pts.push([(u * w) / 2, height(u, v) + 0.025, (side * v * d) / 2]);
        }
        /* 学习注释：执行这一句操作：line('tile_course', pts, 0.021, '#e47d4c', g);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        line('tile_course', pts, 0.021, '#e47d4c', g);
      }
      /* 学习注释：建立 eave。 */
      const eave = [];
      /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
      for (/* 学习注释：建立 i。 */
      let i = 0; i <= 24; i++) {
        /* 学习注释：建立 u。 */
        const u = (i / 24) * 2 - 1;
        /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
        eave.push([(u * w) / 2, height(u, 1) - 0.05, (side * d) / 2]);
      }
      /* 学习注释：执行这一句操作：line('white_upturned_eave', eave, 0.11, '#eee6d4', g);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      line('white_upturned_eave', eave, 0.11, '#eee6d4', g);
      /* 学习注释：执行这一句操作：line(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      line(
        'dark_eave_fascia',
        eave.map((p) => [p[0], p[1] - 0.24, p[2]]),
        0.15,
        '#775b43',
        g,
      );
    }
    /* 学习注释：建立 ridge。 */
    const ridge = [];
    /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
    for (/* 学习注释：建立 i。 */
    let i = 0; i <= 24; i++) {
      /* 学习注释：建立 u。 */
      const u = (i / 24) * 2 - 1;
      /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
      ridge.push([(u * w) / 2, pitch + 0.25 + 1.3 * Math.pow(Math.abs(u), 9), 0]);
    }
    /* 学习注释：执行这一句操作：line('swallowtail_ridge', ridge, 0.16, '#e5ded0', g);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    line('swallowtail_ridge', ridge, 0.16, '#e5ded0', g);
    /* 学习注释：逐项遍历 [-1, 1]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 side。 */
    const side of [-1, 1])
      /* 学习注释：执行这一句操作：line(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      line(
        'raised_swallowtail_tip',
        [
          [side * w * 0.44, pitch + 0.54, 0],
          [side * w * 0.5, pitch + 1.5, 0],
          [side * w * 0.515, pitch + 1.8, 0],
        ],
        0.15,
        '#e9e4d8',
        g,
      );
    // Exposed end frames and white bargeboards convey the photographed open gables.
    /* 学习注释：逐项遍历 [-1, 1]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 sx。 */
    const sx of [-1, 1]) {
      /* 学习注释：建立 xx。 */
      const xx = sx * w * 0.475;
      /* 学习注释：逐项遍历 [-1, 1]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 sz。 */
      const sz of [-1, 1]) {
        /* 学习注释：建立 pts。pts：二维或三维点列。 */
        const pts = [];
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 j。 */
        let j = 0; j <= 16; j++) {
          /* 学习注释：建立 v。 */
          const v = j / 16;
          /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
          pts.push([xx, height(0.95, v) + 0.12, (sz * v * d) / 2]);
        }
        /* 学习注释：执行这一句操作：line('white_gable_bargeboard', pts, 0.13, '#eee9df', g);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        line('white_gable_bargeboard', pts, 0.13, '#eee9df', g);
        /* 学习注释：执行这一句操作：beam(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        beam(
          g,
          'gable_diagonal',
          [xx, 0.45, sz * d * 0.36],
          [xx, pitch - 0.55, 0],
          0.18,
          '#e0ddd0',
        );
      }
      /* 学习注释：执行这一句操作：beam(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      beam(
        g,
        'gable_tie',
        [xx, 0.52, -d * 0.36],
        [xx, 0.52, d * 0.36],
        0.22,
        '#dedbcb',
      );
      /* 学习注释：逐项遍历 [-d * 0.3, 0, d * 0.3]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 zz。 */
      const zz of [-d * 0.3, 0, d * 0.3])
        /* 学习注释：执行这一句操作：box(g, 'ventilated_roof_support', 0.22, 1.8, 0.25, xx, -0.68, zz, '#8e6b4a');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(g, 'ventilated_roof_support', 0.22, 1.8, 0.25, xx, -0.68, zz, '#8e6b4a');
    }
    /* 学习注释：逐项遍历 [-w * 0.32, 0, w * 0.32]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 xx。 */
    const xx of [-w * 0.32, 0, w * 0.32])
      /* 学习注释：逐项遍历 [-d * 0.38, d * 0.38]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 zz。 */
      const zz of [-d * 0.38, d * 0.38]) {
        /* 学习注释：执行这一句操作：box(g, 'roof_timber_post', 0.28, 1.9, 0.28, xx, -0.7, zz, '#876345');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(g, 'roof_timber_post', 0.28, 1.9, 0.28, xx, -0.7, zz, '#876345');
        /* 学习注释：执行这一句操作：box(g, 'wood_bracket', 1.35, 0.22, 0.38, xx, -0.05, zz, '#a77c51');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(g, 'wood_bracket', 1.35, 0.22, 0.38, xx, -0.05, zz, '#a77c51');
        /* 学习注释：执行这一句操作：beam(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        beam(
          g,
          'bracket_diagonal',
          [xx - 0.65, -0.12, zz],
          [xx, -1.0, zz],
          0.16,
          '#946b46',
        );
      }
    /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
    return g;
  }
  /* 学习注释：执行这一句操作：box(parent, 'campus_plaza', 126, 0.25, 134, 0, -0.7, -16, '#d8d5c8');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(parent, 'campus_plaza', 126, 0.25, 134, 0, -0.7, -16, '#d8d5c8');
  // Main library podium: a long five-storey building, with a taller central block.
  /* 学习注释：建立 main。 */
  const main = group(parent, 'main_building_3_library_podium');
  /* 学习注释：执行这一句操作：box(main, 'five_floor_library_body', 40, 19.7, 48, 0, 9.8, -1, '#ebe9e1');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(main, 'five_floor_library_body', 40, 19.7, 48, 0, 9.8, -1, '#ebe9e1');
  /* 学习注释：逐项遍历 [-16, -10, 10, 16]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-16, -10, 10, 16])
    /* 学习注释：执行这一句操作：box(main, 'facade_vertical_piers', 1.2, 20.4, 48.5, x, 10.05, -1, '#f4f2ea');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(main, 'facade_vertical_piers', 1.2, 20.4, 48.5, x, 10.05, -1, '#f4f2ea');
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 n。 */
  let n = 0; n < 5; n++) {
    /* 学习注释：建立 y。 */
    const y = 2.1 + n * 3.8;
    /* 学习注释：逐项遍历 [-17, -14, -11, -8, -5, 5, 8, 11, 14, 17]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-17, -14, -11, -8, -5, 5, 8, 11, 14, 17]) {
      /* 学习注释：执行这一句操作：box(main, 'podium_front_window', 1.6, 2.35, 0.1, x, y, 23.12, '#748f8d', {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(main, 'podium_front_window', 1.6, 2.35, 0.1, x, y, 23.12, '#748f8d', {
        metalness: 0.2,
        roughness: 0.33,
      });
      /* 学习注释：执行这一句操作：box(main, 'front_window_sill', 1.88, 0.12, 0.25, x, y - 1.16, 23.24, '#cfcdc4');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(main, 'front_window_sill', 1.88, 0.12, 0.25, x, y - 1.16, 23.24, '#cfcdc4');
    }
    /* 学习注释：逐项遍历 [-20.1, 20.1]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-20.1, 20.1])
      /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
      for (/* 学习注释：建立 z。 */
      let z = -20; z <= 19; z += 4.2) {
        /* 学习注释：执行这一句操作：box(main, 'side_long_window', 0.1, 2.1, 1.8, x, y, z, '#809898');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(main, 'side_long_window', 0.1, 2.1, 1.8, x, y, z, '#809898');
        /* 学习注释：执行这一句操作：box(main, 'window_vertical_mullion', 0.14, 2.15, 0.09, x, y, z, '#c2c7bc');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(main, 'window_vertical_mullion', 0.14, 2.15, 0.09, x, y, z, '#c2c7bc');
      }
    /* 学习注释：执行这一句操作：box(main, 'podium_floor_band', 40.5, 0.18, 48.4, 0, y + 1.55, -1, '#cfd0c8');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(main, 'podium_floor_band', 40.5, 0.18, 48.4, 0, y + 1.55, -1, '#cfd0c8');
  }
  /* 学习注释：执行这一句操作：box(main, 'granite_base', 40.7, 2.7, 48.7, 0, 1.08, -1, '#b7baaf');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(main, 'granite_base', 40.7, 2.7, 48.7, 0, 1.08, -1, '#b7baaf');
  // Two strong white piers flank the recessed glass centre of the twelve-storey block.
  /* 学习注释：建立 tower。 */
  const tower = group(parent, 'twelve_floor_central_block');
  /* 学习注释：执行这一句操作：box(tower, 'tower_core', 21.5, 43, 19, 0, 21.4, -3, '#e5e4dc');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(tower, 'tower_core', 21.5, 43, 19, 0, 21.4, -3, '#e5e4dc');
  /* 学习注释：逐项遍历 [10, -18]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 z。 */
  const z of [10, -18])
    /* 学习注释：执行这一句操作：box(tower, 'stepped_roof_white_support', 21.5, 37.6, 12, 0, 18.7, z, '#eae8df');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(tower, 'stepped_roof_white_support', 21.5, 37.6, 12, 0, 18.7, z, '#eae8df');
  /* 学习注释：逐项遍历 [-8.8, -4.5, 4.5, 8.8]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-8.8, -4.5, 4.5, 8.8])
    /* 学习注释：执行这一句操作：box(tower, 'tall_white_pier', 2.15, 43.6, 19.7, x, 21.6, -3, '#f1eee5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(tower, 'tall_white_pier', 2.15, 43.6, 19.7, x, 21.6, -3, '#f1eee5');
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 n。 */
  let n = 0; n < 12; n++) {
    /* 学习注释：建立 y。 */
    const y = 1.9 + n * 3.45;
    /* 学习注释：逐项遍历 [-8.8, 8.8]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-8.8, 8.8]) {
      /* 学习注释：执行这一句操作：box(tower, 'pier_small_window', 0.83, 1.1, 0.09, x, y, 7.01, '#6d8586');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(tower, 'pier_small_window', 0.83, 1.1, 0.09, x, y, 7.01, '#6d8586');
      /* 学习注释：执行这一句操作：box(tower, 'pier_small_window_back', 0.83, 1.1, 0.09, x, y, -13.03, '#758c8a');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(tower, 'pier_small_window_back', 0.83, 1.1, 0.09, x, y, -13.03, '#758c8a');
    }
    /* 学习注释：逐项遍历 [-6.5, 0, 6.5]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-6.5, 0, 6.5]) {
      /* 学习注释：建立 w。 */
      const w = x === 0 ? 6.0 : 1.95;
      /* 学习注释：执行这一句操作：box(tower, 'recessed_glass_front', w, 2.55, 0.1, x, y, 6.63, '#758e86', {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(tower, 'recessed_glass_front', w, 2.55, 0.1, x, y, 6.63, '#758e86', {
        metalness: 0.3,
        roughness: 0.27,
      });
      /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(
        tower,
        'horizontal_glass_mullion',
        w,
        0.12,
        0.18,
        x,
        y + 0.36,
        6.78,
        '#d6d7c9',
      );
    }
    /* 学习注释：执行这一句操作：box(tower, 'central_floor_spandrel', 7.1, 0.48, 0.2, 0, y - 1.18, 6.8, '#d9dcd1');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(tower, 'central_floor_spandrel', 7.1, 0.48, 0.2, 0, y - 1.18, 6.8, '#d9dcd1');
  }
  // Front stepped block and side louvers prevent the blank-box appearance of the earlier model.
  /* 学习注释：逐项遍历 [-8.8, -4.5, 4.5, 8.8]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-8.8, -4.5, 4.5, 8.8])
    /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(
      tower,
      'stepped_front_white_pier',
      2.15,
      38.1,
      0.38,
      x,
      18.95,
      16.08,
      '#f1eee5',
    );
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 n。 */
  let n = 0; n < 11; n++) {
    /* 学习注释：建立 y。 */
    const y = 1.9 + n * 3.45;
    /* 学习注释：逐项遍历 [-8.8, 8.8]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-8.8, 8.8])
      /* 学习注释：执行这一句操作：box(tower, 'stepped_pier_small_window', 0.83, 1.1, 0.09, x, y, 16.32, '#6d8586');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(tower, 'stepped_pier_small_window', 0.83, 1.1, 0.09, x, y, 16.32, '#6d8586');
    /* 学习注释：逐项遍历 [-6.5, 0, 6.5]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-6.5, 0, 6.5]) {
      /* 学习注释：建立 w。 */
      const w = x === 0 ? 6 : 1.95;
      /* 学习注释：执行这一句操作：box(tower, 'front_stepped_glass', w, 2.55, 0.1, x, y, 16.25, '#708e86');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(tower, 'front_stepped_glass', w, 2.55, 0.1, x, y, 16.25, '#708e86');
      /* 学习注释：执行这一句操作：box(tower, 'front_stepped_mullion', w, 0.12, 0.15, x, y + 0.36, 16.35, '#d7d9cc');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(tower, 'front_stepped_mullion', w, 0.12, 0.15, x, y + 0.36, 16.35, '#d7d9cc');
    }
    /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(
      tower,
      'stepped_front_spandrel',
      7.1,
      0.48,
      0.18,
      0,
      y - 1.18,
      16.35,
      '#dfe2d5',
    );
  }
  /* 学习注释：逐项遍历 [-8.8, -4.5, 4.5, 8.8]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-8.8, -4.5, 4.5, 8.8])
    /* 学习注释：执行这一句操作：box(tower, 'stepped_rear_white_pier', 2.15, 38.1, 0.38, x, 18.95, -24.1, '#f1eee5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(tower, 'stepped_rear_white_pier', 2.15, 38.1, 0.38, x, 18.95, -24.1, '#f1eee5');
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 n。 */
  let n = 0; n < 11; n++) {
    /* 学习注释：建立 y。 */
    const y = 1.9 + n * 3.45;
    /* 学习注释：逐项遍历 [-8.8, 8.8]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-8.8, 8.8])
      /* 学习注释：执行这一句操作：box(tower, 'stepped_rear_pier_window', 0.83, 1.1, 0.09, x, y, -24.32, '#728b86');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(tower, 'stepped_rear_pier_window', 0.83, 1.1, 0.09, x, y, -24.32, '#728b86');
    /* 学习注释：逐项遍历 [-6.5, 0, 6.5]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-6.5, 0, 6.5]) {
      /* 学习注释：建立 w。 */
      const w = x === 0 ? 6 : 1.95;
      /* 学习注释：执行这一句操作：box(tower, 'rear_stepped_glass', w, 2.55, 0.1, x, y, -24.26, '#7c9990');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(tower, 'rear_stepped_glass', w, 2.55, 0.1, x, y, -24.26, '#7c9990');
      /* 学习注释：执行这一句操作：box(tower, 'rear_glass_mullion', w, 0.12, 0.15, x, y + 0.36, -24.37, '#d7d9cc');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(tower, 'rear_glass_mullion', w, 0.12, 0.15, x, y + 0.36, -24.37, '#d7d9cc');
      /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 x !== 0。 */
      if (x !== 0)
        /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(
          tower,
          'rear_terracotta_spandrel',
          1.95,
          0.66,
          0.12,
          x,
          y - 1.05,
          -24.4,
          '#ba563e',
        );
    }
  }
  /* 学习注释：逐项遍历 [-10.86, 10.86]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-10.86, 10.86]) {
    /* 学习注释：逐项遍历 [-21, -14, -7, 0, 7, 14]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 z。 */
    const z of [-21, -14, -7, 0, 7, 14])
      /* 学习注释：执行这一句操作：box(tower, 'side_white_vertical_pier', 0.28, 37.9, 1.08, x, 18.88, z, '#f2efe7');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(tower, 'side_white_vertical_pier', 0.28, 37.9, 1.08, x, 18.88, z, '#f2efe7');
    /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
    for (/* 学习注释：建立 n。 */
    let n = 5; n < 11; n++) {
      /* 学习注释：建立 y。 */
      const y = 1.9 + n * 3.45;
      /* 学习注释：逐项遍历 [-18, -10, -2, 6, 13]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 z。 */
      const z of [-18, -10, -2, 6, 13]) {
        /* 学习注释：执行这一句操作：box(tower, 'side_tall_window', 0.1, 2.0, 1.45, x, y, z, '#7a9290');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(tower, 'side_tall_window', 0.1, 2.0, 1.45, x, y, z, '#7a9290');
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 k。 */
        let k = 0; k < 4; k++)
          /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          box(
            tower,
            'side_window_louver',
            0.16,
            0.055,
            1.5,
            x,
            y - 0.7 + k * 0.45,
            z,
            '#c6cebe',
          );
      }
    }
  }
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 n。 */
  let n = 6; n < 11; n++)
    /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
    for (/* 学习注释：建立 k。 */
    let k = 0; k < 10; k++)
      /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(
        tower,
        'visible_stair_silhouette',
        0.52,
        0.14,
        0.14,
        -2.45 + k * 0.54,
        1.1 + n * 3.45 + k * 0.2,
        16.45,
        '#edf0e4',
      );
  // Low, staggered roof pavilions and the elevated main roof with open support frames.
  /* 学习注释：执行这一句操作：roof('highest_open_double_eave_roof', 25, 23, 6.4, 45.1, 0, -3);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  roof('highest_open_double_eave_roof', 25, 23, 6.4, 45.1, 0, -3);
  /* 学习注释：执行这一句操作：roof('secondary_roof_front', 25, 18, 4.0, 39.4, 0, 11);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  roof('secondary_roof_front', 25, 18, 4.0, 39.4, 0, 11);
  /* 学习注释：执行这一句操作：roof('secondary_roof_back', 25, 18, 4.0, 39.4, 0, -18);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  roof('secondary_roof_back', 25, 18, 4.0, 39.4, 0, -18);
  /* 学习注释：执行这一句操作：roof('podium_roof_left_front', 11.6, 16, 3.15, 21.6, -14.6, 13.4);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  roof('podium_roof_left_front', 11.6, 16, 3.15, 21.6, -14.6, 13.4);
  /* 学习注释：执行这一句操作：roof('podium_roof_right_front', 11.6, 16, 3.15, 21.6, 14.6, 13.4);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  roof('podium_roof_right_front', 11.6, 16, 3.15, 21.6, 14.6, 13.4);
  /* 学习注释：执行这一句操作：roof('podium_roof_left_back', 11.6, 17, 3.15, 21.6, -14.6, -16);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  roof('podium_roof_left_back', 11.6, 17, 3.15, 21.6, -14.6, -16);
  /* 学习注释：执行这一句操作：roof('podium_roof_right_back', 11.6, 17, 3.15, 21.6, 14.6, -16);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  roof('podium_roof_right_back', 11.6, 17, 3.15, 21.6, 14.6, -16);
  // Elevated entrance and connected portico. Arc outlines are visible against stone piers.
  /* 学习注释：建立 portico。 */
  const portico = group(parent, 'raised_portico_and_entrance');
  /* 学习注释：执行这一句操作：box(portico, 'portico_gallery_floor', 85, 0.3, 6.5, 0, 4.15, 27, '#dedbd0');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(portico, 'portico_gallery_floor', 85, 0.3, 6.5, 0, 4.15, 27, '#dedbd0');
  /* 学习注释：执行这一句操作：box(portico, 'portico_terrace', 40, 0.35, 7.5, 0, 4.35, 23.9, '#d8d4c7');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(portico, 'portico_terrace', 40, 0.35, 7.5, 0, 4.35, 23.9, '#d8d4c7');
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  let x = -40; x <= 40; x += 4) {
    /* 学习注释：执行这一句操作：box(portico, 'granite_colonnade_pier', 0.6, 4.1, 0.7, x, 1.95, 28.5, '#c3c5b8');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(portico, 'granite_colonnade_pier', 0.6, 4.1, 0.7, x, 1.95, 28.5, '#c3c5b8');
    /* 学习注释：执行这一句操作：box(portico, 'capital', 1.05, 0.27, 1.0, x, 4.02, 28.5, '#ddd9cb');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(portico, 'capital', 1.05, 0.27, 1.0, x, 4.02, 28.5, '#ddd9cb');
  }
  /* 学习注释：执行这一句操作：box(portico, 'portico_upper_edge', 85, 0.3, 6.5, 0, 6.95, 27, '#e3dfd0');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(portico, 'portico_upper_edge', 85, 0.3, 6.5, 0, 6.95, 27, '#e3dfd0');
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  let x = -40; x < 40; x += 4) {
    /* 学习注释：建立 pts。pts：二维或三维点列。 */
    const pts = [];
    /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
    for (/* 学习注释：建立 n。 */
    let n = 0; n <= 20; n++) {
      /* 学习注释：建立 t。 */
      const t = Math.PI - (n / 20) * Math.PI;
      /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
      pts.push([x + 2 + 1.68 * Math.cos(t), 4.82 + 1.48 * Math.sin(t), 30.29]);
    }
    /* 学习注释：执行这一句操作：line('granite_arch_outline', pts, 0.13, '#c9c9bc', portico);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    line('granite_arch_outline', pts, 0.13, '#c9c9bc', portico);
  }
  /* 学习注释：执行这一句操作：box(portico, 'east_campus_glass_entry', 7.4, 3.4, 0.15, 0, 5.4, 23.35, '#648b86', {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(portico, 'east_campus_glass_entry', 7.4, 3.4, 0.15, 0, 5.4, 23.35, '#648b86', {
    metalness: 0.4,
    roughness: 0.23,
  });
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 i。 */
  let i = 0; i < 24; i++)
    /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(
      portico,
      'wide_entrance_step',
      12.4,
      0.18,
      0.56,
      0,
      -0.15 + i * 0.18,
      38.7 - i * 0.55,
      '#bfc1b5',
    );
  /* 学习注释：逐项遍历 [-6.4, 6.4]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-6.4, 6.4])
    /* 学习注释：执行这一句操作：line(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    line(
      'entrance_handrail',
      [
        [x, 0.45, 38.6],
        [x, 4.95, 25.9],
      ],
      0.055,
      '#71847c',
      portico,
    );
  // Rear library wing: separate from the eastern administrative frontage.
  // The west facade follows the official library photos, not a mirrored front facade.
  /* 学习注释：建立 rearLibrary。 */
  const rearLibrary = group(parent, 'main_3_rear_library');
  /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
  rearLibrary.position.z = -46;
  /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
  rearLibrary.userData = {
    library: true,
    description:
      'Main 3 west/rear library wing; photo-guided massing and 2025 guide orientation; estimated dimensions',
  };
  /* 学习注释：执行这一句操作：box(rearLibrary, 'library_five_floor_body', 40, 21.4, 44, 0, 10.55, 0, '#e9e8df');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(rearLibrary, 'library_five_floor_body', 40, 21.4, 44, 0, 10.55, 0, '#e9e8df');
  /* 学习注释：执行这一句操作：box(rearLibrary, 'library_granite_base', 40.5, 3.0, 44.5, 0, 1.25, 0, '#b8b9af');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(rearLibrary, 'library_granite_base', 40.5, 3.0, 44.5, 0, 1.25, 0, '#b8b9af');
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 f。 */
  let f = 0; f < 5; f++) {
    /* 学习注释：建立 y。 */
    const y = 1.5 + f * 4.15;
    /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(
      rearLibrary,
      'rear_horizontal_floor_joint',
      40.4,
      0.08,
      0.08,
      0,
      y,
      -22.22,
      '#c7c8bd',
    );
    /* 学习注释：逐项遍历 [-16, 0, 16]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-16, 0, 16]) {
      /* 学习注释：执行这一句操作：box(rearLibrary, 'rear_white_pier', 3.5, 21.8, 0.52, x, 10.65, -22.1, '#f2eee3');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(rearLibrary, 'rear_white_pier', 3.5, 21.8, 0.52, x, 10.65, -22.1, '#f2eee3');
      /* 学习注释：执行这一句操作：box(rearLibrary, 'rear_pier_slit', 1.5, 0.47, 0.1, x, y + 1.1, -22.4, '#7d9790');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(rearLibrary, 'rear_pier_slit', 1.5, 0.47, 0.1, x, y + 1.1, -22.4, '#7d9790');
    }
    /* 学习注释：逐项遍历 [-1, 1]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 side。 */
    const side of [-1, 1]) {
      /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(
        rearLibrary,
        'rear_glass_ventilation_bay',
        10.1,
        3.35,
        0.13,
        side * 8,
        y + 0.6,
        -22.31,
        '#79958c',
      );
      /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
      for (/* 学习注释：建立 k。 */
      let k = 0; k < 7; k++)
        /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(
          rearLibrary,
          'rear_horizontal_louver',
          10.45,
          0.12,
          0.35,
          side * 8,
          y - 0.75 + k * 0.45,
          -22.51,
          '#c4c9bc',
        );
    }
    /* 学习注释：逐项遍历 [-20.2, 20.2]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
    const x of [-20.2, 20.2])
      /* 学习注释：逐项遍历 [-16, -9, -2, 5, 12, 19]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 z。 */
      const z of [-16, -9, -2, 5, 12, 19]) {
        /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(
          rearLibrary,
          'library_side_vertical_pier',
          0.38,
          21.6,
          1.1,
          x,
          10.6,
          z,
          '#edece1',
        );
        /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(
          rearLibrary,
          'library_side_glass',
          0.12,
          3.1,
          4.0,
          x,
          y + 0.6,
          z + 2.5,
          '#7d9790',
        );
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 k。 */
        let k = 0; k < 6; k++)
          /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          box(
            rearLibrary,
            'library_side_louver',
            0.3,
            0.1,
            4.1,
            x,
            y - 0.5 + k * 0.48,
            z + 2.5,
            '#c6cabf',
          );
      }
  }
  /* 学习注释：逐项遍历 [-5.6, 5.6]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-5.6, 5.6]) {
    /* 学习注释：执行这一句操作：cylinder(rearLibrary, 'west_portal_column', 0.45, 4.25, x, 2.0, -24.0, '#c4c4b7');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    cylinder(rearLibrary, 'west_portal_column', 0.45, 4.25, x, 2.0, -24.0, '#c4c4b7');
    /* 学习注释：执行这一句操作：box(rearLibrary, 'portal_capital', 1.25, 0.27, 1.05, x, 4.18, -24, '#e3dfd1');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(rearLibrary, 'portal_capital', 1.25, 0.27, 1.05, x, 4.18, -24, '#e3dfd1');
  }
  /* 学习注释：执行这一句操作：box(rearLibrary, 'west_library_portal', 12.5, 0.38, 3.4, 0, 4.52, -23.1, '#c9ccbf');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(rearLibrary, 'west_library_portal', 12.5, 0.38, 3.4, 0, 4.52, -23.1, '#c9ccbf');
  /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  box(
    rearLibrary,
    'west_library_glass_entry',
    8.5,
    3.15,
    0.14,
    0,
    1.95,
    -22.56,
    '#759b92',
  );
  /* 学习注释：逐项遍历 [-3, -1, 1, 3]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-3, -1, 1, 3])
    /* 学习注释：执行这一句操作：box(rearLibrary, 'west_entry_mullion', 0.07, 3.0, 0.19, x, 2, -22.69, '#d6d9cb');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(rearLibrary, 'west_entry_mullion', 0.07, 3.0, 0.19, x, 2, -22.69, '#d6d9cb');
  /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
  for (/* 学习注释：建立 i。 */
  let i = 0; i < 5; i++)
    /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(
      rearLibrary,
      'west_threshold_step',
      11.5,
      0.16,
      0.5,
      0,
      -0.2 + i * 0.16,
      -25.5 + i * 0.48,
      '#c4c6b8',
    );
  /* 学习注释：逐项遍历 [-16, 0, 16]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-16, 0, 16]) {
    /* 学习注释：执行这一句操作：box(rearLibrary, 'roof_pier_extension', 3.5, 2.7, 3.0, x, 22.45, -18.0, '#edece1');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(rearLibrary, 'roof_pier_extension', 3.5, 2.7, 3.0, x, 22.45, -18.0, '#edece1');
    /* 学习注释：执行这一句操作：cylinder(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    cylinder(
      rearLibrary,
      'roof_round_vent',
      0.42,
      0.08,
      x,
      23.15,
      -19.56,
      '#658079',
    ).rotation.x = Math.PI / 2;
  }
  /* 学习注释：执行这一句操作：roof('library_west_open_pavilion', 43, 22, 6.4, 25.1, 0, -12.1, rearLibrary);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  roof('library_west_open_pavilion', 43, 22, 6.4, 25.1, 0, -12.1, rearLibrary);
  /* 学习注释：执行这一句操作：roof('library_east_low_pavilion', 43, 21, 4.0, 23.3, 0, 12.1, rearLibrary);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
  roof('library_east_low_pavilion', 43, 21, 4.0, 23.3, 0, 12.1, rearLibrary);
  /* 学习注释：逐项遍历 [-16, -8, 0, 8, 16]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-16, -8, 0, 8, 16])
    /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(
      rearLibrary,
      'rear_exposed_roof_post',
      0.42,
      3.4,
      0.42,
      x,
      23.55,
      -20.7,
      '#916c4a',
    );
  /* 学习注释：逐项遍历 [-21.9, 21.9]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-21.9, 21.9])
    /* 学习注释：逐项遍历 [-18, -8, 2, 12]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 z。 */
    const z of [-18, -8, 2, 12]) /* 学习注释：执行这一句操作：plant(rearLibrary, x, z, 1.55);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    plant(rearLibrary, x, z, 1.55);
  // Four five-storey companion blocks give the documented one-main/four-secondary context.
  /* 学习注释：逐项遍历 [-47, -31, 31, 47]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-47, -31, 31, 47]) {
    /* 学习注释：建立 block。 */
    const block = group(parent, 'five_floor_companion_context');
    /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
    block.userData = {
      building: { '-47': '主一', '-31': '主二', 31: '主四', 47: '主五' }[x],
      longitudinalExtent: [-68, 23],
      estimated: true,
    };
    /* 学习注释：执行这一句操作：box(block, 'white_teaching_block', 12.5, 18.6, 91, x, 9.2, -22.5, '#e9e7dc');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(block, 'white_teaching_block', 12.5, 18.6, 91, x, 9.2, -22.5, '#e9e7dc');
    /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
    for (/* 学习注释：建立 n。 */
    let n = 0; n < 5; n++) {
      /* 学习注释：逐项遍历 [-4.2, -1.4, 1.4, 4.2]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 dx。 */
      const dx of [-4.2, -1.4, 1.4, 4.2])
        /* 学习注释：逐项遍历 [23.06, -68.06]，每轮使用一个元素；不是复制整个场景。 */
        for (/* 学习注释：建立 zz。 */
        const zz of [23.06, -68.06])
          /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          box(
            block,
            'companion_end_window',
            1.25,
            2.2,
            0.09,
            x + dx,
            1.8 + n * 3.5,
            zz,
            '#8b9d96',
          );
      /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
      for (/* 学习注释：建立 zz。 */
      let zz = -64; zz < 23; zz += 5.3)
        /* 学习注释：逐项遍历 [-1, 1]，每轮使用一个元素；不是复制整个场景。 */
        for (/* 学习注释：建立 side。 */
        const side of [-1, 1]) {
          /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          box(
            block,
            'companion_side_window',
            0.09,
            2.2,
            2.1,
            x + side * 6.29,
            1.8 + n * 3.5,
            zz,
            '#8b9d96',
          );
          /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          box(
            block,
            'companion_side_pier',
            0.2,
            18.6,
            0.48,
            x + side * 6.32,
            9.2,
            zz + 2.5,
            '#efece2',
          );
        }
    }
    /* 学习注释：逐项遍历 [14, -8, -31, -59].entries()，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 i、zz。 */
    const [i, zz] of [14, -8, -31, -59].entries())
      /* 学习注释：执行这一句操作：roof('companion_longitudinal_pavilion_' + i, 14, 23.5, 3.4, 20.5, x, zz, block);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      roof('companion_longitudinal_pavilion_' + i, 14, 23.5, 3.4, 20.5, x, zz, block);
  }
  // Landscape is deliberately subordinate to the architectural profile.
  /* 学习注释：逐项遍历 [-55, -24, 24, 55]，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
  const x of [-55, -24, 24, 55])
    /* 学习注释：逐项遍历 [28, 41]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 z。 */
    const z of [28, 41]) /* 学习注释：执行这一句操作：plant(parent, x, z, 2.1);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    plant(parent, x, z, 2.1);
  /* 学习注释：建立 detailCount。 */
  const detailCount = parent.children.length;
  /* 学习注释：建立 main3Parts。 */
  const main3Parts = parent.children.filter(
    (g) =>
      g === main ||
      g === tower ||
      g === portico ||
      g === rearLibrary ||
      roofGroups.slice(0, 7).includes(g),
  );
  /* 学习注释：逐项遍历 main3Parts，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 part。 */
  const part of main3Parts) /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
  part.userData.main3 = true;
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return { roofGroups, detailCount, rearLibrary, main3Parts };
}

export { FLOOR_INFO, buildLibraryFloors } from './library-layout.js';
