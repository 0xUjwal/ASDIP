"""
Vercel serverless entry point.
Mounts the FastAPI app so Vercel routes /api/* here.
"""

import sys
import os

# Add backend directory to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app  # noqa: E402
