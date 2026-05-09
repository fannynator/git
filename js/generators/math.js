// js/generators/math.js

import { rnd, shuffle, makeWrongs, choiceT, inputT, pairT, visualT, orderingT, bossT, adaptiveRange, gcd, lcm, trimLesson } from '../utils.js';

// ═══════════════════════════════════════════════
//  SVG-заготовки
// ═══════════════════════════════════════════════

function applesSVG(count, color = '#EF4444') {
    const rows = Math.ceil(count / 5);
    const perRow = Math.min(count, 5);
    let circles = '';
    for (let r = 0; r < rows; r++) {
        const inRow = r === rows - 1 ? (count % 5 || 5) : 5;
        for (let c = 0; c < inRow; c++) {
            const cx = 20 + c * 28 + (rows > 1 && r === rows - 1 ? (5 - inRow) * 14 : 0);
            const cy = 25 + r * 32;
            circles += `<circle cx="${cx}" cy="${cy}" r="11" fill="${color}" stroke="#B91C1C" stroke-width="1.5"/>
            <line x1="${cx - 4}" y1="${cy - 5}" x2="${cx + 1}" y2="${cy - 9}" stroke="#7F1D1D" stroke-width="2" stroke-linecap="round"/>`;
        }
    }
    const h = Math.max(60, rows * 32 + 16);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 ${h}" width="150" height="${h}">${circles}</svg>`;
}

function applesTwoGroups(a, b) {
    const svgA = applesSVG(a, '#EF4444');
    const svgB = applesSVG(b, '#F59E0B');
    // Simple side-by-side via a wrapper div is easier, but for inline SVG we compose
    const rowsA = Math.ceil(a / 5); const perRowA = Math.min(a, 5);
    const rowsB = Math.ceil(b / 5); const perRowB = Math.min(b, 5);
    const H = Math.max(rowsA, rowsB) * 32 + 30;
    let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 ${H}" width="300" height="${H}">`;
    // group A label
    out += `<text x="75" y="14" text-anchor="middle" font-size="11" fill="#94A3B8" font-weight="700">🍎 группа А</text>`;
    for (let r = 0; r < rowsA; r++) {
        const inRow = r === rowsA - 1 ? (a % 5 || 5) : 5;
        for (let c = 0; c < inRow; c++) {
            const cx = 35 + c * 28 + (rowsA > 1 && r === rowsA - 1 ? (5 - inRow) * 14 : 0);
            const cy = 30 + r * 32;
            out += `<circle cx="${cx}" cy="${cy}" r="11" fill="#EF4444" stroke="#B91C1C" stroke-width="1.5"/>
            <line x1="${cx - 4}" y1="${cy - 5}" x2="${cx + 1}" y2="${cy - 9}" stroke="#7F1D1D" stroke-width="2" stroke-linecap="round"/>`;
        }
    }
    // group B label
    out += `<text x="225" y="14" text-anchor="middle" font-size="11" fill="#94A3B8" font-weight="700">🍎 группа Б</text>`;
    for (let r = 0; r < rowsB; r++) {
        const inRow = r === rowsB - 1 ? (b % 5 || 5) : 5;
        for (let c = 0; c < inRow; c++) {
            const cx = 185 + c * 28 + (rowsB > 1 && r === rowsB - 1 ? (5 - inRow) * 14 : 0);
            const cy = 30 + r * 32;
            out += `<circle cx="${cx}" cy="${cy}" r="11" fill="#F59E0B" stroke="#D97706" stroke-width="1.5"/>
            <line x1="${cx - 4}" y1="${cy - 5}" x2="${cx + 1}" y2="${cy - 9}" stroke="#92400E" stroke-width="2" stroke-linecap="round"/>`;
        }
    }
    out += '</svg>';
    return out;
}

function subSVG(total, eaten) {
    const H = Math.ceil(total / 5) * 32 + 30;
    let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 ${H}" width="280" height="${H}">`;
    out += `<text x="140" y="14" text-anchor="middle" font-size="11" fill="#94A3B8" font-weight="700">Было ${total} 🍎</text>`;
    for (let r = 0; r < Math.ceil(total / 5); r++) {
        const inRow = r === Math.ceil(total / 5) - 1 ? (total % 5 || 5) : 5;
        for (let c = 0; c < (r < Math.ceil(total / 5) - 1 ? 5 : inRow); c++) {
            const idx = r * 5 + c;
            const cx = 40 + c * 36;
            const cy = 30 + r * 32;
            const isEaten = idx < eaten;
            const fill = isEaten ? '#E2E8F0' : '#EF4444';
            const stroke = isEaten ? '#CBD5E1' : '#B91C1C';
            out += `<circle cx="${cx}" cy="${cy}" r="11" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="${isEaten ? '3 2' : 'none'}"/>`;
            if (isEaten) {
                out += `<line x1="${cx - 5}" y1="${cy - 5}" x2="${cx + 5}" y2="${cy + 5}" stroke="#CBD5E1" stroke-width="2"/>
                <line x1="${cx + 5}" y1="${cy - 5}" x2="${cx - 5}" y2="${cy + 5}" stroke="#CBD5E1" stroke-width="2"/>`;
            } else {
                out += `<line x1="${cx - 4}" y1="${cy - 5}" x2="${cx + 1}" y2="${cy - 9}" stroke="#7F1D1D" stroke-width="2" stroke-linecap="round"/>`;
            }
        }
    }
    out += '</svg>';
    return out;
}

function mulGridSVG(rows, cols) {
    const cellW = cols <= 8 ? 32 : Math.max(20, Math.floor(280 / cols));
    const cellH = 28;
    const W = Math.max(100, cols * cellW + 20);
    const H = rows * cellH + 30;
    let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    out += `<text x="${W / 2}" y="14" text-anchor="middle" font-size="11" fill="#94A3B8" font-weight="700">${rows} ряда × ${cols} 🍎</text>`;
    const r = cols <= 8 ? 10 : Math.max(5, Math.floor(cellW / 3));
    for (let row = 0; row < rows; row++) {
        for (let c = 0; c < cols; c++) {
            const cxc = 14 + c * cellW + cellW / 2;
            const cy = 28 + row * cellH;
            out += `<circle cx="${cxc}" cy="${cy}" r="${r}" fill="#F59E0B" stroke="#D97706" stroke-width="1.2"/>`;
            out += `<line x1="${cxc - r * 0.3}" y1="${cy - r * 0.4}" x2="${cxc + r * 0.1}" y2="${cy - r * 0.8}" stroke="#92400E" stroke-width="${Math.max(1, r / 5)}" stroke-linecap="round"/>`;
        }
    }
    out += '</svg>';
    return out;
}

function divBasketsSVG(total, baskets) {
    const perBasket = Math.floor(total / baskets);
    const rem = total - perBasket * baskets;
    const W = baskets * 60 + 20;
    const H = (perBasket + (rem > 0 ? 1 : 0)) * 22 + 80;
    let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    out += `<text x="${W / 2}" y="12" text-anchor="middle" font-size="10" fill="#94A3B8" font-weight="700">${total} 🍎 в ${baskets} корзинах</text>`;
    for (let b = 0; b < baskets; b++) {
        const bx = 14 + b * 60;
        // basket
        out += `<path d="M${bx} 40 L${bx + 10} ${H - 16} L${bx + 38} ${H - 16} L${bx + 48} 40 Z" fill="#D4A373" stroke="#B8845A" stroke-width="1.5"/>`;
        // apples in basket
        const count = b < rem ? perBasket + 1 : perBasket;
        for (let a = 0; a < count; a++) {
            const ax = bx + 14 + (a % 3) * 16;
            const ay = H - 28 - Math.floor(a / 3) * 18;
            out += `<circle cx="${ax}" cy="${ay}" r="5" fill="#EF4444" stroke="#B91C1C" stroke-width="0.8"/>`;
        }
    }
    out += '</svg>';
    return out;
}

function eqScaleSVG(leftExpr, rightVal) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" width="240" height="100">
        <polygon points="120,15 135,30 105,30" fill="#94A3B8"/>
        <line x1="120" y1="30" x2="120" y2="50" stroke="#94A3B8" stroke-width="3"/>
        <line x1="30" y1="50" x2="210" y2="50" stroke="#64748B" stroke-width="4" stroke-linecap="round"/>
        <circle cx="120" cy="50" r="4" fill="#64748B"/>
        <!-- left cup -->
        <path d="M40 50 L50 70 L90 70 L100 50 Z" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5"/>
        <text x="70" y="63" text-anchor="middle" font-size="14" fill="#1E293B" font-weight="800">${leftExpr}</text>
        <!-- right cup -->
        <path d="M140 50 L150 70 L190 70 L200 50 Z" fill="#FEF3C7" stroke="#FBBF24" stroke-width="1.5"/>
        <text x="170" y="63" text-anchor="middle" font-size="14" fill="#92400E" font-weight="800">?</text>
    </svg>`;
    return svg;
}

function geomRectSVG(w, h, label) {
    const scale = Math.min(200 / w, 120 / h, 30);
    const rw = w * scale;
    const rh = h * scale;
    const W = rw + 40;
    const H = rh + 50;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <rect x="20" y="25" width="${rw}" height="${rh}" fill="#DBEAFE" stroke="#3B82F6" stroke-width="2"/>
        <text x="${20 + rw / 2}" y="20" text-anchor="middle" font-size="11" fill="#3B82F6" font-weight="700">${w}</text>
        <text x="${rw + 28}" y="${25 + rh / 2}" font-size="11" fill="#3B82F6" font-weight="700">${h}</text>
        <text x="${20 + rw / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="#3B82F6" font-weight="700">${label}</text>
    </svg>`;
    return svg;
}

