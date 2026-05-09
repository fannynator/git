// js/components/profile.js
// Профиль: большой кот в комнате + меню кастомизации по секторам

import { $, $$, showToast } from '../utils.js';
import { state, saveState } from '../state.js';
import { countCompletedLessons, SUBJECTS, getTheme } from '../config.js';
import { updateStats } from '../app.js';
import { Cat3D, HAT_TYPES, GLASSES_TYPES, SKIN_TYPES, ACCESSORY_TYPES } from './cat3d.js';

let cat3d = null;
let _activeShopCategory = null; // какая категория открыта

export function disposeCat3D() {
    if (cat3d) {
        cat3d.dispose();
        cat3d = null;
    }
}

export function renderProfile() {
    _activeShopCategory = null;

    const im = state.subject === SUBJECTS.MATH;
    const totalLessons = countCompletedLessons(state.skills[SUBJECTS.MATH]) + countCompletedLessons(state.skills[SUBJECTS.RUSSIAN]);
    const theme = getTheme(state.theme);
    const catEmoji = theme?.catEmoji || (im ? '🐱' : '😺');

    let html = `
    <!-- Комната с котом -->
    <div class="profile-room">
        <div class="profile-room-wall">
            <div class="profile-room-floor">
                <div class="profile-room-baseboard"></div>
            </div>
        </div>
        <div class="profile-cat-wrapper">
            <div class="profile-cat-container" id="cat3dContainer"></div>
        </div>
        <div class="profile-cat-label">${catEmoji} Кот Учёный</div>
        <div class="profile-cat-sub">${im ? 'Математик' : 'Филолог'} · Уровень ${totalLessons + 1}</div>
    </div>

    <!-- Меню кастомизации: сектора -->
    <div class="profile-customize-title">✨ Кастомизация</div>
    <div class="profile-sector-grid">
        <button class="profile-sector-btn" data-category="hats">
            <span class="sector-emoji">🎩</span>
            <span class="sector-label">Шляпы</span>
        </button>
        <button class="profile-sector-btn" data-category="glasses">
            <span class="sector-emoji">👓</span>
            <span class="sector-label">Очки</span>
        </button>
        <button class="profile-sector-btn" data-category="skins">
            <span class="sector-emoji">🎨</span>
            <span class="sector-label">Окрас</span>
        </button>
        <button class="profile-sector-btn" data-category="accessories">
            <span class="sector-emoji">✨</span>
            <span class="sector-label">Аксессуары</span>
        </button>
    </div>

    <!-- Контейнер для раскрытой сетки предметов -->
    <div class="profile-shop-drop" id="profileShopDrop"></div>
    `;

    $('#profileContent').innerHTML = html;

    // Инициализация 3D-кота (крупнее)
    disposeCat3D();
    const cat3dContainer = $('#cat3dContainer');
    if (cat3dContainer) {
        cat3d = new Cat3D(cat3dContainer, state, saveState);
        window.onKittyPet = () => {
            state.totalPets = (state.totalPets || 0) + 1;
            saveState();
            const emojis = ['Мур!', 'Мяу!', 'Мррр!', 'Мур-мур!', 'Котоволшебно!'];
            const msg = emojis[Math.floor(Math.random() * emojis.length)];
            showToast('🐱', msg, $('#toast'));
        };
    }

    // Обработчики кнопок-секторов
    $$('.profile-sector-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const category = btn.dataset.category;
            toggleShopCategory(category);
        });
    });

    // Закрытие выпадашки при клике вне её
    document.addEventListener('click', closeShopDropOnOutside);
}

