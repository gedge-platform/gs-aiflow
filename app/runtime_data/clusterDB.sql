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
  user_id VARCHAR(36) NOT NULL PRIMARY KEY,
  login_id VARCHAR(30) NOT NULL UNIQUE,
  login_pass VARCHAR(30),
  user_name VARCHAR(30),
  workspace_name VARCHAR(30),
  is_admin BOOL NOT NULL DEFAULT 0,
  last_access_time TIMESTAMP
  )
  CHARACTER SET 'utf8';

CREATE TABLE IF NOT EXISTS TB_PROJECT (
    project_id VARCHAR(30) NOT NULL PRIMARY KEY,
    project_name VARCHAR(30) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    pv_name VARCHAR(30) NOT NULL,
    INDEX FK_TB_PROJECT_TB_USER (user_id), CONSTRAINT FK_TB_PROJECT_TB_USER FOREIGN KEY (user_id) REFERENCES TB_USER (user_id) ON DELETE CASCADE
)CHARACTER SET 'utf8';

CREATE TABLE IF NOT EXISTS TB_NODE (
    node_uuid VARCHAR(30) NOT NULL PRIMARY KEY,
    node_id VARCHAR(30) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    node_type INT NOT NULL,
    yaml TEXT NOT NULL,
    create_date TIMESTAMP,
    precondition_list TEXT NOT NULL,
    INDEX FK_TB_NODE_TB_PROJECT (project_id), CONSTRAINT FK_TB_NODE_TB_PROJECT FOREIGN KEY (project_id) REFERENCES TB_PROJECT (project_id) ON DELETE CASCADE
)CHARACTER SET 'utf8';

CREATE TABLE IF NOT EXISTS TB_RUNTIME (
    runtime_name VARCHAR(30) NOT NULL PRIMARY KEY,
    framework VARCHAR(30) NOT NULL,
    version VARCHAR(30) NOT NULL,
    python_version VARCHAR(30) NOT NULL,
    path VARCHAR(30) NOT NULL
)CHARACTER SET 'utf8';

CREATE TABLE IF NOT EXISTS TB_CUDA (
    cuda_name VARCHAR(30) NOT NULL PRIMARY KEY,
    cuda_version VARCHAR(30) NOT NULL,
    cudnn_version VARCHAR(30) NOT NULL,
    path VARCHAR(30) NOT NULL
)CHARACTER SET 'utf8';

CREATE TABLE IF NOT EXISTS TB_TENSORRT (
    tensorrt_name VARCHAR(30) NOT NULL PRIMARY KEY,
    tensorrt_version VARCHAR(30) NOT NULL,
    path VARCHAR(30) NOT NULL
)CHARACTER SET 'utf8';

INSERT INTO TB_USER (user_id, login_id, login_pass, user_name, workspace_name , is_admin)
 SELECT * FROM (select 'user_1', 'admin', 'softonnet', '기본관리자', 1) AS admin
 WHERE NOT EXISTS (SELECT user_id FROM TB_USER) LIMIT 1;

INSERT INTO TB_PROJECT (project_id, project_name, user_id, pv_name)
 VALUES ('1_pj1', 'pj1', 'user_1', "testPV"),
 ('1_pj2', 'pj2', 'user_1', "testPV"),
 ('softonnet-test', 'softonnet-test', 'user_1', "testPV");

INSERT INTO TB_NODE (node_uuid, node_id, project_id, node_type, yaml, precondition_list)
VALUES ('node_1', 'aiflow-test1', "softonnet-test", 0, "{'apiVersion': 'v1','kind': 'Pod','metadata': {'name': 'aiflow-test1'},'spec': {'restartPolicy': 'Never','containers': [{'name': 'aiflow-test1','image': 'aiflow/test1:v1.0.1.230329',}]}}'),", '[]'),
('node_2', 'aiflow-test2', "softonnet-test", 0, "{'apiVersion': 'v1','kind': 'Pod','metadata': {'name': 'aiflow-test2'},'spec': {'restartPolicy': 'Never','containers': [{'name': 'aiflow-test2','image': 'aiflow/test1:v1.0.1.230329',}]}}'),", "['aiflow-test1']"),
('node_3', 'aiflow-test3', "softonnet-test", 0, "{'apiVersion': 'v1','kind': 'Pod','metadata': {'name': 'aiflow-test3'},'spec': {'restartPolicy': 'Never','containers': [{'name': 'aiflow-test3','image': 'aiflow/test1:v1.0.1.230329',}]}}'),", "['aiflow-test2']"),
('node_4', 'aiflow-test4', "softonnet-test", 0, "{'apiVersion': 'v1','kind': 'Pod','metadata': {'name': 'aiflow-test4'},'spec': {'restartPolicy': 'Never','containers': [{'name': 'aiflow-test4','image': 'aiflow/test1:v1.0.1.230329',}]}}'),", "['aiflow-test3']"),
('node_5', 'aiflow-test5', "softonnet-test", 0, "{'apiVersion': 'v1','kind': 'Pod','metadata': {'name': 'aiflow-test5'},'spec': {'restartPolicy': 'Never','containers': [{'name': 'aiflow-test5','image': 'aiflow/test1:v1.0.1.230329',}]}}'),", "['aiflow-test4']");

INSERT INTO TB_RUNTIME (runtime_name, framework, version, python_version, path)
 VALUES ('pt121_py38', 'PyTorch', '1.2.1', '3.8', '.');

INSERT INTO TB_CUDA (cuda_name, cuda_version, cudnn_version, path)
 VALUES ('cuda11.2-cudnn8.2.1', '11.2', '8.2.1', '.');

 INSERT INTO TB_TENSORRT (tensorrt_name, tensorrt_version, path)
 VALUES ('tensorRT8.2.5.1', '8.2.5.1', '.');
