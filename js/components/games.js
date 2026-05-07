// js/components/games.js

import { $, $$, showToast } from '../utils.js';
import { state, saveState, unlockAchievement } from '../state.js';
import { onGameOver, onNewRecord } from './pet.js';

// Состояние игр: рекорды и монеты
function getGameState() {
    if (!state.gameRecords) state.gameRecords = {};
    if (!state.gameCoins) state.gameCoins = 0;
    return state;
}

function saveGameRecord(gameId, score) {
    const gs = getGameState();
    if (!gs.gameRecords[gameId] || score > gs.gameRecords[gameId]) {
        gs.gameRecords[gameId] = score;
        saveState();
        onNewRecord();
    }
}

function addGameCoins(amount) {
    state.gems = (state.gems || 0) + amount;
    getGameState().gameCoins = (getGameState().gameCoins || 0) + amount;
    saveState();
    // Обновить счётчик в шапке
    const gemEl = $('#gemCount');
    if (gemEl) gemEl.textContent = state.gems;
}

// ========================= ИГРА #1: KOTYTAIL (Змейка) =========================
function startKotyTail(container) {
    container.innerHTML = '';
    const gs = getGameState();
    const best = gs.gameRecords?.kotyTail || 0;

    // Холст
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 400;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '16px';
    canvas.style.background = '#0F172A';

    // Панель
    const scoreEl = document.createElement('div');
    scoreEl.className = 'game-hud';
    scoreEl.innerHTML = `<span>🐍 <b id="ktScore">0</b></span><span>🏆 <b>${best}</b></span>`;

    const dPad = document.createElement('div');
    dPad.className = 'game-dpad';
    dPad.innerHTML = `
        <div class="dpad-row"><button data-dir="up">▲</button></div>
        <div class="dpad-row">
            <button data-dir="left">◄</button>
            <button data-dir="down">▼</button>
            <button data-dir="right">►</button>
        </div>`;

    container.appendChild(scoreEl);
    container.appendChild(canvas);
    container.appendChild(dPad);

    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const cols = canvas.width / gridSize;
    const rows = canvas.height / gridSize;

    let snake = [{x: 5, y: 5}];
    let dir = {x: 1, y: 0};
    let food = randomFood();
    let score = 0;
    let gameOver = false;
    let interval;

    function randomFood() {
        return {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Сетка
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
            }
        }
        // Змейка
        snake.forEach((seg, i) => {
            const gradient = ctx.createRadialGradient(
                seg.x * gridSize + gridSize / 2, seg.y * gridSize + gridSize / 2, 1,
                seg.x * gridSize + gridSize / 2, seg.y * gridSize + gridSize / 2, gridSize / 2
            );
            gradient.addColorStop(0, '#10B981');
            gradient.addColorStop(1, i === 0 ? '#34D399' : '#059669');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2, 4);
            ctx.fill();
        });
        // Глазки головы
        const head = snake[0];
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(head.x * gridSize + 7, head.y * gridSize + 7, 3, 0, Math.PI * 2);
        ctx.arc(head.x * gridSize + 13, head.y * gridSize + 7, 3, 0, Math.PI * 2);
        ctx.fill();
        // Еда — мышка
        ctx.font = '20px serif';
        ctx.fillText('🐭', food.x * gridSize, food.y * gridSize + gridSize - 2);

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#EF4444';
            ctx.font = 'bold 24px Nunito,sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Котик запутался!', canvas.width / 2, canvas.height / 2 - 10);
            ctx.fillStyle = '#fff';
            ctx.font = '16px Nunito,sans-serif';
            ctx.fillText('Нажми для перезапуска', canvas.width / 2, canvas.height / 2 + 30);
            ctx.textAlign = 'start';
        }
    }

    function tick() {
        if (gameOver) return;
        const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
        // Стены — game over
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
            endGame();
            return;
        }
        // Столкновение с собой
        if (snake.some(s => s.x === head.x && s.y === head.y)) {
            endGame();
            return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            food = randomFood();
            // Не даём еде появиться на змейке
            while (snake.some(s => s.x === food.x && s.y === food.y)) {
                food = randomFood();
            }
        } else {
            snake.pop();
        }
        $('#ktScore').textContent = score;
        draw();
    }

    function endGame() {
        gameOver = true;
        clearInterval(interval);
        draw();
        saveGameRecord('kotyTail', score);
        if (score > 30) addGameCoins(Math.floor(score / 5));
        if (score >= 100) unlockAchievement('gameMaster', () => {});
        onGameOver();
    }

    function changeDir(newDir) {
        if (dir.x + newDir.x === 0 && dir.y + newDir.y === 0) return; // Не разворачиваться
        dir = newDir;
    }

    // Управление: кнопки
    dPad.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const d = btn.dataset.dir;
            if (d === 'up') changeDir({x: 0, y: -1});
            if (d === 'down') changeDir({x: 0, y: 1});
            if (d === 'left') changeDir({x: -1, y: 0});
            if (d === 'right') changeDir({x: 1, y: 0});
        });
    });

    // Управление: клавиатура/свайпы
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    canvas.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            changeDir({x: dx > 0 ? 1 : -1, y: 0});
        } else {
            changeDir({x: 0, y: dy > 0 ? 1 : -1});
        }
    });

    document.addEventListener('keydown', onKey);
    function onKey(e) {
        if (e.key === 'ArrowUp') { e.preventDefault(); changeDir({x: 0, y: -1}); }
        if (e.key === 'ArrowDown') { e.preventDefault(); changeDir({x: 0, y: 1}); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); changeDir({x: -1, y: 0}); }
        if (e.key === 'ArrowRight') { e.preventDefault(); changeDir({x: 1, y: 0}); }
    }

    canvas.addEventListener('click', () => {
        if (gameOver) {
            document.removeEventListener('keydown', onKey);
            startKotyTail(container);
        }
    });

    draw();
    interval = setInterval(tick, 130);
}

