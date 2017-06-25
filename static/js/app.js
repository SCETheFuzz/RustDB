/**
 * Created by Jayson on 6/25/2017.
 */

// AJAX request to load the playerlist
function getPlayers() {
    $.getJSON("/getPlayers/", function (response) {
        $.each(response, function (name, steamid) {
            // TODO: Instead of loading the DOM via Flask, load it with AJAX
        });
    });
    return false;
}

function copySteamID(steam_id) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(steam_id).select();
  document.execCommand("copy");
  $temp.remove();
}

// when an alert is closed, remove it from the DOM
$('.alert').on('closed.bs.alert', function () {
  // TODO: remove the alert
});

// prevent page reload on # link clicks
$('a[href="#"]').click(function(event) {
  event.preventDefault();
});

// AJAX request to run a check on players friends list
function getFriends(steam_id, btn) {
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
    $(btn).addClass('disabled');
    return false;
}