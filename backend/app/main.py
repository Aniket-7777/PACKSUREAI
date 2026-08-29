import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings, UPLOAD_DIR, REPORT_DIR
from app.sample_data.seed import seed_database
from app.api import (
    routes_auth,
    routes_scan,
    routes_inspections,
    routes_rules,
    routes_ecommerce,
    routes_reports,
    routes_analytics,
    routes_audit
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Smart Legal Metrology (Packaged Commodities) Rules 2011 Compliance & Inspection Intelligence Platform (SIH Problem Statement SIH26034)"
)

# Configure CORS for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads and reports
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/reports", StaticFiles(directory=str(REPORT_DIR)), name="reports")

# Include Routers
app.include_router(routes_auth.router, prefix=settings.API_V1_STR)
app.include_router(routes_scan.router, prefix=settings.API_V1_STR)
app.include_router(routes_inspections.router, prefix=settings.API_V1_STR)
app.include_router(routes_rules.router, prefix=settings.API_V1_STR)
app.include_router(routes_ecommerce.router, prefix=settings.API_V1_STR)
app.include_router(routes_reports.router, prefix=settings.API_V1_STR)
app.include_router(routes_analytics.router, prefix=settings.API_V1_STR)
app.include_router(routes_audit.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    print("[INIT] Initializing METROLOGY-AI Intelligence Engine...")
    seed_database()
    print("[READY] Backend ready on http://127.0.0.1:8000")

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "METROLOGY-AI Core Engine",
        "legal_framework": "Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011",
        "department": "Ministry of Consumer Affairs, Food & Public Distribution",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
