# WS-TikTakToe
This project, initally created as the final project of CS290 - Web Development, uses websockets to make a dynamic, multiplayer game of TikTakToe.
In this game, the turns cycle in a queue-based system, in order of who joined. The game continues untill Tik or Tak wins, then restarts.

### Features
* Players can join/leave at any time, updating turn order instantly
* Counter telling you what order you are in the queue
* Moves are synced instantly across clients
* Film-Noir Theme
* Easy mouse-based control


### Usage
Install dependencies with `npm install`. Start the server using `npm start`. Server defualts to port 3000, so navigate to `localhost:3000` in your web browser to play. Reccomend opening multiple browser windows to test multiplayer functionality.
