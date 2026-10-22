// 只在读者点击“历史版本”后载入旧版录屏；平时不下载或播放视频。
export function initModelHistory(doc=globalThis.document){
 const trigger=doc.getElementById('historyOpen'),dialog=doc.getElementById('historyDialog'),video=doc.getElementById('historyVideo'),close=doc.getElementById('historyClose'),status=doc.getElementById('historyVideoStatus');
 if(!trigger||!dialog||!video||!close)return {isOpen:()=>false};
 trigger.addEventListener('click',()=>{
  if(dialog.open)return;
  dialog.showModal();trigger.setAttribute('aria-expanded','true');
  if(!video.getAttribute('src')){video.setAttribute('src',video.dataset.src);video.load();}
  status.textContent='早期三维原型录屏 · 用于展示模型逐步完善的过程。';
  // 打开由用户点击触发；若浏览器阻止自动起播，原生播放按钮仍可使用。
  const request=video.play();if(request?.catch)request.catch(()=>{if(dialog.open)status.textContent='点击视频中的播放按钮，即可查看早期三维原型。';});
 });
 const pause=()=>{video.pause();trigger.setAttribute('aria-expanded','false');};
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('cancel',pause);
 dialog.addEventListener('close',()=>{pause();trigger.focus({preventScroll:true});});
 // 点弹窗外的暗色遮罩也能关闭；点视频本身不会关闭。
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
 });
 video.addEventListener('error',()=>{status.textContent='视频暂未载入。请完整解压本人包，确认“Demo/历史版本”内的视频文件一并保留。';});
 return {isOpen:()=>dialog.open===true};
}
