import { $, $$, showToast } from '../utils.js';
import { state, saveState, getCurrentSkills, unlockAchievement, checkAchievements } from '../state.js';
import { GEMS, SKILL, CAT_SPEECH, STORAGE_KEY } from '../config.js';
import { generateMathLesson } from '../generators/math.js';
import { generateRusLesson } from '../generators/russian.js';
import { renderTask } from './taskRenderer.js';
import { renderSkillTree } from './skillTree.js';
import { updateTrapsBadge } from './trap.js';
import { updateStats, showAchievementToast } from '../app.js';
import { playSound } from '../sounds.js';

const LESSON_STORAGE_KEY = STORAGE_KEY + '_lesson_progress';

function generateLesson(skillId, subject) {
    if (subject === 'math') return generateMathLesson(skillId);
    return generateRusLesson(skillId);
}

function saveLessonProgress() {
    if (!state.currentLesson) return;
    const progress = {
        skillId: state.lessonSkillId,
        subject: state.subject,
        step: state.lessonStep,
        tasks: state.lessonTasks,
        correct: state.lessonCorrect,
        wrong: state.lessonWrong,
        bonusAdded: state._bonusAdded,
        wrongTasks: state._wrongTasks,
        bonusCorrect: state._bonusCorrect
    };
    localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(progress));
}

function loadLessonProgress() {
    const saved = localStorage.getItem(LESSON_STORAGE_KEY);
    if (!saved) return false;
    try {
        const progress = JSON.parse(saved);
        if (!progress.skillId || !progress.tasks || progress.tasks.length === 0) return false;
        state.currentLesson = progress.skillId;
        state.lessonSkillId = progress.skillId;
        state.lessonStep = progress.step;
        state.lessonTasks = progress.tasks;
        state.lessonCorrect = progress.correct;
        state.lessonWrong = progress.wrong;
        state._bonusAdded = progress.bonusAdded || false;
        state._wrongTasks = progress.wrongTasks || [];
        state._bonusCorrect = progress.bonusCorrect || 0;
        return true;
    } catch (e) { return false; }
}

function clearLessonProgress() {
    localStorage.removeItem(LESSON_STORAGE_KEY);
}

export function startLesson(skillId) {
    const saved = localStorage.getItem(LESSON_STORAGE_KEY);
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            if (progress.skillId === skillId && progress.tasks && progress.tasks.length > 0) {
                const skill = getCurrentSkills().find(s => s.id === skillId);
                const skillName = skill ? skill.name : 'Неизвестно';
                const resume = confirm(
                    `🐱 У тебя есть незавершённый урок!\n\n` +
                    `📚 Тема: «${skillName}»\n` +
                    `📍 Пройдено: ${progress.step} из ${progress.tasks.length} заданий\n` +
                    `✅ Верных ответов: ${progress.correct}\n\n` +
                    `Продолжить урок?`
                );
                if (resume) {
                    if (loadLessonProgress()) {
                        const im = state.subject === 'math';
                        $('#lessonTitle').textContent = (im ? '🧮 ' : '📝 ') + skillName;
                        $('#lessonContainer').className = 'lesson-container ' + (im ? 'math-lesson' : 'rus-lesson');
                        $('#lessonHeader').className = 'lesson-header ' + (im ? 'math-bar' : 'rus-bar');
                        $('#lessonNextBtn').className = 'lesson-next ' + (im ? 'math-next' : 'rus-next');
                        $('#btnLessonFinish').className = 'btn-lesson-finish ' + (im ? 'math-finish' : 'rus-finish');
                        refreshDots();
                        updateDots();
                        $('#lessonOverlay').classList.add('active');
                        $('#lessonNextBtn').classList.remove('show');
                        $('#lessonFinishBlock').classList.remove('show');
                        $('#lessonScene').style.display = 'flex';
                        renderLessonStep();
                        return;
                    }
                } else {
                    clearLessonProgress();
                }
            }
        } catch (e) { clearLessonProgress(); }
    }

    const im = state.subject === 'math';
    state.currentLesson = skillId;
    state.lessonSkillId = skillId;
    state.lessonStep = 0;
    state.lessonCorrect = 0;
    state.lessonWrong = 0;
    state._bonusAdded = false;
    state._wrongTasks = [];
    state._bonusCorrect = 0;
    state.lessonTasks = generateLesson(skillId, state.subject);

    const skill = getCurrentSkills().find(s => s.id === skillId);
    $('#lessonTitle').textContent = (im ? '🧮 ' : '📝 ') + (skill ? skill.name : 'Урок');
    $('#lessonContainer').className = 'lesson-container ' + (im ? 'math-lesson' : 'rus-lesson');
    $('#lessonHeader').className = 'lesson-header ' + (im ? 'math-bar' : 'rus-bar');
    $('#lessonNextBtn').className = 'lesson-next ' + (im ? 'math-next' : 'rus-next');
    $('#btnLessonFinish').className = 'btn-lesson-finish ' + (im ? 'math-finish' : 'rus-finish');

    refreshDots();
    $('#lessonOverlay').classList.add('active');
    $('#lessonNextBtn').classList.remove('show');
    $('#lessonFinishBlock').classList.remove('show');
    $('#lessonScene').style.display = 'flex';
    saveLessonProgress();
    renderLessonStep();
}

