from flask import request, jsonify, session

import flask_api.auth_impl
from flask_api.monitoring_manager import get_db_connection
import flask_api.center_client
from flask_api.global_def import config


def getUsers():
    mycon = get_db_connection()
    cursor = mycon.cursor(dictionary=True)
    cursor.execute(f'select login_id, user_name, is_admin from TB_USER;')
    rows = cursor.fetchall()
    list = []
    if rows is not None:
        for row in rows:
            list.append(row)

    return jsonify(users=list), 200


def createUser():
    data = request.json
    if data is None:
        return jsonify(status='failed', msg='body is not json'), 200
    if data.get('login_id') is None or type( data.get('login_id')) != str:
        return jsonify(status='failed', msg='login_id is wrong'), 200
    if data.get('user_name') is None or type( data.get('user_name')) != str:
        return jsonify(status='failed', msg='user_name is wrong'), 200
    if data.get('login_pass') is None or type( data.get('login_pass')) != str:
        return jsonify(status='failed', msg='login_pass is wrong'), 200
    if data.get('is_admin') is None or type( data.get('is_admin')) != int:
        return jsonify(status='failed', msg='is_admin is wrong'), 200
    if data.get('cluster_list') is None or type( data.get('cluster_list')) != list:
        return jsonify(status='failed', msg='cluster_list is wrong'), 200
    for item in data.get('cluster_list'):
        if type(item) != str:
            return jsonify(status='failed', msg='cluster_list is wrong'), 200

    mycon = get_db_connection()
    cursor = mycon.cursor(dictionary=True)
    cursor.execute(f'select * from TB_USER where login_id = "{data.get("login_id")}";')
    rows = cursor.fetchall()

    if rows is None:
        return jsonify(status='failed', msg='server error'), 200
    elif len(rows) >= 1:
        return jsonify(status='failed', msg='login_id is already exist'), 200

    #uuid
    import uuid
    uuid = uuid.uuid4().__str__()

    #make workspace
    res = flask_api.center_client.workspacesPost(uuid, config.api_id + "_" + data.get("user_name"), data.get("cluster_list"))
    if res.get('status') is None:
        return jsonify(status='failed', msg='server error : workspace'), 200
    if res.get('status') != 'Created':
        return jsonify(status='failed', msg='server error : workspace duplicated'), 200

    #pass
    saltedPW = flask_api.auth_impl.salt(data.get('login_pass'));
    encodedPW = flask_api.auth_impl.encodeHash(saltedPW);

    #insert to db
    try:
        cursor.execute(f'insert into TB_USER (user_uuid, login_id, login_pass, user_name, workspace_name, is_admin) '
                   f'values("{uuid}", "{data.get("login_id")}", "{encodedPW}", "{data.get("user_name")}", "{uuid}", {data.get("is_admin")});')
        mycon.commit()
    except:
        return jsonify(status='failed', msg='server error'), 200

    return jsonify(status="success"), 200