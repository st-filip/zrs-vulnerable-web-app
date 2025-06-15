const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/login-form", (req, res) => {
  const message = req.query.msg || "";
  res.send(`
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <div class="container">
      ${message ? `<div class="message">${message}</div>` : ""}
      <h2>Login</h2>
      <form method="POST" action="/login">
        <input name="username" placeholder="Korisničko ime" required/><br/>
        <input name="password" placeholder="Lozinka" type="password" required/><br/>
        <button type="submit">Login</button>
      </form>
      <p><a href="/register-form">Nemate nalog? Registrujte se</a></p>
    </div>
  `);
});

router.get("/register-form", (req, res) => {
  const message = req.query.msg || "";
  res.send(`
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <div class="container">
      ${message ? `<div class="message">${message}</div>` : ""}
      <h2>Registracija</h2>
      <form method="POST" action="/register">
        <input name="username" placeholder="Korisničko ime" required/><br/>
        <input name="email" placeholder="Email" type="email" required/><br/>
        <input name="password" placeholder="Lozinka" type="password" required/><br/>
        <button type="submit">Registruj se</button>
      </form>
      <p><a href="/login-form">Već imate nalog? Ulogujte se</a></p>
    </div>
  `);
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.query(query, (err, results) => {
    if (err)
      return res.redirect(
        "login-form/?msg=" + encodeURIComponent("SQL greška: " + err.message)
      );
    if (results.length > 0) {
      req.session.user = results[0];
      return res.redirect("/dashboard");
    }
    return res.redirect(
      "/login-form?msg=" + encodeURIComponent("Pogrešni kredencijali")
    );
  });
});

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  const checkQuery = `SELECT * FROM users WHERE username = '${username}'`;
  db.query(checkQuery, (err, results) => {
    if (err)
      return res.redirect(
        "/register-form?msg=" + encodeURIComponent("SQL greška: " + err.message)
      );
    if (results.length > 0)
      return res.redirect(
        "/register-form?msg=" + encodeURIComponent("Korisničko ime je zauzeto.")
      );
    const insertQuery = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
    db.query(insertQuery, (err) => {
      if (err)
        return res.redirect(
          "/register-form?msg=" +
            encodeURIComponent("Greška pri registraciji: " + err.message)
        );
      return res.redirect(
        "/register-form?msg=" +
          encodeURIComponent("Registracija uspešna. Možete se prijaviti.")
      );
    });
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login-form"));
});

module.exports = router;