function pizzaSVG(eaten, total) {
    const slices = [];
    for (let i = 0; i < total; i++) {
        const fromAngle = (i / total) * 360;
        const toAngle = ((i + 1) / total) * 360;
        const fromRad = (fromAngle - 90) * Math.PI / 180;
        const toRad = (toAngle - 90) * Math.PI / 180;
        const x1 = 100 + 70 * Math.cos(fromRad);
        const y1 = 100 + 70 * Math.sin(fromRad);
        const x2 = 100 + 70 * Math.cos(toRad);
        const y2 = 100 + 70 * Math.sin(toRad);
        const eatenSlice = i < eaten;
        slices.push(`<path d="M100 100 L${x1} ${y1} A70 70 0 0 1 ${x2} ${y2} Z" fill="${eatenSlice ? '#E2E8F0' : '#F59E0B'}" stroke="#92400E" stroke-width="1.5"/>`);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        ${slices.join('')}
        <text x="100" y="190" text-anchor="middle" font-size="12" fill="#94A3B8" font-weight="700">Съедено ${eaten} из ${total}</text>
    </svg>`;
    return svg;
}

// ═══════════════════════════════════════════════
//  ГЕНЕРАТОРЫ УРОКОВ (8 шагов каждый)
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════
//  СЛОЖЕНИЕ
// ═══════════════════════════════════════
export function generateAddLesson() {
    const t = [];
    const add = (a, b) => a + b;
    const DIFF_STEP = 5; // увеличение верхней границы на 5 за уровень

    // 1. Разминка
    {
        const [minA, maxA] = adaptiveRange(3, 15, DIFF_STEP);
        const [minB, maxB] = adaptiveRange(3, 15, DIFF_STEP);
        const [a, b] = [rnd(minA, maxA), rnd(minB, maxB)];
        t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${a} + ${b} = ?`, add(a, b), 'Просто складываем два числа'));
    }
    // 2. Визуальное — две группы яблок
    {
        const [minA, maxA] = adaptiveRange(3, 7, 2);
        const [minB, maxB] = adaptiveRange(3, 7, 2);
        const [a, b] = [rnd(minA, maxA), rnd(minB, maxB)];
        const svg = applesTwoGroups(a, b);
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual', svg, `Сколько всего яблок?`, add(a, b), makeWrongs(add(a, b)), `${a} красных + ${b} жёлтых = ${add(a, b)}`));
    }
    // 3. Выбор
    {
        const [minA, maxA] = adaptiveRange(10, 40, DIFF_STEP);
        const [minB, maxB] = adaptiveRange(10, 40, DIFF_STEP);
        const [a, b] = [rnd(minA, maxA), rnd(minB, maxB)];
        t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${a} + ${b} = ?`, add(a, b), `Складываем: ${a} + ${b}`));
    }
    // 4. Парное
    {
        const pd = []; const used = new Set();
        const [pMin, pMax] = adaptiveRange(5, 30, DIFF_STEP);
        while (pd.length < 3) {
            const [a, b] = [rnd(pMin, pMax), rnd(pMin, pMax)];
            const ans = add(a, b);
            if (!used.has(ans)) { used.add(ans); pd.push({ left: `${a} + ${b}`, right: `${ans}`, answer: ans }); }
        }
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини выражение с ответом:', pd, 'Сопоставляем суммы'));
    }
    // 5. Ввод
    {
        const [minA, maxA] = adaptiveRange(15, 60, DIFF_STEP * 2);
        const [minB, maxB] = adaptiveRange(10, 40, DIFF_STEP);
        const [a, b] = [rnd(minA, maxA), rnd(minB, maxB)];
        t.push(inputT('✏️', 'Ввод', 'badge-input', `${a} + ${b} = ?`, add(a, b), `${a} + ${b} = ${add(a, b)}`));
    }
    // 6. Ловушка хитрая
    {
        const [sMin, sMax] = adaptiveRange(10, 30, DIFF_STEP);
        const secret = rnd(sMin, sMax);
        t.push(choiceT('⚠️', 'Ловушка', 'badge-trap',
            `Если у Маши ${secret} конфет, а Петя дал ей ещё 0, сколько стало?`,
            secret,
            'Если прибавить 0 — ничего не меняется! Не дай себя обмануть'));
    }
    // 7. Ввод сложнее
    {
        const [minA, maxA] = adaptiveRange(10, 30, DIFF_STEP);
        const [a, b, c] = [rnd(minA, maxA), rnd(minA, maxA), rnd(minA, maxA)];
        t.push(inputT('✏️', 'Ввод', 'badge-input',
            `${a} + ${b} + ${c} = ?`, add(add(a, b), c),
            `${a}+${b}=${add(a,b)}, +${c}=${add(add(a,b),c)}`));
    }
    // 8. Босс — 3 подзадания
    {
        const [bMin1, bMax1] = adaptiveRange(2, 8, 2);
        const a1 = rnd(bMin1, bMax1), b1 = rnd(bMin1, bMax1);
        const [bMin2, bMax2] = adaptiveRange(10, 30, DIFF_STEP);
        const a2 = rnd(bMin2, bMax2), a3 = rnd(1, a2 - 1);
        const [bMin3, bMax3] = adaptiveRange(10, 50, DIFF_STEP);
        const [pMinB, pMaxB] = adaptiveRange(5, 20, DIFF_STEP);
        const a4 = rnd(bMin3, bMax3), a5 = rnd(pMinB, pMaxB), a6 = rnd(5, 15);
        t.push(bossT('⭐', 'Босс', 'badge-boss', 'Реши несколько задач на сложение:', [
            { label: `${a1} + ${b1}`, correctAns: add(a1, b1), hint: `Складываем: ${a1} + ${b1} = ${add(a1, b1)}` },
            { label: `${a2} + ${a3}`, correctAns: add(a2, a3), hint: `${a2} + ${a3} = ${add(a2, a3)}` },
            { label: `${a4} + ${a5} + ${a6}`, correctAns: add(add(a4, a5), a6), hint: `${a4}+${a5}=${add(a4,a5)}, +${a6}=${add(add(a4,a5),a6)}` }
        ], 'Сложение — это объединение!'));
    }
    return t;
}

// ═══════════════════════════════════════
//  ВЫЧИТАНИЕ
// ═══════════════════════════════════════
export function generateSubLesson() {
    const t = [];
    const D = 5; // шаг увеличения за уровень сложности
    const g = () => {
        const [minX, maxX] = adaptiveRange(15, 50, D);
        const x = rnd(minX, maxX);
        const ymax = Math.max(3, x - 3);
        const y = rnd(3, ymax);
        return [x, y];
    };
    const sub = (a, b) => a - b;

    // 1. Разминка
    {
        const [a, b] = g();
        t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${a} − ${b} = ?`, sub(a, b), 'Вычитаем меньшее из большего'));
    }
    // 2. Визуальное — яблоки, часть съедена
    {
        const [minT, maxT] = adaptiveRange(8, 15, 2);
        const total = rnd(minT, maxT);
        const eaten = rnd(2, total - 2);
        const svg = subSVG(total, eaten);
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual', svg,
            `Сколько яблок осталось?`, total - eaten,
            makeWrongs(total - eaten),
            `Было ${total}, съели ${eaten} → осталось ${total - eaten}`));
    }
    // 3. Выбор
    {
        const [a, b] = g();
        t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${a} − ${b} = ?`, sub(a, b), `${a} − ${b} = ${sub(a, b)}`));
    }
    // 4. Парное
    {
        const pd = []; const used = new Set();
        while (pd.length < 3) {
            const [a, b] = g();
            const ans = sub(a, b);
            if (!used.has(ans)) { used.add(ans); pd.push({ left: `${a} − ${b}`, right: `${ans}`, answer: ans }); }
        }
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини выражение с ответом:', pd, 'Сопоставляем разности'));
    }
    // 5. Ввод
    {
        const [a, b] = g();
        t.push(inputT('✏️', 'Ввод', 'badge-input', `${a} − ${b} = ?`, sub(a, b), `${a} − ${b} = ${sub(a, b)}`));
    }
    // 6. Ловушка хитрая
    {
        const [minN, maxN] = adaptiveRange(10, 25, D);
        const [minDec, maxDec] = adaptiveRange(3, 8, 1);
        const n = rnd(minN, maxN);
        const decoy = rnd(minDec, maxDec);
        t.push(choiceT('⚠️', 'Ловушка', 'badge-trap',
            `${n} − ${decoy} + ${decoy} = ?`,
            n,
            `Сначала вычли ${decoy}, потом прибавили — вернулись к ${n}! Порядок действий важен`));
    }
    // 7. Ввод сложнее
    {
        const [minM, maxM] = adaptiveRange(40, 90, D * 2);
        const [minBk, maxBk] = adaptiveRange(10, 25, D);
        const [minPn, maxPn] = adaptiveRange(5, 12, 2);
        const [money, book, pen] = [rnd(minM, maxM), rnd(minBk, maxBk), rnd(minPn, maxPn)];
        const ans7 = money - book - pen;
        t.push(inputT('✏️', 'Ввод', 'badge-input',
            `У Маши ${money} руб. Купила книгу за ${book} руб. и ручку за ${pen} руб. Осталось?`,
            ans7,
            `${money} − ${book} − ${pen} = ${ans7}`));
    }
    // 8. Босс — 3 подзадания
    {
        const [minA1, maxA1] = adaptiveRange(30, 80, D);
        const a1 = rnd(minA1, maxA1), b1 = rnd(10, a1 - 5);
        const [minA2, maxA2] = adaptiveRange(40, 100, D * 2);
        const a2 = rnd(minA2, maxA2), b2 = rnd(5, 20), c2 = rnd(5, 15);
        const [minA3, maxA3] = adaptiveRange(20, 60, D);
        const a3 = rnd(minA3, maxA3), b3 = rnd(5, a3 - 5);
        t.push(bossT('⭐', 'Босс', 'badge-boss', 'Реши задачи на вычитание:', [
            { label: `${a1} − ${b1}`, correctAns: a1 - b1, hint: `${a1} − ${b1} = ${a1 - b1}` },
            { label: `Было ${a2}₽, купил за ${b2}₽, потом нашёл ${c2}₽. Сколько?`, correctAns: a2 - b2 + c2, hint: `${a2}−${b2}=${a2-b2}, +${c2}=${a2-b2+c2}` },
            { label: `Из ${a3} вычти ${b3}`, correctAns: a3 - b3, hint: `${a3} − ${b3} = ${a3 - b3}` }
        ], 'Вычитание — обратное сложению!'));
    }
    return t;
}

// ═══════════════════════════════════════
//  УМНОЖЕНИЕ
// ═══════════════════════════════════════
export function generateMulLesson() {
    const t = [];
    const D = 2;
    const g = () => {
        const [minA, maxA] = adaptiveRange(2, 10, D);
        return [rnd(minA, maxA), rnd(minA, maxA)];
    };
    const mul = (a, b) => a * b;

    // 1. Разминка
    {
        const [a, b] = g();
        t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${a} × ${b} = ?`, mul(a, b), 'Умножаем — это как сложить b раз число a'));
    }
    // 2. Визуальное — сетка
    {
        const [minR, maxR] = adaptiveRange(2, 5, 1);
        const [minC, maxC] = adaptiveRange(3, 6, 1);
        const [rows, cols] = [rnd(minR, maxR), rnd(minC, maxC)];
        const svg = mulGridSVG(rows, cols);
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual', svg,
            `Сколько всего яблок?`, mul(rows, cols),
            makeWrongs(mul(rows, cols)),
            `${rows} ряда × ${cols} в ряду = ${mul(rows, cols)}`));
    }
    // 3. Выбор
    {
        const [a, b] = g();
        t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${a} × ${b} = ?`, mul(a, b), `${a} × ${b} = ${mul(a, b)}`));
    }
    // 4. Парное
    {
        const pd = []; const used = new Set();
        while (pd.length < 3) {
            const [a, b] = g();
            const ans = mul(a, b);
            if (!used.has(ans)) { used.add(ans); pd.push({ left: `${a} × ${b}`, right: `${ans}`, answer: ans }); }
        }
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини выражение с ответом:', pd, 'Сопоставляем произведения'));
    }
    // 5. Ввод
    {
        const [a, b] = g();
        t.push(inputT('✏️', 'Ввод', 'badge-input', `${a} × ${b} = ?`, mul(a, b), `${a} × ${b} = ${mul(a, b)}`));
    }
    // 6. Ловушка хитрая
    {
        const n = rnd(3, 9);
        t.push(choiceT('⚠️', 'Ловушка', 'badge-trap',
            `${n} × 1 × 1 × 1 = ?`,
            n,
            `Умножать на 1 можно сколько угодно — число не изменится! ${n} × 1 = ${n}`));
    }
    // 7. Ввод сложнее
    {
        const [minA, maxA] = adaptiveRange(2, 6, 1);
        const [a, b, c] = [rnd(minA, maxA), rnd(minA, maxA), rnd(2, 5)];
        t.push(inputT('✏️', 'Ввод', 'badge-input',
            `${a} × ${b} × ${c} = ?`,
            mul(mul(a, b), c),
            `${a}×${b}=${mul(a,b)}, ×${c}=${mul(mul(a,b),c)}`));
    }
    // 8. Босс — 3 подзадания
    {
        const [minA1, maxA1] = adaptiveRange(2, 9, D);
        const a1 = rnd(minA1, maxA1), b1 = rnd(minA1, maxA1);
        const a2 = rnd(3, 8), b2 = rnd(4, 12);
        const [minA3, maxA3] = adaptiveRange(2, 6, 1);
        const a3 = rnd(minA3, maxA3), b3 = rnd(minA3, maxA3), c3 = rnd(2, 5);
        t.push(bossT('⭐', 'Босс', 'badge-boss', 'Покажи, как ты умножаешь:', [
            { label: `${a1} × ${b1}`, correctAns: mul(a1, b1), hint: `${a1} × ${b1} = ${mul(a1, b1)}` },
            { label: `${a2} полок × ${b2} книг`, correctAns: mul(a2, b2), hint: `${a2} × ${b2} = ${mul(a2, b2)} книг` },
            { label: `${a3} × ${b3} × ${c3}`, correctAns: mul(mul(a3, b3), c3), hint: `${a3}×${b3}=${mul(a3,b3)}, ×${c3}=${mul(mul(a3,b3),c3)}` }
        ], 'Умножение — это быстрое сложение!'));
    }
    return t;
}

// ═══════════════════════════════════════
//  ДЕЛЕНИЕ
// ═══════════════════════════════════════
export function generateDivLesson() {
    const t = [];
    const D = 2;
    const g = () => {
        const [minB, maxB] = adaptiveRange(2, 8, D);
        const b = rnd(minB, maxB);
        const c = rnd(minB, maxB);
        return [b * c, b];
    };
    const div = (a, b) => a / b;

    // 1. Разминка
    {
        const [a, b] = g();
        t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `${a} ÷ ${b} = ?`, div(a, b), 'Делим поровну'));
    }
    // 2. Визуальное — корзины
    {
        const total = rnd(8, 20);
        const baskets = rnd(2, 4);
        const svg = divBasketsSVG(total, baskets);
        const perBasket = Math.floor(total / baskets);
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual', svg,
            `Сколько яблок в одной корзине?`, perBasket,
            [...new Set([perBasket, perBasket + 1, perBasket - 1, total])],
            `${total} ÷ ${baskets} = ${perBasket} (остаток ${total - perBasket * baskets})`));
    }
    // 3. Выбор
    {
        const [a, b] = g();
        t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${a} ÷ ${b} = ?`, div(a, b), `${a} ÷ ${b} = ${div(a, b)}`));
    }
    // 4. Парное
    {
        const pd = []; const used = new Set();
        while (pd.length < 3) {
            const b = rnd(2, 7); const c = rnd(2, 7); const a = b * c;
            if (!used.has(c)) { used.add(c); pd.push({ left: `${a} ÷ ${b}`, right: `${c}`, answer: c }); }
        }
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини выражение с ответом:', pd, 'Сопоставляем частные'));
    }
    // 5. Ввод
    {
        const [a, b] = g();
        t.push(inputT('✏️', 'Ввод', 'badge-input', `${a} ÷ ${b} = ?`, div(a, b), `${a} ÷ ${b} = ${div(a, b)}`));
    }
    // 6. Ловушка хитрая
    {
        const n = rnd(5, 30);
        t.push(choiceT('⚠️', 'Ловушка', 'badge-trap',
            `${n} ÷ 1 = ?`,
            n,
            `Любое число делить на 1 — остаётся собой! ${n} ÷ 1 = ${n}`));
    }
    // 7. Ввод сложнее
    {
        const [a, b] = [rnd(20, 60), rnd(2, 6)];
        const ans7 = Math.floor(a / b);
        const rem7 = a - ans7 * b;
        t.push(inputT('✏️', 'Ввод', 'badge-input',
            `${a} ÷ ${b} = ? (только целая часть)`,
            ans7,
            `${a} ÷ ${b} = ${ans7} (остаток ${rem7})`));
    }
    // 8. Босс — 3 подзадания
    {
        const a1 = rnd(16, 56), a2 = rnd(2, 7);
        const a3 = rnd(12, 36), a4 = rnd(2, 5);
        const [candies, friends] = [rnd(20, 50), rnd(3, 7)];
        const per = Math.floor(candies / friends);
        const rem = candies - per * friends;
        t.push(bossT('⭐', 'Босс', 'badge-boss', 'Реши несколько задач на деление:', [
            { label: `${a1} ÷ ${a2}`, correctAns: Math.floor(a1 / a2), hint: `${a1} ÷ ${a2} = ${Math.floor(a1 / a2)}` },
            { label: `${a3} ÷ ${a4} (целая часть)`, correctAns: Math.floor(a3 / a4), hint: `${a3} ÷ ${a4} = ${Math.floor(a3 / a4)}` },
            { label: `${candies} конфет на ${friends} друзей. По сколько? (ост.${rem})`, correctAns: per, hint: `${candies} ÷ ${friends} = ${per} (ост.${rem})` }
        ], 'Деление — обратное умножению!'));
    }
    return t;
}

