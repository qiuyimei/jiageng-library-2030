// 纯规则与独立控制器测试，不启动浏览器或WebGL。
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=['tests.js','spatial-tests.js','walk-tests.js','seat-status-tests.js','tests/seat-demand.mjs','tests/check-navigation.mjs','tests/check-tour-sequence.mjs','tests/check-history.mjs'];
for(const file of files){
 const result=spawnSync(process.execPath,[path.join(root,file)],{cwd:root,stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status||1);
}
console.log('Core checks passed. Browser, WebGL and real-site acceptance remain separate.');
