// js/generators/russian.js

import { rnd, shuffle, choiceT, inputT, visualT, choiceStrT, pairT, orderingT, trimLesson } from '../utils.js';

// ═══════════════════════════════════════════════
//  SVG-заготовки для русского
// ═══════════════════════════════════════════════

function letterChoiceSVG(word, missingIdx, options) {
    const chars = word.split('');
    const boxSize = 28;
    const W = chars.length * boxSize + 20;
    const H = 62;
    let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    chars.forEach((ch, i) => {
        const x = 10 + i * boxSize;
        if (i === missingIdx) {
            out += `<rect x="${x}" y="10" width="${boxSize - 4}" height="${boxSize}" rx="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2" stroke-dasharray="4 2"/>
            <text x="${x + (boxSize - 4) / 2}" y="32" text-anchor="middle" font-size="16" fill="#F59E0B" font-weight="800">?</text>`;
        } else {
            out += `<text x="${x + (boxSize - 4) / 2}" y="32" text-anchor="middle" font-size="16" fill="#1E293B" font-weight="600">${ch}</text>`;
        }
    });
    out += `<text x="${W / 2}" y="58" text-anchor="middle" font-size="11" fill="#94A3B8">${options.join(' или ')}</text>`;
    out += '</svg>';
    return out;
}

export function compareSVG(word1, word2, question) {
    const W = 280; const H = 80;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <rect x="10" y="6" width="120" height="32" rx="8" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
        <text x="70" y="27" text-anchor="middle" font-size="14" fill="#1E293B" font-weight="700">${word1}</text>
        <rect x="150" y="6" width="120" height="32" rx="8" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="210" y="27" text-anchor="middle" font-size="14" fill="#1E293B" font-weight="700">${word2}</text>
        <text x="140" y="62" text-anchor="middle" font-size="12" fill="#64748B" font-weight="600">${question}</text>
    </svg>`;
}

// ═══════════════════════════════════════
//  ЖИ/ШИ, ЧА/ЩА, ЧУ/ЩУ
// ═══════════════════════════════════════
export function generateZhishiLesson() {
    const t = [];
    const fullDict = [
        { word: 'ж_раф', ans: 'и', hint: 'ЖИ пиши с И', wrong: 'ы' },
        { word: 'ш_шка', ans: 'и', hint: 'ШИ пиши с И', wrong: 'ы' },
        { word: 'маш_на', ans: 'и', hint: 'ШИ пиши с И', wrong: 'ы' },
        { word: 'ч_шка', ans: 'а', hint: 'ЧА пиши с А', wrong: 'я' },
        { word: 'щ_вель', ans: 'а', hint: 'ЩА пиши с А', wrong: 'я' },
        { word: 'ч_до', ans: 'у', hint: 'ЧУ пиши с У', wrong: 'ю' },
        { word: 'щ_ка', ans: 'у', hint: 'ЩУ пиши с У', wrong: 'ю' },
        { word: 'ж_знь', ans: 'и', hint: 'ЖИ пиши с И', wrong: 'ы' },
        { word: 'ч_деса', ans: 'у', hint: 'ЧУ пиши с У', wrong: 'ю' },
        { word: 'рощ_', ans: 'а', hint: 'ЩА пиши с А', wrong: 'я' }
    ];
    const sel = shuffle(fullDict).slice(0, 8);

    // 1. Разминка
    const d0 = sel[0];
    t.push(choiceStrT('🔥', 'Разминка', 'badge-warmup',
        `Вставь букву: «${d0.word}»`, d0.ans, [d0.wrong, 'ы', 'я'], 2, d0.hint));

    // 2. Визуальное — слово с пропущенной буквой
    const d1 = sel[1];
    const midx1 = d1.word.indexOf('_');
    const dispOpts = [d1.ans, d1.wrong];
    t.push(visualT('🖼️', 'Визуальное', 'badge-visual',
        letterChoiceSVG(d1.word.replace('_', '?'), midx1, dispOpts),
        `Какая буква на месте «?»`, d1.ans,
        shuffle([d1.ans, d1.wrong, d1.wrong === 'ы' ? 'я' : 'ы']),
        d1.hint));

    // 3. Выбор
    const d2 = sel[2];
    t.push(choiceStrT('🎯', 'Выбор', 'badge-choice',
        `«${d2.word}» — какая буква?`, d2.ans, ['и', 'а', 'у', 'ы', 'я', 'ю'], 3, d2.hint));

    // 4. Парное
    {
        const pd = [
            { left: 'ж_раф', right: 'и', answer: 'и' },
            { left: 'ч_до', right: 'у', answer: 'у' },
            { left: 'щ_вель', right: 'а', answer: 'а' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини слово с буквой:', pd, 'ЖИ-ШИ с И, ЧА-ЩА с А, ЧУ-ЩУ с У'));
    }

    // 5. Ввод
    const d4 = sel[4];
    t.push(inputT('✏️', 'Ввод', 'badge-input', `Впиши букву: «${d4.word}»`, d4.ans, d4.hint));

    // 6. Ловушка хитрая
    t.push(choiceStrT('⚠️', 'Ловушка', 'badge-trap',
        '«ж_раф» — почему И, а не Ы?',
        'ЖИ пиши с И',
        ['Потому что Ы', 'ЖИ пиши с Ы', 'Нет правила'],
        2,
        'Правило: ЖИ-ШИ пиши с буквой И!'));

    // 7. Ввод сложнее
    const d6 = sel[6];
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши: «${d6.word}» и «${sel[7].word}» (две буквы через запятую)`,
        `${d6.ans},${sel[7].ans}`,
        `${d6.hint}; ${sel[7].hint}`));

    // 8. Босс
    t.push({
        type: 'boss_zhishi', emoji: '⭐', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Вставь буквы во все слова:',
        words: [
            { text: 'ж_раф', answer: 'и', hint: 'ЖИ-ШИ пиши с буквой И' },
            { text: 'ч_до', answer: 'у', hint: 'ЧУ-ЩУ пиши с буквой У' },
            { text: 'щ_ка', answer: 'у', hint: 'ЧУ-ЩУ пиши с буквой У' }
        ],
        explanation: 'ЖИ-ШИ с И, ЧУ-ЩУ с У'
    });

    return t;
}

// ═══════════════════════════════════════
//  Разделительный Ь и Ъ
// ═══════════════════════════════════════
export function generateSoftLesson() {
    const t = [];
    const fullDict = [
        { word: 'в_юга', ans: 'ь', hint: 'Ь — разделительный в корне', wrong: 'ъ' },
        { word: 'под_езд', ans: 'ъ', hint: 'Ъ — после приставки на согласный', wrong: 'ь' },
        { word: 'сем_я', ans: 'ь', hint: 'Ь в корне', wrong: 'ъ' },
        { word: 'об_ём', ans: 'ъ', hint: 'Ъ после приставки', wrong: 'ь' },
        { word: 'руч_и', ans: 'ь', hint: 'Ь в корне', wrong: 'ъ' },
        { word: 'с_ехал', ans: 'ъ', hint: 'Ъ после приставки', wrong: 'ь' },
        { word: 'вороб_и', ans: 'ь', hint: 'Ь в корне', wrong: 'ъ' },
        { word: 'об_явление', ans: 'ъ', hint: 'Ъ после приставки', wrong: 'ь' }
    ];
    const sel = shuffle(fullDict).slice(0, 8);

    // 1. Разминка
    t.push(choiceStrT('🔥', 'Разминка', 'badge-warmup',
        `«${sel[0].word}» — Ь или Ъ?`, sel[0].ans, ['ь', 'ъ'], 1, sel[0].hint));

    // 2. Визуальное — сравнение двух слов
    {
        const correctAns = 'вьюга — Ь, подъезд — Ъ';
        const opts = ['вьюга — Ь, подъезд — Ъ', 'вьюга — Ъ, подъезд — Ь', 'оба с Ь', 'оба с Ъ'];
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual',
            compareSVG('в_юга', 'под_езд', 'Где Ь, а где Ъ?'),
            'Где Ь, а где Ъ?', correctAns, opts,
            'Ь в корне, Ъ после приставки'));
    }

    // 3. Выбор
    t.push(choiceStrT('🎯', 'Выбор', 'badge-choice',
        `«${sel[2].word}» — какая буква?`, sel[2].ans, ['ь', 'ъ'], 1, sel[2].hint));

    // 4. Парное
    {
        const pd = [
            { left: 'в_юга (корень)', right: 'Ь', answer: 'Ь' },
            { left: 'под_езд (приставка)', right: 'Ъ', answer: 'Ъ' },
            { left: 'сем_я (корень)', right: 'Ь', answer: 'Ь' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини слово с нужным знаком:', pd, 'Ь в корне, Ъ после приставки'));
    }

    // 5. Ввод
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши (ь/ъ): «${sel[4].word}»`, sel[4].ans, sel[4].hint));

    // 6. Ловушка хитрая
    t.push(choiceStrT('⚠️', 'Ловушка', 'badge-trap',
        '«об_ём» — почему Ъ, а не Ь?',
        'После приставки ОБ-',
        ['После приставки ОБ-', 'В корне', 'Перед гласной Ё', 'Это словарное слово'],
        2,
        'Ъ пишется после приставки на согласный перед Е, Ё, Ю, Я'));

    // 7. Ввод сложнее
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Вставь знаки: «под_езд» и «руч_и» (два знака через запятую)`,
        'ъ,ь',
        'подЪезд (приставка), ручЬи (корень)'));

    // 8. Босс
    t.push({
        type: 'boss_soft', emoji: '⭐', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Вставь Ь или Ъ:',
        words: [
            { text: 'в_юга', answer: 'ь', hint: 'Разделительный Ь в корне слова' },
            { text: 'под_езд', answer: 'ъ', hint: 'Ъ после приставки на согласный' },
            { text: 'об_явление', answer: 'ъ', hint: 'Ъ после приставки на согласный' }
        ],
        explanation: 'Ь в корне, Ъ после приставок'
    });

    return t;
}

