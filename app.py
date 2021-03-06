from flask import Flask, render_template, session
from flask.ext.socketio import join_room, leave_room
from flask.ext.socketio import SocketIO, emit
import names
import random
import numpy as np
from pyspark.mllib.recommendation import ALS, MatrixFactorizationModel, Rating
import recommend

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!!'
socketio = SocketIO(app)
reset = 0
roomCurrTime = {}
peers = {}
fdict = {}
foods = open("food_list.txt").read().splitlines()
users = {}


def readSentimentList(file_name):
    ifile = open(file_name, 'r')
    happy_log_probs = {}
    sad_log_probs = {}
    ifile.readline()
    
    for line in ifile:
        tokens = line[:-1].split(',')
        happy_log_probs[tokens[0]] = float(tokens[1])
        sad_log_probs[tokens[0]] = float(tokens[2])

    return happy_log_probs, sad_log_probs


def classifySentiment(words, happy_log_probs, sad_log_probs):
    # Get the log-probability of each word under each sentiment
    happy_probs = [happy_log_probs[word] for word in words if word in happy_log_probs]
    sad_probs = [sad_log_probs[word] for word in words if word in sad_log_probs]

    # Sum all the log-probabilities for each sentiment to get a log-probability for the whole tweet
    tweet_happy_log_prob = np.sum(happy_probs)
    tweet_sad_log_prob = np.sum(sad_probs)

    # Calculate the probability of the tweet belonging to each sentiment
    prob_happy = np.reciprocal(np.exp(tweet_sad_log_prob - tweet_happy_log_prob) + 1)
    prob_sad = 1 - prob_happy

    return prob_happy, prob_sad


def list_all_dict(dict_a):
    scorefile = open('scorefile.txt', 'w')
    for keys in dict_a:
        for k in dict_a[keys]:
            scorefile.writelines(str(keys)+','+str(foods.index(k))+','+str(dict_a[keys][k][0])+'\n')


def analyze(sentence, dic):
    happy_log_probs, sad_log_probs = readSentimentList('sentiment_list.csv')
    user_name = sentence.setdefault('user')
    lines = sentence.setdefault('text').lower().split()
    hashtagfood = sentence.setdefault('food')
    dic.setdefault(user_name,{})
    tweet_happy_prob, tweet_sad_prob = classifySentiment(lines, happy_log_probs, sad_log_probs)
    if tweet_happy_prob > tweet_sad_prob:
        for word in lines:
            if word in foods:
                if word == hashtagfood:
                    if word in dic[user_name].keys():
                        mean = dic[user_name][word][0]
                        count = dic[user_name][word][1]
                        mean = (mean*count+tweet_happy_prob)/(count+1)
                        count += 1
                        dic[user_name][word]=[mean, count]
                    else:
                        dic[user_name].setdefault(word,[tweet_happy_prob, 1])

                else: 
                    for keys in dic:
                        if keys!=user_name:
                            if word in dic[keys].keys():
                                mean = dic[user_name][word][0]
                                count = dic[user_name][word][1]
                                mean = (mean*count+tweet_happy_prob+0.5)/(count+1)
                                count += 1
                                dic[keys][word]=[mean, count]
                            else:
                                dic[keys].setdefault(word,[tweet_happy_prob+0.5, 1])

                        elif keys == user_name:
                            if word in dic[keys].keys():
                                mean = dic[user_name][word][0]
                                count = dic[user_name][word][1]
                                mean = (mean*count+tweet_happy_prob)/(count+1)
                                count += 1
                                dic[user_name][word]=[mean, count]
                            else:
                                dic[keys].setdefault(word,[tweet_happy_prob, 1])
    return dic


@app.errorhandler(404)
def page_not_found():
    return "Sorry, this page was not found.", 404


@app.route("/")
def home():
    if 'username' not in session:
        while True:
            name = names.get_first_name()
            if name not in users:
                session['username'] = name
                print name
                users[name] = random.choice(range(00000, 99999))
                break
    return render_template("index.html", myUserName=session['username'], myUserID=users[session['username']])


@socketio.on('request random', namespace='/test')
def request_random(message):
    print (message)
    room = random.choice(foods)
    join_room(room)
    if room not in peers:
        peers[room] = []
    peers[room].append(message['peer'])
    emit('join confirm', {'room': room, 'peers': peers[room]})


@socketio.on('request join', namespace='/test')
def request_join(message):
    print (message)
    from_room = message['from']
    to_room = message['to']
    leave_room(from_room)
    join_room(to_room)
    if to_room not in peers:
        peers[to_room] = []
    if from_room:
        peers[from_room].remove(message['peer'])
    peers[to_room].append(message['peer'])
    emit('join confirm', {'room': to_room, 'peers': peers[to_room]}, room=to_room)


@socketio.on('chat broadcast', namespace='/test')
def room_chat(message):
    # print (message)
    global reset
    emit('chat message receive', {'data': message['username'] + ':' + message['text']}, room=message['food'])
    fdict.update(analyze(message, fdict))
    reset += 1
    print reset
    if reset >= 10:
        reset = 0
        list_all_dict(fdict)
        result = recommend.Recommendation('scorefile.txt', foods)
        print result
        emit('recommendation receive', result, broadcast=True)


@socketio.on('connect', namespace='/test')
def test_connect():
    emit('my response', {'data': 'Connected'})


@socketio.on('leave', namespace='/test')
def on_leave(message):
    room = message['room']
    leave_room(room)
    users.pop(message['username'], none)
    emit('chat message receive', message['username'] + ' has left the room.', room=room)
    print('leave')


if __name__ == "__main__":
    socketio.run(app, '0.0.0.0', 8080)

