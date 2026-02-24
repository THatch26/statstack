/**
 * StatStack — Core Game Engine
 * Daily "Higher or Lower" statistics game.
 * All players get the same 10 questions per day via deterministic seeding.
 */

const StatStack = (() => {
  // --- Constants ---
  const ROUNDS_PER_GAME = 10;
  const STORAGE_KEY = 'statstack_data';
  const ANIMATION_DURATION = 600;

  // --- State ---
  let state = {
    round: 0,
    score: 0,
    streak: 0,
    results: [],    // array of true/false for each round
    pairs: [],      // today's 10 stat pairs
    gameOver: false,
    answered: false, // whether current round has been answered
  };

  // --- Seeded RNG (Mulberry32) ---
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getDateSeed() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
    }
    return hash;
  }

  function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  // --- Day Number (for "StatStack #42") ---
  function getDayNumber() {
    const launch = new Date('2025-02-24');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    launch.setHours(0, 0, 0, 0);
    return Math.floor((today - launch) / 86400000) + 1;
  }

  // --- Pair Selection ---
  function selectDailyPairs() {
    const rng = mulberry32(getDateSeed());
    const db = [...STATS_DATABASE];

    // Fisher-Yates shuffle with seeded RNG
    for (let i = db.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [db[i], db[j]] = [db[j], db[i]];
    }

    const pairs = [];
    for (let i = 0; i < ROUNDS_PER_GAME * 2; i += 2) {
      // Ensure the two stats in a pair have different values
      if (db[i].value !== db[i + 1].value) {
        pairs.push([db[i], db[i + 1]]);
      } else {
        // Skip identical values, grab next
        pairs.push([db[i], db[i + 2] || db[0]]);
      }
    }
    return pairs.slice(0, ROUNDS_PER_GAME);
  }

  // --- Number Formatting ---
  function formatNumber(value, unit) {
    if (Math.abs(value) >= 1e12) {
      return (value / 1e12).toFixed(1).replace(/\.0$/, '') + ' trillion';
    }
    if (Math.abs(value) >= 1e9) {
      return (value / 1e9).toFixed(1).replace(/\.0$/, '') + ' billion';
    }
    if (Math.abs(value) >= 1e6) {
      return (value / 1e6).toFixed(1).replace(/\.0$/, '') + ' million';
    }
    if (Math.abs(value) >= 1e4) {
      return value.toLocaleString('en-US');
    }
    if (Number.isInteger(value)) {
      return value.toLocaleString('en-US');
    }
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  function formatWithUnit(value, unit) {
    const formatted = formatNumber(value, unit);
    if (!unit) return formatted;

    // Units that go before the number
    const prefixUnits = ['$', 'USD', '£', 'GBP', '€', 'EUR'];
    if (prefixUnits.includes(unit)) {
      const symbol = unit === 'USD' || unit === '$' ? '$' : unit === 'GBP' || unit === '£' ? '£' : '€';
      return symbol + formatted;
    }

    return `${formatted} ${unit}`;
  }

  // --- Local Storage ---
  function loadSavedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveState() {
    const data = loadSavedState() || { history: {}, stats: { played: 0, wins: 0, currentStreak: 0, maxStreak: 0 } };
    const today = getTodayString();

    data.history[today] = {
      score: state.score,
      results: state.results,
      round: state.round,
      gameOver: state.gameOver,
    };

    if (state.gameOver && !data.history[today].counted) {
      data.stats.played++;
      if (state.score === ROUNDS_PER_GAME) {
        data.stats.wins++;
      }
      if (state.score >= 7) {
        data.stats.currentStreak++;
        data.stats.maxStreak = Math.max(data.stats.maxStreak, data.stats.currentStreak);
      } else {
        data.stats.currentStreak = 0;
      }
      data.history[today].counted = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  function getTodayState() {
    const data = loadSavedState();
    if (!data) return null;
    return data.history[getTodayString()] || null;
  }

  function getStats() {
    const data = loadSavedState();
    if (!data) return { played: 0, wins: 0, currentStreak: 0, maxStreak: 0 };
    return data.stats;
  }

  // --- DOM Helpers ---
  function $(selector) { return document.querySelector(selector); }
  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  // --- Render ---
  function renderRound() {
    if (state.round >= ROUNDS_PER_GAME) {
      endGame();
      return;
    }

    state.answered = false;
    const [statA, statB] = state.pairs[state.round];

    // Update progress
    $('#progress-text').textContent = `${state.round + 1} / ${ROUNDS_PER_GAME}`;
    $('#progress-fill').style.width = `${((state.round) / ROUNDS_PER_GAME) * 100}%`;
    $('#score-display').textContent = state.score;

    // Stat A (known)
    $('#stat-a-text').textContent = statA.text;
    $('#stat-a-value').textContent = formatWithUnit(statA.value, statA.unit);
    $('#stat-a-source').textContent = statA.source;

    // Stat B (unknown — player guesses)
    $('#stat-b-text').textContent = statB.text;
    $('#stat-b-value').textContent = '?';
    $('#stat-b-source').textContent = statB.source;
    $('#stat-b-value').classList.remove('revealed');

    // Reset card states
    const cardA = $('#card-a');
    const cardB = $('#card-b');
    cardA.classList.remove('correct', 'wrong', 'fade-in');
    cardB.classList.remove('correct', 'wrong', 'fade-in');

    // Animate in
    void cardB.offsetWidth; // Force reflow
    cardB.classList.add('fade-in');

    // Show buttons
    show($('#guess-buttons'));
    hide($('#next-button'));
    $('#btn-higher').disabled = false;
    $('#btn-lower').disabled = false;
  }

  function handleGuess(guess) {
    if (state.answered || state.gameOver) return;
    state.answered = true;

    const [statA, statB] = state.pairs[state.round];
    const isHigher = statB.value > statA.value;
    const correct = (guess === 'higher' && isHigher) || (guess === 'lower' && !isHigher);

    state.results.push(correct);
    if (correct) state.score++;

    // Reveal the value with animation
    const valueEl = $('#stat-b-value');
    valueEl.textContent = formatWithUnit(statB.value, statB.unit);
    valueEl.classList.add('revealed');

    // Color feedback
    const cardB = $('#card-b');
    cardB.classList.add(correct ? 'correct' : 'wrong');

    // Update score immediately
    $('#score-display').textContent = state.score;

    // Disable buttons
    $('#btn-higher').disabled = true;
    $('#btn-lower').disabled = true;

    // Show result feedback
    const feedback = $('#feedback');
    feedback.textContent = correct ? 'Correct!' : 'Wrong!';
    feedback.className = 'feedback ' + (correct ? 'feedback-correct' : 'feedback-wrong');
    show(feedback);

    // Show next or finish button
    setTimeout(() => {
      hide($('#guess-buttons'));

      if (state.round + 1 >= ROUNDS_PER_GAME) {
        const nextBtn = $('#next-button');
        nextBtn.textContent = 'See Results';
        show(nextBtn);
      } else {
        show($('#next-button'));
        $('#next-button').textContent = 'Next';
      }

      // Save progress
      state.round++;
      saveState();
    }, ANIMATION_DURATION);
  }

  function nextRound() {
    hide($('#feedback'));
    if (state.round >= ROUNDS_PER_GAME) {
      endGame();
    } else {
      renderRound();
    }
  }

  function endGame() {
    state.gameOver = true;
    const data = saveState();

    hide($('#game-area'));
    show($('#results-area'));

    const dayNum = getDayNumber();
    $('#result-title').textContent = `StatStack #${dayNum}`;
    $('#result-score').textContent = `${state.score} / ${ROUNDS_PER_GAME}`;

    // Score message
    const messages = {
      10: "Perfect! You're a stat genius!",
      9: "Amazing! Nearly perfect!",
      8: "Great job! Impressive knowledge!",
      7: "Solid performance!",
      6: "Not bad! Above average!",
      5: "Right down the middle!",
      4: "Keep at it!",
      3: "Better luck tomorrow!",
      2: "Tricky one today!",
      1: "Tough day!",
      0: "Ouch! Tomorrow's a new day!",
    };
    $('#result-message').textContent = messages[state.score] || "Good game!";

    // Render emoji grid
    const grid = state.results.map(r => r ? '🟩' : '🟥').join('');
    // Split into two rows of 5
    const row1 = grid.substring(0, 10); // 5 emojis × 2 chars each
    const row2 = grid.substring(10);
    $('#result-grid').textContent = row1 + '\n' + row2;

    // Stats
    const stats = data.stats;
    $('#stat-played').textContent = stats.played;
    $('#stat-win-pct').textContent = stats.played ? Math.round((stats.wins / stats.played) * 100) + '%' : '0%';
    $('#stat-current-streak').textContent = stats.currentStreak;
    $('#stat-max-streak').textContent = stats.maxStreak;

    // Update progress bar to full
    $('#progress-fill').style.width = '100%';
  }

  function generateShareText() {
    const dayNum = getDayNumber();
    const grid = state.results.map(r => r ? '🟩' : '🟥');
    const row1 = grid.slice(0, 5).join('');
    const row2 = grid.slice(5).join('');

    return `StatStack #${dayNum} ${state.score}/${ROUNDS_PER_GAME}\n\n${row1}\n${row2}\n\nstatstack.github.io`;
  }

  // --- Countdown Timer ---
  function startCountdown() {
    const el = $('#countdown');
    if (!el) return;

    function update() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;

      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      el.textContent = `${h}:${m}:${s}`;
    }

    update();
    setInterval(update, 1000);
  }

  // --- Init ---
  function init() {
    // Generate today's pairs
    state.pairs = selectDailyPairs();

    // Check for saved game today
    const saved = getTodayState();
    if (saved && saved.gameOver) {
      // Already played today — show results
      state.score = saved.score;
      state.results = saved.results;
      state.round = saved.round;
      state.gameOver = true;
      hide($('#game-area'));
      show($('#results-area'));
      endGame();
      startCountdown();
      return;
    }

    if (saved && saved.round > 0 && !saved.gameOver) {
      // Resume in-progress game
      state.score = saved.score;
      state.results = saved.results;
      state.round = saved.round;
    }

    // Bind events
    $('#btn-higher').addEventListener('click', () => handleGuess('higher'));
    $('#btn-lower').addEventListener('click', () => handleGuess('lower'));
    $('#next-button').addEventListener('click', nextRound);
    $('#share-button').addEventListener('click', () => {
      ShareSystem.share(generateShareText());
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (state.gameOver) return;
      if (e.key === 'ArrowUp' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handleGuess('higher');
      }
      if (e.key === 'ArrowDown' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleGuess('lower');
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (state.answered && !state.gameOver) {
          e.preventDefault();
          nextRound();
        }
      }
    });

    // Show game title with day number
    const titleEl = $('#day-number');
    if (titleEl) titleEl.textContent = `#${getDayNumber()}`;

    // Start
    show($('#game-area'));
    hide($('#results-area'));
    renderRound();
  }

  // Public API
  return {
    init,
    getStats,
    generateShareText,
    getDayNumber,
    formatWithUnit,
    ROUNDS_PER_GAME,
  };
})();

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', StatStack.init);
