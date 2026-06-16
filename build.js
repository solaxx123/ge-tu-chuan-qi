// 构建脚本：将源文件 + 图片合并为最终网页
const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const SRC = path.join(BASE, 'src');
const ASSETS = path.join(BASE, 'assets');
const OUT = path.join(BASE, 'index.html');

console.log('🔨 鸽兔传奇 · 构建中...\n');

// 1. 读取源文件
let css    = fs.readFileSync(path.join(SRC, 'style.css'), 'utf-8');
let html   = fs.readFileSync(path.join(SRC, 'index.html'), 'utf-8');
let js     = fs.readFileSync(path.join(SRC, 'game.js'), 'utf-8');

// 2. 读取图片并转 base64
const coverJpg  = fs.readFileSync(path.join(ASSETS, 'cover.jpg'));
const endingJpg = fs.readFileSync(path.join(ASSETS, 'ending.jpg'));
const coverB64  = coverJpg.toString('base64');
const endingB64 = endingJpg.toString('base64');

console.log(`  封面图片: ${(coverJpg.length/1024).toFixed(0)} KB → base64 ${(coverB64.length/1024).toFixed(0)} KB`);
console.log(`  结局图片: ${(endingJpg.length/1024).toFixed(0)} KB → base64 ${(endingB64.length/1024).toFixed(0)} KB`);

// 3. 替换占位符
css  = css.replace('{{COVER_IMAGE}}', `data:image/jpeg;base64,${coverB64}`);
html = html.replace('{{ENDING_IMAGE}}', `data:image/jpeg;base64,${endingB64}`);

// 4. 组装最终 HTML
// 把 <link rel="stylesheet" href="style.css"> 替换为 <style>...</style>
html = html.replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`);

// 把 <script src="game.js"></script> 替换为 <script>...</script>
html = html.replace('<script src="game.js"></script>', `<script>\n${js}\n</script>`);

// 5. 写入输出文件
fs.writeFileSync(OUT, html, 'utf-8');

const sizeKB = (html.length / 1024).toFixed(0);
console.log(`\n✅ 构建完成！`);
console.log(`   📄 index.html  (${sizeKB} KB)`);
console.log(`   📱 可直接用手机浏览器打开`);
console.log(`\n部署命令: npx vercel "${BASE}" --prod`);