function refreshDots() {
    $('#lessonSteps').innerHTML = state.lessonTasks.map((_, i) =>
        `<span class="lstep-dot ${i < state.lessonStep ? 'done' : (i === state.lessonStep ? 'current' : '')}"></span>`
    ).join('');
}

function updateDots() {
    const dots = $$('#lessonSteps .lstep-dot');
    dots.forEach((d, i) => {
        d.classList.remove('done', 'current', 'wrong');
        if (i < state.lessonStep) d.classList.add('done');
        else if (i === state.lessonStep) d.classList.add(state.lessonWrong > 0 ? 'wrong' : 'current');
    });
}
function updateProgressBar() {
    const total = state.lessonTasks.filter(t => !t.isBonus).length;
    const done = state.lessonStep;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    
    const bar = $('#lessonProgressBar');
    if (bar) {
        bar.style.width = percent + '%';
        if (percent >= 100) {
            bar.classList.add('complete');
        } else {
            bar.classList.remove('complete');
        }
    }
}

export async function closeLesson() {
    $('#lessonOverlay').classList.remove('active');
    state.currentLesson = null;
    state.lessonTasks = [];
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
    }
}

async function renderLessonStep() {
    const task = state.lessonTasks[state.lessonStep];
    if (!task) { finishLesson(); return; }

    $('#lessonNextBtn').classList.remove('show');
    $('#lessonFinishBlock').classList.remove('show');
    
    const scene = $('#lessonScene');
    
    // Анимация исчезновения старого задания
    if (scene.children.length > 0) {
        scene.classList.add('task-transition');
        await new Promise(r => setTimeout(r, 200));
        scene.classList.remove('task-transition');
    }
    
    // Очищаем и показываем новое
    scene.style.display = 'flex';
    // Принудительно сбрасываем анимацию
    scene.style.animation = 'none';
    scene.offsetHeight; // reflow
    scene.style.animation = '';

    const result = await renderTask(scene, task, { isBonus: task.isBonus || false });
    
    if (!task.isBonus) {
        if (result.isCorrect) state.lessonCorrect++;
        else { state.lessonWrong++; state._wrongTasks.push(task); addLessonTrap(task); }
    } else {
        if (result.isCorrect) state._bonusCorrect++;
        else state._bonusCorrect--;
    }

    updateDots();
    saveLessonProgress();
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
    unlockAchievement('firstBlood', (name, desc) => showAchievementToast(name, desc));
    saveState();
}

export function nextLessonStep() {
    state.lessonStep++;
    if (state.lessonStep >= state.lessonTasks.length) {
        if (!state._bonusAdded && state._wrongTasks.length > 0) {
            state._bonusAdded = true; state._bonusCorrect = 0;
            state._wrongTasks.forEach(wt => {
                state.lessonTasks.push({ ...wt, emoji: '🔄', badge: 'Повтор', badgeClass: 'badge-bonus', question: wt.question, explanation: 'Закрепляем!', isBonus: true });
            });
            refreshDots();
            saveLessonProgress();
            renderLessonStep();
            $('#lessonScene').scrollTop = 0;
            return;
        }
        finishLesson();
    } else {
        saveLessonProgress();
        renderLessonStep();
        $('#lessonScene').scrollTop = 0;
    }
}