function toggleShopCategory(category) {
    if (_activeShopCategory === category) {
        // Повторный клик — закрыть
        closeShopDrop();
        return;
    }
    _activeShopCategory = category;

    // Подсветить активную кнопку
    $$('.profile-sector-btn').forEach(b => b.classList.remove('active-sector'));
    const activeBtn = document.querySelector(`.profile-sector-btn[data-category="${category}"]`);
    if (activeBtn) activeBtn.classList.add('active-sector');

    // Показать сетку предметов
    const dropEl = $('#profileShopDrop');
    if (!dropEl) return;

    const itemsMap = {
        hats: HAT_TYPES,
        glasses: GLASSES_TYPES,
        skins: SKIN_TYPES,
        accessories: ACCESSORY_TYPES
    };
    const items = itemsMap[category];
    if (!items) return;

    const catMap = { hats: 'hat', glasses: 'glasses', skins: 'skin', accessories: 'accessory' };
    const activeKey = state.activeItems[catMap[category]] || 
        (category === 'hats' ? 'none' : category === 'glasses' ? 'none' : category === 'skins' ? 'orange' : 'none');

    let gridHtml = `<div class="shop-drop-grid">`;

    Object.entries(items).forEach(([key, item]) => {
        const owned = state.ownedItems[category].includes(key);
        const active = activeKey === key;
        const showPrice = !owned && item.price > 0;
        const canBuy = !owned && state.gems >= item.price;

        gridHtml += `
        <div class="shop-drop-item ${active ? 'drop-active' : ''} ${!owned && !canBuy ? 'drop-locked' : ''}"
             data-category="${category}"
             data-key="${key}"
             data-owned="${owned ? '1' : '0'}"
             data-active="${active ? '1' : '0'}"
             data-price="${item.price}">
            <div class="drop-item-emoji">${item.emoji}</div>
            <div class="drop-item-name">${item.name}</div>
            ${active ? '<div class="drop-item-badge">✅</div>' : ''}
            ${showPrice ? `<div class="drop-item-price">💎 ${item.price}</div>` : ''}
            ${owned && !active ? '<div class="drop-item-badge drop-owned">✔️</div>' : ''}
        </div>`;
    });

    gridHtml += `</div>`;

    dropEl.innerHTML = gridHtml;
    dropEl.classList.add('open');

    // Обработчики клика по предметам
    dropEl.querySelectorAll('.shop-drop-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const cat = item.dataset.category;
            const key = item.dataset.key;
            const isOwned = item.dataset.owned === '1';
            const isActive = item.dataset.active === '1';
            const price = parseInt(item.dataset.price);

            if (isActive) return;

            if (isOwned) {
                equipItem(cat, key);
            } else {
                if (state.gems < price) {
                    showToast('💎', 'Недостаточно самоцветов!', $('#toast'));
                    return;
                }
                state.gems -= price;
                state.ownedItems[cat].push(key);
                equipItem(cat, key);
                saveState();
                updateStats();
            }
        });
    });
}

function closeShopDrop() {
    _activeShopCategory = null;
    $$('.profile-sector-btn').forEach(b => b.classList.remove('active-sector'));
    const dropEl = $('#profileShopDrop');
    if (dropEl) {
        dropEl.classList.remove('open');
        dropEl.innerHTML = '';
    }
}

function closeShopDropOnOutside(e) {
    if (!_activeShopCategory) return;
    const sectorBtn = e.target.closest('.profile-sector-btn');
    const dropItem = e.target.closest('.shop-drop-item');
    const dropEl = e.target.closest('#profileShopDrop');
    if (!sectorBtn && !dropItem && !dropEl) {
        closeShopDrop();
    }
}

function equipItem(category, itemKey) {
    const catMap = { hats: 'hat', glasses: 'glasses', skins: 'skin', accessories: 'accessory' };
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
        cat3d.sparkle();
    }

    // Тост
    const typeMap = { hats: HAT_TYPES, glasses: GLASSES_TYPES, skins: SKIN_TYPES, accessories: ACCESSORY_TYPES };
    const item = typeMap[category]?.[itemKey];
    if (item) {
        showToast(item.emoji, `${item.name} надето!`, $('#toast'));
    }

    // Перерисовать текущую открытую категорию
    if (_activeShopCategory) {
        toggleShopCategory(_activeShopCategory);
    }
}