from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ecommerce_scraper import audit_ecommerce_listing

router = APIRouter(prefix="/ecommerce", tags=["E-Commerce Marketplace Rule 6(10) Auditor"])

class EcommerceAuditRequest(BaseModel):
    url: str

@router.post("/audit-listing")
def audit_listing_url(req: EcommerceAuditRequest):
    """
    Audits e-commerce listings on Amazon, Flipkart, Blinkit, etc.,
    verifying compliance with Rule 6(10) mandatory declarations.
    """
    if not req.url or len(req.url.strip()) < 5:
        raise HTTPException(status_code=400, detail="Please provide a valid product URL")
    return audit_ecommerce_listing(req.url)
