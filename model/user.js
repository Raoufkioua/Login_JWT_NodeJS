const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    Last_Name: { type: String, required: true },
    Date_Birth: { type: Date, required: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
  },
  { collection: "users" }
);

const model = mongoose.model("UserSchema", UserSchema);

module.exports = model;
