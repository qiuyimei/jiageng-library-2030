// 从模块源码生成一个可以双击运行的HTML。依赖只在制作时使用。
const fs=require('fs'),path=require('path'),esbuild=require('esbuild');
const result=esbuild.buildSync({entryPoints:[path.join(__dirname,'scene.js')],nodePaths:process.env.NODE_PATH?process.env.NODE_PATH.split(path.delimiter):[],bundle:true,format:'iife',platform:'browser',target:'es2020',minify:true,write:false,legalComments:'inline'});
const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html=fs.readFileSync(path.join(__dirname,'viewer-template.html'),'utf8').replace('/*__BUNDLE__*/',()=>js);
fs.writeFileSync(path.join(__dirname,'..','嘉庚静读导航.html'),html,'utf8');
console.log('生成完成：嘉庚静读导航.html');
