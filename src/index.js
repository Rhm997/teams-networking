import "./style.css";

function loadTeams() {
  fetch("teams.json")
    .then(r => r.json())
    .then(teams => {
      console.warn("result", teams);
    });
}

loadTeams();
