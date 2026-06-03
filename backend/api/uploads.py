"""Helpers for storing uploaded image files.

Uploaded files are saved on disk and exposed through the `/uploads/...`
route added in `backend.api.app`.
"""

from pathlib import Path
from uuid import uuid4

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename


UPLOAD_ROOT = Path(__file__).resolve().parents[1] / 'uploads'
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}


def ensure_upload_dirs():
    """Create the upload folders used by the API if they do not exist."""
    for folder_name in ('users/profile_pictures', 'users/business_cards', 'companies', 'trainings'):
        (UPLOAD_ROOT / folder_name).mkdir(parents=True, exist_ok=True)


def _is_allowed_image(filename):
    return Path(filename).suffix.lower() in ALLOWED_IMAGE_EXTENSIONS


def save_image_upload(file_storage: FileStorage, category: str):
    """Save an uploaded image and return its public relative URL.

    Parameters
    ----------
    file_storage : FileStorage
        File object received from `request.files`.
    category : str
        Subfolder where the file should be stored (`users`, `companies`,
        or `trainings`).
    """
    if not file_storage or not file_storage.filename:
        return None

    ensure_upload_dirs()
    original_name = secure_filename(file_storage.filename)
    if not original_name:
        raise ValueError('invalid filename')
    if not _is_allowed_image(original_name):
        raise ValueError(
            'only jpg, jpeg, png, gif and webp images are allowed')

    suffix = Path(original_name).suffix.lower()
    public_name = f"{uuid4().hex}{suffix}"
    relative_path = Path(category) / public_name
    destination = UPLOAD_ROOT / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    file_storage.save(destination)

    return f"/uploads/{relative_path.as_posix()}"


def delete_uploaded_file(public_path: str | None):
    """Delete a previously stored upload if it belongs to this app."""
    if not public_path or not isinstance(public_path, str):
        return
    relative_path = public_path.lstrip('/')
    if not relative_path.startswith('uploads/'):
        return
    try:
        file_path = (
            UPLOAD_ROOT / Path(relative_path).relative_to('uploads')).resolve()
        upload_root = UPLOAD_ROOT.resolve()
        if upload_root not in file_path.parents:
            return
    except Exception:
        return
    if file_path.exists() and file_path.is_file():
        file_path.unlink()
