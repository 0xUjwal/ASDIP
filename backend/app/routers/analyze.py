"""
Analysis Router
Handles all analysis endpoints: text, file upload, and health check.
"""

import structlog
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    AnalyzeOptions,
    InputType,
    HealthResponse,
)
from app.services.scanner import DataScanner
from app.services.log_analyzer import LogAnalyzer
from app.services.risk_engine import RiskEngine
from app.services.policy_engine import PolicyEngine
from app.services.ai_insights import AIInsightsEngine
from app.services.file_parser import FileParser

logger = structlog.get_logger()
router = APIRouter()

scanner = DataScanner()
log_analyzer = LogAnalyzer()
risk_engine = RiskEngine()
policy_engine = PolicyEngine()
ai_engine = AIInsightsEngine()
file_parser = FileParser()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        modules={
            "scanner": "active",
            "log_analyzer": "active",
            "risk_engine": "active",
            "policy_engine": "active",
            "ai_insights": "active",
        },
    )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_content(request: AnalyzeRequest):
    logger.info("analyze_request", input_type=request.input_type.value)
    return await _run_analysis(
        content=request.content,
        input_type=request.input_type,
        options=request.options,
    )


@router.post("/analyze/file", response_model=AnalyzeResponse)
async def analyze_file(
    file: UploadFile = File(...),
    mask: bool = Form(False),
    block_high_risk: bool = Form(False),
    log_analysis: bool = Form(True),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    max_size = 10 * 1024 * 1024  # 10 MB
    file_bytes = await file.read()
    if len(file_bytes) > max_size:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit")

    logger.info("file_upload", filename=file.filename, size=len(file_bytes))

    try:
        content = file_parser.parse(file.filename, file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    input_type = InputType.LOG if ext in ("log", "txt") else InputType.FILE

    options = AnalyzeOptions(
        mask=mask,
        block_high_risk=block_high_risk,
        log_analysis=log_analysis,
    )

    return await _run_analysis(
        content=content,
        input_type=input_type,
        options=options,
    )


async def _run_analysis(
    content: str,
    input_type: InputType,
    options: AnalyzeOptions,
) -> AnalyzeResponse:
    # Step 1: Scan for sensitive data
    findings = scanner.scan(content)

    # Step 2: Log analysis (if applicable)
    log_summary = None
    if input_type == InputType.LOG and options.log_analysis:
        log_summary = log_analyzer.analyze(content)
        findings.extend(log_summary.get("findings", []))

    # Step 3: Risk scoring
    risk_score, risk_level = risk_engine.evaluate(findings)

    # Step 4: Policy decision
    action = policy_engine.decide_action(risk_level, options)

    # Step 5: AI insights
    summary, insights = await ai_engine.generate_insights(
        findings=findings,
        log_summary=log_summary,
        content_preview=content[:500],
    )

    # Step 6: Optional masking
    masked_content = None
    if action == "masked":
        masked_content = policy_engine.mask_content(content)

    content_type = "logs" if input_type == InputType.LOG else input_type.value

    logger.info(
        "analysis_complete",
        findings_count=len(findings),
        risk_score=risk_score,
        risk_level=risk_level.value,
        action=action,
    )

    return AnalyzeResponse(
        summary=summary,
        content_type=content_type,
        findings=findings,
        risk_score=risk_score,
        risk_level=risk_level,
        action=action,
        insights=insights,
        masked_content=masked_content,
        log_summary=log_summary,
    )
