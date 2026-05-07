// js/components/pet.js
// Компонент виртуального питомца — Lottie-анимации, скины, аксессуары

import { $, $$, showToast } from '../utils.js';
import { state, saveState, unlockAchievement } from '../state.js';
import { PET_SKINS, PET_ACCESSORIES, SUBJECTS } from '../config.js';

let petDragStart = { x: 0, y: 0, rotation: 0 };
let petDragging = false;
let petAnimFrame = null;
let lottieInstance = null;
let currentLottieMood = 'idle';

/** Маппинг состояний на Lottie-ключи */
const MOOD_KEY = {
    idle: 'lottieIdle',
    happy: 'lottieHappy',
    sad: 'lottieSad',
    excited: 'lottieExcited'
};

/** Рендер панели питомца в профиле */
export function renderPet(containerId = 'profileContent') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const skin = PET_SKINS[state.petSkin] || PET_SKINS.classic;
    const hat = PET_ACCESSORIES[state.petAccessories.hat] || PET_ACCESSORIES.none;
    const eyes = PET_ACCESSORIES[state.petAccessories.eyes] || PET_ACCESSORIES.no_glasses;
    const neck = PET_ACCESSORIES[state.petAccessories.neck] || PET_ACCESSORIES.no_neck;

    const totalLessons = countCompleted();
    const level = totalLessons + 1;

    let html = `
    <div class="pet-hero">
        <div class="pet-stage" id="petStage" style="transform:rotateY(${state.petRotation}deg);">
            <div class="pet-body-wrapper">
                <div class="lottie-pet-container" id="lottiePet"></div>
                <div class="pet-accessory pet-hat" id="petHat">${hat.emoji !== '❌' ? hat.emoji : ''}</div>
                <div class="pet-accessory pet-eyes" id="petEyes">${eyes.emoji !== '❌' ? eyes.emoji : ''}</div>
                <div class="pet-accessory pet-neck" id="petNeck">${neck.emoji !== '❌' ? neck.emoji : ''}</div>
            </div>
        </div>
        <div class="pet-info">
            <div class="pet-name">${skin.name}</div>
            <div class="pet-level">Уровень ${level} · ${skin.desc}</div>
        </div>
        <div class="pet-actions">
            <button class="pet-action-btn pet-btn" id="btnPetPet">
                <span>🖐️</span> Гладить
            </button>
            <button class="pet-action-btn dress-btn" id="btnPetDress">
                <span>👔</span> Нарядить
            </button>
            <button class="pet-action-btn rotate-btn" id="btnPetRotate">
                <span>🔄</span> Повернуть
            </button>
        </div>
    </div>

    <div class="pet-section" id="petShopSection" style="display:none;">
        <div class="pet-section-title"><span>🎨</span> Скины</div>
        <div class="pet-skin-grid" id="petSkinGrid">${renderSkinGrid()}</div>

        <div class="pet-section-title"><span>🎩</span> Головные уборы</div>
        <div class="pet-acc-grid" id="petHatGrid">${renderAccessoryGrid('hat')}</div>

        <div class="pet-section-title"><span>👓</span> Очки</div>
        <div class="pet-acc-grid" id="petEyesGrid">${renderAccessoryGrid('eyes')}</div>

        <div class="pet-section-title"><span>🧣</span> Шея</div>
        <div class="pet-acc-grid" id="petNeckGrid">${renderAccessoryGrid('neck')}</div>
    </div>

    <button class="reset-progress-btn" id="resetProgressBtn">🔄 Сбросить прогресс</button>
    `;

    container.innerHTML = html;

    // Инициализировать Lottie после вставки DOM
    initLottie(skin);

    // Обработчики
    setupPetDrag();
    setupPetButtons();
    setupShopListeners();
}

/** Инициализация Lottie-плеера */
function initLottie(skin) {
    // Очистить предыдущий экземпляр
    if (lottieInstance) {
        lottieInstance.destroy();
        lottieInstance = null;
    }

    const container = document.getElementById('lottiePet');
    if (!container) return;

    // Проверить доступность lottie (глобальная библиотека)
    if (typeof lottie === 'undefined') {
        // Фолбэк на эмодзи
        container.innerHTML = `<div class="pet-emoji-fallback">${skin.emoji || '🐱'}</div>`;
        return;
    }

    const animPath = skin.lottieIdle || 'assets/lottie/cat_idle.json';
    currentLottieMood = 'idle';

    // Использовать встроенные данные (для file:// протокола) или path
    const animData = (typeof LOTTIE_ANIMATIONS !== 'undefined' && LOTTIE_ANIMATIONS[animPath])
        ? LOTTIE_ANIMATIONS[animPath]
        : null;

    const animOptions = {
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: true
        }
    };

    if (animData) {
        animOptions.animationData = animData;
    } else {
        animOptions.path = animPath;
    }

    try {
        lottieInstance = lottie.loadAnimation(animOptions);
    } catch (e) {
        console.warn('Lottie init failed, fallback to emoji:', e);
        container.innerHTML = `<div class="pet-emoji-fallback">${skin.emoji || '🐱'}</div>`;
    }
}