// ═══════════════════════════════════════
//  Безударные гласные
// ═══════════════════════════════════════
export function generateVowelLesson() {
    const t = [];
    const fullDict = [
        { word: 'л_сной', ans: 'е', check: 'лес', wrong: 'и' },
        { word: 'в_да', ans: 'о', check: 'воды', wrong: 'а' },
        { word: 'тр_ва', ans: 'а', check: 'травка', wrong: 'о' },
        { word: 'ст_на', ans: 'е', check: 'стены', wrong: 'и' },
        { word: 'з_мля', ans: 'е', check: 'земли', wrong: 'и' },
        { word: 'м_ря', ans: 'о', check: 'море', wrong: 'а' },
        { word: 'г_ра', ans: 'о', check: 'горы', wrong: 'а' },
        { word: 'сл_ды', ans: 'е', check: 'след', wrong: 'и' },
        { word: 'к_тёнок', ans: 'о', check: 'кот', wrong: 'а' },
        { word: 'в_сна', ans: 'е', check: 'вёсны', wrong: 'и' }
    ];
    const sel = shuffle(fullDict).slice(0, 8);

    // 1. Разминка
    t.push(choiceStrT('🔥', 'Разминка', 'badge-warmup',
        `«${sel[0].word}» — какая буква? Проверка: «${sel[0].check}»`,
        sel[0].ans, [sel[0].wrong, 'о', 'а'].filter((x, i, a) => a.indexOf(x) === i), 2,
        sel[0].check));

    // 2. Визуальное — слово и проверочное
    {
        const opts = shuffle([sel[1].ans, sel[1].wrong, sel[1].wrong === 'и' ? 'е' : 'и']);
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual',
            compareSVG(sel[1].word, sel[1].check, 'Какая буква пропущена?'),
            'Какая буква пропущена?', sel[1].ans, opts,
            `Проверочное слово: ${sel[1].check}`));
    }

    // 3. Выбор
    t.push(choiceStrT('🎯', 'Выбор', 'badge-choice',
        `«${sel[2].word}» — проверка «${sel[2].check}». Буква?`,
        sel[2].ans, ['е', 'и', 'о', 'а'], 2, sel[2].check));

    // 4. Парное
    {
        const pd = [
            { left: 'л_сной', right: 'е (лес)', answer: 'е' },
            { left: 'в_да', right: 'о (воды)', answer: 'о' },
            { left: 'тр_ва', right: 'а (травка)', answer: 'а' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини слово с буквой:', pd, 'Проверяем ударением'));
    }

    // 5. Ввод
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши букву: «${sel[4].word}» (проверка: ${sel[4].check})`,
        sel[4].ans, `${sel[4].check} → ${sel[4].ans}`));

    // 6. Ловушка хитрая
    t.push(choiceStrT('⚠️', 'Ловушка', 'badge-trap',
        '«к_тёнок» — проверка «кот», пишем О. А если проверки нет?',
        'Смотрим в словарь',
        ['Смотрим в словарь', 'Пишем А', 'Пишем любую', 'Пишем О всегда'],
        2,
        'Словарные слова надо запоминать!'));

    // 7. Ввод сложнее
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши: «${sel[6].word}» и «${sel[7].word}» (две буквы)`,
        `${sel[6].ans},${sel[7].ans}`,
        `${sel[6].check} → ${sel[6].ans}; ${sel[7].check} → ${sel[7].ans}`));

    // 8. Босс
    t.push({
        type: 'boss_vowel', emoji: '⭐', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Вставь буквы (проверь ударением):',
        words: [
            { text: 'л_сной', answer: 'е', hint: 'Проверка: лЕс → е' },
            { text: 'в_да', answer: 'о', hint: 'Проверка: вОды → о' },
            { text: 'з_мля', answer: 'е', hint: 'Проверка: зЕмли → е' }
        ],
        explanation: 'лЕс, вОды, зЕмли'
    });

    return t;
}

// ═══════════════════════════════════════
//  Непроизносимые согласные
// ═══════════════════════════════════════
export function generateSilentLesson() {
    const t = [];
    const fullDict = [
        { word: 'чес_ный', ans: 'т', check: 'честь' },
        { word: 'грус_ный', ans: 'т', check: 'грусть' },
        { word: 'радос_ный', ans: 'т', check: 'радость' },
        { word: 'звёз_ный', ans: 'д', check: 'звезда' },
        { word: 'праз_ник', ans: 'д', check: 'празден (словарное)' },
        { word: 'чу_ство', ans: 'в', check: 'чуВствую' },
        { word: 'лес_ница', ans: 'т', check: 'лестница (словарное)' },
        { word: 'со_нце', ans: 'л', check: 'солнышко' }
    ];
    const sel = shuffle(fullDict).slice(0, 8);

    // 1. Разминка
    t.push(choiceStrT('🔥', 'Разминка', 'badge-warmup',
        `«${sel[0].word}» — есть буква? Проверка: «${sel[0].check}»`,
        sel[0].ans, ['т', 'д', 'л', 'в'], 2,
        `Слышится? Нет. Пишется? Да — ${sel[0].ans}!`));

    // 2. Визуальное
    {
        const opts = ['т', 'д', 'л', 'в'];
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual',
            compareSVG(sel[1].word, sel[1].check, 'Какая буква спряталась?'),
            'Какая буква спряталась?', sel[1].ans, opts,
            `Проверка: ${sel[1].check} → ${sel[1].ans}`));
    }

    // 3. Выбор
    t.push(choiceStrT('🎯', 'Выбор', 'badge-choice',
        `«${sel[2].word}» — какая буква?`, sel[2].ans,
        ['т', 'д', 'в', 'л'], 2, sel[2].check));

    // 4. Парное
    {
        const pd = [
            { left: 'чес_ный', right: 'т (честь)', answer: 'т' },
            { left: 'со_нце', right: 'л (солнышко)', answer: 'л' },
            { left: 'звёз_ный', right: 'д (звезда)', answer: 'д' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини слово с буквой:', pd, 'Проверяем родственным словом'));
    }

    // 5. Ввод
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши пропущенную букву: «${sel[4].word}»`, sel[4].ans,
        `${sel[4].check} → ${sel[4].ans}`));

    // 6. Ловушка хитрая
    t.push(choiceStrT('⚠️', 'Ловушка', 'badge-trap',
        '«чу_ство» — есть ли буква В?',
        'Да — В (чуВствую)',
        ['Да — В (чуВствую)', 'Нет, не пишется', 'Пишется Д', 'Это Л'],
        2,
        'Хотя не слышится, пишем В! Проверка: чувствовать'));

    // 7. Ввод сложнее
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши буквы: «${sel[6].word}» и «${sel[7].word}»`,
        `${sel[6].ans},${sel[7].ans}`,
        `${sel[6].check} → ${sel[6].ans}; ${sel[7].check} → ${sel[7].ans}`));

    // 8. Босс
    t.push({
        type: 'boss_silent', emoji: '⭐', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Вставь буквы:',
        words: [
            { text: 'чес_ный', answer: 'т', hint: 'Проверка: чесТь → т' },
            { text: 'со_нце', answer: 'л', hint: 'Проверка: соЛнышко → л' },
            { text: 'праз_ник', answer: 'д', hint: 'Словарное слово празДник → д' }
        ],
        explanation: 'чесТь, соЛнышко, празДник'
    });

    return t;
}

