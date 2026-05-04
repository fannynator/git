import { $, $$, showToast } from '../utils.js';
import { state, saveState, getCurrentSkills, unlockAchievement, checkAchievements } from '../state.js';
import { GEMS, SKILL, CAT_SPEECH } from '../config.js';
import { generateMathLesson } from '../generators/math.js';
import { generateRusLesson } from '../generators/russian.js';
import { renderTask } from './taskRenderer.js';
import { renderSkillTree } from './skillTree.js';
import { updateTrapsBadge } from './trap.js';
import { updateStats } from '../app.js';

function generateLesson(skillId, subject) {
    if (subject === 'math') return generateMathLesson(skillId);
    return generateRusLesson(skillId);
}

export function startLesson(skillId) {
    const im = state.subject === 'math';
    state.currentLesson = skillId; state.lessonSkillId = skillId;
    state.lessonStep = 0; state.lessonCorrect = 0; state.lessonWrong = 0;
    state._bonusAdded = false; state._wrongTasks = []; state._bonusCorrect = 0;
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
    $('#lessonOverlay').classList.remove('active');
    const skill = getCurrentSkills().find(s => s.id === state.lessonSkillId);
    if (skill && state.lessonCorrect > 0) {
        const ratio = state.lessonCorrect / 8;
        const np = Math.min(100, skill.progress + Math.round(ratio * 100));
        skill.progress = np;
        if (np >= SKILL.PROGRESS_TO_COMPLETE) {
            skill.status = 'completed';
            unlockNext(skill);
        }
    }
    state.currentLesson = null;
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
    if (!task) { finishLesson(); return; }

    $('#lessonNextBtn').classList.remove('show');
    $('#lessonFinishBlock').classList.remove('show');
    $('#lessonScene').style.display = 'flex';

    const result = await renderTask($('#lessonScene'), task, { isBonus: task.isBonus || false });
    
    if (!task.isBonus) {
        if (result.isCorrect) state.lessonCorrect++;
        else { state.lessonWrong++; state._wrongTasks.push(task); addLessonTrap(task); }
    } else {
        if (result.isCorrect) state._bonusCorrect++;
        else state._bonusCorrect--;
    }

    updateDots();
    setTimeout(() => $('#lessonNextBtn').classList.add('show'), 1000);
    $('#lessonScene').scrollTop = 0;
}

function addLessonTrap(task) {
    const id = 'lesson_' + state.lessonSkillId + '_' + Date.now();
    state.traps.push({
        id, question: task.question, options: task.options || null,
        correct: task.correctIdx ?? null, answer: task.correctAns,
        explanation: task.explanation, source: 'Урок: ' + $('#lessonTitle').textContent,
        defuses: 0, nextDate: new Date().toISOString(),
        isInput: task.type === 'input' || (task.type && task.type.startsWith('boss')),
        subject: state.subject
    });
    unlockAchievement('firstBlood');
    saveState();
}

export function nextLessonStep() {
    state.lessonStep++;
    if (state.lessonStep >= state.lessonTasks.length) {
        if (!state._bonusAdded && state._wrongTasks.length > 0) {
            state._bonusAdded = true; state._bonusCorrect = 0;
            state._wrongTasks.forEach(wt => {
                state.lessonTasks.push({
                    ...wt, emoji: '🔄', badge: 'Повтор', badgeClass: 'badge-bonus',
                    question: wt.question, explanation: 'Закрепляем!', isBonus: true
                });
            });
            refreshDots();
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
    $('#lessonScene').style.display = 'none';
    $('#lessonNextBtn').classList.remove('show');
    $('#lessonFinishBlock').classList.add('show');

    const c = state.lessonCorrect, w = state.lessonWrong, bcr = state._bonusCorrect || 0;
    $('#lfinishCorrect').textContent = c;
    $('#lfinishWrong').textContent = w;
    const xp = c * GEMS.LESSON_XP_PER_CORRECT + (w === 0 ? GEMS.LESSON_PERFECT_BONUS : 0) + bcr * GEMS.BONUS_REPEAT_XP;
    $('#lfinishXP').textContent = '+' + xp + ' 💎';
    if (w === 0) { $('#lfinishTitle').textContent = 'Идеально! 🌟'; $('#lfinishSubtitle').textContent = 'Навык пройден!'; }
    else { $('#lfinishTitle').textContent = 'Урок пройден!'; $('#lfinishSubtitle').textContent = `${c}/${c + w} верно. Ошибки → 🪤`; }
    state.gems += xp;
    updateStats();
    unlockAchievement('student');
    if (w === 0) unlockAchievement('master');
    $$('#lessonSteps .lstep-dot').forEach(d => { d.classList.add('done'); d.classList.remove('current', 'wrong'); });
    const catSpeech = $('#catSpeech');
    if (catSpeech) catSpeech.textContent = w === 0 ? CAT_SPEECH.lessonPerfect : CAT_SPEECH.lessonDone;
    updateTrapsBadge();
    saveState();
}