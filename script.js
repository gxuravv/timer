// Main StopWatch Class
class Stopwatch {
  constructor(displayElement, statusElement) {
    this.display = displayElement;
    this.statusIndicator = statusElement;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.intervalId = null;
    this.running = false;
    this.laps = [];
    this.lastLapTime = 0;

    // Using requestAnimationFrame for more accurate timing
    this.animationFrameId = null;

    // Set initial display
    this.updateDisplay(0);
    this.updateStatus("Ready");
  }

  // Format milliseconds as HH:MM:SS.mm
    formatTime(milliseconds) {
      const hours = Math.floor(milliseconds / 3600000);
      const minutes = Math.floor((milliseconds % 3600000) / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      const ms = String(Math.floor((milliseconds % 1000) / 10)).padStart(2, "0");
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${ms}`;
    }


  // Format time difference for lap display
    formatLapTime(milliseconds) {
      if (milliseconds < 0) return "00:00.00";
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      const ms = Math.floor((milliseconds % 1000) / 10);
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
    }


  // Update the display with current time
  updateDisplay(time) {
    this.display.textContent = this.formatTime(time);
  }

  // Update status indicator
  updateStatus(status) {
    this.statusIndicator.textContent = status;
  }

  // Start the stopwatch
  start() {
    if (!this.running) {
      this.running = true;
      this.startTime = Date.now() - this.elapsedTime;
      this.updateStatus("Running");

      // Use requestAnimationFrame for smoother updates
      const tick = () => {
        if (this.running) {
          this.elapsedTime = Date.now() - this.startTime;
          this.updateDisplay(this.elapsedTime);
          this.animationFrameId = requestAnimationFrame(tick);
        }
      };

      this.animationFrameId = requestAnimationFrame(tick);
    }
  }

  // Stop the stopwatch
// Stop the stopwatch
stop() {
  if (this.running) {
    this.running = false;
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }
  this.updateStatus("Paused");
}

// Reset the stopwatch: always stop + clear to 00:00:00.00
reset() {
  // Ensure it's stopped and no RAF is running
  if (this.running) {
    this.running = false;
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  // Clear timing state
  this.elapsedTime = 0;
  this.lastLapTime = 0;
  this.startTime = null;

  // If you store laps, clear them too
  if (Array.isArray(this.laps)) this.laps.length = 0;

  // Update UI to show zeros
  this.updateDisplay(0);           // should show 00:00:00.00 with your formatter
  this.updateStatus("Ready");      // or whatever label you prefer
}


  // Record a lap
  lap() {
    if (this.running) {
      const lapTime = this.elapsedTime - this.lastLapTime;
      this.laps.push({
        number: this.laps.length + 1,
        lapTime: lapTime,
        totalTime: this.elapsedTime,
      });
      this.lastLapTime = this.elapsedTime;
      return this.laps[this.laps.length - 1];
    }
    return null;
  }

  // Clear all laps
  clearLaps() {
    this.laps = [];
    this.lastLapTime = this.running ? this.elapsedTime : 0;
  }

  // Toggle running state
  toggle() {
    if (this.running) {
      this.stop();
    } else {
      this.start();
    }
  }

  // Get current state
  isRunning() {
    return this.running;
  }

  // Get all laps
  getLaps() {
    return this.laps;
  }
}

// UI Controller
class StopwatchUI {
  constructor() {
    // Elements
    this.displayEl = document.getElementById("display");
    this.statusEl = document.getElementById("statusIndicator");
    this.btnGrid = document.getElementById("btnGrid");
    this.startBtn = document.getElementById("startBtn");
    this.stopBtn = document.getElementById("stopBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.lapBtn = document.getElementById("lapBtn");
    this.clearLapsBtn = document.getElementById("clearLapsBtn");
    this.fullscreenBtn = document.getElementById("fullscreenBtn");
    this.hideBtn = document.getElementById("hideBtn");
    this.showBtn = document.getElementById("showBtn");
    this.settingsBtn = document.getElementById("settingsBtn");
    this.lapsContainer = document.getElementById("lapsContainer");
    this.lapsList = document.getElementById("lapsList");
    this.themeToggle = document.getElementById("themeToggle");

    // Create stopwatch instance
    this.stopwatch = new Stopwatch(this.displayEl, this.statusEl);

    // Initialize
    this.initEventListeners();
    this.loadSettings();
  }

  initEventListeners() {
    // Button listeners
    this.startBtn.addEventListener("click", () => this.handleStart());
    this.stopBtn.addEventListener("click", () => this.handleStop());
    this.resetBtn.addEventListener("click", () => this.handleReset());
    this.lapBtn.addEventListener("click", () => this.handleLap());
    this.clearLapsBtn.addEventListener("click", () => this.handleClearLaps());
    this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());
    this.hideBtn.addEventListener("click", () => this.hideControls());
    this.showBtn.addEventListener("click", () => this.showControls());
    this.themeToggle.addEventListener("click", () => this.toggleTheme());

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Fullscreen change listener
    document.addEventListener("fullscreenchange", () =>
      this.updateFullscreenButton()
    );
  }

  handleStart() {
    this.stopwatch.start();
    this.updateButtonStates();
  }

  handleStop() {
    this.stopwatch.stop();
    this.updateButtonStates();
  }

  handleReset() {
    this.stopwatch.reset();
    this.updateButtonStates();
    this.updateLapsUI();
  }

  handleLap() {
    if (this.stopwatch.isRunning()) {
      const lap = this.stopwatch.lap();
      if (lap) {
        this.addLapToUI(lap);
        this.lapsContainer.classList.remove("hidden");
      }
    }
  }

  handleClearLaps() {
    this.stopwatch.clearLaps();
    this.lapsList.innerHTML = "";
    this.lapsContainer.classList.add("hidden");
  }

  addLapToUI(lap) {
    const lapItem = document.createElement("div");
    lapItem.className = "lap-item";

    const lapNumber = document.createElement("span");
    lapNumber.textContent = lap.number;

    const lapTime = document.createElement("span");
    lapTime.textContent = this.stopwatch.formatLapTime(lap.lapTime);

    const totalTime = document.createElement("span");
    totalTime.textContent = this.stopwatch.formatTime(lap.totalTime);

    lapItem.appendChild(lapNumber);
    lapItem.appendChild(lapTime);
    lapItem.appendChild(totalTime);

    // Highlight fastest and slowest laps
    if (this.stopwatch.getLaps().length > 1) {
      const laps = this.stopwatch.getLaps();
      const lapTimes = laps.map((l) => l.lapTime);
      const fastest = Math.min(...lapTimes);
      const slowest = Math.max(...lapTimes);

      if (lap.lapTime === fastest) {
        lapTime.style.color = "#00b894";
      } else if (lap.lapTime === slowest) {
        lapTime.style.color = "#e74c3c";
      }
    }

    this.lapsList.appendChild(lapItem);
    this.lapsContainer.scrollTop = this.lapsContainer.scrollHeight;
  }

  updateLapsUI() {
    this.lapsList.innerHTML = "";
    const laps = this.stopwatch.getLaps();

    if (laps.length === 0) {
      this.lapsContainer.classList.add("hidden");
      return;
    }

    laps.forEach((lap) => {
      this.addLapToUI(lap);
    });

    this.lapsContainer.classList.remove("hidden");
  }

  updateButtonStates() {
    const isRunning = this.stopwatch.isRunning();

    this.startBtn.classList.toggle("active", isRunning);
    this.stopBtn.classList.toggle(
      "active",
      !isRunning && this.stopwatch.elapsedTime > 0
    );

    // Disable/Enable buttons based on state
    this.startBtn.disabled = isRunning;
    this.stopBtn.disabled = !isRunning;
    this.resetBtn.disabled = isRunning && this.stopwatch.elapsedTime === 0;
    this.lapBtn.disabled = !isRunning;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  updateFullscreenButton() {
    if (document.fullscreenElement) {
      this.fullscreenBtn.textContent = "📺 Exit Fullscreen";
    } else {
      this.fullscreenBtn.textContent = "📺 Fullscreen";
    }
  }

  hideControls() {
    this.btnGrid.classList.add("hidden");
    this.showBtn.classList.remove("hidden");
  }

  showControls() {
    this.btnGrid.classList.remove("hidden");
    this.showBtn.classList.add("hidden");
  }

  toggleTheme() {
    document.body.classList.toggle("light-theme");
    this.themeToggle.textContent = document.body.classList.contains(
      "light-theme"
    )
      ? "🌙"
      : "☀️";

    // Save theme preference
    localStorage.setItem(
      "theme",
      document.body.classList.contains("light-theme") ? "light" : "dark"
    );
  }

  handleKeyDown(e) {
    // Ignore keyboard shortcuts when typing in an input field
    if (e.target.tagName === "INPUT") return;

    switch (e.key.toLowerCase()) {
      case " ":
        e.preventDefault();
        this.stopwatch.toggle();
        this.updateButtonStates();
        break;
      case "r":
        this.handleReset();
        break;
      case "l":
        this.handleLap();
        break;
      case "f":
        e.preventDefault();
        this.toggleFullscreen();
        break;
      case "h":
        if (this.btnGrid.classList.contains("hidden")) {
          this.showControls();
        } else {
          this.hideControls();
        }
        break;
      case "c":
        this.handleClearLaps();
        break;
    }
  }

  loadSettings() {
    // Load theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
      this.themeToggle.textContent = "🌙";
    }

    // Initialize button states
    this.updateButtonStates();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new StopwatchUI();
});
