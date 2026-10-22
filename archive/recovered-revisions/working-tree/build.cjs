/* 本人零基础学习副本：仅排版和解释，原有业务逻辑不变。
 * 全套架构、实例和修改方法请读文档及源码导航。
 */
/* 学习注释：建立 fs、path、esbuild。fs：Node 的文件系统模块。path：Node 的跨平台路径模块。esbuild：制作网页的打包工具。 */
const fs = require('fs'),
  path = require('path'),
  esbuild = require('esbuild');
/* 学习注释：建立 built。built：esbuild 打包结果。 */
const built = esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'scene.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  write: false,
  legalComments: 'inline',
});
/* 学习注释：建立 js。js：可嵌入 HTML 的构建脚本字符串。 */
const js = built.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
/* 学习注释：建立 html。html：替换脚本标记后的页面字符串。 */
const html = fs
  .readFileSync(path.join(__dirname, 'viewer-template.html'), 'utf8')
  .replace('/*__BUNDLE__*/', () => js);
/* 学习注释：建立 file。 */
const file = path.resolve(__dirname, '..', '三维空间交互展示.html');
/* 学习注释：执行这一句操作：fs.writeFileSync(file, html);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
fs.writeFileSync(file, html);
/* 学习注释：执行这一句操作：console.log(file);。注意括号里的参数和左侧对象；回调只在所属事件/循环被调用时运行。 */
console.log(file);
