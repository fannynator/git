// js/components/kitty3D.js
// 3D Кот для профиля — CSS 3D Transforms, без Three.js

import { safeGetItem, safeSetItem } from '../utils.js';

const HATS = ['hat-none', 'hat-crown', 'hat-cap', 'hat-wizard'];
const GLASSES = ['glasses-none', 'glasses-round', 'glasses-cool'];
const FUR_COLORS = ['#F59E0B', '#F97316', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#6366F1', '#EAB308'];
const HAT_EMOJI = { 'hat-crown': '👑', 'hat-cap': '🧢', 'hat-wizard': '🧙‍♂️' };
const GLASSES_EMOJI = { 'glasses-round': '🤓', 'glasses-cool': '😎' };

let kittyState = {
    hatIdx: 0,
    glassesIdx: 0,
    colorIdx: 0,
    scene: null,
    cat: null
};

/**
 * Генерирует HTML-разметку 3D-кота
 */
export function kitty3DHTML() {
    return `
    <div class="kitty-3d-scene" id="kitty3DScene">
        <div class="kitty-3d-cat hat-none glasses-none" id="kitty3DCat">
            <!-- Слой 6: Шляпа -->
            <div class="kitty-layer kitty-hat-layer">
                <div class="kitty-hat kitty-hat-crown">
                    <div class="kitty-crown-base"></div>
                    <div class="kitty-crown-spike spike1"></div>
                    <div class="kitty-crown-spike spike2"></div>
                    <div class="kitty-crown-spike spike3"></div>
                </div>
                <div class="kitty-hat kitty-hat-cap">
                    <div class="kitty-cap-top"></div>
                    <div class="kitty-cap-visor"></div>
                </div>
                <div class="kitty-hat kitty-hat-wizard">
                    <div class="kitty-wizard-cone"></div>
                    <div class="kitty-wizard-brim"></div>
                    <div class="kitty-wizard-star">⭐</div>
                </div>
            </div>
            <!-- Слой 5: Уши -->
            <div class="kitty-layer kitty-ears-layer">
                <div class="kitty-ear ear-left">
                    <div class="kitty-ear-inner"></div>
                </div>
                <div class="kitty-ear ear-right">
                    <div class="kitty-ear-inner"></div>
                </div>
            </div>
            <!-- Слой 4: Голова -->
            <div class="kitty-layer kitty-head-layer">
                <div class="kitty-head">
                    <div class="kitty-forehead-stripes">
                        <div class="stripe s1"></div>
                        <div class="stripe s2"></div>
                        <div class="stripe s3"></div>
                    </div>
                    <div class="kitty-cheek cheek-l"></div>
                    <div class="kitty-cheek cheek-r"></div>
                    <div class="kitty-blush blush-l"></div>
                    <div class="kitty-blush blush-r"></div>
                    <div class="kitty-eye eye-left">
                        <div class="kitty-eyelid"></div>
                        <div class="kitty-pupil"></div>
                        <div class="kitty-eye-shine"></div>
                    </div>
                    <div class="kitty-eye eye-right">
                        <div class="kitty-eyelid"></div>
                        <div class="kitty-pupil"></div>
                        <div class="kitty-eye-shine"></div>
                    </div>
                    <div class="kitty-nose"></div>
                    <div class="kitty-mouth">
                        <div class="kitty-mouth-center"></div>
                        <div class="kitty-mouth-left"></div>
                        <div class="kitty-mouth-right"></div>
                    </div>
                    <div class="kitty-whiskers">
                        <div class="whisker wl1"></div>
                        <div class="whisker wl2"></div>
                        <div class="whisker wl3"></div>
                        <div class="whisker wr1"></div>
                        <div class="whisker wr2"></div>
                        <div class="whisker wr3"></div>
                    </div>
                </div>
            </div>
            <!-- Слой 3-бис: Очки -->
            <div class="kitty-layer kitty-glasses-layer">
                <div class="kitty-glasses">
                    <div class="kitty-glass glass-l"></div>
                    <div class="kitty-glass glass-r"></div>
                    <div class="kitty-glass-bridge"></div>
                </div>
                <div class="kitty-glasses kitty-glasses-cool">
                    <div class="cool-lens lens-l"></div>
                    <div class="cool-lens lens-r"></div>
                    <div class="cool-bridge"></div>
                </div>
            </div>
            <!-- Слой 3: Тело + пузико + хвост -->
            <div class="kitty-layer kitty-body-layer">
                <div class="kitty-body-oval">
                    <div class="kitty-belly"></div>
                </div>
                <div class="kitty-tail"></div>
            </div>
            <!-- Слой 2: Задние лапы -->
            <div class="kitty-layer kitty-back-paws-layer">
                <div class="kitty-paw paw-bl"></div>
                <div class="kitty-paw paw-br"></div>
            </div>
            <!-- Слой 1: Передние лапы -->
            <div class="kitty-layer kitty-front-paws-layer">
                <div class="kitty-paw paw-fl"></div>
                <div class="kitty-paw paw-fr"></div>
            </div>
        </div>
    </div>
    <div class="kitty-controls">
        <button class="kitty-ctrl-btn" id="kittyHatBtn" title="Шляпа">🎩 Шляпа</button>
        <button class="kitty-ctrl-btn" id="kittyGlassesBtn" title="Очки">👓 Очки</button>
        <button class="kitty-ctrl-btn" id="kittyColorBtn" title="Цвет">🎨 Цвет</button>
    </div>`;
}

/**
 * Инициализирует 3D-кота: parallax, клики, кнопки кастомизации
 * @param {HTMLElement} container - родитель, куда вставлен кот
 */
export function initKitty3D(container) {
    const scene = container.querySelector('#kitty3DScene');
    const cat = container.querySelector('#kitty3DCat');
    if (!scene || !cat) return;

    kittyState.scene = scene;
    kittyState.cat = cat;

    // Parallax: мышь
    scene.addEventListener('mousemove', (e) => {
        const rect = scene.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        applyTilt(x, y);
    });
    scene.addEventListener('mouseleave', () => {
        cat.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });

    // Parallax: touch
    scene.addEventListener('touchmove', (e) => {
        const rect = scene.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) / rect.width - 0.5;
        const y = (touch.clientY - rect.top) / rect.height - 0.5;
        applyTilt(x, y);
    }, { passive: true });
    scene.addEventListener('touchend', () => {
        cat.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });

    // Клик — погладить (petted)
    cat.addEventListener('click', () => {
        cat.classList.add('petted');
        setTimeout(() => cat.classList.remove('petted'), 600);

        // Событие для подсчёта в приложении
        if (typeof window !== 'undefined' && window.onKittyPet) {
            window.onKittyPet();
        }
    });

    // Кнопки кастомизации
    const hatBtn = container.querySelector('#kittyHatBtn');
    const glassesBtn = container.querySelector('#kittyGlassesBtn');
    const colorBtn = container.querySelector('#kittyColorBtn');

    if (hatBtn) {
        hatBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cycleHat(cat, hatBtn);
        });
    }
    if (glassesBtn) {
        glassesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cycleGlasses(cat, glassesBtn);
        });
    }
    if (colorBtn) {
        colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cycleColor(cat, colorBtn);
        });
    }

    // Сохраняем состояние в localStorage
    loadKittyState(cat);

    return kittyState;
}

