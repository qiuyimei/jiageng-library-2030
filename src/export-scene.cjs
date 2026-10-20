// 在Node中构建几何导出器；需要先npm install。输出文件与脚本放在同目录。
const path=require('node:path'),esbuild=require('esbuild'),cp=require('node:child_process');
const bundle=path.join(__dirname,'scene-export.bundle.cjs');
esbuild.buildSync({entryPoints:[path.join(__dirname,'scene-export.js')],bundle:true,platform:'node',format:'cjs',outfile:bundle,nodePaths:process.env.NODE_PATH?process.env.NODE_PATH.split(path.delimiter):[]});
const out=process.argv[2]||__dirname,result=cp.spawnSync(process.execPath,[bundle,out],{stdio:'inherit'});
if(result.error)throw result.error;process.exit(result.status??1);
