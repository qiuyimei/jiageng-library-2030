/* 中文学习注释副本  原始项目请见01目录
从旧播放器抽出的同步逻辑。原HTML内嵌视频未在导航页重复打印，原样项目里仍保留完整文件。
*/

const v=document.getElementById('video'),a=new Audio(),file=document.getElementById('file'),status=document.getElementById('status');let objectUrl=null,hasRecording=false;
const chapters=[{"title": "项目在解决什么问题", "start": 0}, {"title": "先看懂四个区域", "start": 21.72222222222222}, {"title": "当前原型已经实现什么", "start": 42.911111111111104}, {"title": "正常研讨：先看模拟输入", "start": 65.87777777777777}, {"title": "为什么先生成建议", "start": 84.2222222222222}, {"title": "馆员确认后发生什么变化", "start": 106.83333333333331}, {"title": "为什么要让读者自愿加入", "start": 124.7333333333333}, {"title": "资源推荐的内容与来源", "start": 146.54444444444442}, {"title": "静音区为什么始终保护", "start": 170.48888888888885}, {"title": "判断不够可靠时怎么办", "start": 188.38888888888886}, {"title": "邻区有人提出异议时怎么办", "start": 206.28888888888886}, {"title": "为什么不能覆盖已有预约", "start": 221.3444444444444}, {"title": "感知故障时怎样处理", "start": 233.55555555555551}, {"title": "研讨结束后为何不立即恢复", "start": 247.01111111111106}, {"title": "恢复阅读用途与冷却时间", "start": 264.64444444444445}, {"title": "怎样核对一次操作是否发生", "start": 283.1666666666667}, {"title": "用一句话说明原型的价值", "start": 304.62222222222226}];
const time=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
for(const c of chapters){const b=document.createElement('button');b.textContent=time(c.start)+' '+c.title;b.onclick=()=>{v.currentTime=c.start;sync(true)};document.getElementById('chapters').append(b);}

/* sync
职责：同步本机录音与视频
输入：force、hasRecording与video/audio时刻
结果：偏差超过0.25秒或强制时跳转音频，同步音量静音
注意：到录音末尾暂停音频，不能补齐缺少的旁白。 */
function sync(force=false){if(!hasRecording||!Number.isFinite(a.duration))return;if(v.currentTime>=a.duration){a.pause();status.textContent='已到录音末尾；视频可继续查看。';return;}if(force||Math.abs(a.currentTime-v.currentTime)>.25)a.currentTime=v.currentTime;a.volume=v.volume;a.muted=v.muted;}

/* start
职责：由用户操作启动预览
输入：视频和已加载录音状态
结果：解静音设置音量、播放视频和可用录音
注意：play返回Promise可能被浏览器拒绝；调用方捕获错误。 */
async function start(){v.muted=false;v.volume=1;sync(true);await v.play();if(hasRecording&&v.currentTime<a.duration){await a.play();status.textContent='正在同步预览你选择的录音。';}}
document.getElementById('play').onclick=async()=>{try{if(v.paused)await start();else {v.pause();a.pause();}}catch(e){status.textContent='播放未启动：'+e.message;}};
document.getElementById('restart').onclick=async()=>{v.currentTime=0;sync(true);try{await start();}catch(e){status.textContent='播放未启动：'+e.message;}};

/* resumeRecording
职责：视频继续后恢复录音
输入：hasRecording、视频未暂停、录音未结束
结果：尝试audio.play并在失败时提示
注意：同步预览仍不是编码合成；新MP4须剪辑导出。 */
function resumeRecording(){if(hasRecording&&!v.paused&&v.currentTime<a.duration)a.play().catch(e=>{status.textContent='录音未启动，请点击从头播放：'+e.message;});}
v.addEventListener('pause',()=>a.pause());v.addEventListener('ended',()=>a.pause());v.addEventListener('seeked',()=>{sync(true);resumeRecording();});v.addEventListener('volumechange',()=>sync());v.addEventListener('timeupdate',()=>sync());v.addEventListener('play',()=>{sync(true);resumeRecording();});
file.onchange=()=>{const f=file.files[0];if(!f)return;v.pause();hasRecording=false;a.pause();if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(f);a.src=objectUrl;a.load();document.getElementById('recordName').textContent='本机录音：'+f.name;status.textContent='正在载入你的录音…';};
a.addEventListener('loadedmetadata',()=>{hasRecording=true;status.textContent='录音已载入（'+time(a.duration)+'），点击从头播放即可同步预览。';sync(true);});a.addEventListener('error',()=>{hasRecording=false;status.textContent='这个录音格式无法播放，请使用WAV、MP3或M4A。';});
window.recordingPreview={getState:()=>({recording:hasRecording,videoTime:v.currentTime,audioTime:a.currentTime,videoPaused:v.paused,audioPaused:a.paused,muted:a.muted,volume:a.volume,recordingDuration:a.duration})};
