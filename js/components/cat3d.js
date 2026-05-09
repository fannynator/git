// js/components/cat3d.js
// 3D Cat Model "Cute Cartoon Cat" by 3Dima (CC BY 4.0) — https://skfb.ly/pFKSW
// Graduation Cap by mikaeel_irani (CC BY 4.0) — https://sketchfab.com/3d-models/low-poly-graduation-cap-16c5a71fdb2b4751961966e41d1e7b92

const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const GLTF_LOADER_CDN = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';

let _threeReady = false;
let _threePromise = null;

function _loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) { resolve(); return; }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Не удалось загрузить: ' + src));
        document.head.appendChild(script);
    });
}

async function _ensureThree() {
    if (_threePromise) return _threePromise;
    _threePromise = (async () => {
        if (typeof THREE !== 'undefined' && THREE.Scene && THREE.GLTFLoader) {
            _threeReady = true;
            return;
        }
        await _loadScript(THREE_CDN);
        await _loadScript(GLTF_LOADER_CDN);
        // Даём время на инициализацию
        await new Promise(r => setTimeout(r, 50));
        _threeReady = true;
    })();
    return _threePromise;
}

// ─── Индикатор загрузки ──────────────────────────────────────

function _showLoader(container) {
    const loader = document.createElement('div');
    loader.className = 'cat3d-loader';
    loader.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    const style = document.createElement('style');
    style.textContent = `
        .cat3d-loader {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-size: 32px; color: #F59E0B;
            font-family: monospace; z-index: 10;
            user-select: none; pointer-events: none;
        }
        .cat3d-loader span {
            animation: cat3d-dot 1.4s infinite;
            opacity: 0;
        }
        .cat3d-loader span:nth-child(1) { animation-delay: 0s; }
        .cat3d-loader span:nth-child(2) { animation-delay: 0.2s; }
        .cat3d-loader span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cat3d-dot {
            0%, 80%, 100% { opacity: 0; }
            40% { opacity: 1; }
        }
    `;
    container.style.position = 'relative';
    container.appendChild(style);
    container.appendChild(loader);
    return loader;
}

function _hideLoader(container, loaderEl) {
    if (loaderEl && loaderEl.parentNode) {
        loaderEl.parentNode.removeChild(loaderEl);
    }
    const oldStyle = container.querySelector('.cat3d-loader + style, style:has(+ .cat3d-loader)');
    // Удаляем стиль лоадера
    const styles = container.querySelectorAll('style');
    styles.forEach(s => {
        if (s.textContent.includes('cat3d-dot')) s.remove();
    });
}

// ─── Класс Cat3D ─────────────────────────────────────────────

// ─── Типы предметов (экспортируются в profile.js) ───────────

export const HAT_TYPES = {
    none:     { name: 'Без шляпы', emoji: '🚫', price: 0 },
    graduate: { name: 'Выпускник', emoji: '🎓', price: 300 },
    cap:      { name: 'Кепка',     emoji: '🧢', price: 150 },
    crown:    { name: 'Корона',    emoji: '👑', price: 500 },
    tophat:   { name: 'Цилиндр',   emoji: '🎩', price: 350 },
    wizard:   { name: 'Волшебник', emoji: '🪄', price: 400 },
};

export const GLASSES_TYPES = {
    none:  { name: 'Без очков', emoji: '🚫', price: 0 },
    round: { name: 'Круглые',   emoji: '👓', price: 100 },
    cool:  { name: 'Крутые',    emoji: '😎', price: 200 },
    star:  { name: 'Звёздные',  emoji: '🌟', price: 250 },
    '3d':  { name: '3D-очки',   emoji: '🕶️', price: 300 },
};

export const SKIN_TYPES = {
    orange: { name: 'Рыжий',     emoji: '🦊', hex: '#F59E0B', price: 0 },
    white:  { name: 'Белый',     emoji: '🐱', hex: '#FFFFFF', price: 200 },
    black:  { name: 'Чёрный',    emoji: '🐈‍⬛', hex: '#374151', price: 250 },
    gray:   { name: 'Серый',     emoji: '🐱', hex: '#9CA3AF', price: 150 },
    pink:   { name: 'Розовый',   emoji: '🌸', hex: '#F9A8D4', price: 300 },
    blue:   { name: 'Голубой',   emoji: '🦋', hex: '#93C5FD', price: 350 },
    purple: { name: 'Пурпурный', emoji: '💜', hex: '#C084FC', price: 400 },
};

export const ACCESSORY_TYPES = {
    none:   { name: 'Без аксессуара', emoji: '🚫', price: 0 },
    bowtie: { name: 'Бабочка',       emoji: '🎀', price: 120 },
    collar: { name: 'Ошейник',       emoji: '🔔', price: 150 },
    fish:   { name: 'Рыбка',         emoji: '🐟', price: 100 },
    book:   { name: 'Книга',         emoji: '📖', price: 180 },
    stars:  { name: 'Звёзды',        emoji: '✨', price: 300 },
};

