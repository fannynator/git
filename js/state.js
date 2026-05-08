import {
    STORAGE_KEY, ACHIEVEMENTS_DEF, MATH_SKILLS_BY_CLASS, RUS_SKILLS_BY_CLASS,
    SUBJECTS, CLASSES, GEMS, TRAP, DEFAULT_THEME, THEMES, getTheme, countCompletedLessons,
    getSkillsForClass, getAllSkillsForSubject
} from './config.js';

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function cloneSkillsByClass(skillsByClass) {
    const out = {};
    for (const cls of Object.keys(skillsByClass)) {
        out[cls] = deepClone(skillsByClass[cls]);
    }
    return out;
}

// Миграция: старые плоские массивы → новая структура по классам
function migrateOldSkills(oldSkills, skillsByClass) {
    // Если пришли старые данные (плоский массив), пытаемся сопоставить по id
    if (Array.isArray(oldSkills)) {
        const migrated = cloneSkillsByClass(skillsByClass);
        for (const flatSkill of oldSkills) {
            for (const cls of Object.keys(migrated)) {
                const idx = migrated[cls].findIndex(s => s.id === flatSkill.id);
                if (idx >= 0) {
                    migrated[cls][idx].progress = flatSkill.progress || 0;
                    migrated[cls][idx].status = flatSkill.status || 'locked';
                }
            }
        }
        return migrated;
    }
    // Если уже новая структура, возвращаем как есть
    if (oldSkills && typeof oldSkills === 'object' && oldSkills[CLASSES.C12]) {
        return oldSkills;
    }
    return cloneSkillsByClass(skillsByClass);
}

export const state = {
    subject: SUBJECTS.MATH,
    currentClass: CLASSES.C12,
    streak: 7,
    gems: 245,
    totalPets: 0,
    storiesCompleted: { math: false, rus1: false, rus2: false },
    traps: [],
    achievements: deepClone(ACHIEVEMENTS_DEF),
    skills: {
        [SUBJECTS.MATH]: cloneSkillsByClass(MATH_SKILLS_BY_CLASS),
        [SUBJECTS.RUSSIAN]: cloneSkillsByClass(RUS_SKILLS_BY_CLASS)
    },
    currentLesson: null,
    lessonStep: 0,
    lessonTasks: [],
    lessonCorrect: 0,
    lessonWrong: 0,
    lessonSkillId: null,
    lessonHintsRemaining: 2,
    lessonHintUsed: false,
    currentStory: null,
    storyStep: 0,
    storyAnswered: false,
    subjectSwitches: 0,
    classSwitches: 0,
    perfectLessons: 0,
    difficultyLevel: 0,
    theme: DEFAULT_THEME,
    ownedItems: { hats: ['none'], glasses: ['none'], skins: ['orange'], accessories: ['none'] },
    activeItems: { hat: 'none', glasses: 'none', skin: 'orange', accessory: 'none' }
};

export const saveState = () => {
    const data = {
        skills: state.skills,
        gems: state.gems,
        streak: state.streak,
        storiesCompleted: state.storiesCompleted,
        traps: state.traps,
        achievements: state.achievements,
        totalPets: state.totalPets,
        subject: state.subject,
        currentClass: state.currentClass,
        subjectSwitches: state.subjectSwitches,
        classSwitches: state.classSwitches,
        perfectLessons: state.perfectLessons,
        difficultyLevel: state.difficultyLevel,
        theme: state.theme,
        ownedItems: state.ownedItems,
        activeItems: state.activeItems
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        if (data.skills) {
            // Математика
            if (data.skills[SUBJECTS.MATH]) {
                state.skills[SUBJECTS.MATH] = migrateOldSkills(data.skills[SUBJECTS.MATH], MATH_SKILLS_BY_CLASS);
            }
            // Русский
            if (data.skills[SUBJECTS.RUSSIAN]) {
                state.skills[SUBJECTS.RUSSIAN] = migrateOldSkills(data.skills[SUBJECTS.RUSSIAN], RUS_SKILLS_BY_CLASS);
            }
        }
        if (data.gems !== undefined) state.gems = data.gems;
        if (data.streak !== undefined) state.streak = data.streak;
        if (data.storiesCompleted) state.storiesCompleted = { ...state.storiesCompleted, ...data.storiesCompleted };
        if (data.traps) state.traps = data.traps;
        if (data.achievements) {
            Object.keys(data.achievements).forEach(key => {
                if (state.achievements[key] && data.achievements[key].unlocked) state.achievements[key].unlocked = true;
            });
        }
        if (data.totalPets !== undefined) state.totalPets = data.totalPets;
        if (data.subject) state.subject = data.subject;
        if (data.currentClass) state.currentClass = data.currentClass;
        if (data.subjectSwitches !== undefined) state.subjectSwitches = data.subjectSwitches;
        if (data.classSwitches !== undefined) state.classSwitches = data.classSwitches;
        if (data.perfectLessons !== undefined) state.perfectLessons = data.perfectLessons;
        if (data.difficultyLevel !== undefined) state.difficultyLevel = data.difficultyLevel;
        if (data.theme) state.theme = data.theme;
        if (data.ownedItems) state.ownedItems = data.ownedItems;
        if (data.activeItems) state.activeItems = data.activeItems;
    } catch (e) { console.warn('Ошибка загрузки:', e); }
};

