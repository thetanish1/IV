from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.shared.dependencies import (
    get_current_admin,
    require_super_admin,
    require_permission,
    ROLE_PERMISSIONS_MAP,
)
from app.shared.security import get_password_hash
from app.shared.email_service import send_sub_admin_provisioned_email
from app.auth.models import Admin
from app.auth.schemas import AdminCreateBody, AdminUpdateBody

router = APIRouter(prefix="/admin", tags=["admin-iam"])

@router.get("/me")
def get_current_admin_profile(
    current_admin: Admin = Depends(get_current_admin)
):
    """Returns the authenticated admin profile with active role and granted permissions."""
    role = current_admin.role or "super_admin"
    permissions = current_admin.permissions or ROLE_PERMISSIONS_MAP.get(role.lower(), [])
    is_super = role.lower() == "super_admin"

    return {
        "id": current_admin.id,
        "email": current_admin.email,
        "full_name": current_admin.full_name,
        "role": role,
        "permissions": permissions,
        "is_super_admin": is_super,
        "is_active": bool(current_admin.is_active),
        "created_at": current_admin.created_at.isoformat() if current_admin.created_at else None,
    }


@router.get("/admins")
def list_sub_admins(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("settings"))
):
    """Lists all admin and sub-admin accounts with their roles and module access."""
    admins = db.query(Admin).order_by(Admin.id.asc()).all()
    return [
        {
            "id": a.id,
            "email": a.email,
            "full_name": a.full_name,
            "role": a.role or "super_admin",
            "permissions": a.permissions or ROLE_PERMISSIONS_MAP.get((a.role or "super_admin").lower(), []),
            "is_active": bool(a.is_active),
            "created_by": a.created_by,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None,
        }
        for a in admins
    ]


@router.post("/admins")
def create_sub_admin_account(
    body: AdminCreateBody,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_super_admin)
):
    """Super Admin creates a new sub-admin account with assigned roles & permissions and sends automated credentials email."""
    clean_email = body.email.strip().lower()
    if not clean_email or not body.password or not body.full_name.strip():
        raise HTTPException(status_code=400, detail="Name, email, and password are required.")

    existing = db.query(Admin).filter(Admin.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Admin account with email '{clean_email}' already exists.")

    role_lower = body.role.strip().lower()
    permissions = body.permissions or []

    if role_lower in ROLE_PERMISSIONS_MAP and (not permissions or len(permissions) == 0):
        permissions = ROLE_PERMISSIONS_MAP[role_lower]

    new_admin = Admin(
        email=clean_email,
        hashed_password=get_password_hash(body.password),
        full_name=body.full_name.strip(),
        role=role_lower,
        permissions=permissions,
        is_active=True,
        created_by=current_admin.email,
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    # Automatically dispatch administrative onboarding & credentials email to the specified email textbox
    background_tasks.add_task(
        send_sub_admin_provisioned_email,
        admin_email=new_admin.email,
        admin_name=new_admin.full_name,
        role=new_admin.role,
        temporary_password=body.password,
        permissions=new_admin.permissions or [],
        created_by=current_admin.full_name or current_admin.email
    )

    return {
        "success": True,
        "message": f"Sub-Admin account for '{new_admin.full_name}' created successfully. Onboarding email sent to {new_admin.email}.",
        "admin": {
            "id": new_admin.id,
            "email": new_admin.email,
            "full_name": new_admin.full_name,
            "role": new_admin.role,
            "permissions": new_admin.permissions,
            "is_active": new_admin.is_active,
            "created_at": new_admin.created_at.isoformat() if new_admin.created_at else None,
        }
    }


@router.patch("/admins/{admin_id}")
def update_sub_admin_account(
    admin_id: int,
    body: AdminUpdateBody,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_super_admin)
):
    """Super Admin updates sub-admin details, role, permissions, password, or active status."""
    admin_obj = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin_obj:
        raise HTTPException(status_code=404, detail="Sub-Admin account not found.")

    if body.full_name is not None and body.full_name.strip():
        admin_obj.full_name = body.full_name.strip()

    if body.role is not None and body.role.strip():
        role_lower = body.role.strip().lower()
        admin_obj.role = role_lower
        if body.permissions is None and role_lower in ROLE_PERMISSIONS_MAP:
            admin_obj.permissions = ROLE_PERMISSIONS_MAP[role_lower]

    if body.permissions is not None:
        admin_obj.permissions = body.permissions

    if body.is_active is not None:
        # Protect against self-deactivation or primary admin deactivation
        if admin_obj.id == current_admin.id and not body.is_active:
            raise HTTPException(status_code=400, detail="You cannot revoke your own Super Admin access.")
        admin_obj.is_active = body.is_active

    if body.password is not None and body.password.strip():
        admin_obj.hashed_password = get_password_hash(body.password.strip())

    admin_obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(admin_obj)

    return {
        "success": True,
        "message": f"Sub-Admin account '{admin_obj.full_name}' updated successfully.",
        "admin": {
            "id": admin_obj.id,
            "email": admin_obj.email,
            "full_name": admin_obj.full_name,
            "role": admin_obj.role,
            "permissions": admin_obj.permissions,
            "is_active": admin_obj.is_active,
            "updated_at": admin_obj.updated_at.isoformat() if admin_obj.updated_at else None,
        }
    }


@router.delete("/admins/{admin_id}")
def delete_sub_admin_account(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_super_admin)
):
    """Super Admin permanently deletes a sub-admin account."""
    if admin_id == current_admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own active Super Admin account.")

    admin_obj = db.query(Admin).filter(Admin.id == admin_id).first()
    if admin_obj.role == "super_admin" and admin_obj.created_by is None:
        raise HTTPException(status_code=400, detail="Primary root Super Admin accounts cannot be deleted.")

    db.delete(admin_obj)
    db.commit()

    return {
        "success": True,
        "message": f"Sub-Admin account '{admin_obj.full_name}' ({admin_obj.email}) deleted successfully."
    }