/** Переключить анимацию питомца (mood: idle, happy, sad, excited) */
export function setPetMood(mood) {
    if (!lottieInstance || typeof lottie === 'undefined') return;

    const skin = PET_SKINS[state.petSkin] || PET_SKINS.classic;
    const animKey = MOOD_KEY[mood];
    if (!animKey) return;

    const animPath = skin[animKey];
    if (!animPath) return;

    if (currentLottieMood === mood) return; // уже в этом состоянии

    currentLottieMood = mood;

    // Загрузить новую анимацию (переиспользуем loadAnimation)
    // Lottie не поддерживает смену path на лету — destroy + recreate
    const animData = (typeof LOTTIE_ANIMATIONS !== 'undefined' && LOTTIE_ANIMATIONS[animPath])
        ? LOTTIE_ANIMATIONS[animPath]
        : null;

    const animOptions = {
        container: document.getElementById('lottiePet'),
        renderer: 'svg',
        loop: mood === 'excited' ? false : true, // excited проигрывается 1 раз
        autoplay: true,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: true
        }
    };

    if (animData) {
        animOptions.animationData = animData;
    } else {
        animOptions.path = animPath;
    }

    try {
        lottieInstance.destroy();
        lottieInstance = lottie.loadAnimation(animOptions);

        // После завершения excited вернуться в idle
        if (mood === 'excited') {
            lottieInstance.addEventListener('complete', () => {
                setPetMood('idle');
            });
        }
    } catch (e) {
        console.warn('Lottie mood switch failed:', e);
    }
}

function countCompleted() {
    const ms = state.skills[SUBJECTS.MATH] || [];
    const rs = state.skills[SUBJECTS.RUSSIAN] || [];
    return ms.filter(s => s.progress >= 100).length + rs.filter(s => s.progress >= 100).length;
}

function renderSkinGrid() {
    let html = '';
    Object.values(PET_SKINS).forEach(s => {
        const owned = state.petOwnedSkins.includes(s.id);
        const active = state.petSkin === s.id;
        const cls = active ? 'active' : (owned ? 'owned' : 'locked');
        const label = owned ? (active ? 'Выбрано' : 'Выбрать') : `💎${s.cost}`;
        html += `
        <div class="pet-shop-item ${cls}" data-type="skin" data-id="${s.id}" data-cost="${s.cost}" data-owned="${owned ? '1' : '0'}">
            <div class="pet-shop-emoji">${s.emoji}</div>
            <div class="pet-shop-name">${s.name}</div>
            <div class="pet-shop-action">${label}</div>
        </div>`;
    });
    return html;
}

function renderAccessoryGrid(slot) {
    const items = Object.values(PET_ACCESSORIES).filter(a => a.slot === slot);
    let html = '';
    items.forEach(a => {
        const owned = state.petOwnedAccessories.includes(a.id);
        const active = state.petAccessories[slot] === a.id;
        const cls = active ? 'active' : (owned ? 'owned' : 'locked');
        const label = owned ? (active ? 'Снято' : 'Надеть') : `💎${a.cost}`;
        html += `
        <div class="pet-shop-item ${cls}" data-type="acc" data-slot="${slot}" data-id="${a.id}" data-cost="${a.cost}" data-owned="${owned ? '1' : '0'}">
            <div class="pet-shop-emoji">${a.emoji}</div>
            <div class="pet-shop-name">${a.name}</div>
            <div class="pet-shop-action">${label}</div>
        </div>`;
    });
    return html;
}

