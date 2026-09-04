import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

logger = logging.getLogger(__name__)


def _send_smtp_email(to_email: str, subject: str, html_content: str, text_content: str = "") -> bool:
    """
    Sends an email using standard SMTP.
    If SMTP credentials are not configured, logs a helpful preview without throwing errors.
    """
    if not to_email or "@" not in to_email:
        logger.warning(f"Cannot send email: invalid recipient '{to_email}'")
        return False

    smtp_host = settings.SMTP_HOST
    smtp_port = settings.SMTP_PORT
    smtp_user = settings.SMTP_USER
    smtp_password = settings.SMTP_PASSWORD
    from_email = settings.SMTP_FROM_EMAIL or "internvisiontechhr@gmail.com"
    from_name = settings.SMTP_FROM_NAME or "InternVision Tech"

    # If no SMTP user or password is provided in .env, simulate and log
    if not smtp_user or not smtp_password:
        logger.info(
            f"[EMAIL SIMULATION] To: {to_email} | Subject: {subject} | "
            f"(Configure SMTP_USER & SMTP_PASSWORD in .env to send real emails via Gmail/Resend)"
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{from_email}>"
        msg["To"] = to_email

        # Attach text and HTML versions
        if text_content:
            msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # Connect to SMTP server
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
            if settings.SMTP_TLS:
                server.starttls()

        server.login(smtp_user, smtp_password)
        server.sendmail(from_email, [to_email], msg.as_string())
        server.quit()
        logger.info(f"Successfully sent email to {to_email}: '{subject}'")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email} via SMTP: {str(e)}")
        return False


