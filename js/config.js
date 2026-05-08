// ──────────────────────────────────────────────
//  КОНФИГУРАЦИЯ — v17 (ФГОС-полный набор навыков)
// ──────────────────────────────────────────────

export const STORAGE_KEY = 'kot_ucheniy_v17';
export const TUTORIAL_KEY = 'kot_ucheniy_tutorial_done';

export const SUBJECTS = { MATH: 'math', RUSSIAN: 'russian' };

// Классы (группы сложности)
export const CLASSES = {
    C12: 'class12',  // 1–2 класс
    C34: 'class34',  // 3–4 класс (2–4 по ФГОС, но мы группируем)
    C56: 'class56'   // 5–6 класс (4–6 по ФГОС)
};

export const CLASS_INFO = {
    [CLASSES.C12]: { name: '1–2 класс', emoji: '🌱', color: '#22C55E', desc: 'Базовые навыки' },
    [CLASSES.C34]: { name: '3–4 класс', emoji: '🌿', color: '#F59E0B', desc: 'Средний уровень' },
    [CLASSES.C56]: { name: '5–6 класс', emoji: '🌳', color: '#EF4444', desc: 'Продвинутый' }
};

export const GEMS = {
    CORRECT_ANSWER: 5, LESSON_XP_PER_CORRECT: 5, LESSON_PERFECT_BONUS: 25,
    BONUS_REPEAT_XP: 3, ACHIEVEMENT_REWARD: 15, TRAP_BASE_REWARD: 5,
    TRAP_DEFUSE_MULTIPLIER: 3, STORY_MATH_REWARD: 40, STORY_RUS_REWARD: 50
};

export const TRAP = { MAX_DEFUSES: 1, DELAY_SLOTS: [1, 3, 7, 14] };
export const SKILL = { PROGRESS_TO_COMPLETE: 100 };

export const ACHIEVEMENTS_DEF = {
    detective:  { name: '🕵️ Детектив',   desc: 'Пройти 1 историю',        unlocked: false },
    sherlock:   { name: '🔍 Шерлок',      desc: 'Пройти 2 истории',        unlocked: false },
    holmes:     { name: '🎩 Холмс',       desc: 'Пройти 3 истории',        unlocked: false },
    saper:      { name: '🪤 Сапёр',       desc: 'Обезвредить ловушку',     unlocked: false },
    hunter:     { name: '💣 Охотник',     desc: 'Обезвредить 3',           unlocked: false },
    murmur:     { name: '🐱 Мур-мур',     desc: 'Погладить 10 раз',        unlocked: false },
    erudite:    { name: '📚 Эрудит',      desc: 'Переключить предмет 5 раз', unlocked: false },
    firstBlood: { name: '💎 Первая кровь',desc: 'Ошибка → ловушки',        unlocked: false },
    student:    { name: '🎓 Ученик',      desc: 'Пройти 1 урок',           unlocked: false },
    master:     { name: '🏅 Мастер',      desc: 'Урок без ошибок',         unlocked: false },
    explorer:   { name: '🗺️ Исследователь', desc: 'Сменить класс 3 раза', unlocked: false },
    olympian:   { name: '🥇 Олимпиец',    desc: 'Пройти все навыки класса', unlocked: false },
    seasoned:   { name: '⭐ Матёрый',     desc: 'Пройти 5 уроков без ошибок', unlocked: false }
};