// ═══════════════════════════════════════
//  УРАВНЕНИЯ
// ═══════════════════════════════════════
export function generateEqLesson() {
    const t = [];

    // 1. Разминка
    {
        const x = rnd(2, 12); const a = rnd(1, 8);
        t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `x + ${a} = ${x + a}. x = ?`, x, `x = ${x + a} − ${a} = ${x}`));
    }
    // 2. Визуальное — весы
    {
        const x = rnd(2, 10); const a = rnd(1, 6);
        const svg = eqScaleSVG(`x + ${a}`, x + a);
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual', svg,
            `Чему равен x?`, x,
            makeWrongs(x),
            `На весах слева x + ${a}, справа ${x + a}. Значит x = ${x}`));
    }
    // 3. Выбор
    {
        const x = rnd(2, 10); const mul = rnd(2, 5);
        t.push(choiceT('🎯', 'Выбор', 'badge-choice', `${mul} × x = ${mul * x}. x = ?`, x, `x = ${mul * x} ÷ ${mul} = ${x}`));
    }
    // 4. Парное
    {
        const pd = []; const used = new Set();
        while (pd.length < 3) {
            const x = rnd(2, 10); const a = rnd(1, 6);
            const key = `x + ${a} = ${x + a}`;
            if (!used.has(x)) { used.add(x); pd.push({ left: key, right: `x = ${x}`, answer: x }); }
        }
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини уравнение с ответом:', pd, 'Решаем уравнения'));
    }
    // 5. Ввод
    {
        const x = rnd(2, 12); const a = rnd(2, 8);
        t.push(inputT('✏️', 'Ввод', 'badge-input', `x + ${a} = ${x + a}. x = ?`, x, `x = ${x + a} − ${a} = ${x}`));
    }
    // 6. Ловушка хитрая
    {
        const x = rnd(3, 10);
        t.push(choiceT('⚠️', 'Ловушка', 'badge-trap',
            `2 × x + 3 = ${2 * x + 3}. x = ?`,
            x,
            `Сначала отними 3: 2x = ${2 * x}, потом раздели на 2 → x = ${x}`));
    }
    // 7. Ввод сложнее
    {
        const x = rnd(2, 8); const mul = rnd(2, 5);
        t.push(inputT('✏️', 'Ввод', 'badge-input',
            `${mul} × x − 2 = ${mul * x - 2}. x = ?`,
            x,
            `Сначала +2: ${mul}x = ${mul * x}, потом ÷${mul} → x = ${x}`));
    }
    // 8. Босс — 3 подзадания
    {
        const x1 = rnd(3, 8), a1 = rnd(2, 5);
        const x2 = rnd(2, 7), m2 = rnd(2, 5);
        const x3 = rnd(3, 8);
        t.push(bossT('⭐', 'Босс', 'badge-boss', 'Реши уравнения:', [
            { label: `x + ${a1} = ${x1 + a1}. x = ?`, correctAns: x1, hint: `${x1 + a1} − ${a1} = ${x1}` },
            { label: `${m2} × x = ${m2 * x2}. x = ?`, correctAns: x2, hint: `${m2 * x2} ÷ ${m2} = ${x2}` },
            { label: `3 коробки + 2 яблока = ${3 * x3 + 2}. В коробке?`, correctAns: x3, hint: `${3 * x3 + 2} − 2 = ${3 * x3}, ÷3 = ${x3}` }
        ], 'Уравнения — как весы: что делаем с одной стороны, делаем с другой!'));
    }
    return t;
}

// ═══════════════════════════════════════
//  ГЕОМЕТРИЯ (периметр и площадь)
// ═══════════════════════════════════════
export function generateGeomLesson() {
    const t = [];
    const rect = () => [rnd(3, 8), rnd(3, 8)];
    const sq = () => rnd(3, 7);

    // 1. Разминка
    {
        const s = sq();
        t.push(choiceT('🔥', 'Разминка', 'badge-warmup', `Квадрат со стороной ${s}. Периметр?`, 4 * s, `P = 4 × ${s} = ${4 * s}`));
    }
    // 2. Визуальное — прямоугольник
    {
        const [w, h] = rect();
        const svg = geomRectSVG(w, h, `Периметр?`);
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual', svg,
            `Чему равен периметр?`, 2 * (w + h),
            makeWrongs(2 * (w + h)),
            `P = 2×(${w}+${h}) = ${2 * (w + h)}`));
    }
    // 3. Выбор
    {
        const [w, h] = rect();
        t.push(choiceT('🎯', 'Выбор', 'badge-choice', `Прямоугольник ${w}×${h}. Площадь?`, w * h, `S = ${w} × ${h} = ${w * h}`));
    }
    // 4. Парное
    {
        const pd = [];
        for (let i = 0; i < 3; i++) {
            const [w, h] = rect();
            pd.push({ left: `Прям. ${w}×${h} — S`, right: `${w * h}`, answer: w * h });
        }
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини фигуру с площадью:', pd, 'Сопоставляем площади'));
    }
    // 5. Ввод
    {
        const [w, h] = rect();
        t.push(inputT('✏️', 'Ввод', 'badge-input', `Прямоугольник ${w}×${h}. Периметр?`, 2 * (w + h), `P = 2×(${w}+${h}) = ${2 * (w + h)}`));
    }
    // 6. Ловушка хитрая
    {
        const s = sq();
        t.push(choiceT('⚠️', 'Ловушка', 'badge-trap',
            `Квадрат со стороной ${s}. Периметр = ? (НЕ площадь!)`,
            4 * s,
            `P = 4 × ${s} = ${4 * s}. Не перепутай с S = ${s * s}!`));
    }
    // 7. Ввод сложнее
    {
        const [w, h] = rect();
        t.push(inputT('✏️', 'Ввод', 'badge-input',
            `Прямоугольник ${w}×${h}. Площадь?`,
            w * h,
            `S = ${w} × ${h} = ${w * h}`));
    }
    // 8. Босс — 3 подзадания
    {
        const [w1, h1] = [rnd(3, 8), rnd(3, 8)];
        const s2 = rnd(3, 7);
        const [w3, h3] = [rnd(4, 10), rnd(3, 8)];
        t.push(bossT('⭐', 'Босс', 'badge-boss', 'Реши задачи по геометрии:', [
            { label: `Прямоугольник ${w1}×${h1}. Периметр?`, correctAns: String(2 * (w1 + h1)), hint: `P = 2×(${w1}+${h1}) = ${2 * (w1 + h1)}` },
            { label: `Квадрат со стороной ${s2}. Площадь?`, correctAns: String(s2 * s2), hint: `S = ${s2}² = ${s2 * s2}` },
            { label: `Комната ${w3}×${h3} м. Периметр?`, correctAns: String(2 * (w3 + h3)), hint: `P = 2×(${w3}+${h3}) = ${2 * (w3 + h3)}` }
        ], 'Периметр — сумма всех сторон, площадь — внутри!'));
    }
    return t;
}

