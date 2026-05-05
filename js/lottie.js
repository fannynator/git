// js/lottie.js

// Анимации в формате Lottie JSON (встроенные, не требуют внешних файлов)
const ANIMATIONS = {
    // Кот-учёный (главный экран) — моргает, дышит
    cat: {
        v: "5.5.7",
        fr: 30,
        ip: 0,
        op: 60,
        w: 200,
        h: 200,
        nm: "Cat",
        ddd: 0,
        assets: [],
        layers: [
            {
                ddd: 0,
                ind: 1,
                ty: 4,
                nm: "Cat Body",
                sr: 1,
                ks: {
                    o: { a: 0, k: 100 },
                    r: { a: 1, k: [{ t: 0, s: -5 }, { t: 30, s: 5 }, { t: 60, s: -5 }] },
                    p: { a: 0, k: [100, 100] },
                    s: { a: 1, k: [{ t: 0, s: [100, 100] }, { t: 30, s: [102, 98] }, { t: 60, s: [100, 100] }] }
                },
                shapes: [
                    {
                        ty: "gr", it: [
                            { ty: "rc", d: 1, s: { a: 0, k: [80, 70] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 20 } },
                            { ty: "fl", c: { a: 0, k: [1, 0.85, 0.4] }, o: { a: 0, k: 100 } },
                            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
                        ]
                    }
                ]
            },
            {
                ddd: 0,
                ind: 2,
                ty: 4,
                nm: "Eyes",
                sr: 1,
                ks: {
                    o: { a: 1, k: [{ t: 0, s: 100 }, { t: 1, s: 0 }, { t: 2, s: 100 }, { t: 58, s: 100 }, { t: 59, s: 0 }, { t: 60, s: 100 }] },
                    r: { a: 0, k: 0 },
                    p: { a: 0, k: [100, 85] },
                    s: { a: 0, k: [100, 100] }
                },
                shapes: [
                    {
                        ty: "gr", it: [
                            { ty: "el", s: { a: 0, k: [8, 10] }, p: { a: 0, k: [-15, 0] } },
                            { ty: "fl", c: { a: 0, k: [0.1, 0.1, 0.1] }, o: { a: 0, k: 100 } },
                            { ty: "el", s: { a: 0, k: [8, 10] }, p: { a: 0, k: [15, 0] } },
                            { ty: "fl", c: { a: 0, k: [0.1, 0.1, 0.1] }, o: { a: 0, k: 100 } },
                            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
                        ]
                    }
                ]
            }
        ]
    },

    // Ачивка — медаль с ленточкой
    achievement: {
        v: "5.5.7",
        fr: 30,
        ip: 0,
        op: 45,
        w: 200,
        h: 200,
        nm: "Achievement",
        ddd: 0,
        assets: [],
        layers: [
            {
                ddd: 0,
                ind: 1,
                ty: 4,
                nm: "Star",
                sr: 1,
                ks: {
                    o: { a: 1, k: [{ t: 0, s: 0 }, { t: 10, s: 100 }, { t: 45, s: 100 }] },
                    r: { a: 1, k: [{ t: 0, s: -180 }, { t: 20, s: 0 }] },
                    p: { a: 0, k: [100, 100] },
                    s: { a: 1, k: [{ t: 0, s: [0, 0] }, { t: 15, s: [120, 120] }, { t: 25, s: [100, 100] }] }
                },
                shapes: [
                    {
                        ty: "sr", sy: 5, pt: 5, p: { a: 0, k: [0, 0] },
                        r: { a: 0, k: 50 }, or: { a: 0, k: 50 },
                        os: { a: 0, k: 0 }, is: { a: 0, k: 25 },
                        ir: { a: 0, k: 25 }
                    },
                    { ty: "fl", c: { a: 0, k: [1, 0.85, 0.1] }, o: { a: 0, k: 100 } },
                    { ty: "gs", s: { a: 0, k: [3, 2] }, e: { a: 0, k: [3, 2] }, w: { a: 0, k: 3 }, o: { a: 0, k: 100 }, c: { a: 0, k: [1, 0.7, 0] } }
                ]
            },
            {
                ddd: 0,
                ind: 2,
                ty: 4,
                nm: "Ribbon Left",
                sr: 1,
                ks: {
                    o: { a: 1, k: [{ t: 5, s: 0 }, { t: 15, s: 100 }] },
                    r: { a: 0, k: -30 },
                    p: { a: 0, k: [70, 90] },
                    s: { a: 0, k: [80, 20] }
                },
                shapes: [
                    { ty: "rc", d: 1, s: { a: 0, k: [60, 15] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 5 } },
                    { ty: "fl", c: { a: 0, k: [0.9, 0.2, 0.2] }, o: { a: 0, k: 100 } }
                ]
            },
            {
                ddd: 0,
                ind: 3,
                ty: 4,
                nm: "Ribbon Right",
                sr: 1,
                ks: {
                    o: { a: 1, k: [{ t: 5, s: 0 }, { t: 15, s: 100 }] },
                    r: { a: 0, k: 30 },
                    p: { a: 0, k: [130, 90] },
                    s: { a: 0, k: [80, 20] }
                },
                shapes: [
                    { ty: "rc", d: 1, s: { a: 0, k: [60, 15] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 5 } },
                    { ty: "fl", c: { a: 0, k: [0.9, 0.2, 0.2] }, o: { a: 0, k: 100 } }
                ]
            }
        ]
    },

    // Фейерверк (завершение урока)
    firework: {
        v: "5.5.7",
        fr: 30,
        ip: 0,
        op: 45,
        w: 300,
        h: 300,
        nm: "Firework",
        ddd: 0,
        assets: [],
        layers: [
            {
                ddd: 0, ind: 1, ty: 4, nm: "Burst",
                sr: 1,
                ks: {
                    o: { a: 1, k: [{ t: 0, s: 100 }, { t: 40, s: 0 }] },
                    r: { a: 0, k: 0 },
                    p: { a: 0, k: [150, 150] },
                    s: { a: 1, k: [{ t: 0, s: [0, 0] }, { t: 15, s: [150, 150] }, { t: 45, s: [120, 120] }] }
                },
                shapes: [
                    { ty: "sr", sy: 12, pt: 12, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 80 }, or: { a: 0, k: 80 }, os: { a: 0, k: 0 }, is: { a: 0, k: 60 }, ir: { a: 0, k: 60 } },
                    { ty: "fl", c: { a: 0, k: [1, 0.85, 0.1] }, o: { a: 0, k: 80 } }
                ]
            },
            {
                ddd: 0, ind: 2, ty: 4, nm: "Burst 2",
                sr: 1,
                ks: {
                    o: { a: 1, k: [{ t: 5, s: 100 }, { t: 45, s: 0 }] },
                    r: { a: 0, k: 15 },
                    p: { a: 0, k: [150, 150] },
                    s: { a: 1, k: [{ t: 5, s: [0, 0] }, { t: 20, s: [120, 120] }, { t: 45, s: [100, 100] }] }
                },
                shapes: [
                    { ty: "sr", sy: 8, pt: 8, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 60 }, or: { a: 0, k: 60 }, os: { a: 0, k: 20 }, is: { a: 0, k: 50 }, ir: { a: 0, k: 50 } },
                    { ty: "fl", c: { a: 0, k: [0.3, 0.8, 1] }, o: { a: 0, k: 80 } }
                ]
            },
            {
                ddd: 0, ind: 3, ty: 4, nm: "Burst 3",
                sr: 1,
                ks: {
                    o: { a: 1, k: [{ t: 10, s: 100 }, { t: 45, s: 0 }] },
                    r: { a: 0, k: -10 },
                    p: { a: 0, k: [150, 150] },
                    s: { a: 1, k: [{ t: 10, s: [0, 0] }, { t: 25, s: [100, 100] }, { t: 45, s: [80, 80] }] }
                },
                shapes: [
                    { ty: "sr", sy: 6, pt: 6, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 40 }, or: { a: 0, k: 40 }, os: { a: 0, k: 30 }, is: { a: 0, k: 35 }, ir: { a: 0, k: 35 } },
                    { ty: "fl", c: { a: 0, k: [0.2, 1, 0.5] }, o: { a: 0, k: 80 } }
                ]
            }
        ]
    },

    // Кот перелистывает книгу (загрузка)
    loading: {
        v: "5.5.7",
        fr: 30,
        ip: 0,
        op: 30,
        w: 200,
        h: 150,
        nm: "Loading",
        ddd: 0,
        assets: [],
        layers: [
            {
                ddd: 0, ind: 1, ty: 4, nm: "Book",
                sr: 1,
                ks: {
                    o: { a: 0, k: 100 },
                    r: { a: 0, k: 0 },
                    p: { a: 0, k: [100, 80] },
                    s: { a: 0, k: [100, 100] }
                },
                shapes: [
                    { ty: "rc", d: 1, s: { a: 0, k: [60, 40] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 5 } },
                    { ty: "fl", c: { a: 0, k: [0.3, 0.5, 0.8] }, o: { a: 0, k: 100 } },
                    { ty: "rc", d: 1, s: { a: 0, k: [55, 35] }, p: { a: 0, k: [5, 0] }, r: { a: 0, k: 3 } },
                    { ty: "fl", c: { a: 0, k: [0.9, 0.95, 1] }, o: { a: 0, k: 100 } }
                ]
            },
            {
                ddd: 0, ind: 2, ty: 4, nm: "Page flip",
                sr: 1,
                ks: {
                    o: { a: 0, k: 100 },
                    r: { a: 1, k: [{ t: 0, s: 0 }, { t: 12, s: -30 }, { t: 15, s: 0 }, { t: 27, s: -30 }, { t: 30, s: 0 }] },
                    p: { a: 0, k: [120, 65] },
                    s: { a: 0, k: [50, 35] }
                },
                shapes: [
                    { ty: "rc", d: 1, s: { a: 0, k: [50, 35] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 3 } },
                    { ty: "fl", c: { a: 0, k: [0.95, 0.97, 1] }, o: { a: 0, k: 100 } }
                ]
            }
        ]
    },

    // Кот ждёт (пустой экран)
    waiting: {
        v: "5.5.7",
        fr: 30,
        ip: 0,
        op: 60,
        w: 200,
        h: 200,
        nm: "Waiting",
        ddd: 0,
        assets: [],
        layers: [
            {
                ddd: 0, ind: 1, ty: 4, nm: "Cat sitting",
                sr: 1,
                ks: {
                    o: { a: 0, k: 100 },
                    r: { a: 1, k: [{ t: 0, s: 0 }, { t: 40, s: 8 }, { t: 60, s: 0 }] },
                    p: { a: 0, k: [100, 110] },
                    s: { a: 1, k: [{ t: 0, s: [100, 100] }, { t: 30, s: [102, 100] }, { t: 60, s: [100, 100] }] }
                },
                shapes: [
                    { ty: "rc", d: 1, s: { a: 0, k: [60, 55] }, p: { a: 0, k: [0, 5] }, r: { a: 0, k: 15 } },
                    { ty: "fl", c: { a: 0, k: [1, 0.85, 0.4] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [10, 12] }, p: { a: 0, k: [-12, -8] } },
                    { ty: "fl", c: { a: 0, k: [0.1, 0.1, 0.1] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [10, 12] }, p: { a: 0, k: [12, -8] } },
                    { ty: "fl", c: { a: 0, k: [0.1, 0.1, 0.1] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [5, 3] }, p: { a: 0, k: [0, 15] } },
                    { ty: "fl", c: { a: 0, k: [1, 0.5, 0.5] }, o: { a: 0, k: 100 } }
                ]
            },
            {
                ddd: 0, ind: 2, ty: 4, nm: "Tail",
                sr: 1,
                ks: {
                    o: { a: 0, k: 100 },
                    r: { a: 1, k: [{ t: 0, s: 20 }, { t: 25, s: -15 }, { t: 50, s: 20 }, { t: 60, s: 20 }] },
                    p: { a: 0, k: [115, 105] },
                    s: { a: 0, k: [30, 8] }
                },
                shapes: [
                    { ty: "rc", d: 1, s: { a: 0, k: [30, 8] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 8 } },
                    { ty: "fl", c: { a: 0, k: [1, 0.8, 0.3] }, o: { a: 0, k: 100 } }
                ]
            }
        ]
    }
};

