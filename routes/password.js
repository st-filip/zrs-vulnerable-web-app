const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/change-password-form", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const message = req.query.msg || "";

  res.send(`
    <head>
      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <div class="container">
      <h3>Promeni lozinku</h3>
      ${message ? `<div class="message">${message}</div>` : ""}
      <form method="POST" action="/change-password">
        <input name="newPassword" placeholder="Nova lozinka" type="password" required/><br/>
        <button>Promeni</button>
      </form>
      <a href="/dashboard">Nazad</a>
    </div>
  `);
});

router.post("/change-password", (req, res) => {
  const { newPassword } = req.body;
  const userId = req.session.user.id;
  const query = `UPDATE users SET password = '${newPassword}' WHERE id = ${userId}`;
  db.query(query, (err) => {
    if (err)
      return res.redirect(
        "/change-password-form?msg=" +
          encodeURIComponent("Greška: " + err.message)
      );
    res.redirect(
      "/change-password-form?msg=" +
        encodeURIComponent("Lozinka uspešno promenjena.")
    );
  });
});

module.exports = router;
