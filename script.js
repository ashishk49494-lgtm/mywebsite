// ---------------- DOM ELEMENTS ----------------
const liveContainer = document.getElementById("live-matches");
const upcomingContainer = document.getElementById("upcoming-matches");
const completedContainer = document.getElementById("completed-matches");
const lastUpdated = document.getElementById("last-updated");
const refreshBtn = document.getElementById("refresh-btn");
const loadingIndicator = document.getElementById("loading-indicator");
const tabs = document.querySelectorAll(".tab");

// player search elements (in sidebar)
const playerInput = document.getElementById("player-search-input");
const playerBtn = document.getElementById("player-search-btn");
const playerResult = document.getElementById("player-result");

// ---------------- API CONFIG ----------------
const API_KEY = "fdbc895f-cd4b-47d4-9afd-d4e8a4a1946e"; // your CricAPI key

const MATCHES_URL = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`;
const PLAYER_SEARCH_URL = `https://api.cricapi.com/v1/players?apikey=${API_KEY}&offset=0&search=`;
const PLAYER_INFO_URL = `https://api.cricapi.com/v1/players_info?apikey=${API_KEY}&id=`;

let isLoading = false;

// ---------------- FLAGS ----------------
const teamFlagMap = {
  India: "https://flagcdn.com/w40/in.png",
  "India Women": "https://flagcdn.com/w40/in.png",
  Pakistan: "https://flagcdn.com/w40/pk.png",
  "Pakistan Women": "https://flagcdn.com/w40/pk.png",
  Australia: "https://flagcdn.com/w40/au.png",
  "Australia Women": "https://flagcdn.com/w40/au.png",
  "South Africa": "https://flagcdn.com/w40/za.png",
  "South Africa Women": "https://flagcdn.com/w40/za.png",
  "New Zealand": "https://flagcdn.com/w40/nz.png",
  "New Zealand Women": "https://flagcdn.com/w40/nz.png",
  England: "https://flagcdn.com/w40/gb.png",
  "England Women": "https://flagcdn.com/w40/gb.png",
  "Sri Lanka": "https://flagcdn.com/w40/lk.png",
  "Sri Lanka Women": "https://flagcdn.com/w40/lk.png",
  Bangladesh: "https://flagcdn.com/w40/bd.png",
  "Bangladesh Women": "https://flagcdn.com/w40/bd.png",
  "West Indies": "https://flagcdn.com/w40/jm.png",
  "West Indies Women": "https://flagcdn.com/w40/jm.png",
  Afghanistan: "https://flagcdn.com/w40/af.png",
  "Afghanistan Women": "https://flagcdn.com/w40/af.png",
  Ireland: "https://flagcdn.com/w40/ie.png",
  "Ireland Women": "https://flagcdn.com/w40/ie.png",
  Zimbabwe: "https://flagcdn.com/w40/zw.png",
  "United Arab Emirates": "https://flagcdn.com/w40/ae.png",
  "U.A.E.": "https://flagcdn.com/w40/ae.png",
  Netherlands: "https://flagcdn.com/w40/nl.png",
  Scotland: "https://flagcdn.com/w40/gb-sct.png",
  Nepal: "https://flagcdn.com/w40/np.png"
};

function renderTeam(teamName) {
  const flagUrl = teamFlagMap[teamName] || null;
  if (flagUrl) {
    return `
      <span class="team-label">
        <img src="${flagUrl}" class="flag" alt="${teamName} flag">
        <span>${teamName}</span>
      </span>
    `;
  }
  return `<span class="team-label">${teamName}</span>`;
}

