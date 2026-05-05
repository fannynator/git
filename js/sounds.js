// js/sounds.js

import { playAchievementAnimation } from './lottie.js';

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playCorrectSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        osc1.frequency.setValueAtTime(659.25, now + 0.08);
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.3);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.1);
        osc2.frequency.setValueAtTime(783.99, now + 0.18);
        gain2.gain.setValueAtTime(0.2, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.45);
    } catch (e) {}
}

function playWrongSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.35);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
    } catch (e) {}
}

function playAchievementSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.12);
            gain.gain.setValueAtTime(0.22, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.35);
        });
        [523.25, 659.25, 783.99].forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + 0.5);
            gain.gain.setValueAtTime(0.15, now + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + 0.5);
            osc.stop(now + 0.9);
        });
    } catch (e) {}
    
    playAchievementAnimation();
}

function playPetSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(350, now + 0.15);
        osc.frequency.linearRampToValueAtTime(280, now + 0.3);
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(8, now);
        lfoGain.gain.setValueAtTime(20, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        lfo.start(now);
        lfo.stop(now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
    } catch (e) {}
}

export function spawnConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    
    for (let i = 0; i < 12; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.textContent = '●';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = -(Math.random() * 100) + 'px';
        piece.style.color = colors[Math.floor(Math.random() * colors.length)];
        piece.style.fontSize = (Math.random() * 10 + 6) + 'px';
        piece.style.animationDelay = Math.random() * 0.3 + 's';
        piece.style.animationDuration = (Math.random() * 0.4 + 0.5) + 's';
        container.appendChild(piece);
    }
    
    setTimeout(() => container.remove(), 1200);
}

export function spawnLeaves() {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1000;';
    document.body.appendChild(container);
    
    const leaves = ['🍃', '🌿', '🍂', '🍁', '🌱', '✨'];
    
    for (let i = 0; i < 20; i++) {
        const leaf = document.createElement('span');
        leaf.className = 'leaf-particle';
        leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)];
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.top = -(Math.random() * 50) + 'px';
        leaf.style.fontSize = (Math.random() * 16 + 10) + 'px';
        leaf.style.animationDelay = Math.random() * 0.8 + 's';
        leaf.style.animationDuration = (Math.random() * 1.5 + 2) + 's';
        container.appendChild(leaf);
    }
    
    setTimeout(() => container.remove(), 3500);
}

export function playSound(type) {
    switch (type) {
        case 'correct':
            playCorrectSound();
            break;
        case 'wrong':
            playWrongSound();
            break;
        case 'achievement':
            playAchievementSound();
            spawnConfetti();
            break;
        case 'pet':
            playPetSound();
            break;
    }
}