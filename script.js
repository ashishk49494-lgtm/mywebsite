const liveContainer = document.getElementById("live-matches");
const upcomingContainer = document.getElementById("upcoming-matches");
const completedContainer = document.getElementById("completed-matches");
const lastUpdated = document.getElementById("last-updated");
const refreshBtn = document.getElementById("refresh-btn");
const loadingIndicator = document.getElementById("loading-indicator");
const tabs = document.querySelectorAll(".tab");

const API_URL =
  "https://api.cricapi.com/v1/currentMatches?apikey=fdbc895f-cd4b-47d4-9afd-d4e8a4a1946e&offset=0";

let isLoading = false;

function setLoading(loading) {
  isLoading = loading;

  if (refreshBtn) {
    refreshBtn.disabled = loading;
    refreshBtn.textContent = loading ? "Refreshing..." : "Refresh Now";
    refreshBtn.style.opacity = loading ? "0.7" : "1";
    refreshBtn.style.cursor = loading ? "not-allowed" : "pointer";
  }

  if (loadingIndicator) {
    loadingIndicator.style.display = loading ? "inline-block" : "none";
  }
}

function clearContainers() {
  liveContainer.innerHTML = "";
  upcomingContainer.innerHTML = "";
  completedContainer.innerHTML = "";
}

function classifyStatus(statusRaw) {
  const status = (statusRaw || "").toLowerCase();

  if (
    status.includes("won") ||
    status.includes("lost") ||
    status.includes("draw") ||
    status.includes("no result") ||
    status.includes("tie")
  ) {
    return "completed";
  }

  if (
    status.includes("scheduled") ||
    status.includes("upcoming") ||
    status.includes("yet to begin") ||
    status.includes("start at") ||
    status.includes("not started")
  ) {
    return "upcoming";
  }

  return "live";
}

function createMatchCard(match, bucket) {
  const team1 = match.teams && match.teams[0] ? match.teams[0] : "Team A";
  const team2 = match.teams && match.teams[1] ? match.teams[1] : "Team B";

  let scoreText = "";
  if (Array.isArray(match.score) && match.score.length > 0) {
    scoreText = match.score
      .map((inn) => {
        const inningName = inn.inning || "Inning";
        const runs = inn.r ?? 0;
        const wickets = inn.w ?? 0;
        const overs = inn.o ?? 0;
        return `${inningName}: ${runs}/${wickets} in ${overs} overs`;
      })
      .join("<br>");
  } else {
    scoreText = "Score not available yet.";
  }

  const statusRaw = match.status || "Status not available";
  const statusClass =
    bucket === "completed"
      ? "match-status completed"
      : bucket === "upcoming"
      ? "match-status upcoming"
      : "match-status";
  const venue = match.venue || "";
  const matchType = match.matchType || "";

  const div = document.createElement("div");
  div.className = "match-card";
  div.innerHTML = `
    <div class="match-header">
      <span>${team1} vs ${team2}</span>
      <span>${matchType ? matchType.toUpperCase() : ""}</span>
    </div>
    <div class="match-meta">
      ${venue}
    </div>
    <div class="match-score">
      ${scoreText}
    </div>
    <div class="${statusClass}">
      ${statusRaw}
    </div>
  `;
  return div;
}

async function fetchScores() {
  if (isLoading) return;
  setLoading(true);

  try {
    liveContainer.innerHTML = '<p class="placeholder">Loading live matches...</p>';
    upcomingContainer.innerHTML =
      '<p class="placeholder">Loading upcoming matches...</p>';
    completedContainer.innerHTML =
      '<p class="placeholder">Loading recent results...</p>';

    const resp = await fetch(API_URL);
    if (!resp.ok) {
      throw new Error("Network response was not ok: " + resp.status);
    }

    const data = await resp.json();
    const matches = data && data.data ? data.data : [];

    clearContainers();

    if (!matches.length) {
      liveContainer.innerHTML =
        '<p class="placeholder">No matches available.</p>';
      upcomingContainer.innerHTML =
        '<p class="placeholder">No upcoming matches.</p>';
      completedContainer.innerHTML =
        '<p class="placeholder">No recent results.</p>';
      lastUpdated.textContent = "";
      return;
    }

    let liveCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    matches.forEach((match) => {
      const bucket = classifyStatus(match.status);
      const card = createMatchCard(match, bucket);

      if (bucket === "live") {
        liveContainer.appendChild(card);
        liveCount++;
      } else if (bucket === "upcoming") {
        upcomingContainer.appendChild(card);
        upcomingCount++;
      } else {
        completedContainer.appendChild(card);
        completedCount++;
      }
    });

    if (!liveCount) {
      liveContainer.innerHTML =
        '<p class="placeholder">No live matches right now.</p>';
    }
    if (!upcomingCount) {
      upcomingContainer.innerHTML =
        '<p class="placeholder">No upcoming matches found.</p>';
    }
    if (!completedCount) {
      completedContainer.innerHTML =
        '<p class="placeholder">No recent results found.</p>';
    }

    const now = new Date();
    lastUpdated.textContent = "Last updated: " + now.toLocaleTimeString();
  } catch (err) {
    console.error(err);
    liveContainer.innerHTML =
      '<p class="placeholder">Error loading matches. Please try again.</p>';
  } finally {
    setLoading(false);
  }
}

// Tabs logic
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    document
      .querySelectorAll(".matches-list")
      .forEach((list) => list.classList.remove("active"));

    if (target === "live") {
      liveContainer.classList.add("active");
    } else if (target === "upcoming") {
      upcomingContainer.classList.add("active");
    } else {
      completedContainer.classList.add("active");
    }
  });
});

// Refresh button
if (refreshBtn) {
  refreshBtn.addEventListener("click", fetchScores);
}

// Initial load + auto-refresh
fetchScores();
setInterval(fetchScores, 30000);
