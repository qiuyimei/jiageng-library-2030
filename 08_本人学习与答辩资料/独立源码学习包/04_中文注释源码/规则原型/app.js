/* 中文学习注释副本  原始项目请见01目录
规则与资源演示的完整脚本。第1段变量和索引，第2段输入与核验，第3段执行与恢复，第4段会话，第5段预设与导入，第6段控件事件绑定。
*/

'use strict';
const $=id=>document.getElementById(id);
const states={A:'固定静音',B:'常态阅读',C:'特色阅读',D:'预约研讨'};
let clockSeconds=9*3600,cooldownUntil=0,pending=null,events=[],joined=false,emptySince=null;
const capacities={A:24,B:12,C:8,D:8};
const index=[
{title:'卢昌义红树学人资源介绍',url:'https://library.xujc.com/zjsjk_7861/list.htm',tags:['红树','生态','湿地'],note:'官方介绍页。数据库在核对时标注建设中；不提供虚构论文结果。'},
{title:'文化语言学数据库',url:'https://library.xujc.com/whyyx/',tags:['语言','闽南','文化','方言'],note:'图书馆公开列出的专题入口，开放范围以官网为准。'},
{title:'馆史数据库',url:'https://library.xujc.com/gssjk/main.htm',tags:['嘉庚','馆史','图书馆'],note:'图书馆发展与校园文化资源入口。'},
{title:'戴一峰教授与地方史资源介绍',url:'https://library.xujc.com/zjsjk_7861/list.htm',tags:['地方','历史','闽南','华侨'],note:'官方介绍页。数据库标注建设中，进一步资料可咨询馆员。'},
{title:'馆藏目录检索',url:'https://catalog.xujc.com',tags:[],note:'通用检索入口。请用所填主题自行检索，访问权限以馆内规则为准。'}];

/* time
职责：模拟时钟格式化
输入：读取clockSeconds
结果：返回HH:MM:SS字符串，不更新时钟
注意：真实时间不会让模拟时钟自动前进；小时对24取余。 */
function time(){return [Math.floor(clockSeconds/3600)%24,Math.floor(clockSeconds/60)%60,clockSeconds%60].map(x=>String(x).padStart(2,'0')).join(':');}

/* log
职责：记录操作事件
输入：type与detail，以及time()结果
结果：向events追加time/type/detail/dataSource，然后重绘日志
注意：事件来源固定simulation，记录不含真实批准人。 */
function log(type,detail){events.push({time:time(),type,detail,dataSource:'simulation'});renderLog();}

/* renderLog
职责：生成日志DOM
输入：读取events，逆序展示
结果：replaceChildren清空旧日志，逐条用textContent创建p
注意：没有数据库；数组没有上限，长时演示可增加保留策略。 */
function renderLog(){const box=$('logs');box.replaceChildren();events.slice().reverse().forEach(e=>{const p=document.createElement('p');p.textContent=`${e.time} ${e.type} · ${e.detail}`;box.append(p);});}

/* read
职责：把表单转成输入对象
输入：people/duration/vacancy/confidence与五个复选框
结果：校验数字后返回10字段对象，异常则throw Error
注意：Number空字符串会变0；当前控件与导入校验不完全同一层。 */
function read(){const p=Number($('people').value),d=Number($('duration').value),v=Number($('vacancy').value),c=Number($('confidence').value);if(!Number.isInteger(p)||p<0||p>30||!Number.isFinite(d)||d<0||d>7200||!Number.isFinite(v)||v<0||v>7200||!Number.isFinite(c)||c<0||c>1)throw Error('人数须为0至30整数，时间须在0至7200秒，置信度须为0至1。');return {zone:$('zone').value,people:p,confidence:c,durationSec:d,vacancySec:v,acoustic:$('acoustic').checked,available:$('available').checked,objection:$('objection').checked,sensorFault:$('sensorFault').checked,reserved:$('reserved').checked};}

/* checks
职责：计算十条转换约束
输入：区域对象x、capacities、clockSeconds与cooldownUntil
结果：返回[说明,布尔]数组，不直接执行转换
注意：every全通过才允许候选，不能改成多数通过或平均分。 */
function checks(x){return [ ['感知输入正常',!x.sensorFault],['仅B区允许转换',x.zone==='B'],['人数满足3人且不超过容量',x.people>=3&&x.people<=capacities[x.zone]],['聚集置信度达到0.70',x.confidence>=.70],['候选状态持续120秒',x.durationSec>=120],['有隔声条件',x.acoustic],['目标时段可用',x.available],['不存在预约冲突',!x.reserved],['未收到邻区异议',!x.objection],['冷却时间已结束',clockSeconds>=cooldownUntil] ];}