// ═══════════════════════════════════════
//  ДРОБИ
// ═══════════════════════════════════════
export function generateFracLesson() {
    const t = [];
    const fracStr = (n, d) => `${n}/${d}`;
    const reduce = (num, den) => { const g = gcd(num, den); return { n: num / g, d: den / g }; };
    const rFrac = () => { const d = rnd(2, 8); const n = rnd(1, d); return reduce(n, d); };
    const sameDen = () => { const d = rnd(4, 10); return { d, n1: rnd(1, d - 2), n2: rnd(1, d - 2) }; };

    // 1. Разминка
    t.push(choiceT('🔥', 'Разминка', 'badge-warmup',
        'Какая дробь больше: 1/4 или 3/4?', '3/4',
        'Одинаковый знаменатель → больше та, где больше числитель'));

    // 2. Визуальное — пицца
    {
        const total = 8;
        const eaten = rnd(2, 5);
        const svg = pizzaSVG(eaten, total);
        t.push(visualT('🖼️', 'Визуальное', 'badge-visual', svg,
            `Какая часть пиццы осталась? (в формате N/${total})`,
            `${total - eaten}/${total}`,
            [`${total - eaten}/${total}`, `${eaten}/${total}`, `${total - eaten - 1}/${total}`, `${total - eaten + 1}/${total}`],
            `Было ${total}, съели ${eaten} → осталось ${total - eaten}/${total}`));
    }

    // 3. Сложение с одинаковыми знаменателями
    {
        const { d, n1, n2 } = sameDen();
        const sum = n1 + n2;
        const r = reduce(sum, d);
        t.push(choiceT('🎯', 'Сложение', 'badge-choice',
            `${fracStr(n1, d)} + ${fracStr(n2, d)} = ?`,
            r.d === 1 ? `${r.n}` : `${fracStr(r.n, r.d)}`,
            `Числители: ${n1}+${n2}=${sum}. ${r.d > 1 ? `Сокращаем: ${fracStr(sum, d)} → ${fracStr(r.n, r.d)}` : `Ответ: ${r.n}`}`));
    }

    // 4. Парное — дроби от числа
    {
        const pd = [
            { left: '1/2 от 10', right: '5', answer: '5' },
            { left: '1/3 от 9', right: '3', answer: '3' },
            { left: '1/4 от 8', right: '2', answer: '2' },
            { left: '2/3 от 12', right: '8', answer: '8' }
        ];
        t.push(pairT('🔗', 'Парное', 'badge-pair', 'Соедини дробь от числа с ответом:', pd, 'Находим дробь от числа'));
    }

    // 5. Сравнение дробей с разными знаменателями
    {
        const { n: n1, d: d1 } = rFrac();
        let { n: n2, d: d2 } = rFrac();
        while (fracStr(n1, d1) === fracStr(n2, d2)) { const f = rFrac(); n2 = f.n; d2 = f.d; }
        const v1 = n1 * d2, v2 = n2 * d1;
        const bigger = v1 > v2 ? fracStr(n1, d1) : fracStr(n2, d2);
        t.push(choiceT('⚖️', 'Сравнение', 'badge-choice',
            `Какая дробь больше: ${fracStr(n1, d1)} или ${fracStr(n2, d2)}?`,
            bigger,
            `Приводим к общему: ${n1}×${d2}=${v1} vs ${n2}×${d1}=${v2} → ${bigger}`));
    }

    // 6. Ловушка хитрая
    t.push(choiceT('⚠️', 'Ловушка', 'badge-trap',
        '1/2 + 1/2 = ? (не 2/4!)',
        '1',
        '1/2 + 1/2 = 2/2 = 1 целое! Знаменатели НЕ складываем!'));

    // 7. Сложение с разными знаменателями
    {
        const { n: n1, d: d1 } = rFrac();
        let { n: n2, d: d2 } = rFrac();
        while (d1 === d2) { const f = rFrac(); n2 = f.n; d2 = f.d; }
        const cd = lcm(d1, d2);
        const num = n1 * (cd / d1) + n2 * (cd / d2);
        const r = reduce(num, cd);
        t.push(choiceT('🧮', 'Разные знам.', 'badge-input',
            `${fracStr(n1, d1)} + ${fracStr(n2, d2)} = ?`,
            r.d === 1 ? `${r.n}` : `${fracStr(r.n, r.d)}`,
            `Общий знам.=${cd}: ${n1 * (cd / d1)}/${cd}+${n2 * (cd / d2)}/${cd}=${num}/${cd}${
                r.d < cd && r.d > 1 ? `=${fracStr(r.n, r.d)}` : ''}`));
    }

    // 8. Вычитание дробей
    {
        const d = rnd(3, 8);
        const n1 = rnd(d - Math.ceil(d / 3), d);
        const n2 = rnd(1, n1);
        const diff = n1 - n2;
        const r = reduce(diff, d);
        t.push(choiceT('➖', 'Вычитание', 'badge-choice',
            `${fracStr(n1, d)} − ${fracStr(n2, d)} = ?`,
            r.d === 1 ? `${r.n}` : `${fracStr(r.n, r.d)}`,
            `Числители: ${n1}−${n2}=${diff} → ${fracStr(diff, d)}${r.d < d ? ` = ${fracStr(r.n, r.d)}` : ''}`));
    }

    // 9. Дробь от числа
    {
        const d = rnd(3, 6);
        const n = rnd(1, d - 1);
        const total = d * rnd(3, 7);
        t.push(inputT('✏️', 'Дробь от числа', 'badge-input',
            `${fracStr(n, d)} от ${total} = ?`,
            Math.round(total * n / d),
            `${total} ÷ ${d} × ${n} = ${Math.round(total * n / d)}`));
    }

    // 10. Целое по части
    {
        const d = rnd(3, 6);
        const n = rnd(2, d - 1);
        const part = rnd(2, 5) * n;
        const whole = Math.round(part * d / n);
        t.push(choiceT('🔍', 'Целое по части', 'badge-input',
            `Если ${fracStr(n, d)} числа равно ${part}, то всё число = ?`,
            whole,
            `${part} ÷ ${n} × ${d} = ${whole}. Проверка: ${fracStr(n, d)} от ${whole} = ${part}`));
    }

    // 11. Умножение дробей
    {
        const f1 = rFrac(), f2 = rFrac();
        const r = reduce(f1.n * f2.n, f1.d * f2.d);
        t.push(choiceT('✖️', 'Умножение', 'badge-choice',
            `${fracStr(f1.n, f1.d)} × ${fracStr(f2.n, f2.d)} = ?`,
            r.d === 1 ? `${r.n}` : `${fracStr(r.n, r.d)}`,
            `${f1.n}×${f2.n}=${f1.n * f2.n} / ${f1.d}×${f2.d}=${f1.d * f2.d} → ${
                r.d === 1 ? `${r.n}` : fracStr(r.n, r.d)}`));
    }

    // 12. Деление дробей
    {
        const f1 = rFrac(), f2 = rFrac();
        const r = reduce(f1.n * f2.d, f1.d * f2.n);
        t.push(choiceT('➗', 'Деление', 'badge-choice',
            `${fracStr(f1.n, f1.d)} ÷ ${fracStr(f2.n, f2.d)} = ?`,
            r.d === 1 ? `${r.n}` : `${fracStr(r.n, r.d)}`,
            `Переворачиваем вторую: ${fracStr(f1.n, f1.d)} × ${fracStr(f2.d, f2.n)} → ${
                r.d === 1 ? `${r.n}` : fracStr(r.n, r.d)}`));
    }

    // 13. Босс — 5 подзаданий
    {
        const t1 = 12; const e1 = rnd(3, 8);
        const { d: db2, n1: nb2_1, n2: nb2_2 } = sameDen();
        const f3 = rFrac();
        const d4 = rnd(3, 6), n4 = rnd(2, d4 - 1), p4 = rnd(2, 5) * n4, w4 = Math.round(p4 * d4 / n4);
        t.push(bossT('⭐', 'Босс', 'badge-boss', 'Финальный тест по дробям:', [
            { label: `Торт на ${t1} кусков. Съели ${e1}. Осталось? (N/${t1})`,
                correctAns: `${t1 - e1}/${t1}`, hint: `${t1} − ${e1} = ${t1 - e1} → ${t1 - e1}/${t1}` },
            { label: `${fracStr(nb2_1, db2)} + ${fracStr(nb2_2, db2)} = ? (сократи если надо)`,
                correctAns: reduce(nb2_1 + nb2_2, db2).d === 1 ? `${reduce(nb2_1 + nb2_2, db2).n}` : `${fracStr(reduce(nb2_1 + nb2_2, db2).n, reduce(nb2_1 + nb2_2, db2).d)}`,
                hint: `${nb2_1}+${nb2_2}=${nb2_1 + nb2_2}. ${reduce(nb2_1 + nb2_2, db2).d < db2 ? `Сократили → ${fracStr(reduce(nb2_1 + nb2_2, db2).n, reduce(nb2_1 + nb2_2, db2).d)}` : ''}` },
            { label: `${fracStr(f3.n, f3.d)} × ${fracStr(f3.n, f3.d)} = ?`,
                correctAns: reduce(f3.n * f3.n, f3.d * f3.d).d === 1 ? `${reduce(f3.n * f3.n, f3.d * f3.d).n}` : `${fracStr(reduce(f3.n * f3.n, f3.d * f3.d).n, reduce(f3.n * f3.n, f3.d * f3.d).d)}`,
                hint: `${f3.n}²/${f3.d}² = ${fracStr(reduce(f3.n * f3.n, f3.d * f3.d).n, reduce(f3.n * f3.n, f3.d * f3.d).d)}` },
            { label: `Если ${fracStr(n4, d4)} числа = ${p4}, всё число = ?`, correctAns: w4,
                hint: `${p4} ÷ ${n4} × ${d4} = ${w4}` },
            { label: `Сколько шестых в 3 целых? (формат: X/6)`, correctAns: '18/6',
                hint: `3 × 6/6 = 18/6` }
        ], 'Дроби — это части целого!'));
    }

    return t;
}

// ─── НОВЫЕ ГЕНЕРАТОРЫ (v16) ───────────────────────

function generateDivSmallLesson() {
    const t = [];
    t.push(choiceT('➗', 'Разминка', 'badge-warmup',
        '6 ÷ 2 = ?', 3, '6 разделить на 2 будет 3'));
    for (let i = 0; i < 3; i++) {
        const b = rnd(1, 5);
        const ans = rnd(1, 5);
        const a = b * ans;
        t.push(choiceT('➗', `Деление #${i+2}`, 'badge-task',
            `${a} ÷ ${b} = ?`, ans,
            `${b} × ${ans} = ${a}, значит ${a} ÷ ${b} = ${ans}`));
    }
    for (let i = 0; i < 2; i++) {
        const b = rnd(1, 5);
        const ans = rnd(1, 5);
        const a = b * ans;
        t.push(inputT('✏️', `Ввод #${i+6}`, 'badge-input',
            `${a} ÷ ${b} = ?`, ans,
            `${b} × ? = ${a} → ${ans}`));
    }
    // Визуальное: конфеты на тарелках
    {
        const perPlate = rnd(2, 5);
        const plates = rnd(2, 4);
        const total = perPlate * plates;
        let svg = '<svg width="260" height="90" xmlns="http://www.w3.org/2000/svg">';
        for (let p = 0; p < plates; p++) {
            const px = 15 + p * 80;
            svg += `<ellipse cx="${px+30}" cy="55" rx="32" ry="14" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5"/>`;
            for (let c = 0; c < perPlate; c++) {
                svg += `<circle cx="${px+12+c*12}" cy="48" r="5" fill="#F59E0B"/>`;
            }
        }
        svg += `<text x="130" y="85" text-anchor="middle" font-size="13" fill="#475569" font-weight="600">${total} конфет на ${plates} тарелках → 1 тарелка = ?</text>`;
        svg += '</svg>';
        t.push(visualT('🍬', 'Конфеты', 'badge-visual', svg,
            `Сколько конфет на одной тарелке?`, perPlate,
            [perPlate, perPlate + 1, perPlate - 1, perPlate + 2].filter((x, i, a) => x > 0 && a.indexOf(x) === i),
            `${total} ÷ ${plates} = ${perPlate}`));
    }
    // Босс — 3 подзадания
    {
        const b1 = rnd(2, 5); const ans1 = rnd(2, 5); const a1 = b1 * ans1;
        const b2 = rnd(2, 4); const ans2 = rnd(2, 6); const a2 = b2 * ans2;
        const b3 = rnd(1, 5); const ans3 = rnd(2, 5); const a3 = b3 * ans3;
        t.push(bossT('🐱', 'Босс', 'badge-boss', 'Реши задачи на деление:', [
            { label: `${a1} ÷ ${b1}`, correctAns: ans1, hint: `${b1} × ${ans1} = ${a1}` },
            { label: `${a2} ÷ ${b2}`, correctAns: ans2, hint: `${b2} × ${ans2} = ${a2}` },
            { label: `${a3} ÷ ${b3}`, correctAns: ans3, hint: `${b3} × ${ans3} = ${a3}` }
        ], 'Деление проверяется умножением!'));
    }
    return t;
}

function generateMulSmallLesson() {
    // Таблица умножения до 5×5
    const t = [];
    const problems = [];
    for (let a = 2; a <= 5; a++) {
        for (let b = 2; b <= 5; b++) {
            problems.push({ a, b, total: a * b });
        }
    }
    const sel = shuffle(problems).slice(0, 8);
    t.push(choiceT('🟠', 'Разминка', 'badge-warmup',
        `Сколько будет ${sel[0].a} × ${sel[0].b}?`,
        sel[0].total,
        `Умножаем: ${sel[0].a} × ${sel[0].b} = ${sel[0].total}`));
    for (let i = 1; i < 4; i++) {
        const p = sel[i];
        t.push(choiceT('🟠', `Умножение #${i+1}`, 'badge-task',
            `${p.a} × ${p.b} = ?`, p.total,
            `${p.a} групп по ${p.b} = ${p.total}`));
    }
    // Визуальные сетки
    for (let i = 4; i < 7; i++) {
        const p = sel[i];
        t.push(visualT('🖼️', 'Сетка', 'badge-visual',
            mulGridSVG(p.a, p.b),
            `Сколько всего 🍎?`, p.total,
            [p.total, p.total + p.a, p.total - p.b, p.total + p.b],
            `${p.a} × ${p.b} = ${p.total}`));
    }
    // ordering: расставь по возрастанию
    {
        const vals = shuffle(sel.slice(0, 4).map(s => s.total)).slice(0, 4);
        t.push(orderingT('↕️', 'Порядок', 'badge-bonus',
            'Расставь числа по возрастанию (от меньшего к большему):',
            [...vals].sort((a, b) => a - b),
            'Правильный порядок: ' + [...vals].sort((a, b) => a - b).join(' → ')));
    }
    // Босс — 3 подзадания
    {
        const p1 = sel[5], p2 = sel[6], p3 = sel[7];
        t.push(bossT('🐱', 'Босс', 'badge-boss', 'Финальный тест по умножению:', [
            { label: `${p1.a} × ${p1.b}`, correctAns: p1.total, hint: `${p1.a} × ${p1.b} = ${p1.total}` },
            { label: `${p2.a} × ${p2.b}`, correctAns: p2.total, hint: `${p2.a} × ${p2.b} = ${p2.total}` },
            { label: `${p3.a} × ${p3.b}`, correctAns: p3.total, hint: `${p3.a} × ${p3.b} = ${p3.total}` }
        ], 'Умножение — это быстрое сложение!'));
    }
    return t;
}