// ─── НАВЫКИ ПО КЛАССАМ (ФГОС) ───────────────
// Математика
export const MATH_SKILLS_BY_CLASS = {
    [CLASSES.C12]: [
        { id: 'add',          name: 'Сложение',            icon: '➕', color: '#3B82F6', progress: 0, status: 'current' },
        { id: 'sub',          name: 'Вычитание',           icon: '➖', color: '#EF4444', progress: 0, status: 'locked' },
        { id: 'mul_small',    name: 'Таблица × до 5',      icon: '✖️', color: '#F59E0B', progress: 0, status: 'locked' },
        { id: 'div_small',    name: 'Таблица ÷ до 5',      icon: '➗', color: '#06B6D4', progress: 0, status: 'locked' },
        { id: 'compare',      name: 'Сравнение чисел',     icon: '⚖️', color: '#8B5CF6', progress: 0, status: 'locked' },
        { id: 'comp_num',     name: 'Состав числа',        icon: '🧩', color: '#EAB308', progress: 0, status: 'locked' },
        { id: 'even_odd',     name: 'Чётные / нечётные',   icon: '🔢', color: '#F97316', progress: 0, status: 'locked' }
    ],
    [CLASSES.C34]: [
        { id: 'mul',          name: 'Умножение',           icon: '✖️', color: '#F59E0B', progress: 0, status: 'current' },
        { id: 'div',          name: 'Деление',             icon: '➗', color: '#8B5CF6', progress: 0, status: 'locked' },
        { id: 'eq',           name: 'Уравнения',           icon: '🔎', color: '#EC4899', progress: 0, status: 'locked' },
        { id: 'geom',         name: 'Периметр и площадь',  icon: '📏', color: '#14B8A6', progress: 0, status: 'locked' },
        { id: 'order_ops',    name: 'Порядок действий',    icon: '🔢', color: '#A855F7', progress: 0, status: 'locked' },
        { id: 'mul_table',    name: 'Таблица умножения',   icon: '📊', color: '#EF4444', progress: 0, status: 'locked' },
        { id: 'len_units',    name: 'Единицы длины',       icon: '📏', color: '#22C55E', progress: 0, status: 'locked' },
        { id: 'mass_units',   name: 'Единицы массы',       icon: '⚖️', color: '#EAB308', progress: 0, status: 'locked' },
        { id: 'time_clock',   name: 'Время и часы',        icon: '🕐', color: '#06B6D4', progress: 0, status: 'locked' },
        { id: 'money',        name: 'Деньги',              icon: '💰', color: '#F97316', progress: 0, status: 'locked' }
    ],
    [CLASSES.C56]: [
        { id: 'frac',         name: 'Дроби',               icon: '🍕', color: '#F97316', progress: 0, status: 'current' },
        { id: 'percent',      name: 'Проценты',            icon: '💯', color: '#06B6D4', progress: 0, status: 'locked' },
        { id: 'neg',          name: 'Отрицательные числа', icon: '🌡️', color: '#A855F7', progress: 0, status: 'locked' },
        { id: 'prop',         name: 'Пропорции',           icon: '⚡', color: '#EAB308', progress: 0, status: 'locked' },
        { id: 'decimal',      name: 'Десятичные дроби',    icon: '🔢', color: '#EC4899', progress: 0, status: 'locked' },
        { id: 'divisibility', name: 'Признаки делимости',  icon: '🔍', color: '#14B8A6', progress: 0, status: 'locked' },
        { id: 'gcd_lcm',      name: 'НОД и НОК',           icon: '🧮', color: '#8B5CF6', progress: 0, status: 'locked' },
        { id: 'coord',        name: 'Координатная прямая', icon: '📉', color: '#3B82F6', progress: 0, status: 'locked' },
        { id: 'motion',       name: 'Задачи на движение',  icon: '🚗', color: '#EF4444', progress: 0, status: 'locked' }
    ]
};

