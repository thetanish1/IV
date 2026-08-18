from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.shared.database import get_db
from app.shared.security import verify_password, create_access_token, get_password_hash
from app.shared.exceptions import UnauthorizedException
from app.shared.dependencies import get_current_admin
from app.auth.models import Admin
from app.auth.schemas import Token, AdminResponse
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise UnauthorizedException("Incorrect email or password")
    token = create_access_token(data={"sub": admin.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=AdminResponse)
def get_me(current_admin: Admin = Depends(get_current_admin)):
    return current_admin


# ─── Google Sign-In ─────────────────────────────────────────────────────────

class GoogleLoginRequest(BaseModel):
    credential: str  # Google ID token (JWT) from the Google Identity Services button

@router.post("/google", response_model=Token)
def google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Accepts a Google Identity Services credential (ID token),
    verifies it server-side, then either finds or creates an admin
    account. The default password for auto-created accounts is the
    user's Google email address itself.
    """
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        # Verify the Google ID token
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
        idinfo = id_token.verify_oauth2_token(
            body.credential,
            google_requests.Request(),
            client_id
        )
    except Exception as e:
        raise UnauthorizedException(f"Google token verification failed: {str(e)}")

    email: str = idinfo.get("email", "")
    name: str = idinfo.get("name", email.split("@")[0])

    if not email:
        raise UnauthorizedException("Could not retrieve email from Google token")

    # Find or auto-create admin using email as default password
    admin = db.query(Admin).filter(Admin.email == email).first()
    if not admin:
        admin = Admin(
            email=email,
            hashed_password=get_password_hash(email),   # default password = google email
            full_name=name,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    token = create_access_token(data={"sub": admin.email})
    return {"access_token": token, "token_type": "bearer"}
