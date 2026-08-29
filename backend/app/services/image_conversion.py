"""
image_conversion.py — Image format detection and normalization service.

Detects MIME formats using binary magic headers:
- AVIF: 'ftypavif', 'ftypavis'
- HEIC/HEIF: 'ftypheic', 'ftypheix', 'ftypmif1', 'ftypmsf1'
- WebP: 'RIFF....WEBP'
- PNG: 0x89504E470D0A1A0A
- JPEG: 0xFFD8FF

Converts any incoming buffer into standardized RGB JPEG bytes.
"""

import io
from typing import Tuple
from PIL import Image

try:
    import pillow_heif
    pillow_heif.register_avif_opener()
    pillow_heif.register_heif_opener()
    _HEIF_AVAILABLE = True
except Exception:
    _HEIF_AVAILABLE = False


def detect_image_mime(image_bytes: bytes) -> str:
    """Detects MIME type from byte signatures."""
    if not image_bytes or len(image_bytes) < 12:
        return "application/octet-stream"

    # JPEG
    if image_bytes[:3] == b"\xff\xd8\xff":
        return "image/jpeg"

    # PNG
    if image_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"

    # WebP: starts with RIFF and has WEBP at offset 8
    if image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"WEBP":
        return "image/webp"

    # AVIF / HEIF check: ISO base media file format has 'ftyp' at offset 4
    if image_bytes[4:8] == b"ftyp":
        brand = image_bytes[8:12]
        if brand in (b"avif", b"avis"):
            return "image/avif"
        if brand in (b"heic", b"heix", b"hevc", b"hevx", b"mif1", b"msf1"):
            return "image/heic"
        return "image/heif"

    # GIF
    if image_bytes[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"

    # BMP
    if image_bytes[:2] == b"BM":
        return "image/bmp"

    return "image/jpeg"


def normalize_image_to_rgb_jpeg(image_bytes: bytes, max_dimension: int = 2400) -> Tuple[bytes, str]:
    """
    Normalizes any supported image buffer (AVIF, HEIC, WebP, PNG, JPEG)
    into a standardized RGB JPEG byte buffer.
    
    Returns:
        (jpeg_bytes, detected_mime_type)
    """
    if not image_bytes:
        return b"", "application/octet-stream"

    detected_mime = detect_image_mime(image_bytes)

    try:
        # Load image via Pillow (pillow-heif handles AVIF/HEIC seamlessly)
        img = Image.open(io.BytesIO(image_bytes))

        # Handle EXIF orientation if present
        try:
            from PIL import ImageOps
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass

        # Convert to RGB (handles RGBA, Palette, Grayscale, CMYK)
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Downscale if excessively large to prevent memory spikes
        w, h = img.size
        if max(w, h) > max_dimension:
            scale = max_dimension / max(w, h)
            img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

        out_buf = io.BytesIO()
        img.save(out_buf, format="JPEG", quality=92, optimize=True)
        return out_buf.getvalue(), detected_mime

    except Exception as e:
        print(f"[Image Conversion] Warning: Normalization failed ({e}), returning raw buffer.")
        return image_bytes, detected_mime