/** Получить навыки текущего класса и предмета */
export const getCurrentSkills = () => {
    const cls = state.currentClass;
    return state.skills[state.subject]?.[cls] || [];
};

/** Получить все навыки текущего предмета (плоский список всех классов) */
export const getAllCurrentSubjectSkills = () => {
    const classesSkills = state.skills[state.subject];
    if (!classesSkills) return [];
    return Object.values(classesSkills).flat();
};

/** Найти навык по id в любом классе текущего предмета */
export const findSkillById = (skillId) => {
    const subjectSkills = state.skills[state.subject];
    if (!subjectSkills) return null;
    for (const cls of Object.values(CLASSES)) {
        const found = (subjectSkills[cls] || []).find(s => s.id === skillId);
        if (found) return { skill: found, cls };
    }
    return null;
};

export const unlockAchievement = (id, onUnlock) => {
    const ach = state.achievements[id];
    if (!ach || ach.unlocked) return false;
    ach.unlocked = true;
    state.gems += GEMS.ACHIEVEMENT_REWARD;
    saveState();
    if (onUnlock) onUnlock(ach.name, ach.desc);
    return true;
};

export const checkAchievements = (onUnlock) => {
    const done = (state.storiesCompleted.math ? 1 : 0) + (state.storiesCompleted.rus1 ? 1 : 0) + (state.storiesCompleted.rus2 ? 1 : 0);
    const def = state.traps.reduce((s, t) => s + t.defuses, 0);
    const checks = {
        detective: done >= 1,
        sherlock: done >= 2,
        holmes: done >= 3,
        saper: def >= 1,
        hunter: def >= 3,
        murmur: state.totalPets >= 10,
        firstBlood: state.traps.length > 0,
        explorer: state.classSwitches >= 3,
        seasoned: state.perfectLessons >= 5
    };
    Object.entries(checks).forEach(([id, cond]) => { if (cond) unlockAchievement(id, onUnlock); });

    // Проверка "Олимпиец" — все навыки текущего класса пройдены
    const currentSkills = getCurrentSkills();
    if (currentSkills.every(s => s.progress >= 100)) {
        unlockAchievement('olympian', onUnlock);
    }
};

export const getAvailableTraps = () => {
    return state.traps.filter(t => t.defuses < TRAP.MAX_DEFUSES && t.subject === state.subject);
};

export const getDefusedTraps = () => state.traps.filter(t => t.defuses >= TRAP.MAX_DEFUSES && t.subject === state.subject);

export const resetAllProgress = () => {
    state.skills[SUBJECTS.MATH] = cloneSkillsByClass(MATH_SKILLS_BY_CLASS);
    state.skills[SUBJECTS.RUSSIAN] = cloneSkillsByClass(RUS_SKILLS_BY_CLASS);
    state.gems = 245;
    state.streak = 7;
    state.totalPets = 0;
    state.subjectSwitches = 0;
    state.classSwitches = 0;
    state.perfectLessons = 0;
    state.difficultyLevel = 0;
    state.storiesCompleted = { math: false, rus1: false, rus2: false };
    state.traps = [];
    state.achievements = deepClone(ACHIEVEMENTS_DEF);
    state.subject = SUBJECTS.MATH;
    state.currentClass = CLASSES.C12;
    state.theme = DEFAULT_THEME;
    state.ownedItems = { hats: ['none'], glasses: ['none'], skins: ['orange'], accessories: ['none'] };
    state.activeItems = { hat: 'none', glasses: 'none', skin: 'orange', accessory: 'none' };
    localStorage.removeItem(STORAGE_KEY);
    applyTheme(DEFAULT_THEME);
};

/** Применить тему к body и CSS-переменным */
export const applyTheme = (themeId) => {
    const t = getTheme(themeId);
    if (!t) return;

    Object.keys(THEMES).forEach(k => document.body.classList.remove('theme-' + k));
    document.body.classList.add('theme-' + themeId);

    const root = document.documentElement;
    root.style.setProperty('--bg', t.bg);
    root.style.setProperty('--card', t.card);
    root.style.setProperty('--text', t.text);
    root.style.setProperty('--text-light', t.textLight);
    root.style.setProperty('--theme-primary', t.primary);
    root.style.setProperty('--theme-accent', t.accent);

    document.body.style.background = t.gradient;
    document.body.style.backgroundSize = '400% 400%';

    const catBody = document.getElementById('catBody');
    const catAvatar = document.getElementById('catAvatar');
    if (catBody) catBody.textContent = t.catEmoji;
    if (catAvatar) catAvatar.textContent = t.catEmoji;

    state.theme = themeId;
};

/** Проверить и разблокировать темы по прогрессу */
export const checkThemeUnlocks = () => {
    const totalMath = countCompletedLessons(getAllSkillsForSubject(SUBJECTS.MATH));
    const totalRus = countCompletedLessons(getAllSkillsForSubject(SUBJECTS.RUSSIAN));
    const totalDone = totalMath + totalRus;
    Object.values(THEMES).forEach(t => {
        if (!t.unlocked && t.unlockAt && totalDone >= t.unlockAt) {
            t.unlocked = true;
        }
    });
};

