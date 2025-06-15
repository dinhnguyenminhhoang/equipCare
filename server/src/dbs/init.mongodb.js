"use strict";
const process = require("process");

const mongoose = require("mongoose");
const connectString =
  "mongodb+srv://dinhnguyenminhhoang28:TyI2uGQp7xKFkSkw@equipcare.u91l3gc.mongodb.net/equipCareDev?retryWrites=true&w=majority&appName=equipCare";

class Database {
  constructor() {
    this.connect();
  }
  //connect
  connect(type = "mongodb") {
    //dev
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectString, { maxPoolSize: 50 })
      .then((_) => console.log("connected MongoDb successfully"))
      .catch((err) => console.log("error connecting", err));
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
