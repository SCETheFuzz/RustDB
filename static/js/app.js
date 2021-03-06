/**
 * Created by Jayson on 6/25/2017.
 */
var NAME, STEAMID, IP;

NAME = 0;
STEAMID = 1;
IP = 2;


var typingTimer;
var doneTypingInterval = 200;
var $playerNameInput = $('#queryPlayer');
var $steamIDInput = $('#querySteamID');
var $steamIPInput = $('#queryIP');
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
    var content = "<thead><tr>" +
        "<th>Name</th>" +
        "<th>SteamID</th>" +
        "<th>Notes</th>" +
        "<th>IPv4</th>" +
        "<th>Intel</th>" +
        "<th>Friends</th>" +
        "<th>Tools</th>" +
        "</tr></thead><tbody>";

    for (var result in data) {
        content += "<tr id=\"" + data[result]['steamid'] + "\">";
        content += "<td>" + data[result]['name'] + "</td>";

        content += "<td><a href=\"https://steamcommunity.com/profiles/" + data[result]['steamid'] + "\" target=\"_blank\">" + data[result]['steamid'] + "</a>" +
            "&nbsp;<button onclick=\"copySteamID('" + data[result]['steamid'] + "')\" type=\"button\" class=\"btn btn-info btn-sm\" aria-label=\"Left Align\">copy</button></td>";

        content += "<td><a href=\"#\" class=\"comment\" data-type=\"text\" data-pk=\"" + data[result]['steamid'] + "\" data-url=\"/setPlayerComment\" data-title=\"Enter new comment\">";

        if (data[result]['comment'] != '') {
            content += data[result]['comment'];
        } else {
            content += "Empty"
        }

        content += "</a></td>";

        content += "<td>" + data[result]['ip'] + "</td>";
        content += "<td class='intel'>*</td>";
        content += "<td class=\"friends\">*</td>";

        content += "<td><button class=\"btn btn-sm btn-default\" onclick=\"getIpIntel('" + data[result]['ip'] + "', '" + data[result]['steamid'] + "', this)\">IP Intel</button> " +
            "<button class=\"btn btn-sm btn-default\" onclick=\"getFriends('" + data[result]['steamid'] + "', this)\">Friends</button></td></tr>";
    }
    content += "</tbody>";
    table.innerHTML = content;
    $.fn.editable.defaults.mode = 'inline';
    $('.comment').editable();
    return false;
}

// AJAX request to load the playerlist
function queryName() {
    var filter = $playerNameInput.val();
    if (filter !== '') {
        $.getJSON("/getPlayersByName/" + filter, function (response) {
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
    if (filter !== '') {
        $.getJSON("/getPlayersBySteamID/" + filter, function (response) {
            repopulateTable(response);
        });
    } else {
        $.getJSON("/getPlayers", function (response) {
            repopulateTable(response);
        });
    }
    return false;
}


function queryIP() {
    var filter = $steamIPInput.val();
    if (filter !== '') {
        $.getJSON("/getPlayersByIP/" + filter, function (response) {
            repopulateTable(response);
        });
    } else {
        $.getJSON("/getPlayers", function (response) {
            repopulateTable(response);
        });
    }
    return false;
}

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
$steamIPInput.on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(queryIP, doneTypingInterval);
});

//on keydown, clear the countdown
$steamIPInput.on('keydown', function () {
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

function copySteamID(steam_id) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(steam_id).select();
    document.execCommand("copy");
    $temp.remove();
}

// when an alert is closed, remove it from the DOM
$('.alert').on('closed.bs.alert', function () {
    // TODO: remove the alert from DOM
});

// prevent page reload on # link clicks
$('a[href="#"]').click(function (event) {
    event.preventDefault();
});

function getIpIntel(ip, steam_id, btn) {
    $.getJSON("/getIpIntel/" + ip, function (response) {
        var intel = $("#" + steam_id + " > .intel");
        intel.html(response.toFixed(2));
    });
    $(btn).addClass('disabled');
    return false;
}

// AJAX request to run a check on players friends list
function getFriends(steam_id, btn) {
    steam_id = String(steam_id);
    var element = $("#" + steam_id + " > .friends");
    var alerts = $("#alerts");

    $.getJSON("/getFriends/" + String(steam_id), function (response) {
        if (response.message === "nothing") {
            element.html("All safe!");
        } else if (response.message == "private") {
            element.html("Private profile");
        } else {
            $("#" + steam_id).addClass("table-danger");
            element.html("banned <span class=\"badge badge-danger\">" + response.length + "</span>");

            var alert = "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span>" +
                "</button><strong>" + steam_id + "</strong>" +
                " Has banned friends: <ul>";

            console.log(response);
            for (var i = 0; i < response.length; i++)
            {
                alert += "<li><u>" + response[i]['SteamID'] + "</u>: <i>" + response[i]['Reason'] + "</i></li>";
            }
            alert += "</ul></div>";

            alerts.append(alert);
        }
    });
    $(btn).addClass('disabled');
    return false;
}