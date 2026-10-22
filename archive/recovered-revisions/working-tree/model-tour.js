// 三维展示的顺序独立于选座规则；下一步仅改变相机与可见楼层，不改变座位登记。
export const MODEL_TOUR_STOPS=[
 {view:'campus',floor:0,expanded:false,title:'校园楼群正面'},
 {view:'rear',floor:0,expanded:false,title:'图书馆外观'},
 {view:'cut',floor:0,expanded:true,title:'空间模型 · 分层展开'},
 ...[1,2,3,4,5].map(floor=>({view:'cut',floor,expanded:false,title:floor+'楼'}))
];
export function tourIndex(state){return MODEL_TOUR_STOPS.findIndex(s=>s.view===state.view&&s.floor===state.floor&&(s.floor!==0||s.expanded===state.expanded));}
export function nextTourStop(state){const index=tourIndex(state);return index>=0?MODEL_TOUR_STOPS[index+1]||null:null;}
export function usesPointPicking({view,linked,walking,distance,overviewDistance}){
 return linked||walking||view==='top'||distance<overviewDistance*.98;
}
