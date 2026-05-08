// js/components/profile.js
// Профиль с 3D-котом и магазином кастомизации

import { $, $$, showToast } from '../utils.js';
import { state, resetAllProgress, applyTheme, saveState, checkThemeUnlocks } from '../state.js';
import { SUBJECTS, THEMES, countCompletedLessons, CAT_SPEECH } from '../config.js';
import { renderSkillTree } from './skillTree.js';
import { updateStats } from '../app.js';
import { Cat3D, HAT_TYPES, GLASSES_TYPES, SKIN_TYPES, ACCESSORY_TYPES } from './cat3d.js';

let cat3d = null;
let _shopRefreshNeeded = false;

export function disposeCat3D() {
    if (cat3d) {
        cat3d.dispose();
        cat3d = null;
    }
}

export function renderProfile() {
    const im = state.subject === SUBJECTS.MATH;
    const done = (state.storiesCompleted.math ? 1 : 0) + (state.storiesCompleted.rus1 ? 1 : 0) + (state.storiesCompleted.rus2 ? 1 : 0);
    const def = state.traps.reduce((s, t) => s + t.defuses, 0);
    const unl = Object.values(state.achievements).filter(a => a.unlocked).length;
    const total = Object.values(state.achievements).length;
    const totalLessons = countCompletedLessons(state.skills[SUBJECTS.MATH]) + countCompletedLessons(state.skills[SUBJECTS.RUSSIAN]);

    let html = `
    <div class="profile-hero">
        <div class="cat3d-container" id="cat3dContainer"></div>
        <div class="profile-name">Кот Учёный</div>
        <div class="profile-role">${im ? 'Математик' : 'Филолог'} · Уровень ${totalLessons + 1}</div>
        <div class="profile-stats-row">
            <div class="profile-stat-card">
                <div class="stat-icon">📚</div>
                <div class="stat-value">${totalLessons}</div>
                <div class="stat-label">Уроков</div>
            </div>
            <div class="profile-stat-card">
                <div class="stat-icon">🧮</div>
                <div class="stat-value">${done}</div>
                <div class="stat-label">Историй</div>
            </div>
            <div class="profile-stat-card">
                <div class="stat-icon">🪤</div>
                <div class="stat-value">${def}</div>
                <div class="stat-label">Ловушек</div>
            </div>
            <div class="profile-stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-value">${unl}</div>
                <div class="stat-label">Ачивок</div>
            </div>
        </div>
    </div>

    <div class="profile-section">
        <div class="profile-section-title">
            <span>🏆</span> Достижения <span class="section-badge">${unl}/${total}</span>
        </div>
        <div class="ach-grid">`;

    Object.values(state.achievements).forEach(a => {
        const cls = a.unlocked ? 'unlocked' : 'locked';
        const icon = a.unlocked ? a.name.split(' ')[0] : '🔒';
        const name = a.name.split(' ').slice(1).join(' ');
        html += `
        <div class="ach-item ${cls}">
            <div class="ach-icon">${icon}</div>
            <div class="ach-name">${name}</div>
            <div class="ach-desc">${a.desc}</div>
        </div>`;
    });

    html += `</div></div>`;

    // ─── Магазин ──────────────────────────────────────────────────
    html += renderShopSection('🎩', 'Шляпы', 'hats', HAT_TYPES);
    html += renderShopSection('👓', 'Очки', 'glasses', GLASSES_TYPES);
    html += renderShopSection('🎨', 'Окрас', 'skins', SKIN_TYPES);
    html += renderShopSection('✨', 'Аксессуары', 'accessories', ACCESSORY_TYPES);

    // ─── Селектор тем ─────────────────────────────────────────────
    html += `
    <div class="profile-section">
        <div class="profile-section-title"><span>🎨</span> Оформление</div>
        <div class="theme-grid">`;

    const totalDone = countCompletedLessons(state.skills[SUBJECTS.MATH]) + countCompletedLessons(state.skills[SUBJECTS.RUSSIAN]);
    Object.values(THEMES).forEach(t => {
        const isUnlocked = t.unlocked || (t.unlockAt && totalDone >= t.unlockAt);
        const isActive = state.theme === t.id;
        const lockEmoji = isUnlocked ? '' : `<span class="theme-lock">🔒</span>`;
        html += `
        <div class="theme-card ${isActive ? 'active' : ''} ${isUnlocked ? '' : 'locked'}" data-theme="${t.id}" data-unlocked="${isUnlocked ? '1' : '0'}">
            ${lockEmoji}
            <div class="theme-emoji">${t.catEmoji}</div>
            <div class="theme-name">${t.name}</div>
        </div>`;
    });

    html += `
        </div>
    </div>
    <button class="reset-progress-btn" id="resetProgressBtn">🔄 Сбросить прогресс</button>`;

    $('#profileContent').innerHTML = html;

    // Инициализация 3D-кота
    disposeCat3D();
    const cat3dContainer = $('#cat3dContainer');
    if (cat3dContainer) {
        cat3d = new Cat3D(cat3dContainer, state, saveState);
        // Глобальный обработчик поглаживания
        window.onKittyPet = () => {
            state.totalPets = (state.totalPets || 0) + 1;
            saveState();
            const emojis = ['Мур!', 'Мяу!', 'Мррр!', 'Мур-мур!', 'Котоволшебно!'];
            const msg = emojis[Math.floor(Math.random() * emojis.length)];
            showToast('🐱', msg, $('#toast'));
        };
    }

    // ═══ Обработчики магазина ══════════════════════════════════════
    $$('.shop-item').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            const itemKey = item.dataset.key;
            const isOwned = item.dataset.owned === '1';
            const isActive = item.dataset.active === '1';
            const price = parseInt(item.dataset.price);

            if (isActive) return; // Уже надето

            if (isOwned) {
                // Экипировать
                equipItem(category, itemKey);
            } else {
                // Купить и экипировать
                if (state.gems < price) {
                    showToast('💎', 'Недостаточно самоцветов!', $('#toast'));
                    return;
                }
                state.gems -= price;
                state.ownedItems[category].push(itemKey);
                equipItem(category, itemKey);
                saveState();
                updateStats(); // обновить счётчик самоцветов в хедере
            }
        });
    });

    // ═══ Переключение тем ══════════════════════════════════════════
    $$('.theme-card').forEach(card => {
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
            $$('.theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            updateHeaderForSubject();
        });
    });

    // ═══ Сброс прогресса ═══════════════════════════════════════════
    $('#resetProgressBtn').addEventListener('click', () => {
        if (confirm('Точно сбросить ВЕСЬ прогресс? Это нельзя отменить!')) {
            if (confirm('Последний шанс. Сбросить?')) {
                resetAllProgress();
                disposeCat3D();
                renderProfile();
                renderSkillTree();
                updateStats();
                const catSpeech = $('#catSpeech');
                if (catSpeech) catSpeech.textContent = 'Мур! Начинаем заново!';
                // Обновляем старые emoji-элементы если есть
                const catBody = $('#catBody');
                const catAvatar = $('#catAvatar');
                if (catBody) catBody.textContent = '🐱';
                if (catAvatar) catAvatar.textContent = '🐱';
                document.getElementById('headerBar').className = 'header math-header';
                document.getElementById('catStage').className = 'cat-stage math-stage';
                document.getElementById('app').classList.remove('rus-mode');
            }
        }
    });
}

