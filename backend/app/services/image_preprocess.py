"""
image_preprocess.py — OpenCV pre-processing pipeline for packaging label OCR.

Steps applied in order:
1. Format normalization → RGB
2. Upscale small images to minimum 1200px long-edge (helps OCR on tiny text)
3. Adaptive histogram equalization (CLAHE) → boosts low-contrast / dark labels
4. Denoise (Non-local Means) → removes printing noise / JPG artifacts
5. Sharpen (Unsharp Mask) → crisps text edges
6. Deskew → straightens tilted packaging shots

All steps are safe no-ops if OpenCV is not installed.
"""

import io
import numpy as np
from PIL import Image

try:
    import pillow_heif
    if hasattr(pillow_heif, "register_heif_opener"):
        pillow_heif.register_heif_opener()
except ImportError:
    pass

try:
    import cv2
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False


def preprocess_for_ocr(image_bytes: bytes) -> bytes:
    """
    Applies the full pre-processing pipeline to an image and returns
    the improved image as JPEG bytes.

    Falls back to the original image bytes if OpenCV is unavailable.
    """
    try:
        # Decode first so AVIF/HEIC never reaches a provider with a false MIME type.
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        if not _CV2_AVAILABLE:
            output = io.BytesIO()
            pil_image.save(output, format="JPEG", quality=92)
            return output.getvalue()

        # ── Decode ──────────────────────────────────────────────────────────
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            # Fallback via Pillow (handles WebP / AVIF / HEIF)
            img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

        # ── Step 1: Upscale if too small ────────────────────────────────────
        h, w = img.shape[:2]
        long_edge = max(h, w)
        if long_edge < 1200:
            scale = 1200 / long_edge
            img = cv2.resize(img, (int(w * scale), int(h * scale)),
                             interpolation=cv2.INTER_CUBIC)

        # ── Step 2: Convert to LAB for CLAHE on Luminance only ───────────────
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l_ch, a_ch, b_ch = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_ch = clahe.apply(l_ch)
        lab = cv2.merge([l_ch, a_ch, b_ch])
        img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

        # ── Step 3: Denoise ─────────────────────────────────────────────────
        img = cv2.fastNlMeansDenoisingColored(img, None,
                                              h=8, hColor=8,
                                              templateWindowSize=7,
                                              searchWindowSize=21)

        # ── Step 4: Unsharp Mask (Sharpen) ──────────────────────────────────
        gaussian = cv2.GaussianBlur(img, (0, 0), 2.0)
        img = cv2.addWeighted(img, 1.5, gaussian, -0.5, 0)

        # ── Step 5: Deskew on grayscale ─────────────────────────────────────
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = _deskew(img, gray)

        # ── Encode back to JPEG ─────────────────────────────────────────────
        success, encoded = cv2.imencode(".jpg", img,
                                        [cv2.IMWRITE_JPEG_QUALITY, 92])
        if success:
            return encoded.tobytes()

    except Exception as e:
        # Never crash the main pipeline; just return original
        print(f"[Preprocess] Warning: preprocessing step failed ({e}), using original image.")

    return image_bytes


def _deskew(img_color: np.ndarray, gray: np.ndarray) -> np.ndarray:
    """
    Detects skew angle using Hough lines and rotates to correct it.
    Only corrects angles within ±15° to avoid over-rotating curved packs.
    """
    try:
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLines(edges, 1, np.pi / 180, threshold=100)
        if lines is None:
            return img_color

        angles = []
        for line in lines[:30]:  # Use top 30 lines only
            rho, theta = line[0]
            angle_deg = np.degrees(theta) - 90
            if -15 < angle_deg < 15:
                angles.append(angle_deg)

        if not angles:
            return img_color

        median_angle = float(np.median(angles))
        if abs(median_angle) < 0.5:
            return img_color  # Skip trivial rotation

        h, w = img_color.shape[:2]
        M = cv2.getRotationMatrix2D((w / 2, h / 2), median_angle, 1.0)
        rotated = cv2.warpAffine(img_color, M, (w, h),
                                 flags=cv2.INTER_CUBIC,
                                 borderMode=cv2.BORDER_REPLICATE)
        return rotated

    except Exception:
        return img_color
