-- CREATE DATABASE IF NOT EXISTS smarteye CHARACTER SET utf8;

CREATE TABLE IF NOT EXISTS servertable (
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    cluster_name VARCHAR(30)
)CHARACTER SET 'utf8';

CREATE TABLE IF NOT EXISTS listcluster (
  id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  cluster_name VARCHAR(30) NOT NULL UNIQUE,
  cluster_ip VARCHAR(30),
  port INT,
  token VARCHAR(1200)
  )
  CHARACTER SET 'utf8';

CREATE TABLE IF NOT EXISTS runningserver (
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    cluster_name VARCHAR(30) NOT NULL,
    server_name VARCHAR(30) NOT NULL
)CHARACTER SET 'utf8';

CREATE TABLE IF NOT EXISTS TB_USER (
  user_id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  login_id VARCHAR(30) NOT NULL UNIQUE,
  login_pass VARCHAR(30),
  user_name VARCHAR(30),
  is_admin BOOL NOT NULL DEFAULT 0,
  last_access_time TIMESTAMP
  )
  CHARACTER SET 'utf8';

CREATE TABLE IF NOT EXISTS TB_PROJECT (
    project_name VARCHAR(30) NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    pv_name VARCHAR(30) NOT NULL,
    INDEX FK_TB_PROJECT_TB_USER (user_id),
    CONSTRAINT FK_TB_PROJECT_TB_USER FOREIGN KEY (user_id) REFERENCES TB_USER (user_id) ON DELETE CASCADE
)CHARACTER SET 'utf8';

INSERT INTO TB_USER (login_id, login_pass, user_name, is_admin)
 SELECT * FROM (select 'admin', 'softonnet', '기본관리자', 1) AS admin
 WHERE NOT EXISTS (SELECT user_id FROM TB_USER) LIMIT 1;

INSERT INTO TB_PROJECT (project_name, user_id, pv_name)
 VALUES ('pj1', 1, "testPV"),
 ('pj2', 1, "testPV");