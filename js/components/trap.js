// js/components/trap.js

import { $, $$, showToast } from '../utils.js';
import { state, saveState, getAvailableTraps, getLockedTraps, getDefusedTraps, getTrapDelay, unlockAchievement, checkAchievements } from '../state.js';
import { GEMS, TRAP } from '../config.js';
import { updateStats, showAchievementToast } from '../app.js';
import { renderSkillTree } from './skillTree.js';

export function updateTrapsBadge() {
    const badge = $('#trapsBadge');
    if (!badge) return;
    const a = getAvailableTraps().length;
    if (a > 0) {
        badge.style.display = 'flex';
        badge.textContent = a;
    } else {
        badge.style.display = 'none';
    }
}

export function renderTrapsPanel() {
    const av = getAvailableTraps();
    const lo = getLockedTraps();
    const de = getDefusedTraps();
    
    let html = '';
    
    if (!av.length && !lo.length && !de.length) {
        html = '<div style="text-align:center;padding:20px;">🏆<br>Пусто!</div>';
    } else {
        if (av.length) {
            html += '<p style="font-weight:700;color:var(--red);margin-bottom:6px;">🔴 Ожидают</p>';
            av.forEach(t => {
                html += `<div class="trap-item danger" data-id="${t.id}">
                    <div class="trap-icon">🪤</div>
                    <div class="trap-info">
                        <div class="trap-name">${t.question}</div>
                        <div class="trap-source">${t.source} | ${t.defuses}/${TRAP.MAX_DEFUSES}</div>
                    </div>
                    <span class="trap-status status-danger">Ждёт!</span>
                </div>`;
            });
        }
        
        if (lo.length) {
            html += '<p style="font-weight:700;color:var(--orange);margin:10px 0 6px;">🟡 Пауза</p>';
            lo.forEach(t => {
                const hrs = Math.ceil((new Date(t.nextDate) - new Date()) / 3600000);
                html += `<div class="trap-item warning">
                    <div class="trap-icon">⏳</div>
                    <div class="trap-info">
                        <div class="trap-name">${t.question}</div>
                        <div class="trap-source">Через ~${hrs}ч | ${t.defuses}/${TRAP.MAX_DEFUSES}</div>
                    </div>
                    <span class="trap-status status-warning">Пауза</span>
                </div>`;
            });
        }
        
        if (de.length) {
            html += '<p style="font-weight:700;color:var(--green);margin:10px 0 6px;">🟢 Обезврежены</p>';
            de.forEach(t => {
                html += `<div class="trap-item defused">
                    <div class="trap-icon">✅</div>
                    <div class="trap-info">
                        <div class="trap-name">${t.question}</div>
                        <div class="trap-source">${t.source}</div>
                    </div>
                    <span class="trap-status status-defused">Готово</span>
                </div>`;
            });
        }
    }
    
    $('#trapsList').innerHTML = html;
    $('#trapsSubtitle').textContent = av.length ? `${av.length} ловушка(и) ждёт!` : '';
    
    // Вешаем обработчики на доступные ловушки
    $$('#trapsList .trap-item.danger').forEach(el => {
        el.addEventListener('click', () => {
            const t = state.traps.find(x => x.id === el.dataset.id);
            if (t) openTrapQuiz(t);
        });
    });
}

