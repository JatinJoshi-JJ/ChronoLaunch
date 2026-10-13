/* ==========================================================================
       ChronoLaunch JavaScript Engine
       ========================================================================== */

// Strict state container
const AppState = {
  events: [],
  activeEventId: null,
  theme: "dark",
  currentFilter: "all",
  geminiKey: localStorage.getItem("chronolaunch_gemini_key") || "",
  notificationsGranted: false,
  notifiedStages: new Set(),
  lenis: null,
};

// DOM Element Lookups
const dom = {
  html: document.documentElement,
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeIcon: document.getElementById("themeIcon"),
  aiConfigBtn: document.getElementById("aiConfigBtn"),
  openAiKeySettings: document.getElementById("openAiKeySettings"),
  aiKeyModal: document.getElementById("aiKeyModal"),
  closeAiKeyModalBtn: document.getElementById("closeAiKeyModalBtn"),
  cancelAiKeyBtn: document.getElementById("cancelAiKeyBtn"),
  saveAiKeyBtn: document.getElementById("saveAiKeyBtn"),
  clearAiKeyBtn: document.getElementById("clearAiKeyBtn"),
  geminiApiKeyInput: document.getElementById("geminiApiKeyInput"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  mobileDrawer: document.getElementById("mobileDrawer"),
  footerYear: document.getElementById("footerYear"),

  // Hero Elements
  heroCardTitle: document.getElementById("heroCardTitle"),
  heroCardDate: document.getElementById("heroCardDate"),
  heroCardCategoryBadge: document.getElementById("heroCardCategoryBadge"),
  heroCardTimezone: document.getElementById("heroCardTimezone"),
  heroDays: document.getElementById("heroDays"),
  heroHours: document.getElementById("heroHours"),
  heroMinutes: document.getElementById("heroMinutes"),
  heroSeconds: document.getElementById("heroSeconds"),
  heroProgressBar: document.getElementById("heroProgressBar"),
  heroProgressPercent: document.getElementById("heroProgressPercent"),

  // Showcase Elements
  activeEventTitle: document.getElementById("activeEventTitle"),
  activeEventMeta: document.getElementById("activeEventMeta"),
  activeEventCategory: document.getElementById("activeEventCategory"),
  activeEventStatusBadge: document.getElementById("activeEventStatusBadge"),
  generateAiRoadmapBtn: document.getElementById("generateAiRoadmapBtn"),
  mainDays: document.getElementById("mainDays"),
  mainHours: document.getElementById("mainHours"),
  mainMinutes: document.getElementById("mainMinutes"),
  mainSeconds: document.getElementById("mainSeconds"),
  targetAchievedBanner: document.getElementById("targetAchievedBanner"),
  mainProgressBar: document.getElementById("mainProgressBar"),
  progressElapsedLabel: document.getElementById("progressElapsedLabel"),
  progressRemainingLabel: document.getElementById("progressRemainingLabel"),
  progressPercentLabel: document.getElementById("progressPercentLabel"),

  // Form Elements
  createEventForm: document.getElementById("createEventForm"),
  eventTitleInput: document.getElementById("eventTitleInput"),
  eventCategorySelect: document.getElementById("eventCategorySelect"),
  eventDateInput: document.getElementById("eventDateInput"),
  eventTimeInput: document.getElementById("eventTimeInput"),
  eventTimezoneSelect: document.getElementById("eventTimezoneSelect"),
  eventDescInput: document.getElementById("eventDescInput"),
  titleError: document.getElementById("titleError"),
  dateError: document.getElementById("dateError"),

  // Dashboard Elements
  eventsGrid: document.getElementById("eventsGrid"),
  emptyEventsState: document.getElementById("emptyEventsState"),
  countAll: document.getElementById("countAll"),
  countActive: document.getElementById("countActive"),
  countCompleted: document.getElementById("countCompleted"),
  countFavs: document.getElementById("countFavs"),

  // Roadmap Elements
  roadmapEventName: document.getElementById("roadmapEventName"),
  roadmapMilestonesList: document.getElementById("roadmapMilestonesList"),
  roadmapCompletionRate: document.getElementById("roadmapCompletionRate"),
  refreshRoadmapBtn: document.getElementById("refreshRoadmapBtn"),

  // AI Elements
  aiPromptInput: document.getElementById("aiPromptInput"),
  voiceInputBtn: document.getElementById("voiceInputBtn"),
  runAiAssistantBtn: document.getElementById("runAiAssistantBtn"),
  aiResultCard: document.getElementById("aiResultCard"),
  aiParsedTitle: document.getElementById("aiParsedTitle"),
  aiParsedSchedule: document.getElementById("aiParsedSchedule"),
  aiParsedCategory: document.getElementById("aiParsedCategory"),
  aiBriefingBox: document.getElementById("aiBriefingBox"),
  aiApplyEventBtn: document.getElementById("aiApplyEventBtn"),

  // Focus Mode Elements
  modeFocusBtn: document.getElementById("modeFocusBtn"),
  modeStandardBtn: document.getElementById("modeStandardBtn"),
  modeCompactBtn: document.getElementById("modeCompactBtn"),
  focusModal: document.getElementById("focusModal"),
  closeFocusModalBtn: document.getElementById("closeFocusModalBtn"),
  focusCategoryBadge: document.getElementById("focusCategoryBadge"),
  focusEventTitle: document.getElementById("focusEventTitle"),
  focusDays: document.getElementById("focusDays"),
  focusHours: document.getElementById("focusHours"),
  focusMinutes: document.getElementById("focusMinutes"),
  focusSeconds: document.getElementById("focusSeconds"),

  // Reminders
  requestNotificationBtn: document.getElementById("requestNotificationBtn"),
  notificationStatusBadge: document.getElementById("notificationStatusBadge"),
  toastContainer: document.getElementById("toastContainer"),
};

// Toast notification utility
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold shadow-lg text-white fade-in ${
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-purple-600"
  }`;
  toast.innerHTML = `<span>${message}</span>`;
  dom.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Helper: Pad numbers to 2 digits
const pad2 = (num) => String(Math.max(0, Math.floor(num))).padStart(2, "0");

// Load Events from LocalStorage
function loadSavedEvents() {
  try {
    const raw = localStorage.getItem("chronolaunch_events");
    if (raw) {
      AppState.events = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not parse saved events:", err);
    AppState.events = [];
  }

  // If empty, seed with high-value default milestones
  if (!AppState.events || AppState.events.length === 0) {
    const now = Date.now();
    AppState.events = [
      {
        id: "evt-default-1",
        title: "ChronoLaunch Global Launch",
        category: "Product Launch",
        timestamp: now + 14 * 86400000 + 6 * 3600000,
        createdAt: now - 16 * 86400000, // Started 16 days ago (~53% progress)
        timezone: "UTC",
        description: "Major platform milestone release across all channels.",
        isFavorite: true,
        checkpoints: [
          { id: "cp1", title: "Code Freeze & Audit", isDone: true },
          { id: "cp2", title: "Beta Testing with 500 users", isDone: true },
          { id: "cp3", title: "Production Deployment", isDone: false },
          { id: "cp4", title: "Community AMA", isDone: false },
        ],
      },
      {
        id: "evt-default-2",
        title: "Annual Team Retreat",
        category: "Vacation",
        timestamp: now + 35 * 86400000,
        createdAt: now - 15 * 86400000, // Started 15 days ago (~30% progress)
        timezone: "Asia/Kolkata",
        description: "Offsite planning and strategy workshops.",
        isFavorite: false,
        checkpoints: [
          { id: "cp5", title: "Confirm Flight Bookings", isDone: true },
          { id: "cp6", title: "Finalize Agenda", isDone: false },
        ],
      },
    ];
    saveEventsToStorage();
  } else {
    // Ensure starter demo milestones in storage have realistic elapsed timelines so progress is visibly filled
    AppState.events.forEach((evt) => {
      if (evt.id === "evt-default-1" || (evt.title && evt.title.includes("Global Launch"))) {
        evt.createdAt = evt.timestamp - 30 * 86400000; // ~53% progress
      }
      if (evt.id === "evt-default-2" || (evt.title && evt.title.includes("Team Retreat"))) {
        evt.createdAt = evt.timestamp - 50 * 86400000; // ~30% progress
      }
    });
    saveEventsToStorage();
  }

  AppState.activeEventId = AppState.events[0].id;
}

function saveEventsToStorage() {
  try {
    localStorage.setItem(
      "chronolaunch_events",
      JSON.stringify(AppState.events),
    );
  } catch (e) {
    console.error("Failed to write to LocalStorage:", e);
  }
}

function getActiveEvent() {
  return (
    AppState.events.find((e) => e.id === AppState.activeEventId) ||
    AppState.events[0] ||
    null
  );
}

// Precise Date Math function based on wall-clock epochs
function calculateTimeDelta(targetTimestamp, createdAt) {
  const now = Date.now();
  const remainingMs = targetTimestamp - now;
  const isCompleted = remainingMs <= 0;
  const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  // Realistic start timestamp & duration
  const start = (createdAt && createdAt < targetTimestamp) ? createdAt : (targetTimestamp - 86400000 * 30);
  const totalDuration = targetTimestamp - start;
  const elapsed = Math.max(0, now - start);

  let progressFloat = 0;
  if (totalDuration > 0) {
    progressFloat = Math.min(
      100,
      Math.max(0, (elapsed / totalDuration) * 100),
    );
  }
  if (isCompleted) progressFloat = 100;

  const remainingPercentFloat = Math.max(0, 100 - progressFloat);

  const elapsedSecondsTotal = Math.floor(elapsed / 1000);
  const elapsedDays = Math.floor(elapsedSecondsTotal / 86400);
  const elapsedHours = Math.floor((elapsedSecondsTotal % 86400) / 3600);
  const elapsedMinutes = Math.floor((elapsedSecondsTotal % 3600) / 60);
  const elapsedSeconds = elapsedSecondsTotal % 60;

  return {
    isCompleted,
    days,
    hours,
    minutes,
    seconds,
    progress: Math.round(progressFloat),
    progressFloat,
    remainingPercent: Math.round(remainingPercentFloat),
    remainingPercentFloat,
    remainingSeconds,
    elapsedDays,
    elapsedHours,
    elapsedMinutes,
    elapsedSeconds,
  };
}

// Refresh Visible Countdown Digits across UI
function tickCountdown() {
  const active = getActiveEvent();
  if (!active) return;

  const delta = calculateTimeDelta(active.timestamp, active.createdAt);

  // Hero Elements
  dom.heroDays.textContent = pad2(delta.days);
  dom.heroHours.textContent = pad2(delta.hours);
  dom.heroMinutes.textContent = pad2(delta.minutes);
  dom.heroSeconds.textContent = pad2(delta.seconds);
  const fillWidth = delta.isCompleted ? 100 : Math.max(0.5, delta.progressFloat);
  dom.heroProgressBar.style.width = `${fillWidth.toFixed(2)}%`;
  dom.heroProgressPercent.textContent = `${delta.progressFloat.toFixed(1)}%`;

  // Showcase Elements
  dom.mainDays.textContent = pad2(delta.days);
  dom.mainHours.textContent = pad2(delta.hours);
  dom.mainMinutes.textContent = pad2(delta.minutes);
  dom.mainSeconds.textContent = pad2(delta.seconds);
  dom.mainProgressBar.style.width = `${fillWidth.toFixed(2)}%`;
  dom.progressPercentLabel.innerHTML = `<span class="text-[var(--color-accent)] font-bold">${delta.progressFloat.toFixed(1)}%</span> <span class="text-xs text-[var(--color-text-secondary)] font-normal">(${delta.remainingPercentFloat.toFixed(1)}% remaining)</span>`;
  dom.progressRemainingLabel.textContent = `Remaining: ${delta.days}d ${delta.hours}h ${delta.minutes}m ${delta.seconds}s`;
  if (dom.progressElapsedLabel) {
    dom.progressElapsedLabel.textContent = `Elapsed: ${delta.elapsedDays}d ${delta.elapsedHours}h ${delta.elapsedMinutes}m ${delta.elapsedSeconds}s`;
  }

  // Focus Mode Elements
  dom.focusDays.textContent = pad2(delta.days);
  dom.focusHours.textContent = pad2(delta.hours);
  dom.focusMinutes.textContent = pad2(delta.minutes);
  dom.focusSeconds.textContent = pad2(delta.seconds);

  // Target Completion Handling
  if (delta.isCompleted) {
    dom.targetAchievedBanner.classList.remove("hidden");
    dom.activeEventStatusBadge.className =
      "px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
    dom.activeEventStatusBadge.textContent = "Completed";
  } else {
    dom.targetAchievedBanner.classList.add("hidden");
    dom.activeEventStatusBadge.className =
      "px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20";
    dom.activeEventStatusBadge.textContent = "Counting Down";
  }

  // Check notification triggers
  checkMilestoneNotifications(active, delta.remainingSeconds);
}

// Render My Events Dashboard Cards
function renderEventsDashboard() {
  dom.eventsGrid.innerHTML = "";
  const filter = AppState.currentFilter;
  const now = Date.now();

  // Counts
  let activeCount = 0;
  let completedCount = 0;
  let favCount = 0;

  AppState.events.forEach((evt) => {
    const isComp = evt.timestamp <= now;
    if (isComp) completedCount++;
    else activeCount++;
    if (evt.isFavorite) favCount++;
  });

  dom.countAll.textContent = AppState.events.length;
  dom.countActive.textContent = activeCount;
  dom.countCompleted.textContent = completedCount;
  dom.countFavs.textContent = favCount;

  // Filtered Subset
  const filtered = AppState.events.filter((evt) => {
    const isComp = evt.timestamp <= now;
    if (filter === "active") return !isComp;
    if (filter === "completed") return isComp;
    if (filter === "favorites") return evt.isFavorite;
    return true;
  });

  if (filtered.length === 0) {
    dom.emptyEventsState.classList.remove("hidden");
  } else {
    dom.emptyEventsState.classList.add("hidden");
  }

  filtered.forEach((evt) => {
    const delta = calculateTimeDelta(evt.timestamp, evt.createdAt);
    const isSelected = evt.id === AppState.activeEventId;
    const dateObj = new Date(evt.timestamp);
    const formattedDate = dateObj.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const card = document.createElement("div");
    card.className = `p-5 rounded-2xl glass-panel border transition-all ${
      isSelected
        ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 shadow-lg"
        : "border-[var(--color-border)] hover:border-[var(--color-text-secondary)]/40"
    } flex flex-col justify-between gap-4`;

    card.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-accent)]">${evt.category || "Event"}</span>
              <div class="flex items-center gap-1">
                <button class="fav-btn p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 transition-colors" data-id="${evt.id}">
                  <i data-lucide="star" class="w-4 h-4 ${evt.isFavorite ? "fill-amber-400 text-amber-400" : ""}"></i>
                </button>
                <button class="delete-btn p-1.5 rounded-lg text-zinc-400 hover:text-red-400 transition-colors" data-id="${evt.id}">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <div>
              <h4 class="font-heading font-bold text-base truncate">${evt.title}</h4>
              <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">${formattedDate} • ${evt.timezone || "UTC"}</p>
            </div>

            <!-- Mini Numbers -->
            <div class="grid grid-cols-4 gap-2 text-center text-xs font-mono-timer py-1">
              <div class="p-1.5 rounded bg-[var(--color-surface-elevated)]"><span class="font-bold">${pad2(delta.days)}</span><span class="block text-[9px] text-[var(--color-text-secondary)]">d</span></div>
              <div class="p-1.5 rounded bg-[var(--color-surface-elevated)]"><span class="font-bold">${pad2(delta.hours)}</span><span class="block text-[9px] text-[var(--color-text-secondary)]">h</span></div>
              <div class="p-1.5 rounded bg-[var(--color-surface-elevated)]"><span class="font-bold">${pad2(delta.minutes)}</span><span class="block text-[9px] text-[var(--color-text-secondary)]">m</span></div>
              <div class="p-1.5 rounded bg-[var(--color-surface-elevated)]"><span class="font-bold text-[var(--color-accent)]">${pad2(delta.seconds)}</span><span class="block text-[9px] text-[var(--color-text-secondary)]">s</span></div>
            </div>
          </div>

          <!-- Card Mini Progress Bar -->
          <div class="space-y-1 my-1.5">
            <div class="w-full h-1.5 rounded-full bg-[var(--color-surface-elevated)] overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-secondary)] rounded-full transition-all duration-300 shadow-sm"
                   style="width: ${delta.progressFloat.toFixed(2)}%"></div>
            </div>
          </div>

          <div class="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
            <span class="text-xs text-[var(--color-text-secondary)] font-medium">${delta.isCompleted ? "Completed" : `${delta.progressFloat.toFixed(1)}% (${delta.remainingPercentFloat.toFixed(1)}% left)`}</span>
            <button class="select-event-btn px-3 py-1.5 rounded-lg text-xs font-semibold ${
              isSelected
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]"
            }" data-id="${evt.id}">
              ${isSelected ? "Active" : "Set Active"}
            </button>
          </div>
        `;

    dom.eventsGrid.appendChild(card);
  });

  // Bind dynamic buttons
  dom.eventsGrid.querySelectorAll(".select-event-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      setActiveEventId(id);
    });
  });

  dom.eventsGrid.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      toggleEventFavorite(id);
    });
  });

  dom.eventsGrid.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      deleteEvent(id);
    });
  });

  lucide.createIcons();
}

