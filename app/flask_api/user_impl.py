from functools import wraps
from random import random

from flask import request, jsonify, session
from flask_api.monitoring_manager import get_db_connection
from flask_api.global_def import config
import hashlib

def login():
    if request.is_json is False:
        return jsonify(status='failed', msg='not json'), 200
    data = request.json
    if data is None:
        return jsonify(status='failed', msg='wrong data'), 200
    if type(data.get('ID')) != str:
        return jsonify(status='failed', msg='id is not str'), 200
    if type(data.get('PW')) != str:
        return jsonify(status='failed', msg='pw is not str'), 200

    id = data.get('ID')
    pw = data.get('PW')

    res = getUserRow(id, pw)
    if res is not None:
        session['user_id'] = id
        session['is_login'] = True
        session['is_admin'] = res['is_admin']
        session['workspace'] = res['workspace_name']
        session['user_name'] = res['user_name']

        data = {
            'userName' : res['user_name']
        }
        return jsonify(status='success', data=data), 200
    else:
        return jsonify(status='failed', msg='id or pw is wrong'), 200

def needLogin():
    def _login_filter(func):
        @wraps(func)
        def _login_filter_(*args, **kargs):
            if session.get('is_login') is None:
                return jsonify(msg = 'login is expired'), 401
            if session.get('is_login') is not True:
                return jsonify(msg = 'login is expired'), 401
            return func(*args, **kargs)
        return _login_filter_
    return _login_filter

def maintainLogin():
    def _maintain(func):
        @wraps(func)
        def _maintain(*args, **kargs):
            session['is_login'] = True
            return func(*args, **kargs)
        return _maintain
    return _maintain



def salt(pw : str):
    return pw + config.salt

def encodeHash(pwAddedSalt : str):
    return hashlib.sha256(pwAddedSalt.encode()).hexdigest()

def getUserRow(id : str, pw : str):
    saltedPw = salt(pw)
    encodePw = encodeHash(saltedPw)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(f'select * from TB_USER where login_id = "{id}" and login_pass = "{encodePw}"')
    rows = cursor.fetchall()

    if rows is None:
        return None

    if len(rows) == 1:
        return rows[0]

    return None


def logout():
    session.clear()
    return jsonify(status='success'), 200