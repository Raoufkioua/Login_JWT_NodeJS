const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "fdvjkkenfrjfrejhfnkweölopk";

mongoose.connect("mongodb://localhost:27017/login-app-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const app = express();

app.use("/", express.static(path.join(__dirname, "static")));

app.use(bodyParser.json());

app.post("/api/change-password", async (req, res) => {
  const { token, newPassword: PlainTextPassword } = req.body;
  console.log(PlainTextPassword);
  console.log(token);
  if (!PlainTextPassword || typeof PlainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid Password" });
  }

  if (PlainTextPassword.length < 5) {
    return res.json({ status: "error", error: "Password too small !" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log("JWT decoder : ", user);
    const _id = user.id;
    const hashedPassword = await bcrypt.hash(PlainTextPassword, 10);
    await User.updateOne({ _id }, { $set: { Password: hashedPassword } });

    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", error: "" });
  }
});

app.post("/api/login", async (req, res) => {
  const { Email, Password } = req.body;

  const user = await User.findOne({ Email }).lean();
  if (!user) {
    return res.json({ status: "error", error: "Invalid Email/Password" });
  }
  if (await bcrypt.compare(Password, user.Password)) {
    const token = jwt.sign({ id: user._id, Email: user.Email }, JWT_SECRET);
    return res.json({ status: "ok", data: token });
  }

  res.json({ status: "error", error: "Invalid Email/Password" });
});

app.post("/api/register", async (req, res) => {
  const {
    Name,
    Last_Name,
    Date_Birth,
    Email,
    Password: PlainTextPassword,
  } = req.body;

  if (!Name || typeof Name !== "string") {
    return res.json({ status: "error", error: "Invalid username" });
  }

  if (!Last_Name || typeof Last_Name !== "string") {
    return res.json({ status: "error", error: "Invalid Last Name" });
  }

  if (!Email || typeof Email !== "string") {
    return res.json({ status: "error", error: "Invalid Email" });
  }

  if (!PlainTextPassword || typeof PlainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid Password" });
  }

  if (PlainTextPassword.length < 5) {
    return res.json({ status: "error", error: "Password too small !" });
  }

  const password_ = await bcrypt.hashSync(PlainTextPassword, 10);

  try {
    const response = await User.create({
      Name: Name,
      Last_Name: Last_Name,
      Date_Birth: Date_Birth,
      Email: Email,
      Password: password_,
    });
    console.log("User created successfully ");
  } catch (error) {
    if (error.code == 11000) {
      return res.json({
        status: "error",
        data: "",
        error: "Email already in use!",
      });
    }

    throw error;
  }

  res.json({ status: "ok" });
});

app.listen(9999, () => {
  console.log("Server Start at 9999 PORT");
});