function setupPetDrag() {
    const stage = document.getElementById('petStage');
    if (!stage) return;

    stage.addEventListener('pointerdown', (e) => {
        petDragging = true;
        petDragStart.x = e.clientX;
        petDragStart.y = e.clientY;
        petDragStart.rotation = state.petRotation;
        stage.style.cursor = 'grabbing';
        stage.style.transition = 'none';
        e.preventDefault();
    });

    window.addEventListener('pointermove', (e) => {
        if (!petDragging) return;
        if (petAnimFrame) cancelAnimationFrame(petAnimFrame);
        petAnimFrame = requestAnimationFrame(() => {
            const dx = e.clientX - petDragStart.x;
            const newRot = petDragStart.rotation + dx * 0.5;
            state.petRotation = newRot % 360;
            const s = document.getElementById('petStage');
            if (s) s.style.transform = `rotateY(${state.petRotation}deg)`;
        });
    });

    window.addEventListener('pointerup', () => {
        if (petDragging) {
            petDragging = false;
            const s = document.getElementById('petStage');
            if (s) {
                s.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                s.style.cursor = 'grab';
            }
            saveState();
        }
    });
}

function setupPetButtons() {
    // Гладить
    const btnPet = document.getElementById('btnPetPet');
    if (btnPet) {
        btnPet.addEventListener('click', () => {
            state.totalPets++;
            saveState();

            // Lottie-реакция: happy
            setPetMood('happy');
            // Вернуться в idle через 2 секунды
            setTimeout(() => {
                if (currentLottieMood === 'happy') setPetMood('idle');
            }, 2500);

            spawnHearts();
            showToast('💖', `Поглажен! Всего: ${state.totalPets}`, document.getElementById('toast'));
            // Проверка ачивки
            if (state.totalPets >= 10) {
                unlockAchievement('murmur', (name) => {
                    showToast('🏆', `${name} разблокирована!`, document.getElementById('achToast'));
                });
            }
        });
    }

    // Нарядить
    const btnDress = document.getElementById('btnPetDress');
    if (btnDress) {
        btnDress.addEventListener('click', () => {
            const shop = document.getElementById('petShopSection');
            if (shop) {
                const show = shop.style.display === 'none';
                shop.style.display = show ? 'block' : 'none';
                btnDress.innerHTML = show ? '<span>👔</span> Закрыть' : '<span>👔</span> Нарядить';
            }
        });
    }

    // Повернуть
    const btnRotate = document.getElementById('btnPetRotate');
    if (btnRotate) {
        btnRotate.addEventListener('click', () => {
            state.petRotation = (state.petRotation + 60) % 360;
            const s = document.getElementById('petStage');
            if (s) {
                s.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                s.style.transform = `rotateY(${state.petRotation}deg)`;
            }
            saveState();
        });
    }
}

function setupShopListeners() {
    const toast = document.getElementById('toast');
    const container = document.getElementById('profileContent');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const item = e.target.closest('.pet-shop-item');
        if (!item) return;

        const type = item.dataset.type;
        const id = item.dataset.id;
        const slot = item.dataset.slot;
        const cost = parseInt(item.dataset.cost) || 0;
        const owned = item.dataset.owned === '1';

        if (type === 'skin') {
            if (owned) {
                // Выбрать скин
                state.petSkin = id;
                saveState();
                refreshPetDisplay();
                updateSkinGrid(container);
                showToast('🐱', `Скин "${PET_SKINS[id]?.name}" надет!`, toast);
            } else {
                // Купить
                if (state.gems >= cost) {
                    state.gems -= cost;
                    state.petOwnedSkins.push(id);
                    state.petSkin = id;
                    saveState();
                    refreshPetDisplay();
                    updateSkinGrid(container);
                    updateGemsDisplay();
                    // Lottie-реакция: excited при покупке
                    setPetMood('excited');
                    showToast('💎', `Скин "${PET_SKINS[id]?.name}" куплен!`, toast);
                } else {
                    showToast('💎', `Не хватает 💎. Нужно ${cost}, есть ${state.gems}`, toast);
                }
            }
        } else if (type === 'acc') {
            if (owned) {
                // Переключить (надеть/снять)
                const current = state.petAccessories[slot];
                if (current === id) {
                    // Снять — вернуть дефолт
                    const defaultId = slot === 'hat' ? 'none' : (slot === 'eyes' ? 'no_glasses' : 'no_neck');
                    state.petAccessories[slot] = defaultId;
                } else {
                    state.petAccessories[slot] = id;
                }
                saveState();
                refreshPetDisplay();
                updateAccGrid(container, slot);
                const acc = PET_ACCESSORIES[id];
                const active = state.petAccessories[slot] === id;
                showToast(acc?.emoji || '👔', active ? `"${acc?.name}" надет!` : `"${acc?.name}" снят`, toast);
            } else {
                // Купить
                if (state.gems >= cost) {
                    state.gems -= cost;
                    state.petOwnedAccessories.push(id);
                    state.petAccessories[slot] = id;
                    saveState();
                    refreshPetDisplay();
                    updateAccGrid(container, slot);
                    updateGemsDisplay();
                    const acc = PET_ACCESSORIES[id];
                    showToast('💎', `"${acc?.name}" куплен и надет!`, toast);
                } else {
                    showToast('💎', `Не хватает 💎. Нужно ${cost}, есть ${state.gems}`, toast);
                }
            }
        }
    });
}

