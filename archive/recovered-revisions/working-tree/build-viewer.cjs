const fs=require('fs'),path=require('path');
const esbuild=require('../model3d_deps/node_modules/esbuild');
const result=esbuild.buildSync({entryPoints:[path.resolve('work/model3d/scene.js')],bundle:true,format:'iife',platform:'browser',target:'es2020',minify:true,write:false,legalComments:'inline'});
let template=fs.readFileSync('work/model3d/viewer-template.html','utf8');
const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
template=template.replace('/*__BUNDLE__*/',()=>js);
const out='outputs/06_三维空间设计/三维空间交互展示.html';fs.writeFileSync(out,template);
console.log(JSON.stringify({file:out,bytes:Buffer.byteLength(template)}));
