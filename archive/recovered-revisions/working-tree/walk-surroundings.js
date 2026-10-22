// 第一视角的室外背景。沿用已有馆舍环境的湖面、铺装与绿化语汇，非新增实测景点。
export function createWalkSurroundings(parent,H){
 const {group,box,plant}=H,g=group(parent,'walk_window_surroundings');g.visible=false;
 box(g,'walk_distant_ground',340,.15,340,0,-.9,0,'#93a38a');
 box(g,'walk_outside_paving',91,.08,18,0,-.77,45,'#c6c1ad');
 box(g,'walk_lake_view',100,.06,46,0,-.74,83,'#729e9a',{roughness:.35,metalness:.25});
 for(const side of [-1,1])for(const z of [-70,-47,-24,0,24,48])plant(g,side*47,z,3.7);
 for(const x of [-37,-17,17,37])plant(g,x,113,4.5);
 g.userData={mode:'walk only',source:'same library landscape vocabulary',surveyed:false};return g;
}
