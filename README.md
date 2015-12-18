TalkyFoodie
==============
##Overview
An interactive platform for food lovers to interact with each other and enjoy recommendation for new food, powered by machine learning engine running behind the scene.

![alt text](https://github.com/MonkeyLeeT/TalkyFoodie/blob/master/misc/homepage.png?raw=true)

##To Run

1. Install Flask, Flask-Socket.io and all missing libraries of Python.
2. Install PeerJS's library and request a server key, otherwise you can create your own server yourself using peerjs-server open sourced at https://github.com/peers/peerjs-server.
3. Download Spark and export $SPARK_HOME as well as $PYTHONPATH to point to where you put Spark as well as the Python executable inside Spark folder.
4. At root folder of the project,
```bash
python app.py
```
to run the application using Flask server in debug mode.

# More Info
can be found at : http://www.ee.columbia.edu/~cylin/course/bigdata/projects/ and search for TalkyFoodie.