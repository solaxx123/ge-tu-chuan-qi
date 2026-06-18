// 自动化验证脚本 - 每次构建后运行
const fs = require('fs');
const html = fs.readFileSync('d:/桌面/咸鱼小游戏项目/index.html', 'utf-8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];

let ok = 0, fail = 0;
function check(name, condition) {
    if (condition) { ok++; } else { fail++; console.log('  ❌ ' + name); }
}

console.log('🔍 鸽兔传奇 验证中...\n');

// 结构完整性
check('HTML闭合', (html.match(/<div/g)||[]).length === (html.match(/<\/div>/g)||[]).length);
check('JS语法', (() => { try { new Function(js); return true; } catch(e) { console.log('    ' + e.message); return false; } })());

// 关键函数存在
['startGame','goPage','showPage','triggerTear','victoryCountdown','unlockAchievement','renderAchievements','checkAllCleared'].forEach(f => {
    check('函数: ' + f, js.includes('function ' + f));
});

// 页面完整性
['page0','page1','page2','page3','page4','page5','page6','page7','page8','pageGame','pageRabbitGame','pageTrueEnding','pageVictory','pageTear','pageTwist','pageTruePoster','pageTrueCredits'].forEach(p => {
    check('页面: ' + p, html.includes('id="' + p + '"'));
});

// 交互元素
check('开始冒险按钮', html.includes('onclick="startGame()"'));
check('击败魔龙按钮', html.includes('victoryReadyBtn'));
check('重置进度按钮', html.includes('resetAllBtn'));
check('_triggerVictory全局函数', js.includes('window._triggerVictory'));
check('resetBtn onclick', js.includes("resetBtn.onclick"));

// 成就系统
check('ACHIEVEMENTS 10个', (js.match(/{ id:/g)||[]).length === 11); // 10 visible + 1 hidden
check('钻石跨局累计', !js.includes('diamondCount = 0'));

// 特殊功能
check('彩蛋动态描述', js.includes('displayDesc'));
check('彩蛋全屏爱心', js.includes('彩蛋已解锁'));

console.log('\n' + ok + '/' + (ok+fail) + ' 通过');
process.exit(fail > 0 ? 1 : 0);