// Русский язык
export const RUS_SKILLS_BY_CLASS = {
    [CLASSES.C12]: [
        { id: 'zhishi',           name: 'ЖИ/ШИ, ЧА/ЩА, ЧУ/ЩУ', icon: '✍️', color: '#7C3AED', progress: 0, status: 'current' },
        { id: 'soft',             name: 'Разделительный Ь и Ъ', icon: '🧩', color: '#8B5CF6', progress: 0, status: 'locked' },
        { id: 'vowel',            name: 'Безударные гласные',   icon: '🔎', color: '#F59E0B', progress: 0, status: 'locked' },
        { id: 'vocab',            name: 'Словарные слова',      icon: '📖', color: '#EC4899', progress: 0, status: 'locked' },
        { id: 'paired_consonants',name: 'Парные звонкие/глухие',icon: '🔊', color: '#EF4444', progress: 0, status: 'locked' },
        { id: 'word_wrap',        name: 'Перенос слов',         icon: '↩️', color: '#06B6D4', progress: 0, status: 'locked' },
        { id: 'capital_letter',   name: 'Заглавная буква',      icon: '🔠', color: '#EAB308', progress: 0, status: 'locked' }
    ],
    [CLASSES.C34]: [
        { id: 'silent',        name: 'Непроизносимые согласные',icon: '🗣️', color: '#EC4899', progress: 0, status: 'current' },
        { id: 'tsya',          name: '-ТСЯ/-ТЬСЯ',              icon: '🔄', color: '#14B8A6', progress: 0, status: 'locked' },
        { id: 'prepri',        name: 'ПРЕ/ПРИ',                 icon: '🎯', color: '#F97316', progress: 0, status: 'locked' },
        { id: 'noun_case',     name: 'Падежи',                  icon: '📋', color: '#7C3AED', progress: 0, status: 'locked' },
        { id: 'word_parts',    name: 'Состав слова',            icon: '🧱', color: '#F59E0B', progress: 0, status: 'locked' },
        { id: 'same_root',     name: 'Однокоренные слова',      icon: '🌳', color: '#22C55E', progress: 0, status: 'locked' },
        { id: 'syn_ant',       name: 'Синонимы / Антонимы',     icon: '🔄', color: '#A855F7', progress: 0, status: 'locked' },
        { id: 'parts_speech',  name: 'Части речи',              icon: '🏷️', color: '#06B6D4', progress: 0, status: 'locked' },
        { id: 'gender_num',    name: 'Род и число',             icon: '👥', color: '#EAB308', progress: 0, status: 'locked' },
        { id: 'prep_pref',     name: 'Предлоги и приставки',    icon: '🔤', color: '#8B5CF6', progress: 0, status: 'locked' }
    ],
    [CLASSES.C56]: [
        { id: 'nn',             name: 'Н и НН',                  icon: '📋', color: '#EF4444', progress: 0, status: 'current' },
        { id: 'partic',         name: 'Причастия и деепричастия',icon: '📝', color: '#F59E0B', progress: 0, status: 'locked' },
        { id: 'complex',        name: 'Сложные предложения',     icon: '🧵', color: '#8B5CF6', progress: 0, status: 'locked' },
        { id: 'punct',          name: 'Пунктуация',              icon: '❗', color: '#EC4899', progress: 0, status: 'locked' },
        { id: 'conjugation',    name: 'Спряжение глаголов',      icon: '🔄', color: '#F97316', progress: 0, status: 'locked' },
        { id: 'alt_vowels',     name: 'Чередующиеся гласные',    icon: '〰️', color: '#14B8A6', progress: 0, status: 'locked' },
        { id: 'oe_sibilant',    name: 'О/Ё после шипящих',       icon: '🔤', color: '#A855F7', progress: 0, status: 'locked' },
        { id: 'ne_verbs',       name: 'НЕ с глаголами',          icon: '🚫', color: '#3B82F6', progress: 0, status: 'locked' },
        { id: 'case_endings',   name: 'Падежные окончания',      icon: '📝', color: '#22C55E', progress: 0, status: 'locked' }
    ]
};

// Плоские списки
export const MATH_SKILLS = Object.values(MATH_SKILLS_BY_CLASS).flat();
export const RUS_SKILLS = Object.values(RUS_SKILLS_BY_CLASS).flat();

