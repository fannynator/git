import { state, findSkillById } from './state.js';

export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => parent.querySelectorAll(selector);

export const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
export const lcm = (a, b) => a * b / gcd(a, b);

/**
 * Адаптивный диапазон: сдвигает верхнюю границу в зависимости от уровня сложности.
 * @param {number} baseMin — минимальное значение (обычно не меняется)
 * @param {number} baseMax — базовый максимум (для difficultyLevel=0)
 * @param {number} step — шаг расширения за уровень (умножается на difficultyLevel)
 * @returns {[number, number]} [min, max]
 */
export const adaptiveRange = (baseMin, baseMax, step = 0) => {
    const lvl = state.difficultyLevel || 0;
    const max = step > 0 ? baseMax + step * lvl : baseMax;
    return [baseMin, Math.max(baseMax, max)];
};

/**
 * Получить прогресс навыка (0–100) для текущего предмета и id навыка.
 */
export const getSkillProgress = (skillId) => {
    const found = findSkillById(skillId);
    return found ? found.skill.progress : 0;
};

/**
 * Вариативная длина урока (6–10 заданий).
 * Босс-задание всегда остаётся последним, если есть.
 */
export const trimLesson = (t) => {
    const count = rnd(6, Math.min(10, t.length));
    if (count >= t.length) return t;
    const last = t[t.length - 1];
    const isBoss = last && (
        (typeof last.type === 'string' && (last.type === 'boss' || last.type.startsWith('boss_'))) ||
        last.badge === 'Босс' || last.badgeClass === 'badge-boss'
    );
    if (isBoss) {
        return [...t.slice(0, count - 1), last];
    }
    return t.slice(0, count);
};

export const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

export const showToast = (emoji, message, toastEl) => {
    if (!toastEl) return;
    toastEl.innerHTML = `<span>${emoji}</span> ${message}`;
    toastEl.classList.add('show');
    clearTimeout(toastEl._tid);
    toastEl._tid = setTimeout(() => toastEl.classList.remove('show'), 2000);
};

/** Всплывающие +XP частицы */
export function spawnXP(amount, x, y, parent = document.body) {
    const el = document.createElement('div');
    el.className = 'xp-particle';
    el.textContent = `+${amount} 💎`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    parent.appendChild(el);
    setTimeout(() => el.remove(), 1300);
}

/** Lottie-анимация */
export function playLottie(container, animationUrl, options = {}) {
    if (!window.lottie || !container) return;
    const anim = window.lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: options.loop ?? false,
        autoplay: true,
        path: animationUrl
    });
    if (options.onComplete) anim.addEventListener('complete', options.onComplete);
    return anim;
}

export const makeWrongs = (correct, count = 3) => {
    const wrongs = new Set();
    while (wrongs.size < count) {
        let delta;
        if (correct <= 10) delta = rnd(-3, 3);
        else if (correct <= 50) delta = rnd(-Math.floor(correct * 0.3), Math.floor(correct * 0.3));
        else delta = rnd(-Math.floor(correct * 0.2), Math.floor(correct * 0.2));
        const candidate = correct + delta;
        if (candidate !== correct && candidate >= 0 && !wrongs.has(candidate)) wrongs.add(candidate);
    }
    return [...wrongs];
};

/** Создать неправильные варианты из пула (для русского) */
export const makeStringWrongs = (correct, pool, count = 3) => {
    const others = [...new Set(pool.filter(x => x !== correct))];
    const shuf = shuffle(others);
    return shuf.slice(0, Math.min(count, shuf.length));
};

export const choiceT = (emoji, badge, badgeClass, question, correct, explanation) => {
    const allOptions = [correct, ...makeWrongs(correct)];
    const options = shuffle(allOptions);
    const correctIdx = options.findIndex(opt => opt === correct);
    return { type: 'choice', emoji, badge, badgeClass, question, options, correctIdx, correctAns: correct, explanation };
};

/** choice с заранее заданными вариантами (для строк) */
export const choiceStrT = (emoji, badge, badgeClass, question, correct, wrongPool, count, explanation) => {
    const wrongs = makeStringWrongs(correct, wrongPool, count);
    const allOptions = shuffle([correct, ...wrongs]);
    const correctIdx = allOptions.findIndex(opt => opt === correct);
    return { type: 'choice', emoji, badge, badgeClass, question, options: allOptions, correctIdx, correctAns: correct, explanation };
};

export const inputT = (emoji, badge, badgeClass, question, correct, explanation) => {
    return { type: 'input', emoji, badge, badgeClass, question, correctAns: correct, explanation };
};

export const pairT = (emoji, badge, badgeClass, question, pairs, explanation) => {
    return { type: 'pair', emoji, badge, badgeClass, question, pairs, explanation };
};

/** Визуальное задание: SVG + выбор ответа */
export const visualT = (emoji, badge, badgeClass, svg, question, correct, options, explanation) => {
    // Гарантируем, что правильный ответ есть среди вариантов
    const allOpts = options.includes(correct) ? options : [correct, ...options];
    const uniqueOpts = [...new Set(allOpts)];
    const correctIdx = uniqueOpts.findIndex(opt => opt === correct);
    return { type: 'visual', emoji, badge, badgeClass, svg, question, options: uniqueOpts, correctIdx, correctAns: correct, explanation };
};

/** Задание «Расставь по порядку» — drag/drop или кнопки сортировки */
export const orderingT = (emoji, badge, badgeClass, question, items, explanation) => {
    const correctOrder = [...items]; // items уже в правильном порядке
    const shuffled = shuffle(items);
    return { type: 'ordering', emoji, badge, badgeClass, question, items: shuffled, correctOrder, explanation };
};

/** Обёртка для добавления подсказки к любому заданию */
export const hintT = (task, hintText) => {
    return { ...task, hint: hintText };
};

/** Автоматически сгенерировать текст подсказки для задания */
export const generateHintText = (task) => {
    if (task.hint) return task.hint;
    const type = task.type;
    if (type === 'choice' || type === 'visual') {
        const ans = String(task.correctAns || task.options?.[task.correctIdx] || '');
        return `Правильный ответ: «${ans}». Подумай почему!`;
    }
    if (type === 'input') {
        const ans = String(task.correctAns || '');
        if (ans.length <= 2) return `Ответ — «${ans}». Запомни правило!`;
        return `Ответ начинается с «${ans[0]}…». Длина: ${ans.length} симв.`;
    }
    if (type === 'pair') {
        if (task.pairs && task.pairs.length > 0) {
            const p = task.pairs[0];
            return `Пример: «${p.left}» ↔ «${p.right}». Сопоставь остальные так же.`;
        }
    }
    if (type === 'ordering') {
        if (task.correctOrder && task.correctOrder.length > 0) {
            return `Первый элемент: «${task.correctOrder[0]}». Расставь всё по порядку.`;
        }
    }
    if (type === 'boss') {
        if (task.tasks && task.tasks.length > 0) {
            const subtask = task.tasks[0];
            return `${subtask.label || subtask.question || 'Первое задание'}: ответ — «${subtask.correctAns}».`;
        }
        if (task.words && task.words.length > 0) {
            const w = task.words[0];
            return `«${w.text}» → ${w.answer}. ${w.hint || 'Вспомни правило.'}`;
        }
    }
    return 'Подумай ещё раз. Ты сможешь!';
};

/** Босс-задание: несколько подзаданий с индивидуальным фидбеком */
export const bossT = (emoji, badge, badgeClass, question, tasks, explanation) => {
    return { type: 'boss', emoji, badge, badgeClass, question, tasks, explanation };
};