// ═══════════════════════════════════════
//  -ТСЯ / -ТЬСЯ
// ═══════════════════════════════════════
export function generateTsyaLesson() {
    const t = [];
    const dict = [
        { phrase: 'Он учит_ся', ans: 'тся', hint: 'Что делает?' },
        { phrase: 'Надо учит_ся', ans: 'ться', hint: 'Что делать?' },
        { phrase: 'Мне нравит_ся', ans: 'тся', hint: 'Что делает?' },
        { phrase: 'Это может случит_ся', ans: 'ться', hint: 'Что сделать?' },
        { phrase: 'Солнце садит_ся', ans: 'тся', hint: 'Что делает?' },
        { phrase: 'Пора просыпат_ся', ans: 'ться', hint: 'Что делать?' },
        { phrase: 'Он смеёт_ся', ans: 'тся', hint: 'Что делает?' },
        { phrase: 'Не надо боят_ся', ans: 'ться', hint: 'Что делать?' }
    ];
    const sel = shuffle(dict).slice(0, 8);

    // 1. Разминка
    t.push(choiceStrT('🔥', 'Разминка', 'badge-warmup',
        `«${sel[0].phrase}» — ТСЯ или ТЬСЯ?`,
        sel[0].ans, ['тся', 'ться'], 1, sel[0].hint));

    // 2. Визуальное — сравнение двух фраз
    {
        const correctAns = 'Он учится — ТСЯ, Надо учиться — ТЬСЯ';
        const opts = ['Он учится — ТСЯ, Надо учиться — ТЬСЯ', 'оба с ТЬСЯ', 'оба с ТСЯ', 'Надо учится — ТСЯ'];
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual',
            compareSVG('Он учит_ся', 'Надо учит_ся', 'Где ТСЯ, а где ТЬСЯ?'),
            'Где ТСЯ, а где ТЬСЯ?', correctAns, opts,
            'Что делает? → ТСЯ. Что делать? → ТЬСЯ'));
    }

    // 3. Выбор
    t.push(choiceStrT('🎯', 'Выбор', 'badge-choice',
        `«${sel[2].phrase}» — ?`, sel[2].ans, ['тся', 'ться'], 1, sel[2].hint));

    // 4. Парное
    {
        const pd = [
            { left: 'Он смеёт_ся', right: 'тся', answer: 'тся' },
            { left: 'Надо учит_ся', right: 'ться', answer: 'ться' },
            { left: 'Солнце садит_ся', right: 'тся', answer: 'тся' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини фразу с окончанием:', pd, 'Задай вопрос к глаголу!'));
    }

    // 5. Ввод
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши: «${sel[4].phrase}» (тся/ться)`, sel[4].ans, sel[4].hint));

    // 6. Ловушка хитрая
    t.push(choiceStrT('⚠️', 'Ловушка', 'badge-trap',
        '«Мне нравит_ся этот кот» — почему ТСЯ без Ь?',
        'Что делает? — без Ь',
        ['Что делает? — без Ь', 'Что делать? — с Ь', 'Всегда с Ь', 'Это исключение'],
        2,
        'Вопрос «Что делает?» → нет Ь → ТСЯ!'));

    // 7. Ввод сложнее
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `«${sel[6].phrase}» и «${sel[7].phrase}» (два ответа через запятую)`,
        `${sel[6].ans},${sel[7].ans}`,
        `${sel[6].hint}; ${sel[7].hint}`));

    // 8. Босс
    t.push({
        type: 'boss_tsya', emoji: '⭐', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Вставь ТСЯ или ТЬСЯ:',
        words: [
            { text: 'не ошиба_', answer: 'ться', hint: 'Что делать? не ошибаться → ТЬСЯ' },
            { text: 'труди_', answer: 'ться', hint: 'Что делать? трудиться → ТЬСЯ' },
            { text: 'он старае_', answer: 'тся', hint: 'Что делает? он старается → ТСЯ' }
        ],
        explanation: 'Что делать? → ТЬСЯ. Что делает? → ТСЯ'
    });

    return t;
}

// ═══════════════════════════════════════
//  ПРЕ / ПРИ
// ═══════════════════════════════════════
export function generatePrepriLesson() {
    const t = [];
    const dict = [
        { word: 'пр_бывать', ans: 'и', hint: 'приближаться' },
        { word: 'пр_мудрый', ans: 'е', hint: 'очень (= пере-)' },
        { word: 'пр_шить', ans: 'и', hint: 'присоединить' },
        { word: 'пр_красный', ans: 'е', hint: 'очень красивый' },
        { word: 'пр_вокзальный', ans: 'и', hint: 'рядом с вокзалом' },
        { word: 'пр_градить', ans: 'е', hint: 'перегородить' },
        { word: 'пр_открыть', ans: 'и', hint: 'не полностью' },
        { word: 'пр_увеличить', ans: 'е', hint: 'очень увеличить' }
    ];
    const sel = shuffle(dict).slice(0, 8);

    // 1. Разминка
    t.push(choiceStrT('🔥', 'Разминка', 'badge-warmup',
        `«${sel[0].word}» — ПРЕ или ПРИ?`,
        sel[0].ans === 'е' ? 'ПРЕ' : 'ПРИ', ['ПРЕ', 'ПРИ'], 1, sel[0].hint));

    // 2. Визуальное
    {
        const correctAns = 'прИбывать — ПРИ, прЕмудрый — ПРЕ';
        const opts = ['прИбывать — ПРИ, прЕмудрый — ПРЕ', 'оба с ПРЕ', 'оба с ПРИ', 'прЕбывать — ПРЕ'];
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual',
            compareSVG('пр_бывать', 'пр_мудрый', 'Где ПРИ, а где ПРЕ?'),
            'Где ПРИ, а где ПРЕ?', correctAns, opts,
            'ПРИ = приближение, ПРЕ = очень'));
    }

    // 3. Выбор
    t.push(choiceStrT('🎯', 'Выбор', 'badge-choice',
        `«${sel[2].word}» — ?`, sel[2].ans === 'е' ? 'ПРЕ' : 'ПРИ',
        ['ПРЕ', 'ПРИ'], 1, sel[2].hint));

    // 4. Парное
    {
        const pd = [
            { left: 'пр_бывать (приближение)', right: 'ПРИ', answer: 'ПРИ' },
            { left: 'пр_мудрый (очень)', right: 'ПРЕ', answer: 'ПРЕ' },
            { left: 'пр_открыть (не полностью)', right: 'ПРИ', answer: 'ПРИ' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини слово с приставкой:', pd, 'ПРИ — приближение/неполнота, ПРЕ — очень/пере'));
    }

    // 5. Ввод
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши (и/е): «${sel[4].word}»`, sel[4].ans, sel[4].hint));

    // 6. Ловушка хитрая
    t.push(choiceStrT('⚠️', 'Ловушка', 'badge-trap',
        '«пр_дать друга» — ПРЕ или ПРИ?',
        'ПРЕ (передать)',
        ['ПРЕ (передать)', 'ПРИ (приблизить)', 'ПРИ (присоединить)', 'ПРЕ (очень)'],
        2,
        'ПРЕдать = пере-дать! Не путай с «придать значение»'));

    // 7. Ввод сложнее
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши две буквы: «${sel[6].word}» и «${sel[7].word}»`,
        `${sel[6].ans},${sel[7].ans}`,
        `${sel[6].hint}; ${sel[7].hint}`));

    // 8. Босс
    t.push({
        type: 'boss_prepri', emoji: '⭐', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Вставь ПРЕ или ПРИ:',
        words: [
            { text: 'Пр_мудрый', answer: 'е', hint: 'ПРЕ = очень (премудрый = очень мудрый)' },
            { text: 'пр_был', answer: 'и', hint: 'ПРИ = приближение (прибыл = приехал)' },
            { text: 'пр_вокзальный', answer: 'и', hint: 'ПРИ = рядом (привокзальный = рядом с вокзалом)' }
        ],
        explanation: 'ПРЕ, ПРИ, ПРИ'
    });

    return t;
}

// ═══════════════════════════════════════
//  Н и НН
// ═══════════════════════════════════════
export function generateNNLesson() {
    const t = [];
    const dict = [
        { word: 'кури_ый', ans: 'н', hint: 'Суффикс -ИН- → одна Н', wrong: 'нн' },
        { word: 'соломе_ый', ans: 'нн', hint: 'Суффикс -ЕНН- → НН', wrong: 'н' },
        { word: 'стекля_ый', ans: 'нн', hint: 'Исключение! Стеклянный, оловянный, деревянный', wrong: 'н' },
        { word: 'ветре_ый', ans: 'н', hint: 'Исключение! Ветреный — одна Н', wrong: 'нн' },
        { word: 'пусты_ый', ans: 'нн', hint: 'Стык корня и суффикса: пустыН-Н-ый', wrong: 'н' },
        { word: 'кожа_ый', ans: 'н', hint: 'Суффикс -АН- → одна Н', wrong: 'нн' },
        { word: 'обеде_ый', ans: 'нн', hint: 'Суффикс -ЕНН- → НН', wrong: 'н' },
        { word: 'глиня_ый', ans: 'н', hint: 'Суффикс -ЯН- → одна Н', wrong: 'нн' }
    ];
    const sel = shuffle(dict).slice(0, 8);

    // 1. Разминка
    t.push(choiceStrT('🔥', 'Разминка', 'badge-warmup',
        `«${sel[0].word}» — Н или НН?`,
        sel[0].ans === 'н' ? 'Н' : 'НН', ['Н', 'НН'], 1, sel[0].hint));

    // 2. Визуальное
    {
        const correctAns = 'курИ-Н-ый → Н, солом-ЕНН-ый → НН';
        const opts = ['курИ-Н-ый → Н, солом-ЕНН-ый → НН', 'оба с НН', 'оба с Н', 'курИ-НН-ый → НН'];
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual',
            compareSVG('кури_ый', 'соломе_ый', 'Где Н, а где НН?'),
            'Где Н, а где НН?', correctAns, opts,
            '-ИН- → Н, -ЕНН- → НН'));
    }

    // 3. Выбор
    t.push(choiceStrT('🎯', 'Выбор', 'badge-choice',
        `«${sel[2].word}» — ?`, sel[2].ans === 'н' ? 'Н' : 'НН',
        ['Н', 'НН'], 1, sel[2].hint));

    // 4. Парное
    {
        const pd = [
            { left: 'кури_ый (-ИН-)', right: 'Н', answer: 'Н' },
            { left: 'соломе_ый (-ЕНН-)', right: 'НН', answer: 'НН' },
            { left: 'стекля_ый (искл.)', right: 'НН', answer: 'НН' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини слово с количеством Н:', pd, '-АН/-ЯН/-ИН → Н, -ЕНН/-ОНН → НН'));
    }

    // 5. Ввод
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши (н/нн): «${sel[4].word}»`, sel[4].ans, sel[4].hint));

    // 6. Ловушка хитрая
    t.push(choiceStrT('⚠️', 'Ловушка', 'badge-trap',
        '«ветре_ый» — почему одна Н?',
        'Это исключение',
        ['Это исключение', 'Суффикс -ЕН-', 'Суффикс -ИН-', 'Краткая форма'],
        2,
        'Ветреный — исключение, одна Н. Но: безветреННый!'));

    // 7. Ввод сложнее
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши: «${sel[6].word}» и «${sel[7].word}» (через запятую)`,
        `${sel[6].ans},${sel[7].ans}`,
        `${sel[6].hint}; ${sel[7].hint}`));

    // 8. Босс
    t.push({
        type: 'boss_nn', emoji: '⭐', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Вставь Н или НН:',
        words: [
            { text: 'стекля_ый', answer: 'нн', hint: 'Исключение! Стеклянный, оловянный, деревянный — НН' },
            { text: 'кожа_ый', answer: 'н', hint: 'Суффикс -АН- → одна Н' },
            { text: 'деревя_ый', answer: 'нн', hint: 'Исключение! Деревянный — НН' }
        ],
        explanation: 'стекляННый (искл), кожаНый (-АН-), деревяННый (искл)'
    });

    return t;
}

// ─── НОВЫЕ ГЕНЕРАТОРЫ РУССКОГО (v16) ──────────────────────

function generateNounCaseLesson() {
    const t = [];
    const cases = [
        { name: 'И.п.', question: 'кто? что?', example: 'лежит (что?) пенал' },
        { name: 'Р.п.', question: 'кого? чего?', example: 'нет (чего?) пенала' },
        { name: 'Д.п.', question: 'кому? чему?', example: 'рад (чему?) пеналу' },
        { name: 'В.п.', question: 'кого? что?', example: 'вижу (что?) пенал' },
        { name: 'Т.п.', question: 'кем? чем?', example: 'горжусь (чем?) пеналом' },
        { name: 'П.п.', question: 'о ком? о чём?', example: 'думаю (о чём?) о пенале' }
    ];
    t.push(choiceT('📚', 'Разминка', 'badge-warmup',
        '«Нет книги». Слово «книги» в каком падеже?', 'Р.п.',
        'Нет (кого? чего?) книги → Родительный падеж'));
    for (let i = 0; i < 3; i++) {
        const c = cases[rnd(1, 5)];
        t.push(choiceT('📚', `Падеж #${i+2}`, 'badge-task',
            `В каком падеже слово в примере:\n«${c.example}»?`, c.name,
            `Вопрос: ${c.question} → это ${c.name}`));
    }
    // Определение падежа по вопросу
    for (let i = 0; i < 2; i++) {
        const pairs = [
            { q: 'Думаю о маме', ans: 'П.п.' },
            { q: 'Подарок брату', ans: 'Д.п.' },
            { q: 'Выхожу из дома', ans: 'Р.п.' },
            { q: 'Рисую карандашом', ans: 'Т.п.' },
            { q: 'Смотрю фильм', ans: 'В.п.' },
            { q: 'Идёт дождь', ans: 'И.п.' }
        ];
        const p = pairs[rnd(0, pairs.length - 1)];
        t.push(choiceT('❓', 'Вопрос', 'badge-task',
            `Определи падеж: «${p.q}»`, p.ans,
            `Задаём вопрос → ${p.ans}`));
    }
    // Boss: склонение слова
    {
        const word = 'кот';
        t.push({
            type: 'boss',
            emoji: '🐱',
            badge: 'Босс',
            badgeClass: 'badge-boss',
            question: `Просклоняй слово «${word}» по падежам (И, Р, Д, В, Т, П через запятую):`,
            tasks: [{ type: 'input', question: '', correctAns: 'кот,кота,коту,кота,котом,коте' }],
            explanation: 'И: кот, Р: кота, Д: коту, В: кота, Т: котом, П: о коте'
        });
    }
    return t;
}