// ─── Вспомогательные функции ─────────────────────────────────────

/**
 * Рендерит секцию магазина для категории предметов
 */
function renderShopSection(icon, title, category, items) {
    const activeKey = state.activeItems[category] || 
        (category === 'hats' ? 'none' : category === 'glasses' ? 'none' : category === 'skins' ? 'orange' : 'none');
    
    let html = `
    <div class="profile-section">
        <div class="profile-section-title">
            <span>${icon}</span> ${title}
        </div>
        <div class="shop-grid">`;

    Object.entries(items).forEach(([key, item]) => {
        const owned = state.ownedItems[category].includes(key);
        const active = activeKey === key;
        const canBuy = !owned && state.gems >= item.price;
        const showPrice = !owned && item.price > 0;

        html += `
        <div class="shop-item ${active ? 'shop-active' : ''} ${!owned ? 'shop-buyable' : 'shop-owned'}"
             data-category="${category}"
             data-key="${key}"
             data-owned="${owned ? '1' : '0'}"
             data-active="${active ? '1' : '0'}"
             data-price="${item.price}">
            <div class="shop-item-emoji">${item.emoji}</div>
            <div class="shop-item-name">${item.name}</div>
            ${active ? '<div class="shop-item-badge">✅</div>' : ''}
            ${showPrice ? `<div class="shop-item-price">💎 ${item.price}</div>` : ''}
            ${owned && !active ? '<div class="shop-item-badge">✔️</div>' : ''}
        </div>`;
    });

    html += `
        </div>
    </div>`;
    return html;
}

