
from flask_api import Namespace

g_var = Namespace()

g_var.db = None
g_var.mycon = None

configHolder = Namespace()
configHolder.config = None