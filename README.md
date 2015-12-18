TalkyFoodie
==============
##Overview
An interactive platform for food lovers to chat with people alike, and enjoy recommendation for new food, powered by speech recognition technology and machine learning engine running behind the scene.

![alt text](https://github.com/MonkeyLeeT/TalkyFoodie/blob/master/misc/homepage.png?raw=true)

##To Run

1. Install Flask, Flask-Socket.IO, Names, Numpy, and all missing libraries of Python when you try to run this application.
2. Include PeerJS's JavaScript library from http://peerjs.com/ and request a server key at http://peerjs.com/peerserver, or you can create your own server yourself using peerjs-server open sourced at https://github.com/peers/peerjs-server.
3. Download Spark and export $SPARK_HOME as well as $PYTHONPATH to point to where you put Spark as well as the Python executable inside Spark folder, or you can run the application first and set these variables following warning messages.
4. At root folder of the project where app.py sits:
```bash
python app.py
```
to run the application using Flask server in debug mode.

# More Info
can be found at : http://www.ee.columbia.edu/~cylin/course/bigdata/projects/ and searching for TalkyFoodie. You're welcome to mail me at tl2493@columbia.edu for any questions you might have and any contribution is greatly appreciated!