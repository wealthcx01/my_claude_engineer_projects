// Timer state
let timeRemaining = 25 * 60; // 25 minutes in seconds
let totalTime = 25 * 60;
let timerInterval = null;
let isRunning = false;

// DOM elements
const timerText = document.getElementById('timer-text');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
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
    timeRemaining = totalTime;
    updateDisplay();
    updateProgressRing();
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

// Initialize display
updateDisplay();
updateProgressRing();
