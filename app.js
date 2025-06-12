const express = require("express");
const mysql = require("mysql");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "tajna",
    resave: false,
    saveUninitialized: false,
  })
);

const db = mysql.createConnection({
  host: "db",
  user: "root",
  password: "root",
  database: "zrsdb",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Povezan sa MySQL bazom");
});

let komentari = [];

// Login / Register forma
app.get("/", (req, res) => {
  const message = req.query.msg || "";
  res.send(`
    <head>
      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <div class="container">
  ${message ? `<div class="message">${message}</div>` : ""}

  <div id="login-form" class="form-section active">
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input name="username" placeholder="Korisničko ime" required/><br/>
      <input name="password" placeholder="Lozinka" type="password" required/><br/>
      <button type="submit">Login</button>
    </form>
    <p><a href="#" onclick="showForm('register')">Nemate nalog? Registrujte se</a></p>
  </div>

  <div id="register-form" class="form-section">
    <h2>Registracija</h2>
    <form method="POST" action="/register">
      <input name="username" placeholder="Korisničko ime" required/><br/>
      <input name="email" placeholder="Email" type="email" required/><br/>
      <input name="password" placeholder="Lozinka" type="password" required/><br/>
      <button type="submit">Registruj se</button>
    </form>
    <p><a href="#" onclick="showForm('login')">Već imate nalog? Ulogujte se</a></p>
  </div>
</div>

<script>
  function showForm(form) {
    document.getElementById("login-form").classList.remove("active");
    document.getElementById("register-form").classList.remove("active");
    document.getElementById(form + "-form").classList.add("active");
  }
</script>
  `);
});

// Login logika (SQLi, Brute Force)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.query(query, (err, results) => {
    if (err) {
      return res.redirect(
        "/?msg=" + encodeURIComponent("SQL greška: " + err.message)
      );
    }

    if (results?.length > 0) {
      req.session.user = results[0];
      return res.redirect("/dashboard");
    }

    return res.redirect("/?msg=" + encodeURIComponent("Pogrešni kredencijali"));
  });
});

// Register logika
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  const checkQuery = `SELECT * FROM users WHERE username = '${username}'`;
  db.query(checkQuery, (err, results) => {
    if (err) {
      return res.redirect(
        "/?msg=" + encodeURIComponent("SQL greška: " + err.message)
      );
    }

    if (results.length > 0) {
      return res.redirect(
        "/?msg=" + encodeURIComponent("Korisničko ime je zauzeto.")
      );
    }

    const insertQuery = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
    db.query(insertQuery, (err) => {
      if (err) {
        return res.redirect(
          "/?msg=" +
            encodeURIComponent("Greška pri registraciji: " + err.message)
        );
      }

      return res.redirect(
        "/?msg=" +
          encodeURIComponent("Registracija uspešna. Možete se prijaviti.")
      );
    });
  });
});

// Dashboard sa funkcijama
app.get("/dashboard", (req, res) => {
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
        <a href="/logout">🚪 Logout</a>
      </div>
    </div>
  `);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// Pretraga po imenu (SQLi)
app.get("/search-form", (req, res) => {
  res.send(`
    <head>
      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <div class="container">
      <form method="POST" action="/search">
        <input name="term" placeholder="Pretraga po imenu" required/>
        <button>Traži</button>
      </form>
      <a href="/dashboard">Nazad</a>
    </div>
  `);
});

app.post("/search", (req, res) => {
  const { term } = req.body;
  const query = `SELECT * FROM users WHERE username LIKE '%${term}%'`;

  db.query(query, (err, results) => {
    if (err) {
      return res.send(`
    <head>
      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <div class="container">
      <h3>Greška prilikom pretrage:</h3>
      <div class="message">${err.message}</div>
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

// Komentari (XSS)
app.get("/comments-form", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const query = `
    SELECT users.username, comments.content
    FROM comments
    JOIN users ON comments.user_id = users.id
    ORDER BY comments.created_at DESC
  `;

  const message = req.query.msg || "";

  db.query(query, (err, results) => {
    if (err) {
      return res.send(`
    <head>
      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <div class="container">
      <h3>Greška prilikom učitavanja komentara:</h3>
      <div class="message">${err.message}</div>
      <a href="/dashboard">Nazad</a>
    </div>
  `);
    }

    const commentHtml = results
      .map((c) => `<li><strong>${c.username}</strong>: ${c.content}</li>`)
      .join("");

    res.send(`
      <head>
        <link rel="stylesheet" type="text/css" href="/style.css">
      </head>
      <div class="container">
      ${message ? `<div class="message">${message}</div>` : ""}
        <h3>Unesi komentar</h3>
        <form method="POST" action="/comments">
          <textarea name="comment" required></textarea><br/>
          <button>Pošalji</button>
        </form>
        <h3>Svi komentari:</h3>
        <ul class="comment-list">${commentHtml}</ul>
        <a href="/dashboard">Nazad</a>
      </div>
    `);
  });
});

app.post("/comments", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  const { comment } = req.body;
  const userId = req.session.user.id;

  const query = "INSERT INTO comments (user_id, content) VALUES (?, ?)";
  db.query(query, [userId, comment], (err) => {
    if (err) {
      return res.redirect(
        "/comments-form?msg=" +
          encodeURIComponent("Greška prilikom slanja komentara: " + err.message)
      );
    }

    res.redirect("/comments-form");
  });
});

// Promena lozinke (CSRF)
app.get("/change-password-form", (req, res) => {
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

app.post("/change-password", (req, res) => {
  const { newPassword } = req.body;
  const userId = req.session.user.id;

  const query = `UPDATE users SET password = '${newPassword}' WHERE id = ${userId}`;
  db.query(query, (err) => {
    if (err) {
      return res.redirect(
        "/change-password-form?msg=" +
          encodeURIComponent("Greška: " + err.message)
      );
    }
    res.redirect(
      "/change-password-form?msg=" +
        encodeURIComponent("Lozinka je uspešno promenjena.")
    );
  });
});

const { exec } = require("child_process");

// Forma za unos IP adrese (ping)
app.get("/ping-form", (req, res) => {
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

// Ruta za izvršavanje ping komande
app.post("/ping", (req, res) => {
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

app.listen(3000, () => console.log("Server pokrenut na http://localhost:3000"));