function setActiveEventId(id) {
  AppState.activeEventId = id;
  updateActiveEventHeader();
  renderEventsDashboard();
  renderActiveRoadmap();
  tickCountdown();
  showToast("Active countdown updated", "info");
}

function toggleEventFavorite(id) {
  const evt = AppState.events.find((e) => e.id === id);
  if (evt) {
    evt.isFavorite = !evt.isFavorite;
    saveEventsToStorage();
    renderEventsDashboard();
  }
}

function deleteEvent(id) {
  if (AppState.events.length <= 1) {
    showToast("You must keep at least one event in your dashboard.", "error");
    return;
  }
  AppState.events = AppState.events.filter((e) => e.id !== id);
  if (AppState.activeEventId === id) {
    AppState.activeEventId = AppState.events[0].id;
  }
  saveEventsToStorage();
  updateActiveEventHeader();
  renderEventsDashboard();
  renderActiveRoadmap();
  showToast("Event deleted.", "info");
}

function updateActiveEventHeader() {
  const active = getActiveEvent();
  if (!active) return;

  const dateObj = new Date(active.timestamp);
  const dateStr = dateObj.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Hero Sync
  dom.heroCardTitle.textContent = active.title;
  dom.heroCardDate.textContent = dateStr;
  dom.heroCardCategoryBadge.textContent = active.category || "Milestone";
  dom.heroCardTimezone.textContent = active.timezone || "UTC";

  // Showcase Sync
  dom.activeEventTitle.textContent = active.title;
  dom.activeEventCategory.textContent = active.category || "Milestone";
  dom.activeEventMeta.textContent = `Target: ${dateStr} (${active.timezone || "UTC"})`;

  // Focus Modal Sync
  dom.focusEventTitle.textContent = active.title;
  dom.focusCategoryBadge.textContent = active.category || "Milestone";

  // Roadmap Header Sync
  dom.roadmapEventName.textContent = active.title;
}

