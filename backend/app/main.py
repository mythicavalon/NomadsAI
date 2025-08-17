from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from .routers import itineraries, signals, memory, digest, chat, plan
from .services.llm_client import get_ai_provider_info
from .startup import initialize_pipeline


def create_app() -> FastAPI:
	# Load .env if present for local dev
	load_dotenv()

	app = FastAPI(title="Nomad AI Backend", version="0.2.0")

	# CORS configuration - configurable via env
	origins_raw = os.getenv("CORS_ORIGINS", "").strip()
	if origins_raw:
		origins = [o.strip() for o in origins_raw.split(",") if o.strip()]
	else:
		origins = ["*"]

	app.add_middleware(
		CORSMiddleware,
		allow_origins=origins,
		allow_credentials=True,
		allow_methods=["*"],
		allow_headers=["*"],
	)

	app.include_router(itineraries.router, prefix="/api/itineraries", tags=["itineraries"])
	app.include_router(signals.router, prefix="/api/signals", tags=["signals"])
	app.include_router(memory.router, prefix="/api/memory", tags=["memory"])
	app.include_router(digest.router, prefix="/api/digest", tags=["digest"])
	app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
	app.include_router(plan.router, prefix="/api/plan", tags=["plan"])

	# Removed startup pipeline test to prevent timeout issues
	# Pipeline initializes on-demand when first used

	@app.get("/healthz")
	def healthcheck():
		return {"status": "ok"}

	@app.get("/api/ai-status")
	def ai_status():
		"""Get AI provider status and capabilities"""
		return {
			"status": "active",
			"ai_providers": get_ai_provider_info(),
			"platform": "NomadAI",
			"version": "2.0",
			"features": [
				"GPT-OSS-120B Integration",
				"Two-Stage Pipeline",
				"Advanced Travel Planning",
				"Cultural Intelligence",
				"Real-time AI Responses"
			]
		}

	@app.get("/api/pipeline-status")
	def pipeline_status():
		"""Get pipeline status and component health"""
		from .startup import get_pipeline_status
		return get_pipeline_status()

	return app


app = create_app()