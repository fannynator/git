// js/components/lesson.js

import { $, $$, showToast, spawnXP, playAchievementAnim, safeGetItem, safeSetItem, safeRemoveItem } from '../utils.js';
import { state, saveState, getCurrentSkills, unlockAchievement, checkAchievements } from '../state.js';
import { GEMS, SKILL, CAT_SPEECH, STORAGE_KEY } from '../config.js';
import { generateMathLesson } from '../generators/math.js';
import { generateRusLesson } from '../generators/russian.js';
import { renderTask, showHint } from './taskRenderer.js';
import { renderSkillTree } from './skillTree.js';
import { updateTrapsBadge } from './trap.js';
import { updateStats, showAchievementToast } from '../app.js';
import { playSound, spawnLeaves } from '../sounds.js';

const LESSON_STORAGE_KEY = STORAGE_KEY + '_lesson_progress';
let stepHistory = [];

function generateLesson(skillId, subject) {
    if (subject === 'math') return generateMathLesson(skillId);
    return generateRusLesson(skillId);
}

function saveLessonProgress() {
    if (!state.currentLesson) return;
    const progress = {
        skillId: state.lessonSkillId, subject: state.subject,
        step: state.lessonStep, tasks: state.lessonTasks,
        correct: state.lessonCorrect, wrong: state.lessonWrong,
        stepHistory: stepHistory,
        hintsRemaining: state.lessonHintsRemaining,
        hintUsed: state.lessonHintUsed
    };
    safeSetItem(LESSON_STORAGE_KEY, JSON.stringify(progress));
}

function loadLessonProgress() {
    const saved = safeGetItem(LESSON_STORAGE_KEY);
    if (!saved) return false;
    try {
        const progress = JSON.parse(saved);
        if (!progress.skillId || !progress.tasks || progress.tasks.length === 0) return false;
        state.currentLesson = progress.skillId; state.lessonSkillId = progress.skillId;
        state.lessonStep = progress.step; state.lessonTasks = progress.tasks;
        state.lessonCorrect = progress.correct; state.lessonWrong = progress.wrong;
        stepHistory = progress.stepHistory || [];
        if (progress.hintsRemaining !== undefined) state.lessonHintsRemaining = progress.hintsRemaining;
        if (progress.hintUsed !== undefined) state.lessonHintUsed = progress.hintUsed;
        return true;
    } catch (e) { return false; }
}

function clearLessonProgress() { safeRemoveItem(LESSON_STORAGE_KEY); }

function initStepHistory() {
    const total = state.lessonTasks.length;
    stepHistory = new Array(total).fill('pending');
}

function updateProgressBar() {
    const total = state.lessonTasks.length;
    const done = state.lessonStep;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const bar = $('#lessonProgressBar');
    if (bar) { bar.style.width = percent + '%'; bar.classList.toggle('complete', percent >= 100); }
}

function renderDots() {
    const container = $('#lessonSteps');
    if (!container) return;
    const total = state.lessonTasks.length;
    let html = '';
    for (let i = 0; i < total; i++) {
        let dotClass = 'lstep-dot';
        if (stepHistory[i] === 'correct') dotClass += ' done';
        else if (stepHistory[i] === 'wrong') dotClass += ' wrong';
        else if (i === state.lessonStep && stepHistory[i] === 'pending') dotClass += ' current';
        html += `<span class="${dotClass}"></span>`;
    }
    container.innerHTML = html;
}

function initLessonHints() {
    state.lessonHintsRemaining = 2;
    state.lessonHintUsed = false;
    const btn = $('#lessonHintBtn');
    if (btn) btn.classList.remove('used');
}

function useHint() {
    if (state.lessonHintsRemaining <= 0) return;
    state.lessonHintsRemaining--;
    state.lessonHintUsed = true;
    const btn = $('#lessonHintBtn');
    if (btn) {
        btn.classList.add('used');
        if (state.lessonHintsRemaining <= 0) {
            btn.textContent = '💡 0';
            btn.style.opacity = '0.4';
            btn.style.pointerEvents = 'none';
        } else {
            btn.textContent = '💡 ' + state.lessonHintsRemaining;
        }
    }
    // Показать визуальную подсказку
    const scene = $('#lessonScene');
    const task = state.lessonTasks[state.lessonStep];
    if (scene && task) {
        showHint(scene, task);
        // Штраф XP за подсказку
        const penalty = 25;
        if (state.gems >= penalty) {
            state.gems -= penalty;
            updateStats();
        }
    }
    saveLessonProgress();
}

