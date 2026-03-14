CREATE DATABASE IF NOT EXISTS zrsdb;
USE zrsdb;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100)
);

INSERT INTO users (username, email, password)
SELECT * FROM (SELECT 'admin', 'admin@example.com', 'adminpass') AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'admin'
);

INSERT INTO users (username, email, password)
SELECT * FROM (SELECT 'user', 'user@example.com', 'userpass') AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'user'
);

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
