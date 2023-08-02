const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

const middleware = (req, res, next) => {
  let jwtToken;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (!jwtToken) {
    res.send(401).send("Invalid JWT Token1");
  } else {
    jwt.verify(jwtToken, "my_secret_token", async (err, data) => {
      if (err) {
        console.log(err);
        res.status(401).send("Invalid JWT Token2");
      } else {
        req.username = data.username;
        next();
      }
    });
  }
};

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

app.post("/login/", async (req, res) => {
  const userDetails = req.body;
  const { username, password } = userDetails;

  let userSql = `SELECT * FROM user WHERE username = '${username}'`;

  let user = await db.get(userSql);

  if (!user) {
    res.status(400).send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (isPasswordMatched) {
      const payload = {
        username,
      };
      const jwtToken = jwt.sign(payload, "my_secret_token");
      res.send({ jwtToken });
    } else {
      res.status(400).send("Invalid password");
    }
  }
});

app.get("/user/tweets/feed", middleware, async (req, res) => {
  const sql = `SELECT * FROM tweet
    LEFT JOIN user ON "user"."user_id" = "tweet"."user_id"
    WHERE "user"."name" = '${req.username}'
    LIMIT 4`;

  const resp = db.all(sql);
  res.send(resp);
});
