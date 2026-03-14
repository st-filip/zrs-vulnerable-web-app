const express = require("express");
const router = express.Router();
const { exec } = require("child_process");

router.get("/ping-form", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.send(`
    <head>
      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <div class="container">
      <h3>Ping IP adrese</h3>
      <form method="POST" action="/ping">
        <input name="ip" placeholder="Unesite IP adresu" required/><br/>
        <button type="submit">Pinguj</button>
      </form>
      <a href="/dashboard">Nazad</a>
    </div>
  `);
});

router.post("/ping", (req, res) => {
  const ip = req.body.ip;
  exec(`ping -c 2 ${ip}`, (err, stdout, stderr) => {
    if (err) {
      return res.send(`
        <head>
          <link rel="stylesheet" type="text/css" href="/style.css">
        </head>
        <div class="container">
          <h3>Greška prilikom pinga:</h3>
          <pre>${stderr}</pre>
          <a href="/ping-form">Pokušaj ponovo</a>
        </div>
      `);
    }
    res.send(`
      <head>
        <link rel="stylesheet" type="text/css" href="/style.css">
      </head>
      <div class="container">
        <h3>Rezultati pinga:</h3>
        <pre>${stdout}</pre>
        <a href="/ping-form">Pokušaj ponovo</a>
      </div>
    `);
  });
});

module.exports = router;
