from typing import Dict, Any
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.shared.dependencies import require_permission
from app.shared.settings_models import SiteSetting
from app.auth.models import Admin

router = APIRouter(prefix="/admin/settings", tags=["admin-settings"])

DEFAULT_SETTINGS = {
    "show_courses": "false",
    "show_careers": "false",
}

@router.get("")
def get_site_settings(db: Session = Depends(get_db)):
    """Public/Admin endpoint to fetch platform feature switch flags."""
    settings_dict = dict(DEFAULT_SETTINGS)
    try:
        db_settings = db.query(SiteSetting).all()
        for s in db_settings:
            settings_dict[s.key] = s.value
    except Exception:
        pass

    return {
        "show_courses": settings_dict.get("show_courses", "false").lower() == "true",
        "show_careers": settings_dict.get("show_careers", "false").lower() == "true",
    }


@router.patch("")
def update_site_settings(
    body: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("settings"))
):
    """Admin endpoint to update platform feature switches."""
    for key, val in body.items():
        if key in ("show_courses", "show_careers"):
            str_val = "true" if val is True or str(val).lower() == "true" else "false"
            setting_row = db.query(SiteSetting).filter(SiteSetting.key == key).first()
            if setting_row:
                setting_row.value = str_val
            else:
                db.add(SiteSetting(key=key, value=str_val))
    db.commit()

    return get_site_settings(db)
