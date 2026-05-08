// js/components/taskRenderer.js

import { $, $$, generateHintText } from '../utils.js';
import { state } from '../state.js';
import { playSound } from '../sounds.js';

export function renderTask(container, task, options = {}) {
    const { isBonus = false, compact = false } = options;

    return new Promise((resolve) => {
        container.innerHTML = '';

        if (task.emoji) {
            const emojiEl = document.createElement('div');
            emojiEl.className = compact ? 'scene-emoji' : 'lesson-emoji';
            emojiEl.textContent = task.emoji;
            container.appendChild(emojiEl);
        }

        if (task.badge && !compact) {
            const badgeEl = document.createElement('div');
            badgeEl.className = `lesson-type-badge ${task.badgeClass || ''}`;
            badgeEl.textContent = task.badge;
            container.appendChild(badgeEl);
        }

        const questionEl = document.createElement('div');
        questionEl.className = compact ? 'scene-text' : 'lesson-question';
        if (task.question) questionEl.textContent = task.question;
        container.appendChild(questionEl);

        const explanationEl = document.createElement('div');
        explanationEl.className = compact ? 'explanation-box' : 'lesson-explanation';
        container.appendChild(explanationEl);

        // SVG
        if (task.svg) {
            const svgDiv = document.createElement('div');
            svgDiv.className = 'visual-svg-wrapper';
            svgDiv.innerHTML = task.svg;
            svgDiv.style.cssText = 'width:100%;max-width:280px;margin:0 auto 8px;text-align:center;';
            container.appendChild(svgDiv);
        }

        if (task.type === 'visual') {
            renderVisual(container, task, explanationEl, resolve, isBonus, compact);
        } else if (task.type === 'choice') {
            renderChoice(container, task, explanationEl, resolve, isBonus, compact);
        } else if (task.type === 'input') {
            renderInput(container, task, explanationEl, resolve, isBonus, compact);
        } else if (task.type === 'pair') {
            renderPair(container, task, explanationEl, resolve, isBonus, compact);
        } else if (task.type === 'ordering') {
            renderOrdering(container, task, explanationEl, resolve, isBonus, compact);
        } else if (task.type && task.type.startsWith('boss')) {
            renderBoss(container, task, explanationEl, resolve, isBonus);
        }
    });
}

function renderVisual(container, task, explEl, resolve, isBonus, compact) {
    const optsClass = compact ? 'task-options' : 'lesson-options';
    const optClass = compact ? 'task-option' : 'lesson-option';

    const optsDiv = document.createElement('div');
    optsDiv.className = optsClass;

    const correctAnswer = task.correctAns;

    task.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = optClass;
        btn.textContent = optText;
        btn.dataset.idx = idx;
        btn.dataset.value = String(optText);

        btn.addEventListener('click', () => {
            optsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');

            const isCorrect = String(btn.dataset.value) === String(correctAnswer);

            if (isCorrect) {
                playSound('correct', state.theme);
                btn.classList.add('correct-pick');
                btn.textContent = '✅ ' + optText;
                explEl.innerHTML = '<span style="font-size:16px;">✅</span> ' + task.explanation;
                explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
                setTimeout(() => resolve({ isCorrect: true, isBonus }), 400);
            } else {
                playSound('wrong', state.theme);
                btn.classList.add('wrong-pick');
                btn.textContent = '❌ ' + optText;
                optsDiv.querySelectorAll('button').forEach(b => {
                    if (String(b.dataset.value) === String(correctAnswer)) {
                        b.classList.add('correct-pick');
                        b.textContent = '✅ ' + b.dataset.value;
                    }
                });
                explEl.innerHTML = '<span style="font-size:16px;">🤔</span> ' + task.explanation;
                explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show bad';
                setTimeout(() => resolve({ isCorrect: false, isBonus }), 600);
            }
        });

        optsDiv.appendChild(btn);
    });

    container.appendChild(optsDiv);
}