export function startLesson(skillId) {
    const saved = safeGetItem(LESSON_STORAGE_KEY);
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            if (progress.skillId === skillId && progress.tasks && progress.tasks.length > 0) {
                const skill = getCurrentSkills().find(s => s.id === skillId);
                const skillName = skill ? skill.name : 'Неизвестно';
                const resume = confirm(`🐱 У тебя есть незавершённый урок!\n\n📚 Тема: «${skillName}»\n📍 Пройдено: ${progress.step} из ${progress.tasks.length} заданий\n✅ Верных ответов: ${progress.correct}\n\nПродолжить урок?`);
                if (resume && loadLessonProgress()) {
                    const im = state.subject === 'math';
                    $('#lessonTitle').textContent = (im ? '🧮 ' : '📝 ') + skillName;
                    $('#lessonContainer').className = 'lesson-container ' + (im ? 'math-lesson' : 'rus-lesson');
                    $('#lessonHeader').className = 'lesson-header ' + (im ? 'math-bar' : 'rus-bar');
                    $('#lessonNextBtn').className = 'lesson-next ' + (im ? 'math-next' : 'rus-next');
                    $('#btnLessonFinish').className = 'btn-lesson-finish ' + (im ? 'math-finish' : 'rus-finish');
                    // Восстановить кнопку подсказок
                    const hintBtn = $('#lessonHintBtn');
                    if (hintBtn) {
                        hintBtn.classList.toggle('used', state.lessonHintsRemaining <= 0);
                        hintBtn.textContent = '💡 ' + state.lessonHintsRemaining;
                        hintBtn.style.opacity = state.lessonHintsRemaining <= 0 ? '0.4' : '1';
                        hintBtn.style.pointerEvents = state.lessonHintsRemaining <= 0 ? 'none' : 'auto';
                    }
                    updateDifficultyBadge();
                    updateProgressBar(); renderDots();
                    $('#lessonOverlay').classList.add('active');
                    $('#lessonNextBtn').classList.remove('show');
                    $('#lessonFinishBlock').classList.remove('show');
                    $('#lessonScene').style.display = 'flex';
                    renderLessonStep();
                    return;
                }
            }
        } catch (e) {}
        clearLessonProgress();
    }

    const im = state.subject === 'math';
    initLessonHints();
    state.currentLesson = skillId; state.lessonSkillId = skillId;
    state.lessonStep = 0; state.lessonCorrect = 0; state.lessonWrong = 0;
    state.lessonTasks = generateLesson(skillId, state.subject);
    initStepHistory();

    const skill = getCurrentSkills().find(s => s.id === skillId);
    $('#lessonTitle').textContent = (im ? '🧮 ' : '📝 ') + (skill ? skill.name : 'Урок');
    $('#lessonContainer').className = 'lesson-container ' + (im ? 'math-lesson' : 'rus-lesson');
    $('#lessonHeader').className = 'lesson-header ' + (im ? 'math-bar' : 'rus-bar');
    $('#lessonNextBtn').className = 'lesson-next ' + (im ? 'math-next' : 'rus-next');
    $('#btnLessonFinish').className = 'btn-lesson-finish ' + (im ? 'math-finish' : 'rus-finish');

    updateProgressBar(); renderDots();
    $('#lessonOverlay').classList.add('active');
    $('#lessonNextBtn').classList.remove('show');
    $('#lessonFinishBlock').classList.remove('show');
    $('#lessonScene').style.display = 'flex';
    // Активировать кнопку подсказок
    const hintBtn = $('#lessonHintBtn');
    if (hintBtn) {
        hintBtn.classList.remove('used');
        hintBtn.textContent = '💡 ' + state.lessonHintsRemaining;
        hintBtn.style.opacity = '1';
        hintBtn.style.pointerEvents = 'auto';
    }
    updateDifficultyBadge();
    saveLessonProgress();
    renderLessonStep();
}

