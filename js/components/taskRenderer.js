// js/components/taskRenderer.js

import { $, $$ } from '../utils.js';

/**
 * Универсальный рендерер заданий.
 * Вставляет задание в контейнер, обрабатывает ввод и возвращает Promise,
 * который разрешается объектом { isCorrect: boolean } после ответа.
 * 
 * @param {HTMLElement} container - DOM-элемент, куда рендерить (lessonScene / storyScene)
 * @param {Object} task - объект задания
 * @param {Object} [options] - доп. настройки
 * @param {boolean} [options.isBonus=false] - бонусное задание (не считается ошибкой)
 * @param {boolean} [options.compact=false] - компактный режим для историй
 * @returns {Promise<{isCorrect: boolean}>}
 */
export function renderTask(container, task, options = {}) {
    const { isBonus = false, compact = false } = options;
    
    return new Promise((resolve) => {
        // Очищаем контейнер
        container.innerHTML = '';
        
        // === ШАПКА ЗАДАНИЯ ===
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
        
        // === ПОЛЕ ОБЪЯСНЕНИЯ (скрыто) ===
        const explanationEl = document.createElement('div');
        explanationEl.className = compact ? 'explanation-box' : 'lesson-explanation';
        container.appendChild(explanationEl);
        
        // === РЕНДЕР ПО ТИПУ ЗАДАНИЯ ===
        if (task.type === 'choice') {
            renderChoice(container, task, explanationEl, resolve, isBonus, compact);
        } else if (task.type === 'input') {
            renderInput(container, task, explanationEl, resolve, isBonus, compact);
        } else if (task.type === 'pair') {
            renderPair(container, task, explanationEl, resolve, isBonus, compact);
        } else if (task.type && task.type.startsWith('boss')) {
            renderBoss(container, task, explanationEl, resolve, isBonus);
        }
    });
}

/**
 * Задание с выбором варианта
 */
function renderChoice(container, task, explEl, resolve, isBonus, compact) {
    const optsClass = compact ? 'task-options' : 'lesson-options';
    const optClass = compact ? 'task-option' : 'lesson-option';
    
    const optsDiv = document.createElement('div');
    optsDiv.className = optsClass;
    
    task.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = optClass;
        btn.textContent = optText;
        btn.dataset.idx = idx;
        
        btn.addEventListener('click', () => {
            // Блокируем все кнопки
            optsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
            
            if (idx === task.correctIdx) {
                btn.classList.add('correct-pick');
                explEl.textContent = '✅ ' + task.explanation;
                explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
                resolve({ isCorrect: true, isBonus });
            } else {
                btn.classList.add('wrong-pick');
                // Подсвечиваем правильный
                const correctBtn = optsDiv.querySelector(`[data-idx="${task.correctIdx}"]`);
                if (correctBtn) correctBtn.classList.add('correct-pick');
                explEl.textContent = '🤔 ' + task.explanation;
                explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show bad';
                resolve({ isCorrect: false, isBonus });
            }
        });
        
        optsDiv.appendChild(btn);
    });
    
    container.appendChild(optsDiv);
}

/**
 * Задание с текстовым вводом
 */
function renderInput(container, task, explEl, resolve, isBonus, compact) {
    const rowDiv = document.createElement('div');
    rowDiv.className = compact ? 'task-input-row' : 'lesson-input-row';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = compact ? 'task-input' : 'lesson-input';
    
    // Подсказка placeholder
    if (task.correctAns && typeof task.correctAns === 'string') {
        if (['н', 'нн'].includes(task.correctAns)) input.placeholder = 'н/нн';
        else if (['ь', 'ъ'].includes(task.correctAns)) input.placeholder = 'ь/ъ';
        else if (['тся', 'ться'].includes(task.correctAns)) input.placeholder = 'тся/ться';
        else if (['и', 'е'].includes(task.correctAns)) input.placeholder = 'и/е';
        else input.placeholder = 'букву';
    } else {
        input.placeholder = 'Число';
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
            setTimeout(() => {
                input.style.animation = '';
                input.style.borderColor = 'rgba(255,255,255,0.2)';
            }, 500);
            return;
        }
        
        btn.disabled = true;
        input.disabled = true;
        
        const correctStr = String(task.correctAns).toLowerCase();
        const isCorrect = (value === correctStr) ||
            (correctStr.includes(',') && value === correctStr.replace(/,/g, ''));
        
        if (isCorrect) {
            input.style.borderColor = 'var(--green)';
            input.style.background = 'rgba(16,185,129,0.2)';
            explEl.textContent = '✅ ' + task.explanation;
            explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
            resolve({ isCorrect: true, isBonus });
        } else {
            input.style.borderColor = 'var(--red)';
            input.style.background = 'rgba(239,68,68,0.15)';
            explEl.textContent = '🤔 ' + task.explanation + ' ✅ ' + task.correctAns;
            explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show bad';
            resolve({ isCorrect: false, isBonus });
        }
    };
    
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') submit();
    });
    
    rowDiv.appendChild(input);
    rowDiv.appendChild(btn);
    container.appendChild(rowDiv);
}

