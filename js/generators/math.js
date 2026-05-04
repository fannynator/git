// js/generators/math.js

import { rnd, shuffle, makeWrongs, choiceT, inputT, pairT } from '../utils.js';

/**
 * Генерация урока "Сложение"
 */
export function generateAddLesson() {
    const t = [];
    const g = () => [rnd(2, 20), rnd(2, 20)];
    const add = (a, b) => a + b;

    // 1. Разминка
    const [a1, b1] = g();
    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${a1} + ${b1} = ?`, add(a1, b1), 'Складываем числа'));

    // 2. Визуальное
    const [a2, b2] = g();
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', `Яблоки: ${a2} + ${b2}`, add(a2, b2), 'Считаем яблоки'));

    // 3. Выбор
    const [a3, b3] = g();
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${a3} + ${b3} = ?`, add(a3, b3), 'Выбираем ответ'));

    // 4. Пары
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
    t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини выражения с ответами:', pd, 'Соединяем пары'));

    // 5. Ловушка
    const tn = rnd(5, 20);
    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', `${tn} + 0 = ?`, tn, 'Число + 0 = число!'));

    // 6-7. Ввод
    const [a6, b6] = g();
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${a6} + ${b6} = ?`, add(a6, b6), 'Пишем ответ'));
    const [a7, b7] = g();
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${a7} + ${b7} = ?`, add(a7, b7), 'Пишем ответ'));

    // 8. Босс
    const [c1, c2] = [rnd(10, 50), rnd(10, 50)];
    t.push(inputT('⭐', 'Босс', 'badge-boss', 
        `У Маши ${c1} руб., у Пети ${c2} руб. Сколько денег у них вместе?`, 
        add(c1, c2), 
        `${c1} + ${c2} = ${add(c1, c2)}`
    ));

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
    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${a1} - ${b1} = ?`, sub(a1, b1), 'Вычитаем числа'));

    const [a2, b2] = g();
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', `Было ${a2} 🍎, съели ${b2}. Сколько осталось?`, sub(a2, b2), 'Считаем остаток'));

    const [a3, b3] = g();
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${a3} - ${b3} = ?`, sub(a3, b3), 'Выбираем ответ'));

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
    t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини выражения с ответами:', pd, 'Соединяем пары'));

    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', `${rnd(10, 30)} - ${rnd(10, 30)} = ?`, 0, 'Одинаковые числа — будет 0!'));

    const [a6, b6] = g();
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${a6} - ${b6} = ?`, sub(a6, b6), 'Пишем ответ'));
    const [a7, b7] = g();
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${a7} - ${b7} = ?`, sub(a7, b7), 'Пишем ответ'));

    const [tot, sp] = [rnd(30, 80), rnd(5, 30)];
    t.push(inputT('⭐', 'Босс', 'badge-boss', 
        `Было ${tot} руб., потратили ${sp} руб. Сколько осталось?`, 
        sub(tot, sp), 
        `${tot} - ${sp} = ${sub(tot, sp)}`
    ));

    return t;
}

/**
 * Генерация урока "Умножение"
 */
export function generateMulLesson() {
    const t = [];
    const g = () => [rnd(2, 10), rnd(2, 10)];
    const mul = (a, b) => a * b;

    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${g()[0]} × ${g()[1]} = ?`, mul(g()[0], g()[1]), 'Умножаем числа'));
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', `${g()[0]} группы по ${g()[1]} 🍎`, mul(g()[0], g()[1]), 'Считаем группы'));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${g()[0]} × ${g()[1]} = ?`, mul(g()[0], g()[1]), 'Выбираем ответ'));

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
    t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини выражения с ответами:', pd, 'Соединяем пары'));

    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', `${rnd(2, 9)} × 0 = ?`, 0, 'Любое число × 0 = 0!'));

    t.push(inputT('✏️', 'Ввод', 'badge-input', `${g()[0]} × ${g()[1]} = ?`, mul(g()[0], g()[1]), 'Пишем ответ'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${g()[0]} × ${g()[1]} = ?`, mul(g()[0], g()[1]), 'Пишем ответ'));

    const [sh, bs] = [rnd(2, 5), rnd(4, 10)];
    t.push(inputT('⭐', 'Босс', 'badge-boss', 
        `${sh} полки по ${bs} книг. Сколько всего книг?`, 
        mul(sh, bs), 
        `${sh} × ${bs} = ${mul(sh, bs)}`
    ));

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

    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${g()[0]} ÷ ${g()[1]} = ?`, div(g()[0], g()[1]), 'Делим числа'));
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', `${g()[0]} 🍎 на ${g()[1]} корзины`, div(g()[0], g()[1]), 'Раскладываем поровну'));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${g()[0]} ÷ ${g()[1]} = ?`, div(g()[0], g()[1]), 'Выбираем ответ'));

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
    t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини выражения с ответами:', pd, 'Соединяем пары'));

    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', `0 ÷ ${rnd(2, 9)} = ?`, 0, '0 ÷ число = 0!'));

    t.push(inputT('✏️', 'Ввод', 'badge-input', `${g()[0]} ÷ ${g()[1]} = ?`, div(g()[0], g()[1]), 'Пишем ответ'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', `${g()[0]} ÷ ${g()[1]} = ?`, div(g()[0], g()[1]), 'Пишем ответ'));

    const [tot, fr] = [rnd(20, 60), rnd(2, 6)];
    const ans = Math.floor(tot / fr);
    const rem = tot - ans * fr;
    t.push(inputT('⭐', 'Босс', 'badge-boss', 
        `${tot} конфет на ${fr} друзей. По сколько каждому? (остаток ${rem})`, 
        ans, 
        `${tot} ÷ ${fr} = ${ans} (ост. ${rem})`
    ));

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

    const [x1, a1, sum1] = g();
    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `x + ${a1} = ${sum1}. x = ?`, x1, `x = ${sum1} - ${a1} = ${x1}`));

    t.push(choiceT('🎯', 'Выбор', 'badge-choice', 'x - 5 = 3. x = ?', 8, 'x = 3 + 5 = 8'));
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', '3 × x = 15. x = ?', 5, 'x = 15 ÷ 3 = 5'));

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
    t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини уравнение с ответом:', pd, 'Соединяем пары'));

    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', 'x + 0 = 7. x = ?', 7, 'x + 0 = x! Ответ: 7'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', 'x + 3 = 10. x = ?', 7, 'x = 10 - 3 = 7'));
    t.push(inputT('✏️', 'Ввод', 'badge-input', '4 × x = 20. x = ?', 5, 'x = 20 ÷ 4 = 5'));
    t.push(inputT('⭐', 'Босс', 'badge-boss', 'В 3 коробках 18 яблок. Сколько яблок в одной коробке?', 6, '18 ÷ 3 = 6'));

    return t;
}

