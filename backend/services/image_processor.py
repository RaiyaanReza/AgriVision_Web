import io
import logging
from typing import Tuple

import numpy as np
from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

logger = logging.getLogger(__name__)

SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
DEFAULT_TARGET_SIZE = (640, 640)


class ImageProcessor:
    """Validates and normalizes uploaded images for model inference."""

    @staticmethod
    async def read_and_validate_upload(upload_file: UploadFile) -> bytes:
        if upload_file is None:
            raise ValueError("Image file is required.")

        if upload_file.content_type not in SUPPORTED_IMAGE_TYPES:
            raise ValueError(
                f"Unsupported image content type: {upload_file.content_type}. "
                f"Allowed: {sorted(SUPPORTED_IMAGE_TYPES)}"
            )

        image_bytes = await upload_file.read()
        if not image_bytes:
            raise ValueError("Uploaded image is empty.")

        if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise ValueError("Uploaded image exceeds maximum size of 10MB.")

        return image_bytes

    @staticmethod
    def bytes_to_pil(image_bytes: bytes) -> Image.Image:
        try:
            with Image.open(io.BytesIO(image_bytes)) as image:
                return image.convert("RGB")
        except UnidentifiedImageError as exc:
            logger.error("Invalid image payload received.", exc_info=True)
            raise ValueError("Uploaded file is not a valid image.") from exc

    @staticmethod
    def resize_image(image: Image.Image, target_size: Tuple[int, int] = DEFAULT_TARGET_SIZE) -> Image.Image:
        return image.resize(target_size, Image.Resampling.LANCZOS)

    @staticmethod
    def pil_to_numpy(image: Image.Image) -> np.ndarray:
        return np.asarray(image)

    @staticmethod
    def numpy_to_pil(array: np.ndarray) -> Image.Image:
        if not isinstance(array, np.ndarray):
            raise ValueError("Input must be a numpy ndarray.")

        if array.ndim not in (2, 3):
            raise ValueError("Numpy array must be 2D (grayscale) or 3D (color).")

        return Image.fromarray(array.astype(np.uint8))

    @classmethod
    async def prepare_for_inference(
        cls,
        upload_file: UploadFile,
        target_size: Tuple[int, int] = DEFAULT_TARGET_SIZE,
    ) -> Image.Image:
        image_bytes = await cls.read_and_validate_upload(upload_file)
        pil_image = cls.bytes_to_pil(image_bytes)
        return cls.resize_image(pil_image, target_size)
