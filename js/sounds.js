// js/sounds.js

// Звуки через Web Audio API — генерация прямо в браузере, без файлов
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

/**
 * Правильный ответ — приятный восходящий «дзынь» (как в Duolingo)
 */
function playCorrectSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Первый тон (выше)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5 (до)
        osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5 (ми) — поднимается
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.3);

        // Второй тон (ещё выше, наслаивается)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc2.frequency.setValueAtTime(783.99, now + 0.18); // G5 (соль) — кульминация
        gain2.gain.setValueAtTime(0.2, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.45);

    } catch (e) {
        // Ничего не делаем — без звука тоже работает
    }
}

/**
 * Неправильный ответ — низкий нисходящий «брум» (как в Duolingo)
 */
function playWrongSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Основной тон — падает вниз
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now); // A3 (ля)
        osc.frequency.linearRampToValueAtTime(110, now + 0.35); // A2 — опускается на октаву
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);

        // Лёгкая вибрация для эффекта «неправильно»
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(180, now);
        osc2.frequency.linearRampToValueAtTime(90, now + 0.35);
        gain2.gain.setValueAtTime(0.1, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.35);

    } catch (e) {
        // Ничего
    }
}

/**
 * Достижение — фанфары (как при повышении уровня)
 */
function playAchievementSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Три восходящие ноты с наложением
        const notes = [
            { freq: 523.25, time: 0 },     // C5
            { freq: 659.25, time: 0.12 },   // E5
            { freq: 783.99, time: 0.24 }    // G5
        ];

        notes.forEach(({ freq, time }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + time);
            gain.gain.setValueAtTime(0.22, now + time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + time + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + time);
            osc.stop(now + time + 0.35);
        });

        // Финальный аккорд
        const chordNotes = [523.25, 659.25, 783.99]; // C-E-G (до мажор)
        chordNotes.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + 0.5);
            gain.gain.setValueAtTime(0.15, now + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + 0.5);
            osc.stop(now + 0.9);
        });

    } catch (e) {
        // Ничего
    }
}

/**
 * Погладить кота — короткое «мур»
 */
function playPetSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Мягкое вибрато — имитация мурчания
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(350, now + 0.15);
        osc.frequency.linearRampToValueAtTime(280, now + 0.3);

        // LFO для вибрации (дрожание частоты)
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(8, now);
        lfoGain.gain.setValueAtTime(20, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        lfo.start(now);
        lfo.stop(now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);

    } catch (e) {
        // Ничего
    }
}

/**
 * Проиграть звук по типу
 * @param {'correct'|'wrong'|'achievement'|'pet'} type
 */
export function playSound(type) {
    switch (type) {
        case 'correct':
            playCorrectSound();
            break;
        case 'wrong':
            playWrongSound();
            break;
        case 'achievement':
            playAchievementSound();
            break;
        case 'pet':
            playPetSound();
            break;
    }
}