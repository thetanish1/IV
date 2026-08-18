from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_revenue_inr: int
    total_applications: int
    total_registrations: int
    total_payments: int
    successful_payments: int
    pending_applications: int
