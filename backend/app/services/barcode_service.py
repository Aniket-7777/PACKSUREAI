"""
barcode_service.py — Barcode lookup for METROLOGY-AI.

Priority:
  1. Open Food Facts API (free, no key, huge Indian FMCG database)
  2. UPC Item DB API (free, no key)
  3. Small local GS1 fallback for known Indian products
"""

import re
import httpx
from typing import Dict, Any, Optional, List, Tuple, Union

# ─────────────────────────────────────────────────────────────────────────────
# Local fallback — only used when both APIs are unreachable
# ─────────────────────────────────────────────────────────────────────────────
_LOCAL_DB: Dict[str, Dict] = {
    "8901030383842": {
        "brand": "Tata Consumer Products Ltd",
        "product": "Tata Salt Vacuum Evaporated Iodised Salt",
        "category": "Food & Grocery",
        "manufacturer_address": "Tata Chemicals Limited, Leelanagar, Mithapur, Gujarat - 361345",
        "net_quantity": "1 kg",
        "mrp": None,
        "country_of_origin": "Made in India",
    },
    "8901262010053": {
        "brand": "Amul",
        "product": "Amul Pasteurised Butter",
        "category": "Dairy",
        "manufacturer_address": "Gujarat Co-operative Milk Marketing Federation Ltd, Anand - 388001",
        "net_quantity": "500 g",
        "mrp": None,
        "country_of_origin": "Made in India",
    },
    "8901491101837": {
        "brand": "Nestle India",
        "product": "Maggi 2-Minute Noodles",
        "category": "Instant Foods",
        "manufacturer_address": "Nestle India Ltd, World Trade Centre, Barakhamba Lane, New Delhi",
        "net_quantity": "70 g",
        "mrp": None,
        "country_of_origin": "Made in India",
    },
    "8901063012016": {
        "brand": "Britannia Industries",
        "product": "Britannia Good Day Butter Cookies",
        "category": "Bakery",
        "manufacturer_address": "Britannia Industries Ltd, 5/1A Hungerford Street, Kolkata - 700017",
        "net_quantity": "100 g",
        "mrp": None,
        "country_of_origin": "Made in India",
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# Public entry point
# ─────────────────────────────────────────────────────────────────────────────

def lookup_barcode(barcode_str: str) -> Dict[str, Any]:
    """
    Looks up a barcode number and returns structured product metadata.

    Returns a dict with keys:
      barcode, product, brand, category, net_quantity, mrp,
      manufacturer_address, country_of_origin, ingredients,
      consumer_care_details, source, is_registered_gs1
    """
    if not barcode_str:
        return {}

    clean = re.sub(r"[^0-9]", "", str(barcode_str).strip())
    if not clean:
        return {}

    # 1. Open Food Facts (best coverage for Indian FMCG)
    result = _lookup_open_food_facts(clean)
    if result:
        result["barcode"] = clean
        result["is_registered_gs1"] = clean.startswith("890")
        return result

    # 2. UPC Item DB fallback
    result = _lookup_upc_item_db(clean)
    if result:
        result["barcode"] = clean
        result["is_registered_gs1"] = clean.startswith("890")
        return result

    # 3. Local DB fallback
    if clean in _LOCAL_DB:
        data = _LOCAL_DB[clean].copy()
        data["barcode"] = clean
        data["is_registered_gs1"] = True
        data["source"] = "local_gs1"
        return data

    # 4. Nothing found — return minimal stub so caller knows barcode was attempted
    return {
        "barcode": clean,
        "is_registered_gs1": clean.startswith("890"),
        "source": "not_found",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Source 1: Open Food Facts
# ─────────────────────────────────────────────────────────────────────────────

def _lookup_open_food_facts(barcode: str) -> Dict[str, Any] | None:
    """
    Queries the Open Food Facts open database.
    Free, no API key, covers millions of products worldwide including Indian FMCG.
    Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
    """
    url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    try:
        resp = httpx.get(url, timeout=6.0, headers={"User-Agent": "PackSureAI/1.0"})
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get("status") != 1:
            return None

        p = data.get("product", {})

        # Product name
        product = (
            p.get("product_name_en")
            or p.get("product_name")
            or p.get("abbreviated_product_name")
            or ""
        ).strip()

        # Brand
        brand = (p.get("brands") or "").strip()

        # Net quantity
        net_qty = (p.get("quantity") or "").strip()

        # Category — map OFF taxonomy to our categories
        categories_raw = p.get("categories_tags", [])
        category = _map_off_category(categories_raw)

        # Manufacturer / packager address
        manufacturer = (
            p.get("manufacturing_places")
            or p.get("producer")
            or p.get("packager_codes")
            or ""
        )
        if isinstance(manufacturer, list):
            manufacturer = ", ".join(manufacturer)
        manufacturer = manufacturer.strip()

        # Country of origin
        origins = p.get("origins") or p.get("countries") or "Made in India"

        # Ingredients (useful for generic name derivation)
        ingredients = (p.get("ingredients_text_en") or p.get("ingredients_text") or "").strip()

        # Generic/common name
        generic_name = (
            p.get("generic_name_en")
            or p.get("generic_name")
            or ""
        ).strip()

        # MRP is never on OFF — Indian MRP is not in global databases
        mrp = None

        if not product and not brand:
            return None

        return {
            "product": product or brand,
            "brand": brand,
            "category": category,
            "net_quantity": net_qty or None,
            "mrp": mrp,
            "manufacturer_address": manufacturer or None,
            "country_of_origin": origins or "Made in India",
            "generic_name": generic_name or None,
            "ingredients": ingredients or None,
            "consumer_care_details": None,   # Not available in OFF
            "source": "open_food_facts",
        }

    except Exception as e:
        print(f"[Barcode] Open Food Facts error for {barcode}: {e}")
        return None


def _map_off_category(tags: list) -> str:
    """Maps Open Food Facts category tags to METROLOGY-AI categories."""
    tag_str = " ".join(tags).lower()
    if any(k in tag_str for k in ["dairy", "milk", "cheese", "butter", "curd", "yogurt"]):
        return "Dairy"
    if any(k in tag_str for k in ["beverage", "drink", "juice", "water", "soda", "cola"]):
        return "Beverages"
    if any(k in tag_str for k in ["snack", "chip", "namkeen", "biscuit", "cookie", "cracker"]):
        return "Snacks & Biscuits"
    if any(k in tag_str for k in ["instant", "noodle", "pasta", "cereal", "breakfast"]):
        return "Instant Foods"
    if any(k in tag_str for k in ["spice", "masala", "condiment", "sauce", "oil", "ghee"]):
        return "Spices & Condiments"
    if any(k in tag_str for k in ["personal-care", "cosmetic", "shampoo", "soap", "detergent"]):
        return "Personal Care"
    if any(k in tag_str for k in ["household", "cleaning", "hygiene"]):
        return "Household"
    return "Food & Grocery"


# ─────────────────────────────────────────────────────────────────────────────
# Source 2: UPC Item DB
# ─────────────────────────────────────────────────────────────────────────────

def _lookup_upc_item_db(barcode: str) -> Dict[str, Any] | None:
    """
    Queries the free UPC Item DB API.
    Good for products not in Open Food Facts.
    Docs: https://www.upcitemdb.com/api/explorer#!/lookup
    """
    url = f"https://api.upcitemdb.com/prod/trial/lookup?upc={barcode}"
    try:
        resp = httpx.get(url, timeout=5.0, headers={"User-Agent": "PackSureAI/1.0"})
        if resp.status_code != 200:
            return None
        data = resp.json()
        items = data.get("items", [])
        if not items:
            return None

        item = items[0]
        product = item.get("title", "").strip()
        brand   = item.get("brand", "").strip()
        desc    = item.get("description", "").strip()
        size    = item.get("size", "").strip()

        if not product and not brand:
            return None

        return {
            "product": product or brand,
            "brand": brand or None,
            "category": "Food & Grocery",
            "net_quantity": size or None,
            "mrp": None,
            "manufacturer_address": None,
            "country_of_origin": "Made in India",
            "generic_name": desc[:80] if desc else None,
            "ingredients": None,
            "consumer_care_details": None,
            "source": "upc_item_db",
        }

    except Exception as e:
        print(f"[Barcode] UPC Item DB error for {barcode}: {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Optical Barcode Decoder from Image / Video Frame
# ─────────────────────────────────────────────────────────────────────────────

def _extract_barcode_via_gemini_vision(image_bytes: bytes) -> Optional[str]:
    from app.core.config import settings
    if not settings.GEMINI_API_KEY:
        return None
    try:
        from google import genai
        from google.genai import types
        import json
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = (
            "You are an optical barcode reader. Scan this product packaging or camera frame. "
            "Locate any 1D barcode (EAN-13, UPC-A, UPC-E, Code-128) or 2D QR code. "
            "Extract the exact numerical barcode value (e.g. 13-digit EAN starting with 890 or other UPC). "
            "Respond ONLY with valid JSON: {\"barcode\": \"8901234567890\"} or {\"barcode\": null}"
        )
        contents = [
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
            prompt
        ]
        for model_name in ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-flash-latest"]:
            try:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.0
                    )
                )
                if resp and resp.text:
                    parsed = json.loads(resp.text.strip())
                    code = parsed.get("barcode")
                    if code:
                        clean = re.sub(r"[^0-9a-zA-Z]", "", str(code))
                        if len(clean) >= 6:
                            return clean
                    break
            except Exception:
                continue
    except Exception as e:
        print(f"[Barcode Service] Gemini vision barcode error: {e}")
    return None


def _extract_barcode_via_ocr_digits(img_mat) -> Optional[str]:
    try:
        import pytesseract
        import cv2
        gray = cv2.cvtColor(img_mat, cv2.COLOR_BGR2GRAY) if len(img_mat.shape) == 3 else img_mat
        text = pytesseract.image_to_string(gray, config="--psm 6 -c tessedit_char_whitelist=0123456789")
        cleaned_text = re.sub(r"\s+", "", text)
        matches = re.findall(r"(890\d{10}|\d{12,14}|\d{8})", cleaned_text)
        if matches:
            return matches[0]
    except Exception:
        pass
    return None


def decode_barcode_from_image_bytes(image_bytes: bytes) -> Dict[str, Any]:
    """
    Multi-Tier Optical Barcode Engine:
    Tier 1: High-Speed OpenCV BarcodeDetector & QRCodeDetector with CLAHE and rotations
    Tier 2: Tesseract Numeric Line OCR for printed digits below barcode
    Tier 3: Google Gemini Multimodal Vision AI for complex, curved, or low-light packaging
    """
    import cv2
    import numpy as np

    if not image_bytes or len(image_bytes) < 100:
        return {"success": False, "barcode": None, "error": "Empty image payload"}

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"success": False, "barcode": None, "error": "Invalid image format"}

    bd = cv2.barcode.BarcodeDetector() if hasattr(cv2, 'barcode') and hasattr(cv2.barcode, 'BarcodeDetector') else None
    qd = cv2.QRCodeDetector()

    candidates = []

    def try_detect(frame_mat):
        if bd:
            try:
                info, b_type, points = bd.detectAndDecode(frame_mat)
                if info and str(info).strip():
                    return str(info).strip(), str(b_type or "1D_BARCODE")
            except Exception:
                pass
        try:
            q_info, q_pts, _ = qd.detectAndDecode(frame_mat)
            if q_info and str(q_info).strip():
                return str(q_info).strip(), "QR_CODE"
        except Exception:
            pass
        return None

    # Pass 1: Original Image
    res = try_detect(img)
    if res:
        candidates.append(res)

    if not candidates:
        # Pass 2: Grayscale + CLAHE
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        res = try_detect(gray)
        if res:
            candidates.append(res)
        else:
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)
            res = try_detect(enhanced)
            if res:
                candidates.append(res)

    if not candidates:
        # Pass 3: Center Crop (Zoomed Region of Interest)
        h, w = img.shape[:2]
        crop_y1, crop_y2 = int(h * 0.15), int(h * 0.85)
        crop_x1, crop_x2 = int(w * 0.1), int(w * 0.9)
        center_crop = img[crop_y1:crop_y2, crop_x1:crop_x2]
        res = try_detect(center_crop)
        if res:
            candidates.append(res)

    if not candidates:
        # Pass 4: Rotations
        for rot in [cv2.ROTATE_90_CLOCKWISE, cv2.ROTATE_90_COUNTERCLOCKWISE]:
            rotated = cv2.rotate(img, rot)
            res = try_detect(rotated)
            if res:
                candidates.append(res)
                break

    if not candidates:
        # Pass 5: Tesseract Numeric OCR
        ocr_code = _extract_barcode_via_ocr_digits(img)
        if ocr_code:
            candidates.append((ocr_code, "EAN_13_OCR"))

    if not candidates:
        # Pass 6: Gemini Multimodal Vision AI Optical Decoder
        ai_code = _extract_barcode_via_gemini_vision(image_bytes)
        if ai_code:
            candidates.append((ai_code, "GEMINI_VISION_AI"))

    if candidates:
        raw_code, b_type = candidates[0]
        clean_code = re.sub(r"[^0-9a-zA-Z]", "", raw_code)
        lookup_data = lookup_barcode(clean_code)
        return {
            "success": True,
            "barcode": clean_code,
            "barcode_type": b_type,
            "data": lookup_data
        }

    return {
        "success": False,
        "barcode": None,
        "error": "No clear barcode detected in this frame. Please hold barcode inside the center reticle or select a preset."
    }

