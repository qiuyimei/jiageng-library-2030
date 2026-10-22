// 静读服务的演示规则。它没有连接语言模型，也不读取读者身份或真实预约。
// 这个模块只返回信息建议，没有搬动家具、修改预约和控制设备的能力。
export const SOURCES = {
  rules: {title:'馆方入馆须知', url:'https://library.xujc.com/rgxz/list.htm'},
  layout: {title:'2025年馆藏布局参考', url:'https://library.xujc.com/2025/0901/c4536a161543/page.htm'},
  update: {title:'2026年馆长座谈与馆藏调整说明', url:'https://library.xujc.com/2026/0616/c4495a170597/page.htm'},
  catalog: {title:'官方馆藏检索入口', url:'https://catalog.xujc.com/'},
  room: {title:'官方研讨室服务入口', url:'https://library.xujc.com/yts/list.htm'},
  seat: {title:'官方座位预约说明', url:'https://library.xujc.com/zwyy/list.htm'},
  special: {title:'嘉庚特色自建数据库介绍', url:'https://library.xujc.com/zjsjk_7861/list.htm'},
};

// floor 是模型中从1开始的楼层编号；匹配的是大类，绝不是具体图书库存。
// tokens 用于本地关键词演示。实际AI阶段应检索来源资料并核对结构化输出。
const SUBJECTS = [
  {key:'software', tokens:['软件','编程','计算机','程序','人工智能'],floor:4,label:'TP 计算机',name:'计算机与软件'},
  {key:'architecture',tokens:['建筑','土木'],floor:4,label:'TU 建筑科学',name:'建筑与工程'},
  {key:'history',tokens:['历史','地方文献','闽南','嘉庚精神'],floor:4,label:'K 历史地理',name:'历史与地方文化'},
  {key:'literature',tokens:['文学','小说','诗歌'],floor:3,label:'I 文学',name:'文学'},
  {key:'language',tokens:['语言','英语','日语','翻译'],floor:3,label:'H 语言文字',name:'语言与文字'},
  {key:'economics',tokens:['经济','金融','会计'],floor:2,label:'F 经济',name:'经济'},
];

// 返回模板化任务卡。sources只保存来源键，页面再从白名单取得URL。
export function createPlan(input) {
  if (!input || !['book','study','group','culture'].includes(input.task)) {
    throw new Error('请先选择一个任务。');
  }
  const topic = String(input.topic ?? '').trim().slice(0,240);
  const conditions = ['normal','changed','offline','full','unknown'];
  if (!conditions.includes(input.condition)) throw new Error('演示情境不合法。');
  const subject = SUBJECTS.find(s => s.key === input.subject)
    || SUBJECTS.find(s => s.tokens.some(t => topic.includes(t)));
  const p = {
    task:input.task, title:'静读任务卡', floor:0, zone:null, mode:'information',
    topic, sources:['rules'], steps:[], cautions:[],
    // 以下三个false是产品能力边界，而不是对用户的授权判断。
    changesFurniture:false, writesReservation:false, controlsEquipment:false,
    interpretation:'本地规则演示；未接入真实AI、预约状态或库存。',
  };
  if (input.task === 'book') {
    p.title = '先查馆藏，再看楼层';
    p.sources.push('catalog','layout','update');
    p.steps.push('到官方检索系统确认书名、索书号、当前馆藏地与借阅状态。');
    if(subject) {
      p.floor=subject.floor; p.zone=subject.label;
      p.steps.push(`模型定位到${subject.floor}楼“${subject.label}”的大类参考区，帮助理解相对方位。`);
    } else {
      p.steps.push('现有演示索引不能确认该主题的楼层。保留官方检索入口，不编造位置。');
    }
    p.steps.push('具体书架以检索结果与现场架标为准；导览模型不能证明书在架。');
  } else if(input.task === 'study') {
    p.title='保持安静，按已有规则选座'; p.floor=5; p.zone='备考联盟区';
    p.sources.push('seat','layout');
    p.steps.push('先查看官方座位预约说明与自己的使用资格，不把模型中的空桌当作可用座位。');
    p.steps.push('五楼仅展示既有备考区域的相对位置。其他阅读位置仍可按现场规则使用。');
    p.steps.push('你可以跳过本页面，继续使用原有预约系统和现场导览。');
    p.cautions.push('本原型不提供实时余座，也不改变备考联盟的申请条件。');
  } else if(input.task === 'group') {
    p.title = input.speaking ? '需要讨论：查看既有研讨室' : '无声协作：先确定资料与分工';
    if(input.speaking) {
      p.sources.push('room');
      p.steps.push('在官方研讨室入口核对人数条件、可用时段与使用规则。');
      p.steps.push('预约成功后按馆方规定使用房间；页面不代你提交预约。');
      p.steps.push('开放阅览区继续保持安静，不在书库、中庭或展区临时开展有声讨论。');
      p.cautions.push('研讨室具体位置尚未在本模型核验，因此不画虚构房间或精确路线。');
    } else {
      p.steps.push('通过自己的文字协作工具安排检索分工；各自在现有允许使用的座位阅读。');
      p.steps.push('不拼桌、不要求相邻读者让座；需要说话时转到合规的预约空间。');
      p.sources.push('catalog');
      if(subject) {p.floor=subject.floor;p.zone=subject.label;p.steps.push(`资料大类可先参考${subject.floor}楼“${subject.label}”，再到官方目录确认。`);}
    }
  } else {
    p.title='嘉庚特色知识探索';p.sources.push('special','catalog');
    p.steps.push('从馆方自建数据库介绍开始，查看红树学人、语言文化和地方历史等主题线索。');
    p.steps.push('当前只提供经过核对的介绍入口，不声称已取得数据库全文。');
    p.steps.push('未来在取得内容许可后，AI可帮助比较主题和生成带出处的阅读问题；当前尚未实现。');
    p.cautions.push('特色数字资源尚未绑定真实展位，不把任意楼层指认为数据库所在地。');
  }
  if(input.condition==='changed' && p.zone) {
    p.zone=null;p.floor=0;p.mode='stale';
    p.steps=p.steps.filter(text=>!text.includes('模型定位到')&&!text.includes('五楼仅展示')&&!text.includes('资料大类可先参考'));
    p.steps.push('旧分区提示已撤去；待当前馆方导览核验后再提供楼层定位。');
    p.cautions.unshift('模拟馆藏位置调整：撤去旧分区高亮，改用官方目录与临时架标。');
  }
  if(input.condition==='offline') {
    p.mode='offline';
    p.cautions.unshift('模拟外部服务离线：可看缓存导览与来源地址，无法确认当前库存、预约或开放情况。');
  }
  if(input.task==='group' && input.speaking && input.condition==='full') {
    p.mode='unavailable';
    p.steps.splice(1,1,'模拟研讨室已满：另选时段或先各自检索。合适空间尚未确认时不开展有声讨论。');
    p.cautions.unshift('已满是演示条件，不是馆方实时数据；不自动扩容，也不把阅读区改为研讨区。');
  }
  if(input.condition==='unknown') {
    p.mode='unknown';
    p.zone=null;p.floor=0;
    p.steps=p.steps.filter(text=>!text.includes('模型定位到')&&!text.includes('五楼仅展示')&&!text.includes('资料大类可先参考'));
    p.cautions.unshift('模拟信息尚未确认：只保留办事入口，不把未知状态写成可用。');
  }
  p.sources=[...new Set(p.sources)];
  return p;
}