function generateCompareLesson() {
    const t = [];
    t.push(choiceT('⚖️', 'Разминка', 'badge-warmup',
        'Что больше: 37 или 45?', 45,
        '45 > 37, потому что 4 десятка и 5 единиц'));
    for (let i = 0; i < 3; i++) {
        const a = rnd(10, 99), b = rnd(10, 99);
        const bigger = Math.max(a, b);
        t.push(choiceT('⚖️', `Сравнение #${i+2}`, 'badge-task',
            `Какое число больше: ${a} или ${b}?`, bigger,
            `${bigger} больше, чем ${Math.min(a, b)}`));
    }
    // Задания со знаками > < =
    for (let i = 0; i < 2; i++) {
        const a = rnd(10, 99), b = rnd(10, 99);
        let sign, correctSign;
        if (a < b) { sign = '<'; correctSign = '<'; }
        else if (a > b) { sign = '>'; correctSign = '>'; }
        else { sign = '='; correctSign = '='; }
        t.push(choiceT('📝', 'Знаки', 'badge-task',
            `${a} ? ${b}`, correctSign,
            `${a} ${correctSign} ${b}`));
    }
    // ordering: расставь по возрастанию
    {
        const vals = [rnd(5, 20), rnd(25, 50), rnd(55, 80), rnd(85, 100)];
        t.push(orderingT('↕️', 'Порядок', 'badge-bonus',
            'Расставь числа по возрастанию:',
            [...vals].sort((a, b) => a - b),
            'Правильный порядок: ' + [...vals].sort((a, b) => a - b).join(' → ')));
    }
    // Босс — 3 подзадания
    {
        const a1 = rnd(10, 99), b1 = rnd(10, 99);
        const a2 = rnd(100, 999), b2 = rnd(100, 999);
        const a3 = rnd(1000, 5000), b3 = rnd(1000, 5000);
        t.push(bossT('🐱', 'Босс', 'badge-boss', 'Сравни числа:', [
            { label: `Что больше: ${a1} или ${b1}?`, correctAns: Math.max(a1, b1), hint: `${Math.max(a1,b1)} > ${Math.min(a1,b1)}` },
            { label: `Что больше: ${a2} или ${b2}?`, correctAns: Math.max(a2, b2), hint: `Сравниваем разряды!` },
            { label: `Что больше: ${a3} или ${b3}?`, correctAns: Math.max(a3, b3), hint: `${Math.max(a3,b3)} > ${Math.min(a3,b3)}` }
        ], 'Сравнивай по разрядам: тысячи, сотни, десятки, единицы!'));
    }
    return t;
}

function generatePercentLesson() {
    const t = [];
    t.push(choiceT('💯', 'Разминка', 'badge-warmup',
        '50% от 200 — это…', 100,
        '50% = половина, 200 ÷ 2 = 100'));
    for (let i = 0; i < 3; i++) {
        const base = [100, 200, 300, 400, 500, 1000][rnd(0, 5)];
        const pct = [10, 20, 25, 50, 75][rnd(0, 4)];
        const ans = Math.round(base * pct / 100);
        t.push(choiceT('💯', `Проценты #${i+2}`, 'badge-task',
            `${pct}% от ${base} = ?`, ans,
            `${pct}% от ${base} = ${base} × ${pct} ÷ 100 = ${ans}`));
    }
    // Визуальное: полоска
    for (let i = 0; i < 2; i++) {
        const pct = [25, 50, 75, 100][rnd(0, 3)];
        const svg = `<svg width="260" height="60" xmlns="http://www.w3.org/2000/svg">` +
            `<rect x="10" y="20" width="240" height="20" rx="10" fill="#E2E8F0"/>` +
            `<rect x="10" y="20" width="${240 * pct / 100}" height="20" rx="10" fill="#06B6D4"/>` +
            `<text x="130" y="65" text-anchor="middle" font-size="14" fill="#475569">Какая это доля?</text>` +
            `</svg>`;
        t.push(visualT('📊', 'Диаграмма', 'badge-visual', svg,
            'Сколько процентов закрашено?', `${pct}%`,
            [`${pct}%`, `${100-pct}%`, '50%', '100%'],
            `Закрашено ${240 * pct / 100} из 240 пикселей = ${pct}%`));
    }
    // Босс — 3 подзадания
    {
        const b1 = [250, 360, 480, 600][rnd(0, 3)]; const p1 = [15, 30, 45, 60][rnd(0, 3)];
        const b2 = [200, 500, 800, 1000][rnd(0, 3)]; const p2 = [10, 25, 50, 75][rnd(0, 3)];
        const b3 = [300, 400, 600, 900][rnd(0, 3)]; const p3 = [20, 40, 60, 80][rnd(0, 3)];
        t.push(bossT('🐱', 'Босс', 'badge-boss', 'Реши задачи на проценты:', [
            { label: `${p1}% от ${b1}`, correctAns: Math.round(b1 * p1 / 100), hint: `${b1} × ${p1} / 100 = ${Math.round(b1 * p1 / 100)}` },
            { label: `${p2}% от ${b2}`, correctAns: Math.round(b2 * p2 / 100), hint: `${b2} × ${p2} / 100 = ${Math.round(b2 * p2 / 100)}` },
            { label: `${p3}% от ${b3}`, correctAns: Math.round(b3 * p3 / 100), hint: `${b3} × ${p3} / 100 = ${Math.round(b3 * p3 / 100)}` }
        ], 'Проценты — это сотые доли!'));
    }
    return t;
}

function generateNegLesson() {
    const t = [];
    t.push(choiceT('🌡️', 'Разминка', 'badge-warmup',
        '−5 + 3 = ?', -2,
        'От −5 вверх на 3 → −2'));
    for (let i = 0; i < 3; i++) {
        const a = rnd(-10, 10), b = rnd(-10, 10);
        const ans = a + b;
        t.push(choiceT('🌡️', `Сложение #${i+2}`, 'badge-task',
            `${a} + ${b} = ?`, ans,
            `${a} + ${b} = ${ans}`));
    }
    for (let i = 0; i < 2; i++) {
        const a = rnd(-15, 15), b = rnd(-15, 15);
        const ans = a - b;
        t.push(choiceT('🌡️', `Вычитание #${i+5}`, 'badge-task',
            `${a} − ${b} = ?`, ans,
            `${a} − ${b} = ${ans}`));
    }
    // ordering: термометр
    {
        const vals = [rnd(-20, 0), rnd(-5, 5), rnd(5, 15), rnd(15, 30)];
        t.push(orderingT('↕️', 'Термометр', 'badge-bonus',
            'Расставь температуры от самой холодной к самой тёплой:',
            [...vals].sort((a, b) => a - b),
            'Правильно: ' + [...vals].sort((a, b) => a - b).join('° → ') + '°'));
    }
    // Босс — 3 подзадания
    {
        const a1 = rnd(-25, 25), b1 = rnd(-25, 25);
        const a2 = rnd(-15, 15), b2 = rnd(-15, 15);
        const a3 = rnd(-20, 20), b3 = rnd(-20, 20);
        t.push(bossT('🐱', 'Босс', 'badge-boss', 'Реши примеры с отрицательными числами:', [
            { label: `${a1} + (${b1})`, correctAns: a1 + b1, hint: `${a1} + ${b1} = ${a1 + b1}` },
            { label: `${a2} − (${b2})`, correctAns: a2 - b2, hint: `${a2} − ${b2} = ${a2 - b2}` },
            { label: `${a3} + (${b3})`, correctAns: a3 + b3, hint: `${a3} + ${b3} = ${a3 + b3}` }
        ], 'Минус на минус даёт плюс!'));
    }
    return t;
}

function generatePropLesson() {
    const t = [];
    t.push(choiceT('⚡', 'Разминка', 'badge-warmup',
        'Если 2 яблока стоят 30 руб., сколько стоят 4 яблока?', 60,
        'Пропорция: 2 → 30, 4 → 60 (в 2 раза больше)'));
    for (let i = 0; i < 3; i++) {
        const a = rnd(2, 5), aVal = a * rnd(5, 20);
        const b = a * rnd(2, 4);
        const bVal = aVal * (b / a);
        t.push(choiceT('⚡', `Пропорция #${i+2}`, 'badge-task',
            `${a} шт. — ${aVal} руб.\n${b} шт. — ?`, bVal,
            `${a} → ${aVal}, ${b} → ${aVal} × ${b}/${a} = ${bVal}`));
    }
    // Визуальное: масштаб
    for (let i = 0; i < 2; i++) {
        const small = rnd(3, 6), big = small * rnd(2, 4);
        const svg = `<svg width="260" height="80" xmlns="http://www.w3.org/2000/svg">` +
            `<rect x="10" y="30" width="${small*12}" height="20" rx="4" fill="#EAB308"/><text x="${10+small*6}" y="20" text-anchor="middle" font-size="11">${small} см</text>` +
            `<rect x="10" y="55" width="${big*12}" height="20" rx="4" fill="#F97316"/><text x="${10+big*6}" y="70" text-anchor="middle" font-size="11">? см</text>` +
            `</svg>`;
        t.push(visualT('📏', 'Масштаб', 'badge-visual', svg,
            'Во сколько раз нижняя полоска длиннее верхней?', `${big/small} раза`,
            [`${big/small} раза`, '2 раза', '3 раза', '4 раза'],
            `${big} ÷ ${small} = ${big/small}`));
    }
    // Босс
    {
        const a = rnd(3, 8), aVal = a * rnd(10, 30);
        const b = a * rnd(2, 5);
        const bVal = Math.round(aVal * b / a);
        t.push(choiceT('🐱', 'Босс', 'badge-boss',
            `${a} кг — ${aVal} руб.\n${b} кг — ?`, bVal,
            `Прямая пропорциональность: ${aVal} × ${b} / ${a} = ${bVal}`));
    }
    return t;
}

// ═══════════════ ГЕНЕРАТОРЫ ФГОС (НОВЫЕ) ═══════════════

/** Счёт в пределах 10 (1 класс) */
function generateCount10Lesson() {
    const t = [];
    for (let i = 0; i < 4; i++) {
        const a = rnd(1, 9);
        const b = rnd(1, 10 - a);
        t.push(choiceT('🧮', 'Счёт', 'badge-task', `${a} + ${b} = ?`, a + b, `${a} + ${b} = ${a + b}`));
    }
    for (let i = 0; i < 2; i++) {
        const a = rnd(3, 10);
        const b = rnd(1, a);
        t.push(inputT('🧮', 'Счёт', 'badge-task', `${a} - ${b} = ?`, a - b, `${a} - ${b} = ${a - b}`));
    }
    return t;
}

/** Счёт в пределах 100 (2 класс) */
function generateCount100Lesson() {
    const t = [];
    for (let i = 0; i < 3; i++) {
        const a = rnd(10, 90);
        const b = rnd(1, 100 - a);
        t.push(choiceT('🧮', 'Счёт', 'badge-task', `${a} + ${b} = ?`, a + b, `${a} + ${b} = ${a + b}`));
    }
    for (let i = 0; i < 3; i++) {
        const a = rnd(20, 100);
        const b = rnd(1, a);
        t.push(inputT('🧮', 'Счёт', 'badge-task', `${a} - ${b} = ?`, a - b, `${a} - ${b} = ${a - b}`));
    }
    return t;
}

