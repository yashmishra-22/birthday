/* ================================================================
   BIRTHDAY SURPRISE WEBSITE — script.js
   ================================================================ */

/* ──────────────────────────────────────────────────────────────
   1. CONFIGURATION — Edit everything here to personalise
   ────────────────────────────────────────────────────────────── */

const CONFIG = {

  // Secret entry password (date or any string, case-insensitive)
  // Set to null or "" to skip the entry gate entirely
  SECRET_PASSWORD: "01/01/2000",

  // Birthday message typed on Page 2 (supports \n for line breaks)
  BIRTHDAY_MESSAGE:
    "Hey Sama, 🌸\n\n" +
    "I wanted to take a moment to tell you just how incredibly special you are.\n\n" +
    "Every single day you light up the world simply by being in it. " +
    "Your laugh, your kindness, your heart — they make everything better.\n\n" +
    "Wishing you a birthday as beautiful, warm, and wonderful as you are. 💜\n\n" +
    "Here's to you — today and every day. ✨",

  // Typing speed (ms per character)
  TYPING_SPEED_MS: 35,

  // Floating hearts — how many & how often (ms)
  HEART_COUNT:    15,
  HEART_INTERVAL: 1200,

  // Music file path (replace with your actual file)
  MUSIC_SRC: "assets/music.mpeg",

  // Music volume 0–1
  MUSIC_VOLUME: 0.35,
};

/* ──────────────────────────────────────────────────────────────
   2. MEMORIES DATA — Add / remove / edit as needed
      img:     path relative to index.html  (e.g. "assets/mem1.jpg")
      title:   short card title
      caption: full message shown in modal
      date:    displayed above the title in modal
   ────────────────────────────────────────────────────────────── */

const MEMORIES = [
  {
    img:     "assets/mem1.jpg",
    title:   "The Beginning 🌅",
    caption: "Do you remember the very first day? I knew then that something wonderful had just started.",
    date:    "January 2023",
  },
  {
    img:     "assets/mem2.jpg",
    title:   "That Rainy Day ☔",
    caption: "We got soaked but we couldn't stop laughing. Some of the best moments are the unplanned ones.",
    date:    "March 2023",
  },
  {
    img:     "assets/mem3.jpg",
    title:   "Golden Hour 🌇",
    caption: "Watching the sunset with you felt like time was standing still just for us.",
    date:    "April 2023",
  },
  {
    img:     "assets/mem4.jpg",
    title:   "Our Secret Spot 🌿",
    caption: "That little corner of the world that became ours. I never want to forget the way you smiled there.",
    date:    "June 2023",
  },
  {
    img:     "assets/mem5.jpg",
    title:   "Late Night Talks 🌙",
    caption: "Hours would pass like minutes. I could listen to you forever and never get tired.",
    date:    "August 2023",
  },
  {
    img:     "assets/mem6.jpg",
    title:   "First Adventure 🗺️",
    caption: "We got lost — and honestly, that was the best part. Every wrong turn led to something better.",
    date:    "September 2023",
  },
  {
    img:     "assets/mem7.jpg",
    title:   "The Little Things 🌸",
    caption: "It's not the big moments I cherish most — it's the small, quiet ones, just being beside you.",
    date:    "October 2023",
  },
  {
    img:     "assets/mem8.jpg",
    title:   "Laughter & Light ✨",
    caption: "Your laugh is genuinely contagious. Every room feels brighter when you're in it.",
    date:    "November 2023",
  },
  {
    img:     "assets/mem9.jpg",
    title:   "Winter Warmth ❄️",
    caption: "Cold outside, but so warm with you next to me. Some days are just perfect.",
    date:    "December 2023",
  },
  {
    img:     "assets/mem10.jpg",
    title:   "New Year Dreams 🎆",
    caption: "Standing there at midnight, I made a wish — and it was all about you.",
    date:    "January 2024",
  },
  {
    img:     "assets/mem11.jpg",
    title:   "Always There 💛",
    caption: "In every hard moment, you showed up. That means more than words can say.",
    date:    "February 2024",
  },
  {
    img:     "assets/mem12.jpg",
    title:   "Right Here, Right Now 💜",
    caption: "And now, today — your birthday. I hope it feels as magical as you make every ordinary day feel.",
    date:    "Your Special Day 🎂",
  },
];