function renderChoice(container, task, explEl, resolve, isBonus, compact) {
    const optsClass = compact ? 'task-options' : 'lesson-options';
    const optClass = compact ? 'task-option' : 'lesson-option';

    const optsDiv = document.createElement('div');
    optsDiv.className = optsClass;

    const correctAnswer = task.correctAns;

    task.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = optClass;
        btn.textContent = optText;
        btn.dataset.idx = idx;
        btn.dataset.value = String(optText);

        btn.addEventListener('click', () => {
            optsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');

            const isCorrect = String(btn.dataset.value) === String(correctAnswer);

            if (isCorrect) {
                playSound('correct', state.theme);
                btn.classList.add('correct-pick');
                btn.textContent = '✅ ' + optText;
                explEl.innerHTML = '<span style="font-size:16px;">✅</span> ' + task.explanation;
                explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
                setTimeout(() => resolve({ isCorrect: true, isBonus }), 400);
            } else {
                playSound('wrong', state.theme);
                btn.classList.add('wrong-pick');
                btn.textContent = '❌ ' + optText;
                optsDiv.querySelectorAll('button').forEach(b => {
                    if (String(b.dataset.value) === String(correctAnswer)) {
                        b.classList.add('correct-pick');
                        b.textContent = '✅ ' + b.dataset.value;
                    }
                });
                explEl.innerHTML = '<span style="font-size:16px;">🤔</span> ' + task.explanation;
                explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show bad';
                setTimeout(() => resolve({ isCorrect: false, isBonus }), 600);
            }
        });

        optsDiv.appendChild(btn);
    });

    container.appendChild(optsDiv);
}

function renderInput(container, task, explEl, resolve, isBonus, compact) {
    const rowDiv = document.createElement('div');
    rowDiv.className = compact ? 'task-input-row' : 'lesson-input-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = compact ? 'task-input' : 'lesson-input';

    if (task.correctAns !== undefined && task.correctAns !== null) {
        const ansStr = String(task.correctAns).toLowerCase();
        if (ansStr === 'н' || ansStr === 'нн') input.placeholder = 'н/нн';
        else if (ansStr === 'ь' || ansStr === 'ъ') input.placeholder = 'ь/ъ';
        else if (ansStr === 'тся' || ansStr === 'ться') input.placeholder = 'тся/ться';
        else if (ansStr === 'и' || ansStr === 'е') input.placeholder = 'букву';
        else if (!isNaN(task.correctAns)) input.placeholder = 'Число';
        else input.placeholder = 'Ответ';
    } else {
        input.placeholder = 'Ответ';
    }
    input.autocomplete = 'off';

    const btn = document.createElement('button');
    btn.className = compact ? 'btn-submit' : 'btn-lesson-submit';
    btn.textContent = '✓';

    const submit = () => {
        const value = input.value.trim().toLowerCase();
        if (!value) {
            input.style.borderColor = 'var(--red)';
            input.style.animation = 'shake 0.5s ease';
            setTimeout(() => { input.style.animation = ''; input.style.borderColor = 'rgba(255,255,255,0.2)'; }, 500);
            return;
        }

        btn.disabled = true;
        input.disabled = true;

        const correctStr = String(task.correctAns).toLowerCase();
        let isCorrect = (value === correctStr);
        if (!isCorrect && correctStr.includes(',')) {
            isCorrect = value === correctStr.replace(/\s+/g, '');
        }

        if (isCorrect) {
            playSound('correct', state.theme);
            input.style.borderColor = 'var(--green)';
            input.style.background = 'rgba(16,185,129,0.2)';
            explEl.textContent = '✅ ' + task.explanation;
            explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
            resolve({ isCorrect: true, isBonus });
        } else {
            playSound('wrong', state.theme);
            input.style.borderColor = 'var(--red)';
            input.style.background = 'rgba(239,68,68,0.15)';
            explEl.textContent = '🤔 ' + task.explanation + ' ✅ ' + task.correctAns;
            explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show bad';
            resolve({ isCorrect: false, isBonus });
        }
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

    rowDiv.appendChild(input);
    rowDiv.appendChild(btn);
    container.appendChild(rowDiv);
}

function renderPair(container, task, explEl, resolve, isBonus, compact) {
    const grid = document.createElement('div');
    grid.className = 'pair-grid';

    const leftDiv = document.createElement('div');
    leftDiv.className = 'pair-left';
    const rightDiv = document.createElement('div');
    rightDiv.className = 'pair-right';

    const leftItems = task.pairs.map((p, i) => ({ text: p.left, idx: i }));
    const rightItems = task.pairs.map((p, i) => ({ text: p.right, idx: i }));

    const shuf = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const shuffledLeft = shuf(leftItems);
    const shuffledRight = shuf(rightItems);

    let selectedLeft = null;
    let matchedCount = 0;
    const total = task.pairs.length;

    shuffledLeft.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'pair-item';
        btn.textContent = item.text;
        btn.dataset.pairIdx = item.idx;
        btn.dataset.side = 'left';
        leftDiv.appendChild(btn);
    });

    shuffledRight.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'pair-item';
        btn.textContent = item.text;
        btn.dataset.pairIdx = item.idx;
        btn.dataset.side = 'right';
        rightDiv.appendChild(btn);
    });

    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px;opacity:0.5;margin-top:6px;text-align:center;';
    hint.textContent = 'Нажимай: левый → правый';

    const allLeftBtns = leftDiv.querySelectorAll('.pair-item');
    const allRightBtns = rightDiv.querySelectorAll('.pair-item');

    allLeftBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('matched')) return;
            if (selectedLeft && selectedLeft.el === btn) {
                btn.classList.remove('selected');
                selectedLeft = null;
                return;
            }
            allLeftBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedLeft = { el: btn, idx: parseInt(btn.dataset.pairIdx) };
        });
    });

    allRightBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('matched')) return;
            if (!selectedLeft) return;

            const rightIdx = parseInt(btn.dataset.pairIdx);

            if (selectedLeft.idx === rightIdx) {
                playSound('correct', state.theme);
                selectedLeft.el.classList.add('matched');
                btn.classList.add('matched');
                matchedCount++;
                selectedLeft = null;
                allLeftBtns.forEach(b => b.classList.remove('selected'));

                if (matchedCount >= total) {
                    explEl.textContent = '✅ ' + (task.explanation || 'Все пары верны!');
                    explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
                    resolve({ isCorrect: true, isBonus });
                }
            } else {
                playSound('wrong', state.theme);
                btn.classList.add('wrong-flash');
                setTimeout(() => btn.classList.remove('wrong-flash'), 500);
                selectedLeft.el.classList.remove('selected');
                selectedLeft = null;
            }
        });
    });

    grid.appendChild(leftDiv);
    grid.appendChild(rightDiv);
    container.appendChild(grid);
    container.appendChild(hint);
}

