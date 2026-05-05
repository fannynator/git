import { $, $$, showToast } from '../utils.js';
import { state, saveState, getAvailableTraps, getLockedTraps, getDefusedTraps, getTrapDelay, unlockAchievement, checkAchievements } from '../state.js';
import { GEMS, TRAP } from '../config.js';
import { updateStats, showAchievementToast } from '../app.js';

export function updateTrapsBadge() {
    const badge = $('#trapsBadge');
    if (!badge) return;
    const a = getAvailableTraps().length;
    if (a > 0) { badge.style.display = 'flex'; badge.textContent = a; }
    else { badge.style.display = 'none'; }
}

export function renderTrapsPanel() {
    const av = getAvailableTraps(), lo = getLockedTraps(), de = getDefusedTraps();
    let html = '';
    if (!av.length && !lo.length && !de.length) html = '<div style="text-align:center;padding:20px;">🏆<br>Пусто!</div>';
    else {
        if (av.length) { html += '<p style="font-weight:700;color:var(--red);margin-bottom:6px;">🔴 Ожидают</p>'; av.forEach(t => { html += `<div class="trap-item danger" data-id="${t.id}"><div class="trap-icon">🪤</div><div class="trap-info"><div class="trap-name">${t.question}</div><div class="trap-source">${t.source} | ${t.defuses}/${TRAP.MAX_DEFUSES}</div></div><span class="trap-status status-danger">Ждёт!</span></div>`; }); }
        if (lo.length) { html += '<p style="font-weight:700;color:var(--orange);margin:10px 0 6px;">🟡 Пауза</p>'; lo.forEach(t => { const hrs = Math.ceil((new Date(t.nextDate) - new Date()) / 3600000); html += `<div class="trap-item warning"><div class="trap-icon">⏳</div><div class="trap-info"><div class="trap-name">${t.question}</div><div class="trap-source">Через ~${hrs}ч | ${t.defuses}/${TRAP.MAX_DEFUSES}</div></div><span class="trap-status status-warning">Пауза</span></div>`; }); }
        if (de.length) { html += '<p style="font-weight:700;color:var(--green);margin:10px 0 6px;">🟢 Обезврежены</p>'; de.forEach(t => { html += `<div class="trap-item defused"><div class="trap-icon">✅</div><div class="trap-info"><div class="trap-name">${t.question}</div><div class="trap-source">${t.source}</div></div><span class="trap-status status-defused">Готово</span></div>`; }); }
    }
    $('#trapsList').innerHTML = html;
    $('#trapsSubtitle').textContent = av.length ? `${av.length} ловушка(и) ждёт!` : '';
    $$('#trapsList .trap-item.danger').forEach(el => { el.addEventListener('click', () => { const t = state.traps.find(x => x.id === el.dataset.id); if (t) openTrapQuiz(t); }); });
}

function openTrapQuiz(trap) {
    let html = `<div class="trap-quiz-emoji">🪤</div><div class="trap-quiz-title">Обезвреживание ${trap.defuses + 1}/${TRAP.MAX_DEFUSES}</div><div class="trap-quiz-text">${trap.question}</div>`;
    if (trap.isInput) html += `<div class="task-input-row"><input type="text" class="task-input" id="tqInp" placeholder="Ответ" autocomplete="off"><button class="btn-submit" id="tqSub">✓</button></div>`;
    else html += `<div class="trap-quiz-options" id="tqOpts">${trap.options.map((o, i) => `<button class="trap-quiz-option" data-idx="${i}">${o}</button>`).join('')}</div>`;
    html += `<div class="trap-quiz-explanation" id="tqExpl"></div><button class="btn-trap-quiz-close" id="tqClose">Закрыть</button>`;
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
            const skills = getCurrentSkills();
            const skill = skills.find(s => s.id === skillId);
            
            if (skill && skill.status === 'current' && skill.progress < 100) {
                // Считаем все ловушки от этого навыка
                const allTraps = state.traps.filter(
                    t => t.id.startsWith('lesson_' + skillId + '_') && t.subject === state.subject
                );
                // Сколько из них уже обезврежено хотя бы 1 раз
                const defusedOnce = allTraps.filter(t => t.defuses >= 1).length;
                const totalTraps = allTraps.length;
                
                // Оставшийся прогресс делим на оставшиеся ловушки
                const remaining = 100 - skill.progress;
                const remainingTraps = totalTraps - defusedOnce + 1; // +1 потому что текущая тоже считается
                const progressForThis = Math.ceil(remaining / remainingTraps);
                
                skill.progress = Math.min(100, skill.progress + progressForThis);
                
                if (skill.progress >= 100) {
                    skill.status = 'completed';
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
    
    showToast(
        trap.defuses >= TRAP.MAX_DEFUSES ? '🏆' : '✅',
        trap.defuses >= TRAP.MAX_DEFUSES ? 'Ловушка обезврежена!' : `+${GEMS.TRAP_BASE_REWARD + trap.defuses * GEMS.TRAP_DEFUSE_MULTIPLIER} 💎`,
        $('#toast')
    );
    checkAchievements((name, desc) => showAchievementToast(name, desc));
    updateTrapsBadge();
    renderTrapsPanel();
    saveState();
    setTimeout(() => $('#trapQuizOverlay').classList.remove('active'), 600);
};

    if (trap.isInput) {
        const inp = $('#tqInp'), btn = $('#tqSub');
        const sub = () => {
            if (done) return; done = true; btn.disabled = true; inp.disabled = true;
            if (inp.value.trim().toLowerCase() === String(trap.answer).toLowerCase()) {
                inp.style.borderColor = 'var(--green)'; inp.style.background = 'rgba(16,185,129,0.2)';
                expl.textContent = '✅ ' + trap.explanation; expl.className = 'trap-quiz-explanation show good';
                success();
            } else {
                inp.style.borderColor = 'var(--red)'; inp.style.background = 'rgba(239,68,68,0.15)';
                expl.textContent = '🤔 ' + trap.explanation; expl.className = 'trap-quiz-explanation show bad';
            }
        };
        btn.addEventListener('click', sub);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') sub(); });
    } else {
        const opts = $$('#tqOpts .trap-quiz-option');
        opts.forEach(o => o.addEventListener('click', () => {
            if (done) return; done = true; opts.forEach(x => x.style.pointerEvents = 'none');
            const idx = parseInt(o.dataset.idx);
            if (idx === trap.correct) {
                o.classList.add('correct-pick');
                expl.textContent = '✅ ' + trap.explanation; expl.className = 'trap-quiz-explanation show good';
                success();
            } else {
                o.classList.add('wrong-pick'); opts[trap.correct].classList.add('correct-pick');
                expl.textContent = '🤔 ' + trap.explanation; expl.className = 'trap-quiz-explanation show bad';
            }
        }));
    }
    $('#tqClose').addEventListener('click', () => { $('#trapQuizOverlay').classList.remove('active'); updateTrapsBadge(); renderTrapsPanel(); });
}