// ========================= ИГРА #2: КОТ ПРЫГАЕТ (Doodle Jump) =========================
function startCatJump(container) {
    container.innerHTML = '';
    const gs = getGameState();
    const best = gs.gameRecords?.catJump || 0;

    const canvas = document.createElement('canvas');
    canvas.width = 340;
    canvas.height = 500;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '16px';
    canvas.style.background = 'linear-gradient(180deg, #87CEEB 0%, #E0F2FE 100%)';

    const scoreEl = document.createElement('div');
    scoreEl.className = 'game-hud';
    scoreEl.innerHTML = `<span>⬆️ <b id="cjScore">0</b> м</span><span>🏆 <b>${best}</b></span>`;

    const dPad = document.createElement('div');
    dPad.className = 'game-dpad';
    dPad.innerHTML = `
        <div class="dpad-row" style="justify-content:center;gap:20px;">
            <button data-dir="left" style="font-size:24px;">◄</button>
            <button data-dir="right" style="font-size:24px;">►</button>
        </div>`;

    container.appendChild(scoreEl);
    container.appendChild(canvas);
    container.appendChild(dPad);

    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    let cat = {x: w / 2 - 15, y: h - 100, vy: 0, width: 30, height: 36};
    let platforms = [];
    let cameraY = 0;
    let score = 0;
    let gameOver = false;
    let animFrame;

    function createPlatform(y, x) {
        const px = x ?? Math.random() * (w - 70);
        return {x: px, y, width: 70, height: 12};
    }

    // Стартовые платформы
    for (let i = 0; i < 8; i++) {
        platforms.push(createPlatform(h - 70 - i * 70));
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(0, cameraY);

        // Платформы
        platforms.forEach(p => {
            const screenY = p.y - cameraY;
            if (screenY < -50 || screenY > h + 50) return;
            ctx.fillStyle = '#059669';
            ctx.beginPath();
            ctx.roundRect(p.x, screenY, p.width, p.height, 6);
            ctx.fill();
            // Травка
            ctx.fillStyle = '#10B981';
            ctx.beginPath();
            ctx.roundRect(p.x, screenY - 4, p.width, 8, 3);
            ctx.fill();
        });

        // Кот
        const cy = cat.y - cameraY;
        ctx.font = '30px serif';
        ctx.fillText('🐱', cat.x, cy + 28);
        ctx.restore();

        // HUD
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 14px Nunito';
        ctx.textAlign = 'right';
        ctx.fillText(Math.floor(score) + ' м', w - 12, 24);

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = 'bold 20px Nunito';
            ctx.fillText('Котик упал!', w / 2, h / 2 - 10);
            ctx.font = '14px Nunito';
            ctx.fillText('Нажми для перезапуска', w / 2, h / 2 + 25);
            ctx.textAlign = 'start';
        }
    }

    function loop() {
        if (gameOver) return;
        // Гравитация
        cat.vy += 0.6;
        cat.y += cat.vy;

        // Камера следит за котом только когда он высоко
        const targetCamY = cat.y - h * 0.55;
        if (targetCamY < cameraY) cameraY = targetCamY;

        // Платформы
        platforms.forEach(p => {
            if (cat.vy > 0 &&
                cat.y + cat.height >= p.y &&
                cat.y + cat.height <= p.y + p.height + 10 &&
                cat.x + cat.width > p.x &&
                cat.x < p.x + p.width) {
                cat.vy = -11;
                cat.y = p.y - cat.height;
                // Возможно монетка
                if (Math.random() < 0.1) addGameCoins(1);
            }
        });

        // Смерть при падении
        if (cat.y - cameraY > h + 60) {
            endGame();
            return;
        }

        // Генерация платформ
        const highestPlatformY = platforms.reduce((min, p) => Math.min(min, p.y), Infinity);
        while (highestPlatformY - cameraY > -200) {
            const newY = highestPlatformY - 60 - Math.random() * 40;
            platforms.push(createPlatform(newY));
            platforms.sort((a, b) => a.y - b.y);
            // Удаляем старые
            if (platforms.length > 15) platforms = platforms.slice(-15);
            break;
        }

        score = Math.max(score, Math.floor((h - 100 - cat.y) / 10));
        const scEl = document.getElementById('cjScore');
        if (scEl) scEl.textContent = Math.floor(score);

        // Выход за край — wrap
        if (cat.x < -cat.width) cat.x = w;
        if (cat.x > w) cat.x = -cat.width;

        draw();
        animFrame = requestAnimationFrame(loop);
    }

    function endGame() {
        gameOver = true;
        cancelAnimationFrame(animFrame);
        draw();
        const finalScore = Math.floor(score);
        saveGameRecord('catJump', finalScore);
        if (finalScore > 30) addGameCoins(Math.floor(finalScore / 10));
        if (finalScore >= 200) unlockAchievement('gameMaster', () => {});
        onGameOver();
    }

    // Управление
    let leftHeld = false, rightHeld = false;
    dPad.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (btn.dataset.dir === 'left') leftHeld = true;
            if (btn.dataset.dir === 'right') rightHeld = true;
        });
        btn.addEventListener('pointerup', (e) => {
            e.preventDefault();
            if (btn.dataset.dir === 'left') leftHeld = false;
            if (btn.dataset.dir === 'right') rightHeld = false;
        });
        btn.addEventListener('pointerleave', () => {
            leftHeld = false;
            rightHeld = false;
        });
    });

    // Клавиатура
    document.addEventListener('keydown', onJumpKey);
    document.addEventListener('keyup', onJumpKeyUp);
    function onJumpKey(e) {
        if (e.key === 'ArrowLeft') leftHeld = true;
        if (e.key === 'ArrowRight') rightHeld = true;
    }
    function onJumpKeyUp(e) {
        if (e.key === 'ArrowLeft') leftHeld = false;
        if (e.key === 'ArrowRight') rightHeld = false;
    }

    // Таймер движения
    const moveInterval = setInterval(() => {
        if (gameOver) { clearInterval(moveInterval); return; }
        if (leftHeld) cat.x -= 5;
        if (rightHeld) cat.x += 5;
    }, 16);

    canvas.addEventListener('click', () => {
        if (gameOver) {
            document.removeEventListener('keydown', onJumpKey);
            document.removeEventListener('keyup', onJumpKeyUp);
            clearInterval(moveInterval);
            startCatJump(container);
        }
    });

    draw();
    loop();
}