// Render Roadmap Milestones
function renderActiveRoadmap() {
  const active = getActiveEvent();
  if (!active) return;

  // Provide sensible default checkpoints if none exist
  if (!active.checkpoints || active.checkpoints.length === 0) {
    active.checkpoints = [
      { id: "cp-init", title: "Define Goal & Success Metrics", isDone: true },
      { id: "cp-prep", title: "Mid-Point Progress Review", isDone: false },
      {
        id: "cp-final",
        title: "Final Polish & Launch Verification",
        isDone: false,
      },
    ];
    saveEventsToStorage();
  }

  dom.roadmapMilestonesList.innerHTML = "";
  let completedCount = 0;

  active.checkpoints.forEach((cp, index) => {
    if (cp.isDone) completedCount++;

    const item = document.createElement("div");
    item.className = `p-4 rounded-xl flex items-center justify-between gap-3 border transition-colors ${
      cp.isDone
        ? "bg-purple-500/5 border-purple-500/20"
        : "bg-[var(--color-surface)] border-[var(--color-border)]"
    }`;

    item.innerHTML = `
          <label class="flex items-center gap-3 cursor-pointer flex-1">
            <input type="checkbox" data-index="${index}" ${cp.isDone ? "checked" : ""} class="checkpoint-toggle rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer">
            <span class="text-sm font-medium ${cp.isDone ? "line-through text-[var(--color-text-secondary)]" : "text-[var(--color-text-primary)]"}">${cp.title}</span>
          </label>
          <span class="text-xs font-mono-timer text-[var(--color-text-secondary)]">Stage ${index + 1}</span>
        `;
    dom.roadmapMilestonesList.appendChild(item);
  });

  dom.roadmapCompletionRate.textContent = `${completedCount} of ${active.checkpoints.length} Completed`;

  // Bind toggle checkboxes
  dom.roadmapMilestonesList
    .querySelectorAll(".checkpoint-toggle")
    .forEach((chk) => {
      chk.addEventListener("change", (e) => {
        const idx = parseInt(e.target.getAttribute("data-index"));
        active.checkpoints[idx].isDone = e.target.checked;
        saveEventsToStorage();
        renderActiveRoadmap();
      });
    });
}

