const path=require('node:path'),esbuild=require('esbuild'),cp=require('node:child_process');
const outfile=path.join(__dirname,'layout-walk-tests.bundle.cjs');
esbuild.buildSync({entryPoints:[path.join(__dirname,'layout-walk-tests.js')],nodePaths:(process.env.NODE_PATH||'').split(path.delimiter).filter(Boolean),bundle:true,platform:'node',format:'cjs',outfile});
process.exit(cp.spawnSync(process.execPath,[outfile],{cwd:__dirname,stdio:'inherit'}).status??1);
