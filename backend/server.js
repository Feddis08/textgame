var express = require("express");
var cors = require("cors");
var app = express();
var port = 3030;
var socket = require("socket.io");
var User = require("./classes/User.js");
var Output = require("./classes/Output.js");
app.get("/products/:id", function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});
app.use(express.static("static"));

const http = app.listen(3030);

app.use(cors());
//socketConnections = () => {
var io = require("socket.io")(http, {
  allowEIO3: true,
  cors: {
    origin: ["http://10.0.0.118:8099"],
    origin: ["http://feddis08.ddns.net:8099"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  socket.on("join", (token) => {
    console.log("Token:", token, socket.id);
    if (token.type == "anmelden") {
      GameServer.users.forEach((user, index) => {
        if (token.name == user.name) {
          if (token.password == user.password) {
            user.update(socket.id);
            token.sid = user.sid;
            token.id = socket.id;
            io.to(user.id).emit("joinOk", token);
            io.emit("join", user.name);
            console.log("user accepted:", user);
          } else {
            console.log("user not accepted:", user);
          }
        } else {
          console.log("user not accepted:", user);
        }
      });
    }
    if (token.type == "registrien") {
      GameServer.users.forEach((user, index) => {
        if (user.name == token.name) {
          console.log("user can't logging is: user already exists");
          io.to(socket.id).emit("joinNotOk", token);
        } else {
          user = new User(socket.id, token.name);
          user.create(socket.id, token.name, token.password);
          GameServer.users.push(user);
          console.log(GameServer.users);
          token.sid = user.sid;
          token.id = socket.id;
          io.to(user.id).emit("joinOk", token);
          console.log("User registerd:", user);
        }
      });
    }
  });
  socket.on("request", (data) => {
    //console.log(data);
    GameServer.users.forEach((user, index) => {
      if (user.registerd == true) {
        if (user.id == data.id) {
          if (data.actionMessage == true) {
            user.message = data.message;
            user.actionMessage = data.actionMessage;
          }
        }
      }
    });
  });
  socket.on("disconnect", function () {
    GameServer.users.forEach((user, index) => {
      if (user.id == socket.id) {
        user.online = false;
        let output = new Output();
        output.type = "sayMessage";
        output.isMessage = true;
        output.author = "Server";
        output.content = user.name + " disconnected.";
        console.log("[info/Socket]:", user.name, "disconnected");
        io.emit("response", output);
        output.type = "sayMessage";
        output.isMessage = true;
        output.content = user.name + " disconnected";
        wrongContent = false;
        GameServer.output[output];
      }
    });
  });
});

//};

GameServer = {
  tick: 0,
  clock: 0,
  online: [],
  users: [],
  output: [],

  catchHealth: (error, e) => {
    if (error == "socketConnections") {
      console.log("[WARN/Socket]:", e);
    }
    if (error == "ping") {
      console.log("[WARN/Ping]:", e);
    }
  },
  boot: () => {
    console.log("[info/GameServer]: starting");
    server = new User(null);
    server.name = "Server";
    GameServer.users.push(server);
    setInterval(() => {
      GameServer.gameServer();
    }, 100);
    //socketConnections();
  },
  gameServer: () => {
    //
    //----------Clock-----------
    //
    if (GameServer.tick == 1000) {
      GameServer.clock += 1;
      GameServer.tick = 0;
    }
    if (GameServer.clock == 1) {
      GameServer.clock = 0;
      //
      //ping();
      //
    }
    GameServer.tick = GameServer.tick + 100;
    //
    //-----------GameServer--------------
    //
    GameServer.users.forEach((user, index) => {
      if (user.registerd == true) {
        if (user.online == true) {
          if (user.actionMessage == true) {
            var wrongContent = true;
            let command = user.message.split(" ");
            //
            //----------------say command------------------
            //
            if (command[0] == "say") {
              wrongContent = false;
              var message = new Output();
              message.author = user.name;
              text2 = "";
              command.forEach((word, index) => {
                if (index == 0) {
                } else {
                  var text = text2 + " " + word;
                  text2 = text;
                  message.content = text;
                }
              });
              message.type = "sayMessage";
              message.isMessage = true;
              message.useClientId = false;
              console.log(
                "[info/GameServer]:",
                message.author,
                "says:",
                message.content
              );
            }
            //
            //-------------list command--------
            //

            if (command[0] == "list") {
              //--------list users---------
              if (command[1] == "users") {
                console.log("[info/GameServer]:", user.name, "list all users");
                let output = new Output();
                output.type = "statusPannel";
                output.author = "Server";
                output.content = GameServer.online;
                io.to(user.id).emit("response", output);
                wrongContent = false;
              }
            } //
            if (wrongContent == false) {
              GameServer.output.push(message);
            }
            user.actionMessage = false;
          }
        }
        //
        //----------------message sender-------------
        //
      }
      try {
        GameServer.output.forEach((data, index2) => {
          if (wrongContent == false) {
            //console.log("[info/GameServer]: send", data.content);
            if (data.useClientId == false) {
              io.emit("response", data);
              GameServer.output.splice(index2, 1);
            } else {
              if (data.toClienyId == user.id) {
                io.to(user.id).emit("response", data);
                GameServer.output.splice(index2, 1);
              }
            }
          }
        });
      } catch (e) {
        console.log(
          "[WARN/GameServer]: message sender had an error: message with failure content:",
          e
        );
      }
    });
  },
};
GameServer.boot();