function generateVerbAspectLesson() {
    const t = [];
    const pairs = [
        { imp: 'читать', perf: 'прочитать', impDesc: 'процесс', perfDesc: 'результат' },
        { imp: 'писать', perf: 'написать', impDesc: 'процесс', perfDesc: 'результат' },
        { imp: 'решать', perf: 'решить', impDesc: 'процесс', perfDesc: 'результат' },
        { imp: 'строить', perf: 'построить', impDesc: 'процесс', perfDesc: 'результат' },
        { imp: 'готовить', perf: 'приготовить', impDesc: 'процесс', perfDesc: 'результат' }
    ];
    t.push(choiceT('⏳', 'Разминка', 'badge-warmup',
        '«Я читал книгу» — это действие длится или завершено?', 'длится',
        'Читал — процесс, несовершенный вид'));
    for (let i = 0; i < 3; i++) {
        const p = pairs[i];
        t.push(choiceT('⏳', `Вид глагола #${i+2}`, 'badge-task',
            `«${p.perf}» — какой вид?`, 'совершенный',
            `Что СДЕЛАТЬ? → ${p.perf} → совершенный (результат)`));
    }
    for (let i = 0; i < 2; i++) {
        const p = pairs[i + 3];
        t.push(choiceT('⏳', `Вид #${i+5}`, 'badge-task',
            `Выбери глагол НЕсовершенного вида:`,
            p.imp,
            `${p.imp} отвечает на «что делать?» — несовершенный вид`));
    }
    // Ordering: последовательность действий
    {
        const steps = ['Взял карандаш', 'Нарисовал круг', 'Раскрасил', 'Показал маме'];
        t.push(orderingT('🔢', 'Порядок', 'badge-bonus',
            'Расставь действия по порядку:',
            steps,
            'Логичный порядок: ' + steps.join(' → ')));
    }
    // Босс
    t.push(choiceT('🐱', 'Босс', 'badge-boss',
        'Образуй совершенный вид от «делать»?', 'сделать',
        'Что СДЕЛАТЬ? → сделать (приставка С-)'));
    return t;
}

function generateSyntaxLesson() {
    const t = [];
    t.push(choiceT('📝', 'Разминка', 'badge-warmup',
        'В предложении «Кот спит» подлежащее — …', 'Кот',
        'Подлежащее — кто? что? → Кот'));
    for (let i = 0; i < 3; i++) {
        const sent = [
            { text: 'Маша читает книгу', subj: 'Маша', pred: 'читает' },
            { text: 'Солнце светит ярко', subj: 'Солнце', pred: 'светит' },
            { text: 'Птицы улетели на юг', subj: 'Птицы', pred: 'улетели' }
        ][i];
        t.push(choiceT('📝', `Члены предл. #${i+2}`, 'badge-task',
            `«${sent.text}» — подлежащее:`, sent.subj,
            `Кто? → ${sent.subj} (подлежащее)`));
    }
    // Сказуемое
    for (let i = 0; i < 2; i++) {
        const sent = [
            { text: 'Дети играют в парке', obj: 'играют' },
            { text: 'Кошка поймала мышку', obj: 'поймала' }
        ][i];
        t.push(choiceT('📝', 'Сказуемое', 'badge-task',
            `«${sent.text}» — сказуемое:`, sent.obj,
            `Что делает? → ${sent.obj} (сказуемое)`));
    }
    // Босс
    t.push({
        type: 'boss',
        emoji: '🐱', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Разбери предложение: «Умный кот быстро решил задачу». Найди подлежащее и сказуемое (через запятую).',
        tasks: [{ type: 'input', question: '', correctAns: 'кот,решил' }],
        explanation: 'Кто? — кот (подлежащее). Что сделал? — решил (сказуемое).'
    });
    return t;
}

function generateScriptLesson() {
    const t = [];
    const parts = [
        { name: 'существительное', question: 'кто? что?', ex: 'кот, дом' },
        { name: 'прилагательное', question: 'какой?', ex: 'пушистый, большой' },
        { name: 'глагол', question: 'что делать?', ex: 'играть, бежать' },
        { name: 'наречие', question: 'как? где?', ex: 'быстро, весело' }
    ];
    t.push(choiceT('🏷️', 'Разминка', 'badge-warmup',
        'Слово «бежать» — это…', 'глагол',
        'Что делать? → глагол'));
    for (let i = 0; i < 3; i++) {
        const p = parts[rnd(0, 3)];
        t.push(choiceT('🏷️', `Часть речи #${i+2}`, 'badge-task',
            `Слово «${p.ex.split(',')[0]}» — какая часть речи?`, p.name,
            `Вопрос: ${p.question} → ${p.name}`));
    }
    // Определи часть речи в предложении
    for (let i = 0; i < 2; i++) {
        const tasks = [
            { word: 'рыжий', ans: 'прилагательное', ctx: 'Рыжий кот спит.' },
            { word: 'громко', ans: 'наречие', ctx: 'Птица пела громко.' },
            { word: 'ученик', ans: 'существительное', ctx: 'Ученик решил задачу.' }
        ];
        const tk = tasks[i];
        t.push(choiceT('🔍', 'В контексте', 'badge-task',
            `«${tk.ctx}» — слово «${tk.word}» это:`, tk.ans,
            `Задаём вопрос к слову → ${tk.ans}`));
    }
    // Босс
    t.push({
        type: 'boss',
        emoji: '🐱', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Определи части речи: «Маленький щенок весело играет». (сущ, прил, нар, гл через запятую)',
        tasks: [{ type: 'input', question: '', correctAns: 'прилагательное,существительное,наречие,глагол' }],
        explanation: 'Маленький (какой? прил), щенок (кто? сущ), весело (как? нар), играет (что делает? гл)'
    });
    return t;
}