function refreshPetDisplay() {
    const skin = PET_SKINS[state.petSkin] || PET_SKINS.classic;
    const hat = PET_ACCESSORIES[state.petAccessories.hat] || PET_ACCESSORIES.none;
    const eyes = PET_ACCESSORIES[state.petAccessories.eyes] || PET_ACCESSORIES.no_glasses;
    const neck = PET_ACCESSORIES[state.petAccessories.neck] || PET_ACCESSORIES.no_neck;

    const petHat = document.getElementById('petHat');
    const petEyes = document.getElementById('petEyes');
    const petNeck = document.getElementById('petNeck');
    const petName = document.querySelector('.pet-name');
    const petLevel = document.querySelector('.pet-level');

    // Переинициализировать Lottie для нового скина
    initLottie(skin);

    if (petHat) petHat.textContent = hat.emoji !== '❌' ? hat.emoji : '';
    if (petEyes) petEyes.textContent = eyes.emoji !== '❌' ? eyes.emoji : '';
    if (petNeck) petNeck.textContent = neck.emoji !== '❌' ? neck.emoji : '';
    if (petName) petName.textContent = skin.name;
    if (petLevel) petLevel.textContent = `Уровень ${countCompleted() + 1} · ${skin.desc}`;
}

function updateSkinGrid(container) {
    const grid = container.querySelector('#petSkinGrid');
    if (grid) grid.innerHTML = renderSkinGrid();
    // Обновить data-атрибуты
    grid.querySelectorAll('.pet-shop-item').forEach(el => {
        el.dataset.owned = state.petOwnedSkins.includes(el.dataset.id) ? '1' : '0';
    });
}

function updateAccGrid(container, slot) {
    const gridId = slot === 'hat' ? 'petHatGrid' : (slot === 'eyes' ? 'petEyesGrid' : 'petNeckGrid');
    const grid = container.querySelector('#' + gridId);
    if (grid) grid.innerHTML = renderAccessoryGrid(slot);
}

function updateGemsDisplay() {
    const gemEl = document.getElementById('gemCount');
    if (gemEl) gemEl.textContent = state.gems;
}

function spawnHearts() {
    const body = document.getElementById('lottiePet');
    if (!body) return;
    const rect = body.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const hearts = ['💖', '💕', '💗', '❤️', '✨'];
    for (let i = 0; i < 5; i++) {
        const h = document.createElement('span');
        h.className = 'hearts-particle';
        h.textContent = hearts[i % hearts.length];
        h.style.position = 'fixed';
        h.style.left = (cx + (Math.random() - 0.5) * 60) + 'px';
        h.style.top = (cy + (Math.random() - 0.5) * 30) + 'px';
        h.style.fontSize = (14 + Math.random() * 10) + 'px';
        h.style.pointerEvents = 'none';
        h.style.zIndex = '999';
        h.style.animation = `floatUp ${0.8 + Math.random() * 0.6}s ease forwards`;
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 1500);
    }
}

/** Экспорт для внешних модулей: Lottie-реакции на события */
export function onCorrectAnswer() {
    setPetMood('happy');
    setTimeout(() => {
        if (currentLottieMood === 'happy') setPetMood('idle');
    }, 2000);
}

export function onWrongAnswer() {
    setPetMood('sad');
    setTimeout(() => {
        if (currentLottieMood === 'sad') setPetMood('idle');
    }, 2500);
}

export function onLessonComplete() {
    setPetMood('excited');
    // вернётся в idle автоматически через 'complete' событие
}

export function onGameOver() {
    setPetMood('sad');
    setTimeout(() => {
        if (currentLottieMood === 'sad') setPetMood('idle');
    }, 3000);
}

export function onNewRecord() {
    setPetMood('excited');
    // вернётся в idle автоматически через 'complete' событие
}

/** Очистка Lottie (вызывается при переключении панелей) */
export function destroyPetLottie() {
    if (lottieInstance) {
        lottieInstance.destroy();
        lottieInstance = null;
    }
    currentLottieMood = 'idle';
}