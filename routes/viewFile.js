const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.get("/view-file", (req, res) => {
  const fileParam = req.query.file;
  let fileContent = "";

  if (fileParam) {
    try {
      const resolvedPath = path.resolve(fileParam);
      fileContent = fs.readFileSync(resolvedPath, "utf8");
    } catch (err) {
      fileContent = "Greška pri čitanju fajla: " + err.message;
    }
  }

  res.send(`
    <head>
      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <div class="container">
      <h3>Local File Inclusion (LFI) demonstracija</h3>
      <p>Ova stranica omogućava da uneseš lokalnu putanju fajla koji će biti pročitan sa servera.</p>
      <form method="GET" action="/view-file">
        <input name="file" placeholder="Primer: ./access.log" value="${
          fileParam || ""
        }" required />
        <button type="submit">Učitaj fajl</button>
      </form>

      ${
        fileParam
          ? `
            <h4>Sadržaj fajla: <code>${fileParam}</code></h4>
            <div class="scroll-box">${fileContent}</div>
          `
          : ""
      }

      <a href="/dashboard">Nazad</a>
    </div>
  `);
});

module.exports = router;
