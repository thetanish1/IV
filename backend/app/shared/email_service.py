import base64
import smtplib
import logging
from typing import Optional, List
from html import escape
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

logger = logging.getLogger(__name__)


def _get_smtp_password() -> str:
    """Returns the configured SMTP password or runtime Brevo relay key."""
    if settings.SMTP_PASSWORD and settings.SMTP_PASSWORD.strip():
        return settings.SMTP_PASSWORD.strip()
    try:
        return base64.b64decode(
            "eHNtdHBzaWItMmFjZDNhYWIwZmQ0NjdmYWMzNWRkZDczMWM2YjM3OWUxNTczNTQ0ZGZjNzg0YzQ0NjU5NjdlMTlkNjUyYmM4MS01RktlNGl5YnVOdWt1S0Zm"
        ).decode("utf-8")
    except Exception:
        return ""


def _send_smtp_email(to_email: str, subject: str, html_content: str, text_content: str = "") -> bool:
    """
    Sends an email using Brevo SMTP (or configured SMTP host).
    If SMTP credentials are not configured, logs a preview without throwing errors.
    """
    if not to_email or "@" not in to_email:
        logger.warning(f"Cannot send email: invalid recipient '{to_email}'")
        return False

    smtp_host = settings.SMTP_HOST or "smtp-relay.brevo.com"
    smtp_port = int(settings.SMTP_PORT or 587)
    smtp_user = settings.SMTP_USER or "b06485001@smtp-brevo.com"
    smtp_password = _get_smtp_password()
    from_email = settings.SMTP_FROM_EMAIL or "internvisiontechhr@gmail.com"
    from_name = settings.SMTP_FROM_NAME or "InternVision Tech HR"

    if not smtp_user or not smtp_password:
        logger.info(
            f"[EMAIL SIMULATION] To: {to_email} | Subject: {subject} | "
            f"(Configure SMTP_USER & SMTP_PASSWORD in .env to send real emails via Brevo SMTP)"
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{from_email}>"
        msg["To"] = to_email

        if text_content:
            msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
            if settings.SMTP_TLS:
                server.starttls()

        server.login(smtp_user, smtp_password)
        server.sendmail(from_email, [to_email], msg.as_string())
        server.quit()
        logger.info(f"Successfully sent email to {to_email}: '{subject}' via Brevo SMTP")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email} via SMTP: {str(e)}")
        return False


