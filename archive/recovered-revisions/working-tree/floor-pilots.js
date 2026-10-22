/* 本人零基础学习副本：仅排版和解释，原有业务逻辑不变。
 * 全套架构、实例和修改方法请读文档及源码导航。
 */
/* 学习注释：从 three 导入模块；只有构建后单文件网页才可以直接 file 双击运行。 */
import * as THREE from 'three';
export /* 学习注释：建立 PILOT_INFO。PILOT_INFO：每层拟议服务、候选坐标和保护项。 */
const PILOT_INFO = [
  {
    n: 1,
    title: '服务导览与高峰分流',
    location: '服务层候选区；一楼位置待现场核验',
    x: 0,
    z: 4,
    w: 14,
    d: 9,
    color: '#378a9a',
    normal: '集中咨询',
    active: '导览 / 咨询分流',
    trigger: '模拟咨询排队6人，启用第二个引导点。',
    action: '两台新增移动导览台分开，分别承接找书与咨询。排队线保持在候选区内。',
    protect: '不改变借阅总台、密集书库或出入口；现场核对平面后再选址。',
    metric: '排队等待、路线完成率、人工介入次数',
    phase: '第二阶段：先核对一楼服务平面',
  },
  {
    n: 2,
    title: '阅读支持与无声结对',
    location: '南侧西端阅读边缘候选位',
    x: 12,
    z: 14.3,
    w: 5,
    d: 4,
    color: '#509981',
    normal: '独立研读',
    active: '无声结对',
    trigger: '模拟2名读者申请结对阅读，且候选桌位空闲。',
    action: '两张新增小桌并拢，用电子便签协作；需要说话时引导预约研讨室。',
    protect: 'A—F馆藏、现有预约及阅读安静程度；书架和回廊不移动。',
    metric: '空闲桌利用率、干扰反馈、资源点击率',
    phase: '第二阶段：小范围阅读边缘试点',
  },
  {
    n: 3,
    title: '西侧展区与无声共创',
    location: '2025导览标示的西侧展区',
    x: 0,
    z: 20,
    w: 18,
    d: 3.5,
    color: '#b88c4e',
    normal: '展览 / 自由阅读',
    active: '预约共创',
    trigger: '模拟预约一场无声主题共创；馆员核对展览档期。',
    action: '新增折叠阅读桌汇成两组，共8个示意座位；移动展板转向外围展示。',
    protect: 'G/H/I馆藏、中庭台阶、回廊和展览档期。有声讨论转入现有研讨室。',
    metric: '预约完成、展览利用、邻近投诉、复原时间',
    phase: '第一阶段：优先在三楼验证流程',
  },
  {
    n: 4,
    title: '学科检索与项目协作',
    location: '南侧技术类馆藏旁阅读边缘候选位',
    x: 12,
    z: 17,
    w: 5,
    d: 2.6,
    color: '#837ea5',
    normal: '个人检索',
    active: '项目检索协作',
    trigger: '模拟课程小组需要建筑、计算机等跨类资料。',
    action: '新增检索小桌并拢，资源屏由单主题切换为项目清单；保持无声协作。',
    protect: 'J/K与工程技术馆藏、东侧文化交流功能及通道；讨论仍需预约房间。',
    metric: '检索任务成功率、学科资源访问、馆员反馈',
    phase: '第三阶段：联合学科馆员完善资源清单',
  },
  {
    n: 5,
    title: '安静备考与预约保护',
    location: '东侧备考联盟；保留原有桌椅布局',
    x: 0,
    z: -14,
    w: 27,
    d: 15,
    color: '#78965e',
    normal: '固定安静备考',
    active: '静音席位引导',
    trigger: '模拟备考高峰，显示空闲候选席位及预约保护。',
    action: '只开启桌边无声提示：绿色为本次可选，金色为有效预约；不移动备考桌椅。',
    protect: '备考用途、有效预约、原有桌椅与安静环境；五楼不转换为研讨空间。',
    metric: '找座耗时、预约冲突、安静满意度',
    phase: '第二阶段：先做席位信息提示',
  },
];
export /* 学习注释：buildFloorPilots：为每层添加候选试点
 * 读取/参数：storeys、H与PILOT_INFO
 * 产生/改变：返回pilots数组和各层apply方法
 * 阅读与修改：proposal:true/surveyed:false；三楼replaced有可见性替换。 */
