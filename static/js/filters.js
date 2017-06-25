/**
 * Created by Jayson on 6/24/2017.
 */

var table = document.getElementById("playerTable");
var tr = table.getElementsByTagName("tr");

// filter data by Name
function filterName() {
    var input, filter, td, i;
    input = document.getElementById("queryPlayer");
    filter = input.value.toUpperCase();
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// filter data by SteamID
function filterSteamID() {
    var input, filter, td, i;
    input = document.getElementById("querySteamID");
    filter = input.value.toUpperCase();
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function repopulateTable(data) {
    table.innerHTML = "";
    var content = "<thead><tr><th>Name</th><th>SteamID</th><th>IPv4</th><th>Friends</th><th>Tools</th></tr></thead><tbody>";

    $.each(data, function (name, steamid) {
        content += "<tr id=\""+steamid+"\"><td>"+name+"</td><td>" +
            "<a href=\"https://steamcommunity.com/profiles/{{ steamid }}\" target=\"_blank\">"+steamid+"</a>" +
            "&nbsp;<button onclick=\"copySteamID('{{ steamid }}')\" type=\"button\" class=\"btn btn-info btn-sm\" " +
            "aria-label=\"Left Align\">cpy</button></td><td>0.0.0.0</td><td class=\"friends\">*</td><td>" +
            "<button class=\"btn btn-sm btn-default\" onclick=\"getFriends('"+steamid+"', this)\">Friends</button>" +
            "</td></tr>";
    })
    content += "</tbody>";
    table.innerHTML = content;
    return false;
}

// AJAX request to load the playerlist
function queryName() {
    var filter = $playerNameInput.val();
    if (filter !== ''){
        $.getJSON("/getPlayersByName/"+filter, function (response) {
            repopulateTable(response);
        });
    } else {
        $.getJSON("/getPlayers", function (response) {
            repopulateTable(response);
        });
    }
    return false;
}

function querySteamID() {
    var filter = $steamIDInput.val();
    if (filter !== ''){
        $.getJSON("/getPlayersBySteamID/"+filter, function (response) {
            repopulateTable(response);
        });
    } else {
        $.getJSON("/getPlayers", function (response) {
            repopulateTable(response);
        });
    }
    return false;
}

var typingTimer;
var doneTypingInterval = 800;
var $playerNameInput = $('#queryPlayer');
var $steamIDInput = $('#querySteamID');

//on keyup, start the countdown
$playerNameInput.on('keyup', function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(queryName, doneTypingInterval);
});

//on keydown, clear the countdown
$playerNameInput.on('keydown', function () {
  clearTimeout(typingTimer);
});

//on keyup, start the countdown
$steamIDInput.on('keyup', function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(querySteamID, doneTypingInterval);
});

//on keydown, clear the countdown
$steamIDInput.on('keydown', function () {
  clearTimeout(typingTimer);
});