const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/comments-form", (req, res) => {
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

router.post("/comments", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  const { comment } = req.body;
  const query = `INSERT INTO comments (user_id, content) VALUES (?, ?)`;
  db.query(query, [req.session.user.id, comment], (err) => {
    if (err)
      return res.redirect(
        "/comments-form?msg=" + encodeURIComponent("Greška: " + err.message)
      );
    res.redirect("/comments-form");
  });
});

module.exports = router;