// ─── Индикатор уровня сложности ───────────────────────────
function updateDifficultyBadge() {
    const badge = $('#difficultyBadge');
    if (!badge) return;
    const lvl = state.difficultyLevel;
    const stars = '⭐'.repeat(Math.min(lvl, 5));
    badge.textContent = (lvl > 5 ? `🔥 ` : '') + stars + ' ' + lvl;
    badge.classList.add('level-up');
    setTimeout(() => badge.classList.remove('level-up'), 600);
}

export async function closeLesson() {
    $('#lessonOverlay').classList.remove('active');
    state.currentLesson = null; state.lessonTasks = []; stepHistory = [];
    renderSkillTree();
    checkAchievements((name, desc) => showAchievementToast(name, desc));
    updateTrapsBadge();
    saveState();
}

function unlockNext(currentSkill) {
    const skills = getCurrentSkills();
    const ci = skills.findIndex(s => s.id === currentSkill.id);
    if (ci >= 0 && ci + 1 < skills.length && skills[ci + 1].status === 'locked') {
        skills[ci + 1].status = 'current';
        showToast('🔓', 'Новый навык открыт!', $('#toast'));
        spawnLeaves();
    }
}

async function renderLessonStep() {
    const task = state.lessonTasks[state.lessonStep];
    if (!task) { finishLesson(); return; }

    $('#lessonNextBtn').classList.remove('show');
    $('#lessonFinishBlock').classList.remove('show');
    const scene = $('#lessonScene');

    if (scene.children.length > 0) {
        scene.classList.add('task-transition');
        await new Promise(r => setTimeout(r, 200));
        scene.classList.remove('task-transition');
    }
    scene.style.display = 'flex';
    scene.style.animation = 'none'; scene.offsetHeight; scene.style.animation = '';

    const result = await renderTask(scene, task, { isBonus: false });

    if (state.lessonStep < stepHistory.length) {
        stepHistory[state.lessonStep] = result.isCorrect ? 'correct' : 'wrong';
    }

    if (result.isCorrect) { state.lessonCorrect++; }
    else { state.lessonWrong++; addLessonTrap(task); }

    renderDots(); updateProgressBar(); saveLessonProgress();
    setTimeout(() => $('#lessonNextBtn').classList.add('show'), 1000);
    scene.scrollTop = 0;
}

function addLessonTrap(task) {
    const id = 'lesson_' + state.lessonSkillId + '_' + Date.now();
    state.traps.push({
        id, question: task.question, options: task.options || null,
        correct: task.correctIdx ?? null, answer: task.correctAns,
        explanation: task.explanation,
        source: 'Урок: ' + ($('#lessonTitle')?.textContent || 'Неизвестно'),
        defuses: 0, nextDate: new Date().toISOString(),
        isInput: task.type === 'input' || (task.type && task.type.startsWith('boss')),
        subject: state.subject
    });
    unlockAchievement('firstBlood', (n, d) => showAchievementToast(n, d));
    saveState();
}

export function nextLessonStep() {
    state.lessonStep++;
    if (state.lessonStep >= state.lessonTasks.length) { finishLesson(); }
    else { saveLessonProgress(); renderDots(); updateProgressBar(); renderLessonStep(); $('#lessonScene').scrollTop = 0; }
}

