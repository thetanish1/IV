from typing import Dict, Any
from fastapi import APIRouter, Depends, Body, Response
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
def get_site_settings(response: Response, db: Session = Depends(get_db)):
    """Public/Admin endpoint to fetch platform feature switch flags."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    settings_dict = dict(DEFAULT_SETTINGS)
    try:
        db_settings = db.query(SiteSetting).all()
        for s in db_settings:
            settings_dict[s.key] = s.value
    except Exception:
        pass

    show_courses_val = str(settings_dict.get("show_courses", "false")).lower() == "true"
    show_careers_val = str(settings_dict.get("show_careers", "false")).lower() == "true"

    return {
        "show_courses": show_courses_val,
        "show_careers": show_careers_val,
        "courses_enabled": show_courses_val,
        "careers_enabled": show_careers_val,
    }


@router.patch("")
def update_site_settings(
    response: Response,
    body: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("settings"))
):
    """Admin endpoint to update platform feature switches."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    for key, val in body.items():
        # Handle courses toggle
        if key in ("show_courses", "courses_enabled"):
            str_val = "true" if val is True or str(val).lower() == "true" else "false"
            setting_row = db.query(SiteSetting).filter(SiteSetting.key == "show_courses").first()
            if setting_row:
                setting_row.value = str_val
            else:
                db.add(SiteSetting(key="show_courses", value=str_val))

        # Handle careers toggle
        if key in ("show_careers", "careers_enabled"):
            str_val = "true" if val is True or str(val).lower() == "true" else "false"
            setting_row = db.query(SiteSetting).filter(SiteSetting.key == "show_careers").first()
            if setting_row:
                setting_row.value = str_val
            else:
                db.add(SiteSetting(key="show_careers", value=str_val))

    db.commit()
    return get_site_settings(response, db)
