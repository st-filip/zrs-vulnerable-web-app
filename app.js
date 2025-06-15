const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();

// Middleware
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

app.get("/", (req, res) => {
  res.redirect("/login-form");
});

// Logovanje
const logger = require("./logger");
app.use(logger);

// Rute
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/dashboard"));
app.use("/", require("./routes/search"));
app.use("/", require("./routes/comments"));
app.use("/", require("./routes/password"));
app.use("/", require("./routes/ping"));
app.use("/", require("./routes/viewFile"));

// Pokretanje servera
app.listen(3000, () => console.log("Server pokrenut na http://localhost:3000"));
