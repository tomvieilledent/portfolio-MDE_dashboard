from __future__ import annotations

from typing import Any

ERROR_CODES = {
    'BAD_REQUEST': 'BAD_REQUEST',
    'UNAUTHORIZED': 'UNAUTHORIZED',
    'FORBIDDEN': 'FORBIDDEN',
    'NOT_FOUND': 'NOT_FOUND',
    'CONFLICT': 'CONFLICT',
    'VALIDATION_ERROR': 'VALIDATION_ERROR',
    'INVALID_CREDENTIALS': 'INVALID_CREDENTIALS',
    'INVALID_TOKEN': 'INVALID_TOKEN',
    'TOKEN_EXPIRED': 'TOKEN_EXPIRED',
    'TOKEN_REVOKED': 'TOKEN_REVOKED',
    'NOT_IMPLEMENTED': 'NOT_IMPLEMENTED',
    'INTERNAL_ERROR': 'INTERNAL_ERROR',
}


def error_response(code: str, message: str, status: int = 400, details: Any = None):
    payload = {'error': {'code': code, 'message': message}}
    if details is not None:
        payload['error']['details'] = details
    return payload, status


def ok_response(data: Any, status: int = 200):
    return data, status
