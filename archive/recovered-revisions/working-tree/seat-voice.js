// 语音转写与选座条件提取分开：录音不是预约，提取结果必须先由读者确认。
export function parseSeatDemand(input){
 const text=String(input||'').trim().slice(0,500),s=text.replace(/\s+/g,'');
 const patch={},notes=[],topics=[];
 const negative=/(?:不需要|不想要|不想|不要|不用|无需|不必|不看|不选|不靠|不在|不喜欢|不考虑|不)$/;
 // 逐个词检查前面的否定语，避免把“不靠窗”错误当成临窗偏好。
 const mentioned=words=>words.flatMap(word=>{const out=[];let at=s.indexOf(word);while(at>=0){out.push({word,at,no:negative.test(s.slice(Math.max(0,at-6),at))});at=s.indexOf(word,at+word.length);}return out;});
 const flag=(name,words)=>{const hits=mentioned(words);if(hits.length){const yes=hits.some(h=>!h.no),no=hits.some(h=>h.no);if(yes&&no)notes.push('对'+name+'同时表达了需要和不需要，请手动确认。');else return yes;}return undefined;};
 for(const [key,words] of [['own',['自带资料','不限主题','无所谓主题']],['literature',['文学','小说','散文','诗歌','语言资料']],['economy',['经济','金融','会计','管理学','社科']],['technology',['计算机','软件','编程','工程','技术资料']],['periodicals',['报刊','期刊','杂志','外文书']]])
  if(mentioned(words).some(h=>!h.no))topics.push(key);
 if(topics.length===1)patch.subject=topics[0];else if(topics.length>1)notes.push('提到了多个馆藏主题，请从表单选择一个。');
 const window=flag('临窗',['靠窗','临窗','窗边']);if(window!==undefined)patch.window=window;
 const print=flag('打印',['打印','复印']);if(print!==undefined)patch.print=print;
 const power=flag('电源',['电源','插座','充电']);
 if(power!==undefined){if(power&&/(最好|尽量|优先|希望).{0,5}(电源|插座|充电)/.test(s))notes.push('你把电源说成偏好；当前电源选项是必须条件，请自行确认是否勾选。');else patch.power=power;}
 const all=/(不限楼层|哪层都行|哪个楼层都行|全馆|所有楼层|比较五层|全部楼层)/.test(s);
 if(all)patch.range='all';else{
  const nums={一:1,二:2,三:3,四:4,五:5},found=[...s.matchAll(/([一二三四五1-5])(?:楼|层)|([1-5])[fF]/g)].map(m=>nums[m[1]]||Number(m[1]||m[2]));
  const floors=[...new Set(found)];if(floors.length===1){patch.floor=floors[0];patch.range='current';}else if(floors.length>1)notes.push('提到了多个楼层，请手动选择比较范围。');
 }
 if(/安静|静音|不吵/.test(s))notes.push('已读到安静意向；当前没有实时噪声数据，不保证环境声量。');
 if(/[北南东]区/.test(s))notes.push('分区方位可在座位图筛选核对，目前不作为推荐必须条件。');
 if(/相邻|连座|一起坐|轮椅|无障碍/.test(s))notes.push('相邻或无障碍等条件尚未实现，不能由当前推荐保证。');
 if(!Object.keys(patch).length)notes.push('未提取到可直接使用的条件，请补充主题、临窗、打印、电源或楼层。');
 return {text,patch,notes};
}

// Web Audio解码录音，再按时间采样为本机识别器需要的16kHz单声道WAV。
export async function recordingToWav(blob){
 const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)throw new Error('浏览器不能解码录音，请输入文字。');
 const context=new AC();
 try{
  const audio=await context.decodeAudioData(await blob.arrayBuffer());if(audio.duration>30.5)throw new Error('录音超过30秒，请说短一点。');
  const rate=16000,n=Math.floor(audio.duration*rate),buffer=new ArrayBuffer(44+n*2),v=new DataView(buffer);
  const str=(p,s)=>{for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i));};
  str(0,'RIFF');v.setUint32(4,36+n*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*2,true);
  const channels=Array.from({length:audio.numberOfChannels},(_,i)=>audio.getChannelData(i));
  for(let i=0;i<n;i++){const pos=i*audio.sampleRate/rate,a=Math.floor(pos),b=Math.min(a+1,audio.length-1),f=pos-a;let value=0;for(const c of channels)value+=(c[a]||0)*(1-f)+(c[b]||0)*f;value=Math.max(-1,Math.min(1,value/channels.length));v.setInt16(44+i*2,value<0?value*32768:value*32767,true);}
  return new Blob([buffer],{type:'audio/wav'});
 }finally{await context.close();}
}

