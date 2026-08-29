"""
barcode_service.py — Barcode lookup for METROLOGY-AI.

Priority:
  1. Open Food Facts API (free, no key, huge Indian FMCG database)
  2. UPC Item DB API (free, no key)
  3. Small local GS1 fallback for known Indian products
"""

import re
import httpx
from typing import Dict, Any

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