// Кэш для созданных анимаций
const instances = {};

/**
 * Создать Lottie-анимацию в контейнере
 * @param {string} containerId - id HTML-элемента
 * @param {string} animName - ключ анимации из ANIMATIONS
 * @param {object} options - { loop, autoplay, speed }
 */
export function createLottie(containerId, animName, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const animData = ANIMATIONS[animName];
    if (!animData) return null;

    // Останавливаем предыдущую анимацию в этом контейнере
    if (instances[containerId]) {
        instances[containerId].destroy();
    }

    const instance = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: options.loop !== false,
        autoplay: options.autoplay !== false,
        animationData: animData
    });

    if (options.speed) {
        instance.setSpeed(options.speed);
    }

    instances[containerId] = instance;
    return instance;
}

/**
 * Проиграть анимацию ачивки поверх экрана
 */
export function playAchievementAnimation() {
    // Создаём временный контейнер
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:800;pointer-events:none;';
    overlay.id = 'achievement-overlay';
    document.body.appendChild(overlay);

    const container = document.createElement('div');
    container.style.cssText = 'width:180px;height:180px;';
    overlay.appendChild(container);

    const instance = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: ANIMATIONS.achievement
    });

    instance.addEventListener('complete', () => {
        setTimeout(() => overlay.remove(), 300);
    });
}

/**
 * Проиграть фейерверк при завершении урока
 */
export function playFireworkAnimation() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:800;pointer-events:none;';
    overlay.id = 'firework-overlay';
    document.body.appendChild(overlay);

    const container = document.createElement('div');
    container.style.cssText = 'width:280px;height:280px;';
    overlay.appendChild(container);

    const instance = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: ANIMATIONS.firework
    });

    instance.addEventListener('complete', () => {
        setTimeout(() => overlay.remove(), 500);
    });
}

/**
 * Показать кота-загрузку
 */
export function showLoadingCat(containerId) {
    return createLottie(containerId, 'loading', { loop: true });
}

/**
 * Показать ждущего кота (пустой экран)
 */
export function showWaitingCat(containerId) {
    return createLottie(containerId, 'waiting', { loop: true, speed: 0.8 });
}
