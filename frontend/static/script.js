var join = false;
var pOutput = [];
var pOnline = 0;
const logging = document.querySelector("#logging");
const pOutput0 = document.querySelector("#pOutput0");
const pOutput1 = document.querySelector("#pOutput1");
const pOutput2 = document.querySelector("#pOutput2");
const pOutput3 = document.querySelector("#pOutput3");
const pOutput4 = document.querySelector("#pOutput4");
const pOutput5 = document.querySelector("#pOutput5");
const pOutput6 = document.querySelector("#pOutput6");
const pOutput7 = document.querySelector("#pOutput7");
const pOutput8 = document.querySelector("#pOutput8");
const pOutput9 = document.querySelector("#pOutput9");
const pStatus = document.querySelector("#pStatus");

draw = (pTag, text) => {
  if (pTag == "mainPannel") pOutput.unshift(text);
  pOutput0.innerHTML = pOutput[0];
  pOutput1.innerHTML = pOutput[1];
  pOutput2.innerHTML = pOutput[2];
  pOutput3.innerHTML = pOutput[3];
  pOutput4.innerHTML = pOutput[4];
  pOutput5.innerHTML = pOutput[5];
  pOutput6.innerHTML = pOutput[6];
  pOutput7.innerHTML = pOutput[7];
  pOutput8.innerHTML = pOutput[8];
  pOutput9.innerHTML = pOutput[9];
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
    if (token.sid != null) {
      this.socket.emit("join", token);
    }
    console.log("first token:", token);
  },
  join() {
    if (logging.value == "registrien") {
      token.type = "registrien";
    }
    if (logging.value == "anmelden") {
      token.type == "anmelden";
    }
    token.name = document.querySelector("#fName").value;
    Player.name = document.querySelector("#fName").value;
    token.password = document.querySelector("#fPw").value;
    document.querySelector("#fCommand").value = null;
    console.log("NAME:", Player.name);
    console.log("joining...");
    this.socket.emit("join", token);
    console.log("Token:", token);
    this.socket.on("joinOk", (data) => {
      token.renew(data.sid, data.id);
      console.log("join accepted:", token);
    });
    /*this.socket.on("ok", (id) => {
      Player.id = id;
      console.log(123, id);
    });
    */
    this.socket.on("response", (data) => {
      console.log(">>>", data);
      if (data.isMessage == true) {
        console.log(data.type, data.author, ":", data.content);
        let output = data.author + " " + "say" + " : " + " " + data.content;
        draw("mainPannel", output);
        console.log("mainPannel", output);
      }
      if (data.type == "join") {
        if (join == true) {
          draw("mainPannel", data.name);
        }
        if (join == false) {
          join = true;
          console.log(data.name, "joined");
          let output = data.name + "  joined";
          draw("mainPannel", output);
          Player.name = data.name;
          Player.id = data.id;
          console.log(data);
        }
      }
    });
    this.socket.on("statusPannel", (data) => {
      console.log("statusPannel", data);
      pOnline = data.content;
      draw("statusPannel", data.content);
    });
    this.socket.on("joinNotOk", (data) => {
      if (data.type == "401") {
        draw(
          "mainPannel",
          "Please register you or logging in and click on Join!"
        );
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

token = {
  id: null,
  sid: null,
  name: null,
  password: null,
  type: "anmelden",

  renew(sid, id) {
    this.id = id;
    Player.id = this.id;
    this.sid = sid;
    this.password = null;
    this.name = null;
    localStorage.setItem("token", token);
  },
};
Player = {
  id: null,
  sid: token.sid,
  name: null,
  message: null,
  actionMessage: false,
};

start = () => {
  try {
    localToken = localStorage.getItem("token");
    token.name = localToken.name;
    token.sid = localToken.sid;
  } catch (e) {
    localStorage.setItem("token", token);
  }
  Server.connect();
};

start();
