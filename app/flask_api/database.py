import os
import mysql.connector
from flask_api.global_def import g_var


dbHost = os.getenv('DB_HOST', 'localhost')
dbPort = os.getenv('DB_PORT', '3306')
dbUser = os.getenv('DB_USER', 'admin')
dbPass = os.getenv('DB_PASS', 'admin')

def create_tables(dbcon=None):
    mycon = mysql.connector.connect(
        host=dbHost,
        port=dbPort,
        user=dbUser,
        password=dbPass,
    )

    cursor = mycon.cursor()
    cursor.execute('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED')
    cursor.execute(f'CREATE DATABASE IF NOT EXISTS {"aieyeflow"} CHARACTER SET utf8')
    cursor.execute('USE aieyeflow')
    mycon.commit()

    import codecs
    with codecs.open(filename='./runtime_data/clusterDB.sql', mode='r', encoding='utf-8') as f:
        sqls = f.read()
    cursor = mycon.cursor()
    rs = cursor.execute(sqls, multi=True)
    for r in rs:
        pass
    mycon.commit()

    return print("SUCCESS CREATE DATABASE")


def get_db_connection():
    if not g_var.mycon:
        g_var.mycon = mysql.connector.connect(
        host=dbHost,
        port=dbPort,
        user=dbUser,
        database='aieyeflow',
        password=dbPass,
        )
    return g_var.mycon
