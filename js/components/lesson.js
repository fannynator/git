// js/components/lesson.js
import { playSound } from '../sounds.js';
import { $, $$, showToast } from '../utils.js';
import { state, saveState, getCurrentSkills, unlockAchievement, checkAchievements } from '../state.js';
import { GEMS, SKILL, CAT_SPEECH, STORAGE_KEY } from '../config.js';
import { generateMathLesson } from '../generators/math.js';
import { generateRusLesson } from '../generators/russian.js';
import { renderTask } from './taskRenderer.js';
import { renderSkillTree } from './skillTree.js';
import { updateTrapsBadge } from './trap.js';
import { updateStats } from '../app.js';

const LESSON_STORAGE_KEY = STORAGE_KEY + '_lesson_progress';

function generateLesson(skillId, subject) {
    if (subject === 'math') return generateMathLesson(skillId);
    return generateRusLesson(skillId);
}

/**
 * Сохранить прогресс урока в localStorage
 */
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

/**
 * Загрузить прогресс урока из localStorage
 */
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
    } catch (e) {
        console.warn('Не удалось загрузить прогресс урока:', e);
        return false;
    }
}

/**
 * Очистить сохранённый прогресс урока
 */
function clearLessonProgress() {
    localStorage.removeItem(LESSON_STORAGE_KEY);
}

export function startLesson(skillId) {
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
    
    // Сохраняем начальный прогресс
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

export async function closeLesson() {
    clearLessonProgress();
    $('#lessonOverlay').classList.remove('active');
    
    // ВАЖНО: при закрытии урока НЕ начисляем прогресс навыку!
    // Прогресс начисляется только в finishLesson() при полном прохождении.
    // Сохраняем только ловушки, которые уже созданы.
    
    state.currentLesson = null;
    state.lessonTasks = [];
    renderSkillTree();
    checkAchievements();
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
    saveState();
}

async function renderLessonStep() {
    const task = state.lessonTasks[state.lessonStep];
    if (!task) {
        finishLesson();
        return;
    }

    $('#lessonNextBtn').classList.remove('show');
    $('#lessonFinishBlock').classList.remove('show');
    $('#lessonScene').style.display = 'flex';

    const result = await renderTask($('#lessonScene'), task, { isBonus: task.isBonus || false });
    
    if (!task.isBonus) {
        if (result.isCorrect) {
            state.lessonCorrect++;
        } else {
            state.lessonWrong++;
            state._wrongTasks.push(task);
            addLessonTrap(task);
        }
    } else {
        if (result.isCorrect) {
            state._bonusCorrect++;
        } else {
            state._bonusCorrect--;
        }
    }

    updateDots();
    saveLessonProgress();
    setTimeout(() => $('#lessonNextBtn').classList.add('show'), 1000);
    $('#lessonScene').scrollTop = 0;
}

function addLessonTrap(task) {
    const id = 'lesson_' + state.lessonSkillId + '_' + Date.now();
    state.traps.push({
        id,
        question: task.question,
        options: task.options || null,
        correct: task.correctIdx ?? null,
        answer: task.correctAns,
        explanation: task.explanation,
        source: 'Урок: ' + ($('#lessonTitle')?.textContent || 'Неизвестно'),
        defuses: 0,
        nextDate: new Date().toISOString(),
        isInput: task.type === 'input' || (task.type && task.type.startsWith('boss')),
        subject: state.subject
    });
    unlockAchievement('firstBlood');
    saveState();
}

export function nextLessonStep() {
    state.lessonStep++;
    saveLessonProgress();
    
    if (state.lessonStep >= state.lessonTasks.length) {
        if (!state._bonusAdded && state._wrongTasks.length > 0) {
            state._bonusAdded = true;
            state._bonusCorrect = 0;
            state._wrongTasks.forEach(wt => {
                state.lessonTasks.push({
                    ...wt,
                    emoji: '🔄',
                    badge: 'Повтор',
                    badgeClass: 'badge-bonus',
                    question: wt.question,
                    explanation: 'Закрепляем!',
                    isBonus: true
                });
            });
            refreshDots();
            saveLessonProgress();
            renderLessonStep();
            $('#lessonScene').scrollTop = 0;
            return;
        }
        finishLesson();
    } else {
        renderLessonStep();
        $('#lessonScene').scrollTop = 0;
    }
}

function finishLesson() {
    clearLessonProgress();
    $('#lessonScene').style.display = 'none';
    $('#lessonNextBtn').classList.remove('show');
    $('#lessonFinishBlock').classList.add('show');

    const c = state.lessonCorrect;
    const w = state.lessonWrong;
    const bcr = state._bonusCorrect || 0;
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
    unlockAchievement('student');
    if (w === 0) unlockAchievement('master');
    playSound(w === 0 ? 'achievement' : 'correct');
    
    $$('#lessonSteps .lstep-dot').forEach(d => {
        d.classList.add('done');
        d.classList.remove('current', 'wrong');
    });
    
    const catSpeech = $('#catSpeech');
    if (catSpeech) {
        catSpeech.textContent = w === 0 ? CAT_SPEECH.lessonPerfect : CAT_SPEECH.lessonDone;
    }
    
    updateTrapsBadge();
    saveState();
}

/**
 * Проверить и восстановить незавершённый урок при загрузке страницы
 */
export function checkSavedLesson() {
    const saved = localStorage.getItem(LESSON_STORAGE_KEY);
    if (!saved) return false;
    
    try {
        const progress = JSON.parse(saved);
        if (!progress.skillId || !progress.tasks || progress.tasks.length === 0) {
            clearLessonProgress();
            return false;
        }
        
        // Показываем диалог: продолжить или начать заново
        const resume = confirm(
            `У тебя есть незавершённый урок по теме «${getCurrentSkills().find(s => s.id === progress.skillId)?.name || 'Неизвестно'}».\n\n` +
            `Пройдено: ${progress.step} из ${progress.tasks.length} заданий.\nВерных ответов: ${progress.correct}.\n\n` +
            `Продолжить урок?`
        );
        
        if (resume) {
            if (loadLessonProgress()) {
                const im = state.subject === 'math';
                const skill = getCurrentSkills().find(s => s.id === state.lessonSkillId);
                $('#lessonTitle').textContent = (im ? '🧮 ' : '📝 ') + (skill ? skill.name : 'Урок');
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
    } catch (e) {
        clearLessonProgress();
    }
    
    return false;
}
