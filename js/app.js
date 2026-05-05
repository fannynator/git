// js/app.js

import { $, $$, showToast } from './utils.js';
import { state, loadState, saveState, unlockAchievement, checkAchievements } from './state.js';
import { SUBJECTS, CAT_SPEECH, SUBJECT_EMOJI } from './config.js';
import { renderSkillTree } from './components/skillTree.js';
import { startLesson, closeLesson, nextLessonStep, checkSavedLesson } from './components/lesson.js';
import { openStoryPanel, closeStory, nextStoryStep } from './components/story.js';
import { renderTrapsPanel, updateTrapsBadge } from './components/trap.js';
import { renderProfile } from './components/profile.js';
import { startTutorial } from './components/tutorial.js';
import { playSound } from './sounds.js';
import { createLottie } from './lottie.js';

export function updateStats() {
    $('#gemCount').textContent = state.gems;
    $('#streakCount').textContent = state.streak;
}

export function showAchievementToast(name, desc) {
    const toast = document.getElementById('achToast');
    const text = document.getElementById('achToastText');
    if (!toast || !text) return;
    text.textContent = name + ' — ' + desc;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

export function setCatMood(mood) {
    const catBody = $('#catBody');
    if (!catBody) return;

    const moods = {
        happy: '😺',
        proud: '😸',
        love: '😻',
        sad: '😿',
        wow: '🙀',
        normal: state.subject === SUBJECTS.MATH ? '🐱' : '😺'
    };

    const emoji = moods[mood] || moods.normal;
    catBody.textContent = emoji;

    // Лёгкая анимация эмоции
    catBody.style.transform = 'scale(1.2)';
    setTimeout(() => {
        catBody.style.transform = 'scale(1)';
    }, 200);
    
    // Возвращаем нормальное лицо через 2 секунды
    clearTimeout(catBody._moodTimeout);
    catBody._moodTimeout = setTimeout(() => {
        catBody.textContent = moods.normal;
    }, 2000);
}

export function updateSubjectUI() {
    const im = state.subject === SUBJECTS.MATH;
    $('#headerBar').className = 'header ' + (im ? 'math-header' : 'rus-header');
    $('#catStage').className = 'cat-stage ' + (im ? 'math-stage' : 'rus-stage');
    $('#btnMath').classList.toggle('active', im);
    $('#btnRus').classList.toggle('active', !im);
    $('#app').className = 'app' + (im ? '' : ' rus-mode');
    
    const catSpeech = $('#catSpeech');
    const catBody = $('#catBody');
    if (catSpeech) catSpeech.textContent = im ? CAT_SPEECH.math : CAT_SPEECH.russian;
    if (catBody) catBody.textContent = SUBJECT_EMOJI[state.subject];
}

function setupCatPet() {
    const catBody = $('#catBody');
    const catSpeech = $('#catSpeech');
    if (!catBody || !catSpeech) return;

    catBody.addEventListener('click', () => {
        catBody.classList.add('petted');
        setTimeout(() => catBody.classList.remove('petted'), 600);
        state.totalPets++;
        
        playSound('pet');
        setCatMood('love');
        checkAchievements((name, desc) => showAchievementToast(name, desc));

        const particle = document.createElement('span');
        particle.className = 'hearts-particle';
        particle.textContent = ['❤️', '💕', '✨', '💖'][Math.floor(Math.random() * 4)];
        particle.style.left = (Math.random() * 30 - 10) + 'px';
        particle.style.position = 'absolute';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '10';
        catBody.appendChild(particle);
        setTimeout(() => particle.remove(), 1200);

        catSpeech.textContent = CAT_SPEECH.pet(state.totalPets);
        saveState();
    });
}
function setupCatEyeTracking() {
    const catBody = $('#catBody');
    if (!catBody) return;
    
    // Добавляем зрачки
    const eyes = document.createElement('span');
    eyes.className = 'cat-eyes';
    eyes.innerHTML = '<span class="cat-eye"></span><span class="cat-eye"></span>';
    catBody.appendChild(eyes);
    
    document.addEventListener('mousemove', (e) => {
        const rect = catBody.getBoundingClientRect();
        const catX = rect.left + rect.width / 2;
        const catY = rect.top + rect.height / 3;
        
        const angle = Math.atan2(e.clientY - catY, e.clientX - catX);
        const maxShift = 2;
        const shiftX = Math.cos(angle) * maxShift;
        const shiftY = Math.sin(angle) * maxShift;
        
        const eyeEls = eyes.querySelectorAll('.cat-eye');
        eyeEls.forEach(eye => {
            eye.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
        });
    });
    
    // На телефонах — следим за касанием
    document.addEventListener('touchmove', (e) => {
        if (!e.touches[0]) return;
        const touch = e.touches[0];
        const rect = catBody.getBoundingClientRect();
        const catX = rect.left + rect.width / 2;
        const catY = rect.top + rect.height / 3;
        
        const angle = Math.atan2(touch.clientY - catY, touch.clientX - catX);
        const maxShift = 2;
        const shiftX = Math.cos(angle) * maxShift;
        const shiftY = Math.sin(angle) * maxShift;
        
        const eyeEls = eyes.querySelectorAll('.cat-eye');
        eyeEls.forEach(eye => {
            eye.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
        });
    });
}

function bindEvents() {
    // Переключение предметов
    $('#btnMath').addEventListener('click', () => {
        if (state.subject !== SUBJECTS.MATH) {
            state.subject = SUBJECTS.MATH;
            state.subjectSwitches++;
            if (state.subjectSwitches >= 5) {
                unlockAchievement('erudite', (name, desc) => showAchievementToast(name, desc));
            }
            updateSubjectUI();
            renderSkillTree();
            updateTrapsBadge();
            saveState();
        }
    });

    $('#btnRus').addEventListener('click', () => {
        if (state.subject !== SUBJECTS.RUSSIAN) {
            state.subject = SUBJECTS.RUSSIAN;
            state.subjectSwitches++;
            if (state.subjectSwitches >= 5) {
                unlockAchievement('erudite', (name, desc) => showAchievementToast(name, desc));
            }
            updateSubjectUI();
            renderSkillTree();
            updateTrapsBadge();
            saveState();
        }
    });

    // Навигация
    const setActiveNav = (activeBtn) => {
        $$('.nav-btn').forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');
    };

    $('#navHome').addEventListener('click', () => setActiveNav($('#navHome')));
    $('#navStories').addEventListener('click', () => {
        setActiveNav($('#navStories'));
        openStoryPanel();
    });
    $('#navTraps').addEventListener('click', () => {
        setActiveNav($('#navTraps'));
        renderTrapsPanel();
        $('#trapsPanel').classList.add('active');
    });
    $('#navProfile').addEventListener('click', () => {
        setActiveNav($('#navProfile'));
        renderProfile();
        $('#profilePanel').classList.add('active');
    });

    // Закрытие панелей
    $('#btnStoryPanelClose').addEventListener('click', () => $('#storyPanel').classList.remove('active'));
    $('#btnTrapsPanelClose').addEventListener('click', () => $('#trapsPanel').classList.remove('active'));
    $('#btnProfilePanelClose').addEventListener('click', () => $('#profilePanel').classList.remove('active'));

    $('#trapQuizOverlay').addEventListener('click', e => {
        if (e.target === $('#trapQuizOverlay')) {
            $('#trapQuizOverlay').classList.remove('active');
            updateTrapsBadge();
            renderTrapsPanel();
        }
    });

    // Урок
    $('#lessonCloseBtn').addEventListener('click', closeLesson);
    $('#lessonNextBtn').addEventListener('click', nextLessonStep);
    $('#btnLessonFinish').addEventListener('click', closeLesson);

    // История
    $('#storyNextBtn').addEventListener('click', nextStoryStep);
    $('#storyCloseBtn').addEventListener('click', closeStory);
    $('#btnFinishStory').addEventListener('click', closeStory);
}

function init() {
    loadState();
    updateSubjectUI();
    renderSkillTree();
    updateTrapsBadge();
    updateStats();
    setupCatPet();
    setupCatEyeTracking();
    bindEvents();
    startTutorial();
    setTimeout(() => checkSavedLesson(), 500);
    createLottie('catBody', 'cat', { loop: true, speed: 0.7 });
    console.log('🐱 v15 — готов к мурчанию!');
}

document.addEventListener('DOMContentLoaded', init);
