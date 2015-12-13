from flask import Flask, render_template, session
from random import randint
from flask.ext.socketio import join_room, leave_room
from flask.ext.socketio import SocketIO, emit
import names, random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
roomCurrTime = {}
users = []

words = open("words.txt").read().splitlines()
foods = open("foodlist.txt").read().splitlines()
fakeusers = []
for i in range(10):
    fakeusers.append(names.get_first_name())


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


@socketio.on('request host', namespace='/test')
def test_message(message):
    room = str(randint(1, 1000))
    emit('host confirm', {'data': room})
    join_room(room)


@socketio.on('request join', namespace='/test')
def test_message(message):
    room = message['data']
    join_room(room)
    emit('join confirm', {'data': room})


@socketio.on('chat broadcast', namespace='/test')
def room_chat(message):
    print (message)
    room = message['room']
    data = message['data']
    emit('chat message receive', {'data': data}, room=room)


@socketio.on('voice chat', namespace='/test')
def voice_chat(message):
    emit('voice message receive', {'data': message['data'], 'username': message['username']}, room=message['room'],
              broadcast=True, include_self=False)


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
    random_user = random.choice(fakeusers)
    random_food = random.choice(foods)
    random_sentence = {'user': random_user, 'food': random_food, 'message': ' '.join(random.sample(words, 10))}
    #work on this function!
    analyze(random_sentence)


def analyze(text):
    print (text)



if __name__ == "__main__":
    socketio.run(app, '0.0.0.0', 8080)
