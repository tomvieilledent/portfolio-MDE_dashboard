"""Custom JWT wrapper to return API-shaped JSON on errors.

This module provides `jwt_required()` which wraps `verify_jwt_in_request`
and converts JWT exceptions into the project's standardized JSON error
responses.
"""

from functools import wraps

from flask_jwt_extended import verify_jwt_in_request
from flask_jwt_extended.exceptions import JWTExtendedException, NoAuthorizationError

from backend.api.errors import ERROR_CODES, error_response


def jwt_required(refresh: bool = False):
    """Decorator that enforces JWT presence and returns JSON errors.

    Parameters
    ----------
    refresh : bool, optional
        If True, requires a refresh token instead of an access token.

    Returns
    -------
    Callable
        A decorator usable on Flask-RESTful resource methods.
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request(refresh=refresh)
            except NoAuthorizationError as exc:
                return error_response(ERROR_CODES['UNAUTHORIZED'], str(exc), 401)
            except JWTExtendedException as exc:
                return error_response(ERROR_CODES['INVALID_TOKEN'], str(exc), 401)
            return fn(*args, **kwargs)

        return wrapper

    return decorator
