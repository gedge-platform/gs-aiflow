import os
import traceback
import time
import ssl
import flask_restful
import flask
from flask import request, redirect
from flask_sockets import Sockets
from flask_cors import CORS

# from flask_restful import reqparse

from flask_api import monitor_impl

app = flask.Flask(import_name='client_web',
				  static_folder=os.path.join('../web_root','static'),
				  static_url_path='',
				  root_path='')
app.config['JSON_AS_ASCII'] = False

CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

sockets = Sockets(app)

api = flask_restful.Api(app)


@app.route('/')
def index():
    return "HELLO, AIEYEFLOW"


@app.route('/api/makeData', methods=['POST'])
def makeData():
    if request.method == 'POST':
        result = request.json
        return monitor_impl.parseJsonToYaml(result)
    return "erwer"


@app.route('/api/getListNodeAll/<string:clustername>')
def getListNodeAll(clustername=None):
    return monitor_impl.getListNodeAll(clustername)


@app.route('/api/getListNamespacePod', methods=['POST'])
def getListNamespacePod():
    if request.method == 'POST':
        result = request.form
        return monitor_impl.getListNamespacePod(result)


@app.route('/api/getPodNamespaceList/<string:clustername>')
def getPodNamespaceList(clustername=None):
    return monitor_impl.getPodNamespaceList(clustername)


@app.route('/api/getListCluster')
def getListCluster(clustername=None):
    return monitor_impl.getListCluster(clustername)


@app.route('/api/getPV/<string:clustername>')
def getPV(clustername=None):
    return monitor_impl.getPV(clustername)


@app.route('/api/getStorageclass/<string:clustername>')
def getStorageclass(clustername=None):
    return monitor_impl.getStorageclass(clustername)


@app.route('/api/setMonitor', methods=['POST'])
def setMonitor():
    if request.method == 'POST':
        result = request.form
        return monitor_impl.setMonitor(result)
    else:
        return 'ERROR'


@app.route('/api/abstractMonitor/<string:clustername>')
def abstractMonitor(clustername):
    return monitor_impl.abstractMonitor(clustername)


@app.route('/api/createDict', methods=['POST'])
def createDict():
    if request.method == 'POST':
        result = request.form
    return monitor_impl.createDict(result)


@app.route('/api/deletePod/<string:podName>')
def deletePod(podName):
    return monitor_impl.deletePod(podName)


@app.route('/api/loginCheck', methods=['POST'])
def loginCheck():
    if request.method == 'POST':
        result = request.form
        return monitor_impl.loginCheck(result)


@app.route('/api/getServerList')
def getServerList():
    return monitor_impl.getserverlist()


@app.route('/api/getListCreateDeployment/<string:server>')
def getListCreateDeployment(server):
    return monitor_impl.getListCreateDeployment(server)


@app.route('/api/createServer', methods=['POST'])
def createServer():
    if request.method == 'POST':
        result = request.form
        return monitor_impl.createServer(result)


@app.route('/api/deleteDeployment', methods=['POST'])
def deleteDeployment():
    if request.method == 'POST':
        result = request.form
        return monitor_impl.deleteDeployment(result)


@app.route('/api/getListDeploymentAllNamespaces/<string:cluster>')
def getListDeploymentAllNamespaces(cluster):
    return monitor_impl.getListDeploymentAllNamespaecs(cluster)


@app.route('/api/getPodLog', methods=['POST'])
def getPodLog():
    if request.method == 'POST':
        result = request.form
        return monitor_impl.getPodLog(result)


@app.route('/api/getServerListDB/<string:cluster>', methods=['GET'])
def getServerListDB(cluster):
    return monitor_impl.getServerListDB(cluster)


@app.route('/api/getStatusDeploy', methods=['POST'])
def getStatusDeploy():
    if request.method == 'POST':
        result = request.form
        return monitor_impl.getStatusDeploy(result)


@app.route('/api/testAPI')
def test():
    return monitor_impl.testAPI()


@app.route('/api/dummy', methods=['POST', 'GET'])
def dummy():
    if request.method == 'POST':
        res = request.json
        result = request.form
        return monitor_impl.dummy()
    return monitor_impl.dummy()


@app.route('/api/getDAG/<string:dagId>', methods=['GET'])
def getDAG(dagId):
    return monitor_impl.getDag(dagId)

