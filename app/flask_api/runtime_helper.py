import flask_api.global_def
from flask_api.database import get_db_connection
import os

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
                     'subPath': 'user/' + userLoginID + "/" + projectName}]}],
                     'volumes': [
                         {'name': 'nfs-volume-total', 'persistentVolumeClaim': {'claimName': getBasicPVCName(userLoginID, projectName)}}]}}
    return data


def getBasicPVName(userLoginID, projectName):
    return "pv-project-" + flask_api.global_def.config.api_id + "-" + userLoginID + "-" + projectName


def getBasicPVCName(userLoginID, projectName):
    return "pvc-project-" + flask_api.global_def.config.api_id + "-" + userLoginID + "-" + projectName


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


def makeYamlTrainRuntime(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, datasetPath, outputPath):
    data = getBasicYaml(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, datasetPath, outputPath)
    data['spec']['containers'][0]['args'][0] += 'rm -rf /root/user/' + outputPath + '; nohup python train.py --project /root/user --name ' + outputPath + ' --data  ' + datasetPath + '/dataset.yaml --device 0 --weights ./weights/yolov5s-v7.0.pt --epochs 1 --batch 1  &>> /root/user/logs/' + node_id + '.log'
    return data

def makeYamlValidateRuntime(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, datasetPath, modelPath, outputPath):
    data = getBasicYaml(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, datasetPath, outputPath)
    data['spec']['containers'][0]['args'][0] += 'rm -rf /root/user/' + outputPath + '; nohup python val.py --project /root/user --name ' + outputPath +  ' --data ' + datasetPath + '/dataset.yaml --device 0 --weights ' + modelPath + ' --batch-size 1 &>> /root/user/logs/' + node_id + '.log'

    return data
def makeYamlOptimizationRuntime(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, modelPath):
    data = getBasicYaml(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, modelPath, modelPath)
    data['spec']['containers'][0]['args'][0] += 'nohup python export.py --weights ' + modelPath + ' --include engine --device 0 --half --batch-size 1 --imgsz 640 --verbose &>> /root/user/logs/' + node_id + '.log'

    return data

def makeYamlOptValidateRuntime(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, datasetPath, modelPath, outputPath):
    data = getBasicYaml(userLoginID, userName, projectName, projectID, node_id, runtime, model, tensorRT, framework, datasetPath, outputPath)
    data['spec']['containers'][0]['args'][0] += 'rm -rf /root/user/' + outputPath + '; nohup python val.py --project /root/user --name ' + outputPath +  ' --weights ' + modelPath + ' --data ' + datasetPath + '/dataset.yaml --device 0 --batch-size 1 --imgsz 640 &>> /root/user/logs/' + node_id + '.log'

    return data


def getProjectYaml(userLoginID, projectName):
    yaml = {'PV': {}, 'PVC': {}}
    yaml['PV'] = getBasicPVYaml(userLoginID, projectName)
    yaml['PVC'] = getBasicPVCYaml(userLoginID, projectName)

    return yaml


