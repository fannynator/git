// js/components/cat3d.js
// 3D Кот на Three.js (CDN: three.min.js) — мультяшная модель с магазином кастомизации

const HAT_TYPES = {
    none:    { name: 'Без шляпы', price: 0, emoji: '🐱' },
    cap:     { name: 'Кепка', price: 50, emoji: '🧢' },
    grad:    { name: 'Выпускника', price: 120, emoji: '🎓' },
    crown:   { name: 'Корона', price: 200, emoji: '👑' },
    wizard:  { name: 'Колпак волшебника', price: 350, emoji: '🧙‍♂️' },
    tophat:  { name: 'Цилиндр', price: 500, emoji: '🎩' }
};

const GLASSES_TYPES = {
    none:    { name: 'Без очков', price: 0, emoji: '🐱' },
    round:   { name: 'Круглые', price: 80, emoji: '🤓' },
    cool:    { name: 'Стильные', price: 150, emoji: '😎' },
    star:    { name: 'Звёздные', price: 300, emoji: '🤩' },
    d3:      { name: '3D-очки', price: 250, emoji: '🥽' }
};

const SKIN_TYPES = {
    orange:  { name: 'Оранжевый', price: 0, hex: '#F59E0B', emoji: '🟠' },
    black:   { name: 'Чёрный', price: 100, hex: '#1F2937', emoji: '⚫' },
    white:   { name: 'Белый', price: 100, hex: '#F9FAFB', emoji: '⚪' },
    purple:  { name: 'Фиолетовый', price: 150, hex: '#8B5CF6', emoji: '🟣' },
    blue:    { name: 'Голубой', price: 150, hex: '#06B6D4', emoji: '🔵' },
    pink:    { name: 'Розовый', price: 150, hex: '#F472B6', emoji: '🩷' },
    gold:    { name: 'Золотой', price: 200, hex: '#FBBF24', emoji: '🟡' },
    rainbow: { name: 'Радужный', price: 500, hex: '#F59E0B', emoji: '🌈', rainbow: true }
};

const ACCESSORY_TYPES = {
    none:      { name: 'Нет', price: 0, emoji: '—' },
    bowtie:    { name: 'Бабочка', price: 75, emoji: '🦋' },
    collar:    { name: 'Ошейник', price: 100, emoji: '🔔' },
    fish:      { name: 'Рыбка в лапах', price: 60, emoji: '🐟' },
    book:      { name: 'Книжка', price: 90, emoji: '📚' },
    particles: { name: 'Звёздочки', price: 250, emoji: '🌟' }
};

// CDN для Three.js
const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

let THREE_LOADED = false;
let THREE_LOADING = false;

function loadThree() {
    return new Promise((resolve, reject) => {
        if (typeof THREE !== 'undefined' && THREE.Scene) {
            THREE_LOADED = true;
            resolve();
            return;
        }
        if (THREE_LOADING) {
            const check = setInterval(() => {
                if (typeof THREE !== 'undefined' && THREE.Scene) {
                    clearInterval(check);
                    THREE_LOADED = true;
                    resolve();
                }
            }, 100);
            return;
        }
        THREE_LOADING = true;
        const script = document.createElement('script');
        script.src = THREE_CDN;
        script.onload = () => {
            THREE_LOADED = true;
            resolve();
        };
        script.onerror = () => reject(new Error('Не удалось загрузить Three.js'));
        document.head.appendChild(script);
    });
}

// ─── Helper: создание outline-оболочки (мультяшный контур) ──────
function addOutline(mesh, group, scale = 1.03) {
    const outlineGeo = mesh.geometry.clone();
    const outlineMat = new THREE.MeshBasicMaterial({ color: '#1E293B', side: THREE.BackSide });
    const outline = new THREE.Mesh(outlineGeo, outlineMat);
    outline.scale.setScalar(scale);
    group.add(outline);
    return outline;
}

// ─── Helper: создание shell-слоёв для пушистости ────────────────
function addFurShell(mesh, group, colorHex) {
    const shells = [];
    const offsets = [0.02, 0.04, 0.06];
    const opacities = [0.15, 0.08, 0.04];
    offsets.forEach((offset, i) => {
        const shellGeo = mesh.geometry.clone();
        const shellMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: opacities[i],
            depthWrite: false
        });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        shell.scale.setScalar(1 + offset);
        shell.userData = { baseScale: 1 + offset, index: i };
        group.add(shell);
        shells.push(shell);
    });
    return shells;
}

// ─── Helper: генерация текстуры шерсти (canvas) ─────────────────
function generateFurTexture(baseColor, stripeColor) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Базовый цвет
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    // Тигриные полоски
    ctx.strokeStyle = stripeColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = stripeColor;
    ctx.shadowBlur = 2;

    const stripes = [
        [20, 0, 60, 256],
        [100, 0, 80, 256],
        [180, 0, 70, 256],
        [240, 0, 50, 256],
        [0, 40, 256, 50],
        [0, 120, 256, 50],
        [0, 200, 256, 50],
    ];

    stripes.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        // Добавляем изгиб
        const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 30;
        const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 30;
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.stroke();
    });

    ctx.shadowBlur = 0;

    // Лёгкая ворсистость
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.beginPath();
        ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapU = THREE.RepeatWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
}

// ─── Класс Cat3D ────────────────────────────────────────────────

export class Cat3D {
    /**
     * @param {HTMLElement} container - DOM-элемент для вставки сцены
     * @param {object} state - ссылка на state из state.js
     * @param {function} saveState - функция saveState из state.js
     */
    constructor(container, state, saveState) {
        this.container = container;
        this.state = state;
        this.saveState = saveState;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.catGroup = null;
        this.headGroup = null;
        this.bodyGroup = null;
        this.hatGroup = new THREE.Group();
        this.glassesGroup = new THREE.Group();
        this.accessoryGroup = new THREE.Group();
        this.emotionGroup = new THREE.Group(); // языки, брови и т.д.
        this.particles = [];
        this.clock = new THREE.Clock();
        this.animTime = 0;
        this.width = 250;
        this.height = 250;
        this.isDisposed = false;
        this._mouseX = 0;
        this._mouseY = 0;
        this._targetRotX = 0;
        this._targetRotY = 0;
        this._currentRotX = 0;
        this._currentRotY = 0;
        this._isDragging = false;
        this._blinkTimer = 0;
        this._blinkInterval = 4;
        this._isBlinking = false;
        this._tailWave = 0;
        this._earTwitchTimer = 0;
        this._jumpOffset = 0;
        this._spinAngle = 0;
        this._currentEmotion = 'normal';
        this._mouthOpenAmount = 0;
        this._targetMouthOpen = 0;
        this._isSpeaking = false;
        this._speakTimer = 0;
        this._eatingProgress = 0;

        // Ссылки на части для анимаций
        this.earLeft = null;
        this.earRight = null;
        this.earInnerL = null;
        this.earInnerR = null;
        this.eyeL = null;
        this.eyeR = null;
        this.eyelidL = null;
        this.eyelidR = null;
        this.tailGroup = null;
        this.mouthParts = [];
        this.tongue = null;
        this.pawFL = null;
        this.pawFR = null;
        this.furShells = [];
        this.headMesh = null;
        this.bodyMesh = null;
        this.bellyMesh = null;
        this.hatParts = {};
        this.glassesParts = {};
        this.accessoryParts = {};

        // Инициализация
        this.init();
    }