function buildFloorPilots(storeys, H) {
  /* 学习注释：建立 group、box、table、chair。 */
  const { group, box, table, chair } = H;
  /* 学习注释：建立 pilots。pilots：每层试点对象及 apply 插值函数。 */
  const pilots = [];
  /* 学习注释：move：保存单个设施两种布局
   * 读取/参数：对象、常态/目标X Z与角度
   * 产生/改变：将初始姿态设为常态，追加到p.moving
   * 阅读与修改：所有坐标相对该层组；椅子和展板也在moving里。 */
  function move(p, obj, x, z, tx, tz, rot = 0, tr = rot) {
    /* 学习注释：设置对象相对其父组的位置。父组楼层高度还会叠加到世界位置；盒子坐标是中心点。 */
    obj.position.set(x, 0, z);
    /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
    obj.rotation.y = rot;
    /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
    p.moving.push({
      object: obj,
      read: new THREE.Vector3(x, 0, z),
      active: new THREE.Vector3(tx, 0, tz),
      readRot: rot,
      activeRot: tr,
    });
  }
  /* 学习注释：逐项遍历 PILOT_INFO，每轮使用一个元素；不是复制整个场景。 */
  for (/* 学习注释：建立 info。 */
  const info of PILOT_INFO) {
    /* 学习注释：建立 floor、root。root：当前组合对象的父节点或待导出对象。 */
    const floor = storeys[info.n - 1],
      root = group(floor.root, 'proposed_floor_' + info.n + '_pilot');
    /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
    root.visible = false;
    /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
    root.userData = {
      proposal: true,
      surveyed: false,
      title: info.title,
      location: info.location,
    };
    /* 学习注释：建立 p。p：局部试点配置、三维点或 DOM 段落，以当前函数为准。 */
    const p = { info, root, moving: [], activeObjects: [], replaced: [] };
    /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    box(
      root,
      'proposed_candidate_zone',
      info.w,
      0.026,
      info.d,
      info.x,
      0.225,
      info.z,
      info.color,
      { transparent: true, opacity: 0.28 },
    );
    /* 学习注释：逐项遍历 [-info.d / 2, info.d / 2]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 dz。 */
    const dz of [-info.d / 2, info.d / 2])
      /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(
        root,
        'proposed_zone_border',
        info.w,
        0.026,
        0.08,
        info.x,
        0.24,
        info.z + dz,
        info.color,
      );
    /* 学习注释：逐项遍历 [-info.w / 2, info.w / 2]，每轮使用一个元素；不是复制整个场景。 */
    for (/* 学习注释：建立 dx。 */
    const dx of [-info.w / 2, info.w / 2])
      /* 学习注释：执行这一句操作：box(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
      box(
        root,
        'proposed_zone_border',
        0.08,
        0.026,
        info.d,
        info.x + dx,
        0.24,
        info.z,
        info.color,
      );
    /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 info.n === 1。 */
    if (info.n === 1) {
      /* 学习注释：逐项遍历 [-1, 1]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 side。 */
      const side of [-1, 1]) {
        /* 学习注释：建立 kiosk。 */
        const kiosk = group(root, 'proposed_mobile_guidance');
        /* 学习注释：执行这一句操作：box(kiosk, 'guidance_base', 1.8, 0.9, 0.9, 0, 0.55, 0, '#b9c9bc');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(kiosk, 'guidance_base', 1.8, 0.9, 0.9, 0, 0.55, 0, '#b9c9bc');
        /* 学习注释：执行这一句操作：box(kiosk, 'guidance_screen', 1.3, 0.6, 0.08, 0, 1.25, -0.28, info.color);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(kiosk, 'guidance_screen', 1.3, 0.6, 0.08, 0, 1.25, -0.28, info.color);
        /* 学习注释：执行这一句操作：move(p, kiosk, side * 1.2, 4, side * 4.1, 3.3);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        move(p, kiosk, side * 1.2, 4, side * 4.1, 3.3);
      }
      /* 学习注释：逐项遍历 [-4, 4]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-4, 4])
        /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
        for (/* 学习注释：建立 z。 */
        let z = 5; z < 8; z += 1.2) {
          /* 学习注释：建立 arrow。 */
          const arrow = box(
            root,
            'proposed_queue_prompt',
            0.7,
            0.025,
            0.45,
            x,
            0.27,
            z,
            info.color,
          );
          /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
          p.activeObjects.push(arrow);
        }
    } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 info.n === 2 || info.n === 4。 */
    if (info.n === 2 || info.n === 4) {
      /* 学习注释：建立 z。 */
      const z = info.z;
      /* 学习注释：逐项遍历 [-1, 1]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 side。 */
      const side of [-1, 1]) {
        /* 学习注释：建立 t。 */
        const t = table(root, 0, 0, 1.6, 0.75);
        /* 学习注释：执行这一句操作：move(p, t, info.x + side * 1.1, z, info.x + side * 0.8, z);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        move(p, t, info.x + side * 1.1, z, info.x + side * 0.8, z);
        /* 学习注释：逐项遍历 [-0.82, 0.82]，每轮使用一个元素；不是复制整个场景。 */
        for (/* 学习注释：建立 dz。 */
        const dz of [-0.82, 0.82]) {
          /* 学习注释：建立 c。 */
          const c = chair(root, 0, 0, dz > 0 ? Math.PI : 0, info.color);
          /* 学习注释：执行这一句操作：c.scale.setScalar(0.78);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          c.scale.setScalar(0.78);
          /* 学习注释：执行这一句操作：move(。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          move(
            p,
            c,
            info.x + side * 1.1,
            z + dz,
            info.x + side * 0.8,
            z + dz,
            dz > 0 ? Math.PI : 0,
          );
        }
      }
      /* 学习注释：建立 screen。 */
      const screen = box(
        root,
        'proposed_resource_prompt',
        0.95,
        0.35,
        0.07,
        info.x,
        1.13,
        z - 0.3,
        info.color,
      );
      /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
      p.activeObjects.push(screen);
    } else /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 info.n === 3。 */
    if (info.n === 3) {
      /* 学习注释：建立 old。 */
      const old = floor.furniture.children.find((g) => g.userData.zone === '西侧展区');
      /* 学习注释：条件分支：先计算括号内的条件，真才执行本分支；假时转向 else 或继续。此条件是 old。 */
      if (old) /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
      p.replaced.push(old);
      /* 学习注释：计数循环：先初始化，再检查范围，运行一轮后更新计数；几何重复构件由这里生成。 */
      for (/* 学习注释：建立 i。 */
      let i = 0; i < 4; i++) {
        /* 学习注释：建立 xx、tx。 */
        const xx = -6 + i * 4,
          tx = i < 2 ? -4.6 + (i % 2) * 1.9 : 2.7 + (i % 2) * 1.9;
        /* 学习注释：建立 t。 */
        const t = table(root, 0, 0, 1.8, 0.78);
        /* 学习注释：执行这一句操作：move(p, t, xx, 20, tx, 20);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        move(p, t, xx, 20, tx, 20);
        /* 学习注释：逐项遍历 [-0.95, 0.95]，每轮使用一个元素；不是复制整个场景。 */
        for (/* 学习注释：建立 dz。 */
        const dz of [-0.95, 0.95]) {
          /* 学习注释：建立 c。 */
          const c = chair(root, 0, 0, dz > 0 ? Math.PI : 0, info.color);
          /* 学习注释：执行这一句操作：c.scale.setScalar(0.85);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          c.scale.setScalar(0.85);
          /* 学习注释：执行这一句操作：move(p, c, xx, 20 + dz, tx, 20 + dz, dz > 0 ? Math.PI : 0);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
          move(p, c, xx, 20 + dz, tx, 20 + dz, dz > 0 ? Math.PI : 0);
        }
      }
      /* 学习注释：逐项遍历 [-7, 0, 7]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-7, 0, 7]) {
        /* 学习注释：建立 board。 */
        const board = group(root, 'proposed_mobile_exhibition_board');
        /* 学习注释：执行这一句操作：box(board, 'board', 2.2, 1.5, 0.1, 0, 1.1, 0, '#b4c6b5');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(board, 'board', 2.2, 1.5, 0.1, 0, 1.1, 0, '#b4c6b5');
        /* 学习注释：执行这一句操作：box(board, 'graphic', 1.95, 1.1, 0.04, 0, 1.18, -0.08, '#b9a383');。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        box(board, 'graphic', 1.95, 1.1, 0.04, 0, 1.18, -0.08, '#b9a383');
        /* 学习注释：执行这一句操作：move(p, board, x, 18.7, x, 21.7);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
        move(p, board, x, 18.7, x, 21.7);
      }
    } else {
      /* 学习注释：逐项遍历 [-10, -5, 0, 5, 10]，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 x。x：规则函数中为输入对象；几何循环中可能是横坐标，以当前作用域为准。 */
      const x of [-10, -5, 0, 5, 10])
        /* 学习注释：逐项遍历 [-18, -12, -7]，每轮使用一个元素；不是复制整个场景。 */
        for (/* 学习注释：建立 z。 */
        const z of [-18, -12, -7]) {
          /* 学习注释：建立 marker。 */
          const marker = box(
            root,
            'proposed_quiet_seat_prompt',
            2.3,
            0.05,
            0.18,
            x,
            0.97,
            z - 0.42,
            x === 0 ? '#c39e4b' : '#739b68',
          );
          /* 学习注释：保存作者自定义标签；floor/main3/zone 等用于点击归属与说明，不会自动产生几何或认证。 */
          marker.userData.reserved = x === 0;
          /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
          p.activeObjects.push(marker);
        }
    }
    /* 学习注释：执行这一句操作：p.apply = (t) => {。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    p.apply = (t) => {
      /* 学习注释：逐项遍历 p.moving，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 m。m：局部 Mesh 或移动项；以所在循环为准。 */
      const m of p.moving) {
        /* 学习注释：按 0 到 1 的进度在预设两位置间插值；这里没有路径规划、避碰或真实设备控制。 */
        m.object.position.lerpVectors(m.read, m.active, t);
        /* 学习注释：设置旋转；rotation 使用弧度，Math.PI 为 180 度，四元数用于对齐方向。 */
        m.object.rotation.y = m.readRot + (m.activeRot - m.readRot) * t;
      }
      /* 学习注释：逐项遍历 p.activeObjects，每轮使用一个元素；不是复制整个场景。 */
      for (/* 学习注释：建立 a。 */
      const a of p.activeObjects) /* 学习注释：控制显示/隐藏，false 不删除对象或其数据。切楼层和方案叠加通过这一属性复用同一份模型。 */
      a.visible = t > 0.4;
    };
    /* 学习注释：执行这一句操作：p.apply(0);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
    p.apply(0);
    /* 学习注释：追加一项到数组，保持已有数据。日志、顶点、三角面或移动项随后由其他函数消费。 */
    pilots.push(p);
  }
  /* 学习注释：把这个结果交还调用处，并结束当前函数；return 后的本函数语句不再执行。 */
  return pilots;
}