/* ══════════════════════════════════════════════════════════════
   3. PAGE NAVIGATION
   ══════════════════════════════════════════════════════════════ */

/**
 * Switch from the current active page to the target page
 * with a smooth fade + slide transition.
 * @param {string} targetId — the id of the <section> to show
 */
function goToPage(targetId) {
  const current = document.querySelector(".page.active");
  const target  = document.getElementById(targetId);

  if (!target || current === target) return;

  // Trigger exit on the current page
  if (current) {
    current.classList.add("exit");
    current.classList.remove("active");

    // Remove exit class after animation completes (0.4s)
    setTimeout(() => current.classList.remove("exit"), 450);
  }

  // Activate the target page
  target.classList.add("active");

  // Run page-specific setup hooks
  onPageEnter(targetId);
}

/**
 * Called whenever a page becomes active.
 * Use this to trigger page-specific effects.
 */
function onPageEnter(pageId) {
  switch (pageId) {

    case "page-birthday":
      // Start the typing animation
      startTypingAnimation();
      // Boost hearts on birthday page
      startFloatingHearts(true);
      break;

    case "page-memories":
      // Build the grid if not already built
      buildMemoryGrid();
      stopHeartsBurst();
      break;

    case "page-thankyou":
      // Fire confetti 🎉
      fireConfetti();
      startFloatingHearts(true);
      break;

    default:
      stopHeartsBurst();
      break;
  }
}

/* ══════════════════════════════════════════════════════════════
   4. SECRET ENTRY
   ══════════════════════════════════════════════════════════════ */

function checkEntry() {
  // If no password set, skip gate
  if (!CONFIG.SECRET_PASSWORD) {
    goToPage("page-intro");
    return;
  }

  const input = document.getElementById("entry-input");
  const error = document.getElementById("entry-error");
  const card  = document.querySelector(".entry-card");

  const value = input.value.trim();

  if (value.toLowerCase() === CONFIG.SECRET_PASSWORD.toLowerCase()) {
    // Correct — go to intro
    error.textContent = "";
    goToPage("page-intro");
  } else {
    // Wrong — show error and shake
    error.textContent = "Hmm, that's not quite right. Try again 💭";
    card.classList.remove("shake");
    // Force reflow to restart animation
    void card.offsetWidth;
    card.classList.add("shake");
    input.value = "";
    input.focus();
  }
}

// Allow pressing Enter in the input field
document.getElementById("entry-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkEntry();
});

// Skip entry gate if no password configured
if (!CONFIG.SECRET_PASSWORD) {
  // Directly show intro
  document.getElementById("page-entry").classList.remove("active");
  document.getElementById("page-intro").classList.add("active");
}

/* ══════════════════════════════════════════════════════════════
   5. TYPING ANIMATION
   ══════════════════════════════════════════════════════════════ */

let typingTimer   = null; // reference so we can cancel if needed
let typingDone    = false;

function startTypingAnimation() {
  // Reset if re-entering the page
  const el     = document.getElementById("bday-typing");
  const cursor = document.getElementById("typing-cursor");
  const btn    = document.getElementById("see-memories-btn");

  el.textContent     = "";
  cursor.style.display = "inline-block";
  btn.classList.add("hidden");
  typingDone = false;

  if (typingTimer) clearTimeout(typingTimer);

  // Convert \n to line breaks for display
  // We'll insert characters one by one, handling \n as <br>
  const message = CONFIG.BIRTHDAY_MESSAGE;
  let   index   = 0;

  function typeNext() {
    if (index >= message.length) {
      // Typing complete
      typingDone = true;
      cursor.style.display = "none";
      // Show the "See Memories" button after a short pause
      setTimeout(() => btn.classList.remove("hidden"), 700);
      return;
    }

    const char = message[index];
    if (char === "\n") {
      el.innerHTML += "<br/>";
    } else {
      // Escape HTML entities just in case
      const span = document.createElement("span");
      span.textContent = char;
      el.appendChild(span);
    }

    index++;
    typingTimer = setTimeout(typeNext, CONFIG.TYPING_SPEED_MS);
  }

  // Small delay before starting
  typingTimer = setTimeout(typeNext, 500);
}