function generatePrefixLesson() {
    const t = [];
    t.push(choiceT('🔤', 'Разминка', 'badge-warmup',
        'В слове «приехал» приставка:', 'при-',
        'при- (приближение) + ехал = приехал'));
    const rules = [
        { prefix: 'пре-', meaning: 'очень / пере-', ex: 'прекрасный (очень красивый)' },
        { prefix: 'при-', meaning: 'приближение / неполнота', ex: 'пришёл (приблизился)' },
        { prefix: 'раз-', meaning: 'разделение', ex: 'разбил (разделил на части)' },
        { prefix: 'без-', meaning: 'отсутствие', ex: 'бездомный (без дома)' }
    ];
    for (let i = 0; i < 3; i++) {
        const r = rules[i];
        t.push(choiceT('🔤', `Приставка #${i+2}`, 'badge-task',
            `Приставка «${r.prefix}» обозначает:`, r.meaning,
            `Пример: ${r.ex}`));
    }
    // Выбери правильную приставку
    for (let i = 0; i < 2; i++) {
        const tasks = [
            { word: 'пр_красный', correct: 'е', ans: 'прекрасный', rule: 'пре- = очень' },
            { word: 'пр_шить', correct: 'и', ans: 'пришить', rule: 'при- = присоединение' }
        ];
        const tk = tasks[i];
        t.push(choiceT('✍️', 'Вставь букву', 'badge-task',
            `Вставь букву: «${tk.word}»`, tk.ans,
            tk.rule));
    }
    // Босс
    t.push(choiceT('🐱', 'Босс', 'badge-boss',
        'Какая приставка в слове «приоткрыть»?', 'при-',
        'при- = неполнота действия (чуть-чуть открыть)'));
    return t;
}

function generateEpithetLesson() {
    const t = [];
    t.push(choiceT('🎨', 'Разминка', 'badge-warmup',
        '«Золотые руки» — это…', 'эпитет',
        'Эпитет — образное определение (руки не из золота, а умелые!)'));
    const epithets = [
        { phrase: 'Шёлковые волосы', meaning: 'мягкие, гладкие' },
        { phrase: 'Хрустальная душа', meaning: 'чистая, прозрачная' },
        { phrase: 'Железный характер', meaning: 'твёрдый, стойкий' },
        { phrase: 'Сладкая ложь', meaning: 'приятная, но обманчивая' }
    ];
    for (let i = 0; i < 3; i++) {
        const ep = epithets[i];
        t.push(choiceT('🎨', `Эпитет #${i+2}`, 'badge-task',
            `Что значит «${ep.phrase}»?`, ep.meaning,
            `Это эпитет — образное определение: ${ep.meaning}`));
    }
    // Найди эпитет в предложении
    for (let i = 0; i < 2; i++) {
        const tasks = [
            { sent: 'На небе горели алмазные звёзды', epithet: 'алмазные', meaning: 'сверкающие, как алмазы' },
            { sent: 'У неё был серебряный голос', epithet: 'серебряный', meaning: 'звонкий, мелодичный' }
        ];
        const tk = tasks[i];
        t.push(choiceT('🔍', 'Найди эпитет', 'badge-task',
            `«${tk.sent}» — эпитет:`, tk.epithet,
            tk.meaning));
    }
    // Босс
    t.push(choiceT('🐱', 'Босс', 'badge-boss',
        'Придумай эпитет к слову «ветер» (выбери лучший):',
        'ласковый',
        'Ласковый ветер — образное определение, создаёт настроение'));
    return t;
}

function generateSemanticLesson() {
    const t = [];
    t.push(choiceT('🔄', 'Разминка', 'badge-warmup',
        'Синоним к слову «большой»:', 'огромный',
        'Синонимы — слова с близким значением: большой ≈ огромный'));
    const synPairs = [
        { word: 'смелый', syn: 'храбрый' },
        { word: 'красивый', syn: 'прекрасный' },
        { word: 'умный', syn: 'мудрый' },
        { word: 'маленький', syn: 'крошечный' }
    ];
    for (let i = 0; i < 3; i++) {
        const sp = synPairs[i];
        t.push(choiceT('🔄', `Синонимы #${i+2}`, 'badge-task',
            `Синоним к слову «${sp.word}»:`, sp.syn,
            `${sp.word} ≈ ${sp.syn}`));
    }
    // Антонимы
    const antPairs = [
        { word: 'тёмный', ant: 'светлый' },
        { word: 'весёлый', ant: 'грустный' }
    ];
    for (let i = 0; i < 2; i++) {
        const ap = antPairs[i];
        t.push(choiceT('⚡', `Антонимы #${i+5}`, 'badge-task',
            `Антоним к слову «${ap.word}»:`, ap.ant,
            `Антонимы — слова с противоположным значением`));
    }
    // Босс
    t.push({
        type: 'boss',
        emoji: '🐱', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Подбери синоним И антоним к слову «добрый» (через запятую):',
        tasks: [{ type: 'input', question: '', correctAns: 'отзывчивый,злой' }],
        explanation: 'Синоним: отзывчивый, сердечный. Антоним: злой.'
    });
    return t;
}

function generateTextPlanLesson() {
    const t = [];
    t.push(choiceT('📋', 'Разминка', 'badge-warmup',
        'С чего начинается план текста?', 'Введение',
        'План: 1. Введение → 2. Основная часть → 3. Заключение'));
    // Части плана
    const parts = [
        { order: '1', name: 'Введение', desc: 'О чём текст?' },
        { order: '2', name: 'Основная часть', desc: 'Главные события / мысли' },
        { order: '3', name: 'Заключение', desc: 'Вывод, итог' }
    ];
    for (let i = 0; i < 3; i++) {
        const p = parts[i];
        t.push(choiceT('📋', `Часть плана #${i+2}`, 'badge-task',
            `Часть ${p.order}: «${p.desc}» — это…`, p.name,
            `Это ${p.name} — ${p.desc}`));
    }
    // Озаглавь абзац
    for (let i = 0; i < 2; i++) {
        const tasks = [
            { para: 'Коты — удивительные животные. Они живут рядом с человеком уже тысячи лет.', title: 'Коты и человек' },
            { para: 'Утром солнце встало, птицы запели, и лес наполнился звуками.', title: 'Утро в лесу' }
        ];
        const tk = tasks[i];
        t.push(choiceT('✏️', 'Озаглавь', 'badge-task',
            `Озаглавь абзац: «${tk.para}»`, tk.title,
            `Главная мысль: ${tk.title}`));
    }
    // Ordering: расставь части плана
    {
        const plan = ['Введение', 'Основная часть', 'Заключение'];
        t.push(orderingT('🔢', 'План', 'badge-bonus',
            'Расставь части плана в правильном порядке:',
            plan,
            'Правильно: ' + plan.join(' → ')));
    }
    // Босс
    t.push({
        type: 'boss',
        emoji: '🐱', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Составь план из 3 пунктов к тексту «Мой день» (через точку с запятой):',
        tasks: [{ type: 'input', question: '', correctAns: 'Утро;День;Вечер' }],
        explanation: 'Пример: Утро (подъём, школа); День (уроки, обед); Вечер (игры, сон)'
    });
    return t;
}

