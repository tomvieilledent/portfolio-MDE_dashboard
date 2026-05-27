"""Centralized API error codes and helpers.

This module defines `ERROR_CODES` used throughout the API and helper
functions to return consistent JSON payloads.
"""

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
    """Create a standardized error response payload.

    Parameters
    ----------
    code : str
        One of the keys in `ERROR_CODES` describing the error type.
    message : str
        Human-readable error message.
    status : int, optional
        HTTP status code to return (default 400).
    details : Any, optional
        Optional extra error details to include in the payload.

    Returns
    -------
    tuple[dict, int]
        JSON-serializable payload and HTTP status code.
    """
    payload = {'error': {'code': code, 'message': message}}
    if details is not None:
        payload['error']['details'] = details
    return payload, status


def ok_response(data: Any, status: int = 200):
    """Return a successful response payload.

    Parameters
    ----------
    data : Any
        Data to return as JSON.
    status : int, optional
        HTTP status code (default 200).

    Returns
    -------
    tuple[Any, int]
        Payload and HTTP status code.
    """
    return data, status