export class Cat3D {
    /**
     * @param {HTMLElement} container — DOM-элемент для canvas
     * @param {object} [appState] — объект state приложения (для совместимости)
     * @param {Function} [saveFn] — функция сохранения state
     */
    constructor(container, appState, saveFn) {
        if (!container) throw new Error('Cat3D: container обязателен');
        this.container = container;
        this._appState = appState || null;
        this._saveFn = saveFn || null;
        this._width = 250;
        this._height = 250;
        this._disposed = false;

        // Three.js объекты
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this._catModel = null;      // загруженная GLB модель кота
        this._hatGroup = null;       // группа для шляпы
        this._glassesGroup = null;   // группа для очков
        this._accessoryGroup = null; // группа для аксессуаров
        this._shadowPlane = null;
        this._graduateModel = null;  // кеш загруженной шляпы выпускника

        // Базовая Y-позиция модели (сохраняется после загрузки)
        this._baseY = 0;

        // Анимации
        this._clock = new (typeof THREE !== 'undefined' && THREE.Clock ? THREE.Clock : function() { this.getDelta = () => 0.016; })();
        this._animTime = 0;
        this._breathePhase = Math.random() * Math.PI * 2;
        this._swayPhase = Math.random() * Math.PI * 2;
        this._jumpOffset = 0;
        this._blinkTimer = 0;
        this._blinkInterval = 3 + Math.random() * 5;
        this._isBlinking = false;
        this._eyeBones = [];
        this._blinkProgress = 0;

        // Вращение (drag)
        this._targetRotY = 0;
        this._targetRotX = 0;
        this._currentRotY = 0;
        this._currentRotX = 0;
        this._isDragging = false;
        this._dragStartX = 0;
        this._dragStartY = 0;
        this._dragStartRotX = 0;
        this._dragStartRotY = 0;

        // Кастомизация
        this._currentHat = 'none';
        this._currentGlasses = 'none';
        this._currentAccessory = 'none';
        this._currentSkin = null;

        // Тема
        this._bgColor = '#1a1a2e';

        // Лицензии
        console.log('🐱 3D Cat Model "Cute Cartoon Cat" by 3Dima (CC BY 4.0) — https://skfb.ly/pFKSW');
        console.log('🎓 Graduation Cap by mikaeel_irani (CC BY 4.0) — https://sketchfab.com/3d-models/low-poly-graduation-cap-16c5a71fdb2b4751961966e41d1e7b92');

        // Загрузка
        this._init();
    }

    async _init() {
        const loaderEl = _showLoader(this.container);
        try {
            await _ensureThree();
            if (this._disposed) return;
            this._setupScene();
            await this._loadCatModel();
            if (this._disposed) return;
            this._setupLights();
            this._setupShadow();
            this._setupInteraction();
            this._restoreState();
            this._startLoop();
            _hideLoader(this.container, loaderEl);
        } catch (err) {
            console.error('Cat3D: ошибка инициализации', err);
            _hideLoader(this.container, loaderEl);
        }
    }

    // ─── Сцена ───────────────────────────────────────────────

    _setupScene() {
        this.scene = new THREE.Scene();

        this._width = this.container.clientWidth || 250;
        this._height = this.container.clientHeight || 250;

        this.camera = new THREE.PerspectiveCamera(45, this._width / this._height, 0.1, 100);
        this.camera.position.set(0, 0.5, 4.5);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this._width, this._height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        this._updateBgColor();

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.cursor = 'pointer';

        // Pivot-группа: всё вращается вокруг неё
        this._pivotGroup = new THREE.Group();
        this._pivotGroup.name = 'pivotGroup';
        this.scene.add(this._pivotGroup);

        // Группы кастомизации — внутри pivot
        this._hatGroup = new THREE.Group();
        this._hatGroup.name = 'hatGroup';
        this._pivotGroup.add(this._hatGroup);
        this._glassesGroup = new THREE.Group();
        this._glassesGroup.name = 'glassesGroup';
        this._pivotGroup.add(this._glassesGroup);
        this._accessoryGroup = new THREE.Group();
        this._accessoryGroup.name = 'accessoryGroup';
        this._pivotGroup.add(this._accessoryGroup);
    }