// Allow clicking the message area to skip typing animation
document.getElementById("bday-typing").addEventListener("click", () => {
  if (typingDone) return;
  // Skip to end
  clearTimeout(typingTimer);
  const el     = document.getElementById("bday-typing");
  const cursor = document.getElementById("typing-cursor");
  const btn    = document.getElementById("see-memories-btn");

  el.innerHTML = CONFIG.BIRTHDAY_MESSAGE
    .replace(/\n/g, "<br/>");
  cursor.style.display = "none";
  typingDone = true;
  setTimeout(() => btn.classList.remove("hidden"), 300);
});

/* ══════════════════════════════════════════════════════════════
   6. MEMORY GRID
   ══════════════════════════════════════════════════════════════ */

let gridBuilt = false;

function buildMemoryGrid() {
  if (gridBuilt) return;
  gridBuilt = true;

  const grid = document.getElementById("memory-grid");

  MEMORIES.forEach((mem, index) => {
    const card = document.createElement("div");
    card.className  = "memory-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Memory: ${mem.title}`);

    // Staggered fade-in via inline style delay
    card.style.animation       = `fadeIn 0.5s ease both`;
    card.style.animationDelay  = `${index * 0.07}s`;

    card.innerHTML = `
      <img
        src="${mem.img}"
        alt="${mem.title}"
        loading="lazy"
        onerror="this.src='https://placehold.co/400x400/FFB6C1/fff?text=Memory+${index + 1}'"
      />
      <div class="card-overlay">
        <span class="card-overlay-title">${mem.title}</span>
      </div>
    `;

    // Click → open modal
    card.addEventListener("click",   () => openModal(index));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openModal(index);
    });

    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════════════════════════
   7. MEMORY MODAL
   ══════════════════════════════════════════════════════════════ */

function openModal(index) {
  const mem   = MEMORIES[index];
  const modal = document.getElementById("memory-modal");

  document.getElementById("modal-photo").src     = mem.img;
  document.getElementById("modal-photo").onerror = function () {
    this.src = `https://placehold.co/400x500/E6CCFF/fff?text=Memory+${index + 1}`;
  };
  document.getElementById("modal-date").textContent    = mem.date;
  document.getElementById("modal-title").textContent   = mem.title;
  document.getElementById("modal-caption").textContent = mem.caption;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // prevent background scroll

  // Trap focus inside modal for accessibility
  setTimeout(() => modal.querySelector(".modal-close").focus(), 100);
}

function closeModal() {
  const modal = document.getElementById("memory-modal");
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Close modal on overlay click (outside the card)
document.getElementById("memory-modal").addEventListener("click", function (e) {
  if (e.target === this) closeModal();
});

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ══════════════════════════════════════════════════════════════
   8. FLOATING HEARTS
   ══════════════════════════════════════════════════════════════ */

const HEARTS      = ["❤️", "🩷", "💜", "💙", "💛", "🩵", "🤍", "✨"];
let   heartIntervalId  = null;
let   heartBurstActive = false;

/**
 * Start spawning floating hearts.
 * @param {boolean} burst — if true, spawn more frequently
 */
function startFloatingHearts(burst = false) {
  heartBurstActive = burst;
  if (heartIntervalId) return; // already running

  const container = document.getElementById("hearts-container");
  const interval  = burst ? CONFIG.HEART_INTERVAL * 0.5 : CONFIG.HEART_INTERVAL;

  function spawnHeart() {
    const heart      = document.createElement("span");
    heart.className  = "floating-heart";
    heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];

    // Random horizontal position
    heart.style.left = `${Math.random() * 98}vw`;

    // Random size
    const size = 1.2 + Math.random() * 1.8;
    heart.style.fontSize = `${size}rem`;

    // Random speed (6s – 14s)
    const duration = 6 + Math.random() * 8;
    heart.style.animationDuration = `${duration}s`;

    // Random delay so they don't all start together
    heart.style.animationDelay = `${Math.random() * 2}s`;

    container.appendChild(heart);

    // Remove after animation completes to avoid DOM bloat
    setTimeout(() => heart.remove(), (duration + 2) * 1000);
  }

  // Spawn initial batch
  for (let i = 0; i < 5; i++) spawnHeart();

  heartIntervalId = setInterval(spawnHeart, burst ? 600 : CONFIG.HEART_INTERVAL);
}

function stopHeartsBurst() {
  // Reduce to gentle background hearts
  clearInterval(heartIntervalId);
  heartIntervalId = null;
  heartBurstActive = false;
  // Restart at normal rate
  startFloatingHearts(false);
}

// Kick off gentle hearts immediately on load
startFloatingHearts(false);

/* ══════════════════════════════════════════════════════════════
   9. CONFETTI (canvas-confetti CDN loaded in HTML)
   ══════════════════════════════════════════════════════════════ */

function fireConfetti() {
  if (typeof confetti === "undefined") return;

  // First burst — centre spread
  confetti({
    particleCount: 130,
    spread:        80,
    origin:        { y: 0.55 },
    colors:        ["#FFB6C1", "#E6CCFF", "#D6F0FF", "#ffe066", "#ff9de2"],
  });

  // Second burst — left cannon
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle:         60,
      spread:        55,
      origin:        { x: 0, y: 0.65 },
      colors:        ["#FFB6C1", "#c79eff", "#6ec6ff"],
    });
  }, 350);

  // Third burst — right cannon
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle:         120,
      spread:        55,
      origin:        { x: 1, y: 0.65 },
      colors:        ["#FFB6C1", "#c79eff", "#6ec6ff"],
    });
  }, 700);

  // Continuous gentle shower for 4 seconds
  let elapsed = 0;
  const showerInterval = setInterval(() => {
    confetti({
      particleCount: 18,
      spread:        70,
      origin:        { x: Math.random(), y: 0 },
      gravity:       0.6,
      ticks:         180,
      colors:        ["#FFB6C1", "#E6CCFF", "#D6F0FF", "#ffe066"],
    });
    elapsed += 400;
    if (elapsed >= 4000) clearInterval(showerInterval);
  }, 400);
}

