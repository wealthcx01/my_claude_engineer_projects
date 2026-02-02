// Session types and durations
const SESSION_TYPES = {
    POMODORO: { duration: 25 * 60, label: 'Pomodoro' },
    SHORT_BREAK: { duration: 5 * 60, label: 'Short Break' },
    LONG_BREAK: { duration: 15 * 60, label: 'Long Break' }
};

// Fast mode for testing (set to true to use 5-second timers)
const FAST_MODE = window.location.search.includes('fast=true');

// Timer state
let currentSessionType = 'POMODORO';
let pomodoroCount = 0; // Track number of pomodoros for long break
let completedPomodoros = 0; // Track completed pomodoros today
let timeRemaining = FAST_MODE ? 5 : SESSION_TYPES.POMODORO.duration;
let totalTime = FAST_MODE ? 5 : SESSION_TYPES.POMODORO.duration;
let timerInterval = null;
let isRunning = false;

// DOM elements
const timerText = document.getElementById('timer-text');
const sessionLabel = document.getElementById('session-label');
const sessionCounter = document.getElementById('session-counter');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const skipBtn = document.getElementById('skip-btn');
const progressCircle = document.querySelector('.progress-ring-circle');
const completedDotsContainer = document.getElementById('completed-dots');
const muteBtn = document.getElementById('mute-btn');

// Progress ring calculation
const radius = 140;
const circumference = 2 * Math.PI * radius;

// Initialize progress ring
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = '0';

// Audio state
let isMuted = localStorage.getItem('pomodoroMuted') === 'true';

// Web Audio API setup
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio API not supported:', e);
        }
    }
    return audioContext;
}

// Play notification sound using Web Audio API
function playNotificationSound() {
    if (isMuted) return;

    const ctx = initAudioContext();
    if (!ctx) return;

    // Resume audio context if it was suspended (required by browser autoplay policies)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    try {
        // Create oscillator for a pleasant bell-like sound
        const oscillator1 = ctx.createOscillator();
        const oscillator2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Connect nodes
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Set frequencies for a pleasant chord (C and E notes)
        oscillator1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        oscillator2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5

        // Use sine wave for smooth sound
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';

        // Create envelope for natural sound decay
        const now = ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8); // Gradual decay

        // Start and stop oscillators
        oscillator1.start(now);
        oscillator2.start(now);
        oscillator1.stop(now + 0.8);
        oscillator2.stop(now + 0.8);

        // Add a second note for a complete notification
        setTimeout(() => {
            const osc3 = ctx.createOscillator();
            const osc4 = ctx.createOscillator();
            const gain2 = ctx.createGain();

            osc3.connect(gain2);
            osc4.connect(gain2);
            gain2.connect(ctx.destination);

            osc3.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
            osc4.frequency.setValueAtTime(783.99, ctx.currentTime); // G5

            osc3.type = 'sine';
            osc4.type = 'sine';

            const now2 = ctx.currentTime;
            gain2.gain.setValueAtTime(0, now2);
            gain2.gain.linearRampToValueAtTime(0.25, now2 + 0.01);
            gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.8);

            osc3.start(now2);
            osc4.start(now2);
            osc3.stop(now2 + 0.8);
            osc4.stop(now2 + 0.8);
        }, 300);
    } catch (e) {
        console.error('Error playing notification sound:', e);
    }
}

// Toggle mute
function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('pomodoroMuted', isMuted.toString());
    updateMuteButton();
}

// Update mute button appearance
function updateMuteButton() {
    if (muteBtn) {
        if (isMuted) {
            muteBtn.classList.add('muted');
            muteBtn.title = 'Notifications muted - Click to unmute';
        } else {
            muteBtn.classList.remove('muted');
            muteBtn.title = 'Notifications enabled - Click to mute';
        }
    }
}

// LocalStorage functions for completed pomodoros
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

function loadCompletedPomodoros() {
    const data = localStorage.getItem('pomodoroData');
    if (!data) {
        return 0;
    }

    try {
        const { date, count } = JSON.parse(data);
        const today = getTodayDate();

        // Check if the stored date is today
        if (date === today) {
            return count;
        } else {
            // Date has changed, reset counter
            return 0;
        }
    } catch (e) {
        return 0;
    }
}

function saveCompletedPomodoros(count) {
    const data = {
        date: getTodayDate(),
        count: count
    };
    localStorage.setItem('pomodoroData', JSON.stringify(data));
}

function incrementCompletedPomodoros() {
    completedPomodoros++;
    saveCompletedPomodoros(completedPomodoros);
    updateCompletedDotsDisplay();
}

function resetCompletedPomodoros() {
    completedPomodoros = 0;
    saveCompletedPomodoros(0);
    updateCompletedDotsDisplay();
}

