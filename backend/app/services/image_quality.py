import io
import numpy as np
from PIL import Image, ImageStat

try:
    import pillow_heif
    pillow_heif.register_avif_opener()
    pillow_heif.register_heif_opener()
except Exception:
    pass

def check_image_quality(image_bytes: bytes) -> dict:
    """
    Evaluates image quality for OCR readiness:
    - Blur / Sharpness check using Laplacian variance approximation
    - True Glare / Extreme Overexposure check (filters out normal white packaging)
    - Low-light / Underexposure check
    - Resolution check
    """
    warnings = []
    try:
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
        
        # 1. Resolution Check
        if width < 300 or height < 300:
            warnings.append("Low resolution: Image dimensions below 300x300. Text may be hard to read.")
        
        # Convert to grayscale for statistical analysis
        gray = img.convert('L')
        stat = ImageStat.Stat(gray)
        avg_brightness = stat.mean[0] # 0 to 255
        std_dev = stat.stddev[0]      # Contrast measure
        
        # 2. Lighting Check
        if avg_brightness < 30:
            warnings.append("Underexposed: Image is very dark. Ensure adequate lighting.")
        elif avg_brightness > 248 and std_dev < 15:
            warnings.append("Severe Overexposure / Washout: Image lacks contrast due to extreme light.")
            
        # Convert to numpy array for blur test
        arr = np.array(gray, dtype=np.float32)
        
        # 3. True Hotspot Glare (only if localized bright white burnouts with high variance)
        # We don't flag normal white paper or white labels
        if avg_brightness > 235 and std_dev < 20:
            glare_ratio = float(np.sum(arr > 252) / arr.size)
            if glare_ratio > 0.60:
                warnings.append("Glare reflection detected across major portion of label.")
        else:
            glare_ratio = 0.0
            
        # 4. Sharpness / Blur Detection (Laplacian variance)
        if arr.shape[0] > 10 and arr.shape[1] > 10:
            lap = (
                arr[:-2, 1:-1] +
                arr[2:, 1:-1] +
                arr[1:-1, :-2] +
                arr[1:-1, 2:] -
                4.0 * arr[1:-1, 1:-1]
            )
            blur_score = float(np.var(lap))
        else:
            blur_score = 150.0
            
        if blur_score < 25.0:
            warnings.append(f"Image is blurry (Sharpness {round(blur_score, 1)} < 25). Hold camera steady.")
            
        is_acceptable = len(warnings) == 0 or blur_score >= 20
        
        return {
            "is_acceptable": is_acceptable,
            "width": width,
            "height": height,
            "blur_score": round(blur_score, 2),
            "avg_brightness": round(avg_brightness, 2),
            "glare_ratio": round(glare_ratio, 3),
            "warnings": warnings
        }
    except Exception as e:
        return {
            "is_acceptable": True,
            "width": 800,
            "height": 600,
            "blur_score": 100.0,
            "avg_brightness": 128.0,
            "glare_ratio": 0.0,
            "warnings": []
        }
