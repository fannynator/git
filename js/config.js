export const STORAGE_KEY = 'kot_ucheniy_v15';
export const TUTORIAL_KEY = 'kot_ucheniy_tutorial_done';

export const SUBJECTS = { MATH: 'math', RUSSIAN: 'russian' };

export const GEMS = {
    CORRECT_ANSWER: 5, LESSON_XP_PER_CORRECT: 5, LESSON_PERFECT_BONUS: 25,
    BONUS_REPEAT_XP: 3, ACHIEVEMENT_REWARD: 15, TRAP_BASE_REWARD: 5,
    TRAP_DEFUSE_MULTIPLIER: 3, STORY_MATH_REWARD: 40, STORY_RUS_REWARD: 50
};

export const TRAP = { MAX_DEFUSES: 4, DELAY_SLOTS: [1, 3, 7, 14] };
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
    master:     { name: '🏅 Мастер',      desc: 'Урок без ошибок',         unlocked: false }
};

export const MATH_SKILLS = [
    { id: 'add',  name: 'Сложение',           icon: '➕', color: '#3B82F6', progress: 0, status: 'current' },
    { id: 'sub',  name: 'Вычитание',          icon: '➖', color: '#EF4444', progress: 0, status: 'locked' },
    { id: 'mul',  name: 'Умножение',          icon: '✖️', color: '#F59E0B', progress: 0, status: 'locked' },
    { id: 'div',  name: 'Деление',            icon: '➗', color: '#8B5CF6', progress: 0, status: 'locked' },
    { id: 'eq',   name: 'Уравнения',          icon: '🔎', color: '#EC4899', progress: 0, status: 'locked' },
    { id: 'geom', name: 'Периметр и площадь', icon: '📏', color: '#14B8A6', progress: 0, status: 'locked' },
    { id: 'frac', name: 'Дроби',             icon: '🍕', color: '#F97316', progress: 0, status: 'locked' }
];

export const RUS_SKILLS = [
    { id: 'zhishi',  name: 'ЖИ/ШИ, ЧА/ЩА, ЧУ/ЩУ',  icon: '✍️',  color: '#7C3AED', progress: 0, status: 'current' },
    { id: 'soft',    name: 'Разделительный Ь и Ъ',   icon: '🧩', color: '#8B5CF6', progress: 0, status: 'locked' },
    { id: 'vowel',   name: 'Безударные гласные',     icon: '🔎', color: '#F59E0B', progress: 0, status: 'locked' },
    { id: 'silent',  name: 'Непроизносимые согласные',icon: '🗣️', color: '#EC4899', progress: 0, status: 'locked' },
    { id: 'tsya',    name: '-ТСЯ/-ТЬСЯ',             icon: '🔄', color: '#14B8A6', progress: 0, status: 'locked' },
    { id: 'prepri',  name: 'ПРЕ/ПРИ',                icon: '🎯', color: '#F97316', progress: 0, status: 'locked' },
    { id: 'nn',      name: 'Н и НН',                 icon: '📋', color: '#EF4444', progress: 0, status: 'locked' }
];

export const CAT_SPEECH = {
    math: 'Мур! Математика!',
    russian: 'Мур! Русский язык!',
    pet: (count) => count >= 10 ? 'Мур-мур! 💖' : 'Мррр!',
    lessonPerfect: 'Мур! Идеально! 🌟',
    lessonDone: 'Мур! Ошибки в ловушках 🪤',
    storyDone: 'Мур! Дело раскрыто! 🏆'
};

export const SUBJECT_EMOJI = { math: '🐱', russian: '😺' };