/** Уравнения начальные (2 класс): 3+x=5, x*2=8 */
function generateSimpleEqLesson() {
    const t = [];
    for (let i = 0; i < 3; i++) {
        const b = rnd(2, 9);
        const c = b + rnd(1, 5);
        t.push(inputT('⚖️', 'Уравнения', 'badge-task', `x + ${b} = ${c}. x = ?`, c - b, `x = ${c} - ${b} = ${c - b}`));
    }
    for (let i = 0; i < 3; i++) {
        const b = rnd(2, 5);
        const x = rnd(2, 6);
        const c = b * x;
        t.push(inputT('⚖️', 'Уравнения', 'badge-task', `${b} × x = ${c}. x = ?`, x, `${b} × ${x} = ${c}`));
    }
    return t;
}

/** Периметр и площадь (3-4 класс) */
function generatePerimeterAreaLesson() {
    const t = [];
    const rects = [
        { w: rnd(2, 6), h: rnd(2, 5) },
        { w: rnd(3, 7), h: rnd(2, 6) }
    ];
    for (const { w, h } of rects) {
        t.push(inputT('📐', 'Периметр', 'badge-task', `Прямоугольник ${w}×${h} см. Периметр = ?`, 2 * (w + h), `P = 2(${w}+${h}) = ${2 * (w + h)}`));
        t.push(inputT('📐', 'Площадь', 'badge-task', `Прямоугольник ${w}×${h} см. Площадь = ?`, w * h, `S = ${w}×${h} = ${w * h}`));
    }
    const sq = rnd(2, 8);
    t.push(inputT('📐', 'Квадрат', 'badge-task', `Квадрат со стороной ${sq} см. Периметр = ?`, 4 * sq, `P = 4 × ${sq} = ${4 * sq}`));
    t.push(inputT('📐', 'Квадрат', 'badge-task', `Квадрат со стороной ${sq} см. Площадь = ?`, sq * sq, `S = ${sq}² = ${sq * sq}`));
    return t;
}

/** Единицы измерения (2-3 класс): см, дм, м, кг */
function generateUnitsLesson() {
    const t = [];
    const conv = [
        { q: '1 м = ? см', ans: 100, hint: '1 м = 100 см' },
        { q: '1 дм = ? см', ans: 10, hint: '1 дм = 10 см' },
        { q: '1 кг = ? г', ans: 1000, hint: '1 кг = 1000 г' },
        { q: '1 т = ? кг', ans: 1000, hint: '1 т = 1000 кг' },
        { q: '1 ч = ? мин', ans: 60, hint: '1 ч = 60 мин' },
        { q: '1 м = ? дм', ans: 10, hint: '1 м = 10 дм' }
    ];
    for (const item of conv.slice(0, 4)) {
        t.push(inputT('📏', 'Единицы', 'badge-task', item.q, item.ans, item.hint));
    }
    t.push(choiceT('📏', 'Единицы', 'badge-task', '2 м 5 см = ? см', 205, '2 м = 200 см + 5 см = 205 см'));
    t.push(choiceT('📏', 'Единицы', 'badge-task', '3 кг 50 г = ? г', 3050, '3 кг = 3000 г + 50 г = 3050 г'));
    return t;
}

/** Объём (4-5 класс): V = a·b·c */
function generateVolumeLesson() {
    const t = [];
    const solids = [
        { a: rnd(2, 5), b: rnd(2, 4), c: rnd(2, 5) },
        { a: rnd(3, 6), b: rnd(2, 5), c: rnd(2, 4) }
    ];
    for (const { a, b, c } of solids) {
        t.push(inputT('📦', 'Объём', 'badge-task', `Объём параллелепипеда ${a}×${b}×${c} см = ?`, a * b * c, `V = ${a}·${b}·${c} = ${a * b * c} см³`));
    }
    const edge = rnd(2, 5);
    t.push(inputT('📦', 'Объём', 'badge-task', `Объём куба с ребром ${edge} см = ?`, edge * edge * edge, `V = ${edge}³ = ${edge * edge * edge}`));
    t.push(choiceT('📦', 'Объём', 'badge-task', 'Сколько см³ в 1 л?', 1000, '1 литр = 1000 см³'));
    t.push(choiceT('📦', 'Объём', 'badge-task', 'Формула объёма:', 'a·b·c', 'V = a·b·c'));
    return t;
}

/** Координатная плоскость (5-6 класс): x, y, квадранты */
function generateCoordinateLesson() {
    const t = [];
    const points = [
        { x: rnd(1, 5), y: rnd(1, 5), quadrant: 'I', desc: 'x>0, y>0' },
        { x: -rnd(1, 5), y: rnd(1, 5), quadrant: 'II', desc: 'x<0, y>0' },
        { x: rnd(1, 5), y: -rnd(1, 5), quadrant: 'IV', desc: 'x>0, y<0' },
        { x: -rnd(1, 5), y: -rnd(1, 5), quadrant: 'III', desc: 'x<0, y<0' }
    ];
    for (const p of points) {
        t.push(choiceT('🗺️', 'Координаты', 'badge-task', `Точка (${p.x}, ${p.y}) в какой четверти?`, p.quadrant, `${p.desc} → ${p.quadrant} четверть`));
    }
    t.push(inputT('🗺️', 'Координаты', 'badge-task', 'Точка (0, 5) лежит на оси: (X или Y)', 'Y', 'x=0 → ось Y'));
    t.push(inputT('🗺️', 'Координаты', 'badge-task', 'Точка (3, 0) лежит на оси: (X или Y)', 'X', 'y=0 → ось X'));
    return t;
}

/** Десятичные дроби (5-6 класс): 0.5 + 0.3 */
function generateDecimalLesson() {
    const t = [];
    const tasks = [
        { a: 0.5, b: 0.3, op: '+', ans: 0.8 },
        { a: 1.2, b: 0.7, op: '+', ans: 1.9 },
        { a: 2.5, b: 1.3, op: '-', ans: 1.2 },
        { a: 3.6, b: 1.4, op: '+', ans: 5.0 },
        { a: 1.5, b: 0.8, op: '-', ans: 0.7 },
        { a: 2.4, b: 1.6, op: '+', ans: 4.0 }
    ];
    for (const task of tasks.slice(0, 4)) {
        t.push(inputT('🔢', 'Десятичные', 'badge-task', `${task.a} ${task.op} ${task.b} = ?`, task.ans, `${task.a} ${task.op} ${task.b} = ${task.ans}`));
    }
    t.push(choiceT('🔢', 'Десятичные', 'badge-task', '0.3 × 0.2 = ?', 0.06, '3×2=6, 3 знака после запятой → 0.06'));
    t.push(choiceT('🔢', 'Десятичные', 'badge-task', '1.5 × 2 = ?', 3.0, '1.5 × 2 = 3'));
    return t;
}

/** Признаки делимости (5-6 класс): на 2,3,5,9,10 */
function generateDivisibilityLesson() {
    const t = [];
    const rules = [
        { n: 148, rule: 'на 2', ans: 'да', hint: 'последняя цифра 8 — чётная' },
        { n: 135, rule: 'на 5', ans: 'да', hint: 'последняя цифра 5' },
        { n: 123, rule: 'на 3', ans: 'да', hint: '1+2+3=6, 6:3=2' },
        { n: 200, rule: 'на 10', ans: 'да', hint: 'последняя цифра 0' }
    ];
    for (const r of rules) {
        t.push(choiceT('🔍', 'Делимость', 'badge-task', `${r.n} делится ${r.rule}?`, r.ans, r.hint));
    }
    t.push(choiceT('🔍', 'Делимость', 'badge-task', 'Признак делимости на 3:', 'сумма цифр делится на 3', 'Сумма цифр должна делиться на 3'));
    t.push(choiceT('🔍', 'Делимость', 'badge-task', 'Признак делимости на 5:', 'оканчивается на 0 или 5', 'На 0 или 5'));
    return t;
}

/** НОД и НОК (5-6 класс) */
function generateGcdLcmLesson() {
    const t = [];
    const gcdItems = [
        { a: 12, b: 8, gcd: 4, lcm: 24 },
        { a: 15, b: 25, gcd: 5, lcm: 75 },
        { a: 18, b: 24, gcd: 6, lcm: 72 }
    ];
    for (const { a, b, gcd } of gcdItems) {
        t.push(inputT('🔗', 'НОД', 'badge-task', `НОД(${a}, ${b}) = ?`, gcd, `Раскладываем → НОД=${gcd}`));
    }
    t.push(inputT('🔗', 'НОК', 'badge-task', `НОК(12, 8) = ?`, 24, `НОК = 12×8/4 = 24`));
    t.push(inputT('🔗', 'НОК', 'badge-task', `НОК(15, 25) = ?`, 75, `НОК = 15×25/5 = 75`));
    t.push(choiceT('🔗', 'НОД/НОК', 'badge-task', 'НОД(7, 13) = ?', 1, 'Простые числа → НОД=1'));
    t.push(choiceT('🔗', 'НОД/НОК', 'badge-task', 'НОК(7, 13) = ?', 91, 'Взаимно простые → НОК=7×13=91'));
    return t;
}

/** Модуль числа (6 класс): |−5| */
function generateAbsoluteLesson() {
    const t = [];
    const items = [
        { n: -5, ans: 5 },
        { n: 8, ans: 8 },
        { n: -12, ans: 12 },
        { n: 0, ans: 0 }
    ];
    for (const item of items) {
        t.push(inputT('| |', 'Модуль', 'badge-task', `|${item.n}| = ?`, item.ans, `Модуль — расстояние от 0: |${item.n}| = ${item.ans}`));
    }
    t.push(choiceT('| |', 'Модуль', 'badge-task', '|−8| = ?', 8, 'Расстояние не может быть отрицательным!'));
    t.push(choiceT('| |', 'Модуль', 'badge-task', '|5| + |−3| = ?', 8, '5 + 3 = 8'));
    return t;
}

/** Пропорции (6 класс) */
function generateProportionLesson() {
    const t = [];
    const props = [
        { a: 3, b: 9, c: 4, x: 12 },
        { a: 5, b: 15, c: 2, x: 6 },
        { a: 7, b: 21, c: 3, x: 9 }
    ];
    for (const { a, b, c, x } of props) {
        t.push(inputT('⚖️', 'Пропорции', 'badge-task', `${a} : ${b} = ${c} : x. x = ?`, x, `${a}/${b} = ${c}/x → x = ${b}·${c}/${a} = ${x}`));
    }
    t.push(choiceT('⚖️', 'Пропорции', 'badge-task', 'Если 2 кг — 100 руб, то 5 кг — ? руб', 250, '100 × 5 / 2 = 250'));
    t.push(choiceT('⚖️', 'Пропорции', 'badge-task', 'Пропорция — это:', 'равенство двух отношений', 'a:b = c:d'));
    t.push(inputT('⚖️', 'Пропорции', 'badge-task', '4 : x = 2 : 5. x = ?', 10, '4/x = 2/5 → x = 4·5/2 = 10'));
    return t;
}

/** Рациональные числа (6 класс) */
function generateRationalLesson() {
    const t = [];
    t.push(choiceT('🧠', 'Рациональные', 'badge-task', 'Какое число НЕ является рациональным?', 'π', 'π (пи) — иррациональное число'));
    t.push(choiceT('🧠', 'Рациональные', 'badge-task', 'Какое число рациональное?', '3.5', '3.5 = 7/2 — можно записать дробью'));
    t.push(choiceT('🧠', 'Рациональные', 'badge-task', 'Рациональное число — это:', 'число вида a/b', 'Любое число, которое можно записать как дробь a/b'));
    t.push(inputT('🧠', 'Сравнение', 'badge-task', '−3 и −8 — что больше? (введи число)', '-3', 'На оси −3 правее, чем −8, значит −3 > −8'));
    t.push(inputT('🧠', 'Сравнение', 'badge-task', '2/3 и 1/2 — что больше? (введи дробь)', '2/3', '2/3 = 0.666... > 0.5'));
    t.push(choiceT('🧠', 'Целые', 'badge-task', '−5 целое число?', 'да', 'Целые числа: ..., −3, −2, −1, 0, 1, 2, ...'));
    return t;
}

