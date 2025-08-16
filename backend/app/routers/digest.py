from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List

from ..services.emailer import send_email
from .signals import get_signals

router = APIRouter()


class DigestRequest(BaseModel):
	email: EmailStr
	region: str | None = None


@router.post("/send")
async def send_digest(req: DigestRequest):
	try:
		signals = await get_signals(destination=None, region=req.region, limit=5)
		items: List[str] = []
		for s in signals:
			if s["type"] == "event":
				items.append(f"Event: {s['name']} — {s['start_date']} in {s['location']}")
			elif s["type"] == "flight_deal":
				items.append(f"Flight deal: {s['from']} → {s['to']} for ${s['price']}")
			elif s["type"] == "hotel_rate":
				items.append(f"Hotel: {s['name']} in {s['city']} from ${s['price_per_night']}/night")

		body = "\n".join(items) or "No top signals this week."
		subject = "Nomad AI — Weekly Top Travel Opportunities"
		send_email(to=req.email, subject=subject, body=body)
		return {"sent": True}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))