from typing import Callable, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.shared.database import get_db
from app.shared.security import decode_access_token
from app.shared.exceptions import UnauthorizedException
from app.auth.models import Admin

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

ROLE_PERMISSIONS_MAP = {
    "super_admin": [
        "overview", "applications", "submissions", "unlocks", "doubts",
        "users", "enrollments", "payments", "certificates", "contacts",
        "mailer", "settings"
    ],
    "internship_manager": [
        "overview", "applications", "submissions", "unlocks", "doubts", "certificates"
    ],
    "technical_mentor": [
        "submissions", "unlocks", "doubts"
    ],
    "course_coordinator": [
        "overview", "enrollments", "payments", "certificates"
    ],
    "support_desk": [
        "doubts", "contacts"
    ],
    "custom": [
        "overview"
    ]
}

def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Admin:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise UnauthorizedException("Invalid or expired token")
    admin = db.query(Admin).filter(Admin.email == payload["sub"], Admin.is_active == True).first()
    if not admin:
        raise UnauthorizedException("Admin user not found or inactive")
    return admin

def require_super_admin(current_admin: Admin = Depends(get_current_admin)) -> Admin:
    if (current_admin.role or "").lower() != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin privilege required to perform this action."
        )
    return current_admin

def require_permission(permission_key: str) -> Callable:
    def _permission_guard(current_admin: Admin = Depends(get_current_admin)) -> Admin:
        role = (current_admin.role or "super_admin").lower()
        if role == "super_admin":
            return current_admin
        
        assigned_permissions = current_admin.permissions or ROLE_PERMISSIONS_MAP.get(role, [])
        if permission_key not in assigned_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: You do not have permission to access the '{permission_key}' module."
            )
        return current_admin
    return _permission_guard

