import requests
from flask import json
from flask_api.global_def import configHolder
class CenterClient:
    def __new__(cls, *args, **kwargs):
        """
        *args와 **kwargs는 무슨의미일까?
        여러 가변인자를 받겠다고 명시하는 것이며, *args는 튜플형태로 전달, **kwargs는 키:값 쌍의 사전형으로 전달된다.
        def test(*args, **kwargs):
            print(args)
            print(kwargs)

        test(5,10,'hi', k='v')
        결과 : (5, 10, 'hi') {'k': 'v'}
        """
        if not hasattr(cls, 'instance'):
            cls.instance = super(CenterClient, cls, *args, **kwargs).__new__(cls, *args, **kwargs)
        return cls.instance

def send_api(path, method, params = None, body = None,):
    url = configHolder['api_host'] + path
    headers = {'Content-Type': 'application/json', 'charset': 'UTF-8', 'Accept': '*/*', 'Authorization': "Bearer " + configHolder['api_jwt']}
    try:
        if ( method == 'GET'):
            response = requests.get(url, headers=headers, params=params, verify=False)
        elif method == 'POST':
            response = requests.post(url, headers=headers, data=json.dumps(body, ensure_ascii=False, indent="\t"))

        if response.status_code == 401:
            jwtBody = {"Id":configHolder['api_id'], "Password":configHolder['api_pass']}
            jwtResponse = requests.post(configHolder['api_host'] + "/auth", headers=headers, data=json.dumps(body))
            if jwtResponse.status_code == 200:
                JWT = jwtResponse.json()['accessToken']
                configHolder['api_jwt'] = JWT

            headers = {'Content-Type': 'application/json', 'charset': 'UTF-8', 'Accept': '*/*',
                   'Authorization': "Bearer " + JWT}
            if (method == 'GET'):
                response = requests.get(url, headers=headers, params=params, verify=False)
            elif method == 'POST':
                response = requests.post(url, headers=headers, data=json.dumps(body, ensure_ascii=False, indent="\t"))

        return response

    except Exception as  ex:
        print(ex)

def getPods(workspace = None, cluster = None, project = None):
    query=dict()
    if workspace != None:
        query['workspace'] = workspace
    if cluster != None:
        query['cluster'] = cluster
    if project != None:
        query['project'] = project

    try:
        return send_api(path="/pods", method="GET", params=query).json()
    except:
        return {}