    _setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.95);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
        dirLight.position.set(2, 4, 3);
        this.scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-1, -0.5, 2);
        this.scene.add(fillLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
        this.scene.add(hemiLight);
    }

    _setupShadow() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, 'rgba(0,0,0,0.35)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.12)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        const tex = new THREE.CanvasTexture(canvas);
        const planeGeo = new THREE.PlaneGeometry(1.6, 1.6);
        const planeMat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        this._shadowPlane = new THREE.Mesh(planeGeo, planeMat);
        this._shadowPlane.rotation.x = -Math.PI / 2;
        this._shadowPlane.position.y = -1.5;
        this._shadowPlane.renderOrder = 1;
        this.scene.add(this._shadowPlane);
    }

    _updateBgColor() {
        if (!this.renderer) return;
        try {
            const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
            if (bg) this._bgColor = bg;
        } catch (e) { /* игнор */ }
        this.renderer.domElement.style.background = this._bgColor || '#1a1a2e';
    }

    // ─── Загрузка моделей ────────────────────────────────────

    async _loadCatModel() {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            loader.load(
                'assets/cat/cat.glb',
                (gltf) => {
                    this._catModel = gltf.scene;

                    // Подгоняем масштаб: кот должен занимать ~70% высоты 250px
                    // Камера на z=4.5 с fov=45 — видимая высота на z=0 примерно 3.7 единиц
                    // 70% от 3.7 ≈ 2.6 единиц. Подгоним bounding box.
                    const box = new THREE.Box3().setFromObject(this._catModel);
                    const sizeY = box.max.y - box.min.y;
                    const targetSize = 2.1;
                    const scale = targetSize / (sizeY || 2);
                    this._catModel.scale.setScalar(scale);
                    // Фиксируем базовый scale для анимации дыхания
                    this._catModel.userData.baseScale = scale;

                    // Центрируем модель внутри pivot (визуальный центр в 0,0,0)
                    const center = box.getCenter(new THREE.Vector3());
                    this._catModel.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
                    // Модель внутри pivot: позиция = смещение от её геометрического центра
                    // Pivot задаёт мировую позицию (подъём над полом)
                    this._pivotGroup.position.set(0, -box.min.y * scale - 0.4, 0);
                    // Сохраняем базовую Y-позицию pivot для анимации прыжка
                    this._baseY = this._pivotGroup.position.y;

                    // Ищем кости глаз для моргания
                    this._catModel.traverse((child) => {
                        if (child.isBone && child.name && /eye|blink|lid/i.test(child.name)) {
                            this._eyeBones.push(child);
                        }
                    });

                    // Поворачиваем модель лицом к камере (камера на Z=4.5)
                    // Модель по умолчанию смотрит по +X, лицом к камере (Z+)
                    this._catModel.rotation.y = -Math.PI / 2;

                    // Модель внутри pivot
                    this._pivotGroup.add(this._catModel);

                    resolve();
                },
                (progress) => {
                    // Прогресс загрузки (можно использовать для индикатора)
                },
                (error) => {
                    console.warn('Cat3D: не удалось загрузить модель кота, создаю заглушку', error);
                    this._createFallbackCat();
                    resolve();
                }
            );
        });
    }

    _createFallbackCat() {
        // Запасной кот из примитивов, если GLB не загрузился
        const group = new THREE.Group();

        const bodyGeo = new THREE.SphereGeometry(0.6, 32, 32);
        const bodyMat = new THREE.MeshToonMaterial({ color: '#F59E0B' });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1, 1.2, 1);
        body.position.y = -0.1;
        group.add(body);

        const headGeo = new THREE.SphereGeometry(0.5, 32, 32);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.y = 0.7;
        group.add(head);

        // Уши
        const earGeo = new THREE.ConeGeometry(0.18, 0.45, 12);
        const earL = new THREE.Mesh(earGeo, bodyMat);
        earL.position.set(-0.3, 1.0, 0);
        earL.rotation.z = 0.3;
        group.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat);
        earR.position.set(0.3, 1.0, 0);
        earR.rotation.z = -0.3;
        group.add(earR);

        const tailGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.position.set(0.4, -0.2, -0.1);
        tail.rotation.z = 0.8;
        tail.rotation.x = 0.4;
        group.add(tail);

        // Глаза
        const eyeWhiteGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const eyeWhiteMat = new THREE.MeshToonMaterial({ color: '#FFFFFF' });
        const eyeL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
        eyeL.position.set(-0.18, 0.75, 0.42);
        group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
        eyeR.position.set(0.18, 0.75, 0.42);
        group.add(eyeR);

        const pupilGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const pupilMat = new THREE.MeshToonMaterial({ color: '#1E293B' });
        const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
        pupilL.position.set(-0.18, 0.73, 0.52);
        group.add(pupilL);
        const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
        pupilR.position.set(0.18, 0.73, 0.52);
        group.add(pupilR);

        // Нос
        const noseGeo = new THREE.ConeGeometry(0.05, 0.07, 8);
        const noseMat = new THREE.MeshToonMaterial({ color: '#F472B6' });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 0.6, 0.48);
        nose.rotation.x = Math.PI;
        group.add(nose);

        // Лапы
        const pawGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
        [
            [-0.25, -0.55, 0.15],
            [0.25, -0.55, 0.15],
            [-0.2, -0.6, -0.1],
            [0.2, -0.6, -0.1]
        ].forEach(([x, y, z]) => {
            const paw = new THREE.Mesh(pawGeo, bodyMat);
            paw.position.set(x, y, z);
            group.add(paw);
        });

        this._catModel = group;
        // Модель внутри pivot
        this._pivotGroup.add(group);
        // Группы кастомизации уже внутри pivot (см. _setupScene)
    }

    async _loadGraduateModel() {
        if (this._graduateModel) return this._graduateModel;

        return new Promise((resolve) => {
            const loader = new THREE.GLTFLoader();
            loader.load(
                'assets/hats/graduate.glb',
                (gltf) => {
                    this._graduateModel = gltf.scene;
                    resolve(this._graduateModel);
                },
                undefined,
                () => {
                    // Запасная шляпа
                    console.warn('Cat3D: не удалось загрузить шляпу выпускника');
                    const cap = new THREE.Group();
                    const baseGeo = new THREE.BoxGeometry(0.5, 0.06, 0.5);
                    const baseMat = new THREE.MeshToonMaterial({ color: '#1F2937' });
                    const base = new THREE.Mesh(baseGeo, baseMat);
                    cap.add(base);
                    const topGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 4);
                    const top = new THREE.Mesh(topGeo, baseMat);
                    top.position.y = 0.18;
                    cap.add(top);
                    const tasselGeo = new THREE.SphereGeometry(0.04, 6, 6);
                    const tasselMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
                    const tassel = new THREE.Mesh(tasselGeo, tasselMat);
                    tassel.position.set(0.2, 0.3, 0);
                    cap.add(tassel);
                    this._graduateModel = cap;
                    resolve(cap);
                }
            );
        });
    }

    // ─── Кастомизация ────────────────────────────────────────

    /**
     * Установить цвет шерсти
     * @param {string} hexColor — CSS-цвет, например '#F59E0B'
     */
    setSkin(hexColor) {
        if (!hexColor || !this._catModel) return;
        this._currentSkin = hexColor;
        const color = new THREE.Color(hexColor);

        this._catModel.traverse((child) => {
            if (child.isMesh && child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(mat => {
                    if (mat.color && mat.name !== 'eyeWhite' && !mat.name?.includes('eye')) {
                        // Красим только если материал выглядит как «тело» (не глаза, не аксессуары)
                        const hex = '#' + mat.color.getHexString();
                        // Не красим белое (глаза), чёрное (зрачки), розовое (нос)
                        if (!['#ffffff', '#000000', '#1e293b'].includes(hex.toLowerCase())) {
                            mat.color.set(color);

                        }

                    }
                });
            }
        });

        this._saveState();
    }

    /**
     * Установить шляпу
     * @param {'none'|'graduate'|'cap'|'crown'|'tophat'|'wizard'} type
     */
    async setHat(type) {
        this._clearGroup(this._hatGroup);
        this._currentHat = type || 'none';
        if (type === 'none' || !type) { this._saveState(); return; }

        if (type === 'graduate') {
            try {
                const model = await this._loadGraduateModel();
                const clone = model.clone(true);
                clone.position.set(0, 0.9, 0);
                clone.scale.setScalar(0.6);
                this._hatGroup.add(clone);
            } catch (e) {
                console.warn('Cat3D: ошибка загрузки шляпы выпускника', e);
            }
        } else if (type === 'cap') {
            const mat = new THREE.MeshToonMaterial({ color: '#3B82F6' });
            const crownGeo = new THREE.SphereGeometry(0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            const crown = new THREE.Mesh(crownGeo, mat);
            crown.position.y = 0.85;
            this._hatGroup.add(crown);

            const visorGeo = new THREE.BoxGeometry(0.35, 0.04, 0.2);
            const visor = new THREE.Mesh(visorGeo, new THREE.MeshToonMaterial({ color: '#1E3A5F' }));
            visor.position.set(0, 0.78, 0.12);
            this._hatGroup.add(visor);
        } else if (type === 'crown') {
            const mat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            const baseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.12, 8);
            const base = new THREE.Mesh(baseGeo, mat);
            base.position.y = 0.88;
            this._hatGroup.add(base);

            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + 0.3;
                const spikeGeo = new THREE.ConeGeometry(0.04, 0.18, 6);
                const spike = new THREE.Mesh(spikeGeo, mat);
                spike.position.set(Math.cos(angle) * 0.22, 1.02, Math.sin(angle) * 0.22);
                this._hatGroup.add(spike);
            }

            // Камни
            const gemColors = ['#EF4444', '#3B82F6', '#10B981'];
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + 0.3;
                const gemGeo = new THREE.SphereGeometry(0.035, 6, 6);
                const gemMat = new THREE.MeshToonMaterial({ color: gemColors[i] });
                const gem = new THREE.Mesh(gemGeo, gemMat);
                gem.position.set(Math.cos(angle) * 0.24, 0.86, Math.sin(angle) * 0.24);
                this._hatGroup.add(gem);
            }
        } else if (type === 'tophat') {
            const mat = new THREE.MeshToonMaterial({ color: '#1F2937' });
            const brimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.04, 16);
            const brim = new THREE.Mesh(brimGeo, mat);
            brim.position.y = 0.84;
            this._hatGroup.add(brim);

            const topGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.4, 16);
            const top = new THREE.Mesh(topGeo, mat);
            top.position.y = 1.05;
            this._hatGroup.add(top);

            const bandGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16);
            const bandMat = new THREE.MeshToonMaterial({ color: '#EF4444' });
            const band = new THREE.Mesh(bandGeo, bandMat);
            band.position.y = 0.88;
            this._hatGroup.add(band);
        } else if (type === 'wizard') {
            const mat = new THREE.MeshToonMaterial({ color: '#7C3AED' });
            const coneGeo = new THREE.ConeGeometry(0.2, 0.55, 16);
            const cone = new THREE.Mesh(coneGeo, mat);
            cone.position.y = 1.1;
            cone.rotation.z = -0.15;
            this._hatGroup.add(cone);

            const brimGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 16);
            const brim = new THREE.Mesh(brimGeo, mat);
            brim.position.y = 0.85;
            brim.rotation.x = Math.PI / 2;
            this._hatGroup.add(brim);

            // Звёзды
            const starMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            for (let i = 0; i < 3; i++) {
                const starGeo = new THREE.SphereGeometry(0.04, 6, 6);
                const star = new THREE.Mesh(starGeo, starMat);
                star.position.set((Math.random() - 0.5) * 0.25, 0.9 + Math.random() * 0.45, (Math.random() - 0.5) * 0.25);
                this._hatGroup.add(star);
            }
        }

        this._saveState();
    }

    /**
     * Установить очки
     * @param {'none'|'round'|'cool'|'star'|'3d'} type
     */
    setGlasses(type) {
        this._clearGroup(this._glassesGroup);
        this._currentGlasses = type || 'none';
        if (type === 'none' || !type) { this._saveState(); return; }

        const yPos = 0.65;
        const zPos = 0.45;

        if (type === 'round') {
            const frameMat = new THREE.MeshToonMaterial({ color: '#1F2937' });
            const torusGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 12);
            [-0.15, 0.15].forEach(x => {
                const frame = new THREE.Mesh(torusGeo, frameMat);
                frame.position.set(x, yPos, zPos);
                this._glassesGroup.add(frame);
            });
            // Перемычка
            const bridgeGeo = new THREE.BoxGeometry(0.15, 0.02, 0.02);
            const bridge = new THREE.Mesh(bridgeGeo, frameMat);
            bridge.position.set(0, yPos, zPos);
            this._glassesGroup.add(bridge);
            // Линзы
            const lensGeo = new THREE.CircleGeometry(0.08, 12);
            const lensMat = new THREE.MeshToonMaterial({ color: '#93C5FD', transparent: true, opacity: 0.25, side: THREE.DoubleSide });
            [-0.15, 0.15].forEach(x => {
                const lens = new THREE.Mesh(lensGeo, lensMat);
                lens.position.set(x, yPos, zPos + 0.01);
                this._glassesGroup.add(lens);
            });
        } else if (type === 'cool') {
            const frameMat = new THREE.MeshToonMaterial({ color: '#111827' });
            const boxGeo = new THREE.BoxGeometry(0.24, 0.14, 0.03);
            [-0.18, 0.18].forEach(x => {
                const box = new THREE.Mesh(boxGeo, frameMat);
                box.position.set(x, yPos, zPos);
                this._glassesGroup.add(box);
            });
            const bridgeGeo = new THREE.BoxGeometry(0.15, 0.02, 0.02);
            const bridge = new THREE.Mesh(bridgeGeo, frameMat);
            bridge.position.set(0, yPos, zPos);
            this._glassesGroup.add(bridge);
            // Тёмные линзы
            const darkLensMat = new THREE.MeshToonMaterial({ color: '#1a1a1a', transparent: true, opacity: 0.6 });
            const lensGeo = new THREE.BoxGeometry(0.2, 0.1, 0.01);
            [-0.18, 0.18].forEach(x => {
                const lens = new THREE.Mesh(lensGeo, darkLensMat);
                lens.position.set(x, yPos, zPos + 0.015);
                this._glassesGroup.add(lens);
            });
        } else if (type === 'star') {
            const mat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            const torusGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 12);
            [-0.15, 0.15].forEach(x => {
                const frame = new THREE.Mesh(torusGeo, mat);
                frame.position.set(x, yPos, zPos);
                this._glassesGroup.add(frame);
            });
            const bridgeGeo = new THREE.BoxGeometry(0.15, 0.02, 0.02);
            const bridge = new THREE.Mesh(bridgeGeo, mat);
            bridge.position.set(0, yPos, zPos);
            this._glassesGroup.add(bridge);
            // Звёздочки по бокам
            const starGeo = new THREE.SphereGeometry(0.03, 4, 4);
            [-0.25, 0.25].forEach(x => {
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const star = new THREE.Mesh(starGeo, mat);
                    star.position.set(x + Math.cos(angle) * 0.08, yPos + Math.sin(angle) * 0.08, zPos);
                    this._glassesGroup.add(star);
                }
            });
        } else if (type === '3d') {
            const boxGeo = new THREE.BoxGeometry(0.2, 0.13, 0.04);
            const redMat = new THREE.MeshToonMaterial({ color: '#EF4444', transparent: true, opacity: 0.7 });
            const blueMat = new THREE.MeshToonMaterial({ color: '#3B82F6', transparent: true, opacity: 0.7 });
            const lensL = new THREE.Mesh(boxGeo, redMat);
            lensL.position.set(-0.15, yPos, zPos);
            this._glassesGroup.add(lensL);
            const lensR = new THREE.Mesh(boxGeo, blueMat);
            lensR.position.set(0.15, yPos, zPos);
            this._glassesGroup.add(lensR);
            const bridgeGeo = new THREE.BoxGeometry(0.12, 0.02, 0.02);
            const bridge = new THREE.Mesh(bridgeGeo, new THREE.MeshToonMaterial({ color: '#1F2937' }));
            bridge.position.set(0, yPos, zPos);
            this._glassesGroup.add(bridge);
        }

        this._saveState();
    }

    /**
     * Установить аксессуар
     * @param {'none'|'bowtie'|'collar'|'fish'|'book'|'stars'} type
     */
    setAccessory(type) {
        this._clearGroup(this._accessoryGroup);
        this._currentAccessory = type || 'none';
        if (type === 'none' || !type) { this._saveState(); return; }

        if (type === 'bowtie') {
            const mat = new THREE.MeshToonMaterial({ color: '#EF4444' });
            const wingGeo = new THREE.BoxGeometry(0.14, 0.07, 0.03);
            const wingL = new THREE.Mesh(wingGeo, mat);
            wingL.position.set(-0.12, 0.35, 0.3);
            wingL.rotation.z = -0.3;
            this._accessoryGroup.add(wingL);
            const wingR = new THREE.Mesh(wingGeo, mat);
            wingR.position.set(0.12, 0.35, 0.3);
            wingR.rotation.z = 0.3;
            this._accessoryGroup.add(wingR);
            const knotGeo = new THREE.SphereGeometry(0.04, 8, 8);
            const knot = new THREE.Mesh(knotGeo, mat);
            knot.position.set(0, 0.35, 0.31);
            this._accessoryGroup.add(knot);
        } else if (type === 'collar') {
            const mat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            const torusGeo = new THREE.TorusGeometry(0.25, 0.03, 8, 16);
            const collar = new THREE.Mesh(torusGeo, mat);
            collar.position.y = 0.3;
            collar.rotation.x = Math.PI / 2;
            this._accessoryGroup.add(collar);
            const bellGeo = new THREE.SphereGeometry(0.05, 8, 8);
            const bell = new THREE.Mesh(bellGeo, mat);
            bell.position.set(0, 0.05, 0.25);
            this._accessoryGroup.add(bell);
        } else if (type === 'fish') {
            const mat = new THREE.MeshToonMaterial({ color: '#F97316' });
            const bodyGeo = new THREE.SphereGeometry(0.08, 8, 8);
            bodyGeo.scale(1, 0.6, 1.5);
            const body = new THREE.Mesh(bodyGeo, mat);
            body.position.set(0.15, -0.1, 0.35);
            this._accessoryGroup.add(body);
            const tailGeo = new THREE.ConeGeometry(0.06, 0.12, 6);
            const tail = new THREE.Mesh(tailGeo, mat);
            tail.position.set(0.15, -0.1, 0.2);
            tail.rotation.x = Math.PI / 2;
            this._accessoryGroup.add(tail);
            // Глаз
            const eyeGeo = new THREE.SphereGeometry(0.02, 4, 4);
            const eyeMat = new THREE.MeshToonMaterial({ color: '#FFFFFF' });
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(0.18, -0.08, 0.42);
            this._accessoryGroup.add(eye);
        } else if (type === 'book') {
            const coverMat = new THREE.MeshToonMaterial({ color: '#8B4513' });
            const coverGeo = new THREE.BoxGeometry(0.14, 0.02, 0.2);
            const cover = new THREE.Mesh(coverGeo, coverMat);
            cover.position.set(0.2, -0.3, 0.25);
            cover.rotation.z = 0.3;
            cover.rotation.x = -0.2;
            this._accessoryGroup.add(cover);
            const pageGeo = new THREE.BoxGeometry(0.12, 0.01, 0.18);
            const pageMat = new THREE.MeshToonMaterial({ color: '#FEF3C7' });
            const page = new THREE.Mesh(pageGeo, pageMat);
            page.position.set(0.2, -0.29, 0.25);
            page.rotation.z = 0.3;
            page.rotation.x = -0.2;
            this._accessoryGroup.add(page);
        } else if (type === 'stars') {
            const starMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            const starGeo = new THREE.SphereGeometry(0.03, 4, 4);
            for (let i = 0; i < 10; i++) {
                const star = new THREE.Mesh(starGeo, starMat);
                const angle = (i / 10) * Math.PI * 2;
                const radius = 0.5 + Math.random() * 0.3;
                star.position.set(Math.cos(angle) * radius, -0.2 + Math.random() * 0.8, Math.sin(angle) * radius);
                star.userData = {
                    baseAngle: angle,
                    baseRadius: radius,
                    baseY: star.position.y,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.8 + Math.random() * 1.2
                };
                this._accessoryGroup.add(star);
            }
        }

        this._saveState();
    }

    _clearGroup(group) {
        while (group.children.length > 0) {
            const child = group.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(m => m.dispose());
            }
            group.remove(child);
        }
    }

    // ─── Взаимодействие ──────────────────────────────────────

    _setupInteraction() {
        const canvas = this.renderer.domElement;
        canvas.style.cursor = 'grab';

        canvas.addEventListener('mousemove', (e) => {
            if (!this._isDragging) return;
            const rect = canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width;
            const my = (e.clientY - rect.top) / rect.height;
            this._targetRotY = this._dragStartRotY + (mx - this._dragStartX) * Math.PI * 1.5;
            this._targetRotX = this._dragStartRotX + (my - this._dragStartY) * Math.PI;
            this._targetRotX = Math.max(-0.4, Math.min(0.4, this._targetRotX));
        });

        canvas.addEventListener('mousedown', (e) => {
            this._isDragging = true;
            canvas.style.cursor = 'grabbing';
            const rect = canvas.getBoundingClientRect();
            this._dragStartX = (e.clientX - rect.left) / rect.width;
            this._dragStartY = (e.clientY - rect.top) / rect.height;
            this._dragStartRotX = this._targetRotX;
            this._dragStartRotY = this._targetRotY;
        });

        window.addEventListener('mouseup', () => {
            if (this._isDragging) {
                this._isDragging = false;
                canvas.style.cursor = 'grab';
            }
        });

        canvas.addEventListener('mouseleave', () => {
            if (this._isDragging) {
                this._isDragging = false;
                canvas.style.cursor = 'grab';
            }
        });

        // Клик (без драга) — прыжок
        canvas.addEventListener('click', (e) => {
            const dx = Math.abs((e.clientX / window.innerWidth) - this._dragStartX);
            if (dx < 0.02) this._jump();
        });

        // Touch
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this._isDragging = true;
                const rect = canvas.getBoundingClientRect();
                this._dragStartX = (e.touches[0].clientX - rect.left) / rect.width;
                this._dragStartY = (e.touches[0].clientY - rect.top) / rect.height;
                this._dragStartRotX = this._targetRotX;
                this._dragStartRotY = this._targetRotY;
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', (e) => {
            if (!this._isDragging || e.touches.length !== 1) return;
            const rect = canvas.getBoundingClientRect();
            const mx = (e.touches[0].clientX - rect.left) / rect.width;
            const my = (e.touches[0].clientY - rect.top) / rect.height;
            this._targetRotY = this._dragStartRotY + (mx - this._dragStartX) * Math.PI * 1.5;
            this._targetRotX = this._dragStartRotX + (my - this._dragStartY) * Math.PI;
            this._targetRotX = Math.max(-0.4, Math.min(0.4, this._targetRotX));
        }, { passive: true });

        canvas.addEventListener('touchend', (e) => {
            if (this._isDragging) {
                this._isDragging = false;
                const dx = Math.abs((e.changedTouches[0]?.clientX || 0) / window.innerWidth - this._dragStartX);
                if (dx < 0.02) this._jump();
            }
        });

        // Ресайз
        window.addEventListener('resize', () => {
            if (this._disposed) return;
            this._width = this.container.clientWidth || 250;
            this._height = this.container.clientHeight || 250;
            this.renderer.setSize(this._width, this._height);
            this.camera.aspect = this._width / this._height;
            this.camera.updateProjectionMatrix();
        });

        // Отключаем скролл-зум
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    _jump() {
        this._jumpOffset = 0.15;
        let startTime = performance.now();
        const duration = 300;
        const animateJump = (now) => {
            if (this._disposed) return;
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            this._jumpOffset = 0.15 * (1 - eased);
            if (progress < 1) {
                requestAnimationFrame(animateJump);
            } else {
                this._jumpOffset = 0;
            }
        };
        requestAnimationFrame(animateJump);
    }

    // ─── Анимации ────────────────────────────────────────────

    _startLoop() {
        const animate = () => {
            if (this._disposed) return;
            requestAnimationFrame(animate);

            const dt = Math.min(this._clock.getDelta ? this._clock.getDelta() : 0.016, 0.1);
            this._animTime += dt;

            this._updateAnimations(dt);
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    _updateAnimations(dt) {
        if (!this._catModel) return;
        const pivot = this._pivotGroup;

        // ── Плавный поворот за мышью (drag) — вращаем pivot вокруг своей оси ──
        const rotSpeed = 6;
        this._currentRotY += (this._targetRotY - this._currentRotY) * Math.min(rotSpeed * dt, 1);
        this._currentRotX += (this._targetRotX - this._currentRotX) * Math.min(rotSpeed * dt, 1);
        if (pivot) {
            pivot.rotation.y = this._currentRotY;
            pivot.rotation.x = this._currentRotX;
        }

        // ── Дыхание (scale ±1% за 3 секунды) ──
        this._breathePhase += dt * (Math.PI * 2 / 3);
        const breatheScale = 1 + Math.sin(this._breathePhase) * 0.01;
        if (this._catModel && this._catModel.userData.baseScale) {
            this._catModel.scale.setScalar(this._catModel.userData.baseScale * breatheScale);
        }

        // ── Покачивание (±2° по Z, 4 секунды) — на pivot ──
        this._swayPhase += dt * (Math.PI * 2 / 4);
        const swayAngle = Math.sin(this._swayPhase) * (2 * Math.PI / 180);
        if (pivot) {
            pivot.rotation.z = swayAngle;
        }

        // ── Прыжок — смещаем pivot по Y ──
        if (pivot) {
            if (Math.abs(this._jumpOffset) > 0.001) {
                pivot.position.y = this._baseY + this._jumpOffset;
            } else {
                pivot.position.y = this._baseY;
            }
        }

        // ── Моргание ──
        this._blinkTimer += dt;
        if (this._blinkTimer > this._blinkInterval) {
            this._blinkTimer = 0;
            this._blinkInterval = 3 + Math.random() * 5;
            this._isBlinking = true;
            this._blinkProgress = 0;
        }

        if (this._isBlinking && this._eyeBones.length > 0) {
            this._blinkProgress += dt * 6;
            const val = Math.min(this._blinkProgress, 1);
            // Закрыть-открыть
            const blinkVal = val < 0.5 ? val * 2 : (1 - val) * 2;

            this._eyeBones.forEach(bone => {
                // Сдвигаем scale Y для имитации моргания (если это веки)
                if (bone.scale) {
                    bone.scale.y = 1 - blinkVal * 0.9;
                }
            });

            if (val >= 1) {
                this._isBlinking = false;
                this._blinkProgress = 0;
                this._eyeBones.forEach(bone => {
                    if (bone.scale) bone.scale.y = 1;
                });
            }
        }

        // ── Орбита звёздочек (аксессуар stars) ──
        if (this._currentAccessory === 'stars') {
            this._accessoryGroup.children.forEach(star => {
                if (star.userData && star.userData.baseAngle !== undefined) {
                    star.userData.baseAngle += dt * star.userData.speed;
                    const a = star.userData.baseAngle;
                    const r = star.userData.baseRadius;
                    star.position.x = Math.cos(a) * r;
                    star.position.z = Math.sin(a) * r;
                    star.position.y = star.userData.baseY + Math.sin(this._animTime * 2 + star.userData.phase) * 0.1;
                }
            });
        }

        // ── Тень следует за pivot'ом ──
        if (this._shadowPlane && this._pivotGroup) {
            this._shadowPlane.position.y = -1.5 + this._pivotGroup.position.y;
        }
    }

    // ─── Тема ────────────────────────────────────────────────

    updateTheme() {
        this._updateBgColor();
    }

    // ─── Сохранение / Восстановление ─────────────────────────

    _saveState() {
        try {
            const data = {
                skin: this._currentSkin,
                hat: this._currentHat,
                glasses: this._currentGlasses,
                accessory: this._currentAccessory
            };
            localStorage.setItem('cat3d_customization', JSON.stringify(data));
        } catch (e) { /* игнор */ }
    }

    _restoreState() {
        try {
            const raw = localStorage.getItem('cat3d_customization');
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.skin) this.setSkin(data.skin);
            if (data.hat && data.hat !== 'none') this.setHat(data.hat);
            if (data.glasses && data.glasses !== 'none') this.setGlasses(data.glasses);
            if (data.accessory && data.accessory !== 'none') this.setAccessory(data.accessory);
        } catch (e) { /* игнор */ }
    }

    // ─── Эффекты ─────────────────────────────────────────────

    /** Эффект звёздочек при экипировке предмета */
    sparkle() {
        if (!this.scene || this._disposed) return;
        const group = new THREE.Group();
        const mat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
        const geo = new THREE.SphereGeometry(0.025, 4, 4);
        const count = 12;

        for (let i = 0; i < count; i++) {
            const particle = new THREE.Mesh(geo, mat);
            particle.position.set(0, 0, 0);
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 1.5,
                    Math.random() * 1.2 + 0.3,
                    (Math.random() - 0.5) * 1.5
                ),
                life: 0.6 + Math.random() * 0.5,
                age: 0
            };
            group.add(particle);
        }

        this.scene.add(group);

        const startTime = this._animTime;
        const check = () => {
            if (this._disposed || !group.parent) return;
            const elapsed = this._animTime - startTime;

            let allDead = true;
            group.children.forEach(p => {
                p.userData.age += 0.016;
                const progress = Math.min(p.userData.age / p.userData.life, 1);
                if (progress < 1) allDead = false;

                p.position.add(p.userData.velocity.clone().multiplyScalar(0.016));
                p.userData.velocity.y += 0.8 * 0.016; // gravity
                p.material.opacity = 1 - progress;
                p.material.transparent = true;
                p.scale.setScalar(1 - progress * 0.6);
            });

            if (allDead) {
                group.traverse(c => {
                    if (c.geometry) c.geometry.dispose();
                    if (c.material) c.material.dispose();
                });
                this.scene.remove(group);
            } else {
                requestAnimationFrame(check);
            }
        };
        requestAnimationFrame(check);
    }

    // ─── Лицензии ────────────────────────────────────────────

    /**
     * Возвращает массив строк с информацией о лицензиях
     * @returns {string[]}
     */
    getLicenses() {
        return [
            '🐱 3D Cat Model "Cute Cartoon Cat" by 3Dima (CC BY 4.0) — https://skfb.ly/pFKSW',
            '🎓 Graduation Cap by mikaeel_irani (CC BY 4.0) — https://sketchfab.com/3d-models/low-poly-graduation-cap-16c5a71fdb2b4751961966e41d1e7b92'
        ];
    }

    // ─── Очистка ─────────────────────────────────────────────

    dispose() {
        this._disposed = true;
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        if (this.scene) {
            this.scene.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(m => m.dispose());
                }
            });
        }
        this._catModel = null;
        this._graduateModel = null;
        this.scene = null;
        this.renderer = null;
    }
}

export default Cat3D;