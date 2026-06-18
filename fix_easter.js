const fs=require('fs');
let js=fs.readFileSync('d:/桌面/咸鱼小游戏项目/src/game.js','utf-8');

// 1. Dynamic easter description based on progress
var oldLine = "const cls = unlocked ? 'unlocked' : 'locked';";
var newLine = "var displayDesc = ach.desc;\n                if (ach.id === 'easter' && !unlocked && unlockedCount >= 7) displayDesc = '点击标题试试';\n                const cls = unlocked ? 'unlocked' : 'locked';";
js=js.replace(oldLine, newLine);

// Replace ach.desc with displayDesc in the grid.innerHTML line
// The line looks like: grid.innerHTML += '... title="' + ach.desc + '"...';
var oldAchDesc1 = "title=\"' + ach.desc + '\"";
var newAchDesc1 = "title=\"' + displayDesc + '\"";
js=js.replace(oldAchDesc1, newAchDesc1);

var oldAchDesc2 = "' + ach.desc + '</div>'";
var newAchDesc2 = "' + displayDesc + '</div>'";
js=js.replace(oldAchDesc2, newAchDesc2);

console.log('1. Dynamic easter desc');

// 2. Progressive click feedback
var oldClickMsg = 'showFrustration("🔮 再点一次标题试试？")';
var newClickMsg = 'showFrustration("没有反应？再点一下试试")';
js=js.replace(oldClickMsg, newClickMsg);

var oldClickBlock = '} else if (headerClicks >= 2) {';
var newClickBlock = '} else if (headerClicks === 2) {\n                showFrustration("多点几下嘛~");\n                headerEl.style.transform = "scale(1.05)";\n                setTimeout(() => headerEl.style.transform = "scale(1)", 200);\n            } else if (headerClicks >= 3) {';
js=js.replace(oldClickBlock, newClickBlock);
console.log('2. Progressive clicks');

// 3. Big celebration on easter unlock
var oldMsg = "bigMsg.textContent = '💕 鸽兔永远在一起 💕';";
var newMsg = "bigMsg.textContent = '💕 彩蛋已解锁！鸽兔永远在一起 💕';\n                bigMsg.style.fontSize='1.4rem';\n                for(var _i=0;_i<25;_i++){setTimeout(function(){var hd=document.createElement('div');hd.textContent=['❤️','💕','💖','✨'][Math.floor(Math.random()*4)];hd.style.cssText='position:fixed;z-index:600;pointer-events:none;font-size:'+(20+Math.random()*30)+'px;left:'+Math.random()*95+'%;top:-30px;animation:heartRain '+(2+Math.random()*3)+'s ease-in forwards;';document.body.appendChild(hd);setTimeout(function(){hd.remove();},4000);},_i*60);}";
js=js.replace(oldMsg, newMsg);
console.log('3. Full hearts on unlock');

fs.writeFileSync('d:/桌面/咸鱼小游戏项目/src/game.js',js,'utf-8');
console.log('Done');