def makeYamlInferenceRuntime(userLoginID, userName, projectName, projectID, nodeID, runtime, model, tensorRT, framework):
    runtimePath, imageName, cudaPath, cudnnPath = getRuntimePathAndImage(runtime, model)
    tensorRTPath = getTensorRTPath(runtime, tensorRT)

    appLabel = 'yolo-test'
    if(model == 'yolov5'):
        appLabel = 'yolo-test'
        imageName = 'softonnet/yolov5/inference_test:v0.0.1.230616'
    elif(model == 'RetinaFace'):
        appLabel = 'retina-test'
        imageName = 'softonnet/retinaface/inference_test:v0.0.1.230616'

    data = {'apiVersion': 'v1', 'kind': 'Pod',
            'metadata': {'name': nodeID, 'labels': {'app': appLabel}},
            'spec': {'restartPolicy': 'Never', 'containers': [
                {'name': 'ubuntu', 'image': imageName, 'imagePullPolicy': 'IfNotPresent',
                 'command': ['/bin/bash', '-c'], 'args': [
                    'source /root/path.sh; PATH=/opt/conda/envs/' + runtimePath + '/bin:/root/volume/cuda/' + cudaPath + '/bin:$PATH; env; sh /script.sh;tail -f /dev/null'],
                 'env': [{'name': 'LD_LIBRARY_PATH',
                          'value': '/root/volume/cuda/' + cudaPath + '/lib64:/root/volume/cudnn/' + cudnnPath + '/lib64:/root/volume/tensorrt/' + tensorRTPath + '/lib'}],
                 'resources': {'limits': {'cpu': '4', 'memory': '8G', 'nvidia.com/gpu': '1'}}, 'volumeMounts': [
                    {'mountPath': '/root/volume/cuda/' + cudaPath, 'name': 'nfs-volume-total',
                     'subPath': 'cuda/' + cudaPath,
                     'readOnly': True}, {'mountPath': '/root/volume/cudnn/' + cudnnPath, 'name': 'nfs-volume-total',
                                         'subPath': 'cudnn/' + cudnnPath, 'readOnly': True},
                    {'mountPath': '/opt/conda/envs/' + runtimePath, 'name': 'nfs-volume-total',
                     'subPath': 'envs/' + runtimePath,
                     'readOnly': True},
                    {'mountPath': '/root/volume/tensorrt/' + tensorRTPath + '/', 'name': 'nfs-volume-total',
                     'subPath': 'tensorrt/' + tensorRTPath, 'readOnly': True},
                    {'mountPath': '/root/volume/dataset/coco128', 'name': 'nfs-volume-total',
                     'subPath': 'dataset/coco128',
                     'readOnly': True},
                    {'mountPath': '/root/user', 'name': 'nfs-volume-total',
                     'subPath': 'user/' + userLoginID + "/" + projectName}]}],
                     'volumes': [
                         {'name': 'nfs-volume-total',
                          'persistentVolumeClaim': {'claimName': getBasicPVCName(userLoginID, projectName)}}]}}

    if model == 'RetinaFace':
        data = {'apiVersion': 'v1', 'kind': 'Pod',
                'metadata': {'name': nodeID, 'labels': {'app': appLabel}},
                'spec': {'restartPolicy': 'Never', 'containers': [
                    {'name': 'ubuntu', 'image': imageName, 'imagePullPolicy': 'IfNotPresent',
                     'command': ['/bin/bash', '-c'], 'args': [
                        'source /root/path.sh; PATH=/opt/conda/envs/' + runtimePath + '/bin:/root/volume/cuda/' + cudaPath + '/bin:$PATH; env; sh /script.sh;tail -f /dev/null'],
                     'env': [{'name': 'LD_LIBRARY_PATH',
                              'value': '/root/volume/cuda/' + cudaPath + '/lib64:/root/volume/cudnn/' + cudnnPath + '/lib:/root/volume/tensorrt/' + tensorRTPath + '/lib:/root/volume/nccl/nccl_2.17.1-1+cuda11.0_x86_64/lib'}],
                     'resources': {'limits': {'cpu': '4', 'memory': '8G', 'nvidia.com/gpu': '1'}}, 'volumeMounts': [
                        {'mountPath': '/root/volume/cuda/' + cudaPath, 'name': 'nfs-volume-total',
                         'subPath': 'cuda/' + cudaPath,
                         'readOnly': True}, {'mountPath': '/root/volume/cudnn/' + cudnnPath, 'name': 'nfs-volume-total',
                                             'subPath': 'cudnn/' + cudnnPath, 'readOnly': True},
                        {'mountPath': '/opt/conda/envs/' + runtimePath, 'name': 'nfs-volume-total',
                         'subPath': 'envs/' + runtimePath,
                         'readOnly': True},
                        {'mountPath': '/root/volume/tensorrt/' + tensorRTPath + '/', 'name': 'nfs-volume-total',
                         'subPath': 'tensorrt/' + tensorRTPath, 'readOnly': True},
                        {'mountPath': '/root/volume/nccl/nccl_2.17.1-1+cuda11.0_x86_64', 'name': 'nfs-volume-total',
                         'subPath': 'nccl/nccl_2.17.1-1+cuda11.0_x86_64', 'readOnly': True},
                        {'mountPath': '/root/volume/dataset/retinaface', 'name': 'nfs-volume-total',
                         'subPath': 'dataset/retinaface',
                         'readOnly': True},
                        {'mountPath': '/root/user', 'name': 'nfs-volume-total',
                         'subPath': 'user/' + userLoginID + "/" + projectName}]}],
                         'volumes': [
                             {'name': 'nfs-volume-total',
                              'persistentVolumeClaim': {'claimName': getBasicPVCName(userLoginID, projectName)}}]}}


    return data

