import os
import sys

# Add the backend directory to the sys.path so Python can find our modules
path = os.path.dirname(os.path.abspath(__file__))
if path not in sys.path:
    sys.path.append(path)

from main import app
from a2wsgi import ASGIMiddleware

# PythonAnywhere looks for a WSGI application named `application`
application = ASGIMiddleware(app)