function openTrapQuiz(trap) {
    let html = `
        <div style="text-align:center;font-size:40px;margin-bottom:8px;">🪤</div>
        <div style="text-align:center;font-weight:800;font-size:14px;color:var(--text);margin-bottom:4px;">
            Обезвреживание ${trap.defuses + 1}/${TRAP.MAX_DEFUSES}
        </div>
        <div style="text-align:center;font-size:13px;color:var(--text);margin-bottom:14px;">
            ${trap.question}
        </div>`;
    
    if (trap.isInput) {
        html += `
            <div class="task-input-row">
                <input type="text" class="task-input" id="tqInp" placeholder="Ответ" autocomplete="off">
                <button class="btn-submit" id="tqSub">✓</button>
            </div>`;
    } else {
        html += `<div class="task-options" id="tqOpts">`;
        trap.options.forEach((o, i) => {
            html += `<button class="task-option" data-idx="${i}">${o}</button>`;
        });
        html += `</div>`;
    }
    
    html += `
        <div class="lesson-explanation" id="tqExpl"></div>
        <button class="panel-close" id="tqClose" style="margin-top:10px;">Закрыть</button>`;
    
    $('#trapQuizCard').innerHTML = html;
    $('#trapQuizOverlay').classList.add('active');

    const expl = $('#tqExpl');
    let done = false;

    const success = () => {
        trap.defuses++;
        trap.nextDate = new Date(Date.now() + getTrapDelay(trap.defuses)).toISOString();
        state.gems += GEMS.TRAP_BASE_REWARD + trap.defuses * GEMS.TRAP_DEFUSE_MULTIPLIER;
        updateStats();
        
        // ═══════════ НАЧИСЛЕНИЕ ПРОГРЕССА НАВЫКУ (ТОЛЬКО ПЕРВОЕ ОБЕЗВРЕЖИВАНИЕ) ═══════════
        if (trap.defuses === 1 && trap.id && trap.id.startsWith('lesson_')) {
            const parts = trap.id.split('_');
            if (parts.length >= 2) {
                const skillId = parts[1];
                // Ищем навык в ОБОИХ предметах
                let skill = state.skills.math.find(s => s.id === skillId) ||
                            state.skills.russian.find(s => s.id === skillId);
                
                if (skill && skill.status === 'current' && skill.progress < 100) {
                    // Считаем все ловушки от этого навыка
                    const allTraps = state.traps.filter(
                        t => t.id && t.id.startsWith('lesson_' + skillId + '_')
                    );
                    const defusedOnce = allTraps.filter(t => t.defuses >= 1).length;
                    const totalTraps = allTraps.length;
                    
                    const remaining = 100 - skill.progress;
                    const remainingTraps = totalTraps - defusedOnce + 1;
                    const progressForThis = Math.ceil(remaining / remainingTraps);
                    
                    skill.progress = Math.min(100, skill.progress + progressForThis);
                    
                    if (skill.progress >= 100) {
                        skill.status = 'completed';
                        const subject = trap.subject || state.subject;
                        const skills = state.skills[subject];
                        const ci = skills.findIndex(s => s.id === skillId);
                        if (ci >= 0 && ci + 1 < skills.length && skills[ci + 1].status === 'locked') {
                            skills[ci + 1].status = 'current';
                            showToast('🔓', 'Новый навык открыт через ловушки!', $('#toast'));
                        }
                    }
                    saveState();
                    renderSkillTree();
                }
            }
        }
        // ═══════════════════════════════════════════════════════════════════════
        
        const toastEmoji = trap.defuses >= TRAP.MAX_DEFUSES ? '🏆' : '✅';
        const toastMsg = trap.defuses >= TRAP.MAX_DEFUSES
            ? 'Ловушка обезврежена!'
            : `+${GEMS.TRAP_BASE_REWARD + trap.defuses * GEMS.TRAP_DEFUSE_MULTIPLIER} 💎`;
        
        showToast(toastEmoji, toastMsg, $('#toast'));
        checkAchievements((name, desc) => showAchievementToast(name, desc));
        updateTrapsBadge();
        renderTrapsPanel();
        saveState();
        
        setTimeout(() => $('#trapQuizOverlay').classList.remove('active'), 600);
    };

    // Обработчики для input-ловушек
    if (trap.isInput) {
        const inp = $('#tqInp');
        const btn = $('#tqSub');
        
        const submit = () => {
            if (done) return;
            done = true;
            btn.disabled = true;
            inp.disabled = true;
            
            const userAnswer = inp.value.trim().toLowerCase();
            const correctAnswer = String(trap.answer).toLowerCase();
            
            if (userAnswer === correctAnswer) {
                inp.style.borderColor = 'var(--green)';
                inp.style.background = 'rgba(16,185,129,0.2)';
                expl.textContent = '✅ ' + trap.explanation;
                expl.className = 'lesson-explanation show good';
                success();
            } else {
                inp.style.borderColor = 'var(--red)';
                inp.style.background = 'rgba(239,68,68,0.15)';
                expl.textContent = '🤔 ' + trap.explanation + ' ✅ ' + trap.answer;
                expl.className = 'lesson-explanation show bad';
            }
        };
        
        btn.addEventListener('click', submit);
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter') submit();
        });
        
        // Автофокус на инпут
        setTimeout(() => inp.focus(), 300);
        
    } else {
        // Обработчики для choice-ловушек
        const opts = $$('#tqOpts .task-option');
        opts.forEach(o => {
            o.addEventListener('click', () => {
                if (done) return;
                done = true;
                opts.forEach(x => x.style.pointerEvents = 'none');
                
                const idx = parseInt(o.dataset.idx);
                
                if (idx === trap.correct) {
                    o.classList.add('correct-pick');
                    expl.textContent = '✅ ' + trap.explanation;
                    expl.className = 'lesson-explanation show good';
                    success();
                } else {
                    o.classList.add('wrong-pick');
                    opts[trap.correct].classList.add('correct-pick');
                    expl.textContent = '🤔 ' + trap.explanation;
                    expl.className = 'lesson-explanation show bad';
                }
            });
        });
    }

    $('#tqClose').addEventListener('click', () => {
        $('#trapQuizOverlay').classList.remove('active');
        updateTrapsBadge();
        renderTrapsPanel();
    });
}

// Закрытие по клику на оверлей
document.addEventListener('DOMContentLoaded', () => {
    const overlay = $('#trapQuizOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                updateTrapsBadge();
                renderTrapsPanel();
            }
        });
    }
});