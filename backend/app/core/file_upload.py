import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import List
import aiofiles

# Upload directory - use absolute path for Docker compatibility
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "images"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def get_upload_path(filename: str) -> Path:
    """Generate a unique file path for upload"""
    file_ext = Path(filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")
    
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    return UPLOAD_DIR / unique_filename

async def save_uploaded_file(file: UploadFile) -> str:
    """
    Save uploaded file and return the URL path
    Returns: URL path like '/uploads/images/filename.jpg'
    """
    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB")
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(contents)
    
    # Return URL path (relative to static files)
    # Use forward slashes for URL compatibility
    return f"/uploads/images/{unique_filename}"

async def save_multiple_files(files: List[UploadFile]) -> List[str]:
    """Save multiple uploaded files and return their URL paths"""
    saved_paths = []
    for file in files:
        if file.filename:  # Check if file was actually uploaded
            path = await save_uploaded_file(file)
            saved_paths.append(path)
    return saved_paths

