import "./style.css";
let editId;
let allTeams = [];

function $(selector) {
  return document.querySelector(selector);
}

function getTeamAsHtml({id, promotion, members, name, url}) {
  const displayUrl = url.startsWith("https://github.com/") ? url.substring(19) : url
  return `<tr>
    <td>${promotion}</td>
    <td>${members}</td>
    <td>${name}</td>
    <td><a href="${url}" target="_blank">${displayUrl}</a></td>
    <td>
      <a data-id=${id} class="remove-btn" >✖</a>
      <a data-id=${id} class="edit-btn"> &#9998; </a>
    </td>
    </tr>`;
}

let previewDisplayTeams = [];

function displayTeams(teams) {
  if(previewDisplayTeams === teams){
    console.warn('aici');
    return; 
  }
  if(JSON.stringify(previewDisplayTeams) == JSON.stringify(teams)){
    console.warn('same');
    return;
  }

  previewDisplayTeams = teams;
  const teamsHTML = teams.map(getTeamAsHtml);
  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

function loadTeams() {
  fetch("http://localhost:3000/teams-json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(r => r.json())

    .then(teams => {
      allTeams = teams;
      displayTeams(teams);
      console.warn('load');
    });
}

function deleteTeamRequest(id, callback) {
  return fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: id })
  })
    .then(r => r.json())
    .then(status => {
      if (typeof callback === "function") {
        callback(status);
      }
      return status;
    });
}

function updateTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

function createTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

function startEdit(id) {
  editId = id;
  const team = allTeams.find(team => team.id == id);
  setTeamValues(team);
}

function setTeamValues({promotion, members, name, url}) {
  $("#promotion").value = promotion;
  $("#members").value = members;
  $("input[name=name]").value = name;
  $("input[name=url]").value = url;
}

function getTeamValues() {
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("input[name=name]").value;
  const url = $("input[name=url]").value;
  return {
    promotion,
    members,
    name: name,
    url: url
  };
}

function onSubmit(e) {
  e.preventDefault();
  const team = getTeamValues();
  if (editId) {
    team.id = editId;
    updateTeamRequest(team).then(({success}) => {
      if (success) {
        allTeams = allTeams.map(t => {
          if(t.id == editId){
            return {
              ...t,
              ...team
            };
          }
          return t;
        }
        )
        displayTeams(allTeams)
        $("#teamsForm").reset();
      }
    });
  } else {
    createTeamRequest(team).then(status => {
      if (status.success) {
        team.id = status.id;
        allTeams = [...allTeams, team ]
        displayTeams(allTeams)

        $("#teamsForm").reset();
      }
    });
  }
}

function filterElements(elements, search) {
  search = search.toLowerCase();
  return elements.filter(element => {
    return Object.entries(element).some(entry => {
      if (entry[0] !== "id") {
        return entry[1].toLowerCase().includes(search);
      }
    });
  });
}

function initEvents() {
  $("#searchTeams").addEventListener("input", e => {
    const teams = filterElements(allTeams, e.target.value);
    displayTeams(teams);
  });

  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;

      deleteTeamRequest(id, status => {
        if (status.success) {
          console.warn("delete done", status);
          loadTeams();
        }
      });
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      startEdit(id);
    }
  });
  $("#teamsForm").addEventListener("submit", onSubmit);
  $("#teamsForm").addEventListener("reset", () => {
    editId = undefined;
  });
}

loadTeams();
initEvents();