function finishLesson() {
    clearLessonProgress();
    $('#lessonScene').style.display = 'none';
    $('#lessonNextBtn').classList.remove('show');
    $('#lessonFinishBlock').classList.add('show');

    const c = state.lessonCorrect, w = state.lessonWrong, bcr = state._bonusCorrect || 0;
    $('#lfinishCorrect').textContent = c;
    $('#lfinishWrong').textContent = w;
    const totalTasks = state.lessonTasks.filter(t => !t.isBonus).length || 8;
    const xp = c * GEMS.LESSON_XP_PER_CORRECT + (w === 0 ? GEMS.LESSON_PERFECT_BONUS : 0) + bcr * GEMS.BONUS_REPEAT_XP;
    $('#lfinishXP').textContent = '+' + xp + ' 💎';
    
    if (w === 0) {
        $('#lfinishTitle').textContent = 'Идеально! 🌟';
        $('#lfinishSubtitle').textContent = 'Навык пройден!';
    } else {
        $('#lfinishTitle').textContent = 'Урок пройден!';
        $('#lfinishSubtitle').textContent = `${c}/${c + w} верно. Ошибки → 🪤`;
    }
    
    state.gems += xp;
    updateStats();
    unlockAchievement('student', (name, desc) => showAchievementToast(name, desc));
    if (w === 0) unlockAchievement('master', (name, desc) => showAchievementToast(name, desc));
    playSound(w === 0 ? 'achievement' : 'correct');
    
    const skill = getCurrentSkills().find(s => s.id === state.lessonSkillId);
    if (skill) {
        const ratio = c / totalTasks;
        const np = Math.min(100, skill.progress + Math.round(ratio * 100));
        skill.progress = np;
        if (np >= SKILL.PROGRESS_TO_COMPLETE) {
            skill.status = 'completed';
            unlockNext(skill);
        }
    }
    
    $$('#lessonSteps .lstep-dot').forEach(d => { d.classList.add('done'); d.classList.remove('current', 'wrong'); });
    const catSpeech = $('#catSpeech');
    if (catSpeech) catSpeech.textContent = w === 0 ? CAT_SPEECH.lessonPerfect : CAT_SPEECH.lessonDone;
    
    updateTrapsBadge();
    saveState();
    state.currentLesson = null;
    state.lessonTasks = [];
    renderSkillTree();
}

export function checkSavedLesson() {
    const saved = localStorage.getItem(LESSON_STORAGE_KEY);
    if (!saved) return false;
    try {
        const progress = JSON.parse(saved);
        if (!progress.skillId || !progress.tasks || progress.tasks.length === 0) {
            clearLessonProgress();
            return false;
        }
        const skill = getCurrentSkills().find(s => s.id === progress.skillId);
        const skillName = skill ? skill.name : 'Неизвестно';
        const resume = confirm(
            `🐱 У тебя есть незавершённый урок!\n\n` +
            `📚 Тема: «${skillName}»\n` +
            `📍 Пройдено: ${progress.step} из ${progress.tasks.length} заданий\n` +
            `✅ Верных ответов: ${progress.correct}\n\n` +
            `Продолжить урок?`
        );
        if (resume) {
            if (loadLessonProgress()) {
                const im = state.subject === 'math';
                $('#lessonTitle').textContent = (im ? '🧮 ' : '📝 ') + skillName;
                $('#lessonContainer').className = 'lesson-container ' + (im ? 'math-lesson' : 'rus-lesson');
                $('#lessonHeader').className = 'lesson-header ' + (im ? 'math-bar' : 'rus-bar');
                $('#lessonNextBtn').className = 'lesson-next ' + (im ? 'math-next' : 'rus-next');
                $('#btnLessonFinish').className = 'btn-lesson-finish ' + (im ? 'math-finish' : 'rus-finish');
                refreshDots();
                updateDots();
                $('#lessonOverlay').classList.add('active');
                $('#lessonNextBtn').classList.remove('show');
                $('#lessonFinishBlock').classList.remove('show');
                $('#lessonScene').style.display = 'flex';
                renderLessonStep();
                return true;
            }
        } else {
            clearLessonProgress();
        }
    } catch (e) { clearLessonProgress(); }
    return false;
}