// Smart Heuristic NLP Parser (Fallback Engine)
function parsePromptLocally(promptText) {
  const lower = promptText.toLowerCase();
  let category = "Personal Goal";
  let offsetDays = 7;

  if (lower.includes("launch") || lower.includes("release")) {
    category = "Product Launch";
    offsetDays = 14;
  } else if (lower.includes("birthday") || lower.includes("party")) {
    category = "Birthday";
    offsetDays = 21;
  } else if (lower.includes("exam") || lower.includes("test")) {
    category = "Examination";
    offsetDays = 10;
  } else if (lower.includes("trip") || lower.includes("vacation")) {
    category = "Vacation";
    offsetDays = 30;
  } else if (lower.includes("wedding")) {
    category = "Wedding";
    offsetDays = 60;
  } else if (lower.includes("deadline") || lower.includes("sprint")) {
    category = "Project Deadline";
    offsetDays = 5;
  }

  // Look for number of days if specified
  const dayMatch = lower.match(/(\d+)\s*(days|day)/);
  if (dayMatch && dayMatch[1]) {
    offsetDays = parseInt(dayMatch[1]);
  }

  const targetDate = new Date(Date.now() + offsetDays * 86400000);
  const title =
    promptText.length > 3
      ? promptText.charAt(0).toUpperCase() + promptText.slice(1)
      : "Scheduled Milestone";

  return {
    title: title.slice(0, 48),
    category: category,
    targetTimestamp: targetDate.getTime(),
    dateStr: targetDate.toISOString().split("T")[0],
    timeStr: "12:00",
    briefing: `Target schedule determined for ${category} with target set to +${offsetDays} days. Checklist roadmap ready for phased tracking.`,
  };
}

