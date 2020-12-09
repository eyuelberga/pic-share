const path = require('path')
const usernameGen = require("username-generator");
const express = require('express')
const app = express()
var http = require("http").createServer(app);
var io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});
app.use(express.static('./client/build'));

app.get('*', (req,res)=>{
    res.sendFile(path.resolve(__dirname, "client","build","index.html"));
})
const logger = require("./utils/logger");
const SOCKET_EVENT = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnect",
  USERS_LIST: "users_list",
  REQUEST_SENT: "request_sent",
  REQUEST_ACCEPTED: "request_accepted",
  REQUEST_REJECTED: "request_rejected",
  SEND_REQUEST: "send_request",
  ACCEPT_REQUEST: "accept_request",
  REJECT_REQUEST: "reject_request",
};
const users = {};
const usersList = (usersObj)=>{
	const list = [];
	Object.keys(usersObj).forEach(username=>{
		list.push({username, timestamp:usersObj[username].timestamp});
	})
	return list;
}
io.on("connection", (socket) => {
  //generate username against a socket connection and store it
  const username = usernameGen.generateUsername("-");
  if (!users[username]) {
    users[username] = { id: socket.id, timestamp: new Date().toISOString() };
  }
  logger.log(SOCKET_EVENT.CONNECTED, username);
  // send back username
  socket.emit(SOCKET_EVENT.CONNECTED, username);
  // send online users list
  io.sockets.emit(SOCKET_EVENT.USERS_LIST, usersList(users) );

  socket.on(SOCKET_EVENT.DISCONNECTED, () => {
    // remove user from the list
    delete users[username];
    // send current users list
    io.sockets.emit(SOCKET_EVENT.USERS_LIST, usersList(users) );
    logger.log(SOCKET_EVENT.DISCONNECTED, username);
  });

  socket.on(SOCKET_EVENT.SEND_REQUEST, ({ username, signal, to }) => {
    // tell user that a request has been sent
    io.to(users[to].id).emit(SOCKET_EVENT.REQUEST_SENT, {
      signal,
      username,
    });
    logger.log(SOCKET_EVENT.SEND_REQUEST, username);
  });

  socket.on(SOCKET_EVENT.ACCEPT_REQUEST, ({ signal, to }) => {
    // tell user the request has been accepted
    io.to(users[to].id).emit(SOCKET_EVENT.REQUEST_ACCEPTED, {signal});
    logger.log(SOCKET_EVENT.ACCEPT_REQUEST, username);
  });

  socket.on(SOCKET_EVENT.REJECT_REQUEST, ({ to }) => {
    // tell user the request has been rejected
    io.to(users[to].id).emit(SOCKET_EVENT.REQUEST_REJECTED);
    logger.log(SOCKET_EVENT.REJECT_REQUEST, username);
  });
});
const port = process.env.PORT || 8060;
http.listen(port);
logger.log("server listening on port", port);
