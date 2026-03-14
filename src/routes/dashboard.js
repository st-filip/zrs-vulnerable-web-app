const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  res.send(`
    <head>
      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <div class="container">
      <h2>Dobro došao, ${req.session.user.username} 👋</h2>
      <div class="menu">
        <a href="/search-form">🔍 Pretraga po imenu (SQLi)</a>
        <a href="/comments-form">💬 Komentari (XSS)</a>
        <a href="/change-password-form">🔐 Promena lozinke (CSRF)</a>
        <a href="/ping-form">📡 Ping IP adrese (RCE)</a>
        <a href="/view-file">📂 Pristup lokalnim fajlovima (LFI)</a>
        <a href="/logout">🚪 Logout</a>
      </div>
    </div>
  `);
});

module.exports = router;