function applyTilt(nx, ny) {
    if (!kittyState.cat) return;
    const maxAngle = 15;
    const rotY = nx * maxAngle;
    const rotX = -ny * maxAngle;
    kittyState.cat.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
}

function cycleHat(cat, btn) {
    const oldClass = HATS[kittyState.hatIdx];
    cat.classList.remove(oldClass);
    kittyState.hatIdx = (kittyState.hatIdx + 1) % HATS.length;
    const newClass = HATS[kittyState.hatIdx];
    cat.classList.add(newClass);
    const emoji = HAT_EMOJI[newClass] || '🎩';
    btn.innerHTML = `${emoji} Шляпа`;
    saveKittyState();
}

function cycleGlasses(cat, btn) {
    const oldClass = GLASSES[kittyState.glassesIdx];
    cat.classList.remove(oldClass);
    kittyState.glassesIdx = (kittyState.glassesIdx + 1) % GLASSES.length;
    const newClass = GLASSES[kittyState.glassesIdx];
    cat.classList.add(newClass);
    const emoji = GLASSES_EMOJI[newClass] || '👓';
    btn.innerHTML = `${emoji} Очки`;
    saveKittyState();
}

function cycleColor(cat, btn) {
    kittyState.colorIdx = (kittyState.colorIdx + 1) % FUR_COLORS.length;
    const color = FUR_COLORS[kittyState.colorIdx];
    cat.style.setProperty('--kitty-body', color);
    btn.innerHTML = `🎨 Цвет`;
    // Мини-индикатор цвета
    btn.style.boxShadow = `inset 0 3px 0 ${color}`;
    saveKittyState();
}

function saveKittyState() {
    safeSetItem('kitty3D_state', JSON.stringify({
        hatIdx: kittyState.hatIdx,
        glassesIdx: kittyState.glassesIdx,
        colorIdx: kittyState.colorIdx
    }));
}

function loadKittyState(cat) {
    const raw = safeGetItem('kitty3D_state');
    if (raw) {
        try {
            const saved = JSON.parse(raw);
            if (typeof saved.hatIdx === 'number') kittyState.hatIdx = saved.hatIdx;
            if (typeof saved.glassesIdx === 'number') kittyState.glassesIdx = saved.glassesIdx;
            if (typeof saved.colorIdx === 'number') kittyState.colorIdx = saved.colorIdx;
        } catch (e) { /* игнор */ }
    }

    // Применяем загруженные классы
    const hatCls = HATS[kittyState.hatIdx];
    const glassesCls = GLASSES[kittyState.glassesIdx];
    const color = FUR_COLORS[kittyState.colorIdx];

    cat.className = cat.className.replace(/\bhat-\w+/g, '').replace(/\bglasses-\w+/g, '').trim();
    cat.classList.add('kitty-3d-cat', hatCls, glassesCls);
    cat.style.setProperty('--kitty-body', color);

    // Обновляем кнопки
    const hatBtn = document.querySelector('#kittyHatBtn');
    const glassesBtn = document.querySelector('#kittyGlassesBtn');
    const colorBtn = document.querySelector('#kittyColorBtn');
    if (hatBtn) hatBtn.innerHTML = `${HAT_EMOJI[hatCls] || '🎩'} Шляпа`;
    if (glassesBtn) glassesBtn.innerHTML = `${GLASSES_EMOJI[glassesCls] || '👓'} Очки`;
    if (colorBtn) {
        colorBtn.innerHTML = '🎨 Цвет';
        colorBtn.style.boxShadow = `inset 0 3px 0 ${color}`;
    }
}