/**
 * Генерация урока "Периметр и площадь"
 */
export function generateGeomLesson() {
    const t = [];
    const rect = () => [rnd(2, 8), rnd(3, 10)];
    const sq = () => rnd(2, 8);

    const [r1w, r1h] = rect();
    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', 
        `Прямоугольник ${r1w}×${r1h}. Периметр (P)?`, 
        2 * (r1w + r1h), 
        `P = 2 × (${r1w} + ${r1h}) = ${2 * (r1w + r1h)}`
    ));

    const s1 = sq();
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', 
        `Квадрат со стороной ${s1}. Площадь (S)?`, 
        s1 * s1, 
        `S = ${s1}² = ${s1 * s1}`
    ));

    const [r2w, r2h] = rect();
    t.push(inputT('✏️', 'Ввод', 'badge-input', 
        `Прямоугольник ${r2w}×${r2h}. P = ?`, 
        2 * (r2w + r2h), 
        `P = 2 × (${r2w} + ${r2h}) = ${2 * (r2w + r2h)}`
    ));

    const s2 = sq();
    t.push(inputT('✏️', 'Ввод', 'badge-input', 
        `Квадрат ${s2}. S = ?`, 
        s2 * s2, 
        `S = ${s2}² = ${s2 * s2}`
    ));

    const [r3w, r3h] = rect();
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', 
        `Прямоугольник ${r3w}×${r3h}. S = ?`, 
        r3w * r3h, 
        `S = ${r3w} × ${r3h} = ${r3w * r3h}`
    ));

    const s3 = sq();
    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', 
        `Квадрат ${s3}. P = ? (не путай с S!)`, 
        4 * s3, 
        `P = 4 × ${s3} = ${4 * s3}, а не ${s3}²!`
    ));

    const [r4w, r4h] = rect();
    t.push(inputT('✏️', 'Ввод', 'badge-input', 
        `Прямоугольник ${r4w}×${r4h}. S = ?`, 
        r4w * r4h, 
        `S = ${r4w} × ${r4h} = ${r4w * r4h}`
    ));

    const [rw, rh] = [rnd(4, 10), rnd(3, 8)];
    t.push(inputT('⭐', 'Босс', 'badge-boss', 
        `Комната ${rw}×${rh} м. P и S (через запятую)`, 
        `${2 * (rw + rh)},${rw * rh}`, 
        `P = 2 × (${rw} + ${rh}) = ${2 * (rw + rh)}, S = ${rw} × ${rh} = ${rw * rh}`
    ));

    return t;
}

/**
 * Генерация урока "Дроби"
 */
export function generateFracLesson() {
    const t = [];
    
    t.push(choiceT('🔥', 'Разминка', 'badge-warmup', 
        'Какая дробь больше: 1/3 или 2/3?', 
        '2/3', 
        'Больше числитель → больше дробь'
    ));
    
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', 
        '1/2 от 10?', 
        5, 
        '10 ÷ 2 = 5'
    ));
    
    t.push(choiceT('🎯', 'Выбор', 'badge-choice', 
        'Сократи дробь: 2/4', 
        '1/2', 
        'Делим числитель и знаменатель на 2'
    ));
    
    t.push(inputT('✏️', 'Ввод', 'badge-input', 
        'Сократи дробь: 3/9 (напиши как 1/3)', 
        '1/3', 
        'Делим на 3: 3÷3=1, 9÷3=3 → 1/3'
    ));
    
    t.push(choiceT('🖼️', 'Визуальное', 'badge-visual', 
        'Пицца на 8 частей, съели 3. Сколько осталось?', 
        '5/8', 
        '8 - 3 = 5 → 5/8'
    ));
    
    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap', 
        '1/2 + 1/2 = ? (не 2/4!)', 
        '1', 
        '2/2 = 1! Не складывай знаменатели!'
    ));
    
    t.push(inputT('✏️', 'Ввод', 'badge-input', 
        '1/3 от 12 = ?', 
        4, 
        '12 ÷ 3 = 4'
    ));
    
    t.push(inputT('⭐', 'Босс', 'badge-boss', 
        'Торт на 6 частей, 2 съели. Сколько осталось? (как 4/6)', 
        '4/6', 
        '6 - 2 = 4 → 4/6'
    ));

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
    const result = gen ? gen() : generateAddLesson();
    
    // Отладка: логируем первое задание
    console.log(`[math:${skillId}] Сгенерировано ${result.length} заданий. Первое:`, result[0]);
    
    return result;
}