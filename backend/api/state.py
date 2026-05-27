"""In-memory token blocklist used by JWT callbacks.

This module exposes `BLOCKLIST`, a simple set of revoked token JTIs.
In production this should be replaced by a persistent store.
"""

BLOCKLIST = set()
