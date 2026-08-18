from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.shared.security import decode_access_token
from app.shared.exceptions import UnauthorizedException
from app.auth.models import Admin

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Admin:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise UnauthorizedException("Invalid or expired token")
    admin = db.query(Admin).filter(Admin.email == payload["sub"], Admin.is_active == True).first()
    if not admin:
        raise UnauthorizedException("Admin user not found or inactive")
    return admin
