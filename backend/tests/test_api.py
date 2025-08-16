import os
from fastapi.testclient import TestClient
from app.main import app


def test_health():
	client = TestClient(app)
	r = client.get("/healthz")
	assert r.status_code == 200
	assert r.json()["status"] == "ok"


def test_itinerary_basic():
	client = TestClient(app)
	payload = {
		"destination": "Barcelona, Spain",
		"days": 2,
		"budget": "medium",
		"interests": ["culture", "food"],
	}
	r = client.post("/api/itineraries/", json=payload)
	assert r.status_code == 200, r.text
	data = r.json()
	assert data["destination"] == payload["destination"]
	assert len(data["day_plans"]) == payload["days"]
	assert isinstance(data["surprise_picks"], list)


def test_signals():
	client = TestClient(app)
	r = client.get("/api/signals/?destination=Barcelona,%20Spain")
	assert r.status_code == 200, r.text
	arr = r.json()
	assert isinstance(arr, list)
	assert any(item.get("type") == "event" for item in arr)


def test_memory_crud(tmp_path, monkeypatch):
	# Use a test database file
	monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path}/test.db")
	# Recreate app client so startup events run with new env
	client = TestClient(app)
	# Create
	r = client.post("/api/memory/", json={
		"title": "Gaudi tour",
		"content": "Loved Sagrada Familia",
		"destination": "Barcelona, Spain"
	})
	assert r.status_code == 200, r.text
	created = r.json()
	# List
	r = client.get("/api/memory/")
	assert r.status_code == 200
	items = r.json()
	assert any(i["id"] == created["id"] for i in items)
	# Delete
	r = client.delete(f"/api/memory/{created['id']}")
	assert r.status_code == 200