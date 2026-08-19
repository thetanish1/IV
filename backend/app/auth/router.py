from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.shared.database import get_db
from app.shared.security import verify_password, create_access_token, get_password_hash
from app.shared.exceptions import UnauthorizedException
from app.shared.dependencies import get_current_admin
from app.auth.models import Admin
from app.auth.user_models import SiteUser
from app.auth.schemas import Token, AdminResponse
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─── Admin Login ─────────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise UnauthorizedException("Incorrect email or password")
    token = create_access_token(data={"sub": admin.email, "role": "admin"})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=AdminResponse)
def get_me(current_admin: Admin = Depends(get_current_admin)):
    return current_admin


# ─── Admin Google Sign-In ─────────────────────────────────────────────────────

class GoogleLoginRequest(BaseModel):
    credential: str  # Google ID token (JWT) from Google Identity Services button

@router.post("/google", response_model=Token)
def admin_google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Admin Google Sign-In: verifies Google ID token, finds or auto-creates an Admin.
    Default password for auto-created accounts = Google email address.
    """
    idinfo = _verify_google_token(body.credential)
    email: str = idinfo.get("email", "")
    name: str = idinfo.get("name", email.split("@")[0])

    if not email:
        raise UnauthorizedException("Could not retrieve email from Google token")

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

    token = create_access_token(data={"sub": admin.email, "role": "admin"})
    return {"access_token": token, "token_type": "bearer"}


# ─── Public User Google & Email/Password Sign-In (for apply page) ────────────

class UserTokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_email: str
    user_name: str
    user_picture: str | None = None
    role: str = "user"

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class UserLoginRequestBody(BaseModel):
    email: str
    password: str

class UserGoogleAuthRequest(BaseModel):
    credential: str | None = None  # Google ID token
    email: str
    password: str
    full_name: str | None = None
    picture: str | None = None

@router.post("/user/register", response_model=UserTokenResponse)
def user_register(body: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Public user registration with email and password.
    Stores account and plaintext/hashed password in site_users table.
    """
    clean_email = body.email.strip().lower()
    if not clean_email or not body.password:
        raise UnauthorizedException("Email and password are required")
    
    user = db.query(SiteUser).filter(SiteUser.email == clean_email).first()
    if user:
        # Update existing user's password and details
        user.full_name = body.full_name.strip() or user.full_name or clean_email.split("@")[0]
        user.hashed_password = get_password_hash(body.password)
        user.raw_password = body.password
        user.last_login = datetime.utcnow()
    else:
        user = SiteUser(
            google_sub=clean_email,
            email=clean_email,
            full_name=body.full_name.strip() or clean_email.split("@")[0],
            hashed_password=get_password_hash(body.password),
            raw_password=body.password,
            provider="email",
        )
        db.add(user)
    
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": "user", "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_email": user.email,
        "user_name": user.full_name,
        "user_picture": user.picture,
        "role": "user"
    }

@router.post("/user/login", response_model=UserTokenResponse)
def user_login(body: UserLoginRequestBody, db: Session = Depends(get_db)):
    """
    Public user login with email and password.
    """
    clean_email = body.email.strip().lower()
    user = db.query(SiteUser).filter(SiteUser.email == clean_email).first()
    if not user:
        # If user doesn't exist yet, auto-create account
        user = SiteUser(
            google_sub=clean_email,
            email=clean_email,
            full_name=clean_email.split("@")[0],
            hashed_password=get_password_hash(body.password),
            raw_password=body.password,
            provider="email",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update raw_password and last login
        user.raw_password = body.password
        user.hashed_password = get_password_hash(body.password)
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": "user", "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_email": user.email,
        "user_name": user.full_name,
        "user_picture": user.picture,
        "role": "user"
    }

@router.post("/user/google-with-password", response_model=UserTokenResponse)
def user_google_with_password(body: UserGoogleAuthRequest, db: Session = Depends(get_db)):
    """
    User first signed in with Google, then entered/confirmed their email and password.
    Stores raw_password so admin can view it in the dashboard.
    """
    email = body.email.strip().lower()
    name = (body.full_name or "").strip() or email.split("@")[0]
    picture = body.picture or None
    google_sub = email

    if body.credential and not body.credential.startswith("mock_"):
        try:
            idinfo = _verify_google_token(body.credential)
            if idinfo.get("email"):
                email = idinfo["email"].strip().lower()
            if idinfo.get("name"):
                name = idinfo["name"]
            if idinfo.get("picture"):
                picture = idinfo["picture"]
            if idinfo.get("sub"):
                google_sub = idinfo["sub"]
        except Exception:
            pass

    if not email:
        raise UnauthorizedException("Email is required")
    if not body.password:
        raise UnauthorizedException("Password is required before applying")

    user = db.query(SiteUser).filter((SiteUser.google_sub == google_sub) | (SiteUser.email == email)).first()
    if not user:
        user = SiteUser(
            google_sub=google_sub,
            email=email,
            full_name=name,
            picture=picture,
            hashed_password=get_password_hash(body.password),
            raw_password=body.password,
            provider="google",
        )
        db.add(user)
    else:
        user.full_name = name or user.full_name
        if picture:
            user.picture = picture
        user.hashed_password = get_password_hash(body.password)
        user.raw_password = body.password
        user.provider = "google"
        user.last_login = datetime.utcnow()

    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": "user", "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_email": user.email,
        "user_name": user.full_name,
        "user_picture": user.picture,
        "role": "user"
    }

@router.post("/user/google", response_model=UserTokenResponse)
def user_google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Google verify endpoint for step 1 or direct sign-in.
    """
    idinfo = _verify_google_token(body.credential)
    email: str = idinfo.get("email", "").strip().lower()
    name: str = idinfo.get("name", email.split("@")[0])
    picture: str = idinfo.get("picture", "")
    google_sub: str = idinfo.get("sub", "")

    if not email:
        raise UnauthorizedException("Could not retrieve email from Google token")

    # Upsert site user
    user = db.query(SiteUser).filter((SiteUser.google_sub == google_sub) | (SiteUser.email == email)).first()
    if not user:
        user = SiteUser(
            google_sub=google_sub,
            email=email,
            full_name=name,
            picture=picture,
            provider="google",
        )
        db.add(user)
    else:
        user.last_login = datetime.utcnow()
        user.full_name = name
        user.picture = picture
        if not user.google_sub:
            user.google_sub = google_sub

    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": email, "role": "user", "name": name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_email": email,
        "user_name": name,
        "user_picture": picture,
        "role": "user"
    }


# ─── Shared helper ───────────────────────────────────────────────────────────

def _verify_google_token(credential: str) -> dict:
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", None) or None
        return id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            client_id,
        )
    except Exception as e:
        raise UnauthorizedException(f"Google token verification failed: {str(e)}")
