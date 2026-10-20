// 纯导览状态检查；不打开浏览器或执行网页脚本。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MODEL_TOUR_STOPS,nextTourStop,tourIndex,canvasClickIntent} from '../model-tour.js';
const expected=[['campus',0,false],['rear',0,false],['cut',0,false],['cut',0,true],...[1,2,3,4,5].map(f=>['top',f,false])];
assert.deepEqual(MODEL_TOUR_STOPS.map(s=>[s.view,s.floor,s.expanded]),expected);
let state=MODEL_TOUR_STOPS[0],checks=0;
for(const [view,floor,expanded] of expected.slice(1)){
 assert.equal(canvasClickIntent({hitsModel:false}),'advance');
 state=nextTourStop(state);assert.deepEqual([state.view,state.floor,state.expanded],[view,floor,expanded]);checks++;
}
assert.equal(nextTourStop(state),null);
assert.notEqual(tourIndex({view:'cut',floor:0,expanded:false}),tourIndex({view:'cut',floor:0,expanded:true}));
assert.equal(nextTourStop({view:'cut',floor:0,expanded:true}).view,'top');
assert.equal(nextTourStop({view:'cut',floor:0,expanded:true}).floor,1);
const model=fs.readFileSync(new URL('../model.js',import.meta.url),'utf8');
assert.ok(model.includes("if(id==='cut'||id==='campus'||id==='rear'){floor=0;expanded=false;}"));
assert.ok(model.includes("if(id==='top'){if(!floor)floor=1;expanded=false;}"));
const receipt={transitions_checked:checks,sequence:MODEL_TOUR_STOPS.map(s=>s.title),whole_and_exploded_separate:true,first_plan_floor:1,plans_through_floor:5,scope:'纯状态和入口接线检查，未进行浏览器或WebGL实测'};
fs.writeFileSync(new URL('./tour-sequence-check.json',import.meta.url),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));
