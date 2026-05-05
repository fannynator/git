// js/lottie.js

const ANIMATIONS = {
    cat: {
        v: "5.12.1", fr: 30, ip: 0, op: 60, w: 200, h: 200, nm: "Cat", ddd: 0, assets: [],
        layers: [{
            ddd: 0, ind: 1, ty: 4, nm: "Face", sr: 1,
            ks: {
                o: { a: 0, k: 100 }, r: { a: 0, k: 0 },
                p: { a: 0, k: [100, 100] },
                s: { a: 1, k: [{ t: 0, s: [100, 100] }, { t: 30, s: [105, 95] }, { t: 60, s: [100, 100] }] }
            },
            shapes: [{
                ty: "gr", it: [
                    { ty: "el", s: { a: 0, k: [160, 140] }, p: { a: 0, k: [0, 10] } },
                    { ty: "fl", c: { a: 0, k: [1, 0.6, 0.1] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [50, 55] }, p: { a: 0, k: [-55, -55] } },
                    { ty: "fl", c: { a: 0, k: [1, 0.5, 0.05] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [50, 55] }, p: { a: 0, k: [55, -55] } },
                    { ty: "fl", c: { a: 0, k: [1, 0.5, 0.05] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [30, 35] }, p: { a: 0, k: [-30, 0] } },
                    { ty: "fl", c: { a: 0, k: [1, 1, 1] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [30, 35] }, p: { a: 0, k: [30, 0] } },
                    { ty: "fl", c: { a: 0, k: [1, 1, 1] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [14, 16] }, p: { a: 0, k: [-28, 2] } },
                    { ty: "fl", c: { a: 0, k: [0.1, 0.1, 0.1] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [14, 16] }, p: { a: 0, k: [32, 2] } },
                    { ty: "fl", c: { a: 0, k: [0.1, 0.1, 0.1] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [12, 8] }, p: { a: 0, k: [2, 25] } },
                    { ty: "fl", c: { a: 0, k: [1, 0.4, 0.6] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [8, 5] }, p: { a: 0, k: [-6, 35] } },
                    { ty: "fl", c: { a: 0, k: [0.8, 0.3, 0.3] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [8, 5] }, p: { a: 0, k: [10, 35] } },
                    { ty: "fl", c: { a: 0, k: [0.8, 0.3, 0.3] }, o: { a: 0, k: 100 } }
                ]
            }]
        }]
    },
    achievement: {
        v: "5.12.1", fr: 30, ip: 0, op: 45, w: 200, h: 200, nm: "Achievement", ddd: 0, assets: [],
        layers: [{
            ddd: 0, ind: 1, ty: 4, nm: "Star", sr: 1,
            ks: {
                o: { a: 1, k: [{ t: 0, s: [0] }, { t: 10, s: [100] }, { t: 45, s: [100] }] },
                r: { a: 1, k: [{ t: 0, s: [-90] }, { t: 25, s: [0] }] },
                p: { a: 0, k: [100, 100] },
                s: { a: 1, k: [{ t: 0, s: [0, 0] }, { t: 15, s: [130, 130] }, { t: 30, s: [100, 100] }] }
            },
            shapes: [
                { ty: "sr", sy: 5, pt: 5, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 60 }, or: { a: 0, k: 60 }, os: { a: 0, k: 0 }, is: { a: 0, k: 30 }, ir: { a: 0, k: 30 } },
                { ty: "fl", c: { a: 0, k: [1, 0.85, 0.1] }, o: { a: 0, k: 100 } },
                { ty: "st", c: { a: 0, k: [1, 0.6, 0] }, w: { a: 0, k: 3 }, o: { a: 0, k: 100 } }
            ]
        }]
    },
    firework: {
        v: "5.12.1", fr: 30, ip: 0, op: 45, w: 300, h: 300, nm: "Firework", ddd: 0, assets: [],
        layers: [
            { ddd: 0, ind: 1, ty: 4, nm: "B1", sr: 1, ks: { o: { a: 1, k: [{ t: 0, s: [100] }, { t: 40, s: [0] }] }, p: { a: 0, k: [150, 150] }, s: { a: 1, k: [{ t: 0, s: [0, 0] }, { t: 15, s: [180, 180] }] } }, shapes: [{ ty: "sr", sy: 8, pt: 8, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 80 }, or: { a: 0, k: 80 }, os: { a: 0, k: 10 }, is: { a: 0, k: 65 }, ir: { a: 0, k: 65 } }, { ty: "fl", c: { a: 0, k: [1, 0.7, 0] }, o: { a: 0, k: 80 } }] },
            { ddd: 0, ind: 2, ty: 4, nm: "B2", sr: 1, ks: { o: { a: 1, k: [{ t: 5, s: [100] }, { t: 45, s: [0] }] }, p: { a: 0, k: [150, 150] }, s: { a: 1, k: [{ t: 5, s: [0, 0] }, { t: 20, s: [140, 140] }] } }, shapes: [{ ty: "sr", sy: 6, pt: 6, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 50 }, or: { a: 0, k: 50 }, os: { a: 0, k: 30 }, is: { a: 0, k: 50 }, ir: { a: 0, k: 50 } }, { ty: "fl", c: { a: 0, k: [0.3, 0.8, 1] }, o: { a: 0, k: 80 } }] },
            { ddd: 0, ind: 3, ty: 4, nm: "B3", sr: 1, ks: { o: { a: 1, k: [{ t: 10, s: [100] }, { t: 45, s: [0] }] }, p: { a: 0, k: [150, 150] }, s: { a: 1, k: [{ t: 10, s: [0, 0] }, { t: 25, s: [100, 100] }] } }, shapes: [{ ty: "sr", sy: 5, pt: 5, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 40 }, or: { a: 0, k: 40 }, os: { a: 0, k: 40 }, is: { a: 0, k: 40 }, ir: { a: 0, k: 40 } }, { ty: "fl", c: { a: 0, k: [0.2, 1, 0.5] }, o: { a: 0, k: 80 } }] }
        ]
    },
    waiting: {
        v: "5.12.1", fr: 30, ip: 0, op: 60, w: 200, h: 200, nm: "Waiting", ddd: 0, assets: [],
        layers: [{
            ddd: 0, ind: 1, ty: 4, nm: "Cat", sr: 1,
            ks: {
                o: { a: 0, k: 100 }, r: { a: 1, k: [{ t: 0, s: [0] }, { t: 40, s: [5] }, { t: 60, s: [0] }] },
                p: { a: 0, k: [100, 105] },
                s: { a: 1, k: [{ t: 0, s: [100, 100] }, { t: 30, s: [102, 98] }, { t: 60, s: [100, 100] }] }
            },
            shapes: [{
                ty: "gr", it: [
                    { ty: "el", s: { a: 0, k: [120, 100] }, p: { a: 0, k: [0, 10] } },
                    { ty: "fl", c: { a: 0, k: [1, 0.85, 0.4] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [10, 12] }, p: { a: 0, k: [-20, 0] } },
                    { ty: "fl", c: { a: 0, k: [0.1, 0.1, 0.1] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [10, 12] }, p: { a: 0, k: [20, 0] } },
                    { ty: "fl", c: { a: 0, k: [0.1, 0.1, 0.1] }, o: { a: 0, k: 100 } },
                    { ty: "el", s: { a: 0, k: [8, 4] }, p: { a: 0, k: [0, 18] } },
                    { ty: "fl", c: { a: 0, k: [1, 0.5, 0.5] }, o: { a: 0, k: 100 } }
                ]
            }]
        }]
    }
};