// ═══════════════════════════════════════
//  Словарные слова (vocab)
// ═══════════════════════════════════════
function generateVocabLesson() {
    const t = [];
    const words = [
        { word: 'к_рова', ans: 'о', hint: 'словарное слово «корова»' },
        { word: 'с_бака', ans: 'о', hint: 'словарное слово «собака»' },
        { word: 'м_локо', ans: 'о', hint: 'словарное слово «молоко»' },
        { word: 'в_рона', ans: 'о', hint: 'словарное слово «ворона»' },
        { word: 'п_льто', ans: 'а', hint: 'словарное слово «пальто»' },
        { word: 'к_ртина', ans: 'а', hint: 'словарное слово «картина»' },
        { word: 'гор_д', ans: 'о', hint: 'словарное слово «город»' },
        { word: 'р_бота', ans: 'а', hint: 'словарное слово «работа»' }
    ];
    const sel = shuffle(words).slice(0, 8);

    t.push(choiceT('📖', 'Разминка', 'badge-warmup',
        `Словарное слово: «${sel[0].word}» — какая буква?`, sel[0].ans,
        [sel[0].ans === 'о' ? 'а' : 'о', 'е', sel[0].ans].filter((x, i, a) => a.indexOf(x) === i).join(', ') + ' — ' + sel[0].hint));

    for (let i = 1; i < 4; i++) {
        const w = sel[i];
        t.push(choiceT('📖', `Словарь #${i+1}`, 'badge-task',
            `Вставь букву: «${w.word}»`, w.ans,
            w.hint));
    }

    // Визуальное — слово с пропущенной буквой
    {
        const w = sel[4];
        t.push(visualT('🖼️', 'Слово', 'badge-visual',
            letterChoiceSVG(w.word.replace('_', '?'), w.word.indexOf('_'), [w.ans]),
            `Какая буква пропущена?`, w.ans,
            shuffle(['о', 'а', 'е'].filter((x, i, a) => a.indexOf(x) === i)),
            w.hint));
    }

    // Парное
    {
        const pd = sel.slice(0, 4).map(w => ({
            left: w.word, right: w.ans, answer: w.ans
        }));
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини слово с буквой:', pd, 'Словарные слова нужно запомнить!'));
    }

    // Ввод
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши букву: «${sel[5].word}»`, sel[5].ans, sel[5].hint));

    // Ловушка
    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap',
        'Словарные слова можно проверить ударением?',
        'Нет, их нужно запоминать',
        'Словарные слова — это слова с непроверяемыми написаниями! Их надо ЗАПОМНИТЬ.'));

    // Ввод сложнее
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        `Впиши две буквы: «${sel[6].word}» и «${sel[7].word}»`,
        `${sel[6].ans},${sel[7].ans}`,
        `${sel[6].hint}; ${sel[7].hint}`));

    // Босс
    t.push({
        type: 'boss_vocab', emoji: '⭐', badge: 'Босс', badgeClass: 'badge-boss',
        question: 'Вставь буквы в словарные слова:',
        words: [
            { text: 'к_рова', answer: 'о', hint: 'Словарное слово: кОрова' },
            { text: 'м_локо', answer: 'о', hint: 'Словарное слово: мОлоко' },
            { text: 'п_льто', answer: 'а', hint: 'Словарное слово: пАльто' }
        ],
        explanation: 'кОрова, мОлоко, пАльто — запомни!'
    });

    return t;
}

// ═══════════════════════════════════════
//  Причастия и деепричастия (partic)
// ═══════════════════════════════════════
function generateParticLesson() {
    const t = [];

    t.push(choiceT('📝', 'Разминка', 'badge-warmup',
        '«Читающий мальчик» — «читающий» это…', 'причастие',
        'Причастие — особая форма глагола, признак по действию (какой? что делающий?)'));

    for (let i = 0; i < 3; i++) {
        const tasks = [
            { phrase: 'Летящая птица', word: 'Летящая', ans: 'причастие', hint: 'какая? что делающая? → причастие' },
            { phrase: 'Читая книгу', word: 'Читая', ans: 'деепричастие', hint: 'как? что делая? → деепричастие' },
            { phrase: 'Решённая задача', word: 'Решённая', ans: 'причастие', hint: 'какая? → причастие' },
            { phrase: 'Увидев кота', word: 'Увидев', ans: 'деепричастие', hint: 'что сделав? → деепричастие' }
        ];
        const tk = tasks[i];
        t.push(choiceT('📝', `Часть речи #${i+2}`, 'badge-task',
            `«${tk.phrase}» — слово «${tk.word}»:`, tk.ans,
            tk.hint));
    }

    // Суффиксы причастий
    for (let i = 0; i < 2; i++) {
        const tasks = [
            { word: 'игра_щий', correct: 'ю', ans: 'играющий', rule: 'суффикс -ющ- (действ. наст. вр.)' },
            { word: 'прочита_ный', correct: 'н', ans: 'прочитанный', rule: 'суффикс -нн- (страд. прош. вр.)' }
        ];
        const tk = tasks[i];
        t.push(choiceT('✍️', `Суффикс #${i+5}`, 'badge-task',
            `Вставь букву: «${tk.word}» → ${tk.ans}`, tk.correct,
            tk.rule));
    }

    // Визуальное
    {
        t.push(visualT('🖼️', 'Сравнение', 'badge-visual',
            compareSVG('читающий', 'читая', 'Причастие или деепричастие?'),
            '«Читающий» — это причастие, «читая» — деепричастие?', 'Да',
            ['Да', 'Нет', 'Оба причастия', 'Оба деепричастия'],
            'Читающий (какой?) — причастие. Читая (что делая?) — деепричастие.'));
    }

    // Парное
    {
        const pd = [
            { left: 'причастие', right: 'какой? (признак по действию)', answer: 'причастие' },
            { left: 'деепричастие', right: 'как? (добавочное действие)', answer: 'деепричастие' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини термин с определением:', pd, 'Причастие — какой?, деепричастие — как?'));
    }

    // Босс
    t.push(choiceT('🐱', 'Босс', 'badge-boss',
        '«Улыбаясь, кот смотрел в окно». «Улыбаясь» — это…',
        'деепричастие',
        'Что делая? → улыбаясь → деепричастие'));

    return t;
}

// ═══════════════════════════════════════
//  Сложные предложения (complex)
// ═══════════════════════════════════════
function generateComplexLesson() {
    const t = [];

    t.push(choiceT('🔗', 'Разминка', 'badge-warmup',
        'Сложное предложение — это…',
        'предложение с двумя и более грамматическими основами',
        'Сложное предложение содержит несколько подлежащих и сказуемых'));

    for (let i = 0; i < 3; i++) {
        const tasks = [
            { sent: 'Кот спит, а мышь бегает.', type: 'сложное', reason: 'две основы: кот спит, мышь бегает' },
            { sent: 'Солнце встало и осветило лес.', type: 'простое', reason: 'одна основа: солнце встало и осветило' },
            { sent: 'Когда придёт весна, птицы вернутся.', type: 'сложное', reason: 'две основы: весна придёт, птицы вернутся' }
        ];
        const tk = tasks[i];
        t.push(choiceT('🔗', `Предложение #${i+2}`, 'badge-task',
            `«${tk.sent}» — это предложение:`, tk.type,
            tk.reason));
    }

    // Союзы в сложных предложениях
    for (let i = 0; i < 2; i++) {
        const tasks = [
            { sent: 'Наступила осень, и листья пожелтели.', union: 'и', type: 'соединительный' },
            { sent: 'Дождь прошёл, но тучи остались.', union: 'но', type: 'противительный' }
        ];
        const tk = tasks[i];
        t.push(choiceT('🔤', `Союз #${i+5}`, 'badge-task',
            `«${tk.sent}» — какой союз?`, tk.union,
            `Союз «${tk.union}» — ${tk.type}`));
    }

    // Визуальное — две части предложения
    {
        t.push(visualT('🖼️', 'Структура', 'badge-visual',
            `<svg width="280" height="80" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="120" height="24" rx="6" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/>
                <text x="70" y="27" text-anchor="middle" font-size="12" fill="#1E293B" font-weight="700">Кот спит</text>
                <text x="140" y="27" text-anchor="middle" font-size="14" fill="#F59E0B" font-weight="800">, а</text>
                <rect x="160" y="10" width="110" height="24" rx="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
                <text x="215" y="27" text-anchor="middle" font-size="12" fill="#1E293B" font-weight="700">мышь бегает</text>
                <text x="140" y="58" text-anchor="middle" font-size="11" fill="#64748B">Запятая перед союзом «а» ставится?</text>
            </svg>`,
            'Нужна ли запятая?', 'Да',
            ['Да', 'Нет', 'Только точка', 'Тире'],
            'Перед союзами А, НО, И (в сложном предложении) ставится запятая!'));
    }

    // Парное: простые → сложные
    {
        const pd = [
            { left: 'Солнце село', right: 'наступила ночь', answer: 'Солнце село, и наступила ночь' },
            { left: 'Дождь прошёл', right: 'выглянула радуга', answer: 'Дождь прошёл, и выглянула радуга' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair',
            'Соедини простые предложения в сложное (мысленно):',
            pd,
            'Сложное предложение = простые + союз + запятая'));
    }

    // Босс
    t.push(choiceT('🐱', 'Босс', 'badge-boss',
        '«Подул ветер, и деревья зашумели». Сколько грамматических основ?',
        '2',
        '1) ветер подул, 2) деревья зашумели → две основы → сложное предложение'));

    return t;
}

// ═══════════════════════════════════════
//  Пунктуация (punct)
// ═══════════════════════════════════════
function generatePunctLesson() {
    const t = [];

    t.push(choiceT('✍️', 'Разминка', 'badge-warmup',
        'В конце повествовательного предложения ставится…',
        'точка',
        'Повествовательное → точка (.)'));

    for (let i = 0; i < 3; i++) {
        const tasks = [
            { sent: 'Ты сделал уроки', correct: '?', hint: 'вопросительное → ?' },
            { sent: 'Как красиво', correct: '!', hint: 'восклицательное → !' },
            { sent: 'Кот спит на окне', correct: '.', hint: 'повествовательное → .' }
        ];
        const tk = tasks[i];
        t.push(choiceT('✍️', `Знак #${i+2}`, 'badge-task',
            `«${tk.sent}» — какой знак?`, tk.correct,
            tk.hint));
    }

    // Запятые при однородных членах
    for (let i = 0; i < 2; i++) {
        const tasks = [
            { sent: 'В саду росли яблони груши и сливы', correct: 'яблони, груши и сливы', rule: 'запятая между однородными членами' },
            { sent: 'Кот был рыжий пушистый и ласковый', correct: 'рыжий, пушистый и ласковый', rule: 'запятая между определениями' }
        ];
        const tk = tasks[i];
        t.push(choiceT('📝', `Запятые #${i+5}`, 'badge-task',
            `Где нужны запятые? «${tk.sent}»`, tk.correct,
            tk.rule));
    }

    // Визуальное — прямая речь
    {
        t.push(visualT('🖼️', 'Прямая речь', 'badge-visual',
            `<svg width="280" height="70" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="260" height="30" rx="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
                <text x="140" y="30" text-anchor="middle" font-size="13" fill="#1E293B" font-weight="600">«Кот сказал : Я голоден»</text>
                <text x="140" y="60" text-anchor="middle" font-size="11" fill="#64748B">Где ошибка в пунктуации?</text>
            </svg>`,
            'Где ошибка?', 'Пробел перед двоеточием',
            ['Пробел перед двоеточием', 'Кавычки не нужны', 'Всё правильно', 'Нужна точка'],
            'Правильно: «Кот сказал: Я голоден» (без пробела перед двоеточием)'));
    }

    // Парное
    {
        const pd = [
            { left: 'Вопросительное', right: '?', answer: '?' },
            { left: 'Восклицательное', right: '!', answer: '!' },
            { left: 'Повествовательное', right: '.', answer: '.' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини тип предложения со знаком:', pd, 'Знаки в конце предложения'));
    }

    // Босс
    t.push({
        type: 'boss_punct',
        emoji: '🐱',
        badge: 'Босс',
        badgeClass: 'badge-boss',
        question: 'Расставь знаки в конце (через запятую: точка/вопрос/воскл):',
        words: [
            { text: 'Ты любишь котов', answer: '?', hint: 'Вопросительное предложение → ?' },
            { text: 'Какая красота', answer: '!', hint: 'Восклицательное предложение → !' },
            { text: 'Кот уснул', answer: '.', hint: 'Повествовательное предложение → .' }
        ],
        explanation: 'Вопрос, восклицание, точка'
    });

    return t;
}

// ═══════════════ ГЕНЕРАТОРЫ ФГОС (НОВЫЕ) ═══════════════

/** Парные звонкие/глухие согласные (1-2 класс) */
function generatePairedConsonantsLesson() {
    const t = [];
    const pairs = [
        ['б','п'],['в','ф'],['г','к'],['д','т'],['ж','ш'],['з','с']
    ];
    for (let i = 0; i < 4; i++) {
        const [voiced, voiceless] = pairs[rnd(0, pairs.length - 1)];
        const correct = 'ду' + voiced;
        t.push(choiceT('🔤', `Согласные #${i+1}`, 'badge-task',
            `Найди слово с буквой «${voiced}»`, correct,
            `Проверочное слово: дубы → ${voiced} (звонкий)`));
    }
    // 2 inputT
    const testPairs = shuffle([...pairs]).slice(0, 2);
    for (let i = 0; i < 2; i++) {
        const [v] = testPairs[i];
        t.push(inputT('✏️', 'Ввод', 'badge-input',
            `Вставь букву: ду${v === 'б' ? '?' : (v === 'в' ? '?' : (v === 'г' ? '?' : (v === 'д' ? '?' : (v === 'ж' ? '?' : 'з?'))))} — ду..`, v,
            `Парная звонкая «${v}» (проверка: дубы → б)`));
    }
    return t;
}

/** Перенос слов (1-2 класс) */
function generateWordWrapLesson() {
    const t = [];
    const words = [
        { w: 'мама', wrap: 'ма-ма' },
        { w: 'кошка', wrap: 'кош-ка' },
        { w: 'собака', wrap: 'со-ба-ка' },
        { w: 'ученик', wrap: 'уче-ник' },
        { w: 'карандаш', wrap: 'ка-ран-даш' },
        { w: 'тетрадь', wrap: 'тет-радь' }
    ];
    const sel = shuffle(words).slice(0, 4);
    for (let i = 0; i < sel.length; i++) {
        const item = sel[i];
        t.push(inputT('✏️', `Перенос #${i+1}`, 'badge-input',
            `Раздели для переноса: «${item.w}» (вставь дефисы)`, item.wrap,
            `Слоги: ${item.wrap}`));
    }
    // 2 визуальных
    const opts = [
        { text: 'ма-ма', correct: true }, { text: 'мам-а', correct: false },
        { text: 'кош-ка', correct: true }, { text: 'ко-шка', correct: false },
        { text: 'уч-еник', correct: false }, { text: 'уче-ник', correct: true }
    ];
    const correctOpts = opts.filter(o => o.correct);
    const wrongOpts = opts.filter(o => !o.correct);
    for (let i = 0; i < 2; i++) {
        t.push(choiceStrT('📝', 'Правильный перенос', 'badge-task',
            `Правильный перенос: ${correctOpts[i].text.split('-')[0]}...`,
            correctOpts[i].text, [correctOpts[i].text, wrongOpts[i].text], 1,
            `Правильно: ${correctOpts[i].text}`));
    }
    return t;
}

/** Заглавная буква (1-2 класс) */
function generateCapitalLetterLesson() {
    const t = [];
    const names = ['Маша', 'Петя', 'Москва', 'Волга', 'Барсик', 'Россия'];
    for (let i = 0; i < 3; i++) {
        const name = names[i];
        const wrong = name.toLowerCase();
        t.push(choiceStrT('🔤', `Заглавная #${i+1}`, 'badge-task',
            `Как правильно? ${name} или ${wrong}`, name,
            [name, wrong], 1, 'Имена собственные пишутся с большой буквы'));
    }
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        'Напиши правильно: «мы живём в россии» (исправь заглавные)',
        'Мы живём в России',
        'Имена собственные с большой буквы'));
    t.push(inputT('✏️', 'Ввод', 'badge-input',
        'Напиши правильно: «кот барсик пьёт молоко»',
        'Кот Барсик пьёт молоко',
        'Клички с большой буквы'));
    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap',
        'Где заглавная буква НЕ нужна?', 'собака',
        'Названия животных — строчная'));
    return t;
}

