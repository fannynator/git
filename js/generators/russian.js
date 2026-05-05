// js/generators/russian.js

import { rnd, shuffle, choiceT, inputT } from '../utils.js';

/**
 * Генерация урока "ЖИ/ШИ, ЧА/ЩА, ЧУ/ЩУ"
 */
export function generateZhishiLesson() {
    const dictionary = [
        { q: 'ж_раф', a: 'и', hint: 'ЖИ с И', wrong: 'ы' },
        { q: 'ш_шка', a: 'и', hint: 'ШИ с И', wrong: 'ы' },
        { q: 'маш_на', a: 'и', hint: 'ШИ с И', wrong: 'ы' },
        { q: 'ч_шка', a: 'а', hint: 'ЧА с А', wrong: 'я' },
        { q: 'щ_вель', a: 'а', hint: 'ЩА с А', wrong: 'я' },
        { q: 'ч_до', a: 'у', hint: 'ЧУ с У', wrong: 'ю' },
        { q: 'щ_ка', a: 'у', hint: 'ЩУ с У', wrong: 'ю' }
    ];

    const selected = shuffle(dictionary).slice(0, 8);
    const tasks = [];

    selected.forEach((d, i) => {
        const opts = shuffle([d.a, d.wrong]);
        const ci = opts.indexOf(d.a);

        if (i < 4) {
            tasks.push(choiceT('📝', 'Выбор', 'badge-choice', `Вставь: «${d.q}»`, d.a, d.hint));
        } else if (i < 6) {
            tasks.push(inputT('✏️', 'Ввод', 'badge-input', `Впиши: «${d.q}»`, d.a, d.hint));
        } else if (i === 6) {
            tasks.push(choiceT('⚠️', 'Ловушка', 'badge-trap', '«ж_раф» — и или ы?', 'и', 'ЖИ с И!'));
        } else {
            tasks.push({
                type: 'boss_zhishi',
                emoji: '⭐',
                badge: 'Босс',
                badgeClass: 'badge-boss',
                question: 'Вставь:',
                words: [
                    { text: 'ж_знь', answer: 'и' },
                    { text: 'ч_до', answer: 'у' },
                    { text: 'рощ_', answer: 'а' }
                ],
                explanation: 'ЖИ, ЧУ, ЩА'
            });
        }
    });

    return tasks;
}

/**
 * Генерация урока "Разделительный Ь и Ъ"
 */
export function generateSoftLesson() {
    const dictionary = [
        { q: 'в_юга', a: 'ь', hint: 'Ь в корне', wrong: 'ъ' },
        { q: 'под_езд', a: 'ъ', hint: 'Ъ после приставки', wrong: 'ь' },
        { q: 'сем_я', a: 'ь', hint: 'Ь в корне', wrong: 'ъ' },
        { q: 'об_ём', a: 'ъ', hint: 'Ъ после приставки', wrong: 'ь' },
        { q: 'руч_и', a: 'ь', hint: 'Ь в корне', wrong: 'ъ' },
        { q: 'с_ехал', a: 'ъ', hint: 'Ъ после приставки', wrong: 'ь' },
        { q: 'вороб_и', a: 'ь', hint: 'Ь в корне', wrong: 'ъ' },
        { q: 'об_явление', a: 'ъ', hint: 'Ъ после приставки', wrong: 'ь' }
    ];

    const selected = shuffle(dictionary).slice(0, 8);
    const tasks = [];

    selected.forEach((d, i) => {
        const opts = shuffle([d.a, d.wrong]);
        const correctIdx = opts.indexOf(d.a);
        
        if (i < 4) {
            tasks.push({
                type: 'choice',
                emoji: '📝',
                badge: 'Выбор',
                badgeClass: 'badge-choice',
                question: `Вставь: «${d.q}»`,
                options: opts,
                correctIdx: correctIdx,
                correctAns: d.a,
                explanation: d.hint
            });
        } else if (i < 6) {
            tasks.push({
                type: 'input',
                emoji: '✏️',
                badge: 'Ввод',
                badgeClass: 'badge-input',
                question: `Впиши (ь/ъ): «${d.q}»`,
                correctAns: d.a,
                explanation: d.hint
            });
        } else if (i === 6) {
            const trapOpts = shuffle(['ъ', 'ь']);
            tasks.push({
                type: 'choice',
                emoji: '⚠️',
                badge: 'Ловушка',
                badgeClass: 'badge-trap',
                question: '«под_езд» — ь или ъ?',
                options: trapOpts,
                correctIdx: trapOpts.indexOf('ъ'),
                correctAns: 'ъ',
                explanation: 'После приставки — Ъ!'
            });
        } else {
            tasks.push({
                type: 'boss_soft',
                emoji: '⭐',
                badge: 'Босс',
                badgeClass: 'badge-boss',
                question: 'Вставь:',
                words: [
                    { text: 'в_юга', answer: 'ь' },
                    { text: 'под_езд', answer: 'ъ' },
                    { text: 'об_явление', answer: 'ъ' }
                ],
                explanation: 'Ь, Ъ, Ъ'
            });
        }
    });

    return tasks;
}
/**
 * Генерация урока "Безударные гласные"
 */
