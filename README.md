TalkyFoodie - Foodies, Talk!
==============
##Overview
An interactive platform for food lovers to chat with people alike, and discover recommendation for new food, powered by web communication protocols, speech recognition technology and machine learning engine running behind the scene.

![screenshot of homepage](https://github.com/MonkeyLeeT/TalkyFoodie/blob/master/misc/homepage.png?raw=true)

##To Run
1. Install Flask, Flask-Socket.IO, Names, Numpy, and all missing libraries of Python when you try to run this application.
2. Include PeerJS's JS library from http://peerjs.com/ and request a server key at http://peerjs.com/peerserver, or you can create your own server using peerjs-server open sourced at https://github.com/peers/peerjs-server.
3. Download Spark and export $SPARK_HOME as well as $PYTHONPATH to point to where Spark directory as well as the Python executable inside Spark folder.
4. At root folder of the project where app.py sits, to start the Flask server in debug mode:
```bash
python app.py
```
5. Visit localhost:8080, or at the port you specify in app.py.

##To Use
* Click on "random" button to join random food room, or to click on "food" button to enter the food you want to talk about, using the random not-so-awesome name we generate for you.
* Chat with other foodies and you can toggle voice chat on or off to enjoy better chatting experience. Once it's on, speech recognition is automatically done for you in a "hand-off typing" manner.
* Change room whenever you want and you will be connected to new foodies, but don't worry your old foodies will still help our engine to find new food for you.
* At any time, utilize the map block to search for restaurants or cafe or bar to plan your foodie trip. Enough talk, let's eat!

![screenshot of homepage](https://github.com/MonkeyLeeT/TalkyFoodie/blob/master/misc/recommend?raw=true)

##More Info
can be found at : http://www.ee.columbia.edu/~cylin/course/bigdata/projects/ and searching for TalkyFoodie. You're welcome to mail me at tl2493@columbia.edu for any questions you might have and any contribution is greatly appreciated!