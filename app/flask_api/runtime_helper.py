import flask_api.global_def
from flask_api.database import get_db_connection

def getRuntimePathAndImage(runtime, model):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    c = cursor.execute(
        f'select path, image_name, cuda_path, cudnn_path from TB_RUNTIME INNER JOIN TB_CUDA ON TB_CUDA.cudnn_version = TB_RUNTIME.cudnn_version and TB_CUDA.cuda_version = TB_RUNTIME.cuda_version where runtime_name = "{runtime}" and model = "{model}"')
    rows = cursor.fetchall()
    if rows is not None:
        if len(rows) != 0:
            return rows[0]['path'], rows[0]['image_name'], rows[0]['cuda_path'], rows[0]['cudnn_path']


def getTensorRTPath(runtime, tensorRT):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    c = cursor.execute(
        f'select tensorrt_path from TB_TENSORRT where runtime_name = "{runtime}" and tensorrt_name = "{tensorRT}"')
    rows = cursor.fetchall()
    if rows is not None:
        if len(rows) != 0:
            return rows[0]['tensorrt_path']

def getBasicYaml(userLoginID, userName, projectName, projectID, nodeID, runtime, model, tensorRT, framework, inputPath, outputPath):
    runtimePath, imageName, cudaPath, cudnnPath = getRuntimePathAndImage(runtime, model)
    tensorRTPath = getTensorRTPath(runtime, tensorRT)

    data = {'apiVersion': 'v1', 'kind': 'Pod',
            'metadata': {'name': nodeID, 'labels': {'app': 'nfs-test'}},
            'spec': {'restartPolicy': 'Never', 'containers': [
                {'name': 'ubuntu', 'image': imageName, 'imagePullPolicy': 'IfNotPresent',
                 'command': ['/bin/bash', '-c'], 'args': [
                    'source /root/path.sh; PATH=/opt/conda/envs/' + runtimePath + '/bin:/root/volume/cuda/' + cudaPath + '/bin:$PATH; env; mkdir -p /root/user/logs; cd /root/yolov5; '],
                 'env': [{'name': 'LD_LIBRARY_PATH',
                          'value': '/root/volume/cuda/' + cudaPath + '/lib64:/root/volume/cudnn/' + cudnnPath + '/lib64:/root/volume/tensorrt/' + tensorRTPath + '/lib'}],
                 'resources': {'limits': {'cpu': '4', 'memory': '8G', 'nvidia.com/gpu': '1'}}, 'volumeMounts': [
                    {'mountPath': '/root/volume/cuda/' + cudaPath, 'name': 'nfs-volume-total',
                     'subPath': 'cuda/' + cudaPath,
                     'readOnly': True}, {'mountPath': '/root/volume/cudnn/' + cudnnPath, 'name': 'nfs-volume-total',
                                         'subPath': 'cudnn/' + cudnnPath, 'readOnly': True},
                    {'mountPath': '/opt/conda/envs/' + runtimePath , 'name': 'nfs-volume-total',
                     'subPath': 'envs/' + runtimePath,
                     'readOnly': True},
                    {'mountPath': '/root/volume/tensorrt/' + tensorRTPath + '/', 'name': 'nfs-volume-total',
                     'subPath': 'tensorrt/' + tensorRTPath, 'readOnly': True},
                    {'mountPath': '/root/volume/dataset/coco128', 'name': 'nfs-volume-total',
                     'subPath': 'dataset/coco128',
                     'readOnly': True},
                    {'mountPath': '/root/user', 'name': 'nfs-volume-total',
                     'subPath': 'users/' + userLoginID + "/" + projectName}]}],
                     'volumes': [
                         {'name': 'nfs-volume-total', 'persistentVolumeClaim': {'claimName': getBasicPVCName(userLoginID, projectName)}}]}}
    return data


def getBasicPVName(userLoginID, projectName):
    return "pv." + flask_api.global_def.config.api_id + "." + userLoginID + "." + projectName


def getBasicPVCName(userLoginID, projectName):
    return "pvc." + flask_api.global_def.config.api_id + "." + userLoginID + "." + projectName


def getBasicPVYaml(userLoginID, projectName):
    data = {
        "apiVersion": "v1",
        "kind": "PersistentVolume",
        "metadata": {
            "name": getBasicPVName(userLoginID, projectName),
            "labels": {
                "app": "nfs-test"
            }
        },
        "spec": {
            "capacity": {
                "storage": "10Gi"
            },
            "volumeMode": "Filesystem",
            "accessModes": [
                "ReadOnlyMany"
            ],
            "persistentVolumeReclaimPolicy": "Delete",
            "storageClassName": "",
            "nfs": {
                "path": flask_api.global_def.config.nfs_path,
                "server": flask_api.global_def.config.nfs_server
            }
        }
    }
    return data


def getBasicPVCYaml(userLoginID, projectName):
    data = {
        "apiVersion": "v1",
        "kind": "PersistentVolumeClaim",
        "metadata": {
            "name": getBasicPVCName(userLoginID, projectName),
        },
        "spec": {
            "accessModes": [
                "ReadOnlyMany"
            ],
            "volumeMode": "Filesystem",
            "storageClassName": "",
            "resources": {
                "requests": {
                    "storage": "10Gi"
                }
            },
            "volumeName": getBasicPVName(userLoginID, projectName),
            "selector": {
                "matchLabels": {
                    "app": "nfs-test"
                }
            }
        }
    }

    return data


def makeYamlTrainRuntime(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, inputPath, outputPath):
    data = getBasicYaml(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, inputPath, outputPath)
    data['spec']['containers'][0]['args'][0] += 'nohup python train.py --project /root/user --name yolo_coco128_train --data ~/volume/dataset/coco128/coco128.yaml --device 0 --weights ./weights/yolov5s-v7.0.pt --epochs 1 --batch 1  &>> /root/user/logs/' + node_id + '.log'
    return data

def makeYamlValidateRuntime(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, inputPath, outputPath):
    data = getBasicYaml(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, inputPath, outputPath)
    data['spec']['containers'][0]['args'][0] += 'nohup python val.py --project /root/user --name yolo_coco128_validate --data ~/volume/dataset/coco128/coco128.yaml --device 0 --weights /root/user/yolo_coco128_train/weights/best.pt --batch-size 1 &>> /root/user/logs/' + node_id + '.log'

    return data
def makeYamlOptimizationRuntime(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, inputPath, outputPath):
    data = getBasicYaml(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, inputPath, outputPath)
    data['spec']['containers'][0]['args'][0] += 'nohup python export.py --weights /root/user/yolo_coco128_train/weights/best.pt --include engine --device 0 --half --batch-size 1 --imgsz 640 --verbose &>> /root/user/logs/' + node_id + '.log'

    return data

def makeYamlOptValidateRuntime(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, inputPath, outputPath):
    data = getBasicYaml(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, inputPath, outputPath)
    data['spec']['containers'][0]['args'][0] += 'nohup python val.py --project /root/user --name yolo_coco128_opt_validate --weights /root/user/yolo_coco128_train/weights/best.engine --data ~/volume/dataset/coco128/coco128.yaml --device 0 --batch-size 1 --imgsz 640 &>> /root/user/logs/' + node_id + '.log'

    return data


def getProjectYaml(userLoginID, projectName):
    yaml = {'PV': {}, 'PVC': {}}
    yaml['PV'] = getBasicPVYaml(userLoginID, projectName)
    yaml['PVC'] = getBasicPVCYaml(userLoginID, projectName)

    return yaml