export function generateVowelLesson() {
    const dictionary = [
        { q: 'л_сной', a: 'е', hint: 'лес' },
        { q: 'в_да', a: 'о', hint: 'воды' },
        { q: 'тр_ва', a: 'а', hint: 'травка' },
        { q: 'ст_на', a: 'е', hint: 'стены' },
        { q: 'з_мля', a: 'е', hint: 'земли' },
        { q: 'м_ря', a: 'о', hint: 'море' },
        { q: 'г_ра', a: 'о', hint: 'горы' },
        { q: 'сл_ды', a: 'е', hint: 'след' }
    ];

    const selected = shuffle(dictionary).slice(0, 8);
    const tasks = [];

    selected.forEach((d, i) => {
        if (i < 4) {
            tasks.push(choiceT('📝', 'Выбор', 'badge-choice', `Вставь: «${d.q}»`, d.a, d.hint));
        } else if (i < 6) {
            tasks.push(inputT('✏️', 'Ввод', 'badge-input', `Впиши: «${d.q}»`, d.a, d.hint));
        } else if (i === 6) {
            tasks.push(choiceT('⚠️', 'Ловушка', 'badge-trap', '«л_сной» — е или и?', 'е', 'лес → лЕсной'));
        } else {
            tasks.push({
                type: 'boss_vowel',
                emoji: '⭐',
                badge: 'Босс',
                badgeClass: 'badge-boss',
                question: 'Вставь:',
                words: [
                    { text: 'л_сной', answer: 'е' },
                    { text: 'в_да', answer: 'о' },
                    { text: 'з_мля', answer: 'е' }
                ],
                explanation: 'лЕс, вОды, зЕмли'
            });
        }
    });

    return tasks;
}

/**
 * Генерация урока "Непроизносимые согласные"
 */
export function generateSilentLesson() {
    const dictionary = [
        { q: 'чес_ный', a: 'т', hint: 'честь' },
        { q: 'грус_ный', a: 'т', hint: 'грусть' },
        { q: 'радос_ный', a: 'т', hint: 'радость' },
        { q: 'звёз_ный', a: 'д', hint: 'звезда' },
        { q: 'праз_ник', a: 'д', hint: 'словарное' },
        { q: 'чу_ство', a: 'в', hint: 'чуВствую' },
        { q: 'лес_ница', a: 'т', hint: 'лестница' },
        { q: 'со_нце', a: 'л', hint: 'солнышко' }
    ];

    const selected = shuffle(dictionary).slice(0, 8);
    const tasks = [];

    selected.forEach((d, i) => {
        if (i < 4) {
            tasks.push(choiceT('📝', 'Выбор', 'badge-choice', `Вставь: «${d.q}»`, d.a, d.hint));
        } else if (i < 6) {
            tasks.push(inputT('✏️', 'Ввод', 'badge-input', `Впиши: «${d.q}»`, d.a, d.hint));
        } else if (i === 6) {
            tasks.push(choiceT('⚠️', 'Ловушка', 'badge-trap', '«чу_ство» — в или л?', 'в', 'чуВствую!'));
        } else {
            tasks.push({
                type: 'boss_silent',
                emoji: '⭐',
                badge: 'Босс',
                badgeClass: 'badge-boss',
                question: 'Вставь:',
                words: [
                    { text: 'чес_ный', answer: 'т' },
                    { text: 'со_нце', answer: 'л' },
                    { text: 'праз_ник', answer: 'д' }
                ],
                explanation: 'чесТь, соЛнышко, празДник'
            });
        }
    });

    return tasks;
}

