from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.shared.security import verify_password, create_access_token
from app.shared.exceptions import UnauthorizedException
from app.shared.dependencies import get_current_admin
from app.auth.models import Admin
from app.auth.schemas import Token, AdminResponse

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