def send_welcome_login_email(user_email: str, user_name: str):
    """
    Sends a welcome and login notification email to the user.
    """
    display_name = user_name or user_email.split("@")[0]
    subject = "Welcome to InternVision Tech - Successful Login"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0c0a; color: #e5e5e5; margin: 0; padding: 20px; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #171614; border: 1px solid #2e2c28; border-radius: 8px; overflow: hidden; }}
        .header {{ background: #2563eb; padding: 24px; text-align: left; }}
        .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; }}
        .badge {{ display: inline-block; background: #1d4ed8; color: #ffffff; padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase; margin-bottom: 8px; }}
        .content {{ padding: 32px 24px; line-height: 1.6; color: #d4d4d8; font-size: 15px; }}
        .highlight {{ color: #60a5fa; font-weight: bold; }}
        .info-box {{ background: #1e1d1a; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px; }}
        .btn {{ display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; margin-top: 16px; }}
        .footer {{ padding: 20px 24px; background: #12110f; font-size: 12px; color: #71717a; border-top: 1px solid #2e2c28; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">InternVision Tech</span>
          <h1>Welcome & Login Notification</h1>
        </div>
        <div class="content">
          <p>Hello <strong style="color:#ffffff;">{display_name}</strong>,</p>
          <p>You have successfully logged in to <strong class="highlight">InternVision Tech</strong>.</p>
          
          <div class="info-box">
            <strong style="color:#ffffff;">Account Details:</strong><br>
            • Email: <span style="color:#60a5fa;">{user_email}</span><br>
            • Status: <span style="color:#34d399;">Active & Verified</span><br>
            • Track Mode: 100% Virtual Pre-Hire Internships & Engineering Bootcamps
          </div>

          <p>You can now apply for our Virtual Internship Program, track your application status, or explore our production bootcamps.</p>
          
          <p style="text-align: center;">
            <a href="https://internvision.tech/apply" class="btn">Apply For Virtual Internship →</a>
          </p>

          <p style="font-size: 13px; color: #a1a1aa; margin-top: 24px;">
            If you did not perform this login, please immediately contact our team at <a href="mailto:internvisiontechhr@gmail.com" style="color:#60a5fa;">internvisiontechhr@gmail.com</a>.
          </p>
        </div>
        <div class="footer">
          <p>© 2026 InternVision Tech Inc. Headquarters: Nagpur, Maharashtra, India.</p>
          <p>100% Virtual Operations & Pre-Hire Engineering Mentorship.</p>
        </div>
      </div>
    </body>
    </html>
    """

    text_content = f"""
    Hello {display_name},

    You have successfully logged in to InternVision Tech ({user_email}).
    
    You can now apply for our Virtual Internship tracks (1 Month, 3 Months, 6 Months) or browse our bootcamps.
    
    If you did not log in, contact internvisiontechhr@gmail.com.
    
    Best regards,
    InternVision Tech Team
    Nagpur, Maharashtra, India
    """

    return _send_smtp_email(user_email, subject, html_content, text_content)


def send_internship_application_email(
    user_email: str,
    user_name: str,
    duration: str,
    role_preference: str,
    college: str = ""
):
    """
    Sends a tailored confirmation email when a candidate applies for an internship (1 Month, 3 Months, or 6 Months).
    """
    display_name = user_name or user_email.split("@")[0]
    subject = f"Virtual Internship Application Received - {duration} Program | InternVision Tech"

    duration_highlights = {
        "1 Month": "Foundation Virtual Internship: Core project implementation, Git workflows, fast-track code reviews, and completion certification.",
        "3 Months": "Advanced Virtual Internship: Production microservices / AI pipelines, 1:1 senior engineering mentorship, live deployments, and Pre-Placement Offer (PPO) review.",
        "6 Months": "Comprehensive Industrial Co-Op: Deep-dive production engineering, end-to-end full-stack / AI systems architecture, enterprise project ownership, and guaranteed hiring partner placement interviews.",
    }.get(duration, "Virtual Internship Track with real production projects and 1:1 developer mentorship.")

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0c0a; color: #e5e5e5; margin: 0; padding: 20px; }}
        .card {{ max-width: 620px; margin: 0 auto; background: #171614; border: 1px solid #2e2c28; border-radius: 8px; overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); padding: 28px; text-align: left; }}
        .header h1 {{ color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; }}
        .badge {{ display: inline-block; background: #ffffff; color: #1d4ed8; padding: 4px 10px; font-size: 11px; font-weight: 800; border-radius: 4px; text-transform: uppercase; margin-bottom: 8px; }}
        .content {{ padding: 32px 24px; line-height: 1.6; color: #d4d4d8; font-size: 15px; }}
        .highlight {{ color: #60a5fa; font-weight: bold; }}
        .summary-card {{ background: #1e1d1a; border: 1px solid #2e2c28; padding: 18px; margin: 20px 0; border-radius: 6px; }}
        .timeline-step {{ padding: 10px 0; border-bottom: 1px solid #2e2c28; }}
        .timeline-step:last-child {{ border-bottom: none; }}
        .step-num {{ display: inline-block; width: 22px; height: 22px; line-height: 22px; background: #2563eb; color: #fff; text-align: center; border-radius: 50%; font-size: 12px; font-weight: bold; margin-right: 8px; }}
        .footer {{ padding: 20px 24px; background: #12110f; font-size: 12px; color: #71717a; border-top: 1px solid #2e2c28; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">Application Confirmed</span>
          <h1>Virtual Internship Application Received</h1>
        </div>
        <div class="content">
          <p>Dear <strong style="color:#ffffff;">{display_name}</strong>,</p>
          <p>Thank you for applying to the <strong class="highlight">InternVision Tech Virtual Pre-Hire Internship Program 2026</strong>!</p>
          
          <div class="summary-card">
            <h3 style="color:#ffffff; margin-top:0; font-size:16px; border-bottom:1px solid #2e2c28; padding-bottom:8px;">Application Summary</h3>
            <p style="margin:6px 0;">• <strong>Selected Track:</strong> <span style="color:#60a5fa;">{role_preference}</span></p>
            <p style="margin:6px 0;">• <strong>Program Duration:</strong> <span style="color:#34d399; font-weight:bold;">{duration}</span></p>
            <p style="margin:6px 0;">• <strong>Work Mode:</strong> 100% Virtual / Remote</p>
            {f'<p style="margin:6px 0;">• <strong>Institution:</strong> {college}</p>' if college else ''}
            <p style="margin:10px 0 0 0; font-size:13px; color:#a1a1aa; background:#12110f; padding:10px; border-radius:4px;">
              <strong>Track Focus ({duration}):</strong> {duration_highlights}
            </p>
          </div>

          <h3 style="color:#ffffff; font-size:16px;">What Happens Next?</h3>
          <div style="background:#1e1d1a; padding:14px; border-radius:6px; margin-bottom:20px;">
            <div class="timeline-step">
              <span class="step-num">1</span> <strong>Technical Resume Review:</strong> Our engineering team reviews your skills and portfolio.
            </div>
            <div class="timeline-step">
              <span class="step-num">2</span> <strong>Offer Letter & Task Brief:</strong> Shortlisted candidates receive the official Offer Letter and orientation date.
            </div>
            <div class="timeline-step">
              <span class="step-num">3</span> <strong>1:1 Mentorship Kickoff:</strong> You will be assigned a senior mentor on GitHub and Slack/Discord for daily standups.
            </div>
          </div>

          <p style="font-size:14px; color:#a1a1aa;">
            Have questions or need to submit additional work samples? Contact us directly at <a href="mailto:internvisiontechhr@gmail.com" style="color:#60a5fa;">internvisiontechhr@gmail.com</a>.
          </p>
        </div>
        <div class="footer">
          <p>© 2026 InternVision Tech Inc. Headquarters: Nagpur, Maharashtra, India.</p>
          <p>Empowering the next generation of engineers with industry-grade software internships.</p>
        </div>
      </div>
    </body>
    </html>
    """

    text_content = f"""
    Dear {display_name},

    Thank you for applying for the {duration} Virtual Internship Program at InternVision Tech!
    
    Application Details:
    - Selected Track: {role_preference}
    - Program Duration: {duration}
    - Work Mode: 100% Virtual / Remote
    
    Next Steps:
    1. Technical Resume Review by senior engineers.
    2. Offer Letter & Onboarding email dispatched to {user_email}.
    3. 1:1 Mentorship kick-off.
    
    For questions, reach out to internvisiontechhr@gmail.com.
    
    Best regards,
    HR Team | InternVision Tech
    Headquarters: Nagpur, Maharashtra, India
    """

    return _send_smtp_email(user_email, subject, html_content, text_content)
