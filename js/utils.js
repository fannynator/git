export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => parent.querySelectorAll(selector);

export const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

export const showToast = (emoji, message, toastEl) => {
    toastEl.innerHTML = `<span>${emoji}</span> ${message}`;
    toastEl.classList.add('show');
    clearTimeout(toastEl._tid);
    toastEl._tid = setTimeout(() => toastEl.classList.remove('show'), 2000);
};

export const makeWrongs = (correct, count = 3) => {
    const wrongs = new Set();
    while (wrongs.size < count) {
        const candidate = correct + rnd(-8, 8);
        if (candidate !== correct && candidate >= 0 && !wrongs.has(candidate)) wrongs.add(candidate);
    }
    return [...wrongs];
};

export const choiceT = (emoji, badge, badgeClass, question, correct, explanation) => {
    const options = shuffle([correct, ...makeWrongs(correct)]);
    return { type: 'choice', emoji, badge, badgeClass, question, options, correctIdx: options.indexOf(correct), correctAns: correct, explanation };
};

export const inputT = (emoji, badge, badgeClass, question, correct, explanation) => {
    return { type: 'input', emoji, badge, badgeClass, question, correctAns: correct, explanation };
};

export const pairT = (emoji, badge, badgeClass, question, pairs, explanation) => {
    return { type: 'pair', emoji, badge, badgeClass, question, pairs, explanation };
};