function getCountryFlag(countryName) {
  if (!countryName) return null;
  if (teamFlagMap[countryName]) return teamFlagMap[countryName];

  const c = countryName.toLowerCase();
  if (c.includes("india")) return teamFlagMap["India"];
  if (c.includes("pakistan")) return teamFlagMap["Pakistan"];
  if (c.includes("south africa")) return teamFlagMap["South Africa"];
  if (c.includes("new zealand")) return teamFlagMap["New Zealand"];
  if (c.includes("england")) return teamFlagMap["England"];
  if (c.includes("sri lanka")) return teamFlagMap["Sri Lanka"];
  if (c.includes("bangladesh")) return teamFlagMap["Bangladesh"];
  if (c.includes("afghanistan")) return teamFlagMap["Afghanistan"];
  if (c.includes("ireland")) return teamFlagMap["Ireland"];
  if (c.includes("west indies")) return teamFlagMap["West Indies"];
  if (c.includes("zimbabwe")) return teamFlagMap["Zimbabwe"];
  if (c.includes("nepal")) return teamFlagMap["Nepal"];
  if (c.includes("emirates") || c.includes("uae"))
    return teamFlagMap["United Arab Emirates"];

  return null;
}

// ---------------- LOADING STATE ----------------
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
  if (liveContainer) liveContainer.innerHTML = "";
  if (upcomingContainer) upcomingContainer.innerHTML = "";
  if (completedContainer) completedContainer.innerHTML = "";
}

