from flask import Flask, render_template, session
from flask.ext.socketio import join_room, leave_room
from flask.ext.socketio import SocketIO, emit
import names, random
import numpy as np
import threading
from pyspark.mllib.recommendation import ALS, MatrixFactorizationModel, Rating


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
count = 0
roomCurrTime = {}
peers = {}
fdict = {}
words = open("words.txt").read().splitlines()
foods = open("foodlist.txt").read().splitlines()
users = []
fakeusers = []
for i in range(10):
    fakeusers.append(names.get_first_name())

def readSentimentList(file_name):
    ifile = open(file_name, 'r')
    happy_log_probs = {}
    sad_log_probs = {}
    ifile.readline() #Ignore title row
    
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
            scorefile.writelines(str(keys)+','+str(k)+','+str(dict_a[keys][k][0])+'\n')
    global t
    t = threading.Timer(30.0, list_all_dict, [fdict])  
    t.start() 

def analyze(sentence, dic):
    happy_log_probs, sad_log_probs = readSentimentList('twitter_sentiment_list.csv')
    user_name = sentence.setdefault('user')
    lines = sentence.setdefault('message').split()
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
                        count = count + 1 
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
                                count = count + 1 
                                dic[keys][word]=[mean, count]
                            else:
                                dic[keys].setdefault(word,[tweet_happy_prob+0.5, 1])

                        elif keys == user_name:
                            if word in dic[keys].keys():
                                mean = dic[user_name][word][0]
                                count = dic[user_name][word][1]
                                mean = (mean*count+tweet_happy_prob)/(count+1)
                                count = count + 1 
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
            session['username'] = names.get_first_name()
            if session['username'] not in users:
                users.append(session['username'])
                break
    print (session['username'])
    return render_template("index.html", myUserName=session['username'])


@socketio.on('request random', namespace='/test')
def request_random(message):
    print message
    room = random.choice(foods)
    join_room(room)
    if room not in peers:
        peers[room] = []
    peers[room].append(message['peer'])
    emit('join confirm', {'room': room, 'peers': peers[room]})


@socketio.on('request join', namespace='/test')
def request_join(message):
    print message
    from_room = message['from']
    to_room = message['to']
    leave_room(from_room)
    join_room(to_room)
    if to_room not in peers:
        peers[to_room] = []
    if from_room:
        peers[from_room].remove(message['peer'])
    peers[to_room].append(message['peer'])
    emit('join confirm', {'room': to_room, 'peers': peers[to_room]}, broadcast=True)


@socketio.on('chat broadcast', namespace='/test')
def room_chat(message):
    print (message)
    emit('chat message receive', {'data': message['user'] + ':' + message['message']}, room=message['food'])
    fdict.update(analyze(message, fdict))


@socketio.on('connect', namespace='/test')
def test_connect():
    emit('my response', {'data': 'Connected'})


@socketio.on('leave', namespace='/test')
def on_leave(message):
    room = message['room']
    leave_room(room)
    users.remove(message['username'])
    emit('chat message receive', message['username'] + ' has left the room.', room=room)
    print('leave')


@socketio.on('message', namespace='/test')
def spam(message):
    global count
    random_user = random.choice(fakeusers)
    random_food = random.choice(foods)
    random_sentence = {'user': random_user, 'food': random_food, 'message': (' '.join(random.sample(words, 10))).join(random.sample(foods, 2))}
    #work on this function!
    print(random_sentence['message'])
    fdict.update(analyze(random_sentence, fdict))
    count = count + 1
    if count >= 10:
        count = 0
        recommend(fdict)
        emit('recommendation receive', fdict[random_user])


def recommend(dictionary):
    # Load and parse the data
    data = sc.textFile("data/mllib/als/test.data")
    ratings = data.map(lambda l: l.split(',')).map(lambda l: Rating(int(l[0]), int(l[1]), float(l[2])))

    # Build the recommendation model using Alternating Least Squares
    rank = 10
    numIterations = 10
    model = ALS.train(ratings, rank, numIterations)

    # Evaluate the model on training data
    testdata = ratings.map(lambda p: (p[0], p[1]))
    predictions = model.predictAll(testdata).map(lambda r: ((r[0], r[1]), r[2]))
    ratesAndPreds = ratings.map(lambda r: ((r[0], r[1]), r[2])).join(predictions)
    MSE = ratesAndPreds.map(lambda r: (r[1][0] - r[1][1])**2).mean()
    print("Mean Squared Error = " + str(MSE))

    # Save and load model
    model.save(sc, "myModelPath")
    sameModel = MatrixFactorizationModel.load(sc, "myModelPath")


if __name__ == "__main__":
    socketio.run(app, '0.0.0.0', 8080)