/* showRules
职责：把核验结果写到界面
输入：检查结果数组
结果：重建rules列表，文字与pass/fail样式对应
注意：用textContent，不让外部文本成为HTML。 */
function showRules(a){$('rules').replaceChildren();a.forEach(([text,pass])=>{const li=document.createElement('li');li.className=pass?'pass':'fail';li.textContent=(pass?'通过 · ':'未通过 · ')+text;$('rules').append(li);});}

/* message
职责：统一更新建议文字
输入：标题与正文
结果：改decisionTitle和decisionBody
注意：后续调用可能覆盖之前安全提示，需注意优先级。 */
function message(title,body){$('decisionTitle').textContent=title;$('decisionBody').textContent=body;}

/* invalidate
职责：使旧建议不可批准
输入：不接收参数，操作pending与按钮
结果：pending=null，批准与拒绝按钮禁用
注意：前端失效不等于服务端并发保护。 */
function invalidate(){pending=null;$('approve').disabled=true;$('reject').disabled=true;}

/* render
职责：把当前状态表现为图形与指标
输入：read返回输入、states与clockSeconds
结果：更新模拟时钟、人数、照明、负载和至多6个骨骼
注意：240W或320W都是400W假设计算；骨骼不是推理结果。 */
function render(){let x;try{x=read();}catch(e){message('输入无效',e.message);return;}$('clock').textContent=time();$('selectedState').textContent=`${x.zone}区 ${states[x.zone]}`;$('confValue').textContent=x.confidence.toFixed(2);$('countMetric').textContent=x.people;const brightness=x.people===0?35:(x.zone==='B'&&states.B==='研讨使用'?80:60);$('lightMetric').textContent=brightness+'%';$('loadMetric').textContent=(400*brightness/100)+'W';$('bMode').textContent=states.B;$('bPeople').textContent=x.zone==='B'?x.people+'人':'B区状态保留';$('bFill').setAttribute('fill',states.B==='研讨使用'?'#b7e0cf':states.B==='待馆员确认'?'#f2e0be':'#e0f0e8');const svg=$('pose');svg.replaceChildren();for(let i=0;i<Math.min(x.people,6);i++){const px=15+i*29,ns='http://www.w3.org/2000/svg';const path=document.createElementNS(ns,'path');path.setAttribute('d',`M${px},24 L${px},47 M${px-8},35 L${px},31 L${px+8},35 M${px},47 L${px-6},67 M${px},47 L${px+6},67`);path.setAttribute('stroke','#40816e');path.setAttribute('stroke-width','2');path.setAttribute('fill','none');const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',px);circle.setAttribute('cy',17);circle.setAttribute('r',5);circle.setAttribute('fill','#40816e');svg.append(path,circle);} $('poseText').textContent=`合成骨骼 ${Math.min(x.people,6)}个示意 / 区域人数 ${x.people} / 置信度 ${x.confidence.toFixed(2)}。未启用摄像头。`;}

/* safeAbort
职责：使用中的异常降级
输入：当前输入x和B用途状态
结果：条件恶化时进入人工接管，取消pending并记日志
注意：只检查当前选择B且B在使用的情况；不发送设备命令。 */
function safeAbort(x){if(x.zone==='B'&&states.B==='研讨使用'&&(x.sensorFault||x.objection||!x.acoustic||x.reserved||!x.available||x.people>12)){states.B='人工接管';invalidate();message('需要人工接管','条件已变化，停止自动调度并通知馆员；真实试点应由馆员检查空间与设备。');log('安全降级','模拟区域进入人工接管，未发送真实设备指令。');}}

/* evaluate
职责：组织候选建议与恢复分支
输入：读取控件、当前用途、时钟
结果：故障/用途保护/接管/恢复/候选等不同分支
注意：先处理故障与既有使用；不要只读最后every判断。 */
function evaluate(){let x;try{x=read();}catch(e){invalidate();message('输入无效',e.message);return;}invalidate();showRules(checks(x));if(x.sensorFault){if(x.zone==='B')states.B='人工接管';message('感知故障','维持原服务用途，通知馆员人工确认，不执行自动转换。');log('感知故障','禁止自动切换');render();return;}if(x.zone!=='B'){message(x.zone==='A'?'固定静音区受到保护':'按区域既有规则提供服务','该区域不执行用途转换。可引导到可用B区或预约研讨室，实际可用性另行核验。');log('用途保护',`${x.zone}区未转换`);render();return;}safeAbort(x);if(states.B==='人工接管'){message('人工接管中','请由馆员处理异常，重置演示后才能重新运行仿真。');render();return;}if(states.B==='研讨使用'&&x.people===0){if(x.vacancySec>=300){states.B='常态阅读';cooldownUntil=clockSeconds+600;emptySince=null;clearSession(false);message('已恢复常态阅读','连续无人达到300秒，服务状态恢复并开始600秒冷却。实体家具恢复需人工确认。');log('恢复完成','服务用途恢复；照明场景模拟更新；实体家具未控制');}else{emptySince=clockSeconds-x.vacancySec;message('等待恢复确认','需连续无人满300秒，不能因瞬时漏检立即切换。');log('等待恢复',`当前无人${x.vacancySec}秒`);}render();return;}if(states.B==='研讨使用'){message('研讨服务进行中','继续检查环境与反馈；退出会话不会自动取消空间使用。');render();return;}if(checks(x).every(r=>r[1])){pending={...x};states.B='待馆员确认';$('approve').disabled=false;$('reject').disabled=false;message('建议 B区限时研讨','通过约束核验，等待馆员批准。批准前再次检查输入。');log('建议生成',`B区${x.people}人 候选持续${x.durationSec}秒`);}else{states.B='常态阅读';message('本次不转换','存在未满足条件。保持现有用途，可调整申请或人工确认。');log('建议阻止',checks(x).filter(r=>!r[1]).map(r=>r[0]).join('；'));}render();}

/* approve
职责：批准前再次复核
输入：pending存在时重新read与checks
结果：通过后B进入研讨使用，否则拒绝旧建议
注意：没有真实认证与签署；DOM未触发事件的值变更也要防护。 */
function approve(){if(!pending)return;const x=read(),a=checks(x);showRules(a);if(!a.every(r=>r[1])){invalidate();states.B='常态阅读';message('批准被阻止','当前条件与旧建议不同，请重新核验。');log('批准复核失败','未执行');render();return;}states.B='研讨使用';invalidate();message('研讨服务已启用','模拟导览与照明已更新。真实设备与预约系统尚未接入；空间转换需馆员现场保障。');log('馆员批准','B区进入研讨使用；照明80%为模拟场景');render();}

/* clearSession
职责：清理临时资源状态
输入：clearTopic默认true
结果：取消joined、同意勾选与资源列表，按参数清主题
注意：自动恢复用false会保留主题文本，需统一产品清理策略。 */
function clearSession(clearTopic=true){joined=false;$('consent').checked=false;$('resources').replaceChildren();if(clearTopic)$('topic').value='';$('session').textContent='会话已结束，已清除临时资源状态。';}

/* join
职责：自愿主题匹配官方资源
输入：consent、非空topic、固定index
结果：生成匹配项加目录入口，记录自愿加入
注意：不要求B已启用；不是账号、身份或实时检索。 */
function join(){if(!$('consent').checked){$('session').textContent='尚未取得自愿选择，不推送资源。';return;}const topic=$('topic').value.trim();if(!topic){$('session').textContent='请主动填写主题，视觉数据不会推断研讨内容。';return;}joined=true;const rows=index.filter(r=>r.tags.some(t=>topic.includes(t)));rows.push(index[index.length-1]);$('resources').replaceChildren();rows.forEach(r=>{const div=document.createElement('div');div.className='resource';const a=document.createElement('a');a.textContent=r.title;a.href=r.url;a.target='_blank';a.rel='noopener';const p=document.createElement('p');p.textContent=r.note;const p2=document.createElement('p');p2.textContent='推荐依据：'+(r.tags.length?'读者主题与入口标签匹配':'补充检索服务')+'。仅提供入口，无实时检索。';div.append(a,p,p2);$('resources').append(div);});$('session').textContent=`临时会话已加入，主题“${topic}”。信息仅保存在当前页面，结束时清除。`;log('读者自愿加入','根据主动输入主题匹配官方入口，未关联视觉身份');}

/* preset
职责：载入独立演示情境
输入：normal/quiet/low/objection/reservation/fault/end
结果：重置多数状态和控件，再按情境设特定值
注意：不是从真实采样选择场景；会清冷却以方便演示。 */
function preset(s){invalidate();states.B='常态阅读';cooldownUntil=0;emptySince=null;clearSession(false);$('zone').value='B';$('people').value=4;$('confidence').value=.9;$('duration').value=150;$('vacancy').value=0;$('topic').value='红树林生态保护';['acoustic','available'].forEach(id=>$(id).checked=true);['objection','sensorFault','reserved'].forEach(id=>$(id).checked=false);if(s==='quiet')$('zone').value='A';if(s==='low')$('confidence').value=.4;if(s==='objection')$('objection').checked=true;if(s==='reservation')$('reserved').checked=true;if(s==='fault')$('sensorFault').checked=true;if(s==='end'){states.B='研讨使用';$('people').value=0;emptySince=clockSeconds;log('结束场景','从研讨使用开始演示连续无人恢复');}showRules([]);message('场景已载入','选择“生成调度建议”查看规则结果。每个预设场景独立初始化模拟状态。');render();}

/* advance
职责：推进模拟五分钟
输入：clockSeconds和当前人数状态
结果：时钟加300，更新模拟持续或无人值，再评估
注意：不等于传感器连续监测，也不等于Date.now计时。 */
function advance(){clockSeconds+=300;const x=read();if(x.zone==='B'&&x.people===0&&states.B==='研讨使用'){$('vacancy').value=Math.min(7200,Number($('vacancy').value)+300);}if(x.people>=3)$('duration').value=Math.min(7200,Number($('duration').value)+300);log('模拟时间推进','推进300秒，参数为模拟计时');render();evaluate();}

/* download
职责：导出演示事件JSON
输入：读取events与项目标记
结果：创建Blob和ObjectURL，下载后释放URL
注意：文件由用户主动保存，不上传；下载文件不随刷新清除。 */
function download(){const blob=new Blob([JSON.stringify({prototype:'嘉庚2030柔性空间服务原型',implemented:'local rule engine',dataSource:'simulation',events},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='演示日志.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}

/* importData
职责：导入严格演示JSON
输入：本机File对象
结果：解析并校验10字段，同步控件、日志和评估
注意：100000字节上限；拒绝额外字段、非布尔和非法范围。 */
async function importData(file){try{if(!file||file.size>100000)throw Error('请选择小于100KB的区域JSON。');const x=JSON.parse(await file.text());const keys=['zone','people','confidence','durationSec','vacancySec','acoustic','available','objection','sensorFault','reserved'];if(!x||Array.isArray(x)||typeof x!=='object')throw Error('需要区域对象。');if(Object.keys(x).some(k=>!keys.includes(k)))throw Error('含未允许字段，拒绝导入；仅导入区域统计。');if(!['A','B','C','D'].includes(x.zone)||!Number.isInteger(x.people)||x.people<0||x.people>30||typeof x.confidence!=='number'||!Number.isFinite(x.confidence)||x.confidence<0||x.confidence>1)throw Error('区域、人数或置信度无效。');for(const k of ['durationSec','vacancySec'])if(typeof x[k]!=='number'||!Number.isFinite(x[k])||x[k]<0||x[k]>7200)throw Error('时间字段无效。');for(const k of ['acoustic','available','objection','sensorFault','reserved'])if(typeof x[k]!=='boolean')throw Error('约束字段应为true或false。');invalidate();$('zone').value=x.zone;$('people').value=x.people;$('confidence').value=x.confidence;$('duration').value=x.durationSec;$('vacancy').value=x.vacancySec;for(const k of ['acoustic','available','objection','sensorFault','reserved'])$(k).checked=x[k];$('importMessage').textContent='区域统计已导入，按模拟输入处理。';log('JSON导入','已校验字段，不含身份信息');safeAbort(x);render();evaluate();}catch(e){$('importMessage').textContent='导入失败：'+e.message;}}
document.querySelectorAll('#scenarios [data-s]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.s)));document.querySelectorAll('[data-zone]').forEach(g=>{const select=()=>{$('zone').value=g.dataset.zone;invalidate();render();message('选区已变更','重新生成建议检查区域约束。');};g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});});
['zone','people','confidence','duration','vacancy','acoustic','available','objection','sensorFault','reserved'].forEach(id=>$(id).addEventListener('input',()=>{invalidate();try{safeAbort(read());}catch(e){}if(states.B==='待馆员确认')states.B='常态阅读';message('输入已变更','需要重新生成建议；旧批准已失效。');render();}));
$('topic').addEventListener('input',()=>{if(joined){clearSession(false);$('session').textContent='主题已变更，请重新选择加入会话。';}});$('consent').addEventListener('change',()=>{if(!$('consent').checked)clearSession(false);});
$('evaluate').onclick=evaluate;$('approve').onclick=approve;$('reject').onclick=()=>{states.B='常态阅读';invalidate();message('馆员拒绝建议','保持现有空间用途。');log('建议拒绝','未执行转换');render();};$('advance').onclick=advance;$('join').onclick=join;$('leave').onclick=()=>{clearSession();log('会话结束','主题和资源状态已清除，空间状态保留');};$('export').onclick=download;$('fileInput').onchange=e=>importData(e.target.files[0]);$('reset').onclick=()=>{events=[];clockSeconds=9*3600;preset('normal');log('演示初始化','本地规则引擎，全部区域输入为仿真');};$('about').onclick=()=>$('scope').showModal();$('closeScope').onclick=()=>$('scope').close();preset('normal');log('演示初始化','本地规则引擎，未启用摄像头或AI模型');
