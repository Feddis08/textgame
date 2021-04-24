class User {
  type = "";
  name = null;
  password = null;
  online = false;
  joining = false;
  id = null;
  sid = null;
  message = null;
  registerd = false;
  actionMessage = false;

  create = (id, name, password) => {
    this.sid = id;
    this.name = name;
    this.password = password;
    this.registerd = true;
    this.joining = true;
    this.online = true;
  };
  update = (id) => {
    this.id = id;
    this.registerd = true;
    this.online = true;
  };

  constructor(id) {
    this.id = id;
  }
}

module.exports = User;
