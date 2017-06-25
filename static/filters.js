/**
 * Created by Jayson on 6/24/2017.
 */

var table = document.getElementById("playerTable");
var tr = table.getElementsByTagName("tr");

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

function getFriends(steam_id) {
    $.getJSON("/getFriends/" + steam_id, function (response) {
        $.each(response, function (steamid, friends) {
            var row = "<tr>";
            row += "<td>" + steamid + "</td>";
            row += "<td>" + friends.join('<br>') + "</td>";
            row += "</tr>";
            $("table").append(row);
        });
    });
}