/* ══════════════════════════════════════════════════════════════
   10. BACKGROUND MUSIC
   ══════════════════════════════════════════════════════════════ */

const musicEl  = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-btn");

musicEl.volume = CONFIG.MUSIC_VOLUME;
let musicPlaying = false;

function toggleMusic() {
  if (musicPlaying) {
    musicEl.pause();
    musicBtn.textContent = "🔇";
    musicBtn.classList.add("muted");
    musicPlaying = false;
  } else {
    musicEl.play().catch(() => {
      // Autoplay blocked — user must interact first (already handled by button click)
    });
    musicBtn.textContent = "🎵";
    musicBtn.classList.remove("muted");
    musicPlaying = true;
  }
}

musicBtn.addEventListener("click", toggleMusic);

// Attempt autoplay when the user first interacts with the page
document.addEventListener("click", function autoPlayOnce() {
  if (!musicPlaying) {
    musicEl.play()
      .then(() => {
        musicPlaying = true;
        musicBtn.textContent = "🎵";
        musicBtn.classList.remove("muted");
      })
      .catch(() => {}); // silently fail if still blocked
  }
  document.removeEventListener("click", autoPlayOnce);
}, { once: true });

/* ══════════════════════════════════════════════════════════════
   11. INTRO PHOTO — date input formatting helper
   ══════════════════════════════════════════════════════════════ */

// Auto-format DD/MM/YYYY as user types
document.getElementById("entry-input").addEventListener("input", function () {
  let val = this.value.replace(/\D/g, ""); // digits only
  if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
  if (val.length > 5) val = val.slice(0, 5) + "/" + val.slice(5, 9);
  this.value = val;
});

/* ══════════════════════════════════════════════════════════════
   12. KEYBOARD NAVIGATION (accessibility)
   ══════════════════════════════════════════════════════════════ */

// Allow Tab+Enter on memory cards (already handled per card in buildMemoryGrid)
// Global Escape already closes modal (handled above)

console.log("🎂 Birthday surprise loaded! Edit CONFIG and MEMORIES in script.js to personalise.");