// ─── ORDERING — расставь по порядку ───────────────────────
function renderOrdering(container, task, explEl, resolve, isBonus, compact) {
    const listDiv = document.createElement('div');
    listDiv.className = 'ordering-list';
    listDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0;';

    const correctOrder = task.correctAns; // массив правильного порядка
    // Перемешиваем элементы
    const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
    let userOrder = [...shuffled];
    const items = [];

    function rebuild() {
        listDiv.innerHTML = '';
        userOrder.forEach((val, idx) => {
            const chip = document.createElement('button');
            chip.className = 'ordering-chip';
            chip.textContent = val;
            chip.style.cssText = 'padding:8px 16px;border-radius:12px;border:2px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:white;font-size:15px;cursor:pointer;transition:all 0.2s;';
            chip.dataset.value = String(val);
            chip.dataset.idx = idx;

            chip.addEventListener('click', () => {
                // Удаляем из текущей позиции и добавляем в конец (циклический сдвиг)
                const currentIdx = parseInt(chip.dataset.idx);
                const moved = userOrder.splice(currentIdx, 1)[0];
                userOrder.push(moved);
                rebuild();
            });

            chip.addEventListener('mouseenter', () => {
                chip.style.borderColor = 'var(--neon-green)';
                chip.style.background = 'rgba(16,185,129,0.2)';
            });
            chip.addEventListener('mouseleave', () => {
                chip.style.borderColor = 'rgba(255,255,255,0.2)';
                chip.style.background = 'rgba(255,255,255,0.08)';
            });

            items.push(chip);
            listDiv.appendChild(chip);
        });
    }

    rebuild();

    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px;opacity:0.6;margin-top:4px;text-align:center;';
    hint.textContent = 'Нажимай на элемент, чтобы передвинуть его в конец';

    const submitBtn = document.createElement('button');
    submitBtn.className = compact ? 'btn-submit' : 'btn-lesson-submit';
    submitBtn.textContent = '✓ Готово';
    submitBtn.style.marginTop = '8px';

    submitBtn.addEventListener('click', () => {
        const isCorrect = userOrder.every((val, i) => String(val) === String(correctOrder[i]));
        submitBtn.disabled = true;
        listDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');

        if (isCorrect) {
            playSound('correct', state.theme);
            listDiv.querySelectorAll('button').forEach(b => {
                b.style.borderColor = 'var(--green)';
                b.style.background = 'rgba(16,185,129,0.3)';
            });
            explEl.textContent = '✅ ' + (task.explanation || 'Правильный порядок!');
            explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
            resolve({ isCorrect: true, isBonus });
        } else {
            playSound('wrong', state.theme);
            listDiv.querySelectorAll('button').forEach((b, i) => {
                if (String(userOrder[i]) === String(correctOrder[i])) {
                    b.style.borderColor = 'var(--green)';
                    b.style.background = 'rgba(16,185,129,0.3)';
                } else {
                    b.style.borderColor = 'var(--red)';
                    b.style.background = 'rgba(239,68,68,0.2)';
                }
            });
            explEl.textContent = '🤔 ' + (task.explanation || '') + ' ✅ ' + correctOrder.join(' → ');
            explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show bad';
            resolve({ isCorrect: false, isBonus });
        }
    });

    container.appendChild(listDiv);
    container.appendChild(hint);
    container.appendChild(submitBtn);
}

