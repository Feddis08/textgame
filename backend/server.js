var express = require("express");
var cors = require("cors");
var app = express();
var port = 3030;
var socket = require("socket.io");
app.get("/products/:id", function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for all origins!" });
});
app.use(express.static("static"));
//j

const http = app.listen(3030);

app.use(cors());
class Player {
  type = "";
  name = null;
  id = null;
  message = null;
  registerd = false;
  actionMessage = false;
  available = false;
}
class Output {
  author = null;
  content = null;
  type = null;
  isMessage = false;
  count = 0;
}
class Status {
  clientStatus = "";
  discription = "";
}
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
  let id = socket.id;
  socket.on("join", (playerName) => {
    GameServer.online += 1;
    player = new Player();
    player.name = playerName;
    player.available = true;
    player.id = socket.id;
    player.registerd = true;
    player.type = "join";
    GameServer.players.push(player);
    io.to(player.id).emit("ok", player.id);
    io.emit("response", player);
  });
  socket.on("request", (data) => {
    console.log(data);
    GameServer.players.forEach((player, index) => {
      if (player.registerd == true) {
        if (player.id == data.id) {
          if (data.actionMessage == true) {
            player.message = data.message;
            player.actionMessage = data.actionMessage;
          }
        }
      }
    });
  });
  var ping = () => {
    GameServer.players.forEach((player, index) => {
      try {
        if (player.registerd == true) {
          let packet = new Status();
          packet.discription = "normal Ping";
          io.to(player.id).emit("ping", packet);
          socket.on("ping", (data) => {
            if (data.clientStatus == "ok") {
              player.registerd == true;
            }
            if (data.clientStatus == "logout") {
              player.registerd = false;
            }
          });
        }
      } catch (e) {
        GameServer.catchHealth("ping", e);
        player.registerd = false;
      }
    });
  };
  GameServer.players.forEach((player, index) => {
    let output = new Output();
    output.type = "statusPannel";
    output.author = "Server";
    output.content = GameServer.online;
    io.to(player.id).emit("response", output);
  });
  socket.on("disconnect", function () {
    GameServer.online += -1;
    GameServer.players.forEach((player, index) => {
      let output = new Output();
      output.type = "statusPannel";
      output.author = "Server";
      output.content = GameServer.online;
      io.to(player.id).emit("response", output);
    });
  });
});

//};

GameServer = {
  tick: 0,
  clock: 0,
  online: 0,
  players: [],
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
    GameServer.players.forEach((player, index) => {
      if (player.registerd == true) {
        if (player.actionMessage == true) {
          let command = player.message.split(" ");
          if (command[0] == "say") {
            let message = new Output();
            message.author = player.name;
            command.shift();
            command.forEach((word, index) => {
              var text = text + " " + command[index];
              message.content = text;
            });
            message.type = "sayMessage";
            message.isMessage = true;
            GameServer.output.push(message);
          }
          //
          player.actionMessage = false;
        }
        GameServer.output.forEach((data, index2) => {
          if (data.count == GameServer.players.length) {
            GameServer.output.splice(index2, 1);
          } else {
            data.count += 1;
            io.to(player.id).emit("response", data);
          }
        });
      }
    });
  },
};
GameServer.boot();
