const scoreCard = document.getElementById("score-card");
const lastUpdated = document.getElementById("last-updated");

// TODO: put your real API URL here
const API_URL = https://api.cricapi.com/v1/countries?apikey=fdbc895f-cd4b-47d4-9afd-d4e8a4a1946e&offset=0

async function fetchScore() {
  try {
    scoreCard.textContent = "Loading live score...";
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    // You must adjust this part based on the API you use.
    // Here is a generic example:
    const match = data.match || data.data || data[0];

    if (!match) {
      scoreCard.textContent = "No live match data available.";
      return;
    }

    // Example fields - change these to match the real API structure
    const team1 = match.team1 || match.team_a || "Team A";
    const team2 = match.team2 || match.team_b || "Team B";
    const score1 = match.score1 || match.score_a || "0/0";
    const score2 = match.score2 || match.score_b || "0/0";
    const status = match.status || match.result || "In progress";

    scoreCard.innerHTML = `
      <strong>${team1}</strong>: ${score1}<br>
      <strong>${team2}</strong>: ${score2}<br><br>
      <em>${status}</em>
    `;

    const now = new Date();
    lastUpdated.textContent = "Last updated: " + now.toLocaleTimeString();
  } catch (err) {
    console.error(err);
    scoreCard.textContent = "Error loading live score. Try again later.";
  }
}

// fetch immediately
fetchScore();

// then refresh every 30 seconds
setInterval(fetchScore, 30000);