/** Состав слова (3-4 класс) */
function generateWordPartsLesson() {
    const t = [];
    const items = [
        { word: 'подводный', root: 'вод', prefix: 'под', suffix: 'н', ending: 'ый' },
        { word: 'перелесок', root: 'лес', prefix: 'пере', suffix: 'ок', ending: '□' },
        { word: 'пришкольный', root: 'школь', prefix: 'при', suffix: 'н', ending: 'ый' },
        { word: 'заморский', root: 'мор', prefix: 'за', suffix: 'ск', ending: 'ий' }
    ];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        t.push(inputT('✏️', `Корень #${i+1}`, 'badge-input',
            `Корень в слове «${item.word}»`, item.root,
            `Однокоренные: ${item.root}а, ${item.root}ный`));
    }
    t.push(choiceT('🔤', 'Приставка', 'badge-task',
        'Приставка в слове «переход»', 'пере',
        'пере-ход'));
    t.push(choiceT('🔤', 'Суффикс', 'badge-task',
        'Суффикс в слове «домик»', 'ик',
        'дом-ик'));
    return t;
}

/** Однокоренные слова (3-4 класс) */
function generateSameRootLesson() {
    const t = [];
    const sets = [
        { root: 'лес', words: ['лес', 'лесок', 'лесной', 'перелесок'], extra: 'лиса' },
        { root: 'вод', words: ['вода', 'водный', 'подводный', 'водичка'], extra: 'водитель' },
        { root: 'сад', words: ['сад', 'садик', 'садовый', 'посадка'], extra: 'садиться' },
        { root: 'свет', words: ['свет', 'светлый', 'светить', 'рассвет'], extra: 'святой' }
    ];
    for (let i = 0; i < sets.length; i++) {
        const { root, extra } = sets[i];
        t.push(choiceT('🔍', `Однокоренные #${i+1}`, 'badge-task',
            `Найди НЕ однокоренное к корню «-${root}-»`, extra,
            `«${extra}» имеет другой корень`));
    }
    const items2 = [
        { word: 'гора', root: 'гор' },
        { word: 'море', root: 'мор' }
    ];
    for (let i = 0; i < items2.length; i++) {
        const { word, root } = items2[i];
        t.push(inputT('✏️', `Корень #${i+5}`, 'badge-input',
            `Корень слова «${word}»`, root,
            `Однокоренные: ${root}ка, ${root}ный`));
    }
    return t;
}

/** Синонимы / Антонимы (3-4 класс) */
function generateSynAntLesson() {
    const t = [];
    const synPairs = [['большой','огромный'],['маленький','крошечный'],['красивый','прекрасный'],['идти','шагать']];
    for (let i = 0; i < synPairs.length; i++) {
        const [a, b] = synPairs[i];
        t.push(choiceStrT('🔄', `Синоним #${i+1}`, 'badge-task',
            `Синоним к слову «${a}»`, b,
            [b, 'противоположный', 'другой', 'неправильный'], 1,
            `${a} ≈ ${b}`));
    }
    // Антонимы
    const antPairs = [['высокий','низкий'],['толстый','тонкий'],['добрый','злой'],['горячий','холодный']];
    for (let i = 0; i < 2; i++) {
        const [a, b] = antPairs[i];
        t.push(inputT('✏️', `Антоним #${i+1}`, 'badge-input',
            `Антоним к слову «${a}»`, b,
            'Противоположное по смыслу'));
    }
    return t;
}

/** Части речи (3-4 класс) */
function generatePartsSpeechLesson() {
    const t = [];
    const words = [
        { w: 'кот', pos: 'сущ.' },
        { w: 'бежит', pos: 'глаг.' },
        { w: 'пушистый', pos: 'прил.' },
        { w: 'стол', pos: 'сущ.' },
        { w: 'читает', pos: 'глаг.' },
        { w: 'синий', pos: 'прил.' }
    ];
    const sel = shuffle(words).slice(0, 4);
    for (let i = 0; i < sel.length; i++) {
        const { w, pos } = sel[i];
        const full = pos === 'сущ.' ? 'существительное' : pos === 'глаг.' ? 'глагол' : 'прилагательное';
        t.push(choiceT('🏷️', `Часть речи #${i+1}`, 'badge-task',
            `Какая часть речи: «${w}»?`, full,
            `${w} — ${full}`));
    }
    t.push(choiceT('❓', 'Вопрос', 'badge-task',
        'К какой части речи относится вопрос «какой?»', 'прилагательное',
        'Признак предмета'));
    t.push(choiceT('❓', 'Вопрос', 'badge-task',
        'К какой части речи относится вопрос «что делать?»', 'глагол',
        'Действие предмета'));
    return t;
}