// Получить навыки для конкретного класса и предмета
export function getSkillsForClass(subject, cls) {
    if (subject === SUBJECTS.MATH) return MATH_SKILLS_BY_CLASS[cls] || [];
    return RUS_SKILLS_BY_CLASS[cls] || [];
}

// Получить все навыки предмета
export function getAllSkillsForSubject(subject) {
    if (subject === SUBJECTS.MATH) return MATH_SKILLS;
    return RUS_SKILLS;
}

// Узнать класс навыка по его id
export function getClassForSkill(skillId) {
    for (const cls of Object.values(CLASSES)) {
        const m = MATH_SKILLS_BY_CLASS[cls].find(s => s.id === skillId);
        if (m) return cls;
        const r = RUS_SKILLS_BY_CLASS[cls].find(s => s.id === skillId);
        if (r) return cls;
    }
    return CLASSES.C12;
}

export const CAT_SPEECH = {
    math: 'Мур! Математика!',
    russian: 'Мур! Русский язык!',
    pet: (count) => count >= 10 ? 'Мур-мур! 💖' : 'Мррр!',
    lessonPerfect: 'Мур! Идеально! 🌟',
    lessonDone: 'Мур! Ошибки в ловушках 🪤',
    storyDone: 'Мур! Дело раскрыто! 🏆'
};

export const SUBJECT_EMOJI = { math: '🐱', russian: '😺' };
export const DEFAULT_THEME = 'light';

export const THEMES = {
    light: {
        id: 'light', name: '☀️ Солнечная', catEmoji: '🐱',
        bg: '#F8FAFC', card: '#FFFFFF', text: '#1E293B', textLight: '#94A3B8',
        primary: '#3B82F6', accent: '#F59E0B',
        gradient: 'linear-gradient(135deg, #E2E8F0 0%, #F1F5F9 50%, #E8EDF2 100%)',
        bgEffect: 'sunlight', unlocked: true
    },
    dark: {
        id: 'dark', name: '🌙 Ночная', catEmoji: '🐈‍⬛',
        bg: '#0F172A', card: '#1E293B', text: '#F1F5F9', textLight: '#94A3B8',
        primary: '#818CF8', accent: '#FBBF24',
        gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        bgEffect: 'stars', unlocked: true
    },
    forest: {
        id: 'forest', name: '🌲 Лес', catEmoji: '🐱',
        bg: '#F0FDF4', card: '#FFFFFF', text: '#14532D', textLight: '#65A30D',
        primary: '#16A34A', accent: '#CA8A04',
        gradient: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 50%, #ECFCCB 100%)',
        bgEffect: 'leaves', unlocked: false, unlockAt: 3
    },
    space: {
        id: 'space', name: '🚀 Космос', catEmoji: '🐱',
        bg: '#0A0A1A', card: '#1A1A3E', text: '#E2E8F0', textLight: '#818CF8',
        primary: '#A855F7', accent: '#06B6D4',
        gradient: 'linear-gradient(135deg, #0A0A1A 0%, #1A1A3E 100%)',
        bgEffect: 'nebula', unlocked: false, unlockAt: 7
    },
    underwater: {
        id: 'underwater', name: '🌊 Под водой', catEmoji: '🐱',
        bg: '#E0F2FE', card: '#FFFFFF', text: '#0C4A6E', textLight: '#0284C7',
        primary: '#0EA5E9', accent: '#F97316',
        gradient: 'linear-gradient(135deg, #BAE6FD 0%, #E0F2FE 50%, #7DD3FC 100%)',
        bgEffect: 'bubbles', unlocked: false, unlockAt: 12
    }
};

export const getTheme = (id) => THEMES[id] || THEMES[DEFAULT_THEME];

/** Сколько уроков пройдено (completed skills) */
export const countCompletedLessons = (skills) => {
    if (!skills) return 0;
    if (Array.isArray(skills)) return skills.filter(s => s && s.progress >= 100).length;
    return Object.values(skills).filter(s => s && s.progress >= 100).length;
};