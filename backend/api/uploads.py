"""Helpers for storing and deleting uploaded image files."""

from pathlib import Path
from uuid import uuid4

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename


UPLOAD_ROOT = Path(__file__).resolve().parents[1] / 'uploads'
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}


def ensure_upload_dirs():
    """Create the upload sub-folders if they do not already exist."""
    for folder_name in (
        'users/profile_pictures',
        'users/business_cards',
        'companies',
        'trainings',
    ):
        (UPLOAD_ROOT / folder_name).mkdir(parents=True, exist_ok=True)


def _is_allowed_image(filename):
    return Path(filename).suffix.lower() in ALLOWED_IMAGE_EXTENSIONS


def save_image_upload(file_storage: FileStorage, category: str) -> str | None:
    """Save an uploaded image to disk and return its public relative URL.

    Args:
        file_storage (FileStorage): File object received from ``request.files``.
        category (str): Destination sub-folder, e.g. ``users/profile_pictures``,
            ``companies``, or ``trainings``.

    Returns:
        str | None: Public URL path (``/uploads/<category>/<uuid>.<ext>``), or
            ``None`` when no file was provided.

    Raises:
        ValueError: If the filename is invalid or the extension is not allowed.
    """
    if not file_storage or not file_storage.filename:
        return None

    ensure_upload_dirs()
    original_name = secure_filename(file_storage.filename)
    if not original_name:
        raise ValueError('invalid filename')
    if not _is_allowed_image(original_name):
        raise ValueError('only jpg, jpeg, png, gif and webp images are allowed')

    suffix = Path(original_name).suffix.lower()
    public_name = f"{uuid4().hex}{suffix}"
    relative_path = Path(category) / public_name
    destination = UPLOAD_ROOT / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    file_storage.save(destination)

    return f"/uploads/{relative_path.as_posix()}"


def delete_uploaded_file(public_path: str | None) -> None:
    """Delete a previously stored upload if it belongs to this application.

    Silently ignores missing files or paths outside the upload root.

    Args:
        public_path (str | None): Public path as returned by
            :func:`save_image_upload`, e.g. ``/uploads/trainings/abc.jpg``.
    """
    if not public_path or not isinstance(public_path, str):
        return
    relative_path = public_path.lstrip('/')
    if not relative_path.startswith('uploads/'):
        return
    try:
        file_path = (
            UPLOAD_ROOT / Path(relative_path).relative_to('uploads')
        ).resolve()
        upload_root = UPLOAD_ROOT.resolve()
        if upload_root not in file_path.parents:
            return
    except Exception:
        return
    if file_path.exists() and file_path.is_file():
        file_path.unlink()