const instances = {};

export function createLottie(containerId, animName, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const animData = ANIMATIONS[animName];
    if (!animData) return null;

    if (instances[containerId]) instances[containerId].destroy();

    try {
        const instance = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: options.loop !== false,
            autoplay: options.autoplay !== false,
            animationData: animData
        });
        if (options.speed) instance.setSpeed(options.speed);
        instances[containerId] = instance;
        return instance;
    } catch (e) { return null; }
}

export function playAchievementAnimation() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:800;pointer-events:none;';
    document.body.appendChild(overlay);
    const container = document.createElement('div');
    container.style.cssText = 'width:180px;height:180px;';
    overlay.appendChild(container);
    const instance = lottie.loadAnimation({ container, renderer: 'svg', loop: false, autoplay: true, animationData: ANIMATIONS.achievement });
    instance.addEventListener('complete', () => setTimeout(() => overlay.remove(), 300));
}

export function playFireworkAnimation() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:800;pointer-events:none;';
    document.body.appendChild(overlay);
    const container = document.createElement('div');
    container.style.cssText = 'width:280px;height:280px;';
    overlay.appendChild(container);
    const instance = lottie.loadAnimation({ container, renderer: 'svg', loop: false, autoplay: true, animationData: ANIMATIONS.firework });
    instance.addEventListener('complete', () => setTimeout(() => overlay.remove(), 500));
}

export function showWaitingCat(containerId) {
    return createLottie(containerId, 'waiting', { loop: true, speed: 0.8 });
}
