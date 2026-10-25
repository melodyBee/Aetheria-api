const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  Name: { type: String, required: true, trim: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Number: { type: String, required: true },
  ProfilePic: { type: String, default: "" },
  Role: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  Joining: { type: Date, default: Date.now },
});

const User = model("User", UserSchema);
module.exports = User;
