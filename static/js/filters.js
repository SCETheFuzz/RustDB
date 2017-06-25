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

$('a[href="#"]').click(function(event) {
  event.preventDefault();
});

// TODO figure out why empty responses won't update to "Unavailable"
function getFriends(steam_id) {
    steam_id = String(steam_id);
    var element = $("#" + steam_id + " > .friends");

    $.getJSON("/getFriends/" + String(steam_id), function (response) {
        var banned = 0;
        var clean = 0;

        if (response.message === "nothing") {
            element.html("No friends on US");
        } else if (response.message == "private") {
            element.html("Private profile");
        } else {
            $.each(response, function (banid, steamid) {
                if (banid > 0) {
                    banned++;
                } else if (banid < 0) {
                    clean++;
                }
            });

            if (banned > 0){
                $("#" + steam_id).className.append("table-danger");
                element.html("banned <span class=\"badge badge-danger\">" + banned);
            } else if (clean > 0) {
                element.html("All safe!");
            }
        }
    });
    return false;
}