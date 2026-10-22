// build是制作步骤；生成的HTML已含脚本，读者运行Demo不需要Node。
const fs=require('fs'),path=require('path'),esbuild=require('esbuild');
const dest=process.argv[2]||path.join(__dirname,'dist');fs.mkdirSync(dest,{recursive:true});
for(const [entry,template,file,marker]of [['app.js','template.html','嘉庚知座.html','/*__APP__*/'],['model.js','model-template.html','建筑与五层展示.html','/*__BUNDLE__*/']]){
 const result=esbuild.buildSync({entryPoints:[path.join(__dirname,entry)],nodePaths:process.env.NODE_PATH?process.env.NODE_PATH.split(path.delimiter):[],bundle:true,format:'iife',platform:'browser',target:'es2020',minify:false,write:false,legalComments:'inline'});
 const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
 const html=fs.readFileSync(path.join(__dirname,template),'utf8').replace(marker,()=>js);
 fs.writeFileSync(path.join(dest,file),html,'utf8');console.log('BUILT '+file);
}
