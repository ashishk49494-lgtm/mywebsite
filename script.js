const scoreCard = document.getElementById("score-card");
const lastUpdated = document.getElementById("last-updated");
const refreshBtn = document.getElementById("refresh-btn");

// CricAPI endpoint for all current matches
const API_URL =
  "https://api.cricapi.com/v1/currentMatches?apikey=fdbc895f-cd4b-47d4-9afd-d4e8a4a1946e&offset=0";

async function fetchScore() {
  try {
    scoreCard.textContent = "Loading live matches...";

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.status);
    }

    const data = await response.json();

    const matches = data && data.data ? data.data : [];

    if (!matches.length) {
      scoreCard.textContent = "No live matches available right now.";
      lastUpdated.textContent = "";
      return;
    }

    // Build HTML for ALL matches
    let html = "";

    matches.forEach((match) => {
      const team1 = match.teams && match.teams[0] ? match.teams[0] : "Team A";
      const team2 = match.teams && match.teams[1] ? match.teams[1] : "Team B";

      // Build score lines for each innings
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

      const status = match.status || "Status not available";
      const venue = match.venue || "";
      const matchType = match.matchType || "";

      html += `
        <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ddd;">
          <h3 style="margin-bottom: 4px;">
            ${team1} vs ${team2}
          </h3>
          ${matchType || venue ? `<p style="margin: 0 0 8px 0;"><small>${matchType} ${venue ? "• " + venue : ""}</small></p>` : ""}
          <p style="margin: 0 0 8px 0;">${scoreText}</p>
          <p style="margin: 0;"><em>${status}</em></p>
        </div>
      `;
    });

    scoreCard.innerHTML = html;

    const now = new Date();
    lastUpdated.textContent = "Last updated: " + now.toLocaleTimeString();
  } catch (err) {
    console.error(err);
    scoreCard.textContent =
      "Error loading live matches. P
