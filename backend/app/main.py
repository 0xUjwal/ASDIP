"""
AI Secure Data Intelligence Platform — FastAPI Application
"""

import os
import structlog
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analyze


load_dotenv()

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
)
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("startup", message="AI Secure Data Intelligence Platform starting")
    yield
    logger.info("shutdown", message="Platform shutting down")


app = FastAPI(
    title="AI Secure Data Intelligence Platform",
    description=(
        "AI Gateway + Data Scanner + Log Analyzer + Risk Engine. "
        "Ingests text, files, logs, SQL, and chat input to detect "
        "sensitive data, security risks, and anomalies."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
