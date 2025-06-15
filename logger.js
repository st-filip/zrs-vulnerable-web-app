const fs = require("fs");
const path = require("path");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

module.exports = (req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} ${
    req.originalUrl
  }\n`;
  accessLogStream.write(log);
  next();
};