// ---------------- STATUS CLASSIFICATION ----------------
function classifyStatus(statusRaw) {
  const status = (statusRaw || "").toLowerCase();

  if (
    status.includes("won") ||
    status.includes("lost") ||
    status.includes("draw") ||
    status.includes("no result") ||
    status.includes("tie") ||
    status.includes("abandoned") ||
    status.includes("ended") ||
    status.includes("completed")
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

// ---------------- MATCH CARD ----------------
function createMatchCard(match, bucket) {
  const rawTeam1 = match.teams && match.teams[0] ? match.teams[0] : "Team A";
  const rawTeam2 = match.teams && match.teams[1] ? match.teams[1] : "Team B";

  const team1 = renderTeam(rawTeam1);
  const team2 = renderTeam(rawTeam2);

  let scoreText = "";
  if (Array.isArray(match.score) && match.score.length > 0) {
    scoreText = match.score
      .map((inn) => {
        const inningName = inn.inning || "Inning";
        const runs = inn.r != null ? inn.r : 0;
        const wickets = inn.w != null ? inn.w : 0;
        const overs = inn.o != null ? inn.o : 0;
        return `${inningName}: ${runs}/${wickets} in ${overs} overs`;
      })
      .join("<br>");
  } else {
    scoreText = "Score not available yet.";
  }

  const statusRaw = match.status || "Status not available";
  const venue = match.venue || "";
  const matchType = (match.matchType || "").toUpperCase();

  const statusClass =
    bucket === "completed"
      ? "match-status completed"
      : bucket === "upcoming"
      ? "match-status upcoming"
      : "match-status";

  const div = document.createElement("div");
  div.className = "match-card";
  div.innerHTML = `
    <div class="match-header">
      <span>${team1} vs ${team2}</span>
      <span>${matchType}</span>
    </div>
    <div class="match-meta">${venue}</div>
    <div class="match-score">${scoreText}</div>
    <div class="${statusClass}">${statusRaw}</div>
  `;
  return div;
}

// ---------------- FETCH MATCHES ----------------
async function fetchScores() {
  if (!liveContainer || !upcomingContainer || !completedContainer) return;
  if (isLoading) return;
  setLoading(true);

  try {
    liveContainer.innerHTML =
      '<p class="placeholder">Loading live matches...</p>';
    upcomingContainer.innerHTML =
      '<p class="placeholder">Loading upcoming matches...</p>';
    completedContainer.innerHTML =
      '<p class="placeholder">Loading recent results...</p>';

    const resp = await fetch(MATCHES_URL);
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
      if (lastUpdated) lastUpdated.textContent = "";
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
    if (lastUpdated) {
      lastUpdated.textContent = "Last updated: " + now.toLocaleTimeString();
    }
  } catch (err) {
    console.error(err);
    if (liveContainer) {
      liveContainer.innerHTML =
        '<p class="placeholder">Error loading matches. Please try again.</p>';
    }
  } finally {
    setLoading(false);
  }
}

// ---------------- PLAYER SEARCH ----------------
async function searchPlayerByName(name) {
  if (!playerResult) return;

  if (!name) {
    playerResult.innerHTML = "<p>Please type a player name.</p>";
    return;
  }

  playerResult.innerHTML = "<p>Searching player...</p>";

  try {
    // 1) Search for player to get ID
    const searchResp = await fetch(
      PLAYER_SEARCH_URL + encodeURIComponent(name)
    );
    if (!searchResp.ok) {
      throw new Error("Search request failed: " + searchResp.status);
    }
    const searchData = await searchResp.json();

    if (!searchData.data || !searchData.data.length) {
      playerResult.innerHTML = "<p>No player found with that name.</p>";
      return;
    }

    const player = searchData.data[0]; // first result
    const playerId = player.id;

    // 2) Fetch detailed info
    const infoResp = await fetch(
      PLAYER_INFO_URL + encodeURIComponent(playerId)
    );
    if (!infoResp.ok) {
      throw new Error("Info request failed: " + infoResp.status);
    }
    const infoData = await infoResp.json();
    const p = infoData.data || {};

    const fullName = p.name || player.name || "Unknown player";
    const country = p.country || "Unknown country";
    const role = p.role || "";
    const battingStyle = p.battingStyle || "";
    const bowlingStyle = p.bowlingStyle || "";

    const flagUrl = getCountryFlag(country);

    const stats = Array.isArray(p.stats) ? p.stats : [];
    let battingStats = "";
    let bowlingStats = "";

    stats.forEach((s) => {
      const fn = (s.fn || "").toLowerCase();

      if (fn.includes("batting")) {
        const mat = s.mat ?? "-";
        const runs = s.runs ?? "-";
        const avg = s.avg ?? "-";
        battingStats += `<li>${s.fn}: ${mat} matches, ${runs} runs, avg ${avg}</li>`;
      }
      if (fn.includes("bowling")) {
        const mat = s.mat ?? "-";
        const wkts = s.wkts ?? "-";
        const econ = s.econ ?? "-";
        bowlingStats += `<li>${s.fn}: ${mat} matches, ${wkts} wickets, econ ${econ}</li>`;
      }
    });

    playerResult.innerHTML = `
      <div class="player-card">
        <div class="player-header">
          ${
            flagUrl
              ? `<img src="${flagUrl}" class="player-country-flag" alt="${country} flag">`
              : ""
          }
          <div>
            <div class="player-name">${fullName}</div>
            <div style="font-size:12px; color:#666;">${country}</div>
          </div>
        </div>
        <div style="font-size:12px; margin-bottom:6px;">
          ${role ? `<div>Role: ${role}</div>` : ""}
          ${battingStyle ? `<div>Batting: ${battingStyle}</div>` : ""}
          ${bowlingStyle ? `<div>Bowling: ${bowlingStyle}</div>` : ""}
        </div>
        ${
          battingStats
            ? `<div><strong>Batting stats</strong><ul>${battingStats}</ul></div>`
            : ""
        }
        ${
          bowlingStats
            ? `<div><strong>Bowling stats</strong><ul>${bowlingStats}</ul></div>`
            : ""
        }
      </div>
    `;
  } catch (err) {
    console.error(err);
    playerResult.innerHTML =
      "<p>Error fetching player data (maybe quota or CORS). Try again later.</p>";
  }
}

// hook up the search input + button
if (playerBtn && playerInput && playerResult) {
  playerBtn.addEventListener("click", () => {
    searchPlayerByName(playerInput.value.trim());
  });

  playerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchPlayerByName(playerInput.value.trim());
    }
  });
}

// ---------------- TABS ----------------
if (tabs && tabs.length) {
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
}

// ---------------- REFRESH BUTTON + INITIAL LOAD ----------------
if (refreshBtn) {
  refreshBtn.addEventListener("click", fetchScores);
}

fetchScores();
setInterval(fetchScores, 30000);