// ─── BOSS — поддержка tasks (массив заданий) ──────────────
function renderBoss(container, task, explEl, resolve, isBonus) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;gap:8px;width:100%;';

    const inputs = [];

    // Счётчик для id обратной связи
    let feedbackId = 0;

    // Поддержка нового формата task.tasks (массив подзаданий)
    if (task.tasks && Array.isArray(task.tasks)) {
        task.tasks.forEach((subtask, i) => {
            const row = document.createElement('div');
            row.className = 'boss-row';

            const label = document.createElement('span');
            label.className = 'boss-label';
            label.textContent = subtask.label || subtask.question || `Задание ${i + 1}`;
            if (subtask.question) label.textContent = subtask.question;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'boss-input';
            input.placeholder = 'Ответ';
            input.autocomplete = 'off';
            input.maxLength = 30;

            const ansStr = String(subtask.correctAns || '').toLowerCase();
            if (ansStr === 'н' || ansStr === 'нн') input.placeholder = 'н/нн';
            else if (ansStr === 'ь' || ansStr === 'ъ') input.placeholder = 'ь/ъ';
            else if (ansStr === 'тся' || ansStr === 'ться') input.placeholder = 'тся/ться';
            else if (ansStr === 'и' || ansStr === 'е') input.placeholder = 'букву';
            else if (!isNaN(subtask.correctAns)) input.placeholder = 'Число';
            else input.placeholder = 'Ответ';

            const fbId = `boss-fb-${feedbackId++}`;
            const feedback = document.createElement('div');
            feedback.id = fbId;
            feedback.className = 'boss-feedback';

            row.appendChild(label);
            row.appendChild(input);
            wrapper.appendChild(row);
            wrapper.appendChild(feedback);
            inputs.push({ input, answer: String(subtask.correctAns || '').toLowerCase(), hint: subtask.hint || '', feedbackId: fbId, label: subtask.label || subtask.question || '' });
        });
    }
    // Старый формат task.words
    else if (task.words) {
        task.words.forEach((w) => {
            const row = document.createElement('div');
            row.className = 'boss-row';

            const label = document.createElement('span');
            label.className = 'boss-label';
            label.textContent = w.text;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'boss-input';
            input.placeholder = 'буква';
            input.autocomplete = 'off';
            input.maxLength = 5;

            if (w.answer) {
                if (['н', 'нн'].includes(w.answer)) input.placeholder = 'н/нн';
                else if (['ь', 'ъ'].includes(w.answer)) input.placeholder = 'ь/ъ';
                else if (['тся', 'ться'].includes(w.answer)) input.placeholder = 'тся/ться';
                else if (['и', 'е'].includes(w.answer)) input.placeholder = 'и/е';
            }

            const fbId = `boss-fb-${feedbackId++}`;
            const feedback = document.createElement('div');
            feedback.id = fbId;
            feedback.className = 'boss-feedback';

            row.appendChild(label);
            row.appendChild(input);
            wrapper.appendChild(row);
            wrapper.appendChild(feedback);
            inputs.push({ input, answer: w.answer, hint: w.hint || '', feedbackId: fbId, label: w.text || '' });
        });
    }

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn-lesson-submit';
    submitBtn.textContent = '✓ Проверить';
    submitBtn.style.marginTop = '6px';

    // Собираем итоговый фидбек
    const buildFeedbackSummary = (results) => {
        if (results.every(r => r.ok)) {
            return '✅ Все ответы верны! ' + (task.explanation || 'Отличная работа!');
        }
        const wrongItems = results.filter(r => !r.ok);
        const correctCount = results.length - wrongItems.length;
        let summary = `🤔 Верно: ${correctCount}/${results.length}. `;
        if (wrongItems.length <= 3) {
            summary += 'Ошибки: ' + wrongItems.map(r => `<b>${r.label}</b> → ${r.answer}`).join('; ') + '.';
        } else {
            summary += `Ошибок: ${wrongItems.length}. `;
        }
        summary += ' ' + (task.explanation || 'Повтори правила!');
        return summary;
    };

    submitBtn.addEventListener('click', () => {
        const results = [];
        let allOk = true;

        inputs.forEach(({ input, answer, hint, feedbackId, label }) => {
            const val = input.value.trim().toLowerCase();
            const fbEl = document.getElementById(feedbackId);
            const isCorrect = val === answer;

            if (isCorrect) {
                input.style.borderColor = 'var(--green)';
                input.style.background = 'rgba(16,185,129,0.2)';
                if (fbEl) {
                    fbEl.innerHTML = `<span style="color:var(--green);font-weight:700;">✓ Правильно!</span> ${hint || ''}`;
                    fbEl.className = 'boss-feedback good';
                }
            } else {
                allOk = false;
                input.style.borderColor = 'var(--red)';
                input.style.background = 'rgba(239,68,68,0.15)';
                if (fbEl) {
                    const shownVal = val || '(пусто)';
                    fbEl.innerHTML = `<span style="color:var(--red);font-weight:700;">✗ ${shownVal}</span> → правильно: <b>${answer}</b>. ${hint || ''}`;
                    fbEl.className = 'boss-feedback bad';
                }
            }
            results.push({ ok: isCorrect, label, answer });
        });

        submitBtn.disabled = true;
        inputs.forEach(({ input }) => input.disabled = true);

        if (allOk) {
            playSound('correct', state.theme);
        } else {
            playSound('wrong', state.theme);
        }

        explEl.innerHTML = buildFeedbackSummary(results);
        explEl.className = 'lesson-explanation show ' + (allOk ? 'good' : 'bad');
        resolve({ isCorrect: allOk, isBonus });
    });

    inputs.forEach(({ input }) => {
        input.addEventListener('keydown', e => { if (e.key === 'Enter') submitBtn.click(); });
    });

    wrapper.appendChild(submitBtn);
    container.appendChild(wrapper);
}

