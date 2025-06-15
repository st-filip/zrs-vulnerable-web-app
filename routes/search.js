const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/search-form", (req, res) => {
  res.send(`
    <head>
      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <div class="container">
    <h3>Pretraži po imenu</h3>
      <form method="POST" action="/search">
        <input name="term" placeholder="Pretraga po imenu" required/>
        <button>Traži</button>
      </form>
      <a href="/dashboard">Nazad</a>
    </div>
  `);
});

router.post("/search", (req, res) => {
  const { term } = req.body;
  const query = `SELECT id, username, email FROM users WHERE username LIKE '%${term}%'`;

  db.query(query, (err, results) => {
    if (err) {
      return res.send(`
    <head>
      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <div class="container">
      <h3>Greška prilikom pretrage:</h3>
      <div class="message">${err.message}</div>
      <h3>Pretraži po imenu</h3>
      <form method="POST" action="/search">
        <input name="term" placeholder="Pretraga po imenu" required value="${term}"/>
        <button>Traži</button>
      </form>
      <a href="/dashboard">Nazad</a>
    </div>
  `);
    }

    let content = "";

    if (results.length === 0) {
      content = `<p>Nema rezultata za unetu vrednost.</p>`;
    } else {
      const rows = results
        .map(
          (u) =>
            `<tr><td>${u.id}</td><td>${u.username}</td><td>${u.email}</td></tr>`
        )
        .join("");

      content = `
        <h3>Rezultati:</h3>
        <table>
          <tr><th>ID</th><th>Korisničko ime</th><th>Email</th></tr>
          ${rows}
        </table>
      `;
    }

    res.send(`
      <head>
        <link rel="stylesheet" type="text/css" href="/style.css">
      </head>
      <div class="container">
      <h3>Pretraži po imenu</h3>
        <form method="POST" action="/search">
          <input name="term" placeholder="Pretraga po imenu" required value="${term}"/>
          <button>Traži</button>
        </form>
        ${content}
        <a href="/dashboard">Nazad</a>
      </div>
    `);
  });
});

module.exports = router;