    async init() {
        await loadThree();
        if (this.isDisposed) return;

        this.width = this.container.clientWidth || 250;
        this.height = this.container.clientHeight || 250;

        this.setupScene();
        this.buildCat();
        this.setupLights();
        this.setupInteraction();
        this.startLoop();

        // Применяем сохранённое состояние
        this.applyActiveItems();
    }

    setupScene() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 0, 7);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.cursor = 'grab';
    }

    setupLights() {
        // Освещение
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 512;
        dirLight.shadow.mapSize.height = 512;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 50;
        this.scene.add(dirLight);

        // Тень под котом
        const shadowGeo = new THREE.PlaneGeometry(3, 3);
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 256;
        shadowCanvas.height = 256;
        const sctx = shadowCanvas.getContext('2d');
        const gradient = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(0,0,0,0.4)');
        gradient.addColorStop(0.5, 'rgba(0,0,0,0.15)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        sctx.fillStyle = gradient;
        sctx.fillRect(0, 0, 256, 256);
        const shadowTex = new THREE.CanvasTexture(shadowCanvas);
        const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
        const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
        shadowPlane.position.y = -2.4;
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.renderOrder = 1;
        this.scene.add(shadowPlane);
        this.shadowPlane = shadowPlane;
    }

    // ─── ПОСТРОЕНИЕ КОТА ──────────────────────────────────────

    buildCat() {
        this.catGroup = new THREE.Group();
        this.headGroup = new THREE.Group();
        this.bodyGroup = new THREE.Group();

        const furColor = '#F59E0B';
        const stripeColor = '#D97706';
        const bellyColor = '#FEF3C7';
        const cheekBlushColor = '#FECACA';
        const noseColor = '#F472B6';
        const earInnerColor = '#FECACA';
        const eyeWhiteColor = '#FFFFFF';
        const irisColor = '#10B981';
        const pupilColor = '#1E293B';
        const mouthColor = '#BE185D';
        const whiskerColor = '#CBD5E1';
        const pawPadColor = '#FECACA';

        // ── Генерация текстуры шерсти ──
        this.furTexture = generateFurTexture(furColor, stripeColor);

        // ── ГОЛОВА ──
        // Основная сфера
        const headGeo = new THREE.SphereGeometry(1.2, 32, 32);
        const headMat = new THREE.MeshToonMaterial({ color: furColor, map: this.furTexture });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headMesh.scale.set(1, 0.85, 1);
        headMesh.castShadow = true;
        this.headGroup.add(headMesh);
        this.headMesh = headMesh;

        // Outlines + fur shells для головы
        addOutline(headMesh, this.headGroup, 1.035);
        this.headShells = addFurShell(headMesh, this.headGroup, furColor);

        // Щёки
        const cheekGeo = new THREE.SphereGeometry(0.5, 24, 24);
        const cheekMat = new THREE.MeshToonMaterial({ color: furColor });
        const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
        cheekL.position.set(-0.8, -0.3, 0.1);
        this.headGroup.add(cheekL);
        addFurShell(cheekL, this.headGroup, furColor);

        const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
        cheekR.position.set(0.8, -0.3, 0.1);
        this.headGroup.add(cheekR);
        addFurShell(cheekR, this.headGroup, furColor);

        // Розовые пятна на щеках
        const blushGeo = new THREE.CircleGeometry(0.2, 16);
        const blushMat = new THREE.MeshToonMaterial({ color: cheekBlushColor, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const blushL = new THREE.Mesh(blushGeo, blushMat);
        blushL.position.set(-0.85, -0.3, 0.75);
        this.headGroup.add(blushL);

        const blushR = new THREE.Mesh(blushGeo, blushMat);
        blushR.position.set(0.85, -0.3, 0.75);
        this.headGroup.add(blushR);

        // ── УШИ ──
        const earOuterGeo = new THREE.ConeGeometry(0.4, 0.9, 1.2, 16);
        const earOuterMat = new THREE.MeshToonMaterial({ color: furColor });
        this.earLeft = new THREE.Mesh(earOuterGeo, earOuterMat);
        this.earLeft.position.set(-0.65, 0.85, 0);
        this.earLeft.rotation.z = 0.3;
        this.earLeft.castShadow = true;
        this.headGroup.add(this.earLeft);
        addOutline(this.earLeft, this.headGroup, 1.04);

        this.earRight = new THREE.Mesh(earOuterGeo, earOuterMat);
        this.earRight.position.set(0.65, 0.85, 0);
        this.earRight.rotation.z = -0.3;
        this.earRight.castShadow = true;
        this.headGroup.add(this.earRight);
        addOutline(this.earRight, this.headGroup, 1.04);

        // Внутренняя часть ушей
        const earInnerGeo = new THREE.ConeGeometry(0.2, 0.55, 1.0, 16);
        const earInnerMat = new THREE.MeshToonMaterial({ color: earInnerColor });
        this.earInnerL = new THREE.Mesh(earInnerGeo, earInnerMat);
        this.earInnerL.position.copy(this.earLeft.position);
        this.earInnerL.rotation.z = this.earLeft.rotation.z;
        this.headGroup.add(this.earInnerL);

        this.earInnerR = new THREE.Mesh(earInnerGeo, earInnerMat);
        this.earInnerR.position.copy(this.earRight.position);
        this.earInnerR.rotation.z = this.earRight.rotation.z;
        this.headGroup.add(this.earInnerR);

        // ── ГЛАЗА ──
        const eyeWhiteGeo = new THREE.SphereGeometry(0.35, 32, 32);
        const eyeWhiteMat = new THREE.MeshToonMaterial({ color: eyeWhiteColor });
        this.eyeL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
        this.eyeL.position.set(-0.4, 0.15, 0.95);
        this.headGroup.add(this.eyeL);
        addOutline(this.eyeL, this.headGroup, 1.02);

        this.eyeR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
        this.eyeR.position.set(0.4, 0.15, 0.95);
        this.headGroup.add(this.eyeR);
        addOutline(this.eyeR, this.headGroup, 1.02);

        // Радужки
        const irisGeo = new THREE.SphereGeometry(0.22, 24, 24);
        const irisMat = new THREE.MeshToonMaterial({ color: irisColor });
        const irisL = new THREE.Mesh(irisGeo, irisMat);
        irisL.position.set(-0.4, 0.12, 1.25);
        this.headGroup.add(irisL);
        this.irisL = irisL;

        const irisR = new THREE.Mesh(irisGeo, irisMat);
        irisR.position.set(0.4, 0.12, 1.25);
        this.headGroup.add(irisR);
        this.irisR = irisR;

        // Зрачки
        const pupilGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const pupilMat = new THREE.MeshToonMaterial({ color: pupilColor });
        const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
        pupilL.position.set(-0.4, 0.1, 1.35);
        this.headGroup.add(pupilL);
        this.pupilL = pupilL;

        const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
        pupilR.position.set(0.4, 0.1, 1.35);
        this.headGroup.add(pupilR);
        this.pupilR = pupilR;

        // Блики
        const shineGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const shineMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
        const shineL = new THREE.Mesh(shineGeo, shineMat);
        shineL.position.set(-0.32, 0.22, 1.4);
        this.headGroup.add(shineL);
        this.shineL = shineL;

        const shineR = new THREE.Mesh(shineGeo, shineMat);
        shineR.position.set(0.32, 0.22, 1.4);
        this.headGroup.add(shineR);
        this.shineR = shineR;

        // Веки (чёрные полусферы для моргания)
        const eyelidGeo = new THREE.SphereGeometry(0.36, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const eyelidMat = new THREE.MeshToonMaterial({ color: furColor, side: THREE.DoubleSide });
        this.eyelidL = new THREE.Mesh(eyelidGeo, eyelidMat);
        this.eyelidL.position.set(-0.4, 0.15, 0.95);
        this.eyelidL.rotation.z = Math.PI;
        this.eyelidL.scale.set(1, 0.01, 1);
        this.eyelidL.visible = true;
        this.headGroup.add(this.eyelidL);

        this.eyelidR = new THREE.Mesh(eyelidGeo.clone(), eyelidMat.clone());
        this.eyelidR.position.set(0.4, 0.15, 0.95);
        this.eyelidR.rotation.z = Math.PI;
        this.eyelidR.scale.set(1, 0.01, 1);
        this.eyelidR.visible = true;
        this.headGroup.add(this.eyelidR);

        // ── НОС ──
        const noseGeo = new THREE.ConeGeometry(0.12, 0.15, 16);
        const noseMat = new THREE.MeshToonMaterial({ color: noseColor });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, -0.2, 1.15);
        nose.rotation.x = Math.PI;
        this.headGroup.add(nose);
        this.nose = nose;

        // Блик на носу
        const noseShineGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const noseShine = new THREE.Mesh(noseShineGeo, shineMat);
        noseShine.position.set(0, -0.17, 1.25);
        this.headGroup.add(noseShine);

        // ── РОТ (w-улыбка) ──
        this.mouthGroup = new THREE.Group();
        const mouthGeo = new THREE.TorusGeometry(0.08, 0.03, 8, 8, Math.PI);
        const mouthMat = new THREE.MeshToonMaterial({ color: mouthColor });
        const mouthLeft = new THREE.Mesh(mouthGeo, mouthMat);
        mouthLeft.position.set(-0.1, -0.35, 1.1);
        mouthLeft.rotation.z = 0.2;
        this.mouthGroup.add(mouthLeft);
        this.mouthParts.push(mouthLeft);

        const mouthRight = new THREE.Mesh(mouthGeo, mouthMat);
        mouthRight.position.set(0.1, -0.35, 1.1);
        mouthRight.rotation.z = -0.2;
        this.mouthGroup.add(mouthRight);
        this.mouthParts.push(mouthRight);

        this.headGroup.add(this.mouthGroup);

        // Язык (изначально скрыт)
        const tongueGeo = new THREE.ConeGeometry(0.06, 0.2, 12);
        const tongueMat = new THREE.MeshToonMaterial({ color: '#F472B6', transparent: true, opacity: 0 });
        this.tongue = new THREE.Mesh(tongueGeo, tongueMat);
        this.tongue.position.set(0, -0.4, 1.05);
        this.headGroup.add(this.tongue);
        this.emotionGroup.add(this.tongue);

        // ── УСЫ ──
        const whiskerGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6);
        const whiskerMat = new THREE.MeshToonMaterial({ color: whiskerColor });
        const whiskerGroup = new THREE.Group();
        const leftY = [0.05, 0.0, -0.05, -0.1];
        leftY.forEach(y => {
            const w = new THREE.Mesh(whiskerGeo, whiskerMat);
            w.position.set(-0.55, y, 0.15);
            w.rotation.z = 0.3;
            w.rotation.y = 0.3;
            whiskerGroup.add(w);
        });
        leftY.forEach(y => {
            const w = new THREE.Mesh(whiskerGeo, whiskerMat);
            w.position.set(0.55, y, 0.15);
            w.rotation.z = -0.3;
            w.rotation.y = -0.3;
            whiskerGroup.add(w);
        });
        this.headGroup.add(whiskerGroup);

        // ── ТЕЛО ──
        const bodyGeo = new THREE.SphereGeometry(0.8, 32, 32);
        const bodyMat = new THREE.MeshToonMaterial({ color: furColor, map: this.furTexture });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.scale.set(1, 1.3, 1);
        bodyMesh.position.set(0, -1.3, 0);
        bodyMesh.castShadow = true;
        this.bodyGroup.add(bodyMesh);
        this.bodyMesh = bodyMesh;
        addOutline(bodyMesh, this.bodyGroup, 1.035);
        this.bodyShells = addFurShell(bodyMesh, this.bodyGroup, furColor);

        // Животик
        const bellyGeo = new THREE.SphereGeometry(0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bellyMat = new THREE.MeshToonMaterial({ color: bellyColor });
        const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
        bellyMesh.position.set(0, -1.2, 0.5);
        this.bodyGroup.add(bellyMesh);
        this.bellyMesh = bellyMesh;

        // ── ЛАПЫ ──
        const pawGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8);
        const pawMat = new THREE.MeshToonMaterial({ color: furColor });

        // Передние
        this.pawFL = new THREE.Mesh(pawGeo, pawMat);
        this.pawFL.position.set(-0.4, -1.7, 0.4);
        this.pawFL.castShadow = true;
        this.bodyGroup.add(this.pawFL);

        this.pawFR = new THREE.Mesh(pawGeo, pawMat);
        this.pawFR.position.set(0.4, -1.7, 0.4);
        this.pawFR.castShadow = true;
        this.bodyGroup.add(this.pawFR);

        // Задние
        const pawBL = new THREE.Mesh(pawGeo, pawMat);
        pawBL.position.set(-0.35, -1.85, -0.2);
        pawBL.castShadow = true;
        this.bodyGroup.add(pawBL);

        const pawBR = new THREE.Mesh(pawGeo, pawMat);
        pawBR.position.set(0.35, -1.85, -0.2);
        pawBR.castShadow = true;
        this.bodyGroup.add(pawBR);

        // Подушечки на передних лапах
        const padGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const padMat = new THREE.MeshToonMaterial({ color: pawPadColor });

        [-0.4, 0.4].forEach(x => {
            // Основная подушечка
            const mainPad = new THREE.Mesh(padGeo.clone(), padMat);
            mainPad.position.set(x, -2.05, 0.55);
            mainPad.scale.set(1.5, 1, 1);
            this.bodyGroup.add(mainPad);
            // Три маленьких
            for (let i = 0; i < 3; i++) {
                const smallPad = new THREE.Mesh(padGeo, padMat);
                smallPad.position.set(x + (i - 1) * 0.06, -1.9, 0.55);
                smallPad.scale.set(0.7, 0.7, 0.7);
                this.bodyGroup.add(smallPad);
            }
        });

        // ── ХВОСТ ──
        this.tailGroup = new THREE.Group();
        const tailCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.4, -1.5, 0),
            new THREE.Vector3(0.8, -1.0, 0.3),
            new THREE.Vector3(1.0, -0.5, 0),
            new THREE.Vector3(0.8, 0.0, -0.3),
            new THREE.Vector3(0.6, 0.3, 0)
        ]);
        const tailGeoTub = new THREE.TubeGeometry(tailCurve, 20, 0.15, 8, false);
        const tailMat = new THREE.MeshToonMaterial({ color: furColor });
        const tailMesh = new THREE.Mesh(tailGeoTub, tailMat);
        tailMesh.castShadow = true;
        this.tailGroup.add(tailMesh);
        this.tailMesh = tailMesh;

        // Кончик хвоста (тёмный)
        const tailTipGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const tailTipMat = new THREE.MeshToonMaterial({ color: '#B45309' });
        const tailTip = new THREE.Mesh(tailTipGeo, tailTipMat);
        const tipPos = tailCurve.getPoint(1);
        tailTip.position.copy(tipPos);
        this.tailGroup.add(tailTip);

        this.bodyGroup.add(this.tailGroup);

        // ── СБОРКА ──
        this.catGroup.add(this.headGroup);
        this.catGroup.add(this.bodyGroup);
        this.catGroup.add(this.hatGroup);
        this.catGroup.add(this.glassesGroup);
        this.catGroup.add(this.accessoryGroup);
        this.catGroup.add(this.emotionGroup);

        this.scene.add(this.catGroup);
    }

    // ─── ШЛЯПЫ ──────────────────────────────────────────────

    clearGroup(group) {
        while (group.children.length > 0) {
            const child = group.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
            group.remove(child);
        }
    }

    setHat(type) {
        this.clearGroup(this.hatGroup);
        if (type === 'none') return;

        if (type === 'crown') {
            // Корона
            const crownMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            const baseGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.15, 8);
            const base = new THREE.Mesh(baseGeo, crownMat);
            base.position.y = 1.15;
            this.hatGroup.add(base);
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 + 0.2;
                const spikeGeo = new THREE.ConeGeometry(0.06, 0.25, 6);
                const spike = new THREE.Mesh(spikeGeo, crownMat);
                spike.position.set(Math.cos(angle) * 0.35, 1.3, Math.sin(angle) * 0.35);
                this.hatGroup.add(spike);
            }
            // Драгоценные камни
            const gemColors = ['#EF4444', '#3B82F6', '#10B981', '#FBBF24', '#8B5CF6'];
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 + 0.2;
                const gemGeo = new THREE.SphereGeometry(0.05, 6, 6);
                const gemMat = new THREE.MeshToonMaterial({ color: gemColors[i] });
                const gem = new THREE.Mesh(gemGeo, gemMat);
                gem.position.set(Math.cos(angle) * 0.38, 1.05, Math.sin(angle) * 0.38);
                this.hatGroup.add(gem);
            }
        } else if (type === 'cap') {
            const capMat = new THREE.MeshToonMaterial({ color: '#3B82F6' });
            const topGeo = new THREE.SphereGeometry(0.32, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            const top = new THREE.Mesh(topGeo, capMat);
            top.position.y = 1.1;
            this.hatGroup.add(top);
            const visorGeo = new THREE.SphereGeometry(0.35, 16, 4, 0, Math.PI, Math.PI / 2, Math.PI / 4);
            const visorMat = new THREE.MeshToonMaterial({ color: '#1E3A5F' });
            const visor = new THREE.Mesh(visorGeo, visorMat);
            visor.position.set(0, 1.0, 0.2);
            this.hatGroup.add(visor);
        } else if (type === 'tophat') {
            const topMat = new THREE.MeshToonMaterial({ color: '#1F2937' });
            const brimGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.06, 16);
            const brim = new THREE.Mesh(brimGeo, topMat);
            brim.position.y = 1.1;
            this.hatGroup.add(brim);
            const topGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.5, 16);
            const topPart = new THREE.Mesh(topGeo, topMat);
            topPart.position.y = 1.4;
            this.hatGroup.add(topPart);
            const bandGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.08, 16);
            const bandMat = new THREE.MeshToonMaterial({ color: '#EF4444' });
            const band = new THREE.Mesh(bandGeo, bandMat);
            band.position.y = 1.2;
            this.hatGroup.add(band);
        } else if (type === 'wizard') {
            const wizMat = new THREE.MeshToonMaterial({ color: '#7C3AED' });
            const coneGeo = new THREE.ConeGeometry(0.28, 0.7, 16);
            const cone = new THREE.Mesh(coneGeo, wizMat);
            cone.position.y = 1.5;
            cone.rotation.z = -0.2;
            this.hatGroup.add(cone);
            const brimGeo = new THREE.TorusGeometry(0.3, 0.06, 8, 16);
            const brim = new THREE.Mesh(brimGeo, wizMat);
            brim.position.y = 1.15;
            brim.rotation.x = Math.PI / 2;
            this.hatGroup.add(brim);
            // Звёзды
            const starGeo = new THREE.SphereGeometry(0.06, 6, 6);
            const starMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            for (let i = 0; i < 3; i++) {
                const star = new THREE.Mesh(starGeo, starMat);
                star.position.set((Math.random() - 0.5) * 0.3, 1.2 + Math.random() * 0.5, (Math.random() - 0.5) * 0.3);
                this.hatGroup.add(star);
            }
        } else if (type === 'grad') {
            const gradMat = new THREE.MeshToonMaterial({ color: '#1F2937' });
            const baseGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);
            const base = new THREE.Mesh(baseGeo, gradMat);
            base.position.y = 1.15;
            this.hatGroup.add(base);
            const topGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 4);
            const topPart = new THREE.Mesh(topGeo, gradMat);
            topPart.position.y = 1.4;
            this.hatGroup.add(topPart);
            const tasselGeo = new THREE.SphereGeometry(0.06, 6, 6);
            const tasselMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            const tassel = new THREE.Mesh(tasselGeo, tasselMat);
            tassel.position.set(0.2, 1.6, 0);
            this.hatGroup.add(tassel);
        }
    }

    // ─── ОЧКИ ────────────────────────────────────────────────

    setGlasses(type) {
        this.clearGroup(this.glassesGroup);
        if (type === 'none') return;

        if (type === 'round') {
            const frameMat = new THREE.MeshToonMaterial({ color: '#1F2937' });
            const torusGeo = new THREE.TorusGeometry(0.14, 0.025, 8, 16);
            const frameL = new THREE.Mesh(torusGeo, frameMat);
            frameL.position.set(-0.4, 0.12, 1.25);
            this.glassesGroup.add(frameL);
            const frameR = new THREE.Mesh(torusGeo, frameMat);
            frameR.position.set(0.4, 0.12, 1.25);
            this.glassesGroup.add(frameR);
            const bridgeGeo = new THREE.BoxGeometry(0.5, 0.03, 0.03);
            const bridge = new THREE.Mesh(bridgeGeo, frameMat);
            bridge.position.set(0, 0.12, 1.25);
            this.glassesGroup.add(bridge);
            // Линзы
            const lensGeo = new THREE.CircleGeometry(0.12, 16);
            const lensMat = new THREE.MeshToonMaterial({ color: '#93C5FD', transparent: true, opacity: 0.2, side: THREE.DoubleSide });
            const lensL = new THREE.Mesh(lensGeo, lensMat);
            lensL.position.set(-0.4, 0.12, 1.28);
            this.glassesGroup.add(lensL);
            const lensR = new THREE.Mesh(lensGeo, lensMat);
            lensR.position.set(0.4, 0.12, 1.28);
            this.glassesGroup.add(lensR);
        } else if (type === 'cool') {
            const frameMat = new THREE.MeshToonMaterial({ color: '#111827' });
            const boxGeo = new THREE.BoxGeometry(0.35, 0.2, 0.04);
            const boxL = new THREE.Mesh(boxGeo, frameMat);
            boxL.position.set(-0.4, 0.12, 1.25);
            this.glassesGroup.add(boxL);
            const boxR = new THREE.Mesh(boxGeo, frameMat);
            boxR.position.set(0.4, 0.12, 1.25);
            this.glassesGroup.add(boxR);
            const bridgeGeo = new THREE.BoxGeometry(0.5, 0.03, 0.03);
            const bridge = new THREE.Mesh(bridgeGeo, frameMat);
            bridge.position.set(0, 0.12, 1.25);
            this.glassesGroup.add(bridge);
        } else if (type === 'star') {
            const starFrameMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            for (let g = 0; g < 2; g++) {
                const sign = g === 0 ? -1 : 1;
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6);
                    const rod = new THREE.Mesh(rodGeo, starFrameMat);
                    rod.position.set(sign * 0.4 + Math.cos(angle) * 0.1, 0.12 + Math.sin(angle) * 0.1, 1.25);
                    rod.rotation.z = angle + Math.PI / 2;
                    this.glassesGroup.add(rod);
                }
            }
            const bridgeGeo = new THREE.BoxGeometry(0.5, 0.03, 0.03);
            const bridge = new THREE.Mesh(bridgeGeo, starFrameMat);
            bridge.position.set(0, 0.12, 1.25);
            this.glassesGroup.add(bridge);
        } else if (type === 'd3') {
            const d3Mat = new THREE.MeshToonMaterial({ color: '#EF4444' });
            const boxGeo = new THREE.BoxGeometry(0.25, 0.18, 0.05);
            const boxL = new THREE.Mesh(boxGeo, d3Mat);
            boxL.position.set(-0.4, 0.12, 1.25);
            this.glassesGroup.add(boxL);
            const boxR = new THREE.Mesh(boxGeo, d3Mat);
            boxR.position.set(0.4, 0.12, 1.25);
            this.glassesGroup.add(boxR);
            const lensGeo = new THREE.BoxGeometry(0.2, 0.13, 0.03);
            const lensMat = new THREE.MeshToonMaterial({ color: '#3B82F6', transparent: true, opacity: 0.5 });
            const lensL = new THREE.Mesh(lensGeo, lensMat);
            lensL.position.set(-0.4, 0.12, 1.28);
            this.glassesGroup.add(lensL);
            const lensR = new THREE.Mesh(lensGeo, lensMat);
            lensR.position.set(0.4, 0.12, 1.28);
            this.glassesGroup.add(lensR);
            const bridgeGeo = new THREE.BoxGeometry(0.5, 0.03, 0.03);
            const bridge = new THREE.Mesh(bridgeGeo, d3Mat);
            bridge.position.set(0, 0.12, 1.25);
            this.glassesGroup.add(bridge);
        }
    }

    // ─── СКИН ────────────────────────────────────────────────

    setSkin(hex) {
        const color = new THREE.Color(hex);
        const exclude = ['#FEF3C7', '#FECACA', '#F472B6', '#BE185D', '#CBD5E1', '#B45309', '#10B981', '#FFFFFF', '#000000', '#1E293B'];
        this.updateGroupColor(this.catGroup, color, exclude);

        // Обновляем цвет fur shells
        const allShells = [...(this.headShells || []), ...(this.bodyShells || [])];
        allShells.forEach(shell => {
            if (shell.material && shell.material.color) {
                shell.material.color.copy(color);
            }
        });
    }

    updateGroupColor(group, color, exclude) {
        group.traverse(child => {
            if (child.isMesh && child.material && child.material.color) {
                const hexChild = '#' + child.material.color.getHexString();
                if (!exclude.some(e => e.toUpperCase() === hexChild.toUpperCase())) {
                    child.material.color.copy(color);
                }
            }
        });
    }

    // ─── АКСЕССУАРЫ ──────────────────────────────────────────

    setAccessory(type) {
        this.clearGroup(this.accessoryGroup);
        this.particles = [];
        if (type === 'none') return;

        if (type === 'bowtie') {
            const bowMat = new THREE.MeshToonMaterial({ color: '#EF4444' });
            const wingGeo = new THREE.BoxGeometry(0.2, 0.1, 0.04);
            const wingL = new THREE.Mesh(wingGeo, bowMat);
            wingL.position.set(-0.15, -0.75, 0.7);
            wingL.rotation.z = -0.3;
            this.accessoryGroup.add(wingL);
            const wingR = new THREE.Mesh(wingGeo, bowMat);
            wingR.position.set(0.15, -0.75, 0.7);
            wingR.rotation.z = 0.3;
            this.accessoryGroup.add(wingR);
            const knotGeo = new THREE.SphereGeometry(0.06, 8, 8);
            const knot = new THREE.Mesh(knotGeo, bowMat);
            knot.position.set(0, -0.75, 0.72);
            this.accessoryGroup.add(knot);
        } else if (type === 'collar') {
            const collarGeo = new THREE.TorusGeometry(0.35, 0.04, 8, 16);
            const collarMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            const collar = new THREE.Mesh(collarGeo, collarMat);
            collar.position.y = -0.55;
            collar.rotation.x = Math.PI / 2;
            this.accessoryGroup.add(collar);
            const bellGeo = new THREE.SphereGeometry(0.07, 8, 8);
            const bellMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            const bell = new THREE.Mesh(bellGeo, bellMat);
            bell.position.set(0, -0.85, 0.35);
            this.accessoryGroup.add(bell);
        } else if (type === 'fish') {
            const fishGroup = new THREE.Group();
            const bodyGeo = new THREE.SphereGeometry(0.1, 8, 8);
            bodyGeo.scale(1, 0.6, 1.5);
            const bodyMat = new THREE.MeshToonMaterial({ color: '#3B82F6' });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            fishGroup.add(body);
            const tailGeo = new THREE.ConeGeometry(0.08, 0.15, 6);
            const tail = new THREE.Mesh(tailGeo, bodyMat);
            tail.position.z = -0.2;
            tail.rotation.x = Math.PI / 2;
            fishGroup.add(tail);
            fishGroup.position.set(0, -1.75, 0.6);
            fishGroup.rotation.z = 0.3;
            this.accessoryGroup.add(fishGroup);
        } else if (type === 'book') {
            const bookGroup = new THREE.Group();
            const coverGeo = new THREE.BoxGeometry(0.2, 0.02, 0.28);
            const coverMat = new THREE.MeshToonMaterial({ color: '#7C3AED' });
            const cover = new THREE.Mesh(coverGeo, coverMat);
            bookGroup.add(cover);
            const pageGeo = new THREE.BoxGeometry(0.18, 0.01, 0.26);
            const pageMat = new THREE.MeshToonMaterial({ color: '#FEF3C7' });
            const page = new THREE.Mesh(pageGeo, pageMat);
            page.position.y = 0.02;
            bookGroup.add(page);
            bookGroup.position.set(0.3, -1.65, 0.5);
            bookGroup.rotation.z = 0.4;
            bookGroup.rotation.x = -0.2;
            this.accessoryGroup.add(bookGroup);
        } else if (type === 'particles') {
            for (let i = 0; i < 12; i++) {
                const starGeo = new THREE.SphereGeometry(0.03, 4, 4);
                const starMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
                const star = new THREE.Mesh(starGeo, starMat);
                star.position.set(
                    (Math.random() - 0.5) * 1.5,
                    -0.5 + Math.random() * 1.5,
                    (Math.random() - 0.5) * 1.5
                );
                star.userData = {
                    baseX: star.position.x,
                    baseY: star.position.y,
                    baseZ: star.position.z,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.5 + Math.random() * 1.5,
                    amplitude: 0.1 + Math.random() * 0.3
                };
                this.accessoryGroup.add(star);
                this.particles.push(star);
            }
        }
    }

    // ─── ЭМОЦИИ ──────────────────────────────────────────────

    setEmotion(type) {
        this._currentEmotion = type;
        const s = (x, y) => ({ x, y });

        switch (type) {
            case 'happy':
                // Глаза шире (scaleY)
                if (this.eyeL) this.eyeL.scale.set(1, 1.3, 1);
                if (this.eyeR) this.eyeR.scale.set(1, 1.3, 1);
                if (this.irisL) this.irisL.scale.set(1, 1.3, 1);
                if (this.irisR) this.irisR.scale.set(1, 1.3, 1);
                if (this.pupilL) this.pupilL.scale.set(1, 1.3, 1);
                if (this.pupilR) this.pupilR.scale.set(1, 1.3, 1);
                // Уши слегка раздвинуты
                if (this.earLeft) this.earLeft.rotation.z = 0.1;
                if (this.earRight) this.earRight.rotation.z = -0.1;
                if (this.earInnerL) this.earInnerL.rotation.z = 0.1;
                if (this.earInnerR) this.earInnerR.rotation.z = -0.1;
                break;
            case 'sad':
                if (this.eyeL) this.eyeL.scale.set(1, 1, 1);
                if (this.eyeR) this.eyeR.scale.set(1, 1, 1);
                if (this.irisL) this.irisL.scale.set(1, 1, 1);
                if (this.irisR) this.irisR.scale.set(1, 1, 1);
                if (this.pupilL) this.pupilL.scale.set(1, 1, 1);
                if (this.pupilR) this.pupilR.scale.set(1, 1, 1);
                if (this.earLeft) this.earLeft.rotation.z = 0.6;
                if (this.earRight) this.earRight.rotation.z = -0.6;
                if (this.earInnerL) this.earInnerL.rotation.z = 0.6;
                if (this.earInnerR) this.earInnerR.rotation.z = -0.6;
                // Перевернуть рот
                if (this.mouthParts[0]) this.mouthParts[0].rotation.z = -0.2;
                if (this.mouthParts[1]) this.mouthParts[1].rotation.z = 0.2;
                break;
            case 'surprised':
                if (this.eyeL) this.eyeL.scale.set(1.2, 1.2, 1);
                if (this.eyeR) this.eyeR.scale.set(1.2, 1.2, 1);
                if (this.irisL) this.irisL.scale.set(1.2, 1.2, 1);
                if (this.irisR) this.irisR.scale.set(1.2, 1.2, 1);
                if (this.pupilL) this.pupilL.scale.set(1.2, 1.2, 1);
                if (this.pupilR) this.pupilR.scale.set(1.2, 1.2, 1);
                if (this.earLeft) this.earLeft.rotation.z = 0.1;
                if (this.earRight) this.earRight.rotation.z = -0.1;
                if (this.earInnerL) this.earInnerL.rotation.z = 0.1;
                if (this.earInnerR) this.earInnerR.rotation.z = -0.1;
                this._targetMouthOpen = 0.7;
                break;
            case 'sleepy':
                // Веки полузакрыты
                if (this.eyelidL) this.eyelidL.scale.set(1, 0.6, 1);
                if (this.eyelidR) this.eyelidR.scale.set(1, 0.6, 1);
                if (this.earLeft) this.earLeft.rotation.z = 0.4;
                if (this.earRight) this.earRight.rotation.z = -0.4;
                if (this.earInnerL) this.earInnerL.rotation.z = 0.4;
                if (this.earInnerR) this.earInnerR.rotation.z = -0.4;
                break;
            case 'normal':
            default:
                // Сброс
                if (this.eyeL) this.eyeL.scale.set(1, 1, 1);
                if (this.eyeR) this.eyeR.scale.set(1, 1, 1);
                if (this.irisL) this.irisL.scale.set(1, 1, 1);
                if (this.irisR) this.irisR.scale.set(1, 1, 1);
                if (this.pupilL) this.pupilL.scale.set(1, 1, 1);
                if (this.pupilR) this.pupilR.scale.set(1, 1, 1);
                if (this.eyelidL) this.eyelidL.scale.set(1, 0.01, 1);
                if (this.eyelidR) this.eyelidR.scale.set(1, 0.01, 1);
                if (this.earLeft) this.earLeft.rotation.z = 0.3;
                if (this.earRight) this.earRight.rotation.z = -0.3;
                if (this.earInnerL) this.earInnerL.rotation.z = 0.3;
                if (this.earInnerR) this.earInnerR.rotation.z = -0.3;
                if (this.mouthParts[0]) { this.mouthParts[0].rotation.z = 0.2; this.mouthParts[0].position.set(-0.1, -0.35, 1.1); }
                if (this.mouthParts[1]) { this.mouthParts[1].rotation.z = -0.2; this.mouthParts[1].position.set(0.1, -0.35, 1.1); }
                this._targetMouthOpen = 0;
                if (this.tongue && this.tongue.material) this.tongue.material.opacity = 0;
                break;
        }
    }

    // ─── Анимации ────────────────────────────────────────────

    speak() {
        this._isSpeaking = true;
        this._speakTimer = 0;
    }

    eat() {
        this._eatingProgress = 0;
    }

    pet() {
        this._jumpOffset = 0.2;
        setTimeout(() => { this._jumpOffset = 0; }, 300);

        if (typeof window !== 'undefined' && window.onKittyPet) {
            window.onKittyPet();
        }
    }

    spin() {
        this._spinAngle = 0;
        const spinDuration = 800;
        const startTime = performance.now();
        const doSpin = (now) => {
            if (this.isDisposed) return;
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            this._spinAngle = eased * Math.PI * 2;
            if (progress < 1) {
                requestAnimationFrame(doSpin);
            } else {
                this._spinAngle = 0;
            }
        };
        requestAnimationFrame(doSpin);
    }

    // ─── Взаимодействие ──────────────────────────────────────

    setupInteraction() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('mousemove', (e) => {
            if (!this._isDragging) {
                const rect = canvas.getBoundingClientRect();
                this._mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                this._mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                this._targetRotX = this._mouseY * 0.5;
                this._targetRotY = this._mouseX * 0.8;
            }
        });

        canvas.addEventListener('mousedown', () => { this._isDragging = true; canvas.style.cursor = 'grabbing'; });
        canvas.addEventListener('mouseup', () => { this._isDragging = false; canvas.style.cursor = 'grab'; });
        canvas.addEventListener('mouseleave', () => {
            this._isDragging = false;
            canvas.style.cursor = 'grab';
            this._targetRotX = 0;
            this._targetRotY = 0;
        });

        // Touch
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this._mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            this._mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            this._targetRotX = this._mouseY * 0.5;
            this._targetRotY = this._mouseX * 0.8;
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            this._targetRotX = 0;
            this._targetRotY = 0;
        });

        // Клик — погладить
        canvas.addEventListener('click', (e) => {
            if (!this._isDragging) {
                this.pet();
            }
        });

        // Ресайз
        window.addEventListener('resize', () => {
            if (this.isDisposed) return;
            this.width = this.container.clientWidth || 250;
            this.height = this.container.clientHeight || 250;
            this.renderer.setSize(this.width, this.height);
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
        });
    }

    // ─── ГЛАВНЫЙ ЦИКЛ ────────────────────────────────────────

    startLoop() {
        const animate = () => {
            if (this.isDisposed) return;
            requestAnimationFrame(animate);

            const dt = Math.min(this.clock.getDelta(), 0.1);
            this.animTime += dt;

            this.updateAnimations(dt);
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    updateAnimations(dt) {
        if (!this.catGroup) return;

        // ── Плавный поворот к цели (lerp) ──
        const lerpSpeed = 8;
        this._currentRotX += (this._targetRotX - this._currentRotX) * Math.min(lerpSpeed * dt, 1);
        this._currentRotY += (this._targetRotY - this._currentRotY) * Math.min(lerpSpeed * dt, 1);
        this.catGroup.rotation.x = this._currentRotX + this._spinAngle * 0;
        this.catGroup.rotation.y = this._currentRotY + this._spinAngle;

        // ── Дыхание ──
        const breathe = 1 + Math.sin(this.animTime * 2.1) * 0.02;
        if (this.bodyMesh) {
            this.bodyMesh.scale.set(breathe, 1.3 * breathe, breathe);
        }
        if (this.headMesh) {
            this.headMesh.scale.set(breathe, 0.85 * breathe, breathe);
        }

        // ── Прыжок при pet ──
        if (this._jumpOffset > 0.001) {
            const jumpY = Math.sin(this._jumpOffset * 10) * 0.2;
            this.catGroup.position.y = jumpY;
            this._jumpOffset *= 0.85;
            if (this._jumpOffset < 0.001) {
                this.catGroup.position.y = 0;
                this._jumpOffset = 0;
            }
        }

        // ── Моргание ──
        this._blinkTimer += dt;
        if (this._currentEmotion !== 'sleepy') {
            if (this._blinkTimer > this._blinkInterval) {
                this._blinkTimer = 0;
                this._blinkInterval = 3 + Math.random() * 5;
                this._isBlinking = true;
            }
            if (this._isBlinking) {
                this._blinkTimer += dt;
                const blinkProgress = Math.min(this._blinkTimer / 0.15, 1);
                const blinkVal = blinkProgress < 0.5 ? blinkProgress * 2 : (1 - blinkProgress) * 2;
                const eyelidScale = 0.01 + blinkVal * 0.99;
                if (this.eyelidL) this.eyelidL.scale.y = eyelidScale;
                if (this.eyelidR) this.eyelidR.scale.y = eyelidScale;
                if (blinkProgress >= 1) {
                    this._isBlinking = false;
                    this._blinkTimer = 0;
                    if (this.eyelidL) this.eyelidL.scale.y = 0.01;
                    if (this.eyelidR) this.eyelidR.scale.y = 0.01;
                }
            }
        } else {
            // Sleepy: веки полузакрыты
            if (this.eyelidL) this.eyelidL.scale.y += (0.6 - this.eyelidL.scale.y) * 0.1;
            if (this.eyelidR) this.eyelidR.scale.y += (0.6 - this.eyelidR.scale.y) * 0.1;
        }

        // ── Хвост ──
        if (this.tailGroup) {
            this.tailGroup.rotation.z = Math.sin(this.animTime * 3) * 0.15;
            this.tailGroup.rotation.y = Math.cos(this.animTime * 2.3) * 0.1;
        }

        // ── Уши: подёргивание каждые 6s ──
        this._earTwitchTimer += dt;
        if (this._earTwitchTimer > 6) {
            this._earTwitchTimer = 0;
            const twitchAmount = 0.15;
            const baseLeft = this._currentEmotion === 'sad' ? 0.6 : this._currentEmotion === 'sleepy' ? 0.4 : 0.3;
            const baseRight = this._currentEmotion === 'sad' ? -0.6 : this._currentEmotion === 'sleepy' ? -0.4 : -0.3;
            if (this.earLeft) this.earLeft.rotation.z = baseLeft + twitchAmount;
            if (this.earRight) this.earRight.rotation.z = baseRight - twitchAmount;
            if (this.earInnerL) this.earInnerL.rotation.z = baseLeft + twitchAmount;
            if (this.earInnerR) this.earInnerR.rotation.z = baseRight - twitchAmount;
            setTimeout(() => {
                if (this.earLeft && !this.isDisposed) {
                    this.earLeft.rotation.z = baseLeft;
                    this.earRight.rotation.z = baseRight;
                    this.earInnerL.rotation.z = baseLeft;
                    this.earInnerR.rotation.z = baseRight;
                }
            }, 150);
        }

        // ── Рот (morph) ──
        // Speaking
        if (this._isSpeaking) {
            this._speakTimer += dt;
            const cycle = Math.sin(this._speakTimer * 25);
            this._targetMouthOpen = 0.4 * Math.max(0, cycle);
            if (this._speakTimer > 1.0) {
                this._isSpeaking = false;
                this._speakTimer = 0;
                this._targetMouthOpen = 0;
            }
        }
        // Eating
        if (this._eatingProgress > 0 && this._eatingProgress < 1) {
            this._eatingProgress += dt * 2;
            if (this._eatingProgress >= 1) this._eatingProgress = 1;
            const eatCycle = this._eatingProgress < 0.5
                ? this._eatingProgress * 2
                : (1 - this._eatingProgress) * 2;
            this._targetMouthOpen = 0.7 * eatCycle;
            if (this._eatingProgress >= 1) this._targetMouthOpen = 0;
        }

        this._mouthOpenAmount += (this._targetMouthOpen - this._mouthOpenAmount) * 0.2;

        // Применяем открытие рта
        if (this.mouthParts[0] && this.mouthParts[1]) {
            const openY = -0.35 - this._mouthOpenAmount * 0.15;
            this.mouthParts[0].position.y += (openY - this.mouthParts[0].position.y) * 0.3;
            this.mouthParts[1].position.y += (openY - this.mouthParts[1].position.y) * 0.3;
            this.mouthParts[0].position.z = 1.1 + this._mouthOpenAmount * 0.05;
            this.mouthParts[1].position.z = 1.1 + this._mouthOpenAmount * 0.05;
        }
        // Язык
        if (this.tongue && this.tongue.material) {
            const targetOpacity = this._mouthOpenAmount > 0.1 ? 1 : 0;
            this.tongue.material.opacity += (targetOpacity - this.tongue.material.opacity) * 0.2;
            this.tongue.position.y += ((-0.4 + this._mouthOpenAmount * 0.1) - this.tongue.position.y) * 0.3;
        }

        // ── Частицы ──
        this.particles.forEach(star => {
            const ud = star.userData;
            star.position.x = ud.baseX + Math.sin(this.animTime * ud.speed + ud.phase) * ud.amplitude;
            star.position.y = ud.baseY + Math.cos(this.animTime * ud.speed * 1.3 + ud.phase) * ud.amplitude;
            star.position.z = ud.baseZ + Math.sin(this.animTime * ud.speed * 0.7 + ud.phase) * ud.amplitude;
        });

        // ── Fur shells: лёгкое смещение при движении ──
        const allShells = [...(this.headShells || []), ...(this.bodyShells || [])];
        allShells.forEach((shell, i) => {
            if (shell.userData && shell.userData.baseScale) {
                const offset = (Math.sin(this.animTime * 4 + i) * 0.01);
                shell.scale.setScalar(shell.userData.baseScale + offset);
                shell.position.x = Math.cos(this.animTime * 3 + i) * 0.01;
                shell.position.y = Math.sin(this.animTime * 2.5 + i) * 0.01;
            }
        });

        // ── Тень следует за котом ──
        if (this.shadowPlane) {
            this.shadowPlane.position.y = -2.4 + this.catGroup.position.y;
        }
    }

    // ─── ПРИМЕНЕНИЕ АКТИВНЫХ ПРЕДМЕТОВ ──────────────────────

    applyActiveItems() {
        if (!this.state || !this.state.catCustom) return;
        const cc = this.state.catCustom;
        if (cc.skin) this.setSkin(cc.skin);
        if (cc.hat) this.setHat(cc.hat);
        if (cc.glasses) this.setGlasses(cc.glasses);
        if (cc.accessory) this.setAccessory(cc.accessory);
        if (cc.emotion) this.setEmotion(cc.emotion);
    }

    // ─── ОЧИСТКА ─────────────────────────────────────────────

    dispose() {
        this.isDisposed = true;
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
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        if (this.furTexture) this.furTexture.dispose();
        this.catGroup = null;
        this.scene = null;
        this.renderer = null;
    }
}

// Экспорт констант
export { HAT_TYPES, GLASSES_TYPES, SKIN_TYPES, ACCESSORY_TYPES };