/**
 * Экипировать предмет (обновить state, кота, магазин)
 */
function equipItem(category, itemKey) {
    const catMap = {
        hats: 'hat',
        glasses: 'glasses',
        skins: 'skin',
        accessories: 'accessory'
    };
    const activeKey = catMap[category];

    state.activeItems[activeKey] = itemKey;
    saveState();

    // Обновить 3D-кота
    if (cat3d) {
        switch (category) {
            case 'hats': cat3d.setHat(itemKey); break;
            case 'glasses': cat3d.setGlasses(itemKey); break;
            case 'skins': cat3d.setSkin(SKIN_TYPES[itemKey]?.hex || '#F59E0B'); break;
            case 'accessories': cat3d.setAccessory(itemKey); break;
        }
    }

    // Анимация
    if (cat3d) {
        cat3d.sparkle();
    }

    // Показать тост
    const typeMap = { hats: HAT_TYPES, glasses: GLASSES_TYPES, skins: SKIN_TYPES, accessories: ACCESSORY_TYPES };
    const item = typeMap[category]?.[itemKey];
    if (item) {
        showToast(item.emoji, `${item.name} надето!`, $('#toast'));
    }

    // Перерисовать магазин (обновить active/owned метки)
    refreshShopUI(category);
}

/**
 * Обновить UI магазина после покупки/экипировки
 */
function refreshShopUI(changedCategory) {
    // Обновляем data-атрибуты у всех shop-item
    $$('.shop-item').forEach(item => {
        const category = item.dataset.category;
        const key = item.dataset.key;
        item.dataset.owned = state.ownedItems[category].includes(key) ? '1' : '0';
        
        const catMap = { hats: 'hat', glasses: 'glasses', skins: 'skin', accessories: 'accessory' };
        const activeKey = catMap[category];
        const isActive = state.activeItems[activeKey] === key;
        item.dataset.active = isActive ? '1' : '0';

        // Обновить классы
        item.classList.remove('shop-active', 'shop-owned', 'shop-buyable');
        if (isActive) {
            item.classList.add('shop-active');
        } else if (item.dataset.owned === '1') {
            item.classList.add('shop-owned');
        } else {
            item.classList.add('shop-buyable');
        }

        // Обновить бейджи
        const existingBadge = item.querySelector('.shop-item-badge');
        if (existingBadge) existingBadge.remove();

        if (isActive) {
            const badge = document.createElement('div');
            badge.className = 'shop-item-badge';
            badge.textContent = '✅';
            item.appendChild(badge);
        } else if (item.dataset.owned === '1') {
            const badge = document.createElement('div');
            badge.className = 'shop-item-badge';
            badge.textContent = '✔️';
            item.appendChild(badge);
        }

        // Обновить/убрать цену
        const existingPrice = item.querySelector('.shop-item-price');
        const price = parseInt(item.dataset.price);
        if (item.dataset.owned === '1') {
            if (existingPrice) existingPrice.remove();
        } else if (price > 0 && !existingPrice) {
            const priceEl = document.createElement('div');
            priceEl.className = 'shop-item-price';
            priceEl.textContent = '💎 ' + price;
            item.appendChild(priceEl);
        }
    });
}

/**
 * Обновить шапку/хедер под текущий предмет
 */
function updateHeaderForSubject() {
    const im = state.subject === SUBJECTS.MATH;
    const headerBar = document.getElementById('headerBar');
    const catStage = document.getElementById('catStage');
    if (headerBar) headerBar.className = 'header ' + (im ? 'math-header' : 'rus-header');
    if (catStage) catStage.className = 'cat-stage ' + (im ? 'math-stage' : 'rus-stage');
    const btnMath = document.getElementById('btnMath');
    const btnRus = document.getElementById('btnRus');
    if (btnMath) btnMath.classList.toggle('active', im);
    if (btnRus) btnRus.classList.toggle('active', !im);
    const appEl = document.getElementById('app');
    if (appEl) appEl.className = 'app' + (im ? '' : ' rus-mode');
    const catSpeech = document.getElementById('catSpeech');
    if (catSpeech) catSpeech.textContent = im ? CAT_SPEECH.math : CAT_SPEECH.russian;
}