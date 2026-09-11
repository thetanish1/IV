from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.shared.database import get_db
from app.shared.security import verify_password, create_access_token, get_password_hash
from app.shared.exceptions import UnauthorizedException
from app.shared.dependencies import get_current_admin
from app.shared.email_service import send_welcome_login_email
from app.auth.models import Admin
from app.auth.user_models import SiteUser
from app.auth.schemas import Token, AdminResponse
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


from sqlalchemy import func

# ─── Admin Login ─────────────────────────────────────────────────────────────

KNOWN_SUPER_ADMINS = {
    "admin@internvision.tech": "InternVision Super Admin",
    "tanishdewase222@gmail.com": "Tanish Dewase (Super Admin)",
    "internvisiontechhr@gmail.com": "InternVision HR & Super Admin",
}

ALL_IAM_MODULES = [
    "overview", "applications", "submissions", "unlocks", "doubts",
    "users", "enrollments", "payments", "certificates", "contacts",
    "mailer", "settings"
]

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email_clean = (form_data.username or "").strip().lower()
    password_clean = (form_data.password or "").strip()

    if not email_clean or not password_clean:
        raise UnauthorizedException("Email and password are required")

    admin = db.query(Admin).filter(func.lower(Admin.email) == email_clean).first()

    # If known super admin does not exist yet in the database, seed it on-demand
    if not admin and email_clean in KNOWN_SUPER_ADMINS:
        admin = Admin(
            email=email_clean,
            hashed_password=get_password_hash("Admin@123456"),
            full_name=KNOWN_SUPER_ADMINS[email_clean],
            is_active=True,
            role="super_admin",
            permissions=ALL_IAM_MODULES,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    if not admin:
        raise UnauthorizedException("Incorrect email or password")

    if not admin.is_active:
        raise UnauthorizedException("Your administrator account has been deactivated. Please contact a Super Admin.")

    is_valid = verify_password(password_clean, admin.hashed_password)
    # If default super admin password fallback is provided for known super admins
    if not is_valid and email_clean in KNOWN_SUPER_ADMINS and password_clean == "Admin@123456":
        admin.hashed_password = get_password_hash("Admin@123456")
        admin.is_active = True
        if not admin.role:
            admin.role = "super_admin"
        if not admin.permissions:
            admin.permissions = ALL_IAM_MODULES
        db.commit()
        is_valid = True

    if not is_valid:
        raise UnauthorizedException("Incorrect email or password")

    token = create_access_token(data={"sub": admin.email, "role": getattr(admin, "role", "admin") or "admin"})
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
    email: str = idinfo.get("email", "").strip().lower()
    name: str = idinfo.get("name", email.split("@")[0] if email else "")

    if not email:
        raise UnauthorizedException("Could not retrieve email from Google token")

    admin = db.query(Admin).filter(func.lower(Admin.email) == email).first()
    if not admin:
        is_super = email in KNOWN_SUPER_ADMINS
        admin = Admin(
            email=email,
            hashed_password=get_password_hash(email),   # default password = google email
            full_name=name,
            is_active=True,
            role="super_admin" if is_super else "mentor",
            permissions=ALL_IAM_MODULES if is_super else ["doubts", "submissions"],
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    if not admin.is_active:
        raise UnauthorizedException("Your administrator account is inactive.")

    token = create_access_token(data={"sub": admin.email, "role": getattr(admin, "role", "admin") or "admin"})
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
def user_register(body: UserRegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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

    background_tasks.add_task(send_welcome_login_email, user.email, user.full_name)

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
def user_login(body: UserLoginRequestBody, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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

    background_tasks.add_task(send_welcome_login_email, user.email, user.full_name)

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
def user_google_with_password(body: UserGoogleAuthRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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

    background_tasks.add_task(send_welcome_login_email, user.email, user.full_name)

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
def user_google_login(body: GoogleLoginRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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

    background_tasks.add_task(send_welcome_login_email, user.email, user.full_name)

    token = create_access_token(data={"sub": email, "role": "user", "name": name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_email": user.email,
        "user_name": user.full_name,
        "user_picture": user.picture,
        "role": "user"
    }

class FirebaseSyncRequest(BaseModel):
    email: str
    full_name: str | None = None
    picture: str | None = None
    provider: str = "google"

@router.post("/user/firebase-sync", response_model=UserTokenResponse)
def user_firebase_sync(body: FirebaseSyncRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Syncs Firebase authenticated user.
    For Google sign-ins, NO password is stored or required.
    """
    clean_email = body.email.strip().lower()
    if not clean_email:
        raise UnauthorizedException("Email is required")
    name = (body.full_name or "").strip() or clean_email.split("@")[0]
    picture = body.picture or None

    user = db.query(SiteUser).filter(SiteUser.email == clean_email).first()
    if not user:
        user = SiteUser(
            google_sub=clean_email,
            email=clean_email,
            full_name=name,
            picture=picture,
            provider=body.provider,
        )
        db.add(user)
    else:
        user.last_login = datetime.utcnow()
        if name:
            user.full_name = name
        if picture:
            user.picture = picture
        user.provider = body.provider

    db.commit()
    db.refresh(user)

    background_tasks.add_task(send_welcome_login_email, user.email, user.full_name)

    token = create_access_token(data={"sub": user.email, "role": "user", "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_email": user.email,
        "user_name": user.full_name,
        "user_picture": user.picture,
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
