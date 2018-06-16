"use strict";

// our dependencies
const express = require("express");
const fs = require("fs");
var bodyParser = require("body-parser");

function readData() {
  return new Promise(function(resolve, reject) {
    fs.readFile("gameResults.json", (err, data) => {
      if (err) reject(err);
      let games = JSON.parse(data);
      resolve(games);
    });
  });
}

var games;
const app = express();
// Add headers
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  var allowedOrigins = ["http://localhost:3000", "http://etherfifa.com"];
  var origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // Pass to next layer of middleware
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/game", async function(req, res) {
  var game_id = req.query.id;
  try {
    if (!games) {
      games = await readData();
    }
    res.send(games[game_id]);
  } catch (error) {
    console.error(error);
  }
});

app.post("/addResult", async function(req, res) {
  if (Object.keys(req.body).length === 0) {
    return res.send("server post error!");
  }
  var _gameNumber = req.body.game_id;
  var _teamA = req.body.teamA;
  var _teamB = req.body.teamB;

  var _game = {
    game: _gameNumber,
    teamA: _teamA,
    teamB: _teamB
  };

  try {
    if (!games) {
      games = await readData();
    }
    games.push(_game);
    var json = JSON.stringify(games);
    var fs = require("fs");
    fs.writeFile("gameResults.json", json, function(err) {
      if (err) throw err;
      console.log("add game complete");
    });
    res.end("AOK");
  } catch (error) {
    console.error(error);
  }
});
// set the server to listen on port 3000
app.listen(4000, () => console.log("Listening on port 4000"));