// ========================= ИГРА #3: ЛОВИ РЫБКУ (Catch/Fruit Ninja) =========================
function startCatchFish(container) {
    container.innerHTML = '';
    const gs = getGameState();
    const best = gs.gameRecords?.catchFish || 0;

    const canvas = document.createElement('canvas');
    canvas.width = 350;
    canvas.height = 450;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '16px';
    canvas.style.background = 'linear-gradient(180deg, #0C4A6E 0%, #0369A1 60%, #0A2A40 100%)';

    const scoreEl = document.createElement('div');
    scoreEl.className = 'game-hud';
    scoreEl.innerHTML = `<span>🐟 <b id="cfScore">0</b></span><span>⏱️ <b id="cfTimer">30</b>с</span><span>🏆 <b>${best}</b></span>`;

    container.appendChild(scoreEl);
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    let items = [];
    let score = 0;
    let timeLeft = 30;
    let gameOver = false;
    let animFrame;
    let spawnTimer;

    function spawnItem() {
        const types = [
            {emoji: '🐟', points: 1, speed: 1.5, size: 30},
            {emoji: '🐠', points: 2, speed: 2, size: 28},
            {emoji: '🐡', points: 3, speed: 1.2, size: 34},
            {emoji: '🦐', points: 1, speed: 2.5, size: 24},
            {emoji: '💣', points: -3, speed: 1.8, size: 28},
            {emoji: '💎', points: 5, speed: 2.2, size: 22},
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        items.push({
            x: Math.random() * (w - type.size),
            y: h + type.size,
            vy: -(type.speed + Math.random()),
            vx: (Math.random() - 0.5) * 0.8,
            ...type,
            opacity: 1,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        // Пузырьки фона
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i < 10; i++) {
            const bx = (i * 37 + 10) % w;
            const by = (performance.now() / 200 + i * 90) % h;
            ctx.beginPath();
            ctx.arc(bx, by, 3 + i % 5, 0, Math.PI * 2);
            ctx.fill();
        }

        items.forEach(item => {
            ctx.font = `${item.size}px serif`;
            ctx.globalAlpha = item.opacity;
            ctx.fillText(item.emoji, item.x, item.y);
            ctx.globalAlpha = 1;
        });

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = 'bold 20px Nunito';
            ctx.fillText('Время вышло!', w / 2, h / 2 - 10);
            ctx.font = '14px Nunito';
            ctx.fillText('Нажми для перезапуска', w / 2, h / 2 + 25);
        }
    }

    function loop() {
        if (gameOver) return;
        items.forEach(item => {
            item.y += item.vy;
            item.x += item.vx;
        });
        items = items.filter(item => item.y > -50 && item.opacity > 0);
        draw();
        animFrame = requestAnimationFrame(loop);
    }

    function tickTimer() {
        if (gameOver) return;
        timeLeft--;
        const timerEl = document.getElementById('cfTimer');
        if (timerEl) timerEl.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }

    function endGame() {
        gameOver = true;
        clearInterval(spawnTimer);
        clearInterval(tickInterval);
        cancelAnimationFrame(animFrame);
        draw();
        saveGameRecord('catchFish', score);
        if (score > 5) addGameCoins(Math.floor(score / 2));
        if (score >= 50) unlockAchievement('gameMaster', () => {});
        onGameOver();
    }

    canvas.addEventListener('click', (e) => {
        if (gameOver) {
            startCatchFish(container);
            return;
        }
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            const dx = mx - (item.x + item.size / 2);
            const dy = my - (item.y - item.size / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < item.size) {
                score = Math.max(0, score + item.points);
                document.getElementById('cfScore').textContent = score;
                // Эффект попадания
                const fx = document.createElement('span');
                fx.className = 'game-particle';
                fx.textContent = item.points > 0 ? '+' + item.points : item.points;
                fx.style.left = e.clientX + 'px';
                fx.style.top = e.clientY + 'px';
                fx.style.color = item.points > 0 ? '#10B981' : '#EF4444';
                fx.style.position = 'fixed';
                fx.style.pointerEvents = 'none';
                fx.style.fontWeight = 'bold';
                fx.style.fontSize = '18px';
                fx.style.zIndex = '999';
                fx.style.animation = 'floatUp 1s ease forwards';
                document.body.appendChild(fx);
                setTimeout(() => fx.remove(), 1000);
                items.splice(i, 1);
                break;
            }
        }
    });

    draw();
    loop();
    spawnTimer = setInterval(spawnItem, 700);
    const tickInterval = setInterval(tickTimer, 1000);
}

