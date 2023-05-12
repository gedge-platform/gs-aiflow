import flask_api.global_def
from flask_api.database import get_db_connection


def getBasicYaml(userID, projectName, projectID, nodeID):
    data = {'apiVersion': 'v1', 'kind': 'Pod',
            'metadata': {'name': nodeID, 'labels': {'app': 'nfs-test'}},
            'spec': {'restartPolicy': 'Never', 'containers': [
                {'name': 'ubuntu', 'image': 'yolov5:v0.0.230511', 'imagePullPolicy': 'IfNotPresent',
                 'command': ['/bin/bash', '-c'], 'args': [
                    'source /root/path.sh; PATH=/opt/conda/envs/pt1.12.1_py38/bin:/root/volume/cuda/cuda-11.3/bin:$PATH; env; mkdir -p /root/user/logs; cd /root/yolov5; nohup python train.py --project /root/user --name yolo_coco128_train --data ~/volume/dataset/coco128/coco128.yaml --device 0 --weights ./weights/yolov5s-v7.0.pt --epochs 1 --batch 1  &>> /root/user/logs/' + nodeID + '.log'],
                 'env': [{'name': 'LD_LIBRARY_PATH',
                          'value': '/root/volume/cuda/cuda-11.3/lib64:/root/volume/cudnn/cuda-cudnn-8.3/lib64:/root/volume/tensorrt/TensorRT-8.4.3.1-cuda-11/lib'}],
                 'resources': {'limits': {'cpu': '4', 'memory': '8G', 'nvidia.com/gpu': '1'}}, 'volumeMounts': [
                    {'mountPath': '/root/volume/cuda/cuda-11.3', 'name': 'nfs-volume-total',
                     'subPath': 'cuda/cuda-11.3',
                     'readOnly': True}, {'mountPath': '/root/volume/cudnn/cuda-cudnn-8.3', 'name': 'nfs-volume-total',
                                         'subPath': 'cudnn/cuda-cudnn-8.3', 'readOnly': True},
                    {'mountPath': '/opt/conda/envs/pt1.12.1_py38', 'name': 'nfs-volume-total',
                     'subPath': 'envs/pt1.12.1_py38',
                     'readOnly': True},
                    {'mountPath': '/root/volume/tensorrt/TensorRT-8.4.3.1-cuda-11/', 'name': 'nfs-volume-total',
                     'subPath': 'tensorrt/TensorRT-8.4.3.1-cuda-11', 'readOnly': True},
                    {'mountPath': '/root/volume/dataset/coco128', 'name': 'nfs-volume-total',
                     'subPath': 'dataset/coco128',
                     'readOnly': True},
                    {'mountPath': '/root/user', 'name': 'nfs-volume-total',
                     'subPath': 'user_data/' + userID + "/" + projectName}]}],
                     'volumes': [
                         {'name': 'nfs-volume-total', 'persistentVolumeClaim': {'claimName': getBasicPVCName(userID, projectID)}}]}}
    return data


def getBasicPVName(userID, projectID):
    return "pv." + projectID


def getBasicPVCName(userID, projectID):
    return "pvc." + projectID


def getBasicPVYaml(userID, projectID):
    data = {
        "apiVersion": "v1",
        "kind": "PersistentVolume",
        "metadata": {
            "name": getBasicPVName(userID, projectID),
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


def getBasicPVCYaml(userID, projectID):
    data = {
        "apiVersion": "v1",
        "kind": "PersistentVolumeClaim",
        "metadata": {
            "name": getBasicPVCName(userID, projectID),
            "namespace": projectID
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
            "volumeName": getBasicPVName(userID, projectID),
            "selector": {
                "matchLabels": {
                    "app": "nfs-test"
                }
            }
        }
    }

    return data


def makeYamlTrainRuntime(userID, projectName, projectID, node_id, runtime, model, tensorRT, framework):
    data = getBasicYaml(userID, projectName, projectID, node_id)

    return data

def makeYamlValidateRuntime(userID, projectName, projectID, node_id, runtime, model, tensorRT, framework):
    data = getBasicYaml(userID, projectName, projectID, node_id)
    data['spec']['containers'][0]['args'] = ['source /root/path.sh; PATH=/opt/conda/envs/pt1.12.1_py38/bin:/root/volume/cuda/cuda-11.3/bin:$PATH; env; mkdir -p /root/user/logs; cd /root/yolov5; nohup python val.py --project /root/user --name yolo_coco128_validate --data ~/volume/dataset/coco128/coco128.yaml --device 0 --weights /root/user/yolo_coco128_train/weights/best.pt --batch-size 1 &>> /root/user/logs/' + node_id + '.log']

    return data
def makeYamlOptimizationRuntime(userID, projectName, projectID, node_id, runtime, model, tensorRT, framework):
    data = getBasicYaml(userID, projectName, projectID, node_id)
    data['spec']['containers'][0]['args'] = ['source /root/path.sh; PATH=/opt/conda/envs/pt1.12.1_py38/bin:/root/volume/cuda/cuda-11.3/bin:$PATH; env; mkdir -p /root/user/logs; cd /root/yolov5; nohup python export.py --weights /root/user/yolo_coco128_train/weights/best.pt --include engine --device 0 --half --batch-size 1 --imgsz 640 --verbose &>> /root/user/logs/' + node_id + '.log']

    return data

def makeYamlOptValidateRuntime(userID, projectName, projectID, node_id, runtime, model, tensorRT, framework):
    data = getBasicYaml(userID, projectName, projectID, node_id)
    data['spec']['containers'][0]['args'] = ['source /root/path.sh; PATH=/opt/conda/envs/pt1.12.1_py38/bin:/root/volume/cuda/cuda-11.3/bin:$PATH; env; mkdir -p /root/user/logs; cd /root/yolov5; nohup python val.py --project /root/user --name yolo_coco128_opt_validate --weights /root/user/yolo_coco128_train/weights/best.engine --data ~/volume/dataset/coco128/coco128.yaml --device 0 --batch-size 1 --imgsz 640 &>> /root/user/logs/' + node_id + '.log']

    return data


def getProjectYaml(userID, projectID):
    yaml = {'PV': {}, 'PVC': {}}
    yaml['PV'] = getBasicPVYaml(userID, projectID)
    yaml['PVC'] = getBasicPVCYaml(userID, projectID)

    return yaml