/**
 * Генерация урока "-ТСЯ/-ТЬСЯ"
 */
export function generateTsyaLesson() {
    const dictionary = [
        { q: 'Он учит_ся', a: 'тся', hint: 'Что делает?' },
        { q: 'Надо учит_ся', a: 'ться', hint: 'Что делать?' },
        { q: 'Мне нравит_ся', a: 'тся', hint: 'Что делает?' },
        { q: 'Это может случит_ся', a: 'ться', hint: 'Что сделать?' },
        { q: 'Солнце садит_ся', a: 'тся', hint: 'Что делает?' },
        { q: 'Пора просыпат_ся', a: 'ться', hint: 'Что делать?' },
        { q: 'Он смеёт_ся', a: 'тся', hint: 'Что делает?' },
        { q: 'Не надо боят_ся', a: 'ться', hint: 'Что делать?' }
    ];

    const selected = shuffle(dictionary).slice(0, 8);
    const tasks = [];

    selected.forEach((d, i) => {
        if (i < 4) {
            tasks.push(choiceT('📝', 'Выбор', 'badge-choice', `Вставь: «${d.q}»`, d.a, d.hint));
        } else if (i < 6) {
            tasks.push(inputT('✏️', 'Ввод', 'badge-input', `Напиши: «${d.q}»`, d.a, d.hint));
        } else if (i === 6) {
            tasks.push(choiceT('⚠️', 'Ловушка', 'badge-trap', '«Ему нравит_ся»?', 'тся', 'Что делает? — ТСЯ!'));
        } else {
            tasks.push({
                type: 'boss_tsya',
                emoji: '⭐',
                badge: 'Босс',
                badgeClass: 'badge-boss',
                question: 'Вставь:',
                words: [
                    { text: 'не ошиба_', answer: 'ться' },
                    { text: 'труди_', answer: 'ться' }
                ],
                explanation: 'Что делать? → ТЬСЯ'
            });
        }
    });

    return tasks;
}

/**
 * Генерация урока "ПРЕ/ПРИ"
 */
export function generatePrepriLesson() {
    const dictionary = [
        { q: 'пр_бывать', a: 'и', hint: 'приближаться' },
        { q: 'пр_мудрый', a: 'е', hint: 'очень' },
        { q: 'пр_шить', a: 'и', hint: 'присоединить' },
        { q: 'пр_красный', a: 'е', hint: 'очень' },
        { q: 'пр_вокзальный', a: 'и', hint: 'рядом' },
        { q: 'пр_градить', a: 'е', hint: 'пере-' },
        { q: 'пр_открыть', a: 'и', hint: 'не полностью' },
        { q: 'пр_увеличить', a: 'е', hint: 'очень' }
    ];

    const selected = shuffle(dictionary).slice(0, 8);
    const tasks = [];

    selected.forEach((d, i) => {
        if (i < 4) {
            tasks.push(choiceT('📝', 'Выбор', 'badge-choice', `Вставь: «${d.q}»`, d.a, d.hint));
        } else if (i < 6) {
            tasks.push(inputT('✏️', 'Ввод', 'badge-input', `Впиши (и/е): «${d.q}»`, d.a, d.hint));
        } else if (i === 6) {
            tasks.push(choiceT('⚠️', 'Ловушка', 'badge-trap', '«пр_дать друга»?', 'е', 'ПРЕдать = пере-дать'));
        } else {
            tasks.push({
                type: 'boss_prepri',
                emoji: '⭐',
                badge: 'Босс',
                badgeClass: 'badge-boss',
                question: 'Вставь:',
                words: [
                    { text: 'Пр_мудрый', answer: 'е' },
                    { text: 'пр_был', answer: 'и' },
                    { text: 'пр_вокзальный', answer: 'и' }
                ],
                explanation: 'ПРЕ, ПРИ, ПРИ'
            });
        }
    });

    return tasks;
}

