import os
import sys
import argparse

import yaml
from gevent.pywsgi import WSGIServer

from flask_api.global_def import g_var
from flask_api.web_api import app

from common.logger import initialize_logger, get_logger
from global_def import configHolder

def main():
    if args.init_db:
        from flask_api import database
        print("Create Database tables")
        database.create_tables()
        sys.exit(0)

    # g_var.apiHost = args.api_host
    # g_var.apiId = args.api_id
    # g_var.apiPass = args.api_pass
    # g_var.apiJwt = "jwt"

    get_logger().info("Start Server")
    try:
        import subprocess as sp
        url = f"http:\/\/127.0.0.1:{args.port}"
        sp.call(['sed', '-i', '-e', f'2s/.*/REACT_APP_API=\"{url}\"/', '.env'], shell=False)


        http_server = WSGIServer(("0.0.0.0", args.port), app)
        http_server.serve_forever()

    except KeyboardInterrupt:
        print("End Server")
        sys.exit(0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--init_db',action='store_true')
    parser.add_argument('-p', '--port', type=int, default=5500)
    # parser.add_argument('-ah' '--api-host', required=True)
    # parser.add_argument('-aid' '--api-id', required=True)
    # parser.add_argument('-aps' '--api-pass', required=True)
    parser.add_argument(
        '-c',
        '--config',
        type=str,
        default='./config.yaml',
        help='server config file path'
    )
    #parser.add_argument('-t', '--debug', action='store_true')
    #parser.add_argument('-m', '--host')
    #parser.add_argument('--daemon', choices=['start', 'stop'])

    args = parser.parse_args()

    conf_file = args.config
    if os.path.exists(conf_file):
        with open(conf_file, 'r', encoding='utf-8') as yamlfile:
            configHolder.config = yaml.load(yamlfile, Loader=yaml.FullLoader)
        initialize_logger(configHolder.config)
        get_logger().info("Start AIFLOW Server")
        main()
    else:
        print("Error: Not exist config file")
        sys.exit(1)
