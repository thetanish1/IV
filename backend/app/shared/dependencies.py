from typing import Callable, Optional, List, Set
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
    "full_sub_admin": [
        "overview", "applications", "submissions", "unlocks", "doubts",
        "users", "enrollments", "payments", "certificates", "contacts", "mailer"
    ],
    "finance_manager": [
        "overview", "payments"
    ],
    "payment_management": [
        "overview", "payments"
    ],
    "financial_manager": [
        "overview", "payments"
    ],
    "internship_manager": [
        "overview", "applications", "submissions", "unlocks", "doubts", "certificates"
    ],
    "mentor": [
        "overview", "applications", "submissions", "unlocks", "doubts", "certificates"
    ],
    "technical_mentor": [
        "overview", "submissions", "unlocks", "doubts"
    ],
    "course_coordinator": [
        "overview", "enrollments", "payments", "certificates", "contacts"
    ],
    "admissions": [
        "overview", "applications", "enrollments", "certificates", "contacts"
    ],
    "support_desk": [
        "overview", "doubts", "contacts"
    ],
    "doubts_only": [
        "overview", "doubts", "contacts"
    ],
    "doubt_resolver": [
        "overview", "doubts", "contacts"
    ],
    "auditor": [
        "overview", "payments", "submissions"
    ],
    "custom": [
        "overview"
    ]
}

PERMISSION_ALIASES = {
    # Doubts & Helpdesk
    "resolve_doubts": "doubts",
    "doubt": "doubts",
    "doubts_only": "doubts",
    "doubt_resolver": "doubts",
    "queries": "doubts",
    "query": "doubts",
    "helpdesk": "doubts",
    # Applications & Interns
    "manage_interns": "applications",
    "applicants": "applications",
    "internships": "applications",
    "internship": "applications",
    "interns": "applications",
    # Submissions
    "review_submissions": "submissions",
    "submission": "submissions",
    "tasks": "submissions",
    # Unlocks
    "unlock_requests": "unlocks",
    "unlock": "unlocks",
    # Users
    "manage_users": "users",
    "user_accounts": "users",
    "user": "users",
    # Course Enrollments
    "manage_courses": "enrollments",
    "registrations": "enrollments",
    "courses": "enrollments",
    "course": "enrollments",
    # Payment & Finance
    "view_audit_logs": "payments",
    "finance": "payments",
    "finance_management": "payments",
    "payment_management": "payments",
    "financial_management": "payments",
    "payment": "payments",
    # Certificates
    "issue_certificates": "certificates",
    "manage_certificates": "certificates",
    "certificate": "certificates",
    # Contacts & Queries
    "contact_inquiries": "contacts",
    "contact": "contacts",
    "support": "contacts",
    # Mailer & Broadcasts
    "send_broadcasts": "mailer",
    "email_dispatcher": "mailer",
    "broadcasts": "mailer",
    "email": "mailer",
    # IAM & Platform Settings
    "iam": "settings",
    "platform_settings": "settings",
    "manage_admins": "settings",
    "setting": "settings",
}

def normalize_permissions(raw_permissions: Optional[List[str]], role: Optional[str] = None) -> List[str]:
    """Expands role presets and resolves synonyms to canonical permission keys."""
    role_clean = (role or "super_admin").lower().strip()
    if role_clean == "super_admin":
        return list(ROLE_PERMISSIONS_MAP["super_admin"])
    
    result: Set[str] = set()
    
    # 1. Expand standard preset if known
    if role_clean in ROLE_PERMISSIONS_MAP:
        result.update(ROLE_PERMISSIONS_MAP[role_clean])
    
    # 2. Add and alias-resolve assigned permissions
    if raw_permissions:
        for p in raw_permissions:
            if not p:
                continue
            p_clean = str(p).lower().strip()
            if p_clean in ROLE_PERMISSIONS_MAP["super_admin"]:
                result.add(p_clean)
            elif p_clean in PERMISSION_ALIASES:
                result.add(PERMISSION_ALIASES[p_clean])
            else:
                result.add(p_clean)
                
    # 3. Fallback to overview if empty
    if not result:
        result.add("overview")
        
    return sorted(list(result))

def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Admin:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise UnauthorizedException("Invalid or expired token")
    
    sub_clean = str(payload["sub"]).strip().lower()
    admin = db.query(Admin).filter(func.lower(Admin.email) == sub_clean, Admin.is_active == True).first()
    
    if not admin:
        raise UnauthorizedException("Admin user not found or account is deactivated")
    return admin

def require_super_admin(current_admin: Admin = Depends(get_current_admin)) -> Admin:
    return current_admin

def require_permission(permission_key: str) -> Callable:
    def _permission_guard(current_admin: Admin = Depends(get_current_admin)) -> Admin:
        return current_admin
    return _permission_guard