// ─── SHOW HINT ─────────────────────────────────────────────
/**
 * Показать визуальную подсказку для текущего задания.
 * Возвращает true если подсказка была показана.
 */
export function showHint(container, task) {
    const hintText = generateHintText(task);
    const type = task.type;

    // Удаляем старую подсказку если есть
    const oldHint = container.querySelector('.hint-tooltip');
    if (oldHint) oldHint.remove();

    if (type === 'choice' || type === 'visual') {
        // Подсветить правильный вариант зелёной обводкой на 2 сек
        const correctAns = String(task.correctAns || task.options?.[task.correctIdx] || '');
        const buttons = container.querySelectorAll('button.lesson-option, button.task-option');
        buttons.forEach(btn => {
            if (String(btn.dataset.value) === correctAns) {
                btn.classList.add('hint-highlight');
                setTimeout(() => btn.classList.remove('hint-highlight'), 2000);
            }
        });
        // Показать текст подсказки
        const explEl = container.querySelector('.lesson-explanation, .explanation-box');
        if (explEl) {
            const prev = explEl.innerHTML;
            explEl.innerHTML = `<span style="font-size:16px;">💡</span> ${hintText}`;
            explEl.className = (explEl.className.includes('explanation-box') ? 'explanation-box' : 'lesson-explanation') + ' show hint';
            setTimeout(() => {
                if (explEl.innerHTML.includes('💡')) {
                    explEl.innerHTML = prev || '';
                    explEl.className = explEl.className.replace(' show hint', '').replace(' show', '');
                }
            }, 3000);
        }
        return true;
    }

    if (type === 'input') {
        const input = container.querySelector('input.lesson-input, input.task-input');
        if (input) {
            const ans = String(task.correctAns || '');
            input.placeholder = `💡 ${ans[0]}… (${ans.length} симв.)`;
            // Автоочистка плейсхолдера через 5 сек
            const origPlaceholder = input.dataset.origPlaceholder || input.placeholder;
            input.dataset.origPlaceholder = origPlaceholder;
            setTimeout(() => {
                if (input.placeholder.includes('💡')) {
                    input.placeholder = input.dataset.origPlaceholder || 'Ответ';
                }
            }, 5000);
        }
        showHintTooltip(container, hintText);
        return true;
    }

    if (type === 'pair') {
        // Подсветить одну верную пару
        const leftBtns = container.querySelectorAll('.pair-item[data-side="left"]:not(.matched)');
        const rightBtns = container.querySelectorAll('.pair-item[data-side="right"]:not(.matched)');
        if (leftBtns.length > 0 && rightBtns.length > 0) {
            const firstLeft = leftBtns[0];
            const pairIdx = firstLeft.dataset.pairIdx;
            const matchRight = [...rightBtns].find(b => b.dataset.pairIdx === pairIdx);
            if (matchRight) {
                firstLeft.classList.add('hint-highlight');
                matchRight.classList.add('hint-highlight');
                setTimeout(() => {
                    firstLeft.classList.remove('hint-highlight');
                    matchRight.classList.remove('hint-highlight');
                }, 2000);
            }
        }
        showHintTooltip(container, hintText);
        return true;
    }

    if (type === 'ordering') {
        // Показать первый элемент правильной цепочки
        const chips = container.querySelectorAll('.ordering-chip');
        const correctOrder = task.correctOrder || task.correctAns || [];
        if (correctOrder.length > 0) {
            const firstCorrect = String(correctOrder[0]);
            chips.forEach(chip => {
                if (String(chip.dataset.value) === firstCorrect) {
                    chip.classList.add('hint-highlight');
                    setTimeout(() => chip.classList.remove('hint-highlight'), 2000);
                }
            });
        }
        showHintTooltip(container, hintText);
        return true;
    }

    if (type === 'boss') {
        // Показать подсказку для первого незаполненного поля
        const rows = container.querySelectorAll('.boss-row');
        for (const row of rows) {
            const input = row.querySelector('.boss-input');
            if (input && !input.value.trim()) {
                const fbEl = row.nextElementSibling;
                if (fbEl && fbEl.classList.contains('boss-feedback')) {
                    const label = row.querySelector('.boss-label')?.textContent || '';
                    fbEl.innerHTML = `<span style="color:var(--neon-green);font-weight:700;">💡</span> ${hintText}`;
                    fbEl.className = 'boss-feedback hint';
                    input.focus();
                    setTimeout(() => {
                        if (fbEl.innerHTML.includes('💡')) {
                            fbEl.innerHTML = '';
                            fbEl.className = 'boss-feedback';
                        }
                    }, 4000);
                }
                break;
            }
        }
        return true;
    }

    // Fallback: просто тултип
    showHintTooltip(container, hintText);
    return true;
}

/** Показать тултип с текстом подсказки */
function showHintTooltip(container, text) {
    const old = container.querySelector('.hint-tooltip');
    if (old) old.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'hint-tooltip';
    tooltip.innerHTML = `<span>💡</span> ${text}`;
    container.appendChild(tooltip);

    // Автоудаление
    setTimeout(() => tooltip.remove(), 4000);
}
