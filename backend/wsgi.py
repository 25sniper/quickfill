import os
import sys

# Add the backend directory to the sys.path so Python can find our modules
path = os.path.dirname(os.path.abspath(__file__))
if path not in sys.path:
    sys.path.append(path)

# Import the Flask app object
from app import app as application
