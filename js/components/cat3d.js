// js/components/cat3d.js
// 3D Кот на Three.js (CDN: three.min.js) с магазином кастомизации

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
            // Ждём
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

// ─── Класс Cat3D ────────────────────────────────────────────────

export class Cat3D {
    /**
     * @param {HTMLElement} container - DOM-элемент для вставки сцены
     * @param {object} state - ссылка на state из state.js
     * @param {function} saveState - функция saveState из state.js
     * @param {function} showToast - функция показа тостов
     */
    constructor(container, state, saveState) {
        this.container = container;
        this.state = state;
        this.saveState = saveState;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.catGroup = new THREE.Group(); // заглушка
        this.hatGroup = new THREE.Group();
        this.glassesGroup = new THREE.Group();
        this.accessoryGroup = new THREE.Group();
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
        this.renderer.domElement.style.display = 'block';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.cursor = 'grab';
    }

    setupLights() {
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

        const fillLight = new THREE.DirectionalLight(0xffeedd, 0.3);
        fillLight.position.set(-3, -2, 3);
        this.scene.add(fillLight);
    }

    // ─── Построение кота ──────────────────────────────────────────

    buildCat() {
        const furColor = SKIN_TYPES.orange.hex;
        const bellyColor = '#FEF3C7';

        // Группа кота
        this.catGroup = new THREE.Group();

        // ─── ТЕЛО (грушевидное, сидячее) ───
        const bodyGroup = new THREE.Group();
        // Основа — сфера, вытянутая вверх (грушевидная форма)
        const bodyGeo = new THREE.SphereGeometry(0.75, 20, 20);
        bodyGeo.scale(1, 1.35, 0.75);
        const bodyMat = new THREE.MeshToonMaterial({ color: furColor });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.y = -0.95;
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        bodyGroup.add(bodyMesh);
        this.bodyMesh = bodyMesh;

        // Нижняя часть тела (более широкая, "сидячая" попа)
        const lowerBodyGeo = new THREE.SphereGeometry(0.6, 16, 16);
        lowerBodyGeo.scale(1.1, 0.7, 0.85);
        const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyMat);
        lowerBody.position.y = -1.55;
        lowerBody.castShadow = true;
        bodyGroup.add(lowerBody);

        // Пузико
        const bellyGeo = new THREE.SphereGeometry(0.5, 14, 14);
        bellyGeo.scale(1, 0.8, 0.55);
        const bellyMat = new THREE.MeshToonMaterial({ color: bellyColor });
        const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
        bellyMesh.position.set(0, -1.05, 0.5);
        bodyGroup.add(bellyMesh);

        bodyGroup.position.y = 0;
        this.catGroup.add(bodyGroup);
        this.bodyGroup = bodyGroup;

        // ─── ШЕЯ ───
        const neckGeo = new THREE.CylinderGeometry(0.2, 0.28, 0.35, 12);
        const neckMat = new THREE.MeshToonMaterial({ color: furColor });
        const neckMesh = new THREE.Mesh(neckGeo, neckMat);
        neckMesh.position.y = -0.2;
        this.catGroup.add(neckMesh);

        // ─── ГОЛОВА (широкая, приплюснутая — кошачья) ───
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.05;

        // Основная сфера головы — шире чем выше
        const headGeo = new THREE.SphereGeometry(0.6, 20, 20);
        headGeo.scale(1.2, 0.85, 1.0);
        const headMat = new THREE.MeshToonMaterial({ color: furColor });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        // Нижняя челюсть — дополнительный объём снизу
        const jawGeo = new THREE.SphereGeometry(0.35, 14, 14);
        jawGeo.scale(1.0, 0.55, 0.7);
        const jawMesh = new THREE.Mesh(jawGeo, headMat);
        jawMesh.position.set(0, -0.28, 0.15);
        headGroup.add(jawMesh);

        // Щёки
        const cheekGeo = new THREE.SphereGeometry(0.22, 12, 12);
        const cheekMat = new THREE.MeshToonMaterial({ color: bellyColor });
        const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
        cheekL.position.set(-0.4, -0.08, 0.45);
        headGroup.add(cheekL);
        const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
        cheekR.position.set(0.4, -0.08, 0.45);
        headGroup.add(cheekR);

