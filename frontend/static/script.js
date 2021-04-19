var pOutput = [];
var pOnline = 0;
const pOutput0 = document.querySelector("#pOutput0");
const pOutput1 = document.querySelector("#pOutput1");
const pOutput2 = document.querySelector("#pOutput2");
const pOutput3 = document.querySelector("#pOutput3");
const pOutput4 = document.querySelector("#pOutput4");
const pStatus = document.querySelector("#pStatus");

draw = (pTag, text) => {
  if (pTag == "mainPannel") pOutput.unshift(text);
  pOutput0.innerHTML = pOutput[0];
  pOutput1.innerHTML = pOutput[1];
  pOutput2.innerHTML = pOutput[2];
  pOutput3.innerHTML = pOutput[3];
  pOutput4.innerHTML = pOutput[4];
  //
  if (pTag == "statusPannel") {
    pStatus.innerHTML = text;
  }
};

keyHandles = () => {
  document.addEventListener("keydown", (evt) => {
    switch (evt.code) {
      case "Enter":
        Server.send();
        break;
        //      Server.socket.emit("request", evt.code);
        console.log(evt.code);
        break;
    }
  });
};

keyHandles();

Server = {
  socket: null,
  //url: "http://10.0.0.118:3030",
  url: "feddis08.ddns.net:3030",
  connect() {
    this.socket = io.connect(this.url);
    Player.id = this.socket.id;
    console.log("connect");
  },
  join() {
    Player.name = document.querySelector("#fName").value;
    console.log("NAME:", Player.name);
    console.log("joining...");
    this.socket.emit("join", Player.name);
    this.socket.on("ok", (id) => {
      Player.id = id;
      console.log(123, id);
    });
    this.socket.on("response", (data) => {
      if (data.isMessage == true) {
        console.log(data.type, data.author, ":", data.content);
        let output = data.author + " " + "say" + " : " + " " + data.content;
        draw("mainPannel", output);
        console.log("mainPannel", output);
      }
      if (data.type == "join") {
        console.log(data.name, "joined");
        let output = data.name + "  joined";
        draw("mainPannel", output);
        //Player.id = data.id;
        console.log(data);
      }
      if (data.type == "statusPannel") {
        pOnline = data.content;
        draw("statusPannel", data.content);
      }
    });
  },
  send() {
    Player.message = document.querySelector("#fCommand").value;
    Player.actionMessage = true;
    //console.log("send:", Player.message);
    document.querySelector("#fCommand").value = null;
    console.log(Player);
    this.socket.emit("request", Player);
    //Player.actionMessage = false;
  },
};

Player = {
  id: null,
  name: null,
  message: null,
  actionMessage: false,
};

start = () => {
  Server.connect();
};

start();
