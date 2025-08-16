import os
import smtplib
from email.message import EmailMessage
from datetime import datetime


SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
FROM_EMAIL = os.getenv("FROM_EMAIL", "no-reply@nomad-ai.local")


def _write_outbox(to: str, subject: str, body: str):
	out_dir = os.path.abspath(os.getenv("OUTBOX_DIR", "./outbox"))
	os.makedirs(out_dir, exist_ok=True)
	fname = datetime.utcnow().strftime("%Y%m%d-%H%M%S") + "-" + to.replace("@", "_at_") + ".txt"
	path = os.path.join(out_dir, fname)
	with open(path, "w", encoding="utf-8") as f:
		f.write(f"To: {to}\nSubject: {subject}\n\n{body}\n")


def send_email(to: str, subject: str, body: str):
	if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
		# Fallback to file outbox for local/demo
		_write_outbox(to, subject, body)
		return

	msg = EmailMessage()
	msg["Subject"] = subject
	msg["From"] = FROM_EMAIL
	msg["To"] = to
	msg.set_content(body)

	with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
		server.starttls()
		server.login(SMTP_USER, SMTP_PASS)
		server.send_message(msg)