def getUserJupyterNodeportName(loginID):
    return 'np-' + flask_api.global_def.config.api_id + '-' + loginID

def getUserJupyterLabelName(loginID):
    return 'jupyter-' + flask_api.global_def.config.api_id + '-' + loginID

def getUserJupyterPVName(loginID):
    return 'pv-user-' + flask_api.global_def.config.api_id + '-' + loginID

def getUserJupyterPVCName(loginID):
    return 'pvc-user-' + flask_api.global_def.config.api_id + '-' + loginID



def makeUserJupyterNodeportYaml(loginID):
    return {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": getUserJupyterNodeportName(loginID),
            "namespace": "softonnet-system"
        },
        "spec": {
            "type": "NodePort",
            "ports": [
                {
                    "port": 8888,
                    "targetPort": 8888,
                    "name": "jupyter"
                }
            ],
            "selector": {
                "app": getUserJupyterLabelName(loginID)
            }
        }
    }

# def makeUserJupyterNodeportYaml(loginID, passwd):
def makeUserJupyterPVYaml(loginID):
    data = {
        "apiVersion": "v1",
        "kind": "PersistentVolume",
        "metadata": {
            "name": getUserJupyterPVName(loginID),
            "labels": {
                "type": "local"
            }
        },
        "spec": {
            "storageClassName": "",
            "persistentVolumeReclaimPolicy": "Retain",
            "capacity": {
                "storage": "20Gi"
            },
            "accessModes": [
                "ReadWriteMany"
            ],
            "nfs": {
                "path": flask_api.global_def.config.nfs_path + "/user/" + loginID,
                "server": flask_api.global_def.config.nfs_server
            }
        }
    }
    return data

def makeUserJupyterPVCYaml(loginID):
    data = {
          "apiVersion": "v1",
          "kind": "PersistentVolumeClaim",
          "metadata": {
            "name": getUserJupyterPVCName(loginID),
            "namespace": "softonnet-system"
          },
          "spec": {
            "accessModes": [
              "ReadWriteMany"
            ],
            "volumeMode": "Filesystem",
            "storageClassName": "",
            "resources": {
              "requests": {
                "storage": "10Gi"
              }
            },
            "volumeName": getUserJupyterPVName(loginID),
            "selector": {
              "matchLabels": {
                "app": getUserJupyterLabelName(loginID)
              }
            }
          }
    }
    return data

def makeUserJupyterPodYaml(loginID, jupyterPW):
    data = {
      "apiVersion": "v1",
      "kind": "Pod",
      "metadata": {
        "name": getUserJupyterLabelName(loginID),
        "namespace": "softonnet-system",
        "labels": {
          "app": getUserJupyterLabelName(loginID)
        }
      },
      "spec": {
        "containers": [
          {
            "image": "jupyter/base-notebook",
            "command": [
              "sh",
              "-c",
              "start-notebook.sh --NotebookApp.allow_origin=* --NotebookApp.password=" + jupyterPW + " --ip=0.0.0.0 --NotebookApp.base_url=/storage/" + loginID
            ],
            "name": "jupyter",
            "volumeMounts": [
              {
                "name": "user-nfs-volume",
                "mountPath": "/home/jovyan"
              }
            ],
            "ports": [
              {
                "containerPort": 8888,
                "protocol": "TCP"
              }
            ]
          }
        ],
        "volumes": [
          {
            "name": "user-nfs-volume",
            "persistentVolumeClaim": {
              "claimName": getUserJupyterPVCName(loginID)
            }
          }
        ]
      }
    }
    return data