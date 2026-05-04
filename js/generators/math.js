// js/generators/math.js

import { rnd, shuffle, makeWrongs, choiceT, inputT, pairT } from '../utils.js';

/**
 * Генерация урока "Сложение"
 */
export function generateAddLesson() {
    const t = [];
    const g = () => [rnd(2, 20), rnd(2, 20)];
    const add = (a, b) => a + b;

    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${g()[0]} + ${g()[1]} = ?`, add(g()[0], g()[1]), 'Складываем'));
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', `Яблоки: ${g()[0]} + ${g()[1]}`, add(g()[0], g()[1]), 'Складываем'));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${g()[0]} + ${g()[1]} = ?`, add(g()[0], g()[1]), 'Складываем'));

    const pd = [];
    const ua = new Set();
    while (pd.length < 3) {
        const [a, b] = g();
        const ans = add(a, b);
        if (!ua.has(ans)) {
            ua.add(ans);
            pd.push({ left: `${a} + ${b}`, right: `${ans}`, answer: ans });
        }
    }
    t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини:', pd, ''));

    const tn = rnd(5, 20);
    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', `${tn} + 0 = ?`, tn, 'Число + 0 = число!'));

    t.push(inputT('✏️', 'Ввод', 'badge-input', `${g()[0]} + ${g()[1]} = ?`, add(g()[0], g()[1]), 'Складываем'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${g()[0]} + ${g()[1]} = ?`, add(g()[0], g()[1]), 'Складываем'));

    const [c1, c2] = [rnd(10, 50), rnd(10, 50)];
    t.push(inputT('⭐', 'Босс', 'badge-boss', `У Маши ${c1} руб, у Пети ${c2} руб. Вместе?`, add(c1, c2), `${c1}+${c2}=${add(c1, c2)}`));

    return t;
}

/**
 * Генерация урока "Вычитание"
 */
export function generateSubLesson() {
    const t = [];
    const g = () => {
        const x = rnd(10, 40);
        const y = rnd(1, x - 1);
        return [x, y];
    };
    const sub = (a, b) => a - b;

    const [a1, b1] = g();
    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${a1} - ${b1} = ?`, sub(a1, b1), 'Вычитаем'));
    const [a2, b2] = g();
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', `Было ${a2} 🍎, съели ${b2}`, sub(a2, b2), 'Вычитаем'));
    const [a3, b3] = g();
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${a3} - ${b3} = ?`, sub(a3, b3), 'Вычитаем'));

    const pd = [];
    const ua = new Set();
    while (pd.length < 3) {
        const [a, b] = g();
        const ans = sub(a, b);
        if (!ua.has(ans)) {
            ua.add(ans);
            pd.push({ left: `${a} - ${b}`, right: `${ans}`, answer: ans });
        }
    }
    t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини:', pd, ''));

    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', `${rnd(10, 30)} - ${rnd(10, 30)} = ?`, 0, 'Одинаковые числа — 0!'));

    const [a6, b6] = g();
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${a6} - ${b6} = ?`, sub(a6, b6), 'Вычитаем'));
    const [a7, b7] = g();
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${a7} - ${b7} = ?`, sub(a7, b7), 'Вычитаем'));

    const [tot, sp] = [rnd(30, 80), rnd(5, 30)];
    t.push(inputT('⭐', 'Босс', 'badge-boss', `Было ${tot} руб, потратили ${sp} руб. Осталось?`, sub(tot, sp), `${tot}-${sp}=${sub(tot, sp)}`));

    return t;
}

/**
 * Генерация урока "Умножение"
 */
export function generateMulLesson() {
    const t = [];
    const g = () => [rnd(2, 10), rnd(2, 10)];
    const mul = (a, b) => a * b;

    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${g()[0]} × ${g()[1]} = ?`, mul(g()[0], g()[1]), 'Умножаем'));
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', `${g()[0]} группы по ${g()[1]} 🍎`, mul(g()[0], g()[1]), 'Умножаем'));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${g()[0]} × ${g()[1]} = ?`, mul(g()[0], g()[1]), 'Умножаем'));

    const pd = [];
    const ua = new Set();
    while (pd.length < 3) {
        const [a, b] = g();
        const ans = mul(a, b);
        if (!ua.has(ans)) {
            ua.add(ans);
            pd.push({ left: `${a} × ${b}`, right: `${ans}`, answer: ans });
        }
    }
    t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини:', pd, ''));

    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', `${rnd(2, 9)} × 0 = ?`, 0, 'Любое × 0 = 0!'));

    t.push(inputT('✏️', 'Ввод', 'badge-input', `${g()[0]} × ${g()[1]} = ?`, mul(g()[0], g()[1]), 'Умножаем'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${g()[0]} × ${g()[1]} = ?`, mul(g()[0], g()[1]), 'Умножаем'));

    const [sh, bs] = [rnd(2, 5), rnd(4, 10)];
    t.push(inputT('⭐', 'Босс', 'badge-boss', `${sh} полки по ${bs} книг. Всего?`, mul(sh, bs), `${sh}×${bs}=${mul(sh, bs)}`));

    return t;
}

/**
 * Генерация урока "Деление"
 */
export function generateDivLesson() {
    const t = [];
    const g = () => {
        const b = rnd(2, 9);
        const c = rnd(2, 9);
        return [b * c, b];
    };
    const div = (a, b) => a / b;

    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${g()[0]} ÷ ${g()[1]} = ?`, div(g()[0], g()[1]), 'Делим'));
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', `${g()[0]} 🍎 на ${g()[1]} корзины`, div(g()[0], g()[1]), 'Делим'));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${g()[0]} ÷ ${g()[1]} = ?`, div(g()[0], g()[1]), 'Делим'));

    const pd = [];
    const ua = new Set();
    while (pd.length < 3) {
        const b = rnd(2, 8);
        const c = rnd(2, 8);
        const a = b * c;
        const ans = c;
        if (!ua.has(ans)) {
            ua.add(ans);
            pd.push({ left: `${a} ÷ ${b}`, right: `${ans}`, answer: ans });
        }
    }
    t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини:', pd, ''));

    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', `0 ÷ ${rnd(2, 9)} = ?`, 0, '0 ÷ число = 0!'));

    t.push(inputT('✏️', 'Ввод', 'badge-input', `${g()[0]} ÷ ${g()[1]} = ?`, div(g()[0], g()[1]), 'Делим'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${g()[0]} ÷ ${g()[1]} = ?`, div(g()[0], g()[1]), 'Делим'));

    const [tot, fr] = [rnd(20, 60), rnd(2, 6)];
    const ans = Math.floor(tot / fr);
    const rem = tot - ans * fr;
    t.push(inputT('⭐', 'Босс', 'badge-boss', `${tot} конфет на ${fr} друзей. По сколько? (ост.${rem})`, ans, `${tot}÷${fr}=${ans}`));

    return t;
}

/**
 * Генерация урока "Уравнения"
 */
export function generateEqLesson() {
    const t = [];
    const g = () => {
        const x = rnd(2, 15);
        const a = rnd(1, 10);
        return [x, a, x + a];
    };

    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `x + ${g()[1]} = ${g()[2]}. x = ?`, g()[0], `x = ${g()[2]} - ${g()[1]}`));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', 'x - 5 = 3. x = ?', 8, 'x = 3 + 5'));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', '3 × x = 15. x = ?', 5, 'x = 15 ÷ 3'));

    const pd = [];
    const ua = new Set();
    while (pd.length < 3) {
        const x = rnd(2, 12);
        const a = rnd(1, 8);
        if (!ua.has(x)) {
            ua.add(x);
            pd.push({ left: `x + ${a} = ${x + a}`, right: `x = ${x}`, answer: x });
        }
    }
    t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини:', pd, ''));

    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', 'x + 0 = 7. x = ?', 7, 'x + 0 = x!'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', 'x + 3 = 10. x = ?', 7, 'x = 10 - 3'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', '4 × x = 20. x = ?', 5, 'x = 20 ÷ 4'));
    t.push(inputT('⭐', 'Босс', 'badge-boss', 'В 3 коробках 18 яблок. В одной?', 6, '18 ÷ 3 = 6'));

    return t;
}

/**
 * Генерация урока "Периметр и площадь"
 */
export function generateGeomLesson() {
    const t = [];
    const rect = () => [rnd(2, 8), rnd(3, 10)];
    const sq = () => rnd(2, 8);

    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `Прямоугольник ${rect()[0]}×${rect()[1]}. P?`, 2 * (rect()[0] + rect()[1]), 'P=2(a+b)'));
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', `Квадрат со стороной ${sq()}. S?`, sq() * sq(), 'S=a²'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', `Прямоугольник ${rect()[0]}×${rect()[1]}. P?`, 2 * (rect()[0] + rect()[1]), 'P=2(a+b)'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', `Квадрат ${sq()}. S?`, sq() * sq(), 'S=a²'));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', `Прямоугольник ${rect()[0]}×${rect()[1]}. S?`, rect()[0] * rect()[1], 'S=a×b'));
    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', `Квадрат ${sq()}. P?`, 4 * sq(), 'P=4a, не a²!'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', `Прямоугольник ${rect()[0]}×${rect()[1]}. S?`, rect()[0] * rect()[1], 'S=a×b'));

    const [rw, rh] = [rnd(4, 10), rnd(3, 8)];
    t.push(inputT('⭐', 'Босс', 'badge-boss', `Комната ${rw}×${rh} м. P и S (через запятую)`, `${2 * (rw + rh)},${rw * rh}`, `P=${2 * (rw + rh)}, S=${rw * rh}`));

    return t;
}

/**
 * Генерация урока "Дроби"
 */
export function generateFracLesson() {
    const t = [];
    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', 'Какая дробь больше: 1/3 или 2/3?', '2/3', 'Больше числитель → больше дробь'));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', '1/2 от 10?', 5, '10÷2=5'));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', 'Сократи: 2/4', '1/2', 'Делим на 2'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', 'Сократи: 3/9 (как 1/3)', '1/3', 'Делим на 3'));
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', 'Пицца на 8 частей, съели 3. Осталось?', '5/8', '8-3=5 → 5/8'));
    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', '1/2 + 1/2 = ?', '1', '2/2 = 1! Не 2/4!'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', '1/3 от 12?', 4, '12÷3=4'));
    t.push(inputT('⭐', 'Босс', 'badge-boss', 'Торт на 6 частей, 2 съели. Осталось? (как 4/6)', '4/6', '6-2=4 → 4/6'));
    return t;
}

/**
 * Диспетчер: возвращает задания для конкретного навыка математики
 * @param {string} skillId
 * @returns {Array}
 */
export function generateMathLesson(skillId) {
    const generators = {
        add: generateAddLesson,
        sub: generateSubLesson,
        mul: generateMulLesson,
        div: generateDivLesson,
        eq: generateEqLesson,
        geom: generateGeomLesson,
        frac: generateFracLesson
    };
    
    const gen = generators[skillId];
    return gen ? gen() : generateAddLesson();
}