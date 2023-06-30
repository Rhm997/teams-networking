import "./style.css";

function $(selector){
    return document.querySelector(selector);
}


function getTeamAsHtml(team) {
  return `<tr>
    <td>${team.promotion}</td>
    <td>${team.members}</td>
    <td>${team.name}</td>
    <td>${team.url}</td>
    <td>❌ &#9998;</td>
    </tr>`;
}

function displayTeams(teams) {
  const teamsHTML = teams.map(getTeamAsHtml);
  $("#teamsTable tbody").innerHTML = teamsHTML.join('');
}

function loadTeams() {
  fetch("teams.json")
    .then(r => r.json())
    .then(teams => {
      displayTeams(teams);
    });
}

loadTeams();
