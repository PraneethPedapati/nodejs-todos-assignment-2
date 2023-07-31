const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

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