/** Степени (5-6 класс): 2³, 3² */
function generatePowersLesson() {
    const t = [];
    const items = [
        { base: 2, exp: 3, ans: 8, text: '2³' },
        { base: 3, exp: 2, ans: 9, text: '3²' },
        { base: 4, exp: 2, ans: 16, text: '4²' },
        { base: 5, exp: 2, ans: 25, text: '5²' }
    ];
    for (const item of items) {
        t.push(inputT('💪', 'Степени', 'badge-task', `${item.text} = ?`, item.ans, `${item.base} в степени ${item.exp} = ${item.ans}`));
    }
    t.push(choiceT('💪', 'Степени', 'badge-task', '3² + 2³ = ?', 17, '9 + 8 = 17'));
    t.push(choiceT('💪', 'Степени', 'badge-task', 'Любое число в степени 0 равно:', 1, 'a⁰ = 1 (при a ≠ 0)'));
    return t;
}

/** Состав числа (1-2 класс): раскладываем число на слагаемые */
function generateCompNumLesson() {
    const t = [];
    const nums = [
        { n: 10, parts: [[3, 7], [4, 6], [2, 8], [5, 5]] },
        { n: 12, parts: [[5, 7], [6, 6], [3, 9], [8, 4]] },
        { n: 14, parts: [[7, 7], [8, 6], [9, 5], [4, 10]] },
        { n: 16, parts: [[8, 8], [9, 7], [6, 10], [5, 11]] }
    ];
    // Ввод: дополни до N
    for (let i = 0; i < 3; i++) {
        const num = nums[i];
        const [p1, p2] = num.parts[rnd(0, num.parts.length - 1)];
        t.push(inputT('🧩', `Состав #${i+1}`, 'badge-input',
            `${p1} + ? = ${num.n}`, p2,
            `${num.n} − ${p1} = ${p2}`));
    }
    // Выбор
    for (let i = 0; i < 2; i++) {
        const num = nums[i + 2];
        const [p1, p2] = num.parts[rnd(0, num.parts.length - 1)];
        t.push(choiceT('🧩', `Состав #${i+4}`, 'badge-task',
            `${p1} + ? = ${num.n}`, p2,
            `${num.n} − ${p1} = ${p2}`));
    }
    // Босс
    const boss = nums[3];
    const [bp1, bp2] = boss.parts[rnd(0, boss.parts.length - 1)];
    const [bp3, bp4] = boss.parts[rnd(0, boss.parts.length - 1)];
    const [bp5, bp6] = nums[2].parts[rnd(0, nums[2].parts.length - 1)];
    t.push(bossT('🐱', 'Босс', 'badge-boss', 'Заполни окошки:', [
        { label: `${bp1} + ▢ = ${boss.n}`, correctAns: bp2, hint: `${boss.n} − ${bp1} = ${bp2}` },
        { label: `${bp3} + ▢ = ${boss.n}`, correctAns: bp4, hint: `${boss.n} − ${bp3} = ${bp4}` },
        { label: `${bp5} + ▢ = ${nums[2].n}`, correctAns: bp6, hint: `${nums[2].n} − ${bp5} = ${bp6}` }
    ], 'Состав числа — основа быстрого счёта!'));
    return t;
}

/** Чётные / нечётные числа (1-2 класс) */
function generateEvenOddLesson() {
    const t = [];
    const numbers = [7, 14, 9, 22, 15, 18, 3, 20];
    for (let i = 0; i < 4; i++) {
        const n = numbers[i];
        const ans = n % 2 === 0 ? 'чётное' : 'нечётное';
        t.push(choiceT('🔢', `Чёт/нечет #${i+1}`, 'badge-task',
            `Число ${n} — какое?`, ans,
            n % 2 === 0 ? `Оканчивается на ${n % 10} — чётное` : `Оканчивается на ${n % 10} — нечётное`));
    }
    // Ввод
    for (let i = 4; i < 7; i++) {
        const n = numbers[i];
        t.push(inputT('✏️', `Чёт/нечет #${i+1}`, 'badge-input',
            `${n} — чётное или нечётное? (введи слово)`, n % 2 === 0 ? 'чётное' : 'нечётное',
            n % 2 === 0 ? `Оканчивается на ${n % 10} → чётное` : `Оканчивается на ${n % 10} → нечётное`));
    }
    t.push(bossT('🐱', 'Босс', 'badge-boss', 'Проверка на чётность:', [
        { label: 'Сумма двух нечётных чисел:', correctAns: 'чётная', hint: 'Нечёт + Нечёт = Чёт! Пример: 3 + 5 = 8' },
        { label: 'Сумма двух чётных чисел:', correctAns: 'чётная', hint: 'Чёт + Чёт = Чёт! Пример: 4 + 6 = 10' },
        { label: 'Сумма чётного и нечётного:', correctAns: 'нечётная', hint: 'Чёт + Нечёт = Нечёт! Пример: 4 + 3 = 7' }
    ], 'Чётность — это волшебство математики!'));
    return t;
}

/** Порядок действий (3-4 класс): скобки, ×÷ перед +− */
function generateOrderOpsLesson() {
    const t = [];
    const tasks = [
        { expr: '2 + 3 × 4', ans: 14, hint: 'Сначала 3×4=12, потом 2+12=14' },
        { expr: '10 − 2 × 3', ans: 4, hint: 'Сначала 2×3=6, потом 10−6=4' },
        { expr: '(8 + 4) ÷ 2', ans: 6, hint: 'Сначала в скобках 8+4=12, потом 12÷2=6' },
        { expr: '3 × (5 − 2)', ans: 9, hint: 'Сначала 5−2=3, потом 3×3=9' }
    ];
    for (let i = 0; i < 3; i++) {
        const tk = tasks[i];
        t.push(inputT('🔢', `Порядок #${i+1}`, 'badge-input',
            `${tk.expr} = ?`, tk.ans, tk.hint));
    }
    t.push(choiceT('🔢', 'Порядок #4', 'badge-task',
        `${tasks[3].expr} = ?`, tasks[3].ans, tasks[3].hint));
    t.push(choiceT('🔢', 'Правило', 'badge-task',
        'Что делаем первым?', 'скобки',
        'Сначала скобки, потом ×÷, потом +−'));
    // Ввод сложнее
    t.push(inputT('✏️', 'Порядок #5', 'badge-input',
        '12 ÷ (2 + 1) × 2 = ?', 8,
        'Скобки: 2+1=3, затем 12÷3=4, затем 4×2=8'));
    t.push(bossT('🐱', 'Босс', 'badge-boss', 'Проверь порядок действий:', [
        { label: '2 + 2 × 2', correctAns: 6, hint: 'Сначала умножение: 2×2=4, потом 2+4=6' },
        { label: '(3 + 5) × 2', correctAns: 16, hint: 'Сначала скобки: 3+5=8, потом 8×2=16' },
        { label: '20 − 4 × 3', correctAns: 8, hint: 'Сначала 4×3=12, потом 20−12=8' }
    ], 'Умножение и деление — всегда перед сложением и вычитанием!'));
    return t;
}

/** Таблица умножения (3-4 класс) */
function generateMulTableLesson() {
    const t = [];
    const probs = [];
    for (let a = 2; a <= 9; a++) {
        for (let b = 2; b <= 9; b++) {
            probs.push({ a, b, ans: a * b });
        }
    }
    const sel = shuffle(probs).slice(0, 8);
    t.push(choiceT('📊', 'Разминка', 'badge-warmup',
        `${sel[0].a} × ${sel[0].b} = ?`, sel[0].ans,
        `${sel[0].a} × ${sel[0].b} = ${sel[0].ans}`));
    for (let i = 1; i < 4; i++) {
        t.push(inputT('✏️', `Таблица #${i+1}`, 'badge-input',
            `${sel[i].a} × ${sel[i].b} = ?`, sel[i].ans,
            `${sel[i].a} × ${sel[i].b} = ${sel[i].ans}`));
    }
    for (let i = 4; i < 7; i++) {
        t.push(choiceT('📊', `Таблица #${i+1}`, 'badge-task',
            `${sel[i].a} × ${sel[i].b} = ?`, sel[i].ans,
            `${sel[i].a} × ${sel[i].b} = ${sel[i].ans}`));
    }
    {
        const p1 = sel[5], p2 = sel[6], p3 = sel[7];
        t.push(bossT('⭐', 'Босс', 'badge-boss', 'Финальный тест по таблице умножения:', [
            { label: `${p1.a} × ${p1.b}`, correctAns: p1.ans, hint: `${p1.a} × ${p1.b} = ${p1.ans}` },
            { label: `${p2.a} × ${p2.b}`, correctAns: p2.ans, hint: `${p2.a} × ${p2.b} = ${p2.ans}` },
            { label: `${p3.a} × ${p3.b}`, correctAns: p3.ans, hint: `${p3.a} × ${p3.b} = ${p3.ans}` }
        ], '7×8 = 56 — самое сложное в таблице!'));
    }
    return t;
}

/** Единицы длины (3-4 класс) */
function generateLenUnitsLesson() {
    const t = [];
    t.push(choiceT('📏', 'Разминка', 'badge-warmup',
        '1 м = ? см', 100, 'В 1 метре 100 сантиметров'));
    const convs = [
        { q: '3 м = ? см', ans: 300 },
        { q: '1 км = ? м', ans: 1000 },
        { q: '50 см = ? дм', ans: 5 },
        { q: '2 км = ? м', ans: 2000 }
    ];
    for (let i = 0; i < 2; i++) {
        t.push(inputT('📏', `Длина #${i+2}`, 'badge-input',
            convs[i].q, convs[i].ans,
            `1 м = 100 см → ${convs[i].q} → ${convs[i].ans}`));
    }
    for (let i = 2; i < 4; i++) {
        t.push(choiceT('📏', `Длина #${i+2}`, 'badge-task',
            convs[i].q, convs[i].ans,
            `Переводим: ${convs[i].q} → ${convs[i].ans}`));
    }
    t.push(choiceT('📏', 'Сравнение', 'badge-task',
        'Что больше: 1 км или 999 м?', '1 км', '1 км = 1000 м > 999 м'));
    t.push(bossT('🐱', 'Босс', 'badge-boss', 'Переведи единицы длины:', [
        { label: '2 м 30 см = ? см', correctAns: 230, hint: '2 м = 200 см, + 30 см = 230 см' },
        { label: '5 км = ? м', correctAns: 5000, hint: '1 км = 1000 м, 5 км = 5000 м' },
        { label: '4 м 5 см = ? см', correctAns: 405, hint: '4 м = 400 см, + 5 см = 405 см' }
    ], 'В 1 м = 100 см, в 1 км = 1000 м!'));
    return t;
}

/** Единицы массы (3-4 класс) */
function generateMassUnitsLesson() {
    const t = [];
    t.push(choiceT('⚖️', 'Разминка', 'badge-warmup',
        '1 кг = ? г', 1000, 'В 1 килограмме 1000 граммов'));
    const convs = [
        { q: '3 кг = ? г', ans: 3000 },
        { q: '1 т = ? кг', ans: 1000 },
        { q: '5000 г = ? кг', ans: 5 },
        { q: '1 ц = ? кг', ans: 100 }
    ];
    for (let i = 0; i < 2; i++) {
        t.push(inputT('⚖️', `Масса #${i+2}`, 'badge-input',
            convs[i].q, convs[i].ans,
            `1 кг = 1000 г → ${convs[i].q} → ${convs[i].ans}`));
    }
    for (let i = 2; i < 4; i++) {
        t.push(choiceT('⚖️', `Масса #${i+2}`, 'badge-task',
            convs[i].q, convs[i].ans,
            `Переводим: ${convs[i].q} → ${convs[i].ans}`));
    }
    t.push(choiceT('⚖️', 'Сравнение', 'badge-task',
        'Что тяжелее: 1 кг или 999 г?', '1 кг', '1 кг = 1000 г > 999 г'));
    t.push(bossT('🐱', 'Босс', 'badge-boss', 'Переведи единицы массы:', [
        { label: '1 кг 250 г = ? г', correctAns: 1250, hint: '1 кг = 1000 г, + 250 г = 1250 г' },
        { label: '2 кг = ? г', correctAns: 2000, hint: '1 кг = 1000 г, ×2 = 2000 г' },
        { label: '5 т = ? кг', correctAns: 5000, hint: '1 т = 1000 кг, ×5 = 5000 кг' }
    ], 'В 1 кг = 1000 г, в 1 т = 1000 кг!'));
    return t;
}