function updateCompletedDotsDisplay() {
    // Clear existing dots
    completedDotsContainer.innerHTML = '';

    // Create a dot for each completed pomodoro
    for (let i = 0; i < completedPomodoros; i++) {
        const dot = document.createElement('div');
        dot.className = 'completed-dot';
        dot.title = `Pomodoro ${i + 1}`;
        completedDotsContainer.appendChild(dot);
    }

    // If no pomodoros completed, show a message
    if (completedPomodoros === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No pomodoros completed yet';
        emptyMessage.style.color = '#666';
        emptyMessage.style.fontSize = '0.875rem';
        completedDotsContainer.appendChild(emptyMessage);
    }
}

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update timer display
function updateDisplay() {
    timerText.textContent = formatTime(timeRemaining);
    if (sessionLabel) {
        sessionLabel.textContent = SESSION_TYPES[currentSessionType].label;
    }
    // Update session counter (only show for pomodoro sessions)
    if (sessionCounter) {
        if (currentSessionType === 'POMODORO') {
            const currentSession = (pomodoroCount % 4) + 1;
            sessionCounter.textContent = `Session ${currentSession} of 4`;
            sessionCounter.style.display = 'block';
        } else {
            sessionCounter.style.display = 'none';
        }
    }
}

// Update progress ring
function updateProgressRing() {
    const progress = timeRemaining / totalTime;
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDashoffset = offset;
}

// Start timer
function startTimer() {
    if (isRunning) return;

    isRunning = true;
    startPauseBtn.textContent = 'Pause';

    timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateDisplay();
            updateProgressRing();
        } else {
            // Timer completed - auto-advance to next session
            pauseTimer();
            playNotificationSound(); // Play sound when timer completes
            advanceToNextSession();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    isRunning = false;
    startPauseBtn.textContent = 'Start';

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Reset timer
function resetTimer() {
    pauseTimer();
    if (FAST_MODE) {
        timeRemaining = 5;
        totalTime = 5;
    } else {
        timeRemaining = SESSION_TYPES[currentSessionType].duration;
        totalTime = SESSION_TYPES[currentSessionType].duration;
    }
    updateDisplay();
    updateProgressRing();
}

// Advance to next session (used by both auto-advance and skip)
function advanceToNextSession() {
    // Determine next session type
    if (currentSessionType === 'POMODORO') {
        // Increment completed pomodoros when transitioning from work to break
        incrementCompletedPomodoros();

        pomodoroCount++;
        // Every 4 pomodoros, take a long break
        if (pomodoroCount % 4 === 0) {
            currentSessionType = 'LONG_BREAK';
        } else {
            currentSessionType = 'SHORT_BREAK';
        }
    } else {
        // After any break, return to pomodoro
        currentSessionType = 'POMODORO';
        // Reset counter after long break
        if (currentSessionType === 'POMODORO' && pomodoroCount % 4 === 0) {
            // Counter naturally resets by continuing to increment
            // pomodoroCount will be 4, 8, 12, etc. after long breaks
        }
    }

    // Update to new session duration
    if (FAST_MODE) {
        totalTime = 5; // 5 seconds in fast mode for testing
        timeRemaining = 5;
    } else {
        totalTime = SESSION_TYPES[currentSessionType].duration;
        timeRemaining = totalTime;
    }

    // Update progress ring color and label color based on session type
    updateProgressRingColor();
    updateSessionLabelColor();

    updateDisplay();
    updateProgressRing();
}

// Skip to next session
function skipSession() {
    pauseTimer();
    advanceToNextSession();
}

// Update progress ring color based on session type
function updateProgressRingColor() {
    if (currentSessionType === 'POMODORO') {
        progressCircle.style.stroke = '#ff6347'; // Tomato red
    } else if (currentSessionType === 'SHORT_BREAK') {
        progressCircle.style.stroke = '#4caf50'; // Green
    } else {
        progressCircle.style.stroke = '#2196f3'; // Blue
    }
}

// Update session label color based on session type
function updateSessionLabelColor() {
    if (sessionLabel) {
        if (currentSessionType === 'POMODORO') {
            sessionLabel.style.color = '#ff6347'; // Tomato red
        } else if (currentSessionType === 'SHORT_BREAK') {
            sessionLabel.style.color = '#4caf50'; // Green
        } else {
            sessionLabel.style.color = '#2196f3'; // Blue
        }
    }
}

// Toggle start/pause
function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

// Event listeners
startPauseBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
skipBtn.addEventListener('click', skipSession);
if (muteBtn) {
    muteBtn.addEventListener('click', toggleMute);
}

// Initialize completed pomodoros from localStorage
completedPomodoros = loadCompletedPomodoros();

// Initialize display
updateDisplay();
updateProgressRing();
updateProgressRingColor();
updateSessionLabelColor();
updateCompletedDotsDisplay();
updateMuteButton();
