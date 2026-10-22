// 独立控制器单元检查，不加载页面、浏览器或WebGL。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initModelHistory} from '../model-history.js';
class Control{
 constructor(){this.events={};this.attrs={};this.dataset={};this.open=false;this.loads=0;this.plays=0;this.pauses=0;this.focuses=0;}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
 fire(name,event={}){for(const fn of this.events[name]||[])fn(event);}
 setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]||null;}
 showModal(){this.open=true;}close(){this.open=false;this.fire('close');}
 load(){this.loads++;}play(){this.plays++;return Promise.resolve();}pause(){this.pauses++;}focus(){this.focuses++;}
 getBoundingClientRect(){return {left:100,right:660,top:100,bottom:530};}
}
const ids=Object.fromEntries(['historyOpen','historyDialog','historyVideo','historyClose','historyVideoStatus'].map(k=>[k,new Control()]));ids.historyVideo.dataset.src='历史版本/三维早期原型记录.mp4';
const state=initModelHistory({getElementById:k=>ids[k]});let cases=0;const test=(name,fn)=>{fn();cases++;console.log('PASS '+name);};
test('初始不载入、不播放、不打开弹窗',()=>{assert.equal(ids.historyVideo.loads,0);assert.equal(ids.historyVideo.plays,0);assert.equal(state.isOpen(),false);});
test('点击小字后才载入并播放',()=>{ids.historyOpen.fire('click');assert.equal(state.isOpen(),true);assert.equal(ids.historyVideo.loads,1);assert.equal(ids.historyVideo.plays,1);assert.equal(ids.historyOpen.attrs['aria-expanded'],'true');});
test('点击视频区域不关闭弹窗',()=>{ids.historyDialog.fire('click',{target:ids.historyVideo,clientX:200,clientY:200});assert.equal(state.isOpen(),true);});
test('关闭按钮会暂停视频并恢复入口焦点',()=>{ids.historyClose.fire('click');assert.equal(state.isOpen(),false);assert.equal(ids.historyVideo.pauses,1);assert.equal(ids.historyOpen.attrs['aria-expanded'],'false');assert.equal(ids.historyOpen.focuses,1);});
test('再次打开不重新载入原片',()=>{ids.historyOpen.fire('click');assert.equal(ids.historyVideo.loads,1);assert.equal(ids.historyVideo.plays,2);});
test('Esc取消事件先暂停视频',()=>{const p=ids.historyVideo.pauses;ids.historyDialog.fire('cancel');assert.equal(ids.historyVideo.pauses,p+1);ids.historyDialog.close();});
test('点击弹窗外遮罩关闭并暂停',()=>{ids.historyOpen.fire('click');ids.historyDialog.fire('click',{target:ids.historyDialog,clientX:10,clientY:10});assert.equal(state.isOpen(),false);});
test('缺失素材时有明确提示',()=>{ids.historyVideo.fire('error');assert.match(ids.historyVideoStatus.textContent,/完整解压/);});
const html=fs.readFileSync(new URL('../model-template.html',import.meta.url),'utf8'),model=fs.readFileSync(new URL('../model.js',import.meta.url),'utf8');
const toolbar=html.match(/<div class="viewer-toolbar">([\s\S]*?)<\/div>/)[1];assert.equal([...toolbar.matchAll(/<button/g)].length,6);assert.ok(!toolbar.includes('historyOpen'));
assert.ok(html.includes('preload="none" data-src="历史版本/'));assert.ok(model.includes('if(historyPlayer.isOpen()){held.clear();lookDrag=null;requestAnimationFrame(animate);return;}'));
const receipt={controller_cases:cases,lazy_video:true,close_pauses:true,six_main_buttons_unchanged:true,render_paused_while_dialog_open:true,scope:'独立控制器和模板静态检查，未进行浏览器弹窗实测'};
fs.writeFileSync(new URL('./history-ui-check.json',import.meta.url),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));