/** Род и число (3-4 класс) */
function generateGenderNumLesson() {
    const t = [];
    const items = [
        { phrase: 'красив__ кот', end: 'ый', gender: 'м.р.', num: 'ед.ч.' },
        { phrase: 'красив__ кошка', end: 'ая', gender: 'ж.р.', num: 'ед.ч.' },
        { phrase: 'красив__ окно', end: 'ое', gender: 'ср.р.', num: 'ед.ч.' },
        { phrase: 'красив__ коты', end: 'ые', gender: 'м.р.', num: 'мн.ч.' }
    ];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        t.push(inputT('✏️', `Окончание #${i+1}`, 'badge-input',
            `Вставь окончание: «${item.phrase}»`, item.end,
            `${item.gender}, ${item.num} → окончание «${item.end}»`));
    }
    t.push(choiceT('🔤', 'Род', 'badge-task',
        'Род слова «окно»', 'средний',
        'Оно моё → средний род'));
    t.push(choiceT('🔤', 'Род', 'badge-task',
        'Род слова «стул»', 'мужской',
        'Он мой → мужской род'));
    return t;
}

/** Предлоги и приставки (3-4 класс) */
function generatePrepPrefLesson() {
    const t = [];
    const items = [
        { phrase: '__бежать __гору', correct: 'сбежать с горы', separate: 'сбежать с_горы' },
        { phrase: '__шёл __школы', correct: 'вышел из школы', separate: 'вышел из_школы' },
        { phrase: '__плыл __берегу', correct: 'подплыл к берегу', separate: 'подплыл к_берегу' },
        { phrase: '__ехал __города', correct: 'выехал из города', separate: 'выехал из_города' }
    ];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        t.push(inputT('✏️', `Прист/предлог #${i+1}`, 'badge-input',
            `Вставь приставку и предлог: «${item.phrase}»`, item.separate,
            'Приставка — часть слова, предлог — отдельно'));
    }
    t.push(choiceT('🔍', 'Предлог', 'badge-task',
        'Где ПРЕДЛОГ?', 'в лесу',
        'В лесу — раздельно, это предлог'));
    t.push(choiceT('🔍', 'Приставка', 'badge-task',
        'Где ПРИСТАВКА?', 'зашёл',
        'За-шёл — часть слова'));
    return t;
}

/** Спряжение глаголов (5-6 класс) */
function generateConjugationLesson() {
    const t = [];
    const items = [
        { verb: 'читать', conj: 1, endings: ['ешь','ет','ем','ете','ут'] },
        { verb: 'говорить', conj: 2, endings: ['ишь','ит','им','ите','ят'] }
    ];
    for (let i = 0; i < items.length; i++) {
        const { verb, conj, endings } = items[i];
        t.push(choiceT('⏳', `Спряжение #${i*3+1}`, 'badge-task',
            `Спряжение глагола «${verb}»`, `${conj} спряжение`,
            `${conj} спр. (окончания -${endings[0]}, -${endings[1]})`));
        t.push(inputT('✏️', `Окончание #${i*3+2}`, 'badge-input',
            `Окончание: «ты ${verb}...» (напиши окончание)`, endings[0],
            `2 л. ед.ч. ${conj} спр.`));
        t.push(inputT('✏️', `Окончание #${i*3+3}`, 'badge-input',
            `Окончание: «они ${verb}...»`, endings[4],
            `3 л. мн.ч. ${conj} спр.`));
    }
    return t;
}

/** Чередующиеся гласные (5-6 класс) */
function generateAltVowelsLesson() {
    const t = [];
    const items = [
        { pair: '-лаг-/-лож-', ex1: 'изл__гать', ex1ans: 'а', ex2: 'изл__жить', ex2ans: 'о', rule: 'Перед Г — А, перед Ж — О' },
        { pair: '-раст-/-ращ-/-рос-', ex1: 'выр__стать', ex1ans: 'а', ex2: 'выр__сли', ex2ans: 'о', rule: 'Перед СТ/Щ — А, перед С — О' },
        { pair: '-гар-/-гор-', ex1: 'заг__р', ex1ans: 'а', ex2: 'заг__релый', ex2ans: 'о', rule: 'Под ударением А, без — О' },
        { pair: '-зар-/-зор-', ex1: 'з__ря', ex1ans: 'а', ex2: 'з__рька', ex2ans: 'о', rule: 'Под ударением О, без — А' }
    ];
    for (let i = 0; i < items.length; i++) {
        const { pair, ex1, ex1ans, ex2, ex2ans, rule } = items[i];
        t.push(inputT('✏️', `Чередование #${i*2+1}`, 'badge-input',
            `Вставь букву (${pair}): «${ex1}»`, ex1ans, rule));
        t.push(inputT('✏️', `Чередование #${i*2+2}`, 'badge-input',
            `Вставь букву (${pair}): «${ex2}»`, ex2ans, rule));
    }
    return t;
}

/** О/Ё после шипящих (5-6 класс) */
function generateOeSibilantLesson() {
    const t = [];
    const items = [
        { word: 'ш__пот', ans: 'ё', check: 'шептать' },
        { word: 'ш__рох', ans: 'о', check: 'исключение' },
        { word: 'ч__рный', ans: 'ё', check: 'чернеть' },
        { word: 'ч__каться', ans: 'о', check: 'исключение' },
        { word: 'ж__лудь', ans: 'ё', check: 'желудей' },
        { word: 'крыж__вник', ans: 'о', check: 'исключение' }
    ];
    const sel = items.slice(0, 4);
    for (let i = 0; i < sel.length; i++) {
        const { word, ans, check } = sel[i];
        t.push(inputT('✏️', `О/Ё #${i+1}`, 'badge-input',
            `Вставь букву: «${word}»`, ans,
            `Проверка: ${check}`));
        t.push(choiceStrT('❓', `Правило #${i+1}`, 'badge-task',
            `Почему «${word.replace('__', ans)}» пишется через «${ans}»?`,
            check, [check, 'всегда так', 'словарное', 'ударение'], 1,
            `Проверка: ${check}`));
    }
    return t;
}

/** НЕ с глаголами (5-6 класс) */
function generateNeVerbsLesson() {
    const t = [];
    const items = [
        { phrase: '(не)__читал', ans: 'не читал', rule: 'НЕ с глаголами раздельно' },
        { phrase: '(не)__думает', ans: 'не думает', rule: 'НЕ с глаголами раздельно' },
        { phrase: '(не)__знал', ans: 'не знал', rule: 'НЕ с глаголами раздельно' },
        { phrase: '(не)__хочу', ans: 'не хочу', rule: 'НЕ с глаголами раздельно' }
    ];
    for (let i = 0; i < items.length; i++) {
        const { phrase, ans, rule } = items[i];
        t.push(inputT('✏️', `НЕ #${i+1}`, 'badge-input',
            `Раскрой скобки: «${phrase}»`, ans, rule));
    }
    t.push(choiceT('❓', 'Правило', 'badge-task',
        'Как пишется НЕ с глаголами?', 'раздельно',
        'НЕ с глаголами ВСЕГДА раздельно'));
    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap',
        '«Негодовать» — почему слитно?', 'не употр. без НЕ',
        'Слова «годовать» нет в русском'));
    return t;
}

/** Падежные окончания существительных (5-6 класс) */
function generateCaseEndingsLesson() {
    const t = [];
    const items = [
        { phrase: 'думать о мам__', ending: 'е', case: 'П.п.', decl: '1 скл.' },
        { phrase: 'подарок дочер__', ending: 'и', case: 'Д.п.', decl: '3 скл.' },
        { phrase: 'у рек__', ending: 'и', case: 'Р.п.', decl: '1 скл.' },
        { phrase: 'подойти к лошад__', ending: 'и', case: 'Д.п.', decl: '3 скл.' }
    ];
    for (let i = 0; i < items.length; i++) {
        const { phrase, ending, case: c, decl } = items[i];
        t.push(inputT('✏️', `Окончание #${i+1}`, 'badge-input',
            `Окончание: «${phrase}...»`, ending,
            `${c}, ${decl} → -${ending}`));
    }
    return t;
}

export function generateRusLesson(skillId) {
    const gens = {
        zhishi: generateZhishiLesson, soft: generateSoftLesson,
        vowel: generateVowelLesson, silent: generateSilentLesson,
        tsya: generateTsyaLesson, prepri: generatePrepriLesson,
        nn: generateNNLesson,
        noun_case: generateNounCaseLesson,
        vocab: generateVocabLesson, partic: generateParticLesson,
        complex: generateComplexLesson, punct: generatePunctLesson,
        paired_consonants: generatePairedConsonantsLesson,
        word_wrap: generateWordWrapLesson,
        capital_letter: generateCapitalLetterLesson,
        word_parts: generateWordPartsLesson,
        same_root: generateSameRootLesson,
        syn_ant: generateSynAntLesson,
        parts_speech: generatePartsSpeechLesson,
        gender_num: generateGenderNumLesson,
        prep_pref: generatePrepPrefLesson,
        conjugation: generateConjugationLesson,
        alt_vowels: generateAltVowelsLesson,
        oe_sibilant: generateOeSibilantLesson,
        ne_verbs: generateNeVerbsLesson,
        case_endings: generateCaseEndingsLesson
    };
    const gen = gens[skillId];
    const tasks = gen ? gen() : generateZhishiLesson();
    return trimLesson(tasks);
}
