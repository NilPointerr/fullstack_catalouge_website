"""
File upload utilities for handling image uploads.

Provides functions for validating and saving uploaded image files.
"""
import uuid
from pathlib import Path
from typing import List
import aiofiles
from fastapi import UploadFile, HTTPException, status

from app.core.config import settings

# Upload directory - use absolute path for Docker compatibility
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / settings.UPLOAD_DIR
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed image extensions from settings
ALLOWED_EXTENSIONS = set(settings.ALLOWED_EXTENSIONS)
MAX_FILE_SIZE = settings.MAX_FILE_SIZE

def get_upload_path(filename: str) -> Path:
    """
    Generate a unique file path for upload.
    
    Args:
        filename: Original filename
        
    Returns:
        Path object for the upload location
        
    Raises:
        HTTPException: If file extension is not allowed
    """
    file_ext = Path(filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"File type {file_ext} not allowed. "
                f"Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            ),
        )
    
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    return UPLOAD_DIR / unique_filename

async def save_uploaded_file(file: UploadFile) -> str:
    """
    Save uploaded file and return the URL path.
    
    Validates file size and extension before saving.
    
    Args:
        file: UploadFile object from FastAPI
        
    Returns:
        URL path like '/uploads/images/filename.jpg'
        
    Raises:
        HTTPException: If file validation fails
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required",
        )
    
    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        max_size_mb = MAX_FILE_SIZE / 1024 / 1024
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {max_size_mb}MB",
        )
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"File type {file_ext} not allowed. "
                f"Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            ),
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(contents)
    
    # Return URL path (relative to static files)
    # Use forward slashes for URL compatibility
    return f"/{settings.UPLOAD_DIR}/{unique_filename}"

async def save_multiple_files(files: List[UploadFile]) -> List[str]:
    """
    Save multiple uploaded files and return their URL paths.
    
    Args:
        files: List of UploadFile objects
        
    Returns:
        List of URL paths for saved files
    """
    saved_paths = []
    for file in files:
        if file.filename:  # Check if file was actually uploaded
            path = await save_uploaded_file(file)
            saved_paths.append(path)
    return saved_paths

