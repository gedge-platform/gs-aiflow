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
    node_uuid VARCHAR(100) NOT NULL PRIMARY KEY,
    node_id VARCHAR(30) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    node_type INT NOT NULL,
    yaml TEXT NOT NULL,
    create_date TIMESTAMP,
    precondition_list TEXT NOT NULL,
    data TEXT DEFAULT '{}',
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

INSERT INTO TB_NODE (node_uuid, node_id, project_id, node_type, yaml, precondition_list, data)
VALUES ('user_1_softonnet-test_aiflow-test1', 'aiflow-test1', "softonnet-test", 0, "{'apiVersion': 'v1', 'kind': 'Pod', 'metadata': {'name': 'aiflow-test1', 'namespace': 'softonnet-test', 'labels': {'app': 'nfs-test'}}, 'spec': {'restartPolicy': 'Never','nodeName': 'gedgeworker1', 'containers': [{'name': 'ubuntu', 'image': 'yolov5:v0.0.230503', 'imagePullPolicy': 'IfNotPresent', 'command': ['/bin/bash', '-c'], 'args': ['source /root/path.sh; PATH=/opt/conda/envs/pt1.12.1_py38/bin:/root/volume/cuda/cuda-11.3/bin:$PATH; env; cd /root/yolov5; python train.py --data ~/volume/dataset/coco128/coco128.yaml --device 0 --weights ./weights/yolov5s-v7.0.pt --epochs 1 --batch 1'], 'env': [{'name': 'NEW_PATH', 'value': '/opt/conda/envs/pt1.12.1_py38/bin:/root/volume/cuda/cuda-11.3/bin'}, {'name': 'LD_LIBRARY_PATH', 'value': '/root/volume/cuda/cuda-11.3/lib64:/root/volume/cudnn/cuda-cudnn-8.3/lib64:/root/volume/tensorrt/TensorRT-8.4.3.1-cuda-11/lib'}], 'resources': {'limits': {'cpu': '4', 'memory': '8G', 'nvidia.com/gpu': '1'}}, 'volumeMounts': [{'mountPath': '/root/path.sh', 'name': 'fileconfig', 'subPath': 'path.sh'}, {'mountPath': '/root/volume/cuda/cuda-11.3', 'name': 'nfs-volume-total', 'subPath': 'cuda/cuda-11.3', 'readOnly': True}, {'mountPath': '/root/volume/cudnn/cuda-cudnn-8.3', 'name': 'nfs-volume-total', 'subPath': 'cudnn/cuda-cudnn-8.3', 'readOnly': True}, {'mountPath': '/opt/conda/envs/pt1.12.1_py38', 'name': 'nfs-volume-total', 'subPath': 'envs/pt1.12.1_py38', 'readOnly': True}, {'mountPath': '/root/volume/tensorrt/TensorRT-8.4.3.1-cuda-11/', 'name': 'nfs-volume-total', 'subPath': 'tensorrt/TensorRT-8.4.3.1-cuda-11', 'readOnly': True}, {'mountPath': '/root/volume/dataset/coco128', 'name': 'nfs-volume-total', 'subPath': 'dataset/coco128', 'readOnly': True}]}], 'volumes': [{'name': 'nfs-volume-total', 'persistentVolumeClaim': {'claimName': 'nfs-pvc-total'}}, {'name': 'fileconfig', 'configMap': {'name': 'cfmap-yolov5-scenario', 'defaultMode': 511}}]}}", '[]', "{'label': 'aiflow-test1', 'task': 'Train', 'runtime': 'pt121_py38', 'tensorRT': 'tensorRT8.2.5.1', 'cuda': 'cuda11.2-cudnn8.2.1', 'type': 'Pod'}"),
('user_1_softonnet-test_aiflow-test2', 'aiflow-test2', "softonnet-test", 0, "{'apiVersion': 'v1','kind': 'Pod','metadata': {'name': 'aiflow-test2'},'spec': {'restartPolicy': 'Never','containers': [{'name': 'aiflow-test2','image': 'aiflow/test1:v1.0.1.230329',}]}}", "['aiflow-test1']", "{'label': 'aiflow-test2', 'task': 'Validate', 'runtime': 'pt121_py38', 'tensorRT': 'tensorRT8.2.5.1', 'cuda': 'cuda11.2-cudnn8.2.1', 'type': 'Pod'}"),
('user_1_softonnet-test_aiflow-test3', 'aiflow-test3', "softonnet-test", 0, "{'apiVersion': 'v1','kind': 'Pod','metadata': {'name': 'aiflow-test3'},'spec': {'restartPolicy': 'Never','containers': [{'name': 'aiflow-test3','image': 'aiflow/test1:v1.0.1.230329',}]}}", "['aiflow-test2']", "{'label': 'aiflow-test3', 'task': 'Optimization', 'runtime': 'pt121_py38', 'tensorRT': 'tensorRT8.2.5.1', 'cuda': 'cuda11.2-cudnn8.2.1', 'type': 'Pod'}"),
('user_1_softonnet-test_aiflow-test4', 'aiflow-test4', "softonnet-test", 0, "{'apiVersion': 'v1','kind': 'Pod','metadata': {'name': 'aiflow-test4'},'spec': {'restartPolicy': 'Never','containers': [{'name': 'aiflow-test4','image': 'aiflow/test1:v1.0.1.230329',}]}}", "['aiflow-test3']", "{'label': 'aiflow-test4', 'task': 'Opt_Validate', 'runtime': 'pt121_py38', 'tensorRT': 'tensorRT8.2.5.1', 'cuda': 'cuda11.2-cudnn8.2.1', 'type': 'Pod'}");

INSERT INTO TB_RUNTIME (runtime_name, framework, version, python_version, path)
 VALUES ('pt121_py38', 'PyTorch', '1.2.1', '3.8', '.');

INSERT INTO TB_CUDA (cuda_name, cuda_version, cudnn_version, path)
 VALUES ('cuda11.2-cudnn8.2.1', '11.2', '8.2.1', '.');

 INSERT INTO TB_TENSORRT (tensorrt_name, tensorrt_version, path)
 VALUES ('tensorRT8.2.5.1', '8.2.5.1', '.');