// ========================= ИГРА #4: КОТ БЕЖИТ (Runner) =========================
function startCatRun(container) {
    container.innerHTML = '';
    const gs = getGameState();
    const best = gs.gameRecords?.catRun || 0;

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 220;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '16px';
    canvas.style.background = 'linear-gradient(180deg, #7C3AED 0%, #A78BFA 60%, #C4B5FD 100%)';

    const scoreEl = document.createElement('div');
    scoreEl.className = 'game-hud';
    scoreEl.innerHTML = `<span>🏃 <b id="crScore">0</b></span><span>🏆 <b>${best}</b></span>`;

    const jumpBtn = document.createElement('button');
    jumpBtn.className = 'game-jump-btn';
    jumpBtn.textContent = '⬆️ ПРЫГ';

    container.appendChild(scoreEl);
    container.appendChild(canvas);
    container.appendChild(jumpBtn);

    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const groundY = h - 40;

    let cat = {x: 50, y: groundY - 30, vy: 0, width: 40, height: 34, jumping: false};
    let obstacles = [];
    let coins = [];
    let score = 0;
    let speed = 4;
    let gameOver = false;
    let animFrame;
    let frameCount = 0;

    function spawnObstacle() {
        const types = [
            {emoji: '📦', width: 30, height: 30},
            {emoji: '🪨', width: 28, height: 26},
            {emoji: '🕳️', width: 40, height: 20},
            {emoji: '🌵', width: 22, height: 36},
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        obstacles.push({x: w + 40, y: groundY - type.height, ...type});
    }

    function spawnCoin() {
        coins.push({x: w + 40 + Math.random() * 80, y: groundY - 60 - Math.random() * 40, size: 20});
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        // Земля
        ctx.fillStyle = '#2DD4BF';
        ctx.fillRect(0, groundY, w, h - groundY);
        ctx.fillStyle = '#14B8A6';
        for (let i = 0; i < 10; i++) {
            ctx.fillRect((i * 40 + frameCount * 2) % w, groundY, 20, 3);
        }

        // Препятствия
        obstacles.forEach(o => {
            ctx.font = `${o.height}px serif`;
            ctx.fillText(o.emoji, o.x, o.y + o.height);
        });

        // Монетки
        coins.forEach(c => {
            ctx.font = `${c.size}px serif`;
            ctx.fillText('💎', c.x, c.y);
        });

        // Кот
        ctx.save();
        const catY = cat.y + (cat.jumping ? 0 : Math.sin(frameCount * 0.2) * 2);
        ctx.font = `${cat.height}px serif`;
        ctx.fillText('🐱', cat.x, catY + cat.height);
        ctx.restore();

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = 'bold 20px Nunito';
            ctx.fillText('Котик споткнулся!', w / 2, h / 2 - 10);
            ctx.font = '14px Nunito';
            ctx.fillText('Нажми для перезапуска', w / 2, h / 2 + 20);
        }
    }

    function jump() {
        if (!cat.jumping) {
            cat.vy = -10;
            cat.jumping = true;
        }
    }

    function loop() {
        if (gameOver) return;
        frameCount++;

        // Гравитация
        if (cat.jumping) {
            cat.vy += 0.7;
            cat.y += cat.vy;
            if (cat.y >= groundY - cat.height) {
                cat.y = groundY - cat.height;
                cat.jumping = false;
                cat.vy = 0;
            }
        }

        // Препятствия движутся
        obstacles.forEach(o => o.x -= speed);
        coins.forEach(c => c.x -= speed);

        // Коллизия с препятствиями
        for (const o of obstacles) {
            if (cat.x + cat.width - 10 > o.x && cat.x + 10 < o.x + o.width &&
                cat.y + cat.height - 5 > o.y && cat.y + 5 < o.y + o.height) {
                endGame();
                return;
            }
        }

        // Сбор монеток
        coins = coins.filter(c => {
            if (cat.x + cat.width - 10 > c.x && cat.x + 10 < c.x + c.size &&
                cat.y + cat.height > c.y - c.size && cat.y < c.y + c.size) {
                score += 3;
                addGameCoins(1);
                return false;
            }
            return true;
        });

        // Очистка
        obstacles = obstacles.filter(o => o.x > -60);
        coins = coins.filter(c => c.x > -30);

        // Спавн
        if (frameCount % 80 === 0) spawnObstacle();
        if (frameCount % 40 === 0 && Math.random() < 0.4) spawnCoin();

        // Счёт
        score += 0.1;
        speed = 4 + score / 50;
        const scEl = document.getElementById('crScore');
        if (scEl) scEl.textContent = Math.floor(score);

        draw();
        animFrame = requestAnimationFrame(loop);
    }

    function endGame() {
        gameOver = true;
        cancelAnimationFrame(animFrame);
        draw();
        const finalScore = Math.floor(score);
        saveGameRecord('catRun', finalScore);
        if (finalScore > 20) addGameCoins(Math.floor(finalScore / 10));
        if (finalScore >= 150) unlockAchievement('gameMaster', () => {});
        onGameOver();
    }

    jumpBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); jump(); });
    document.addEventListener('keydown', onRunKey);
    function onRunKey(e) {
        if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); jump(); }
    }

    canvas.addEventListener('click', (e) => {
        if (!gameOver) jump();
        else {
            document.removeEventListener('keydown', onRunKey);
            startCatRun(container);
        }
    });

    draw();
    loop();
}