        // Нос
        const noseGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const noseMat = new THREE.MeshToonMaterial({ color: '#F472B6' });
        const noseMesh = new THREE.Mesh(noseGeo, noseMat);
        noseMesh.position.set(0, -0.02, 0.62);
        headGroup.add(noseMesh);

        // Блик на носу
        const noseShineGeo = new THREE.SphereGeometry(0.03, 6, 6);
        const noseShineMat = new THREE.MeshToonMaterial({ color: '#FFFFFF' });
        const noseShine = new THREE.Mesh(noseShineGeo, noseShineMat);
        noseShine.position.set(0.01, 0.02, 0.69);
        headGroup.add(noseShine);

        // Рот (w-улыбка) — два маленьких изогнутых цилиндра
        const mouthColor = '#BE185D';
        const mouthMat = new THREE.MeshToonMaterial({ color: mouthColor });

        // Левая часть рта
        const mouthGeo1 = new THREE.TorusGeometry(0.08, 0.02, 8, 8, Math.PI);
        const mouth1 = new THREE.Mesh(mouthGeo1, mouthMat);
        mouth1.position.set(-0.08, -0.14, 0.62);
        mouth1.rotation.set(0, 0, -Math.PI / 6);
        headGroup.add(mouth1);

        // Правая часть
        const mouthGeo2 = new THREE.TorusGeometry(0.08, 0.02, 8, 8, Math.PI);
        const mouth2 = new THREE.Mesh(mouthGeo2, mouthMat);
        mouth2.position.set(0.08, -0.14, 0.62);
        mouth2.rotation.set(0, 0, Math.PI / 6);
        headGroup.add(mouth2);

        // Центр
        const mouthGeo3 = new THREE.TorusGeometry(0.05, 0.02, 8, 8, Math.PI);
        const mouth3 = new THREE.Mesh(mouthGeo3, mouthMat);
        mouth3.position.set(0, -0.2, 0.62);
        mouth3.rotation.set(0, 0, Math.PI);
        headGroup.add(mouth3);