/**
 * Генерация урока "Н и НН"
 */
export function generateNNLesson() {
    const dictionary = [
        { q: 'кури_ый', a: 'н', hint: '-ИН-', wrong: 'нн' },
        { q: 'соломе_ый', a: 'нн', hint: '-ЕНН-', wrong: 'н' },
        { q: 'стекля_ый', a: 'нн', hint: 'исключение!', wrong: 'н' },
        { q: 'ветре_ый', a: 'н', hint: 'исключение!', wrong: 'нн' },
        { q: 'пусты_ый', a: 'нн', hint: 'стык', wrong: 'н' },
        { q: 'кожа_ый', a: 'н', hint: '-АН-', wrong: 'нн' },
        { q: 'обеде_ый', a: 'нн', hint: '-ЕНН-', wrong: 'н' },
        { q: 'глиня_ый', a: 'н', hint: '-ЯН-', wrong: 'нн' }
    ];

    const selected = shuffle(dictionary).slice(0, 8);
    const tasks = [];

    selected.forEach((d, i) => {
        const displayOptions = shuffle([d.a, d.wrong]);
        const correctIsN = d.a === 'н';
        // Для выбора показываем "Н"/"НН", но в correctAns храним 'н'/'нн'
        const correctDisplay = correctIsN ? 'Н' : 'НН';

        if (i < 4) {
            tasks.push({
                type: 'choice',
                emoji: '📝',
                badge: 'Выбор',
                badgeClass: 'badge-choice',
                question: `«${d.q}» — Н или НН?`,
                options: displayOptions.map(o => o === 'н' ? 'Н' : 'НН'),
                correctIdx: displayOptions.indexOf(d.a),
                correctAns: d.a,
                explanation: d.hint
            });
        } else if (i < 6) {
            tasks.push(inputT('✏️', 'Ввод', 'badge-input', `Впиши (н/нн): «${d.q}»`, d.a, d.hint));
        } else if (i === 6) {
            tasks.push({
                type: 'choice',
                emoji: '⚠️',
                badge: 'Ловушка',
                badgeClass: 'badge-trap',
                question: '«ветре_ый» — Н/НН?',
                options: ['Н', 'НН'],
                correctIdx: 0,
                correctAns: 'н',
                explanation: 'Ветреный — исключение!'
            });
        } else {
            tasks.push({
                type: 'boss_nn',
                emoji: '⭐',
                badge: 'Босс',
                badgeClass: 'badge-boss',
                question: 'Вставь:',
                words: [
                    { text: 'стекля_ый', answer: 'нн' },
                    { text: 'кожа_ый', answer: 'н' },
                    { text: 'деревя_ый', answer: 'нн' }
                ],
                explanation: 'НН, Н, НН'
            });
        }
    });

    return tasks;
}

/**
 * Диспетчер: возвращает задания для конкретного навыка русского языка
 * @param {string} skillId
 * @returns {Array}
 */
export function generateRusLesson(skillId) {
    const generators = {
        zhishi: generateZhishiLesson,
        soft: generateSoftLesson,
        vowel: generateVowelLesson,
        silent: generateSilentLesson,
        tsya: generateTsyaLesson,
        prepri: generatePrepriLesson,
        nn: generateNNLesson
    };

    const gen = generators[skillId];
    return gen ? gen() : generateZhishiLesson();
}
