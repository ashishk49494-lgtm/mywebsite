const scoreCard = document.getElementById("score-card");
const lastUpdated = document.getElementById("last-updated");

// CricAPI endpoint for current matches
const API_URL = "https://api.cricapi.com/v1/currentMatches?apikey=fdbc895f-cd4b-47d4-9afd-d4e8a4a1946e&offset=0";

async function fetchScore() {
  try {
    scoreCard.textContent = "Loading live matches...";

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.status);
    }

    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      scoreCard.textContent = "No live matches available right now.";
      return;
    }

    // Just show the first live match for now
    const match = data.data[0];

    // Safely read fields from CricAPI response
    const team1 = match.teams && match.teams[0] ? match.teams[0] : "Team A";
    const team2 = match.teams && match.teams[1] ? match.teams[1] : "Team B";

    // Some matches have 'score' array, e.g. [ { r: runs, w: wickets, o: overs, inning: "..."} ]
    let scoreText = "";
    if (match.score && Array.isArray(match.score) && match.score.length > 0) {
      scoreText = match.score
        .map(
          (inn) =>
            `${inn.inning}: ${inn.r}/${inn.w} in ${inn.o} overs`
        )
        .join("<br>");
    } else {
      scoreText = "Score not available yet.";
    }

    const status = match.status || "Status not available";

    scoreCard.innerHTML = `
      <strong>${team1}</strong> vs <strong>${team2}</strong><br><br>
      ${scoreText}<br><br>
      <em>${status}</em>
    `;

    const now = new Date();
    lastUpdated.textContent = "Last updated: " + now.toLocaleTimeString();
  } catch (err) {
    console.error(err);
    scoreCard.textContent = "Error loading live score. Check console or try again later.";
  }
}

// fetch immediately
fetchScore();

// then refresh every 30 seconds
setInterval(fetchScore, 30000);
// --- REFRESH NOW BUTTON ---
const refreshBtn = document.getElementById("refresh-btn");

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    fetchScore(); // reload immediately
  });
}
