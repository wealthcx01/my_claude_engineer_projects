// Session types and durations
const SESSION_TYPES = {
    POMODORO: { duration: 25 * 60, label: 'Pomodoro' },
    SHORT_BREAK: { duration: 5 * 60, label: 'Short Break' },
    LONG_BREAK: { duration: 15 * 60, label: 'Long Break' }
};

// Timer state
let currentSessionType = 'POMODORO';
let pomodoroCount = 0; // Track number of pomodoros for long break
let timeRemaining = SESSION_TYPES.POMODORO.duration;
let totalTime = SESSION_TYPES.POMODORO.duration;
let timerInterval = null;
let isRunning = false;

// DOM elements
const timerText = document.getElementById('timer-text');
const sessionLabel = document.getElementById('session-label');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const skipBtn = document.getElementById('skip-btn');
const progressCircle = document.querySelector('.progress-ring-circle');

// Progress ring calculation
const radius = 140;
const circumference = 2 * Math.PI * radius;

// Initialize progress ring
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = '0';

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
            // Timer completed
            pauseTimer();
            // Could add notification sound here
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
    timeRemaining = SESSION_TYPES[currentSessionType].duration;
    totalTime = SESSION_TYPES[currentSessionType].duration;
    updateDisplay();
    updateProgressRing();
}

// Skip to next session
function skipSession() {
    pauseTimer();

    // Determine next session type
    if (currentSessionType === 'POMODORO') {
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
    }

    // Update to new session duration
    totalTime = SESSION_TYPES[currentSessionType].duration;
    timeRemaining = totalTime;

    // Update progress ring color based on session type
    updateProgressRingColor();

    updateDisplay();
    updateProgressRing();
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

// Initialize display
updateDisplay();
updateProgressRing();
updateProgressRingColor();
