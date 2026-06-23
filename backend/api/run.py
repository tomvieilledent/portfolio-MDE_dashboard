"""Small runner for local development.

Runs the Flask application created by `create_app()` when executed as a
script. This file is intended for local development only.
"""

from backend.api.app import create_app
from backend.api.sockets import socketio

app = create_app()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)