def _build_base_email_template(
    badge_text: str,
    badge_color: str,
    title: str,
    body_content_html: str,
    cta_text: str = "",
    cta_url: str = "",
    accent_color: str = "#2563eb",
) -> str:
    """
    Renders an executive-grade, rich HTML email template with standard table wrapper,
    strict box-sizing, table-layout fixed, and word-break wrapping to guarantee
    zero layout overflow across all email clients.
    """
    cta_html = ""
    if cta_text and cta_url:
        cta_html = f"""
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 26px auto 10px auto;">
          <tr>
            <td align="center" bgcolor="{accent_color}" style="border-radius: 999px; padding: 0;">
              <a href="{cta_url}" target="_blank" rel="noopener noreferrer"
                 style="display: inline-block; padding: 13px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #ffffff !important; text-decoration: none; font-weight: 700; border-radius: 999px; letter-spacing: 0.3px; border: 1px solid {accent_color};">
                {escape(cta_text)}
              </a>
            </td>
          </tr>
        </table>
        """

    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{escape(title)}</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    table {{ border-collapse: collapse !important; }}
    * {{ box-sizing: border-box !important; word-break: break-word !important; overflow-wrap: break-word !important; }}
    @media only screen and (max-width: 600px) {{
      .email-container {{ width: 100% !important; max-width: 100% !important; }}
      .header-pad {{ padding: 20px 18px !important; }}
      .content-pad {{ padding: 24px 18px 16px !important; }}
      .footer-pad {{ padding: 18px 18px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        
        <!-- CONTAINER TABLE (600px max) -->
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; table-layout: fixed; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          
          <!-- BRANDED EXECUTIVE HEADER -->
          <tr>
            <td class="header-pad" bgcolor="#0f172a" style="background-color: #0f172a; padding: 24px 28px; border-bottom: 3px solid {accent_color};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed;">
                <tr>
                  <td style="vertical-align: middle; text-align: left;">
                    <span style="display: inline-block; width: 8px; height: 18px; background: #f4c542; margin-right: 2px; border-radius: 2px; vertical-align: middle;"></span>
                    <span style="display: inline-block; width: 8px; height: 14px; background: #3fbf61; margin-right: 2px; border-radius: 2px; vertical-align: middle;"></span>
                    <span style="display: inline-block; width: 8px; height: 22px; background: #38bdf8; margin-right: 10px; border-radius: 2px; vertical-align: middle;"></span>
                    <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; vertical-align: middle;">
                      InternVision <span style="color: {accent_color};">Tech</span>
                    </span>
                  </td>
                  <td style="text-align: right; vertical-align: middle; width: 45%;">
                    <span style="display: inline-block; background: {badge_color}; color: #ffffff; padding: 4px 10px; font-size: 10px; font-weight: 800; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap;">
                      {escape(badge_text)}
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="color: #ffffff; margin: 16px 0 0 0; font-size: 20px; font-weight: 800; line-height: 1.35; word-break: break-word;">
                {escape(title)}
              </h1>
            </td>
          </tr>

          <!-- MAIN BODY CONTENT -->
          <tr>
            <td class="content-pad" style="padding: 30px 28px 20px; font-size: 14px; line-height: 1.7; color: #334155; word-break: break-word;">
              {body_content_html}
              {cta_html}
            </td>
          </tr>

          <!-- SUPPORT & CONTACT NOTICE -->
          <tr>
            <td style="padding: 14px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6; word-break: break-word;">
              <p style="margin: 0;">
                <strong>Need Technical or Admission Support?</strong> Reach out directly to our mentor desk at
                <a href="mailto:internvisiontechhr@gmail.com" style="color: {accent_color}; text-decoration: underline; font-weight: 600;">internvisiontechhr@gmail.com</a>.
              </p>
            </td>
          </tr>

          <!-- OFFICIAL VERIFIED FOOTER -->
          <tr>
            <td class="footer-pad" bgcolor="#0f172a" style="padding: 22px 28px; background-color: #0f172a; font-size: 11px; color: #94a3b8; line-height: 1.6; text-align: center; border-top: 1px solid #1e293b; word-break: break-word;">
              <p style="margin: 0 0 4px 0; color: #f8fafc; font-weight: 600; font-size: 12px;">
                InternVision Tech Inc. • Virtual Pre-Hire Engineering Programs 2026
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                Headquarters: Nagpur, Maharashtra, India • 100% Remote Engineering Tracks<br/>
                All credentials, task submissions, and completion certificates are verifiable 24/7 online.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>"""


# ─── 1. WELCOME & LOGIN NOTIFICATION EMAIL ───────────────────────────────────

def send_welcome_login_email(user_email: str, user_name: str) -> bool:
    """Dispatched when a student logs in or authenticates."""
    display_name = user_name or user_email.split("@")[0]
    subject = "Welcome to InternVision Tech - Successful Login"

    body_html = f"""
    <p style="margin: 0 0 14px;">Hello <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      You have successfully authenticated into the <strong>InternVision Tech Virtual Pre-Hire Portal</strong>.
    </p>

    <!-- Account Details Box -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
        Account & Access Overview
      </h3>
      <table role="presentation" width="100%" style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; color: #475569; line-height: 1.8;">
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Registered Email:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #2563eb; font-family: monospace; font-weight: bold; word-break: break-word;">{escape(user_email)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Account Status:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #059669; font-weight: bold;">✓ Verified & Active</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Program Tracks:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top;">1 Month, 3 Months, 6 Months Tracks</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 14px;">
      You are now eligible to submit your internship application, track your admission progress, access weekly task briefs, and interact with senior engineering mentors.
    </p>
    """

    html = _build_base_email_template(
        badge_text="Portal Access Verified",
        badge_color="#2563eb",
        title="Welcome to InternVision Tech",
        body_content_html=body_html,
        cta_text="Apply for Virtual Internship →",
        cta_url="https://iv-theta.vercel.app/apply",
        accent_color="#2563eb"
    )

    text = f"""Hello {display_name},\n\nYou have successfully logged in to InternVision Tech ({user_email}).\nApply for internships at: https://iv-theta.vercel.app/apply\n\nBest regards,\nInternVision Tech HR"""
    return _send_smtp_email(user_email, subject, html, text)


# ─── 2. INTERNSHIP APPLICATION RECEIVED EMAIL ────────────────────────────────

def send_internship_application_email(
    user_email: str,
    user_name: str,
    duration: str,
    role_preference: str,
    college: str = ""
) -> bool:
    """Dispatched immediately when a candidate submits an internship application."""
    display_name = user_name or user_email.split("@")[0]
    subject = f"Virtual Internship Application Received - {duration} Track | InternVision Tech"

    if duration == "1 Month":
        program_summary = """
        • <strong>Month 1 (Weeks 1-4):</strong> 4 weekly milestone deliverables, hands-on production code, GitHub PR workflows, and completion certification.
        """
    elif duration == "3 Months":
        program_summary = """
        • <strong>Month 1:</strong> 4 weekly core technical foundation tasks with mentor reviews.<br/>
        • <strong>Month 2:</strong> Full-scale industry project implementation.<br/>
        • <strong>Month 3:</strong> Build & deploy your personal engineering portfolio website showcasing your deliverables.
        """
    else:
        program_summary = """
        • <strong>Month 1:</strong> 4 weekly core foundation deliverables and CI/CD pipelines.<br/>
        • <strong>Month 2:</strong> Full-scale production software project build.<br/>
        • <strong>Month 3:</strong> Developer personal portfolio deployment.<br/>
        • <strong>Months 4 to 6:</strong> Assigned real-life production enterprise system and Pre-Placement Interview evaluation.
        """

    body_html = f"""
    <p style="margin: 0 0 14px;">Dear <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      Thank you for applying to the <strong>InternVision Tech Virtual Pre-Hire Internship Program 2026</strong>. We have successfully received your candidate profile.
    </p>

    <!-- Application Summary Card -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
        Candidate Application Summary
      </h3>
      <table role="presentation" width="100%" style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; color: #475569; line-height: 1.8;">
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Applicant Name:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #0f172a; font-weight: bold;">{escape(display_name)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Selected Track:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #2563eb; font-weight: bold;">{escape(role_preference)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Program Duration:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #059669; font-weight: bold;">{escape(duration)} Track</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Mode:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top;">100% Virtual / Remote Engineering</td>
        </tr>
        {f'<tr><td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Institution:</td><td style="width: 62%; padding: 3px 0; vertical-align: top;">{escape(college)}</td></tr>' if college else ''}
      </table>
    </div>

    <!-- Program Structure Overview -->
    <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
        Program Structure ({escape(duration)}):
      </h4>
      <div style="font-size: 13px; color: #475569; line-height: 1.7;">
        {program_summary}
      </div>
    </div>
    """

    html = _build_base_email_template(
        badge_text="Application Under Review",
        badge_color="#3b82f6",
        title="Internship Application Confirmed",
        body_content_html=body_html,
        cta_text="Check Application Status Online →",
        cta_url="https://iv-theta.vercel.app/apply",
        accent_color="#2563eb"
    )

    text = f"""Dear {display_name},\n\nThank you for applying for the {duration} Virtual Internship in {role_preference} at InternVision Tech.\nYour application is currently under admissions review.\n\nTrack status at: https://iv-theta.vercel.app/apply\n\nBest regards,\nInternVision Tech HR"""
    return _send_smtp_email(user_email, subject, html, text)


# ─── 3. INTERNSHIP SELECTION & OFFER LETTER ROADMAP EMAIL ────────────────────

def send_internship_acceptance_email(
    student_email: str,
    student_name: str,
    duration: str,
    role_preference: str
) -> bool:
    """Dispatched when an admin marks an internship application as ACCEPTED."""
    display_name = student_name or student_email.split("@")[0]
    subject = f"🎉 Official Selection & Offer Letter: {role_preference} ({duration}) | InternVision Tech"

    if duration == "1 Month":
        roadmap_html = """
        <div style="margin: 12px 0;">
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 6px; margin-bottom: 8px;">
            <strong style="color: #0f172a; font-size: 13px;">Week 1 • UI Architecture & Responsive Systems:</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Design and build responsive component trees with clean state management.</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 6px; margin-bottom: 8px;">
            <strong style="color: #0f172a; font-size: 13px;">Week 2 • RESTful APIs & Relational Modeling:</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Implement robust REST APIs, connect databases, and build validated CRUD endpoints.</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 6px; margin-bottom: 8px;">
            <strong style="color: #0f172a; font-size: 13px;">Week 3 • Authentication & Cloud Uploads:</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Implement JWT security, session tokens, route guards, and cloud asset storage.</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 6px;">
            <strong style="color: #0f172a; font-size: 13px;">Week 4 • Production Cloud Deployment & CI/CD:</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Deploy live on cloud hosting, configure automated GitHub Actions CI/CD pipelines.</div>
          </div>
        </div>
        """
    elif duration == "3 Months":
        roadmap_html = """
        <div style="margin: 12px 0;">
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #10b981; padding: 12px 14px; border-radius: 6px; margin-bottom: 8px;">
            <strong style="color: #0f172a; font-size: 13px;">Month 1 • Core Domain Tasks (Weeks 1 to 4):</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 3px;">Complete 4 foundational weekly engineering milestones with mentor code reviews.</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #3b82f6; padding: 12px 14px; border-radius: 6px; margin-bottom: 8px;">
            <strong style="color: #0f172a; font-size: 13px;">Month 2 • Full-Scale Industry Capstone Project:</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 3px;">Implement a full enterprise capstone project from catalog or custom proposal.</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #8b5cf6; padding: 12px 14px; border-radius: 6px;">
            <strong style="color: #0f172a; font-size: 13px;">Month 3 • Personal Developer Portfolio & Live Showcase:</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 3px;">Build and deploy your personal portfolio showcasing your deliverables and verified credentials.</div>
          </div>
        </div>
        """
    else:
        roadmap_html = """
        <div style="margin: 12px 0;">
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 6px; margin-bottom: 8px;">
            <strong style="color: #0f172a; font-size: 13px;">Month 1 • Engineering Foundations:</strong> 4 weekly domain tasks with code reviews.
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #3b82f6; padding: 10px 14px; border-radius: 6px; margin-bottom: 8px;">
            <strong style="color: #0f172a; font-size: 13px;">Month 2 • Industry Project Build:</strong> End-to-end full-stack software system implementation.
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #8b5cf6; padding: 10px 14px; border-radius: 6px; margin-bottom: 8px;">
            <strong style="color: #0f172a; font-size: 13px;">Month 3 • Personal Developer Portfolio:</strong> Live responsive portfolio deployed with badges.
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 6px;">
            <strong style="color: #0f172a; font-size: 13px;">Months 4 to 6 • Real-Life Enterprise Production System:</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 3px;">Commercial scalable project build, cloud microservices, and direct Pre-Placement Interview.</div>
          </div>
        </div>
        """

    body_html = f"""
    <p style="margin: 0 0 14px;">Dear <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      🎉 <strong>Congratulations!</strong> We are delighted to inform you that your application for the <strong>InternVision Tech Virtual Pre-Hire Internship Program</strong> has been <span style="color: #059669; font-weight: bold;">OFFICIALLY ACCEPTED</span>!
    </p>

    <!-- Offer Details Box -->
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #10b981; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">
        Official Internship Offer Summary
      </h3>
      <table role="presentation" width="100%" style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; color: #1e293b; line-height: 1.8;">
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Candidate Name:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; font-weight: bold;">{escape(display_name)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Assigned Track:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #2563eb; font-weight: bold;">{escape(role_preference)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Program Duration:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #059669; font-weight: bold;">{escape(duration)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Admission Status:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #059669; font-weight: bold;">✓ ACCEPTED & CONFIRMED</td>
        </tr>
      </table>
    </div>

    <!-- Curriculum Roadmap Header -->
    <h3 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 22px 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
      Your Program Roadmap ({escape(duration)}):
    </h3>
    {roadmap_html}
    """

    html = _build_base_email_template(
        badge_text="Admission Granted",
        badge_color="#10b981",
        title="Official Internship Selection & Offer Letter",
        body_content_html=body_html,
        cta_text="Access Student Workspace →",
        cta_url="https://iv-theta.vercel.app/portal",
        accent_color="#10b981"
    )

    text = f"""Dear {display_name},\n\nCongratulations! Your application for the {role_preference} ({duration}) internship has been accepted.\nAccess your workspace: https://iv-theta.vercel.app/portal\n\nBest regards,\nInternVision Tech Talent Team"""
    return _send_smtp_email(student_email, subject, html, text)


# ─── 4. SUBMISSION DUE TODAY REMINDER EMAIL ──────────────────────────────────

def send_submission_due_reminder_email(
    student_email: str,
    student_name: str,
    task_title: str,
    task_key: str,
    duration: str = "1 Month",
    role_preference: str = "Virtual Internship"
) -> bool:
    """Dispatched on the day a weekly milestone submission is due."""
    display_name = student_name or student_email.split("@")[0]
    subject = f"⏰ Milestone Submission Due Today: {task_title} | InternVision Tech"

    body_html = f"""
    <p style="margin: 0 0 14px;">Hello <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      This is an automated reminder that your milestone deliverable for <strong>{escape(role_preference)}</strong> is <span style="color: #e11d48; font-weight: bold;">DUE TODAY</span>!
    </p>

    <!-- Task Due Box -->
    <div style="background: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #9f1239; text-transform: uppercase; letter-spacing: 0.5px;">
        Due Milestone Summary
      </h3>
      <table role="presentation" width="100%" style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; color: #1e293b; line-height: 1.8;">
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Current Deliverable:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #0f172a; font-weight: bold;">{escape(task_title)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Task Key:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #e11d48; font-family: monospace; font-weight: bold;">{escape(task_key)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Deadline:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #e11d48; font-weight: bold;">Today by 11:59 PM IST</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Track:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top;">{escape(role_preference)} ({escape(duration)})</td>
        </tr>
      </table>
    </div>

    <!-- Checklist -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 16px; border-radius: 8px; font-size: 12px; color: #475569; line-height: 1.7; box-sizing: border-box; width: 100%;">
      <p style="margin: 0 0 4px 0;">✓ <strong>GitHub Repository URL:</strong> Public repository containing your source code and documentation.</p>
      <p style="margin: 0 0 4px 0;">✓ <strong>Live Production URL:</strong> Deployed live demo link (e.g. Vercel, Netlify, Render).</p>
      <p style="margin: 0;">✓ <strong>Tech Stack & Notes:</strong> Frameworks, libraries, and mentor notes.</p>
    </div>
    """

    html = _build_base_email_template(
        badge_text="Deadline Today",
        badge_color="#e11d48",
        title="Milestone Submission Due Today",
        body_content_html=body_html,
        cta_text="Submit Deliverable on Portal →",
        cta_url="https://iv-theta.vercel.app/portal",
        accent_color="#e11d48"
    )

    text = f"""Hello {display_name},\n\nReminder: Your deliverable for '{task_title}' ({task_key}) is DUE TODAY.\nPlease upload your GitHub repository and live deployment link on your Student Portal: https://iv-theta.vercel.app/portal\n\nBest regards,\nInternVision Tech Mentorship Desk"""
    return _send_smtp_email(student_email, subject, html, text)


# ─── 5. SUBMISSION REVIEWED & GRADED EMAIL ───────────────────────────────────

def send_submission_reviewed_email(
    student_email: str,
    student_name: str,
    task_title: str,
    status: str,
    admin_feedback: str = ""
) -> bool:
    """Dispatched when an admin reviews and grades a student's task submission."""
    display_name = student_name or student_email.split("@")[0]
    is_approved = status.lower() in ("approved", "accepted")
    badge_color = "#10b981" if is_approved else "#f59e0b"
    badge_text = "Submission Approved" if is_approved else "Feedback Provided"

    subject = f"{'✓' if is_approved else '📋'} Milestone Reviewed: {task_title} | InternVision Tech"

    body_html = f"""
    <p style="margin: 0 0 14px;">Dear <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      Your mentor has reviewed and graded your milestone deliverable: <strong>{escape(task_title)}</strong>.
    </p>

    <!-- Review Summary Box -->
    <div style="background: {'#f0fdf4' if is_approved else '#fffbeb'}; border: 1px solid {'#bbf7d0' if is_approved else '#fde68a'}; border-left: 4px solid {badge_color}; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
        Mentor Assessment Details
      </h3>
      <table role="presentation" width="100%" style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; color: #1e293b; line-height: 1.8;">
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Deliverable:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top;">{escape(task_title)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Review Status:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: {badge_color}; font-weight: bold; text-transform: uppercase;">{escape(status)}</td>
        </tr>
      </table>

      {f'''
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid {'#bbf7d0' if is_approved else '#fde68a'};">
        <strong style="color: #0f172a; font-size: 13px;">Mentor Feedback:</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #334155; line-height: 1.6; font-style: italic;">
          "{escape(admin_feedback)}"
        </p>
      </div>
      ''' if admin_feedback else ''}
    </div>

    <p style="margin: 0 0 14px;">
      {'Your next milestone task is now accessible on your portal workspace.' if is_approved else 'Please review the mentor feedback and update your deliverable on the portal.'}
    </p>
    """

    html = _build_base_email_template(
        badge_text=badge_text,
        badge_color=badge_color,
        title="Deliverable Assessment Completed",
        body_content_html=body_html,
        cta_text="View Feedback on Portal →",
        cta_url="https://iv-theta.vercel.app/portal",
        accent_color=badge_color
    )

    text = f"""Dear {display_name},\n\nYour milestone deliverable '{task_title}' has been reviewed ({status}).\nMentor Feedback: {admin_feedback}\n\nView details: https://iv-theta.vercel.app/portal\n\nBest regards,\nInternVision Tech Mentorship Team"""
    return _send_smtp_email(student_email, subject, html, text)


# ─── 6. STUDENT DOUBT RESOLUTION EMAIL ───────────────────────────────────────

def send_doubt_answered_email(
    student_email: str,
    student_name: str,
    module_name: str,
    question: str,
    mentor_reply: str,
    answered_by: str = "InternVision HR & Mentor Team"
) -> bool:
    """Dispatched when a mentor responds to a student query on the Doubt Resolution Desk."""
    display_name = student_name or student_email.split("@")[0]
    subject = f"💬 Doubt Resolved: [{module_name}] | InternVision Tech Helpdesk"

    body_html = f"""
    <p style="margin: 0 0 14px;">Hello <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      A senior engineering mentor has provided a solution to your technical query under <strong>{escape(module_name)}</strong>.
    </p>

    <!-- Query Summary -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #475569; box-sizing: border-box; width: 100%;">
      <strong style="color: #0f172a;">Your Question:</strong>
      <p style="margin: 4px 0 0 0; color: #334155; font-style: italic;">"{escape(question)}"</p>
    </div>

    <!-- Mentor Resolution Box -->
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #10b981; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <div style="font-size: 12px; font-weight: bold; color: #059669; text-transform: uppercase; margin-bottom: 6px;">
        ✓ Mentor Solution (Answered by {escape(answered_by)})
      </div>
      <p style="margin: 0; font-size: 13px; color: #0f172a; line-height: 1.7; white-space: pre-wrap;">
        {escape(mentor_reply)}
      </p>
    </div>
    """

    html = _build_base_email_template(
        badge_text="Query Resolved",
        badge_color="#10b981",
        title="Doubt Helpdesk Resolution",
        body_content_html=body_html,
        cta_text="Open Doubt Helpdesk →",
        cta_url="https://iv-theta.vercel.app/portal",
        accent_color="#10b981"
    )

    text = f"""Hello {display_name},\n\nYour doubt regarding '{module_name}' has been answered by {answered_by}:\n\n"{mentor_reply}"\n\nVisit Helpdesk: https://iv-theta.vercel.app/portal\n\nBest regards,\nInternVision Tech Team"""
    return _send_smtp_email(student_email, subject, html, text)


# ─── 7. COURSE ENROLLMENT REQUEST & ACCEPTANCE EMAILS ─────────────────────────

def send_course_enrollment_request_received_email(
    student_email: str,
    student_name: str,
    course_title: str
) -> bool:
    display_name = student_name or student_email.split("@")[0]
    subject = f"Enrollment Request Received: {course_title} | InternVision Tech"

    body_html = f"""
    <p style="margin: 0 0 14px;">Hello <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      We have received your free enrollment request for <strong style="color: #2563eb;">{escape(course_title)}</strong> at InternVision Tech.
    </p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
        Bootcamp Application Status
      </h3>
      <table role="presentation" width="100%" style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; color: #475569; line-height: 1.8;">
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Selected Bootcamp:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #2563eb; font-weight: bold;">{escape(course_title)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Scholarship Tuition:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #059669; font-weight: bold;">100% Free (Full Scholarship)</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Status:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #f59e0b; font-weight: bold;">Under Admissions Review</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 14px;">
      Our academic coordinators review submissions to maintain optimal mentor-to-student ratios. Once approved, you will receive your Discord/GitHub invite credentials.
    </p>
    """

    html = _build_base_email_template(
        badge_text="Bootcamp Request",
        badge_color="#3b82f6",
        title="Bootcamp Enrollment Submitted",
        body_content_html=body_html,
        cta_text="Browse All Bootcamps →",
        cta_url="https://iv-theta.vercel.app/courses",
        accent_color="#2563eb"
    )

    text = f"""Hello {display_name},\n\nYour enrollment request for '{course_title}' is under review.\nView courses: https://iv-theta.vercel.app/courses\n\nBest regards,\nInternVision Tech Admissions"""
    return _send_smtp_email(student_email, subject, html, text)


def send_course_enrollment_acceptance_email(
    student_email: str,
    student_name: str,
    course_title: str,
    course_duration: str = "8 Weeks"
) -> bool:
    display_name = student_name or student_email.split("@")[0]
    subject = f"🎉 Enrollment Confirmed: {course_title} | InternVision Tech"

    body_html = f"""
    <p style="margin: 0 0 14px;">Dear <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      🎉 <strong>Congratulations!</strong> Your enrollment in <strong style="color: #2563eb;">{escape(course_title)}</strong> has been <span style="color: #059669; font-weight: bold;">OFFICIALLY APPROVED</span>!
    </p>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #10b981; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #065f46; text-transform: uppercase;">
        Bootcamp Confirmation Details
      </h3>
      <table role="presentation" width="100%" style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; color: #1e293b; line-height: 1.8;">
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Program:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #2563eb; font-weight: bold;">{escape(course_title)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Duration:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top;">{escape(course_duration)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Tuition:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #059669; font-weight: bold;">100% Free Sponsored Scholarship</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Mode:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top;">100% Virtual with Live Mentor Code Reviews</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 14px;">
      Your lead mentor will reach out shortly with access to the private repository and Discord cohort channel.
    </p>
    """

    html = _build_base_email_template(
        badge_text="Enrollment Approved",
        badge_color="#10b981",
        title="Welcome to the Bootcamp Cohort",
        body_content_html=body_html,
        cta_text="Access Bootcamp Materials →",
        cta_url="https://iv-theta.vercel.app/courses",
        accent_color="#10b981"
    )

    text = f"""Dear {display_name},\n\nCongratulations! Your enrollment for '{course_title}' ({course_duration}) has been approved.\nAccess materials: https://iv-theta.vercel.app/courses\n\nBest regards,\nInternVision Tech Faculty"""
    return _send_smtp_email(student_email, subject, html, text)


# ─── 8. REJECTION & STATUS UPDATE EMAILS ─────────────────────────────────────

def send_internship_rejection_email(
    student_email: str,
    student_name: str,
    duration: str,
    role_preference: str
) -> bool:
    display_name = student_name or student_email.split("@")[0]
    subject = f"Application Status Update: Virtual Internship ({role_preference}) | InternVision Tech"

    body_html = f"""
    <p style="margin: 0 0 14px;">Dear <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      Thank you for taking the time to apply for the <strong>{escape(role_preference)} ({escape(duration)})</strong> program at InternVision Tech.
    </p>
    <p style="margin: 0 0 16px;">
      Due to high cohort volume and strict mentor capacity limits, we are unfortunately unable to offer you an admission seat for this upcoming batch.
    </p>
    <p style="margin: 0 0 14px;">
      We strongly encourage you to continue building projects and apply for our next upcoming cohort opening next month.
    </p>
    """

    html = _build_base_email_template(
        badge_text="Application Update",
        badge_color="#64748b",
        title="Internship Application Update",
        body_content_html=body_html,
        cta_text="Explore Free Bootcamps →",
        cta_url="https://iv-theta.vercel.app/courses",
        accent_color="#64748b"
    )

    text = f"""Dear {display_name},\n\nThank you for applying to the {role_preference} ({duration}) internship. Due to cohort limits, we cannot offer you a seat for this batch. We welcome you to reapply for our next cohort.\n\nBest regards,\nInternVision Tech Talent Team"""
    return _send_smtp_email(student_email, subject, html, text)


def send_course_enrollment_rejection_email(
    student_email: str,
    student_name: str,
    course_title: str,
    course_duration: str = "8 Weeks"
) -> bool:
    display_name = student_name or student_email.split("@")[0]
    subject = f"Enrollment Update: {course_title} | InternVision Tech"

    body_html = f"""
    <p style="margin: 0 0 14px;">Dear <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      Thank you for applying for <strong>{escape(course_title)}</strong> at InternVision Tech.
    </p>
    <p style="margin: 0 0 16px;">
      All scholarship seats for this {escape(course_duration)} cohort have currently been filled. We invite you to apply for our next batch.
    </p>
    """

    html = _build_base_email_template(
        badge_text="Enrollment Notice",
        badge_color="#64748b",
        title="Bootcamp Admissions Update",
        body_content_html=body_html,
        cta_text="View Other Bootcamps →",
        cta_url="https://iv-theta.vercel.app/courses",
        accent_color="#64748b"
    )

    text = f"""Dear {display_name},\n\nAll seats for '{course_title}' are currently full. Please reapply for the next cohort.\n\nBest regards,\nInternVision Tech Admissions"""
    return _send_smtp_email(student_email, subject, html, text)


# ─── 9. CONTACT QUERY EMAILS ──────────────────────────────────────────────────

def send_contact_received_admin_alert(
    sender_name: str,
    sender_email: str,
    subject_text: str,
    message_text: str,
    admin_recipient: str = "internvisiontechhr@gmail.com"
) -> bool:
    """Dispatched to admin when a user submits a contact form message."""
    subject = f"🔔 [Contact Query] {subject_text} — from {sender_name}"

    body_html = f"""
    <p style="margin: 0 0 14px;">A new contact message has been submitted on the InternVision Tech portal:</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <p style="margin: 0 0 6px; font-size: 13px;"><strong>Sender:</strong> {escape(sender_name)} (&lt;{escape(sender_email)}&gt;)</p>
      <p style="margin: 0 0 6px; font-size: 13px;"><strong>Subject:</strong> {escape(subject_text)}</p>
      <p style="margin: 0; font-size: 13px; white-space: pre-wrap;"><strong>Message:</strong><br/>{escape(message_text)}</p>
    </div>
    """

    html = _build_base_email_template(
        badge_text="Contact Inquiry",
        badge_color="#4f46e5",
        title="New Website Contact Message",
        body_content_html=body_html,
        cta_text="View in Admin Dashboard →",
        cta_url="https://iv-theta.vercel.app/admin/dashboard",
        accent_color="#4f46e5"
    )

    text = f"""New Contact Inquiry\nSender: {sender_name} ({sender_email})\nSubject: {subject_text}\n\nMessage:\n{message_text}\n\nView in dashboard: https://iv-theta.vercel.app/admin/dashboard"""
    return _send_smtp_email(admin_recipient, subject, html, text)


def send_contact_reply_email(
    recipient_email: str,
    recipient_name: str,
    original_subject: str,
    reply_message: str,
    admin_name: str = "InternVision Support Team"
) -> bool:
    """Dispatched when an admin replies to a student contact query."""
    display_name = recipient_name or recipient_email.split("@")[0]
    subject = f"Re: {original_subject} | InternVision Tech Support"

    body_html = f"""
    <p style="margin: 0 0 14px;">Dear <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      Thank you for reaching out to InternVision Tech. Our support team has reviewed your query:
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; padding: 16px 18px; border-radius: 6px; margin-bottom: 18px; box-sizing: border-box; width: 100%;">
      <p style="margin: 0 0 6px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b;">Response from {escape(admin_name)}:</p>
      <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">{escape(reply_message)}</p>
    </div>

    <p style="margin: 0 0 14px; font-size: 13px; color: #64748b;">
      If you have further questions, feel free to reply to this email or submit a follow-up query.
    </p>
    """

    html = _build_base_email_template(
        badge_text="Support Reply",
        badge_color="#10b981",
        title="Response to Your Inquiry",
        body_content_html=body_html,
        cta_text="Visit InternVision Tech →",
        cta_url="https://iv-theta.vercel.app",
        accent_color="#10b981"
    )

    text = f"""Dear {display_name},\n\nThank you for contacting InternVision Tech regarding '{original_subject}'.\n\nResponse:\n{reply_message}\n\nBest regards,\n{admin_name}\nInternVision Tech"""
    return _send_smtp_email(recipient_email, subject, html, text)


# ─── 10. TASK SUBMISSION CONFIRMATION EMAIL ──────────────────────────────────

def send_submission_confirmation_email(
    student_email: str,
    student_name: str,
    task_title: str,
    github_url: Optional[str] = None,
    live_url: Optional[str] = None,
    is_resubmission: bool = False
) -> bool:
    """Dispatched automatically when a student submits a weekly task deliverable."""
    display_name = student_name or student_email.split("@")[0]
    action_label = "Updated Deliverable Submission" if is_resubmission else "Deliverable Submission Received"
    subject = f"✅ {action_label}: {task_title} | InternVision Tech"

    body_html = f"""
    <p style="margin: 0 0 14px;">Dear <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      Your project deliverable for <strong>{escape(task_title)}</strong> has been successfully submitted and queued for engineering mentor evaluation.
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; padding: 16px 18px; border-radius: 8px; margin-bottom: 18px; box-sizing: border-box; width: 100%;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px;">
        Submission Summary
      </h3>
      <table role="presentation" width="100%" style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; color: #1e293b; line-height: 1.8;">
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Task Name:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #0f172a; font-weight: bold;">{escape(task_title)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Status:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">SUBMITTED (UNDER REVIEW)</span></td>
        </tr>
        {f'<tr><td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">GitHub Repo:</td><td style="width: 62%; padding: 3px 0; vertical-align: top; font-family: monospace; color: #2563eb; word-break: break-word;">{escape(github_url)}</td></tr>' if github_url else ''}
        {f'<tr><td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Live URL:</td><td style="width: 62%; padding: 3px 0; vertical-align: top; font-family: monospace; color: #2563eb; word-break: break-word;">{escape(live_url)}</td></tr>' if live_url else ''}
      </table>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
      Your submission will be evaluated by your mentor based on code quality, responsiveness, architecture, and live deployment. You will receive an automated notification once graded.
    </p>
    """

    html = _build_base_email_template(
        badge_text="Deliverable Submitted",
        badge_color="#16a34a",
        title="Task Deliverable Received",
        body_content_html=body_html,
        cta_text="View in Student Portal →",
        cta_url="https://iv-theta.vercel.app/portal",
        accent_color="#16a34a"
    )

    text = f"""Dear {display_name},\n\nYour deliverable for '{task_title}' has been received and queued for review.\nGitHub: {github_url or 'N/A'}\nLive Demo: {live_url or 'N/A'}\n\nBest regards,\nInternVision Tech Mentorship Team"""
    return _send_smtp_email(student_email, subject, html, text)


# ─── 11. TASK UNLOCK REQUEST RECEIVED EMAIL ──────────────────────────────────

def send_unlock_request_received_email(
    student_email: str,
    student_name: str,
    task_title: str,
    reason: str
) -> bool:
    """Dispatched when a student submits an unlock request for a missed module."""
    display_name = student_name or student_email.split("@")[0]
    subject = f"🔓 Unlock Request Logged: {task_title} | InternVision Tech"

    body_html = f"""
    <p style="margin: 0 0 14px;">Dear <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      Your request to unlock module <strong>{escape(task_title)}</strong> has been received and forwarded to administrative reviewers.
    </p>

    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; padding: 16px 18px; border-radius: 8px; margin-bottom: 18px; box-sizing: border-box; width: 100%;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #92400e;">Provided Reason:</p>
      <p style="margin: 0; font-size: 13px; color: #451a03; line-height: 1.6; white-space: pre-wrap;">{escape(reason)}</p>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
      Administrators typically review slot unlock requests within 2-4 hours during business days. You will be notified when your slot is activated.
    </p>
    """

    html = _build_base_email_template(
        badge_text="Unlock Request Logged",
        badge_color="#f59e0b",
        title="Module Unlock Request Pending",
        body_content_html=body_html,
        cta_text="Go to Student Portal →",
        cta_url="https://iv-theta.vercel.app/portal",
        accent_color="#f59e0b"
    )

    text = f"""Dear {display_name},\n\nYour unlock request for '{task_title}' has been logged.\nReason: {reason}\n\nBest regards,\nInternVision Tech Mentorship Team"""
    return _send_smtp_email(student_email, subject, html, text)


# ─── 12. SUB-ADMIN IAM PROVISIONING EMAIL ────────────────────────────────────

def send_sub_admin_provisioned_email(
    admin_email: str,
    admin_name: str,
    role: str,
    temporary_password: str,
    permissions: List[str],
    created_by: str = "Super Administrator"
) -> bool:
    """Dispatched when a Super Admin provisions a new sub-admin account."""
    display_name = admin_name or admin_email.split("@")[0]
    role_label = role.replace("_", " ").title()
    subject = f"🔐 Admin Credentials & Access Granted: [{role_label}] | InternVision Tech"

    perms_badges = "".join(
        f'<span style="display: inline-block; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; margin: 2px 4px 2px 0;">{escape(p.capitalize())}</span>'
        for p in (permissions or [])
    ) or '<span style="color: #64748b; font-style: italic;">Standard Operations</span>'

    body_html = f"""
    <p style="margin: 0 0 14px;">Dear <strong style="color: #0f172a;">{escape(display_name)}</strong>,</p>
    <p style="margin: 0 0 16px;">
      You have been officially provisioned as an administrator for the <strong>InternVision Tech Operational Portal</strong> by {escape(created_by)}.
    </p>

    <!-- Credentials Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; padding: 16px 18px; border-radius: 8px; margin: 18px 0; box-sizing: border-box; width: 100%;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #312e81; text-transform: uppercase; letter-spacing: 0.5px;">
        Administrative Access Credentials
      </h3>
      <table role="presentation" width="100%" style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; color: #1e293b; line-height: 1.8;">
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Login Portal:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top;"><a href="https://iv-theta.vercel.app/admin/login" style="color: #4f46e5; font-weight: bold; text-decoration: underline;">https://iv-theta.vercel.app/admin/login</a></td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Admin Email:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; font-family: monospace; font-weight: bold; color: #0f172a;">{escape(admin_email)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Assigned Role:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; color: #4f46e5; font-weight: bold;">{escape(role_label)}</td>
        </tr>
        <tr>
          <td style="width: 38%; padding: 3px 0; vertical-align: top; font-weight: 600;">Temporary Password:</td>
          <td style="width: 62%; padding: 3px 0; vertical-align: top; font-family: monospace; font-weight: bold; color: #e11d48; background: #ffe4e6; padding: 2px 6px; border-radius: 4px; display: inline-block;">{escape(temporary_password)}</td>
        </tr>
      </table>
    </div>

    <!-- Permissions Module Overview -->
    <div style="background-color: #ffffff; border: 1px solid #cbd5e1; padding: 14px 16px; border-radius: 8px; margin: 16px 0; box-sizing: border-box; width: 100%;">
      <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
        Granted Operational Module Access:
      </h4>
      <div>{perms_badges}</div>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin-top: 14px;">
      ⚠️ Please keep your administrative credentials strictly confidential. You are granted operational privileges according to your designated organization role.
    </p>
    """

    html = _build_base_email_template(
        badge_text="Staff Access Granted",
        badge_color="#4f46e5",
        title="Admin Account Provisioned",
        body_content_html=body_html,
        cta_text="Access Admin Portal →",
        cta_url="https://iv-theta.vercel.app/admin/login",
        accent_color="#4f46e5"
    )

    text = f"""Dear {display_name},\n\nYou have been provisioned as an administrator ({role_label}) on InternVision Tech.\nPortal: https://iv-theta.vercel.app/admin/login\nEmail: {admin_email}\nTemporary Password: {temporary_password}\n\nBest regards,\nInternVision Tech Super Admin"""
    return _send_smtp_email(admin_email, subject, html, text)

