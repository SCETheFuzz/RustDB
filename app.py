from functools import wraps
from flask import Flask, request, Response, render_template, jsonify
import requests
from flask_pymongo import PyMongo
from bson.json_util import dumps

app = Flask(__name__)
app.config.from_pyfile('config.py')
mongo = PyMongo(app, config_prefix='MONGO')


# Basic HTTP Authentication
# -------------------------


def check_auth(username, password):
    """This function is called to check if a username /
    password combination is valid.
    """
    return username == 'badmins' and password == app.config['UI_PASSWORD']


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
    dbdata = mongo.db.players.find(projection={"name": 1, "steamid": 1, "ip": 1, "_id": 0, "comment": 1},
                                   limit=100).sort('{name:1, steamid:1, ip:1}')
    return render_template('playerlist.html', data=dbdata)


# API Endpoints
# -------------


@app.route('/setPlayerComment', methods=['POST'])
@requires_auth
def set_player_comment():
    data = request.form
    values = dict(data.items())
    mongo.db.players.update_one({'steamid': values['pk']}, {'$set': {'comment': values['value']}}, upsert=False)
    return jsonify({"message": "success"})


@app.route('/getPlayers')
@requires_auth
def get_players():
    dbdata = mongo.db.players.find(projection={"name": 1, "steamid": 1, "ip": 1, "_id": 0, "comment": 1},
                                   limit=100).sort('{name:1, steamid:1, ip:1}')
    return dumps(dbdata)


@app.route('/getIpIntel/<string:ip_addr>')
@requires_auth
def get_ip_intel(ip_addr):
    rv = requests.get("http://check.getipintel.net/check.php"
                      "?ip={}"
                      "&contact={}".format(ip_addr, app.config['CONTACT_EMAIL']))
    score = rv.json()
    return jsonify(score)


@app.route('/getPlayersByName/<string:query_filter>')
@requires_auth
def get_players_by_name(query_filter):
    dbdata = mongo.db.players.find({"name": {"$regex": "{}".format(query_filter)}},
                                   projection={"name": 1, "steamid": 1, "ip": 1, "_id": 0, "comment": 1},
                                   limit=100).sort('{name:1, steamid:1, ip:1}')
    return dumps(dbdata)


@app.route('/getPlayersByIP/<string:query_filter>')
@requires_auth
def get_players_by_ip(query_filter):
    dbdata = mongo.db.players.find({"ip": {"$regex": "{}".format(query_filter)}},
                                   projection={"name": 1, "steamid": 1, "ip": 1, "_id": 0, "comment": 1},
                                   limit=100).sort('{name:1, steamid:1, ip:1}')
    return dumps(dbdata)


@app.route('/getPlayersBySteamID/<int:query_filter>')
@requires_auth
def get_players_by_steamid(query_filter):
    dbdata = mongo.db.players.find({"steamid": {"$regex": "{}".format(query_filter)}},
                                   projection={"name": 1, "steamid": 1, "ip": 1, "_id": 0, "comment": 1},
                                   limit=100).sort('{name:1, steamid:1, ip:1}')
    return dumps(dbdata)


@app.route('/getFriends/<int:steam_id>')
@requires_auth
def get_friends(steam_id):
    bad_friends = []

    rv = requests.get("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/"
                      "?key={}"
                      "&steamid={}"
                      "&relationship=friend".format(app.config['API_KEY'], steam_id))
    friends = rv.json()

    try:
        for friend in friends['friendslist']['friends']:
            rv = mongo.db.Bans.find_one({"SteamID": "{}".format(friend['steamid'])},
                                        projection={"SteamID": 1, "_id": 0, "Reason": 1, "Server": 1})
            if rv is not None:
                bad_friends.append(rv)
        if len(bad_friends) > 0:
            return dumps(bad_friends)
        else:
            return jsonify({"message": "nothing"})
    except KeyError as err:
        return jsonify({"message": "private"})


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
