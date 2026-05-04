import { STORAGE_KEY, ACHIEVEMENTS_DEF, MATH_SKILLS, RUS_SKILLS, SUBJECTS, GEMS, TRAP } from './config.js';

export const state = {
    subject: SUBJECTS.MATH, streak: 7, gems: 245, totalPets: 0,
    storiesCompleted: { math: false, rus1: false, rus2: false },
    traps: [],
    achievements: JSON.parse(JSON.stringify(ACHIEVEMENTS_DEF)),
    skills: {
        [SUBJECTS.MATH]: JSON.parse(JSON.stringify(MATH_SKILLS)),
        [SUBJECTS.RUSSIAN]: JSON.parse(JSON.stringify(RUS_SKILLS))
    },
    currentLesson: null, lessonStep: 0, lessonTasks: [], lessonCorrect: 0, lessonWrong: 0, lessonSkillId: null,
    _bonusAdded: false, _wrongTasks: [], _bonusCorrect: 0,
    currentStory: null, storyStep: 0, storyAnswered: false,
    subjectSwitches: 0
};

export const saveState = () => {
    const data = {
        skills: state.skills, gems: state.gems, streak: state.streak,
        storiesCompleted: state.storiesCompleted, traps: state.traps,
        achievements: state.achievements, totalPets: state.totalPets,
        subject: state.subject, subjectSwitches: state.subjectSwitches
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        if (data.skills) { state.skills[SUBJECTS.MATH] = data.skills[SUBJECTS.MATH] || state.skills[SUBJECTS.MATH]; state.skills[SUBJECTS.RUSSIAN] = data.skills[SUBJECTS.RUSSIAN] || state.skills[SUBJECTS.RUSSIAN]; }
        if (data.gems !== undefined) state.gems = data.gems;
        if (data.streak !== undefined) state.streak = data.streak;
        if (data.storiesCompleted) state.storiesCompleted = { ...state.storiesCompleted, ...data.storiesCompleted };
        if (data.traps) state.traps = data.traps;
        if (data.achievements) Object.keys(data.achievements).forEach(key => { if (state.achievements[key] && data.achievements[key].unlocked) state.achievements[key].unlocked = true; });
        if (data.totalPets !== undefined) state.totalPets = data.totalPets;
        if (data.subject) state.subject = data.subject;
        if (data.subjectSwitches !== undefined) state.subjectSwitches = data.subjectSwitches;
    } catch (e) { console.warn('Ошибка загрузки:', e); }
};

export const getCurrentSkills = () => state.skills[state.subject];

export const unlockAchievement = (id) => {
    const ach = state.achievements[id];
    if (!ach || ach.unlocked) return false;
    ach.unlocked = true; state.gems += GEMS.ACHIEVEMENT_REWARD; saveState(); return true;
};

export const checkAchievements = () => {
    const done = (state.storiesCompleted.math?1:0)+(state.storiesCompleted.rus1?1:0)+(state.storiesCompleted.rus2?1:0);
    const def = state.traps.reduce((s,t)=>s+t.defuses,0);
    const checks = {
        detective: done>=1, sherlock: done>=2, holmes: done>=3, saper: def>=1, hunter: def>=3,
        murmur: state.totalPets>=10, firstBlood: state.traps.length>0
    };
    const unlocked = [];
    Object.entries(checks).forEach(([id,cond])=>{ if(cond&&unlockAchievement(id)) unlocked.push(id); });
    return unlocked;
};

export const getAvailableTraps = () => {
    const now = new Date();
    return state.traps.filter(t=>t.defuses < TRAP.MAX_DEFUSES && new Date(t.nextDate) <= now && t.subject === state.subject);
};

export const getLockedTraps = () => {
    const now = new Date();
    return state.traps.filter(t=>t.defuses < TRAP.MAX_DEFUSES && new Date(t.nextDate) > now && t.subject === state.subject);
};

export const getDefusedTraps = () => state.traps.filter(t=>t.defuses >= TRAP.MAX_DEFUSES && t.subject === state.subject);

export const getTrapDelay = (defuses) => (TRAP.DELAY_SLOTS[defuses] || 14) * 86400000;

export const resetAllProgress = () => {
    state.skills[SUBJECTS.MATH] = JSON.parse(JSON.stringify(MATH_SKILLS));
    state.skills[SUBJECTS.RUSSIAN] = JSON.parse(JSON.stringify(RUS_SKILLS));
    state.gems = 245; state.streak = 7; state.totalPets = 0; state.subjectSwitches = 0;
    state.storiesCompleted = { math: false, rus1: false, rus2: false };
    state.traps = []; state.achievements = JSON.parse(JSON.stringify(ACHIEVEMENTS_DEF));
    state.subject = SUBJECTS.MATH;
    localStorage.removeItem(STORAGE_KEY);
};