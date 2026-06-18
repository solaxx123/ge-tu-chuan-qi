// 成就将在初始化后从localStorage加载
        
        function goPage(num) {
            const cur = document.querySelector('.page.active');
            if (cur) {
                cur.classList.remove('active');
                cur.style.display = 'none';
                showPage(num);
            } else {
                showPage(num);
            }
        }
        function showPage(num) {
            // 翻页音效
            initAudio();
            if (!audioMuted) { playTone(600, 0.04, 'sine', 0.08); setTimeout(() => playTone(800, 0.05, 'sine', 0.06), 30); }
            const target = document.getElementById('page' + num);
            if (!target) return;
            target.style.display = 'block';
            target.classList.add('active');
            window.scrollTo(0, 0);
            // BGM延迟200ms启动，避免阻塞页面切换
            const bgmType = num <= 2 ? 'romantic' : num === 3 ? 'dark' : (num >= 4 && num <= 6) || num === 'Game' ? 'epic' : null;
            if (bgmType) setTimeout(() => playBGMByType(bgmType), 200);
            if (num === 'Game') setTimeout(checkAllCleared, 300);
            // 跑酷页面：黑背景补丁 + 隐藏浮动粒子
            if (num === 'RabbitGame') {
                document.body.style.background = '#0a0015';
                var floatBg = document.getElementById('floatBg');
                if (floatBg) floatBg.style.display = 'none';
            } else {
                document.body.style.background = '';
                var floatBg = document.getElementById('floatBg');
                if (floatBg) floatBg.style.display = '';
            }
        }

        function startGame() {
            // 在用户手势内立即创建AudioContext
            initAudio();
            goPage(1);
            // BGM在showPage中延迟启动，这里确保ctx已就绪
        }
        
        function fullRestart() {
            localStorage.removeItem('snakeAchievements');
            localStorage.removeItem('snakeLove');
            location.reload();
        }
        window.fullRestart = fullRestart;

        // ===== 撕裂转场 =====
        function triggerTear() {
            goPage('Tear');
            const left = document.querySelector('.tear-left');
            const right = document.querySelector('.tear-right');
            playBGMByType('dark');
            setTimeout(() => { if(left) left.classList.add('open'); if(right) right.classList.add('open'); }, 400);
            setTimeout(() => { try { goPage(7); } catch(e) { console.log(e); } }, 1800);
        }
        window.triggerTear = triggerTear;
        
        function createFloatBg() {
            const bg = document.getElementById('floatBg');
            const items = ['❤️', '💕', '💖', '💗', '💓', '🍬', '🐰', '🕊️', '🌹', '⭐', '🎂', '💎'];
            for (let i = 0; i < 40; i++) {
                const item = document.createElement('div');
                item.className = 'float-item';
                item.textContent = items[Math.floor(Math.random() * items.length)];
                item.style.left = Math.random() * 100 + '%';
                item.style.top = Math.random() * 100 + '%';
                item.style.animationDelay = Math.random() * 8 + 's';
                item.style.animationDuration = (6 + Math.random() * 4) + 's';
                bg.appendChild(item);
            }
        }
        createFloatBg();
        
        const ACHIEVEMENTS = [
            { id: 'score99', name: '永恒宝石', desc: '力量值达到99', icon: '💞' },
            { id: 'score520', name: '真爱之心', desc: '力量值达到520', icon: '❤️' },
            { id: 'len10', name: '思念之绳', desc: '成长到10节', icon: '🐰' },
            { id: 'len20', name: '牵绊之链', desc: '成长到20节', icon: '🐇' },
            { id: 'allFoods', name: '百味之瓶', desc: '收集全部8种食物', icon: '🌈' },
            { id: 'diamond', name: '钻石誓言', desc: '收集3颗钻石', icon: '💎' },
            { id: 'neverGiveUp', name: '不屈之星', desc: '3次濒临失败仍坚持', icon: '🌟' },
            { id: 'love1314', name: '爱你1314', desc: '爱之力到达1314', icon: '💝' },
            { id: 'easter', name: '惊喜彩蛋', desc: '发现隐藏彩蛋', icon: '💝' },
            { id: 'rose5', name: '玫瑰之约', desc: '收集5朵玫瑰', icon: '🌹' },
            { id: 'konami', name: '秘籍', desc: '秘籍', icon: '🎮', hidden: true }
        ];
        
        let achievements = {};
        try { const saved = localStorage.getItem('snakeAchievements'); if (saved) { achievements = JSON.parse(saved); Object.keys(achievements).forEach(k=>{if(!ACHIEVEMENTS.find(a=>a.id===k))delete achievements[k];}); localStorage.setItem('snakeAchievements', JSON.stringify(achievements)); } } catch(e) {}
        let highScore = parseInt(localStorage.getItem('snakeLove') || '0');
        let highScoreDate = localStorage.getItem('snakeLoveDate') || '';
        let foodsCollected = new Set();
        let diamondCount = parseInt(localStorage.getItem('snakeDiamonds') || '0');
        let roseCount = parseInt(localStorage.getItem('snakeRoses') || '0');
        let endingUnlocked = false;
        let gameStarted = false;

        document.getElementById('highScore').textContent = highScore;
        if (highScoreDate) {
            document.getElementById('highScoreDate').textContent = '📅 ' + highScoreDate;
        }
        
        function renderAchievements() {
            const list = document.getElementById('achievementList');
            list.innerHTML = '<div class="achievement-list-grid" id="achiGrid"></div>';
            const grid = document.getElementById('achiGrid');
            if (!grid) return;

            let unlockedCount = 0;
            let baseUnlocked = 0;

            ACHIEVEMENTS.forEach(ach => {
                if (ach.hidden) return;
                const unlocked = achievements[ach.id];
                if (unlocked) unlockedCount++;
                if (ach.id !== 'ultimate' && ach.id !== 'rose5' && unlocked) baseUnlocked++;
                var displayDesc = ach.desc;
                if (ach.id === 'easter' && !unlocked && unlockedCount >= 7) displayDesc = '点击标题试试';
                const cls = unlocked ? 'unlocked' : 'locked';
                const icon = unlocked ? ach.icon : '🔒';
                const check = unlocked ? '<div class="achievement-check">✓</div>' : '';
                grid.innerHTML += '<div class="achievement-item ' + cls + '" title="' + displayDesc + '"><div class="achievement-icon">' + icon + '</div><div class="achievement-info"><div class="achievement-name">' + ach.name + '</div><div class="achievement-desc">' + displayDesc + '</div></div>' + check + '</div>';
            });
            const totalAch = ACHIEVEMENTS.filter(a => !a.hidden).length;
            document.getElementById('achievementProgress').textContent =
                `已解锁：${unlockedCount} / ${totalAch}`;

            if (unlockedCount >= totalAch && !endingUnlocked && gameStarted && running) {
                const vBtn = document.getElementById('victoryReadyBtn');
                if (vBtn) { vBtn.style.display = 'block'; playAchievement(); }
                showFrustration('✨ 宝物已集齐！点击按钮击败魔龙');
            }

        }

        function victoryCountdown() {
            const countdownEl = document.createElement('div');
            countdownEl.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:200;text-align:center;pointer-events:none;font-size:24px;color:#ff6b9d;font-weight:bold;background:rgba(255,255,255,0.92);padding:30px 40px;border-radius:20px;box-shadow:0 10px 40px rgba(255,107,157,0.3);border:2px solid rgba(255,107,157,0.3);';
            countdownEl.innerHTML = '💖 真爱之力正在汇聚...';
            document.body.appendChild(countdownEl);
            const steps = [
                { t: '💖 真爱之力正在汇聚...', d: 0 },
                { t: '✨ 宝物共鸣中...', d: 1200 },
                { t: '3', d: 2400 }, { t: '2', d: 3400 }, { t: '1', d: 4400 },
                { t: '💕 我来了！', d: 5400 },
            ];
            steps.forEach(s => setTimeout(() => { countdownEl.innerHTML = s.t; }, s.d));
            setTimeout(() => {
                countdownEl.remove(); playVictoryMusic();
                for (let i = 0; i < 30; i++) setTimeout(() => {
                    const h = document.createElement('div');
                    h.textContent = ['❤️','💕','💖','🕊️','🐰','✨'][Math.floor(Math.random()*6)];
                    h.style.cssText = 'position:fixed;z-index:500;pointer-events:none;font-size:'+(20+Math.random()*30)+'px;left:'+Math.random()*90+'%;top:-30px;animation:heartRain '+(1.5+Math.random()*2.5)+'s ease-out forwards;';
                    document.body.appendChild(h); setTimeout(() => h.remove(), 3500);
                }, i*40);
                setTimeout(() => goPage('Victory'), 800);
            }, 6400);
        }
        
        const storyQuotes=[{ach:"score99",q:"第一件宝物到手了！\\n兔兔，我离你越来越近！🕊️"},{ach:"score520",q:"520分！\\n这是全世界最浪漫的数字 💕"},{ach:"len10",q:"我已经成长到了10节\\n对你的思念也越来越长..."}];
        function showStoryCard(text){const c=document.createElement("div");c.style.cssText="position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);z-index:220;background:rgba(255,255,255,0.95);padding:20px 28px;border-radius:18px;text-align:center;font-size:0.95rem;color:#884466;line-height:1.6;box-shadow:0 8px 32px rgba(255,107,157,0.2);border:1px solid rgba(255,107,157,0.2);pointer-events:none;animation:fadeIn 0.4s ease;white-space:pre-line;";c.textContent=text;document.body.appendChild(c);setTimeout(function(){c.style.opacity="0";c.style.transition="opacity 0.5s";setTimeout(function(){c.remove();},500);},2500);}
        function unlockAchievement(id) {
            if (achievements[id]) return;
            achievements[id] = true;
            renderAchievements();
            updateDragonHP();

            const ach = ACHIEVEMENTS.find(a => a.id === id);
            if (ach && !ach.hidden) {
                showAchievementToast(`${ach.icon} ${ach.name}`);
                flash('gold');
                playAchievement();
                if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
                const hpBar = document.getElementById('dragonHP');
                if (hpBar) { hpBar.style.animation = 'none'; hpBar.offsetHeight; hpBar.style.animation = 'hpShake 0.5s ease'; }
                // 持久化成就
                try { localStorage.setItem('snakeAchievements', JSON.stringify(achievements)); } catch(e) {}
            }
        }

        // ===== 巨龙血条更新 =====
        function updateDragonHP() {
            const total = ACHIEVEMENTS.filter(a => !a.hidden).length;
            const unlocked = Object.keys(achievements).filter(k => achievements[k]).length;
            const remaining = Math.max(0, total - unlocked);
            const pct = (remaining / total) * 100;

            const fill = document.getElementById('dragonHPFill');
            const text = document.getElementById('dragonHPText');
            if (fill) fill.style.width = pct + '%';
            if (text) {
                let hearts = '';
                for (let i = 0; i < remaining; i++) hearts += '❤️';
                for (let i = 0; i < unlocked; i++) hearts += '🖤';
                text.textContent = hearts || '💀';
            }
        }
        
        function showAchievementToast(text) {
            const toast = document.getElementById('achievementToast');
            toast.textContent = '🏆 获得：' + text;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2800);
        }
        
        renderAchievements();

        // 暴露给HTML onclick的全局函数
        window._triggerVictory = function() {
            endingUnlocked = true;
            victoryCountdown();
            var btn = document.getElementById('victoryReadyBtn');
            if (btn) btn.remove();
        };

        function checkAllCleared() {
            const total = ACHIEVEMENTS.filter(a => !a.hidden).length;
            const unlocked = Object.keys(achievements).filter(k => achievements[k]).length;
            if (unlocked >= total && !endingUnlocked) {
                const vBtn = document.getElementById('victoryReadyBtn');
                if (vBtn) vBtn.style.display = 'block';
            }
        }

        const FOODS = [
            { emoji: '🍬', name: '糖果', score: 10 },
            { emoji: '❤️', name: '爱心', score: 15 },
            { emoji: '🐰', name: '兔兔', score: 20 },
            { emoji: '🕊️', name: '鸽鸽', score: 25 },
            { emoji: '🌹', name: '玫瑰', score: 30 },
            { emoji: '💎', name: '钻石', score: 50 },
            { emoji: '⭐', name: '星星', score: 35 },
            { emoji: '🎂', name: '蛋糕', score: 40 }
        ];
        
        const WALL_MSGS = [
            "走弯路了...但爱会指引方向！-20",
            "迷路也不怕，苏苏在等你！-20",
            "碰壁了？爱情路上谁没碰过壁呢！-20"
        ];

        const OVER_MSGS = [
            "鸽鸽从不放弃！",
            "真爱值得所有努力！",
            "苏苏相信你会成功！",
            "为了苏苏，再试一次！"
        ];
        
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        // roundRect polyfill for Safari/Firefox
        if(!CanvasRenderingContext2D.prototype.roundRect){CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);};}
        const grid = 17;
        const size = canvas.width / grid;
        
        let snake = [];
        let foods = [];
        let dir = 'right';
        let nextDir = 'right';
        let score = 0;
        let frustrations = 0; let totalDeaths = parseInt(localStorage.getItem("snakeDeaths")||"0");
        let comboTimer = 0;
        let comboCount = 0;
        let luckyCharm = 0;
        let loop = null;
        let running = false;
        let konamiCode = [];
        let konamiTarget = ['up', 'up', 'down', 'down', 'left', 'left', 'right', 'right'];
        let headerClicks = 0;
                const icon=document.getElementById("easterIcon");if(icon)icon.style.display="none";
        
        // ===== 音效系统 =====
        let audioCtx = null;
        let bgmInterval = null;
        let bgmPlaying = false;
        
        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if(!audioCtx._compressorAdded){const comp=audioCtx.createDynamicsCompressor();comp.connect(audioCtx.destination);audioCtx._comp=comp;audioCtx._compressorAdded=true;}
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();
        }
        let audioMuted = false;
        function toggleMute() {
            audioMuted = !audioMuted;
            const btn = document.getElementById('muteBtn');
            if (audioMuted) { stopBGM(); stopEasterHintTimer(); if (btn) btn.textContent = '🔇'; }
            else { if (running) { playBGMByType('epic'); startEasterHintTimer(); } if (btn) btn.textContent = '🔊'; }
            return audioMuted;
        }
        window.toggleMute = toggleMute;
        
        // playTone defined below with delay support (see BGM section)
        
        // 点击方向键音效
        function playClick() {
            initAudio();
            playTone(800, 0.08, 'square', 0.12);
        }
        
        // 吃食物音效
        function playEat() {
            initAudio();
            // 琶音音效
            playTone(523, 0.08, 'sine', 0.15);
            setTimeout(() => playTone(659, 0.08, 'sine', 0.14), 40);
            setTimeout(() => playTone(784, 0.1, 'sine', 0.12), 80);
            setTimeout(() => playTone(1047, 0.12, 'sine', 0.1), 120);
            // 触觉反馈
            if (navigator.vibrate) navigator.vibrate(15);
        }
        
        // 撞墙音效
        function playHit() {
            initAudio();
            playTone(150, 0.2, 'sawtooth', 0.18);
            if (navigator.vibrate) navigator.vibrate([10,30,10]);
        }
        
        // 获得成就音效
        function playAchievement() {
            initAudio();
            playTone(523, 0.15, 'sine', 0.25);
            setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 100);
            setTimeout(() => playTone(784, 0.15, 'sine', 0.25), 200);
            setTimeout(() => playTone(1047, 0.3, 'sine', 0.2), 300);
        }
        
        // ===== 高品质BGM系统（多声部和弦 + ADSR + 混响） =====
        // 和弦辅助函数：同时播放多个音符模拟和弦
        function playChord(freqs, duration, type = 'sine', volume = 0.08) {
            if (!audioCtx) return;
            freqs.forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                // ADSR 包络
                const now = audioCtx.currentTime;
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(volume, now + 0.02);        // Attack
                gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.08); // Decay
                gain.gain.setValueAtTime(volume * 0.6, now + 0.08);           // Sustain
                gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release
                osc.type = type;
                osc.frequency.value = freq;
                osc.connect(gain);
                gain.connect(audioCtx._comp||audioCtx.destination);
                osc.start(now);
                osc.stop(now + duration + 0.05);
            });
        }

        // 混响效果：延迟+衰减模拟空间感
        function playWithReverb(freq, duration, type = 'sine', volume = 0.06) {
            playTone(freq, duration, type, volume);
            playTone(freq, duration * 1.2, type, volume * 0.25, 0.06);
            playTone(freq * 1.01, duration * 1.4, type, volume * 0.12, 0.1);
        }

        // 新的 playTone 支持 delay 参数
        function playTone(freq, duration, type = 'sine', volume = 0.08, delay = 0) {
            if (!audioCtx || audioMuted) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = type;
            const now = audioCtx.currentTime + delay;
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.start(now);
            osc.stop(now + duration + 0.05);
        }

        // === 4首原创旋律（32音符，和弦+旋律双轨） ===
        // 邂逅主题：C大调，温柔梦幻
        const MELODY_MEET = {
            notes: [262,330,392,523,392,330,262,294,330,349,392,440,523,440,392,349,330,392,440,523,659,523,440,392,330,294,262,330,392,523,440,349],
            chords: [[262,330,392],[294,349,440],[330,392,523],[262,330,392],[294,349,440],[330,392,523],[262,330,392],[349,440,523],[330,392,523],[294,349,440],[262,330,392],[330,392,523]],
            tempo: 480, type: 'sine', vol: 0.06
        };
        // 相爱主题：G大调，温暖明亮
        const MELODY_LOVE = {
            notes: [392,440,494,587,494,440,392,349,392,440,494,523,587,659,587,523,440,392,349,330,294,330,349,392,440,494,587,523,494,440,392,440],
            chords: [[392,494,587],[349,440,523],[330,392,494],[294,349,440],[392,494,587],[349,440,523],[330,392,494],[392,494,587]],
            tempo: 440, type: 'sine', vol: 0.065
        };
        // 危机主题：C小调，低沉紧张
        const MELODY_DARK = {
            notes: [262,247,233,220,196,220,233,247,262,277,294,311,330,311,294,277,262,247,233,220,196,220,233,247,262,294,330,311,277,262,247,233],
            chords: [[262,311,392],[247,294,370],[233,277,349],[220,262,330],[196,233,294],[220,262,330],[233,277,349],[247,294,370]],
            tempo: 460, type: 'triangle', vol: 0.07
        };
        // 战斗主题：D大调，激昂史诗
        const MELODY_BATTLE = {
            notes: [294,370,440,587,440,370,294,330,370,440,494,587,659,587,494,440,370,440,494,587,698,784,880,784,698,587,494,440,587,494,440,370],
            chords: [[294,370,440],[330,392,494],[370,440,587],[294,370,440],[330,440,523],[370,494,587],[294,370,440],[370,494,587]],
            tempo: 380, type: 'sine', vol: 0.06
        };

        let bgmNoteIndex = 0;
        let bgmChordIndex = 0;
        let currentBGMType = null;
        let bgmTimeout = null;

        function playBGMByType(type) {
            if (bgmPlaying && currentBGMType === type) return;
            stopBGM();
            initAudio();
            bgmPlaying = true;
            currentBGMType = type;
            bgmNoteIndex = 0;
            bgmChordIndex = 0;

            let melody;
            switch(type) {
                case 'romantic': melody = MELODY_MEET; break;
                case 'dark': melody = MELODY_DARK; break;
                case 'epic': melody = MELODY_BATTLE; break;
                default: melody = MELODY_LOVE;
            }

            function step() {
                if (!audioCtx || !bgmPlaying) return;
                // 旋律音
                const noteFreq = melody.notes[bgmNoteIndex % melody.notes.length];
                playWithReverb(noteFreq, melody.tempo / 1000 * 1.2, melody.type, melody.vol);
                // 和弦（每两个旋律音弹一次和弦）
                if (bgmNoteIndex % 2 === 0) {
                    const chordFreqs = melody.chords[bgmChordIndex % melody.chords.length];
                    playChord(chordFreqs, melody.tempo / 1000 * 1.5, 'triangle', melody.vol * 0.5);
                    bgmChordIndex++;
                }
                bgmNoteIndex++;
                bgmTimeout = setTimeout(step, melody.tempo);
            }
            step();
        }

        function stopBGM() {
            bgmPlaying = false;
            if (bgmTimeout) { clearTimeout(bgmTimeout); bgmTimeout = null; }
            if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; }
        }
        
        // ===== 失败音效 =====
        function playGameOver() {
            stopBGM();
            initAudio();
            const sadNotes = [392, 349, 330, 294, 262, 247, 220, 196];
            sadNotes.forEach((freq, i) => {
                setTimeout(() => playWithReverb(freq, 0.45, 'triangle', 0.1), i * 160);
                if (i % 3 === 0) setTimeout(() => playChord([freq, freq*1.2, freq*1.5], 0.5, 'sine', 0.04), i * 160);
            });
        }

        // ===== 通关胜利音乐（丰富和弦版） =====
        function playVictoryMusic() {
            stopBGM();
            initAudio();
            const victoryMelody = [
                {n:523, c:[523,659,784]},{n:587, c:[587,698,880]},
                {n:659, c:[659,784,988]},{n:698, c:[698,880,1047]},
                {n:784, c:[784,988,1175]},{n:880, c:[880,1047,1319]},
                {n:988, c:[988,1175,1397]},{n:1047, c:[1047,1319,1568]}
            ];
            victoryMelody.forEach((note, i) => {
                setTimeout(() => {
                    playWithReverb(note.n, 0.6, 'sine', 0.15);
                    playChord(note.c, 0.7, 'triangle', 0.06);
                }, i * 200);
            });
            setTimeout(() => {
                playChord([784,988,1175], 1.2, 'sine', 0.08);
                playChord([523,659,784], 1.2, 'triangle', 0.05);
            }, 1700);
        }
        
        function flash(color) {
            const layer = document.getElementById('flashLayer');
            layer.className = 'flash-layer ' + color;
            layer.style.opacity = '1';
            setTimeout(() => layer.style.opacity = '0', 300);
        }
        
        function scoreAnim() {
            const el = document.getElementById('score');
            el.classList.remove('score-pop');
            void el.offsetWidth;
            el.classList.add('score-pop');
        }
        
        function showScoreFloat(addScore) {
            const float = document.createElement('div');
            float.className = 'score-float';
            float.textContent = '+' + addScore;
            float.style.color = addScore >= 30 ? '#ff6b9d' : addScore >= 20 ? '#f39c12' : '#ffd700';
            float.style.left = '50%';
            float.style.top = '200px';
            float.style.fontSize = addScore >= 30 ? '24px' : '20px';
            document.body.appendChild(float);
            setTimeout(() => float.remove(), 1000);
        }
        
        function showFrustration(msg) {
            const popup = document.getElementById('frustrationPopup');
            popup.textContent = msg;
            popup.classList.add('frustration-show');
            setTimeout(() => popup.classList.remove('frustration-show'), 2000);
        }

        // ===== 520 爱心雨特效 =====
        let celebration520Fired = false;
        function trigger520Celebration() {
            if (celebration520Fired) return;
            celebration520Fired = true;
            const hearts = ['❤️','💕','💖','💗','💓','💝','✨','💌'];
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const h = document.createElement('div');
                    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                    h.style.cssText = `
                        position:fixed;z-index:500;pointer-events:none;
                        font-size:${18+Math.random()*28}px;
                        left:${Math.random()*90}%;top:-30px;
                        animation: heartRain ${1.5+Math.random()*2}s ease-in forwards;
                    `;
                    document.body.appendChild(h);
                    setTimeout(() => h.remove(), 3500);
                }, i * 80);
            }
            showFrustration('💖 爱意满满！520！');
            flash('pink');
        }

        // ===== 1314 巅峰庆祝 =====
        let celebration1314Fired = false;
        function trigger1314Celebration() {
            if (celebration1314Fired) return;
            celebration1314Fired = true;
            const hearts = ['💝','💖','💕','💗','✨','💌','🕊️','🐰'];
            for (let i = 0; i < 35; i++) {
                setTimeout(() => {
                    const h = document.createElement('div');
                    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                    h.style.cssText = `
                        position:fixed;z-index:500;pointer-events:none;
                        font-size:${20+Math.random()*36}px;
                        left:${Math.random()*90}%;top:-30px;
                        animation: heartRain ${1.5+Math.random()*3}s ease-in forwards;
                    `;
                    document.body.appendChild(h);
                    setTimeout(() => h.remove(), 4500);
                }, i * 60);
            }
            showFrustration('💝 爱你一生一世！1314！');
            flash('gold');
            playAchievement();
        }

        // 爱心雨动画 keyframes（动态注入）
        const heartRainStyle = document.createElement('style');
        heartRainStyle.textContent = `
            @keyframes heartRain {
                0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
                50% { transform: translateY(50vh) rotate(180deg) scale(1.2); opacity: 0.8; }
                100% { transform: translateY(100vh) rotate(360deg) scale(0.5); opacity: 0; }
            }
        `;
        document.head.appendChild(heartRainStyle);
        
        function checkSpecialScore(newScore) {
            if (newScore >= 99 && score < 99) unlockAchievement('score99');
            if (newScore >= 520 && score < 520) unlockAchievement('score520');
            if (newScore >= 1314 && score < 1314) unlockAchievement('love1314');

            if (newScore > highScore) {
                highScore = newScore;
                localStorage.setItem('snakeLove', highScore);
                highScoreDate = new Date().toLocaleDateString('zh-CN');
                localStorage.setItem('snakeLoveDate', highScoreDate);
                document.getElementById('highScore').textContent = highScore;
                document.getElementById('highScoreDate').textContent = '📅 ' + highScoreDate;
            }
        }
        
        function init() {
            snake = [{x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}];
            dir = 'right';
            nextDir = 'right';
            score = 0;
            frustrations = 0;
            celebration520Fired = false;
            celebration1314Fired = false;
            foodsCollected = new Set();
            // diamondCount/roseCount 不再重置——跨局累计
            document.getElementById('score').textContent = 0;
            updateCollectUI();
            newFood();
            draw();
        }
        function updateCollectUI() {
            const dui = document.getElementById('diamondUI');
            const rui = document.getElementById('roseUI');
            if (dui) dui.textContent = diamondCount;
            if (rui) rui.textContent = roseCount;
        }
        
        function newFood() {
            while (foods.length < 1 + Math.floor(Math.random() * 2)) {
                let foodIndex, scoreVal, emoji, name;
                const rand = Math.random();
                if (rand < 0.06) { foodIndex = -1; emoji = "🍀"; name = "幸运草"; scoreVal = 0; }
                else if (rand < 0.14) { foodIndex = -2; emoji = "✨"; name = "金心"; scoreVal = 100; }
                else { const missing = []; for(let i=0;i<FOODS.length;i++){if(!foodsCollected.has(i))missing.push(i);} if(missing.length>0&&Math.random()<0.5){foodIndex=missing[Math.floor(Math.random()*missing.length)];}else{foodIndex=Math.floor(Math.random()*FOODS.length);} const f=FOODS[foodIndex]; emoji=f.emoji; name=f.name; scoreVal=f.score; }
                let valid = false, tries = 0, fx, fy;
                while (!valid && tries < 60) { tries++; valid = true;
                    fx = Math.floor(Math.random() * (size - 2)) + 1; fy = Math.floor(Math.random() * (size - 2)) + 1;
                    for (let s of snake) { if (s.x === fx && s.y === fy) { valid = false; break; } }
                    for (let f of foods) { if (f.x === fx && f.y === fy) { valid = false; break; } }
                }
                if (valid) foods.push({ x: fx, y: fy, type: foodIndex, emoji, name, score: scoreVal });
            }
        }
        function draw() {
            // 梦幻背景：基于历史最高分阶梯进化 (0-99/99-520/520-1314/1314-3000/3000+)
            var dreamLevel = highScore < 99 ? 0 : highScore < 520 ? 0.25 : highScore < 1314 ? 0.5 : highScore < 3000 ? 0.75 : 1;
            var r1 = 255, g1 = Math.floor(250 - dreamLevel * 20), b1 = Math.floor(245 - dreamLevel * 10);
            var r2 = Math.floor(255 - dreamLevel * 15), g2 = Math.floor(245 - dreamLevel * 35), b2 = Math.floor(245 - dreamLevel * 25);
            var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, 'rgb('+r1+','+g1+','+b1+')');
            gradient.addColorStop(1, 'rgb('+r2+','+g2+','+b2+')');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 梦幻光效叠加 (高分段才有)
            if (dreamLevel >= 0.5) {
                var glow = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width*0.8);
                glow.addColorStop(0, 'rgba(255,180,210,'+(dreamLevel*0.12)+')');
                glow.addColorStop(1, 'rgba(255,200,230,0)');
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // 网格线随等级微调
            ctx.strokeStyle = 'rgba(255, 107, 157, '+(0.08+dreamLevel*0.05)+')';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= size; i++) {
                ctx.beginPath();
                ctx.moveTo(i * grid, 0);
                ctx.lineTo(i * grid, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * grid);
                ctx.lineTo(canvas.width, i * grid);
                ctx.stroke();
            }

            // 高分段：背景飘落花瓣
            if (dreamLevel >= 0.25 && Math.random() < dreamLevel * 0.4) {
                var petal = dreamLevel >= 0.75 ? ['🌸','💮','💕','✨'][Math.floor(Math.random()*4)] : '🌸';
                ctx.font = (10+Math.random()*10)+'px Arial';
                ctx.fillText(petal, Math.random()*canvas.width, Math.random()*canvas.height);
            }
            
            snake.forEach((s, i) => {
                const x = s.x * grid;
                const y = s.y * grid;
                
                if (i === 0) {
                    ctx.fillStyle = '#ffb6c1';
                    ctx.beginPath();
                    ctx.roundRect(x + 1, y + 1, grid - 2, grid - 2, 5);
                    ctx.fill();
                    
                    ctx.fillStyle = '#ffb6c1';
                    ctx.beginPath();
                    ctx.ellipse(x + 5, y - 2, 3, 5, 0, 0, Math.PI * 2);
                    ctx.ellipse(x + 12, y - 2, 3, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = '#333';
                    ctx.beginPath();
                    ctx.arc(x + 5, y + 6, 2, 0, Math.PI * 2);
                    ctx.arc(x + 12, y + 6, 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = 'rgba(255, 107, 157, 0.4)';
                    ctx.beginPath();
                    ctx.ellipse(x + 3, y + 10, 2, 1.5, 0, 0, Math.PI * 2);
                    ctx.ellipse(x + 14, y + 10, 2, 1.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                } else {
                    const hue = 350 + (i * 3) % 30;
                    ctx.fillStyle = `hsl(${hue}, 100%, ${75 - i * 0.5}%)`;
                    ctx.beginPath();
                    ctx.roundRect(x + 2, y + 2, grid - 4, grid - 4, 4);
                    ctx.fill();
                }
            });
            
            ctx.font = 'bold 16px "Apple Color Emoji", "Segoe UI Emoji", Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            foods.forEach(f => { ctx.fillText(f.emoji, f.x * grid + grid/2, f.y * grid + grid/2 + 1); });
        }
        
        function handleWallHit() {
            gameover();
        }
        function update() {
            dir = nextDir;
            let head = {...snake[0]};
            
            if (dir === 'up') head.y--;
            if (dir === 'down') head.y++;
            if (dir === 'left') head.x--;
            if (dir === 'right') head.x++;
            
            if (head.x < 0 || head.x >= size || head.y < 0 || head.y >= size) {
                handleWallHit();
                return;
            }
            
            for (let s of snake) {
                if (s.x === head.x && s.y === head.y) {
                    gameover();
                    return;
                }
            }
            
            snake.unshift(head);
            
            if (snake.length >= 10) unlockAchievement('len10');
            if (snake.length >= 20) unlockAchievement('len20');
            
            // 多食物+连击+稀有道具
            let ate = false;
            for (let fi = 0; fi < foods.length; fi++) {
                const f = foods[fi];
                if (head.x === f.x && head.y === f.y) {
                    let addScore = f.score;
                    const now = Date.now();
                    if (now - comboTimer < 3000) { comboCount++; } else { comboCount = 1; }
                    comboTimer = now;
                    if (comboCount >= 2) { addScore = Math.floor(addScore * comboCount); const ci=document.getElementById("comboInd"); if(ci){ci.style.display="block";ci.textContent="🔥 x"+comboCount;} } else { const ci=document.getElementById("comboInd"); if(ci)ci.style.display="none"; }
                    if (luckyCharm > 0) { addScore *= 2; luckyCharm--; }
                    if (f.type === -1) { luckyCharm += 3; showFrustration('🍀 接下来3个食物双倍分！'); }
                    playEat();
                    if (f.type >= 0) foodsCollected.add(f.type);
                    if (f.type === 5 || f.name === '钻石' || f.emoji === '💎') { diamondCount++; localStorage.setItem('snakeDiamonds', diamondCount); updateCollectUI(); if (diamondCount >= 3) unlockAchievement('diamond'); }
                    if (f.emoji === '🌹') { roseCount++; localStorage.setItem('snakeRoses', roseCount); updateCollectUI(); if (roseCount >= 5) unlockAchievement('rose5'); }
                    if (foodsCollected.size >= 8) unlockAchievement('allFoods');
                    const newScore = score + addScore;
                    checkSpecialScore(newScore);
                    score = newScore;
                    if (score >= 520) trigger520Celebration();
                    if (score >= 1314) { unlockAchievement('love1314'); trigger1314Celebration(); }
                    document.getElementById('score').textContent = score;
            document.getElementById('diamondUI').textContent = diamondCount;
            document.getElementById('roseUI').textContent = roseCount;
                    scoreAnim();
                    if (comboCount >= 3) showScoreFloat(addScore, comboCount);
                    else showScoreFloat(addScore);
                    flash('pink');
                    foods.splice(fi, 1);
                    newFood();
                    ate = true;
                    break;
                }
            }
            if (!ate) { snake.pop(); }
            
            draw();
        }
        
        function turn(newDir) {
            const opp = {up: 'down', down: 'up', left: 'right', right: 'left'};
            if (opp[newDir] !== dir) {
                nextDir = newDir;
                playClick();
            }
            
            konamiCode.push(newDir);
            if (konamiCode.length > konamiTarget.length) konamiCode.shift();
            if (konamiCode.join(',') === konamiTarget.join(',')) {
                unlockAchievement('konami');
                konamiCode = [];
            }
        }
        
        function start() {
            if (running) return;
            running = true;
            gameStarted = true;
            init();
            updateDragonHP();
            playBGMByType('epic');
            startEasterHintTimer();
            gameLoop();

            function gameLoop() {
                if (!running) return;
                update();
                const speed = Math.max(100, 150 - Math.floor(score / 200) * 4);
                loop = setTimeout(gameLoop, speed);
            }
            document.getElementById('startBtn').textContent = '⚔️ 冒险中...';
            document.getElementById('startBtn').disabled = true;
        }

        // ===== 彩蛋提示定时器 =====
        let easterHintTimer = null;
        function startEasterHintTimer() {
            stopEasterHintTimer();
            easterHintTimer = setInterval(() => {
                if (!running) return;
                const hint = document.getElementById('easterHint');
                if (hint && !achievements['easter']) {
                    hint.classList.add('show');
                    setTimeout(() => hint.classList.remove('show'), 2500);
                }
            }, 25000 + Math.random() * 15000); // 25-40秒随机出现
        }
        function stopEasterHintTimer() {
            if (easterHintTimer) { clearInterval(easterHintTimer); easterHintTimer = null; }
        }
        
        function restart() {
            clearTimeout(loop);
            stopBGM();
            running = false;
            celebration520Fired = false;
            celebration1314Fired = false;
            stopEasterHintTimer();
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('startBtn').textContent = '⚔️ 开始冒险';
            document.getElementById('startBtn').disabled = false;
            init();
            updateDragonHP();
        }
        window.restart = restart;
        
        function gameover() {
            totalDeaths++; try { localStorage.setItem("snakeDeaths", totalDeaths); } catch(e) {}
            if (totalDeaths >= 3) unlockAchievement("neverGiveUp");
            clearTimeout(loop);
            playGameOver();
            running = false;
            celebration520Fired = false;
            celebration1314Fired = false;
            stopEasterHintTimer();
            
            let title = '💔 爱不会停下';
            if (score >= 1314) title = '💝 爱你1314！';
            else if (score >= 520) title = '❤️ 传奇真爱！';
            else if (score >= 200) title = '⭐ 强大的爱！';
            else if (score >= 100) title = '✨ 爱的冒险者！';
            
            document.getElementById('endTitle').textContent = title;
            document.getElementById('finalScore').textContent = score;
            document.getElementById('loveMsg').textContent = OVER_MSGS[Math.floor(Math.random() * OVER_MSGS.length)];
            
            let frustrationText = '';
            if (frustrations > 0) {
                frustrationText = `经历 ${frustrations} 次碰壁，爱从未动摇！`;
            } else {
                frustrationText = `爱的旅途一帆风顺！`;
            }
            document.getElementById('frustrationMsg').textContent = frustrationText;
            
            document.getElementById('gameOver').style.display = 'flex';
            document.getElementById('startBtn').textContent = '⚔️ 开始冒险';
            document.getElementById('startBtn').disabled = false;
        }
        
        // 双重绑定：click + touchstart，确保100%响应
        const btnUp = document.getElementById('btnUp');
        const btnDown = document.getElementById('btnDown');
        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');
        
        btnUp.addEventListener('click', () => turn('up'));
        btnDown.addEventListener('click', () => turn('down'));
        btnLeft.addEventListener('click', () => turn('left'));
        btnRight.addEventListener('click', () => turn('right'));
        
        btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); turn('up'); }, {passive: false});
        btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); turn('down'); }, {passive: false});
        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); turn('left'); }, {passive: false});
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); turn('right'); }, {passive: false});
        
        let sx = 0, sy = 0;
        canvas.ontouchstart = (e) => {
            sx = e.touches[0].clientX;
            sy = e.touches[0].clientY;
        };
        canvas.ontouchend = (e) => {
            if (!running) return;
            let dx = e.changedTouches[0].clientX - sx;
            let dy = e.changedTouches[0].clientY - sy;
            if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    turn(dx > 0 ? 'right' : 'left');
                } else {
                    turn(dy > 0 ? 'down' : 'up');
                }
            }
        };
        
        document.onkeydown = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w') turn('up');
            if (e.key === 'ArrowDown' || e.key === 's') turn('down');
            if (e.key === 'ArrowLeft' || e.key === 'a') turn('left');
            if (e.key === 'ArrowRight' || e.key === 'd') turn('right');
        };
        
        document.getElementById('header').onclick = () => {
            headerClicks++;
            const headerEl = document.getElementById('header');
            if (headerClicks === 1) {
                showFrustration('没有反应？再点一下试试');
                headerEl.style.transform = 'scale(1.03)';
                setTimeout(() => headerEl.style.transform = 'scale(1)', 200);
            } else if (headerClicks === 2) {
                showFrustration('多点几下嘛~');
                headerEl.style.transform = 'scale(1.05)';
                setTimeout(() => headerEl.style.transform = 'scale(1)', 200);
            } else if (headerClicks >= 3) {
                unlockAchievement('easter');
                headerClicks = 0;
                headerEl.style.transform = 'scale(1)';
                const bigMsg = document.createElement('div');
                bigMsg.textContent = '💕 彩蛋已解锁！鸽兔永远在一起 💕';
                bigMsg.style.cssText = 'position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);z-index:500;font-size:1.4rem;font-weight:900;color:#ff6b9d;background:rgba(255,255,255,0.95);padding:18px 28px;border-radius:18px;box-shadow:0 8px 40px rgba(255,107,157,0.3);pointer-events:none;';
                document.body.appendChild(bigMsg);
                for(var _i=0;_i<25;_i++){setTimeout(function(){var hd=document.createElement('div');hd.textContent=['❤️','💕','💖','✨'][Math.floor(Math.random()*4)];hd.style.cssText='position:fixed;z-index:600;pointer-events:none;font-size:'+(20+Math.random()*30)+'px;left:'+Math.random()*95+'%;top:-30px;animation:heartRain '+(2+Math.random()*3)+'s ease-in forwards;';document.body.appendChild(hd);setTimeout(function(){hd.remove();},4000);},_i*60);}
                setTimeout(function(){ bigMsg.style.opacity = '0'; bigMsg.style.transition = 'opacity 0.8s'; setTimeout(function(){ bigMsg.remove(); }, 800); }, 2000);
            }
        };

        // 标题悬停暗示
        document.getElementById('header').style.cursor = 'pointer';
        document.getElementById('header').title = '点我有惊喜？';
        
        document.getElementById('startBtn').onclick = start;
        var resetBtn = document.getElementById('resetAllBtn');
        if (resetBtn) resetBtn.onclick = function() {
            if (confirm('确定要清空所有成就和进度吗？')) { localStorage.clear(); location.reload(); }
        };
        
        // ===== 用户第一次点击页面任何地方就自动播放BGM =====
        let firstInteraction = false;
        
        document.addEventListener('click', function autoPlayOnFirstClick() {
            if (!firstInteraction) {
                firstInteraction = true;
                initAudio();
                playBGMByType('romantic'); // 封面：邂逅主题
                document.removeEventListener('click', autoPlayOnFirstClick);
            }
        }, true);

        // 强制首页显示
        document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
        const cover = document.getElementById('page0');
        if (cover) { cover.style.display = 'block'; cover.classList.add('active'); }

        init();

        // ==================== 兔兔地牢跑酷引擎 (Flappy Bird全屏) ====================
        (function() {
            var rabbitCanvas = document.getElementById("rabbitCanvas");
            if (!rabbitCanvas) return;
            var ctx = rabbitCanvas.getContext("2d");
            var W, H;
            function resize() { W = window.innerWidth; H = window.innerHeight; rabbitCanvas.width = W; rabbitCanvas.height = H; }
            resize(); window.addEventListener("resize", resize);

            var bird = { y: 0, vy: 0, r: 18 };
            var pipes = [];
            var score = 0, running = false, animId = null, lastTime = 0;
            var GRAVITY = 0.0012, JUMP_VEL = -0.55, PIPE_SPEED = 0.15, PIPE_GAP = 150, PIPE_WIDTH = 55, PIPE_SPACING = 280, TARGET = 10;

            function reset() { bird.y = H/2; bird.vy = 0; pipes = []; score = 0; updateUI(); }
            function updateUI() { var e = document.getElementById("rabbitKeys"); if (e) e.textContent = score; }

            function spawnPipe() {
                var minTop = 50, maxTop = H - PIPE_GAP - 50;
                var topH = minTop + Math.random() * (maxTop - minTop);
                pipes.push({ x: W, topH: topH, passed: false, isLast: pipes.length >= TARGET });
            }

            function draw() {
                var grad = ctx.createLinearGradient(0, 0, 0, H);
                grad.addColorStop(0, "#0a0015"); grad.addColorStop(0.5, "#150030"); grad.addColorStop(1, "#0a0015");
                ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = "#1a0a2e";
                for (var i = 0; i < W; i += 30) { ctx.fillRect(i, 0, 14, 6); ctx.fillRect(i, H-6, 14, 6); }
                pipes.forEach(function(p) {
                    ctx.fillStyle = "#3a2050";
                    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topH);
                    ctx.fillRect(p.x, p.topH + PIPE_GAP, PIPE_WIDTH, H - p.topH - PIPE_GAP);
                    ctx.fillStyle = "#5a3870";
                    ctx.fillRect(p.x - 2, p.topH - 4, PIPE_WIDTH + 4, 8);
                    ctx.fillRect(p.x - 2, p.topH + PIPE_GAP - 4, PIPE_WIDTH + 4, 8);
                    if (p.isLast) { ctx.font = "22px Arial"; ctx.fillText("🕊️", p.x + PIPE_WIDTH/2 - 12, p.topH + PIPE_GAP/2 + 7); }
                    else if (!p.passed) { ctx.font = "16px Arial"; ctx.fillText("🗝️", p.x + PIPE_WIDTH/2 - 8, p.topH + PIPE_GAP/2 + 5); }
                });
                ctx.font = "26px Arial";
                var angle = Math.min(0.5, Math.max(-0.3, bird.vy * 0.15));
                ctx.save(); ctx.translate(80, bird.y); ctx.rotate(angle);
                ctx.fillText("🐰", -13, 8); ctx.restore();
                if (!running && pipes.length > 0) {
                    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, W, H);
                    ctx.fillStyle = "#ff6b9d"; ctx.font = "bold 22px Arial"; ctx.textAlign = "center";
                    ctx.fillText("💔 兔兔被抓了！", W/2, H/2); ctx.textAlign = "start";
                }
            }

            function update(dt) {
                if (!running) return;
                bird.vy += GRAVITY * dt; bird.y += bird.vy * dt;
                if (bird.y - bird.r < 0 || bird.y + bird.r > H) { gameOver(); return; }
                for (var i = pipes.length - 1; i >= 0; i--) {
                    var p = pipes[i]; p.x -= PIPE_SPEED * dt;
                    if (80 + bird.r > p.x && 80 - bird.r < p.x + PIPE_WIDTH) {
                        if (bird.y - bird.r < p.topH || bird.y + bird.r > p.topH + PIPE_GAP) { gameOver(); return; }
                    }
                    if (!p.passed && p.x + PIPE_WIDTH < 80) { p.passed = true; score++; updateUI(); playEat(); if (score >= TARGET) { win(); return; } }
                    if (p.x + PIPE_WIDTH < -50) pipes.splice(i, 1);
                }
                if (pipes.length === 0 || pipes[pipes.length-1].x < W - PIPE_SPACING) spawnPipe();
            }

            function jump() { if (!running) { start(); return; } bird.vy = JUMP_VEL * 16; playClick(); }
            function gameOver() { running = false; cancelAnimationFrame(animId); playHit(); document.getElementById("rabbitStartBtn").textContent = "🐰 重新挑战"; document.getElementById("rabbitStartBtn").disabled = false; draw(); }

            function win() {
                running = false; cancelAnimationFrame(animId); playVictoryMusic();
                document.getElementById("rabbitStartBtn").textContent = "🐰 已通关！";
                document.getElementById("rabbitStartBtn").disabled = true;
                for (var i = 0; i < 25; i++) { (function(j) { setTimeout(function() {
                    var p = document.createElement("div");
                    p.textContent = ["🗝️","💕","🐰","✨"][Math.floor(Math.random()*4)];
                    p.style.cssText = "position:fixed;z-index:1000;pointer-events:none;font-size:"+(18+Math.random()*25)+"px;left:"+Math.random()*95+"%;top:-20px;animation:heartRain "+(1.5+Math.random()*2)+"s ease-in forwards;";
                    document.body.appendChild(p); setTimeout(function(){p.remove();},3000);
                }, j*50); })(i); }
                setTimeout(function() { goPage("TrueEnding"); }, 2500);
            }

            function start() {
                reset(); running = true; lastTime = performance.now();
                document.getElementById("rabbitStartBtn").textContent = "🐰 跑酷中...";
                document.getElementById("rabbitStartBtn").disabled = true;
                var hint = document.getElementById("rabbitHint"); if(hint) hint.style.display = "none";
                spawnPipe();
                (function loop(ts) {
                    if (!running) return;
                    var dt = ts - lastTime; if (dt > 100) dt = 100;
                    lastTime = ts; update(dt); draw();
                    animId = requestAnimationFrame(loop);
                })(lastTime);
            }

            rabbitCanvas.addEventListener("click", function(e) { e.preventDefault(); jump(); });
            rabbitCanvas.addEventListener("touchstart", function(e) { e.preventDefault(); jump(); });
            document.getElementById("rabbitStartBtn").onclick = function() { start(); };
            reset(); draw();
        })();
