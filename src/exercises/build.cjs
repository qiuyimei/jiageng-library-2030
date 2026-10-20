// 将入门模块打包成不依赖网络的单个练习页面。
const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const output=process.argv[2]||path.join(__dirname,'../dist/十座位复刻练习.html');
const result=esbuild.buildSync({entryPoints:[path.join(__dirname,'main.js')],bundle:true,format:'iife',platform:'browser',target:'es2020',write:false});
const code=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html=fs.readFileSync(path.join(__dirname,'template.html'),'utf8').replace('/*__EXERCISE__*/',()=>code);
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,html,'utf8');console.log('BUILT '+output);
