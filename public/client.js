// client.js
const socket = new WebSocket(`ws://${window.location.host}`);

socket.onopen = () => {
  console.log("Connected to server");
};

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "state") {
    updateUI(msg.data);
  }
};

function sendCommand(action, team) {
  if (typeof socket !== "undefined" && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: "command",
      action,
      team
    }));
  }
}

function setTimerDuration() {
  const minutes = parseInt(document.getElementById('timer-minutes').value) || 0;
  const seconds = parseInt(document.getElementById('timer-seconds').value) || 0;
  
  if (typeof socket !== "undefined" && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: "command",
      action: "setTimerDuration",
      minutes: minutes,
      seconds: seconds
    }));
  }
}

function setTeam(team) {
  const select = document.getElementById(team + '-select');
  const selectedOption = select.options[select.selectedIndex];
  const teamName = selectedOption.value;
  const teamColor = selectedOption.getAttribute('data-color');
  
  // Map the dropdown to the correct team based on current sides state
  let actualTeam = team;
  if (currentState && currentState.sidesSwitched) {
    // If sides are switched, map the dropdowns to the opposite teams
    actualTeam = team === 'team1' ? 'team2' : 'team1';
  }
  
  if (typeof socket !== "undefined" && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: "command",
      action: "setTeam",
      team: actualTeam,
      teamName: teamName,
      teamColor: teamColor
    }));
  }
}

// Global variable to track current state for dropdown mapping
let currentState = null;

function updateUI(state) {
  // Store current state for dropdown mapping
  currentState = state;
  
  // If elements exist, update them

  // Determine which team is on which side based on sidesSwitched
  const leftTeam = state.sidesSwitched ? state.team2 : state.team1;
  const rightTeam = state.sidesSwitched ? state.team1 : state.team2;

  // Team 1 (left side)
  if (document.getElementById("team1-score")) {
    document.getElementById("team1-score").textContent = leftTeam.score;
    document.getElementById("team1-score").style.color = leftTeam.color;
  }

  if (document.getElementById("team1-fouls")) {
    document.getElementById("team1-fouls").textContent = leftTeam.fouls;
    document.getElementById("team1-fouls").style.color = leftTeam.color;
  }

  // Update dropdown to show current team
  if (document.getElementById("team1-select")) {
    const select = document.getElementById("team1-select");
    select.value = leftTeam.name;
    select.style.color = leftTeam.color;
  }

  // Team 2 (right side)
  if (document.getElementById("team2-score")) {
    document.getElementById("team2-score").textContent = rightTeam.score;
    document.getElementById("team2-score").style.color = rightTeam.color;
  }

  if (document.getElementById("team2-fouls")) {
    document.getElementById("team2-fouls").textContent = rightTeam.fouls;
    document.getElementById("team2-fouls").style.color = rightTeam.color;
  }

  // Update dropdown to show current team
  if (document.getElementById("team2-select")) {
    const select = document.getElementById("team2-select");
    select.value = rightTeam.name;
    select.style.color = rightTeam.color;
  }

  // Timer
  if (document.getElementById("timer")) {
    const minutes = Math.floor(state.timer.seconds / 60);
    const seconds = state.timer.seconds % 60;
    document.getElementById("timer").textContent =
      `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
}
