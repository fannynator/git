import { playSound } from './sounds.js';
import { $, $$, showToast } from './utils.js';
import { state, loadState, saveState, unlockAchievement, checkAchievements } from './state.js';
import { SUBJECTS, CAT_SPEECH, SUBJECT_EMOJI } from './config.js';
import { renderSkillTree } from './components/skillTree.js';
import { startLesson, closeLesson, nextLessonStep } from './components/lesson.js';
import { openStoryPanel, closeStory, nextStoryStep } from './components/story.js';
import { renderTrapsPanel, updateTrapsBadge } from './components/trap.js';
import { renderProfile } from './components/profile.js';
import { startTutorial } from './components/tutorial.js';

// === Экспорт для других модулей ===
export function updateStats() {
    $('#gemCount').textContent = state.gems;
    $('#streakCount').textContent = state.streak;
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

// === Погладить кота ===
function setupCatPet() {
    const catBody = $('#catBody');
    const catSpeech = $('#catSpeech');
    if (!catBody || !catSpeech) return;
    
    catBody.addEventListener('click', () => {
        catBody.classList.add('petted');
        setTimeout(() => catBody.classList.remove('petted'), 600);
        state.totalPets++;
        playSound('pet');
        checkAchievements();
        
        const particle = document.createElement('span');
        particle.className = 'hearts-particle';
        particle.textContent = ['❤️', '💕', '✨', '💖'][Math.floor(Math.random() * 4)];
        particle.style.left = (Math.random() * 30 - 10) + 'px';
        particle.style.animationDuration = (Math.random() * 0.6 + 0.8) + 's';
        catBody.appendChild(particle);
        setTimeout(() => particle.remove(), 1200);
        
        catSpeech.textContent = CAT_SPEECH.pet(state.totalPets);
        saveState();
    });
}

// === Биндинг событий ===
function bindEvents() {
    // Переключение предметов
    $('#btnMath').addEventListener('click', () => {
        if (state.subject !== SUBJECTS.MATH) {
            state.subject = SUBJECTS.MATH;
            state.subjectSwitches++;
            if (state.subjectSwitches >= 5) unlockAchievement('erudite');
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
            if (state.subjectSwitches >= 5) unlockAchievement('erudite');
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
    $('#navStories').addEventListener('click', () => { setActiveNav($('#navStories')); openStoryPanel(); });
    $('#navTraps').addEventListener('click', () => { setActiveNav($('#navTraps')); renderTrapsPanel(); $('#trapsPanel').classList.add('active'); });
    $('#navProfile').addEventListener('click', () => { setActiveNav($('#navProfile')); renderProfile(); $('#profilePanel').classList.add('active'); });
    
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

// === ИНИЦИАЛИЗАЦИЯ ===
function init() {
    loadState();
    updateSubjectUI();
    renderSkillTree();
    updateTrapsBadge();
    updateStats();
    setupCatPet();
    bindEvents();
    startTutorial();
    // Восстановление урока — после туториала, чтобы не перекрывало
    setTimeout(() => checkSavedLesson(), 500);
    console.log('🐱 v15 МОДУЛЬНАЯ — всё чисто!');
}

document.addEventListener('DOMContentLoaded', init);
