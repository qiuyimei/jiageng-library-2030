// 这里只控制观看方式，不改变真实楼层高度、书架位置和座位编号。
// 展开时拉开楼层，让下层桌椅不再紧贴上层楼板。
export const EXPLODED_FLOOR_GAP=18;
export function renderScale(width,height,deviceScale=1,quality='hd'){
 // 高清在普通屏幕也做超采样；限制总像素，防止大屏长期占满显卡。
 const wanted=quality==='flow'?1:Math.min(2,Math.max(1.5,deviceScale||1));
 const limit=Math.sqrt(6000000/Math.max(1,width*height));
 return Math.min(wanted,limit);
}
export function explodedPose(bounds,aspect,fov=38){
 const center=[(bounds.left+bounds.right)/2,38,(bounds.back+bounds.front)/2];
 const direction=[.9,.68,1.2],length=Math.hypot(...direction),d=direction.map(v=>v/length);
 const right=[d[2],0,-d[0]],rl=Math.hypot(...right);for(let i=0;i<3;i++)right[i]/=rl;
 const up=[d[1]*right[2]-d[2]*right[1],d[2]*right[0]-d[0]*right[2],d[0]*right[1]-d[1]*right[0]];
 // direction×right得到相机的竖直方向，按相机坐标逐角点计算留白。
 const tv=Math.tan(fov*Math.PI/360),th=tv*Math.max(.35,aspect),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 let distance=0;
 for(const x of [bounds.left,bounds.right])for(const y of [-.2,EXPLODED_FLOOR_GAP*4+4.8])for(const z of [bounds.back,bounds.front]){
  const v=[x-center[0],y-center[1],z-center[2]];
  distance=Math.max(distance,Math.abs(dot(v,right))/th+dot(v,d),Math.abs(dot(v,up))/tv+dot(v,d));
 }
 distance*=1.09;
 return {eye:center.map((v,i)=>v+d[i]*distance),target:center};
}
