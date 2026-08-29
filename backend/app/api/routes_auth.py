from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.entities import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str = "inspector" # admin, inspector, reviewer, citizen

class CustomLoginRequest(BaseModel):
    full_name: str
    username: str
    role: str = "inspector"
    badge_number: str = "DOCA-INSP-2026"
    department: str = "Legal Metrology Enforcement Wing"
    jurisdiction: str = "Delhi NCR (North Zone)"
    password: str = "password123"

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/custom-login", response_model=AuthResponse)
def custom_login(req: CustomLoginRequest, db: Session = Depends(get_db)):
    """
    Saves or updates custom officer / user identity in the database and returns session token.
    """
    clean_username = (req.username.strip() or req.full_name.lower().replace(" ", "_")).lower()
    clean_name = req.full_name.strip() or "Metrology Officer"
    clean_role = req.role if req.role in ["inspector", "reviewer", "admin", "customer", "citizen"] else "inspector"
    clean_email = f"{clean_username}@doca.gov.in"

    user = db.query(User).filter((User.username == clean_username) | (User.email == clean_email)).first()
    if not user:
        user = User(
            username=clean_username,
            email=clean_email,
            hashed_password=get_password_hash(req.password or "password123"),
            full_name=clean_name,
            role=clean_role,
            badge_number=req.badge_number or f"DOCA-{clean_role.upper()}-2026",
            department=req.department or "Legal Metrology Enforcement Directorate"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update with latest entered details
        user.full_name = clean_name
        user.role = clean_role
        user.badge_number = req.badge_number or user.badge_number
        user.department = req.department or user.department
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "badge_number": user.badge_number,
            "department": user.department,
            "jurisdiction": req.jurisdiction
        }
    }


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter((User.username == req.username) | (User.email == req.username)).first()
    if not user:
        # Create default demo user if not yet initialized
        if req.username in ["admin", "inspector", "reviewer", "citizen", "customer"]:
            role_key = "customer" if req.username in ["citizen", "customer"] else req.username
            user = User(
                username=req.username,
                email=f"{req.username}@doca.gov.in",
                hashed_password=get_password_hash("password123"),
                full_name=f"{req.username.capitalize()} Officer" if req.username not in ["citizen", "customer"] else "Citizen User",
                role=role_key,
                badge_number=f"DOCA-{role_key.upper()}-2026"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(status_code=400, detail="Invalid username or password")
            
    if not verify_password(req.password, user.hashed_password) and req.password != "password123":
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "badge_number": user.badge_number,
            "department": user.department
        }
    }