export function initSeatVoice({get,onConfirm,getCurrent}){
 let pending=null,speech=null,recorder=null,stream=null,timer=null,busy=false,session=0,localToken=null;
 const status=text=>get('voiceStatus').textContent=text;
 const listening=value=>{busy=value;get('voiceStart').disabled=value;get('voiceStop').disabled=!value;get('voiceStart').setAttribute('aria-pressed',String(value));};
 const release=()=>{clearTimeout(timer);if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}};
 const invalidate=()=>{pending=null;get('voiceApply').disabled=true;get('voicePreview').replaceChildren();};
 function preview(){
  pending=parseSeatDemand(get('voiceText').value);const out=get('voicePreview');out.replaceChildren();
  const labels={subject:{own:'自带资料／不限主题',literature:'文学与语言',economy:'经济与社科',technology:'计算机与工程',periodicals:'报刊与外文书'}};
  const p=pending.patch,current=getCurrent();
  const values=[p.subject!==undefined?'主题：'+labels.subject[p.subject]:null,p.floor?'楼层：'+p.floor+'F':null,p.range?'范围：'+(p.range==='all'?'比较五层':'指定／当前层'):null,...[['window','临窗偏好'],['power','仅带电源'],['print','顺路打印']].map(([k,title])=>p[k]===undefined?null:title+'：'+(p[k]?'是':'否'))].filter(Boolean);
  for(const value of values){const e=document.createElement('span');e.textContent=value;e.className='voice-chip';out.append(e);}
  for(const note of pending.notes){const e=document.createElement('p');e.textContent=note;e.className='small';out.append(e);}
  const kept=[];if(p.window===undefined&&current.window)kept.push('临窗偏好');if(p.power===undefined&&current.power)kept.push('仅带电源');if(p.print===undefined&&current.print)kept.push('顺路打印');
  if(kept.length){const e=document.createElement('p');e.textContent='沿用表单：'+kept.join('、')+'。未提到的其他条件保持原值。';e.className='small';out.append(e);}
  get('voiceApply').disabled=!values.length;status(values.length?'请检查文字与条件，确认后再推荐。':'请补充或修改文字，也可直接使用下方表单。');
 }
 async function localReady(){
  if(!['127.0.0.1','localhost'].includes(globalThis.location?.hostname))return false;
  try{const r=await fetch('/api/health');const data=await r.json();if(data.service!=='jiageng-local-voice'||!data.ready)return false;localToken=data.token;get('stopLocalVoice').hidden=false;return true;}catch{return false;}
 }
 async function startLocal(){
  if(!navigator.mediaDevices?.getUserMedia||!globalThis.MediaRecorder)throw new Error('当前浏览器不支持录音，请输入文字。');
  const thisSession=session,acquired=await navigator.mediaDevices.getUserMedia({audio:true});
  if(thisSession!==session){acquired.getTracks().forEach(t=>t.stop());return;}
  stream=acquired;
  const chunks=[],activeRecorder=new MediaRecorder(stream);recorder=activeRecorder;
  activeRecorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  activeRecorder.onerror=()=>{acquired.getTracks().forEach(t=>t.stop());if(thisSession===session){release();listening(false);status('录音失败，请重试或输入文字。');}};
  activeRecorder.onstop=async()=>{
   const mime=activeRecorder.mimeType;acquired.getTracks().forEach(t=>t.stop());if(thisSession!==session)return;
   recorder=null;release();
   get('voiceStop').disabled=true;status('正在本机识别，请稍候……');
   try{const wav=await recordingToWav(new Blob(chunks,{type:mime}));const response=await fetch('/api/transcribe',{method:'POST',headers:{'Content-Type':'audio/wav','X-Local-Token':localToken},body:wav});const data=await response.json();if(!response.ok)throw new Error(data.error||'识别失败');if(thisSession!==session)return;get('voiceText').value=data.text||'';if(data.text)preview();else status('没有识别到清晰文字，请重录或输入需求。');}
   catch(error){if(thisSession===session)status(error.message||'本机识别失败，可输入文字。');}finally{if(thisSession===session)listening(false);}
  };
  activeRecorder.start();status('正在本机录音，最多30秒。说完请点“结束录音”；不会上传或保存录音。');timer=setTimeout(()=>{if(activeRecorder.state==='recording')activeRecorder.stop();},29000);
 }
 function startBrowser(){
  const SR=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;
  if(!SR){listening(false);status('当前浏览器没有语音识别接口。可输入文字，或展开下方的本地离线语音入口。');get('localVoiceHelp').open=true;return;}
  speech=new SR();const thisSession=session;speech.lang='zh-CN';speech.continuous=false;speech.interimResults=true;
  speech.onstart=()=>status('正在识别，请说出选座需求。此模式可能使用浏览器的在线语音服务。');
  speech.onresult=e=>{if(thisSession!==session)return;let text='';for(let n=0;n<e.results.length;n++)text+=e.results[n][0].transcript;get('voiceText').value=text;if(Array.from(e.results).some(r=>r.isFinal))preview();};
  speech.onerror=e=>{if(thisSession!==session)return;const messages={'not-allowed':'麦克风权限未开启，可允许麦克风后重试，或输入文字。','audio-capture':'没有找到可用麦克风，请检查设备。','no-speech':'没有听到清晰语音，请重试。',network:'浏览器语音服务连接失败，可使用本地离线入口或输入文字。','service-not-allowed':'浏览器未开放语音服务，可使用本地离线入口。'};status(messages[e.error]||'语音识别暂不可用，请重试或输入文字。');listening(false);clearTimeout(timer);};
  speech.onend=()=>{if(thisSession!==session)return;speech=null;clearTimeout(timer);listening(false);if(!pending&&get('voiceText').value.trim())preview();};
  speech.start();timer=setTimeout(()=>speech?.stop(),29000);
 }
 get('voiceStart').onclick=async()=>{if(busy)return;const ticket=++session;invalidate();get('voiceText').value='';listening(true);status('正在准备麦克风……');try{const local=await localReady();if(ticket!==session)return;if(local)await startLocal();else startBrowser();}catch(e){if(ticket!==session)return;release();listening(false);status(e.name==='NotAllowedError'?'麦克风权限未开启，可允许麦克风后重试或输入文字。':e.message||'无法开始识别，请检查麦克风或输入文字。');}};
 get('voiceStop').onclick=()=>{if(recorder?.state==='recording')recorder.stop();else speech?.stop();};
 get('voiceParse').onclick=preview;
 get('voiceText').oninput=()=>{invalidate();status('文字已修改，请重新解析并确认。');};
 get('voiceApply').onclick=()=>{if(!pending||get('voiceApply').disabled)return;const parsed=pending;if(busy)cancel();invalidate();onConfirm(parsed.patch);status('已按确认的条件生成推荐；它不是预约或锁座。');};
 get('stopLocalVoice').onclick=async()=>{if(busy)return;try{await fetch('/api/stop',{method:'POST',headers:{'X-Local-Token':localToken}});get('stopLocalVoice').hidden=true;status('本地语音服务已结束。页面仍可用文字选座，刷新前请重新启动服务。');}catch{status('本地服务已断开。');}};
 // 切走页面立即释放麦克风，防止忘记结束录音；不自动恢复录音。
 const cancel=()=>{session++;clearTimeout(timer);speech?.abort();speech=null;if(recorder?.state==='recording')recorder.stop();release();listening(false);};
 document.addEventListener?.('visibilitychange',()=>{if(document.hidden&&busy){cancel();status('已停止录音，返回后可重新开始。');}});globalThis.addEventListener?.('pagehide',cancel);
 if(['127.0.0.1','localhost'].includes(globalThis.location?.hostname))localReady();
 invalidate();listening(false);
 return {invalidate};
}
