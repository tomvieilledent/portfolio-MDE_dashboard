from functools import wraps

from flask_jwt_extended import verify_jwt_in_request
from flask_jwt_extended.exceptions import JWTExtendedException, NoAuthorizationError

from backend.api.errors import ERROR_CODES, error_response


def jwt_required(refresh: bool = False):
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