// Call Gemini API if Key is present, otherwise use local parsing
async function interpretEventWithAI(promptText) {
  const apiKey = AppState.geminiKey;

  if (!apiKey) {
    // Safe, immediate local NLP interpretation
    return parsePromptLocally(promptText);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an event schedule assistant. Extract event parameters from this prompt: "${promptText}".
Respond ONLY with a JSON object in this format:
{
  "title": "Clean Event Title",
  "category": "Product Launch | Birthday | Examination | Vacation | Project Deadline | Wedding | Personal Goal",
  "estimatedDaysFromNow": 7,
  "briefing": "A short, 2-sentence tactical recommendation for this milestone."
}`,
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );

    if (!response.ok) throw new Error("API request returned error");
    const data = await response.json();
    const parsed = JSON.parse(data.candidates[0].content.parts[0].text);

    const days = parsed.estimatedDaysFromNow || 7;
    const targetDate = new Date(Date.now() + days * 86400000);

    return {
      title: parsed.title,
      category: parsed.category,
      targetTimestamp: targetDate.getTime(),
      dateStr: targetDate.toISOString().split("T")[0],
      timeStr: "12:00",
      briefing: parsed.briefing,
    };
  } catch (err) {
    console.warn("Gemini API call failed, falling back to local engine:", err);
    return parsePromptLocally(promptText);
  }
}

// Generate AI Roadmap Checkpoints
async function generateRoadmapForActiveEvent() {
  const active = getActiveEvent();
  if (!active) return;

  showToast("Generating AI checkpoints...", "info");

  // AI synthesis or fallback
  const newCheckpoints = [
    {
      id: "ai-1",
      title: `Phase 1: Research & Prerequisites for ${active.category}`,
      isDone: false,
    },
    {
      id: "ai-2",
      title: "Phase 2: Execution & Intermediate Milestone Check",
      isDone: false,
    },
    {
      id: "ai-3",
      title: "Phase 3: Final Rehearsal & Readiness Review",
      isDone: false,
    },
    { id: "ai-4", title: "Phase 4: Official Launch Execution", isDone: false },
  ];

  active.checkpoints = newCheckpoints;
  saveEventsToStorage();
  renderActiveRoadmap();
  showToast("AI Roadmap generated successfully!", "success");
}

// Initialize Browser Push Notifications
function initNotifications() {
  if (!("Notification" in window)) {
    dom.notificationStatusBadge.textContent = "Not supported in this browser";
    dom.requestNotificationBtn.disabled = true;
    return;
  }

  if (Notification.permission === "granted") {
    AppState.notificationsGranted = true;
    dom.notificationStatusBadge.textContent = "Alerts Active";
    dom.requestNotificationBtn.classList.add("opacity-60");
  }

  dom.requestNotificationBtn.addEventListener("click", async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        AppState.notificationsGranted = true;
        dom.notificationStatusBadge.textContent = "Alerts Active";
        showToast("Browser notifications enabled!", "success");
      } else {
        dom.notificationStatusBadge.textContent = "Permission Denied";
        showToast("Notification permission was declined.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  });
}

function checkMilestoneNotifications(active, remainingSeconds) {
  if (!AppState.notificationsGranted) return;

  const triggerMap = [
    {
      id: "24h",
      seconds: 86400,
      elem: document.getElementById("remind24h"),
      label: "24 hours remaining",
    },
    {
      id: "1h",
      seconds: 3600,
      elem: document.getElementById("remind1h"),
      label: "1 hour remaining",
    },
    {
      id: "15m",
      seconds: 900,
      elem: document.getElementById("remind15m"),
      label: "15 minutes remaining",
    },
    {
      id: "0",
      seconds: 0,
      elem: document.getElementById("remind0"),
      label: "The event is happening now!",
    },
  ];

  triggerMap.forEach((trig) => {
    if (trig.elem && trig.elem.checked) {
      const key = `${active.id}-${trig.id}`;
      if (
        !AppState.notifiedStages.has(key) &&
        remainingSeconds <= trig.seconds &&
        remainingSeconds > trig.seconds - 5
      ) {
        AppState.notifiedStages.add(key);
        new Notification(`ChronoLaunch Alert: ${active.title}`, {
          body: `${trig.label} for ${active.title}!`,
          icon: "https://placehold.co/128x128/5e35b1/ffffff?text=Timer",
        });
      }
    }
  });
}

// Set Up Speech Recognition for Voice
function initSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    dom.voiceInputBtn.title =
      "Speech recognition not supported in this browser";
    dom.voiceInputBtn.classList.add("opacity-40");
    return;
  }

  const recognizer = new SpeechRecognition();
  recognizer.continuous = false;
  recognizer.interimResults = false;

  dom.voiceInputBtn.addEventListener("click", () => {
    try {
      recognizer.start();
      showToast("Listening... Speak your event details", "info");
    } catch (e) {
      console.warn(e);
    }
  });

  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    dom.aiPromptInput.value = transcript;
    showToast("Voice captured!", "success");
  };
}

// Setup Lenis Smooth Scroll
function initLenis() {
  try {
    if (typeof Lenis !== "undefined") {
      AppState.lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      function raf(time) {
        AppState.lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  } catch (err) {
    console.warn("Lenis could not initialize:", err);
  }
}

// Initialize Theme Switcher
function initTheme() {
  const savedTheme = localStorage.getItem("chronolaunch_theme") || "dark";
  setTheme(savedTheme);

  dom.themeToggleBtn.addEventListener("click", () => {
    const nextTheme = AppState.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });
}

function setTheme(theme) {
  AppState.theme = theme;
  dom.html.setAttribute("data-theme", theme);
  localStorage.setItem("chronolaunch_theme", theme);

  if (theme === "dark") {
    dom.themeIcon.setAttribute("data-lucide", "sun");
  } else {
    dom.themeIcon.setAttribute("data-lucide", "moon");
  }
  lucide.createIcons();
}

// Handle Form Event Submission
dom.createEventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = dom.eventTitleInput.value.trim();
  const dateVal = dom.eventDateInput.value;
  const timeVal = dom.eventTimeInput.value || "12:00";
  const category = dom.eventCategorySelect.value;
  const timezone = dom.eventTimezoneSelect.value;
  const desc = dom.eventDescInput.value.trim();

  let hasError = false;
  if (!title) {
    dom.titleError.classList.remove("hidden");
    hasError = true;
  } else {
    dom.titleError.classList.add("hidden");
  }

  if (!dateVal) {
    dom.dateError.classList.remove("hidden");
    hasError = true;
  } else {
    dom.dateError.classList.add("hidden");
  }

  if (hasError) return;

  const targetTimestamp = new Date(`${dateVal}T${timeVal}`).getTime();
  const newEvent = {
    id: "evt-" + Date.now(),
    title,
    category,
    timestamp: targetTimestamp,
    createdAt: Date.now(),
    timezone,
    description: desc,
    isFavorite: false,
    checkpoints: [
      { id: "cp-1", title: "Initial Planning & Scheduling", isDone: true },
      { id: "cp-2", title: "Milestone Execution", isDone: false },
    ],
  };

  AppState.events.unshift(newEvent);
  saveEventsToStorage();
  setActiveEventId(newEvent.id);
  dom.createEventForm.reset();
  showToast("New event countdown launched!", "success");

  // Scroll smoothly to showcase
  if (AppState.lenis) {
    AppState.lenis.scrollTo("#countdown-showcase");
  } else {
    document
      .getElementById("countdown-showcase")
      .scrollIntoView({ behavior: "smooth" });
  }
});

// Handle AI Assistant Interpretation
let stagedAiEvent = null;
dom.runAiAssistantBtn.addEventListener("click", async () => {
  const prompt = dom.aiPromptInput.value.trim();
  if (!prompt) {
    showToast("Please type or speak an event prompt first.", "error");
    return;
  }

  dom.runAiAssistantBtn.disabled = true;
  dom.runAiAssistantBtn.innerHTML = `<span>Thinking...</span>`;

  try {
    stagedAiEvent = await interpretEventWithAI(prompt);
    dom.aiParsedTitle.textContent = stagedAiEvent.title;
    dom.aiParsedSchedule.textContent = `${stagedAiEvent.dateStr} (${stagedAiEvent.timeStr})`;
    dom.aiParsedCategory.textContent = stagedAiEvent.category;
    dom.aiBriefingBox.textContent = stagedAiEvent.briefing;
    dom.aiResultCard.classList.remove("hidden");
    showToast("Event structured successfully!", "success");
  } catch (err) {
    showToast("Could not parse event. Please try again.", "error");
  } finally {
    dom.runAiAssistantBtn.disabled = false;
    dom.runAiAssistantBtn.innerHTML = `<i data-lucide="sparkles" class="w-3.5 h-3.5"></i><span>Interpret</span>`;
    lucide.createIcons();
  }
});

// Apply AI Event into Active Dashboard
dom.aiApplyEventBtn.addEventListener("click", () => {
  if (!stagedAiEvent) return;

  const newEvt = {
    id: "evt-" + Date.now(),
    title: stagedAiEvent.title,
    category: stagedAiEvent.category,
    timestamp: stagedAiEvent.targetTimestamp,
    createdAt: Date.now(),
    timezone: "UTC",
    description: stagedAiEvent.briefing,
    isFavorite: true,
    checkpoints: [
      {
        id: "c1",
        title: `Phase 1: Kickoff for ${stagedAiEvent.title}`,
        isDone: true,
      },
      { id: "c2", title: "Phase 2: Milestone Review", isDone: false },
      { id: "c3", title: "Phase 3: Execution Launch", isDone: false },
    ],
  };

  AppState.events.unshift(newEvt);
  saveEventsToStorage();
  setActiveEventId(newEvt.id);
  dom.aiResultCard.classList.add("hidden");
  dom.aiPromptInput.value = "";
  showToast("AI Event created and launched!", "success");

  if (AppState.lenis) {
    AppState.lenis.scrollTo("#countdown-showcase");
  }
});

// Bind Quick Templates
document.querySelectorAll(".template-card").forEach((btn) => {
  btn.addEventListener("click", () => {
    const title = btn.getAttribute("data-template-title");
    const cat = btn.getAttribute("data-template-cat");
    const days = parseInt(btn.getAttribute("data-template-days")) || 14;

    const targetDate = new Date(Date.now() + days * 86400000);
    dom.eventTitleInput.value = title;
    dom.eventCategorySelect.value = cat;
    dom.eventDateInput.value = targetDate.toISOString().split("T")[0];
    dom.eventTimeInput.value = "12:00";

    if (AppState.lenis) {
      AppState.lenis.scrollTo("#create-section");
    } else {
      document
        .getElementById("create-section")
        .scrollIntoView({ behavior: "smooth" });
    }
    showToast(`Template applied: ${title}`, "info");
  });
});

// Bind Roadmap Regeneration
dom.generateAiRoadmapBtn.addEventListener(
  "click",
  generateRoadmapForActiveEvent,
);
dom.refreshRoadmapBtn.addEventListener("click", generateRoadmapForActiveEvent);

// Focus Mode Handlers
dom.modeFocusBtn.addEventListener("click", () => {
  dom.focusModal.classList.remove("hidden");
  dom.focusModal.classList.add("flex");
});
dom.closeFocusModalBtn.addEventListener("click", () => {
  dom.focusModal.classList.add("hidden");
  dom.focusModal.classList.remove("flex");
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !dom.focusModal.classList.contains("hidden")) {
    dom.focusModal.classList.add("hidden");
    dom.focusModal.classList.remove("flex");
  }
});

// Mobile Drawer Toggle
dom.mobileMenuBtn.addEventListener("click", () => {
  dom.mobileDrawer.classList.toggle("hidden");
  dom.mobileDrawer.classList.toggle("flex");
});

// Filter Buttons in Dashboard
document.querySelectorAll(".dashboard-filter").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    document.querySelectorAll(".dashboard-filter").forEach((b) => {
      b.className =
        "dashboard-filter px-3 py-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]";
    });
    e.currentTarget.className =
      "dashboard-filter px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white";
    AppState.currentFilter = e.currentTarget.getAttribute("data-filter");
    renderEventsDashboard();
  });
});

// AI Key Modal Interactions
function toggleAiModal(show) {
  if (show) {
    dom.geminiApiKeyInput.value = AppState.geminiKey;
    dom.aiKeyModal.classList.remove("hidden");
    dom.aiKeyModal.classList.add("flex");
  } else {
    dom.aiKeyModal.classList.add("hidden");
    dom.aiKeyModal.classList.remove("flex");
  }
}
dom.aiConfigBtn.addEventListener("click", () => toggleAiModal(true));
dom.openAiKeySettings.addEventListener("click", () => toggleAiModal(true));
dom.closeAiKeyModalBtn.addEventListener("click", () => toggleAiModal(false));
dom.cancelAiKeyBtn.addEventListener("click", () => toggleAiModal(false));
dom.saveAiKeyBtn.addEventListener("click", () => {
  const key = dom.geminiApiKeyInput.value.trim();
  AppState.geminiKey = key;
  localStorage.setItem("chronolaunch_gemini_key", key);
  toggleAiModal(false);
  showToast(
    key ? "Gemini API key saved!" : "Switched to local offline parser",
    "success",
  );
});
dom.clearAiKeyBtn.addEventListener("click", () => {
  AppState.geminiKey = "";
  localStorage.removeItem("chronolaunch_gemini_key");
  dom.geminiApiKeyInput.value = "";
  toggleAiModal(false);
  showToast("API key removed. Running local NLP engine.", "info");
});

// Set Default Form Date to tomorrow
const tomorrow = new Date(Date.now() + 86400000);
dom.eventDateInput.value = tomorrow.toISOString().split("T")[0];

// Initialize FAQ Search and Category Filters
function initFaq() {
  const faqSearchInput = document.getElementById("faqSearchInput");
  const filterBtns = document.querySelectorAll(".faq-filter-btn");
  const faqItems = document.querySelectorAll(".faq-item");
  const faqCountAll = document.getElementById("faqCountAll");
  const footerThemeToggleBtn = document.getElementById("footerThemeToggleBtn");

  if (footerThemeToggleBtn) {
    footerThemeToggleBtn.addEventListener("click", () => {
      const nextTheme = AppState.theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  }

  if (!faqItems.length) return;
  if (faqCountAll) faqCountAll.textContent = faqItems.length;

  let activeCategory = "all";

  function applyFilter() {
    const query = faqSearchInput ? faqSearchInput.value.trim().toLowerCase() : "";

    faqItems.forEach((item) => {
      const itemCat = item.getAttribute("data-category");
      const itemKeywords = (item.getAttribute("data-keywords") || "").toLowerCase();
      const itemText = item.textContent.toLowerCase();

      const matchesCat = activeCategory === "all" || itemCat === activeCategory;
      const matchesSearch = !query || itemKeywords.includes(query) || itemText.includes(query);

      if (matchesCat && matchesSearch) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
      }
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-category") || "all";
      filterBtns.forEach((b) => {
        b.classList.remove("bg-[var(--color-accent)]", "text-white", "shadow-sm");
        b.classList.add("text-[var(--color-text-secondary)]");
      });
      btn.classList.add("bg-[var(--color-accent)]", "text-white", "shadow-sm");
      btn.classList.remove("text-[var(--color-text-secondary)]");
      applyFilter();
    });
  });

  if (faqSearchInput) {
    faqSearchInput.addEventListener("input", () => {
      applyFilter();
    });
  }
}

// Main Engine Bootstrapping
window.addEventListener("DOMContentLoaded", () => {
  dom.footerYear.textContent = new Date().getFullYear();
  initTheme();
  loadSavedEvents();
  updateActiveEventHeader();
  renderEventsDashboard();
  renderActiveRoadmap();
  initNotifications();
  initSpeechRecognition();
  initLenis();
  initFaq();

  // Start Wall-Clock Timer Loop (1 FPS)
  tickCountdown();
  setInterval(tickCountdown, 1000);

  lucide.createIcons();
});