@app.route('/api/testget', methods=['GET'])
def testget1():
    return monitor_impl.getTest()
@app.route('/api/getPodStatus', methods=['POST'])
def getPodStatus\
                ():
    if request.method == 'POST':
        result = request.form
        return monitor_impl.getPodStatus(result)
@app.route('/api/getPodDetail/<string:podID>', methods=['GET'])
def getPodDetail(podID):
    if request.method == 'GET':
        result = request.form
        return monitor_impl.getPodDetail(podID)


@app.route('/api/project/launch', methods=['POST'])
def launchProject():
    if request.method == 'POST':
        jsonData = request.json
        userID = '9dda2182-99f2-46b6-b6c7-00e19a4ab08d'
        return monitor_impl.launchProject(userID, jsonData['projectID'])

@app.route('/api/getProjectList/<string:userID>', methods=['GET'])
def getProjectList(userID):
    if request.method == 'GET':
        userID = '9dda2182-99f2-46b6-b6c7-00e19a4ab08d'
        return monitor_impl.getProjectList(userID)


@app.route('/api/project/init', methods=['POST'])
def initProject():
    if request.method == 'POST':
        jsonData = request.json
        userID = '9dda2182-99f2-46b6-b6c7-00e19a4ab08d'
        return monitor_impl.initProject(userID, jsonData['projectID'])
@app.route('/api/clusters/<string:userID>', methods=['GET'])
def getClusterList(userID):
    if request.method == 'GET':
        userID = '9dda2182-99f2-46b6-b6c7-00e19a4ab08d'
        return monitor_impl.getClusterList(userID)

@app.route('/api/project', methods=['POST'])
def createProject():
    if request.method == 'POST':
        jsonData = request.json
        userID = '9dda2182-99f2-46b6-b6c7-00e19a4ab08d'
        return monitor_impl.createProject(userID, jsonData['projectName'], jsonData['projectDesc'], jsonData['clusterName'])


@app.route('/api/project/<string:projectName>', methods=['DELETE'])
def deleteProject(projectName):
    if request.method == 'DELETE':
        userID = '9dda2182-99f2-46b6-b6c7-00e19a4ab08d'
        return monitor_impl.deleteProject(userID, projectName)


@app.route('/api/project/<string:projectName>', methods=['GET'])
def getProject(projectName):
    if request.method == 'GET':
        userID = '9dda2182-99f2-46b6-b6c7-00e19a4ab08d'
        return monitor_impl.getProject(userID, projectName)

@app.route('/api/pod/env', methods=['GET'])
def getPodEnv():
    if request.method == 'GET':
        return monitor_impl.getPodEnv()


@app.route('/api/pod/env/model', methods=['GET'])
def getPodEnvModel():
    if request.method == 'GET':
        return monitor_impl.getPodEnvModel()

@app.route('/api/pod/env/framework/<string:modelName>', methods=['GET'])
def getPodEnvFramework(modelName):
    if request.method == 'GET':
        return monitor_impl.getPodEnvFrameWork(modelName)

@app.route('/api/pod/env/runtime/<string:modelName>/<string:framework>', methods=['GET'])
def getPodEnvRuntime(modelName, framework):
    if request.method == 'GET':
        return monitor_impl.getPodEnvRuntime(modelName, framework)

@app.route('/api/pod/env/tensorrt/<string:runtimeName>', methods=['GET'])
def getPodEnvTensor(runtimeName):
    if request.method == 'GET':
        return monitor_impl.getPodEnvTensor(runtimeName)


@app.route('/api/storage', methods=['GET'])
def getStorageSite():
    if request.method == 'GET':
        return redirect ('http://127.0.0.1:8888?token=90f3998918319b395ae9f32b561b2b98ec090dc7aa7a88f7')


@app.route('/api/project/<string:projectName>/storage', methods=['GET'])
def getProjectStorage(projectName):
    if request.method == 'GET':
        userID = '9dda2182-99f2-46b6-b6c7-00e19a4ab08d'
        return flask.jsonify(link='http://127.0.0.1:8888/tree/' + projectName + '/?token=90f3998918319b395ae9f32b561b2b98ec090dc7aa7a88f7'), 200

@app.route('/api/project/dag', methods=['POST'])
def postDag():
    if request.method == 'POST':
        userID = '9dda2182-99f2-46b6-b6c7-00e19a4ab08d'
        return monitor_impl.postDag(userID)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
