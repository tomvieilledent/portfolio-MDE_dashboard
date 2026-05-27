"""Small runner for local development.

Runs the Flask application created by `create_app()` when executed as a
script. This file is intended for local development only.
"""

from backend.api.app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
