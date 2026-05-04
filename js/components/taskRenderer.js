// js/components/taskRenderer.js

import { $, $$ } from '../utils.js';
import { playSound } from '../sounds.js';

/**
 * Универсальный рендерер заданий.
 * Вставляет задание в контейнер, обрабатывает ввод и возвращает Promise,
 * который разрешается объектом { isCorrect: boolean, isBonus: boolean } после ответа.
 */
export function renderTask(container, task, options = {}) {
    const { isBonus = false, compact = false } = options;
    
    return new Promise((resolve) => {
        container.innerHTML = '';
        
        // Эмодзи задания
        if (task.emoji) {
            const emojiEl = document.createElement('div');
            emojiEl.className = compact ? 'scene-emoji' : 'lesson-emoji';
            emojiEl.textContent = task.emoji;
            container.appendChild(emojiEl);
        }
        
        // Бейдж (только для уроков, не для историй)
        if (task.badge && !compact) {
            const badgeEl = document.createElement('div');
            badgeEl.className = `lesson-type-badge ${task.badgeClass || ''}`;
            badgeEl.textContent = task.badge;
            container.appendChild(badgeEl);
        }
        
        // Вопрос
        const questionEl = document.createElement('div');
        questionEl.className = compact ? 'scene-text' : 'lesson-question';
        if (task.question) questionEl.textContent = task.question;
        container.appendChild(questionEl);
        
        // Поле для объяснения (скрыто по умолчанию)
        const explanationEl = document.createElement('div');
        explanationEl.className = compact ? 'explanation-box' : 'lesson-explanation';
        container.appendChild(explanationEl);
        
        // Выбираем тип задания
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
    
    const correctAnswer = task.correctAns;
    console.log('[choice] Правильный ответ:', correctAnswer, 'Варианты:', task.options, 'correctIdx:', task.correctIdx);
    
    task.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = optClass;
        btn.textContent = optText;
        btn.dataset.idx = idx;
        btn.dataset.value = String(optText);
        
        btn.addEventListener('click', () => {
            // Блокируем все кнопки
            optsDiv.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');
            
            const chosenValue = btn.dataset.value;
            const isCorrect = String(chosenValue) === String(correctAnswer);
            
            console.log('[choice] Выбрано:', chosenValue, 'Правильное:', correctAnswer, 'Верно?', isCorrect);
            
            if (isCorrect) {
                playSound('correct');
                btn.classList.add('correct-pick');
                explEl.textContent = '✅ ' + task.explanation;
                explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
                resolve({ isCorrect: true, isBonus });
            } else {
                playSound('wrong');
                btn.classList.add('wrong-pick');
                // Подсвечиваем правильную кнопку по значению
                optsDiv.querySelectorAll('button').forEach(b => {
                    if (String(b.dataset.value) === String(correctAnswer)) {
                        b.classList.add('correct-pick');
                    }
                });
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
    
    // Умный placeholder
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
            setTimeout(() => {
                input.style.animation = '';
                input.style.borderColor = 'rgba(255,255,255,0.2)';
            }, 500);
            return;
        }
        
        btn.disabled = true;
        input.disabled = true;
        
        const correctStr = String(task.correctAns).toLowerCase();
        let isCorrect = (value === correctStr);
        
        // Особая обработка для босса геометрии (P и S через запятую)
        if (!isCorrect && correctStr.includes(',')) {
            isCorrect = value === correctStr.replace(/\s+/g, '');
        }
        
        if (isCorrect) {
            playSound('correct');
            input.style.borderColor = 'var(--green)';
            input.style.background = 'rgba(16,185,129,0.2)';
            explEl.textContent = '✅ ' + task.explanation;
            explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
            resolve({ isCorrect: true, isBonus });
        } else {
            playSound('wrong');
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
    
    const shuf = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const shuffledLeft = shuf(leftItems);
    const shuffledRight = shuf(rightItems);
    
    let selectedLeft = null;
    let matchedCount = 0;
    let totalAttempts = 0;
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
            totalAttempts++;
            
            if (selectedLeft.idx === rightIdx) {
                playSound('correct');
                selectedLeft.el.classList.add('matched');
                btn.classList.add('matched');
                matchedCount++;
                selectedLeft = null;
                allLeftBtns.forEach(b => b.classList.remove('selected'));
                
                if (matchedCount >= total) {
                    explEl.textContent = '✅ ' + (task.explanation || 'Все пары соединены верно!');
                    explEl.className = (compact ? 'explanation-box' : 'lesson-explanation') + ' show good';
                    resolve({ isCorrect: true, isBonus });
                }
            } else {
                playSound('wrong');
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
            playSound('correct');
            explEl.textContent = '✅ ' + task.explanation;
            explEl.className = 'lesson-explanation show good';
            resolve({ isCorrect: true, isBonus });
        } else {
            playSound('wrong');
            explEl.textContent = '🤔 ' + task.explanation;
            explEl.className = 'lesson-explanation show bad';
            resolve({ isCorrect: false, isBonus });
        }
    });
    
    inputs.forEach(({ input }) => {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') submitBtn.click();
        });
    });
    
    wrapper.appendChild(submitBtn);
    container.appendChild(wrapper);
}