output = [];

output[0] = document.querySelector("#pTag0");
output[0] = "Hello";

draw = () => {
  output[0].innerHTML = "<b>contacting server...</b>";
};

keyHandles = () => {
  document.addEventListener("keydown", (evt) => {
    switch (evt.code) {
      case "Space":
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowRight":
      case "ArrowLeft":
      case "Enter":
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
  url: "http://10.0.0.118:3030",
  //url: ,
  connect() {
    this.socket = io.connect(this.url);
    Player.id = this.socket.id;
    console.log("connect");
  },
  join() {
    Player.name = document.querySelector("#fName").value;
    console.log("NAME:", Player.name);
    console.log("joining...");
  },
};

Player = {
  id: null,
  name: null,
};

start = () => {
  Server.connect();
  draw();
};

start();
