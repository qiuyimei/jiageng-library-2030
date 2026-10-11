/* 中文学习注释副本  原始项目请见01目录
Node构建脚本。将scene依赖打包后插入viewer-template，输出源码上一级HTML，不生成GLB与视频。
*/
const fs=require('fs'),path=require('path'),esbuild=require('esbuild');
const built=esbuild.buildSync({entryPoints:[path.join(__dirname,'scene.js')],bundle:true,format:'iife',platform:'browser',target:'es2020',minify:true,write:false,legalComments:'inline'});
const js=built.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html=fs.readFileSync(path.join(__dirname,'viewer-template.html'),'utf8').replace('/*__BUNDLE__*/',()=>js);
const file=path.resolve(__dirname,'..','三维空间交互展示.html');fs.writeFileSync(file,html);console.log(file);
