const mysql = require("mysql");

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

module.exports = db;
