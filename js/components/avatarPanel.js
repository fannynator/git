// js/components/avatarPanel.js
// Панель аватара: статистика, достижения, темы, сброс прогресса

import { $, $$, showToast } from '../utils.js';
import { state, resetAllProgress, applyTheme, saveState, checkThemeUnlocks } from '../state.js';
import { SUBJECTS, THEMES, countCompletedLessons } from '../config.js';
import { renderSkillTree } from './skillTree.js';
import { renderProfile } from './profile.js';

let _avatarPanelOpen = false;

export function openAvatarPanel() {
    if (_avatarPanelOpen) return;
    _avatarPanelOpen = true;

    const totalLessons = countCompletedLessons(state.skills[SUBJECTS.MATH]) + countCompletedLessons(state.skills[SUBJECTS.RUSSIAN]);
    const done = (state.storiesCompleted.math ? 1 : 0) + (state.storiesCompleted.rus1 ? 1 : 0) + (state.storiesCompleted.rus2 ? 1 : 0);
    const def = state.traps.reduce((s, t) => s + t.defuses, 0);
    const unl = Object.values(state.achievements).filter(a => a.unlocked).length;
    const total = Object.values(state.achievements).length;

    let html = `
    <div class="avatar-panel-backdrop" id="avatarPanelBackdrop">
        <div class="avatar-panel-card">
            <div class="avatar-panel-header">
                <span class="avatar-panel-title">🐱 ${state.activeItems.skin ? 'Кот Учёный' : 'Кот Учёный'}</span>
                <button class="avatar-panel-close" id="btnAvatarPanelClose">✕</button>
            </div>

            <!-- Статистика -->
            <div class="avatar-stats-grid">
                <div class="avatar-stat-card">
                    <div class="avatar-stat-icon">📚</div>
                    <div class="avatar-stat-value">${totalLessons}</div>
                    <div class="avatar-stat-label">Уроков</div>
                </div>
                <div class="avatar-stat-card">
                    <div class="avatar-stat-icon">📖</div>
                    <div class="avatar-stat-value">${done}</div>
                    <div class="avatar-stat-label">Историй</div>
                </div>
                <div class="avatar-stat-card">
                    <div class="avatar-stat-icon">🪤</div>
                    <div class="avatar-stat-value">${def}</div>
                    <div class="avatar-stat-label">Ловушек</div>
                </div>
                <div class="avatar-stat-card">
                    <div class="avatar-stat-icon">🏆</div>
                    <div class="avatar-stat-value">${unl}/${total}</div>
                    <div class="avatar-stat-label">Ачивок</div>
                </div>
            </div>

            <!-- Достижения -->
            <div class="avatar-section">
                <div class="avatar-section-title">
                    <span>🏆</span> Достижения <span class="section-badge">${unl}/${total}</span>
                </div>
                <div class="avatar-ach-grid">`;

    Object.values(state.achievements).forEach(a => {
        const cls = a.unlocked ? 'unlocked' : 'locked';
        const icon = a.unlocked ? a.name.split(' ')[0] : '🔒';
        const name = a.name.split(' ').slice(1).join(' ');
        html += `
        <div class="avatar-ach-item ${cls}">
            <div class="avatar-ach-icon">${icon}</div>
            <div class="avatar-ach-name">${name}</div>
            <div class="avatar-ach-desc">${a.desc}</div>
        </div>`;
    });

    html += `
                </div>
            </div>

            <!-- Оформление (темы) -->
            <div class="avatar-section">
                <div class="avatar-section-title"><span>🎨</span> Оформление</div>
                <div class="avatar-theme-grid">`;

    const totalDone = countCompletedLessons(state.skills[SUBJECTS.MATH]) + countCompletedLessons(state.skills[SUBJECTS.RUSSIAN]);
    Object.values(THEMES).forEach(t => {
        const isUnlocked = t.unlocked || (t.unlockAt && totalDone >= t.unlockAt);
        const isActive = state.theme === t.id;
        const lockEmoji = isUnlocked ? '' : `<span class="theme-lock">🔒</span>`;
        html += `
        <div class="avatar-theme-card ${isActive ? 'active' : ''} ${isUnlocked ? '' : 'locked'}" data-theme="${t.id}" data-unlocked="${isUnlocked ? '1' : '0'}">
            ${lockEmoji}
            <div class="avatar-theme-emoji">${t.catEmoji}</div>
            <div class="avatar-theme-name">${t.name}</div>
        </div>`;
    });

    html += `
                </div>
            </div>

            <!-- Кнопка сброса -->
            <button class="avatar-reset-btn" id="avatarResetBtn">🔄 Сбросить прогресс</button>
        </div>
    </div>`;

    // Удаляем старый оверлей если есть
    const old = document.getElementById('avatarPanelBackdrop');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.innerHTML = html;
    document.body.appendChild(overlay.firstElementChild);

    // Обработчики
    bindAvatarEvents(totalDone);
}

function bindAvatarEvents(totalDone) {
    // Закрытие
    const backdrop = $('#avatarPanelBackdrop');
    const closeBtn = $('#btnAvatarPanelClose');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeAvatarPanel);
    }
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeAvatarPanel();
        });
    }

    // Переключение тем
    $$('.avatar-theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const themeId = card.dataset.theme;
            const unlocked = card.dataset.unlocked === '1';
            if (!unlocked) {
                const t = THEMES[themeId];
                showToast('🔒', `Разблокируется после ${t.unlockAt} уроков`, $('#toast'));
                return;
            }
            applyTheme(themeId);
            saveState();
            $$('.avatar-theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            updateHeaderForAvatar();
        });
    });

    // Сброс прогресса
    const resetBtn = $('#avatarResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Точно сбросить ВЕСЬ прогресс? Это нельзя отменить!')) {
                if (confirm('Последний шанс. Сбросить?')) {
                    resetAllProgress();
                    renderSkillTree();
                    closeAvatarPanel();
                    const catSpeech = $('#catSpeech');
                    if (catSpeech) catSpeech.textContent = 'Мур! Начинаем заново!';
                    const catBody = $('#catBody');
                    const catAvatar = $('#catAvatar');
                    if (catBody) catBody.textContent = '🐱';
                    if (catAvatar) catAvatar.textContent = '🐱';
                    document.getElementById('headerBar').className = 'header math-header';
                    document.getElementById('catStage').className = 'cat-stage math-stage';
                    document.getElementById('app').classList.remove('rus-mode');
                    // Обновить профиль если открыт
                    renderProfile();
                    // Обновить статы в хедере
                    import('../app.js').then(m => {
                        if (m.updateStats) m.updateStats();
                    }).catch(() => {});
                }
            }
        });
    }
}

function closeAvatarPanel() {
    _avatarPanelOpen = false;
    const backdrop = $('#avatarPanelBackdrop');
    if (backdrop) {
        backdrop.classList.add('closing');
        setTimeout(() => backdrop.remove(), 300);
    }
}

function updateHeaderForAvatar() {
    const im = state.subject === SUBJECTS.MATH;
    const headerBar = document.getElementById('headerBar');
    const catStage = document.getElementById('catStage');
    if (headerBar) headerBar.className = 'header ' + (im ? 'math-header' : 'rus-header');
    if (catStage) catStage.className = 'cat-stage ' + (im ? 'math-stage' : 'rus-stage');
}

export { closeAvatarPanel };