        // Усы — 4 тонких цилиндра с каждой стороны
        const whiskerMat = new THREE.MeshToonMaterial({ color: '#CBD5E1' });
        const whiskerGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 6);
        const whiskerPositions = [
            { x: 0.25, y: 0.05, z: 0.5, ry: 0, rz: 0.5 },
            { x: 0.28, y: 0.0, z: 0.5, ry: 0, rz: 0.3 },
            { x: 0.3, y: -0.05, z: 0.5, ry: 0, rz: 0.1 },
            { x: 0.28, y: -0.1, z: 0.5, ry: 0, rz: -0.1 },
            { x: -0.25, y: 0.05, z: 0.5, ry: 0, rz: -0.5 },
            { x: -0.28, y: 0.0, z: 0.5, ry: 0, rz: -0.3 },
            { x: -0.3, y: -0.05, z: 0.5, ry: 0, rz: -0.1 },
            { x: -0.28, y: -0.1, z: 0.5, ry: 0, rz: 0.1 }
        ];
        whiskerPositions.forEach(wp => {
            const w = new THREE.Mesh(whiskerGeo, whiskerMat);
            w.position.set(wp.x, wp.y, wp.z);
            w.rotation.z = wp.rz;
            headGroup.add(w);
        });

        // ─── ГЛАЗА ───
        this.eyeGroup = new THREE.Group();
        this.eyeLeft = this.buildEye();
        this.eyeLeft.position.set(-0.22, 0.12, 0.55);
        this.eyeRight = this.buildEye();
        this.eyeRight.position.set(0.22, 0.12, 0.55);
        this.eyeGroup.add(this.eyeLeft);
        this.eyeGroup.add(this.eyeRight);
        headGroup.add(this.eyeGroup);

        this.headGroup = headGroup;
        this.catGroup.add(headGroup);

        // ─── УШИ ───
        this.earsGroup = new THREE.Group();
        this.earLeft = this.buildEar(furColor);
        this.earLeft.position.set(-0.38, 0.55, -0.05);
        this.earLeft.rotation.z = 0.3;
        this.earRight = this.buildEar(furColor);
        this.earRight.position.set(0.38, 0.55, -0.05);
        this.earRight.rotation.z = -0.3;
        this.earsGroup.add(this.earLeft);
        this.earsGroup.add(this.earRight);
        this.catGroup.add(this.earsGroup);

        // ─── ЛАПЫ (передние, округлые) ───
        this.pawsGroup = new THREE.Group();
        const pawMat = new THREE.MeshToonMaterial({ color: furColor });

        [-1, 1].forEach(side => {
            // Ножка (цилиндр, сужающийся книзу)
            const legGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.55, 12);
            const leg = new THREE.Mesh(legGeo, pawMat);
            leg.position.set(side * 0.35, -1.3, 0.25);
            leg.castShadow = true;
            this.pawsGroup.add(leg);

            // Сама лапка (сплюснутая сфера)
            const footGeo = new THREE.SphereGeometry(0.18, 12, 8);
            footGeo.scale(1, 0.45, 1.2);
            const foot = new THREE.Mesh(footGeo, pawMat);
            foot.position.set(side * 0.35, -1.65, 0.35);
            foot.castShadow = true;
            this.pawsGroup.add(foot);

            // Три подушечки-пальчика
            const toeGeo = new THREE.SphereGeometry(0.05, 8, 8);
            toeGeo.scale(1, 0.4, 1);
            const toeMat = new THREE.MeshToonMaterial({ color: '#FECACA' });
            [[-0.08, -0.02], [0, 0.04], [0.08, -0.02]].forEach(([dx, dz]) => {
                const toe = new THREE.Mesh(toeGeo, toeMat);
                toe.position.set(side * 0.35 + dx * side, -1.72, 0.4 + dz);
                toe.rotation.x = -Math.PI / 2;
                this.pawsGroup.add(toe);
            });

            // Большая центральная подушечка
            const bigPadGeo = new THREE.SphereGeometry(0.07, 8, 8);
            bigPadGeo.scale(1, 0.4, 1.2);
            const bigPad = new THREE.Mesh(bigPadGeo, toeMat);
            bigPad.position.set(side * 0.35, -1.72, 0.25);
            bigPad.rotation.x = -Math.PI / 2;
            this.pawsGroup.add(bigPad);
        });

        this.catGroup.add(this.pawsGroup);

        // ─── ХВОСТ ───
        this.tailGroup = new THREE.Group();
        const tailCurve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, -1.2, -0.5),
            new THREE.Vector3(0.3, -0.5, -0.8),
            new THREE.Vector3(-0.1, 0.3, -0.6),
            new THREE.Vector3(0.1, 0.8, -0.5)
        );
        const tailGeo = new THREE.TubeGeometry(tailCurve, 16, 0.08, 8, false);
        // Переменный радиус
        const tailPositions = tailGeo.attributes.position;
        for (let i = 0; i < tailPositions.count; i++) {
            const t = i / tailPositions.count;
            const scale = 1.0 - t * 0.5;
            tailPositions.setX(i, tailPositions.getX(i) * (1 + t * 0.2));
        }
        tailGeo.computeVertexNormals();

        const tailMat = new THREE.MeshToonMaterial({ color: furColor });
        const tailMesh = new THREE.Mesh(tailGeo, tailMat);
        tailMesh.castShadow = true;
        this.tailGroup.add(tailMesh);

        // Тёмный кончик
        const tipGeo = new THREE.SphereGeometry(0.07, 8, 8);
        const tipMat = new THREE.MeshToonMaterial({ color: '#B45309' });
        const tipMesh = new THREE.Mesh(tipGeo, tipMat);
        const tipPoint = tailCurve.getPoint(1);
        tipMesh.position.copy(tipPoint);
        this.tailGroup.add(tipMesh);

        this.catGroup.add(this.tailGroup);

        this.scene.add(this.catGroup);

        // Группы для аксессуаров
        this.hatGroup = new THREE.Group();
        this.glassesGroup = new THREE.Group();
        this.accessoryGroup = new THREE.Group();
        this.headGroup.add(this.hatGroup);
        this.headGroup.add(this.glassesGroup);
        this.catGroup.add(this.accessoryGroup);

        // ─── ТЕНЬ (plane) ───
        const shadowGeo = new THREE.PlaneGeometry(1.8, 1.2);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -2.1;
        shadowPlane.receiveShadow = true;
        this.scene.add(shadowPlane);
    }

    buildEye() {
        const group = new THREE.Group();

        // Белок
        const whiteGeo = new THREE.SphereGeometry(0.13, 12, 12);
        const whiteMat = new THREE.MeshToonMaterial({ color: '#FFFFFF' });
        const white = new THREE.Mesh(whiteGeo, whiteMat);
        group.add(white);

        // Радужка
        const irisGeo = new THREE.SphereGeometry(0.08, 10, 10);
        const irisMat = new THREE.MeshToonMaterial({ color: '#10B981' });
        const iris = new THREE.Mesh(irisGeo, irisMat);
        iris.position.z = 0.08;
        group.add(iris);

        // Зрачок
        const pupilGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const pupilMat = new THREE.MeshToonMaterial({ color: '#000000' });
        const pupil = new THREE.Mesh(pupilGeo, pupilMat);
        pupil.position.z = 0.12;
        group.add(pupil);

        // Блик
        const shineGeo = new THREE.SphereGeometry(0.025, 6, 6);
        const shineMat = new THREE.MeshToonMaterial({ color: '#FFFFFF' });
        const shine = new THREE.Mesh(shineGeo, shineMat);
        shine.position.set(0.03, 0.03, 0.15);
        group.add(shine);

        return group;
    }

    buildEar(furColor) {
        const group = new THREE.Group();

        // Внешнее ухо
        const outerGeo = new THREE.ConeGeometry(0.22, 0.5, 8, 1);
        const outerMat = new THREE.MeshToonMaterial({ color: furColor });
        const outer = new THREE.Mesh(outerGeo, outerMat);
        outer.castShadow = true;
        group.add(outer);

        // Внутреннее ухо
        const innerGeo = new THREE.ConeGeometry(0.13, 0.35, 8, 1);
        const innerMat = new THREE.MeshToonMaterial({ color: '#FECACA' });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.y = -0.03;
        inner.position.z = 0.05;
        group.add(inner);

        return group;
    }

    // ─── Аксессуары ───────────────────────────────────────────────

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

        if (type === 'cap') {
            // Кепка
            const brimGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.1, 16);
            const brimMat = new THREE.MeshToonMaterial({ color: '#1E40AF' });
            const brim = new THREE.Mesh(brimGeo, brimMat);
            brim.position.y = 0.65;
            this.hatGroup.add(brim);

            const topGeo = new THREE.SphereGeometry(0.35, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            const topMat = new THREE.MeshToonMaterial({ color: '#2563EB' });
            const top = new THREE.Mesh(topGeo, topMat);
            top.position.y = 0.7;
            this.hatGroup.add(top);

            const buttonGeo = new THREE.SphereGeometry(0.06, 8, 8);
            const buttonMat = new THREE.MeshToonMaterial({ color: '#1E3A8A' });
            const button = new THREE.Mesh(buttonGeo, buttonMat);
            button.position.y = 0.95;
            this.hatGroup.add(button);
        } else if (type === 'grad') {
            // Выпускная шапочка
            const baseGeo = new THREE.BoxGeometry(0.45, 0.06, 0.45);
            const baseMat = new THREE.MeshToonMaterial({ color: '#111827' });
            const base = new THREE.Mesh(baseGeo, baseMat);
            base.position.y = 0.72;
            this.hatGroup.add(base);

            const topGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.2, 12);
            const topMat = new THREE.MeshToonMaterial({ color: '#111827' });
            const top = new THREE.Mesh(topGeo, topMat);
            top.position.y = 0.85;
            this.hatGroup.add(top);

            // Кисточка
            const tasselGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6);
            const tasselMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            const tassel = new THREE.Mesh(tasselGeo, tasselMat);
            tassel.position.set(0.1, 0.7, 0);
            tassel.rotation.z = 0.5;
            this.hatGroup.add(tassel);
        } else if (type === 'crown') {
            // Корона
            const baseGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 24);
            const baseMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            const base = new THREE.Mesh(baseGeo, baseMat);
            base.position.y = 0.68;
            this.hatGroup.add(base);

            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const spikeGeo = new THREE.ConeGeometry(0.05, 0.2, 6);
                const spike = new THREE.Mesh(spikeGeo, baseMat);
                spike.position.set(
                    Math.cos(angle) * 0.3,
                    0.78,
                    Math.sin(angle) * 0.3
                );
                this.hatGroup.add(spike);
            }

            const jewelGeo = new THREE.SphereGeometry(0.05, 8, 8);
            const jewelMat = new THREE.MeshToonMaterial({ color: '#EF4444' });
            const jewel = new THREE.Mesh(jewelGeo, jewelMat);
            jewel.position.y = 0.88;
            this.hatGroup.add(jewel);
        } else if (type === 'wizard') {
            // Колпак волшебника
            const coneGeo = new THREE.ConeGeometry(0.28, 0.7, 12, 1);
            const coneMat = new THREE.MeshToonMaterial({ color: '#7C3AED' });
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.position.y = 0.85;
            this.hatGroup.add(cone);

            const brimGeo = new THREE.TorusGeometry(0.32, 0.06, 8, 24);
            const brimMat = new THREE.MeshToonMaterial({ color: '#5B21B6' });
            const brim = new THREE.Mesh(brimGeo, brimMat);
            brim.position.y = 0.58;
            this.hatGroup.add(brim);

            // Звёздочка
            for (let i = 0; i < 5; i++) {
                const starGeo = new THREE.SphereGeometry(0.02, 4, 4);
                const starMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
                const star = new THREE.Mesh(starGeo, starMat);
                star.position.set(
                    (Math.random() - 0.5) * 0.4,
                    0.7 + Math.random() * 0.5,
                    (Math.random() - 0.5) * 0.4
                );
                this.hatGroup.add(star);
            }
        } else if (type === 'tophat') {
            // Цилиндр
            const topGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.45, 16);
            const topMat = new THREE.MeshToonMaterial({ color: '#111827' });
            const top = new THREE.Mesh(topGeo, topMat);
            top.position.y = 0.85;
            this.hatGroup.add(top);

            const brimGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.06, 24);
            const brimMat = new THREE.MeshToonMaterial({ color: '#1F2937' });
            const brim = new THREE.Mesh(brimGeo, brimMat);
            brim.position.y = 0.6;
            this.hatGroup.add(brim);

            const bandGeo = new THREE.TorusGeometry(0.26, 0.03, 8, 24);
            const bandMat = new THREE.MeshToonMaterial({ color: '#7C3AED' });
            const band = new THREE.Mesh(bandGeo, bandMat);
            band.rotation.x = Math.PI / 2;
            band.position.y = 0.75;
            this.hatGroup.add(band);
        }
    }

    setGlasses(type) {
        this.clearGroup(this.glassesGroup);
        if (type === 'none') return;

        const frameGeo = new THREE.TorusGeometry(0.2, 0.03, 8, 16);

        if (type === 'round') {
            const frameMat = new THREE.MeshToonMaterial({ color: '#374151' });
            const frameL = new THREE.Mesh(frameGeo, frameMat);
            frameL.position.set(-0.2, 0.12, 0.6);
            this.glassesGroup.add(frameL);
            const frameR = new THREE.Mesh(frameGeo, frameMat);
            frameR.position.set(0.2, 0.12, 0.6);
            this.glassesGroup.add(frameR);

            const bridgeGeo = new THREE.BoxGeometry(0.1, 0.03, 0.03);
            const bridge = new THREE.Mesh(bridgeGeo, frameMat);
            bridge.position.set(0, 0.12, 0.6);
            this.glassesGroup.add(bridge);
        } else if (type === 'cool') {
            // Стильные (треугольные/wayfarer)
            const frameMat = new THREE.MeshToonMaterial({ color: '#111827' });
            const boxGeo = new THREE.BoxGeometry(0.35, 0.2, 0.04);
            const boxL = new THREE.Mesh(boxGeo, frameMat);
            boxL.position.set(-0.2, 0.12, 0.6);
            this.glassesGroup.add(boxL);
            const boxR = new THREE.Mesh(boxGeo, frameMat);
            boxR.position.set(0.2, 0.12, 0.6);
            this.glassesGroup.add(boxR);

            const bridgeGeo = new THREE.BoxGeometry(0.08, 0.03, 0.03);
            const bridge = new THREE.Mesh(bridgeGeo, frameMat);
            bridge.position.set(0, 0.12, 0.6);
            this.glassesGroup.add(bridge);
        } else if (type === 'star') {
            // Звёздные (шестиугольники)
            const starFrameMat = new THREE.MeshToonMaterial({ color: '#FBBF24' });
            for (let g = 0; g < 2; g++) {
                const sign = g === 0 ? -1 : 1;
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6);
                    const rod = new THREE.Mesh(rodGeo, starFrameMat);
                    rod.position.set(sign * 0.2 + Math.cos(angle) * 0.1, 0.12 + Math.sin(angle) * 0.1, 0.6);
                    rod.rotation.z = angle + Math.PI / 2;
                    this.glassesGroup.add(rod);
                }
            }
            const bridgeGeo = new THREE.BoxGeometry(0.08, 0.03, 0.03);
            const bridge = new THREE.Mesh(bridgeGeo, starFrameMat);
            bridge.position.set(0, 0.12, 0.6);
            this.glassesGroup.add(bridge);
        } else if (type === 'd3') {
            // 3D-очки (квадратные)
            const d3Mat = new THREE.MeshToonMaterial({ color: '#EF4444' });
            const boxGeo = new THREE.BoxGeometry(0.25, 0.18, 0.05);
            const boxL = new THREE.Mesh(boxGeo, d3Mat);
            boxL.position.set(-0.2, 0.12, 0.6);
            this.glassesGroup.add(boxL);
            const boxR = new THREE.Mesh(boxGeo, d3Mat);
            boxR.position.set(0.2, 0.12, 0.6);
            this.glassesGroup.add(boxR);

            // Синяя линза
            const lensGeo = new THREE.BoxGeometry(0.2, 0.13, 0.03);
            const lensMat = new THREE.MeshToonMaterial({ color: '#3B82F6', transparent: true, opacity: 0.5 });
            const lensL = new THREE.Mesh(lensGeo, lensMat);
            lensL.position.set(-0.2, 0.12, 0.63);
            this.glassesGroup.add(lensL);
            const lensR = new THREE.Mesh(lensGeo, lensMat);
            lensR.position.set(0.2, 0.12, 0.63);
            this.glassesGroup.add(lensR);

            const bridgeGeo = new THREE.BoxGeometry(0.08, 0.03, 0.03);
            const bridge = new THREE.Mesh(bridgeGeo, d3Mat);
            bridge.position.set(0, 0.12, 0.6);
            this.glassesGroup.add(bridge);
        }
    }

    setSkin(hex) {
        const color = new THREE.Color(hex);
        this.updateGroupColor(this.catGroup, color, ['#FEF3C7', '#FECACA', '#F472B6', '#BE185D', '#CBD5E1', '#B45309', '#10B981', '#FFFFFF', '#000000']);
    }

    updateGroupColor(group, color, exclude) {
        group.traverse(child => {
            if (child.isMesh && child.material && child.material.color) {
                const hex = '#' + child.material.color.getHexString();
                if (!exclude.some(e => e.toUpperCase() === hex.toUpperCase())) {
                    child.material.color.copy(color);
                }
            }
        });
    }

    setAccessory(type) {
        this.clearGroup(this.accessoryGroup);
        if (type === 'none') return;

        if (type === 'bowtie') {
            // Бабочка
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
            // Ошейник
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
            // Рыбка в лапах
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
            // Книжка
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
            // Звёздочки (частицы)
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

    // ─── Взаимодействие ───────────────────────────────────────────

    setupInteraction() {
        const canvas = this.renderer.domElement;

        // Мышь
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

    pet() {
        this._jumpOffset = 0.15;
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
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            this._spinAngle = progress * Math.PI * 2;
            if (progress < 1) {
                requestAnimationFrame(doSpin);
            } else {
                this._spinAngle = 0;
            }
        };
        requestAnimationFrame(doSpin);
    }

    sparkle() {
        // Искры вокруг кота
        const sparkCount = 20;
        for (let i = 0; i < sparkCount; i++) {
            const sparkGeo = new THREE.SphereGeometry(0.03, 4, 4);
            const colors = ['#FBBF24', '#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6'];
            const sparkMat = new THREE.MeshToonMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
            const spark = new THREE.Mesh(sparkGeo, sparkMat);
            spark.position.set(
                (Math.random() - 0.5) * 2,
                -0.5 + Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            spark.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    0.02 + Math.random() * 0.05,
                    (Math.random() - 0.5) * 0.05
                ),
                life: 1.0,
                decay: 0.01 + Math.random() * 0.02
            };
            this.scene.add(spark);
            this._tempSparks = this._tempSparks || [];
            this._tempSparks.push(spark);
        }
    }

    // ─── Игровой цикл ─────────────────────────────────────────────

    startLoop() {
        const animate = () => {
            if (this.isDisposed) return;
            requestAnimationFrame(animate);

            const dt = Math.min(this.clock.getDelta(), 0.1);
            this.animTime += dt;

            // Вращение (плавное)
            this._currentRotX += (this._targetRotX - this._currentRotX) * 0.1;
            this._currentRotY += (this._targetRotY - this._currentRotY) * 0.1;
            this.catGroup.rotation.x = this._currentRotX * Math.PI / 6;
            this.catGroup.rotation.y = this._currentRotY * Math.PI / 4 + this._spinAngle;

            // Дыхание
            const breath = 1 + Math.sin(this.animTime * 2.1) * 0.02;
            this.catGroup.scale.setScalar(breath);

            // Прыжок
            this.catGroup.position.y = this._jumpOffset * Math.sin(Math.min(this._jumpOffset > 0 ? this.animTime * 15 : 0, Math.PI));

            // Моргание
            this._blinkTimer += dt;
            if (this._blinkTimer > this._blinkInterval && !this._isBlinking) {
                this._isBlinking = true;
                this._blinkTimer = 0;
                this._blinkInterval = 3 + Math.random() * 5;
                setTimeout(() => { this._isBlinking = false; }, 150);
            }
            const blinkScale = this._isBlinking ? 
                (Math.sin(this._blinkTimer * 25) > 0 ? 0.1 : 1) : 1;
            if (this.eyeLeft) this.eyeLeft.scale.y = blinkScale;
            if (this.eyeRight) this.eyeRight.scale.y = blinkScale;

            // Хвост
            if (this.tailGroup) {
                this._tailWave += dt * 3;
                this.tailGroup.rotation.z = Math.sin(this._tailWave) * 0.15;
                this.tailGroup.rotation.x = Math.cos(this._tailWave * 0.7) * 0.1;
            }

            // Уши
            this._earTwitchTimer += dt;
            if (this._earTwitchTimer > 6) {
                this._earTwitchTimer = 0;
                if (this.earLeft && this.earRight) {
                    const origL = this.earLeft.rotation.z;
                    const origR = this.earRight.rotation.z;
                    const twitch = () => {
                        if (this.isDisposed) return;
                        const t = (Date.now() % 300) / 300;
                        this.earLeft.rotation.z = origL + Math.sin(t * Math.PI * 4) * 0.15;
                        this.earRight.rotation.z = origR - Math.sin(t * Math.PI * 4) * 0.15;
                        if (t < 1) requestAnimationFrame(twitch);
                        else {
                            this.earLeft.rotation.z = origL;
                            this.earRight.rotation.z = origR;
                        }
                    };
                    twitch();
                }
            }

            // Частицы
            if (this.particles.length > 0) {
                this.particles.forEach(p => {
                    p.position.x = p.userData.baseX + Math.sin(this.animTime * p.userData.speed + p.userData.phase) * p.userData.amplitude;
                    p.position.y = p.userData.baseY + Math.cos(this.animTime * p.userData.speed * 0.7 + p.userData.phase) * p.userData.amplitude;
                });
            }

            // Временные искры
            if (this._tempSparks && this._tempSparks.length > 0) {
                this._tempSparks = this._tempSparks.filter(spark => {
                    spark.userData.life -= spark.userData.decay;
                    spark.material.opacity = spark.userData.life;
                    spark.material.transparent = true;
                    spark.position.add(spark.userData.velocity);
                    if (spark.userData.life <= 0) {
                        this.scene.remove(spark);
                        spark.geometry.dispose();
                        spark.material.dispose();
                        return false;
                    }
                    return true;
                });
            }

            this.renderer.render(this.scene, this.camera);
        };
        requestAnimationFrame(animate);
    }

    // ─── Применение сохранённого состояния ─────────────────────────

    applyActiveItems() {
        if (!this.state.activeItems) return;
        const { hat, glasses, skin, accessory } = this.state.activeItems;
        if (hat) this.setHat(hat);
        if (glasses) this.setGlasses(glasses);
        if (skin) this.setSkin(SKIN_TYPES[skin]?.hex || SKIN_TYPES.orange.hex);
        if (accessory) this.setAccessory(accessory);
    }

    // ─── Очистка ──────────────────────────────────────────────────

    dispose() {
        this.isDisposed = true;
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
        }
        // Очистка сцены
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
    }
}

// ─── Экспорты данных магазина ────────────────────────────────────

export { HAT_TYPES, GLASSES_TYPES, SKIN_TYPES, ACCESSORY_TYPES };