/**
 * Задание на составление пар
 */
function renderPair(container, task, explEl, resolve, isBonus, compact) {
    const grid = document.createElement('div');
    grid.className = 'pair-grid';
    
    const leftDiv = document.createElement('div');
    leftDiv.className = 'pair-left';
    const rightDiv = document.createElement('div');
    rightDiv.className = 'pair-right';
    
    const leftItems = task.pairs.map((p, i) => ({ text: p.left, idx: i }));
    const rightItems = task.pairs.map((p, i) => ({ text: p.right, idx: i }));
    
    // Перемешиваем стороны независимо
    const shuf = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const shuffledLeft = shuf(leftItems);
    const shuffledRight = shuf(rightItems);
    
    let selectedLeft = null;
    let matchedCount = 0;
    const total = task.pairs.length;
    const allButtons = [];
    
    shuffledLeft.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'pair-item';
        btn.textContent = item.text;
        btn.dataset.pairIdx = item.idx;
        btn.dataset.side = 'left';
        leftDiv.appendChild(btn);
        allButtons.push(btn);
    });
    
    shuffledRight.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'pair-item';
        btn.textContent = item.text;
        btn.dataset.pairIdx = item.idx;
        btn.dataset.side = 'right';
        rightDiv.appendChild(btn);
        allButtons.push(btn);
    });
    
    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px;opacity:0.5;margin-top:6px;text-align:center;';
    hint.textContent = 'Нажимай: левый → правый';
    
    allButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const side = btn.dataset.side;
            const pidx = parseInt(btn.dataset.pairIdx);
            
            if (side === 'left') {
                // Снимаем выделение со всех левых
                leftDiv.querySelectorAll('.pair-item').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedLeft = { el: btn, idx: pidx };
            } else {
                if (!selectedLeft) return;
                
                if (selectedLeft.idx === pidx) {
                    // Правильная пара
                    selectedLeft.el.classList.add('matched');
                    btn.classList.add('matched');
                    matchedCount++;
                    selectedLeft = null;
                    leftDiv.querySelectorAll('.pair-item').forEach(b => b.classList.remove('selected'));
                    
                    if (matchedCount >= total) {
                        explEl.textContent = '✅ ' + (task.explanation || 'Всё верно!');
                        explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
                        resolve({ isCorrect: true, isBonus });
                    }
                } else {
                    // Неправильная пара
                    btn.classList.add('wrong-flash');
                    setTimeout(() => btn.classList.remove('wrong-flash'), 500);
                    selectedLeft.el.classList.remove('selected');
                    selectedLeft = null;
                    
                    if (!isBonus) {
                        explEl.textContent = '🤔 ' + (task.explanation || 'Попробуй ещё');
                        explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show bad';
                        // В парах не резолвим сразу — даём ещё попытку
                    }
                }
            }
        });
    });
    
    grid.appendChild(leftDiv);
    grid.appendChild(rightDiv);
    container.appendChild(grid);
    container.appendChild(hint);
}

/**
 * Задание типа "Босс" (несколько полей ввода)
 */
function renderBoss(container, task, explEl, resolve, isBonus) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;gap:8px;width:100%;';
    
    const inputs = [];
    task.words.forEach((w, wi) => {
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
        // Подбираем плейсхолдер
        if (w.answer) {
            if (['н', 'нн'].includes(w.answer)) input.placeholder = 'н/нн';
            else if (['ь', 'ъ'].includes(w.answer)) input.placeholder = 'ь/ъ';
            else if (['тся', 'ться'].includes(w.answer)) input.placeholder = 'тся/ться';
            else if (['и', 'е'].includes(w.answer)) input.placeholder = 'и/е';
        }
        
        row.appendChild(label);
        row.appendChild(input);
        wrapper.appendChild(row);
        inputs.push({ input, answer: w.answer });
    });
    
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn-lesson-submit';
    submitBtn.textContent = '✓ Проверить';
    submitBtn.style.marginTop = '6px';
    
    submitBtn.addEventListener('click', () => {
        let allOk = true;
        inputs.forEach(({ input, answer }) => {
            const val = input.value.trim().toLowerCase();
            if (val !== answer) {
                allOk = false;
                input.style.borderColor = 'var(--red)';
                input.style.background = 'rgba(239,68,68,0.15)';
            } else {
                input.style.borderColor = 'var(--green)';
                input.style.background = 'rgba(16,185,129,0.2)';
            }
        });
        
        submitBtn.disabled = true;
        inputs.forEach(({ input }) => input.disabled = true);
        
        if (allOk) {
            explEl.textContent = '✅ ' + task.explanation;
            explEl.className = 'lesson-explanation show good';
            resolve({ isCorrect: true, isBonus });
        } else {
            explEl.textContent = '🤔 ' + task.explanation;
            explEl.className = 'lesson-explanation show bad';
            resolve({ isCorrect: false, isBonus });
        }
    });
    
    // Enter на любом поле = сабмит
    inputs.forEach(({ input }) => {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') submitBtn.click();
        });
    });
    
    wrapper.appendChild(submitBtn);
    container.appendChild(wrapper);
}