/** Время и часы (3-4 класс) */
function generateTimeClockLesson() {
    const t = [];
    t.push(choiceT('🕐', 'Разминка', 'badge-warmup',
        '1 час = ? минут', 60, 'В 1 часе 60 минут'));
    t.push(inputT('🕐', 'Время #2', 'badge-input',
        '2 ч 15 мин = ? мин', 135, '2×60=120, +15=135'));
    t.push(choiceT('🕐', 'Время #3', 'badge-task',
        'Половина часа — это:', 30, '30 минут = полчаса'));
    t.push(inputT('🕐', 'Время #4', 'badge-input',
        '90 мин = ? ч ? мин (формат: X ч Y мин)', '1 ч 30 мин',
        '90 ÷ 60 = 1 ч, 30 мин'));
    // Задачи со стрелками
    t.push(choiceT('🕐', 'Часы', 'badge-task',
        'Если сейчас 14:00, сколько будет через 3 часа?', 17, '14+3=17 часов'));
    t.push(choiceT('🕐', 'Часы', 'badge-task',
        'Сколько минут в четверти часа?', 15, '60 ÷ 4 = 15 минут'));
    t.push(bossT('🐱', 'Босс', 'badge-boss', 'Сложи время:', [
        { label: '3 ч 45 мин + 2 ч 30 мин = ? мин', correctAns: 375, hint: '3×60=180+45=225, 2×60=120+30=150, 225+150=375' },
        { label: '1 ч 20 мин = ? мин', correctAns: 80, hint: '1×60=60+20=80 мин' },
        { label: '90 мин = ? ч ? мин (веди "X ч Y мин")', correctAns: '1 ч 30 мин', hint: '90 ÷ 60 = 1 ч, 30 мин' }
    ], 'В 1 ч = 60 мин!'));
    return t;
}

/** Деньги (3-4 класс) */
function generateMoneyLesson() {
    const t = [];
    t.push(choiceT('💰', 'Разминка', 'badge-warmup',
        '1 рубль = ? копеек', 100, 'В 1 рубле 100 копеек'));
    const tasks = [
        { q: '5 руб. 50 коп. = ? коп.', ans: 550 },
        { q: 'Маша купила ручку за 45 руб. и тетрадь за 30 руб. Сколько всего?', ans: 75 },
        { q: 'У Пети 200 руб. Он купил книгу за 135 руб. Сдача?', ans: 65 },
        { q: '3 шоколадки по 40 руб. = ? руб.', ans: 120 }
    ];
    for (let i = 0; i < 2; i++) {
        t.push(inputT('💰', `Деньги #${i+2}`, 'badge-input',
            tasks[i].q, tasks[i].ans,
            `Считаем: ${tasks[i].q} → ${tasks[i].ans}`));
    }
    for (let i = 2; i < 4; i++) {
        t.push(choiceT('💰', `Деньги #${i+2}`, 'badge-task',
            tasks[i].q, tasks[i].ans,
            `Считаем: ${tasks[i].q} → ${tasks[i].ans}`));
    }
    t.push(inputT('💰', 'Покупка', 'badge-input',
        'У тебя 500 руб. Купил 2 книги по 180 руб. Осталось?', 140,
        '2×180=360, 500−360=140'));
    t.push(bossT('🐱', 'Босс', 'badge-boss', 'Реши задачи про деньги:', [
        { label: '5×10 руб. или 2×50 руб. — что больше? (введи "5×10" или "2×50")', correctAns: '2×50', hint: '5×10=50, 2×50=100 → 100 > 50' },
        { label: 'У тебя 500 руб. Купил 2 книги по 180 руб. Осталось?', correctAns: 140, hint: '2×180=360, 500−360=140' },
        { label: '4 шоколадки по 25 руб. Сколько всего?', correctAns: 100, hint: '4×25=100 руб.' }
    ], 'Считай деньги внимательно — они любят порядок!'));
    return t;
}

/** Координатная прямая (5-6 класс) */
function generateCoordLesson() {
    const t = [];
    const points = [
        { q: 'Точка A(3) и B(7). Расстояние AB = ?', ans: 4 },
        { q: 'Точка C(−2) и D(4). Расстояние CD = ?', ans: 6 },
        { q: 'Какая точка левее: −5 или −1?', ans: -5 }
    ];
    t.push(choiceT('📉', 'Разминка', 'badge-warmup',
        points[0].q, points[0].ans, '|7 − 3| = 4'));
    t.push(inputT('📉', 'Координаты #2', 'badge-input',
        points[1].q, points[1].ans, '|4 − (−2)| = 6'));
    t.push(choiceT('📉', 'Координаты #3', 'badge-task',
        points[2].q, points[2].ans, '−5 < −1, значит −5 левее'));
    // Середина отрезка
    t.push(inputT('📉', 'Середина', 'badge-input',
        'Середина отрезка AB: A(2), B(8). Координата середины?', 5,
        '(2+8)÷2=5'));
    t.push(choiceT('📉', 'Ось', 'badge-task',
        'Какие числа на координатной прямой правее нуля?', 'положительные',
        'Положительные числа всегда правее 0'));
    t.push(bossT('🐱', 'Босс', 'badge-boss', 'Задачи на координатную прямую:', [
        { label: 'Расстояние между A(−3) и B(5)', correctAns: 8, hint: '|5 − (−3)| = 8' },
        { label: 'Середина между 2 и 8', correctAns: 5, hint: '(2+8)÷2=5' },
        { label: 'Какая точка левее: −7 или −3?', correctAns: '-7', hint: '−7 < −3, значит левее' }
    ], 'Координатная прямая — это линейка чисел!'));
    return t;
}

/** Задачи на движение (5-6 класс) — расширенный набор текстовых задач */
function generateMotionLesson() {
    const t = [];

    // ── Блок 1: Прямое движение ──
    {
        const speed = rnd(40, 90);
        const time = rnd(2, 5);
        t.push(choiceT('🚗', 'Движение', 'badge-task',
            `Машина едет ${speed} км/ч. Сколько за ${time} ч?`,
            speed * time, `${speed} × ${time} = ${speed * time} км`));
    }
    {
        const dist = rnd(30, 100);
        const time = rnd(2, 5);
        t.push(inputT('🚗', 'Скорость', 'badge-input',
            `Велосипедист проехал ${dist} км за ${time} ч. Скорость?`,
            Math.round(dist / time), `${dist} ÷ ${time} = ${Math.round(dist / time)} км/ч`));
    }
    {
        const dist = rnd(10, 50);
        const speed = rnd(3, 8);
        t.push(choiceT('🚗', 'Время', 'badge-task',
            `Пешеход идёт ${speed} км/ч. Через сколько пройдёт ${dist} км?`,
            Math.round(dist / speed), `${dist} ÷ ${speed} = ${Math.round(dist / speed)} ч`));
    }

    // ── Блок 2: Встречное движение ──
    {
        const v1 = rnd(50, 90), v2 = rnd(40, 70);
        const dist = (v1 + v2) * rnd(2, 4);
        const time = Math.round(dist / (v1 + v2));
        t.push(inputT('�', 'Встречное', 'badge-input',
            `Два поезда: ${v1} км/ч и ${v2} км/ч навстречу. Расстояние ${dist} км. Через сколько ч?`,
            time, `Сближение: ${v1}+${v2}=${v1+v2} км/ч. ${dist}÷${v1+v2}=${time} ч`));
    }

    // ── Блок 3: Движение вдогонку ──
    {
        const v1 = rnd(60, 100), v2 = rnd(30, v1 - 20);
        const dist = (v1 - v2) * rnd(2, 5);
        const time = Math.round(dist / (v1 - v2));
        t.push(choiceT('🏃', 'Вдогонку', 'badge-task',
            `Машина ${v1} км/ч догоняет ${v2} км/ч. Разрыв ${dist} км. Через сколько догонит?`,
            time, `Скорость сближения: ${v1}−${v2}=${v1-v2} км/ч. ${dist}÷${v1-v2}=${time} ч`));
    }

    // ── Блок 4: Задачи на стоимость ──
    {
        const price = rnd(10, 50) * 10;
        const qty = rnd(2, 5);
        t.push(choiceT('💰', 'Стоимость', 'badge-task',
            `Тетрадь стоит ${price} руб. Сколько за ${qty} тетрадей?`,
            price * qty, `${price} × ${qty} = ${price * qty} руб.`));
    }
    {
        const total = rnd(100, 300);
        const qty = rnd(2, 5);
        t.push(inputT('�', 'Цена', 'badge-input',
            `За ${qty} кг конфет заплатили ${total} руб. Цена за 1 кг?`,
            Math.round(total / qty), `${total} ÷ ${qty} = ${Math.round(total / qty)} руб/кг`));
    }

    // ── Блок 5: Задачи на части ──
    {
        const base = rnd(5, 20);
        const mult = rnd(2, 4);
        t.push(choiceT('🧩', 'Части', 'badge-task',
            `В одной коробке ${base} карандашей, в другой — в ${mult} раза больше. Сколько во второй?`,
            base * mult, `${base} × ${mult} = ${base * mult}`));
    }
    {
        const big = rnd(20, 60);
        const diff = rnd(5, 15);
        t.push(inputT('🧩', 'Разница', 'badge-input',
            `У Маши ${big} наклеек, у Пети на ${diff} меньше. Сколько у Пети?`,
            big - diff, `${big} − ${diff} = ${big - diff}`));
    }

    // ── Блок 6: Задачи на работу ──
    {
        const prod = rnd(3, 10);
        const hours = rnd(3, 8);
        t.push(choiceT('�', 'Работа', 'badge-task',
            `Рабочий делает ${prod} деталей в час. За ${hours} ч — сколько?`,
            prod * hours, `${prod} × ${hours} = ${prod * hours} деталей`));
    }
    {
        const a = rnd(4, 10), b = rnd(4, 10);
        t.push(inputT('�', 'Совместная', 'badge-input',
            `Первый делает ${a} дет./ч, второй ${b} дет./ч. Вместе за 2 ч — сколько?`,
            (a + b) * 2, `${a}+${b}=${a+b} дет./ч, ×2 = ${(a+b)*2}`));
    }

    // ── Блок 7: Формулы и босс ──
    t.push(choiceT('📐', 'Формула', 'badge-task',
        'Формула расстояния:',
        'S = v × t',
        'Расстояние = скорость × время'));

    t.push(bossT('⭐', 'Босс', 'badge-boss', 'Финальные задачи:', [
        { label: 'Поезд 80 км/ч, 4 ч. Расстояние?', correctAns: 320, hint: '80 × 4 = 320 км' },
        { label: '5 ручек по 30 руб. Сколько всего?', correctAns: 150, hint: '5 × 30 = 150 руб.' },
        { label: 'В одном классе 25 учеников, в другом на 7 больше. Сколько во втором?', correctAns: 32, hint: '25 + 7 = 32' },
        { label: 'Рабочий: 6 дет./ч, 8 ч. Сколько деталей?', correctAns: 48, hint: '6 × 8 = 48' }
    ], 'Текстовые задачи — это математика из жизни!'));

    return t;
}

export function generateMathLesson(skillId) {
    const gens = {
        add: generateAddLesson, sub: generateSubLesson,
        mul: generateMulLesson, mul_small: generateMulSmallLesson,
        div: generateDivLesson, div_small: generateDivSmallLesson,
        eq: generateEqLesson, geom: generateGeomLesson,
        frac: generateFracLesson,
        compare: generateCompareLesson,
        comp_num: generateCompNumLesson,
        even_odd: generateEvenOddLesson,
        order_ops: generateOrderOpsLesson,
        mul_table: generateMulTableLesson,
        len_units: generateLenUnitsLesson,
        mass_units: generateMassUnitsLesson,
        time_clock: generateTimeClockLesson,
        money: generateMoneyLesson,
        percent: generatePercentLesson,
        neg: generateNegLesson,
        prop: generateProportionLesson,
        decimal: generateDecimalLesson,
        divisibility: generateDivisibilityLesson,
        gcd_lcm: generateGcdLcmLesson,
        coord: generateCoordLesson,
        motion: generateMotionLesson
    };
    const gen = gens[skillId];
    const tasks = gen ? gen() : generateAddLesson();
    return trimLesson(tasks);
}
