from functools import wraps
from flask import Flask, request, Response, render_template, g, jsonify
import requests
import sqlite3
import config

app = Flask(__name__)
DATABASE = config.DATABASE
API_KEY = config.API_KEY
UI_PASSWORD = config.UI_PASSWORD


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


# Basic HTTP Authentication
# -------------------------


def check_auth(username, password):
    """This function is called to check if a username /
    password combination is valid.
    """
    return username == 'badmins' and password == UI_PASSWORD


def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'})


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)

    return decorated


# Application Routes
# ------------------


@app.route('/')
@requires_auth
def playerlist():
    con = sqlite3.connect(DATABASE)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("SELECT name,steamid FROM Player")
    dbdata = cur.fetchall()
    data = dict(dbdata)
    return render_template('playerlist.html', data=data)


# API Endpoints
# -------------


@app.route('/getFriends/<int:steam_id>')
def get_friends(steam_id):
    # Send a request to Steam asking for this person's friends
    rv = requests.get("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/"
                      "?key={}"
                      "&steamid={}"
                      "&relationship=friend".format(API_KEY, steam_id))
    friends = rv.json()

    # From our banlist, let's check and see if any of his/her
    # friends are on it
    con = sqlite3.connect(DATABASE)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    bad_friends = []
    try:
        for friend in friends['friendslist']['friends']:
            cur.execute("SELECT banid,steamid FROM Player WHERE steamid == {}".format(friend['steamid']))
            rv = cur.fetchone()
            if rv:
                bad_friends.append(rv)
        if len(bad_friends) > 0:
            return jsonify(dict(bad_friends))
        else:
            return jsonify({"message": "nothing"})
    except KeyError:
        return jsonify({"message": "private"})


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=True)
