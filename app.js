const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

app.use(express.json());

module.exports = app;

let db = null;
const dbPath = path.join(__dirname, "twitterClone.db");

const initiateDBAndServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
};

initiateDBAndServer();

app.post("/register", async (req, res) => {
  const userDetails = req.body;
  const { username, password, gender, name } = userDetails;

  let sql = `SELECT * FROM user WHERE username = '${username}'`;

  let user = await db.get(sql);

  if (user) {
    res.status(400).send("User already exists");
  } else {
    if (password.length < 6) {
      res.status(400).send("Password is too short");
    } else {
      let encryptedPassword = await bcrypt.hash(req.body.password, 10);
      let insertSql = `INSERT INTO user (username, password, name, gender)
        VALUES (
            '${username}',
            '${encryptedPassword}',
            '${name}',
            '${gender}'
            )`;

      let newUser = await db.run(insertSql);
      res.send("Successful registration of the registrant");
    }
  }
});
