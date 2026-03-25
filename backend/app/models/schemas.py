from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class InputType(str, Enum):
    TEXT = "text"
    FILE = "file"
    SQL = "sql"
    CHAT = "chat"
    LOG = "log"


class RiskLevel(str, Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FindingType(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    API_KEY = "api_key"
    PASSWORD = "password"
    TOKEN = "token"
    SECRET = "secret"
    STACK_TRACE = "stack_trace"
    SQL_INJECTION = "sql_injection"
    BRUTE_FORCE = "brute_force"
    SUSPICIOUS_IP = "suspicious_ip"
    DEBUG_LEAK = "debug_leak"
    CREDIT_CARD = "credit_card"


class AnalyzeOptions(BaseModel):
    mask: bool = Field(default=False, description="Mask detected sensitive data")
    block_high_risk: bool = Field(default=False, description="Block high-risk content")
    log_analysis: bool = Field(default=True, description="Enable log analysis")


class AnalyzeRequest(BaseModel):
    input_type: InputType
    content: str
    options: AnalyzeOptions = Field(default_factory=AnalyzeOptions)


class Finding(BaseModel):
    type: FindingType
    value: Optional[str] = None
    risk: RiskLevel
    line: Optional[int] = None
    detail: Optional[str] = None


class AnalyzeResponse(BaseModel):
    summary: str
    content_type: str
    findings: list[Finding]
    risk_score: int
    risk_level: RiskLevel
    action: str
    insights: list[str]
    masked_content: Optional[str] = None
    log_summary: Optional[dict] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    modules: dict