function finishLesson() {
    clearLessonProgress();
    $('#lessonScene').style.display = 'none';
    $('#lessonNextBtn').classList.remove('show');
    $('#lessonFinishBlock').classList.add('show');

    const c = state.lessonCorrect, w = state.lessonWrong;
    $('#lfinishCorrect').textContent = c; $('#lfinishWrong').textContent = w;
    const totalTasks = state.lessonTasks.length;
    const xp = c * GEMS.LESSON_XP_PER_CORRECT + (w === 0 ? GEMS.LESSON_PERFECT_BONUS : 0);
    $('#lfinishXP').textContent = '+' + xp + ' 💎';

    if (w === 0) {
        $('#lfinishTitle').textContent = 'Идеально! 🌟';
        $('#lfinishSubtitle').textContent = 'Навык пройден!';
    } else {
        $('#lfinishTitle').textContent = 'Урок пройден!';
        $('#lfinishSubtitle').textContent = `${c}/${c + w} верно. Ошибки → 🪤`;
    }

    state.gems += xp; updateStats();
    
    // Всплывающие +XP
    const finishBlock = $('#lessonFinishBlock');
    if (finishBlock) {
        const rect = finishBlock.getBoundingClientRect();
        spawnXP(xp, rect.left + rect.width / 2 - 20, rect.top + 40);
    }
    
    // Lottie галочка при идеальном прохождении
    if (w === 0) {
        const medalWrap = document.createElement('div');
        medalWrap.className = 'lottie-container lottie-fade';
        document.body.appendChild(medalWrap);
        playAchievementAnim(medalWrap);
        setTimeout(() => medalWrap.remove(), 2500);
    }
    
    unlockAchievement('student', (n, d) => showAchievementToast(n, d));
    if (w === 0) unlockAchievement('master', (n, d) => showAchievementToast(n, d));
    playSound(w === 0 ? 'achievement' : 'correct', state.theme);

    const skill = getCurrentSkills().find(s => s.id === state.lessonSkillId);
    if (skill) {
        const ratio = c / totalTasks;
        const np = Math.min(100, skill.progress + Math.round(ratio * 100));
        skill.progress = np;
        if (np >= SKILL.PROGRESS_TO_COMPLETE) { skill.status = 'completed'; unlockNext(skill); }
    }

    // Adaptive difficulty
    const lessonRatio = c / totalTasks;
    const oldLevel = state.difficultyLevel;
    if (w === 0 && oldLevel < 10) {
        state.difficultyLevel++;
        showToast('📈', `Сложность повышена до уровня ${state.difficultyLevel}!`, $('#toast'));
    } else if (lessonRatio < 0.5 && oldLevel > 0) {
        state.difficultyLevel--;
        showToast('📉', `Сложность снижена до уровня ${state.difficultyLevel}`, $('#toast'));
    }
    updateDifficultyBadge();

    updateProgressBar();
    const catSpeech = $('#catSpeech');
    if (catSpeech) catSpeech.textContent = w === 0 ? CAT_SPEECH.lessonPerfect : CAT_SPEECH.lessonDone;

    stepHistory = []; updateTrapsBadge(); saveState();
    state.currentLesson = null; state.lessonTasks = [];
    renderSkillTree();
}

// ─── Регистрируем обработчик кнопки подсказки (замена window.useLessonHint) ───
const _hintBtn = document.getElementById('lessonHintBtn');
if (_hintBtn) _hintBtn.addEventListener('click', useHint);

export function checkSavedLesson() {
    const saved = safeGetItem(LESSON_STORAGE_KEY);
    if (!saved) return false;
    try {
        const progress = JSON.parse(saved);
        if (!progress.skillId || !progress.tasks || progress.tasks.length === 0) { clearLessonProgress(); return false; }
        const skill = getCurrentSkills().find(s => s.id === progress.skillId);
        const skillName = skill ? skill.name : 'Неизвестно';
        const resume = confirm(`🐱 У тебя есть незавершённый урок!\n\n📚 Тема: «${skillName}»\n📍 Пройдено: ${progress.step} из ${progress.tasks.length} заданий\n✅ Верных ответов: ${progress.correct}\n\nПродолжить урок?`);
        if (resume && loadLessonProgress()) {
            const im = state.subject === 'math';
            $('#lessonTitle').textContent = (im ? '🧮 ' : '📝 ') + skillName;
            $('#lessonContainer').className = 'lesson-container ' + (im ? 'math-lesson' : 'rus-lesson');
            $('#lessonHeader').className = 'lesson-header ' + (im ? 'math-bar' : 'rus-bar');
            $('#lessonNextBtn').className = 'lesson-next ' + (im ? 'math-next' : 'rus-next');
            $('#btnLessonFinish').className = 'btn-lesson-finish ' + (im ? 'math-finish' : 'rus-finish');
            updateProgressBar(); renderDots();
            $('#lessonOverlay').classList.add('active');
            $('#lessonNextBtn').classList.remove('show');
            $('#lessonFinishBlock').classList.remove('show');
            $('#lessonScene').style.display = 'flex';
            renderLessonStep();
            return true;
        }
    } catch (e) {}
    clearLessonProgress();
    return false;
}