// ========================= ИГРА #5: ПАЗЛЫ (Скользящие плитки) =========================
function startPuzzle(container) {
    container.innerHTML = '';
    const gs = getGameState();
    const best = gs.gameRecords?.puzzle || 0;

    const size = 3; // 3x3 сетка
    const tileSize = 100;
    const canvas = document.createElement('canvas');
    canvas.width = tileSize * size;
    canvas.height = tileSize * size;
    canvas.style.width = '100%';
    canvas.style.maxWidth = '320px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '16px';
    canvas.style.background = '#0F172A';

    const infoEl = document.createElement('div');
    infoEl.className = 'game-hud';
    infoEl.innerHTML = `<span>🧩 Ходы: <b id="pzMoves">0</b></span><span>🏆 <b>${best}</b></span>`;

    const shuffleBtn = document.createElement('button');
    shuffleBtn.className = 'game-jump-btn';
    shuffleBtn.style.margin = '10px auto';
    shuffleBtn.style.display = 'block';
    shuffleBtn.textContent = '🔀 Перемешать';

    container.appendChild(infoEl);
    container.appendChild(canvas);
    container.appendChild(shuffleBtn);

    const ctx = canvas.getContext('2d');
    const emojis = ['🐱', '📚', '🧮', '📝', '🏆', '💎', '🌟', '🎓'];
    let tiles = [...emojis, '⬛']; // пустая клетка
    let emptyIndex = tiles.length - 1;
    let moves = 0;

    function shuffle() {
        // Обратимые перемешивания — делаем случайные ходы
        for (let i = 0; i < 100; i++) {
            const neighbors = getNeighbors(emptyIndex);
            const swapIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
            [tiles[emptyIndex], tiles[swapIdx]] = [tiles[swapIdx], tiles[emptyIndex]];
            emptyIndex = swapIdx;
        }
        moves = 0;
        document.getElementById('pzMoves').textContent = '0';
        draw();
    }

    function getNeighbors(idx) {
        const row = Math.floor(idx / size);
        const col = idx % size;
        const neighbors = [];
        if (row > 0) neighbors.push(idx - size);
        if (row < size - 1) neighbors.push(idx + size);
        if (col > 0) neighbors.push(idx - 1);
        if (col < size - 1) neighbors.push(idx + 1);
        return neighbors;
    }

    function isSolved() {
        return tiles.slice(0, -1).every((t, i) => t === emojis[i]) && tiles[tiles.length - 1] === '⬛';
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        tiles.forEach((emoji, idx) => {
            const row = Math.floor(idx / size);
            const col = idx % size;
            const x = col * tileSize;
            const y = row * tileSize;

            if (emoji === '⬛') {
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 2, tileSize - 4, tileSize - 4, 12);
                ctx.fill();
            } else {
                ctx.fillStyle = '#1E293B';
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 2, tileSize - 4, tileSize - 4, 12);
                ctx.fill();
                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.roundRect(x + 4, y + 4, tileSize - 8, tileSize - 8, 10);
                ctx.fill();
                ctx.font = '40px serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(emoji, x + tileSize / 2, y + tileSize / 2);
                ctx.textAlign = 'start';
                ctx.textBaseline = 'alphabetic';
            }
        });
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        const col = Math.floor(mx / tileSize);
        const row = Math.floor(my / tileSize);
        const clickedIdx = row * size + col;

        if (getNeighbors(emptyIndex).includes(clickedIdx)) {
            [tiles[emptyIndex], tiles[clickedIdx]] = [tiles[clickedIdx], tiles[emptyIndex]];
            emptyIndex = clickedIdx;
            moves++;
            document.getElementById('pzMoves').textContent = moves;
            draw();

            if (isSolved()) {
                setTimeout(() => {
                    const reward = Math.max(1, Math.floor(100 / moves));
                    addGameCoins(reward);
                    showToast('🧩', `Пазл собран за ${moves} ходов! +${reward}💎`, $('#toast'));
                    saveGameRecord('puzzle', moves);
                    shuffle();
                }, 400);
            }
        }
    });

    shuffleBtn.addEventListener('click', shuffle);

    // Начальное перемешивание
    shuffle();
}
// ========================= ИГРА #6: ОТКРЫТКА ПИТОМЦА (не игра, а маленький бонус) =========================
function renderPetCard(container) {
    container.innerHTML = `
        <div style="text-align:center;padding:10px;">
            <div style="font-size:60px;animation:catBreathe 3s ease-in-out infinite;">🐱</div>
            <p style="margin:8px 0;color:var(--text-light);font-size:13px;">
                Твой питомец ждёт тебя во вкладке <b>Профиль</b>!
            </p>
            <p style="font-size:11px;color:var(--text-light);">
                Там можно гладить, кормить и наряжать 🎀
            </p>
        </div>`;
}
// ========================= РЕНДЕР ПАНЕЛИ ИГР =========================
export function renderGames() {
    const container = $('#gamesContent');
    if (!container) return;

    const gs = getGameState();
    const coins = gs.gameCoins || 0;

    let html = `
    <div class="profile-section" style="margin-top:0;">
        <div class="profile-section-title">
            <span>🎮</span> Мини-игры
            <span class="section-badge" style="font-size:13px;">💎 ${coins}</span>
        </div>
        <p style="font-size:11px;color:var(--text-light);margin:-4px 0 10px;">
            Играй и зарабатывай самоцветы!
        </p>
        <div class="games-grid">`;

    const games = [
        {id: 'kotyTail', name: 'КотоХвост', emoji: '🐍', desc: 'Змейка с котом', color: '#10B981', start: startKotyTail},
        {id: 'catJump', name: 'Кот Прыг', emoji: '⬆️', desc: 'Прыгай по платформам', color: '#3B82F6', start: startCatJump},
        {id: 'catchFish', name: 'Лови Рыбку', emoji: '🐟', desc: 'Лови рыбу, избегай бомб', color: '#0EA5E9', start: startCatchFish},
        {id: 'catRun', name: 'Кот Бежит', emoji: '🏃', desc: 'Беги и уворачивайся', color: '#7C3AED', start: startCatRun},
        {id: 'puzzle', name: 'Пазлы', emoji: '🧩', desc: 'Собери картинку', color: '#F59E0B', start: startPuzzle},
    ];

    games.forEach(g => {
        const best = gs.gameRecords?.[g.id];
        html += `
        <div class="game-card" data-game="${g.id}" style="border-left:3px solid ${g.color};">
            <div class="game-card-emoji">${g.emoji}</div>
            <div class="game-card-name">${g.name}</div>
            <div class="game-card-desc">${g.desc}</div>
            ${best !== undefined ? `<div class="game-card-best">🏆 ${best}</div>` : ''}
            <button class="game-card-btn" style="background:${g.color};">Играть</button>
        </div>`;
    });

    html += `
        </div>
    </div>
    <div id="gameArea" style="margin-top:8px;"></div>`;

    container.innerHTML = html;

    // Привязка кнопок
    $$('.game-card').forEach(card => {
        const btn = card.querySelector('.game-card-btn');
        const gameId = card.dataset.game;
        const game = games.find(g => g.id === gameId);
        if (!game) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const area = $('#gameArea');
            game.start(area);
            area.scrollIntoView({behavior: 'smooth'});
        });
    });
}