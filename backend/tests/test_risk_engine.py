"""Tests for the RiskEngine service."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.risk_engine import RiskEngine
from app.models.schemas import Finding, FindingType, RiskLevel


engine = RiskEngine()


def test_no_findings():
    score, level = engine.evaluate([])
    assert score == 0
    assert level == RiskLevel.NONE


def test_low_risk():
    findings = [
        Finding(type=FindingType.EMAIL, risk=RiskLevel.LOW, line=1)
    ]
    score, level = engine.evaluate(findings)
    assert score == 1
    assert level == RiskLevel.LOW


def test_critical_risk():
    findings = [
        Finding(type=FindingType.PASSWORD, risk=RiskLevel.CRITICAL, line=1)
    ]
    score, level = engine.evaluate(findings)
    assert score >= 10
    assert level == RiskLevel.HIGH or level == RiskLevel.CRITICAL


def test_mixed_risks():
    findings = [
        Finding(type=FindingType.EMAIL, risk=RiskLevel.LOW, line=1),
        Finding(type=FindingType.API_KEY, risk=RiskLevel.HIGH, line=2),
        Finding(type=FindingType.STACK_TRACE, risk=RiskLevel.MEDIUM, line=3),
    ]
    score, level = engine.evaluate(findings)
    assert score == 9  # 1 + 5 + 3
    assert level == RiskLevel.HIGH


if __name__ == "__main__":
    test_no_findings()
    test_low_risk()
    test_critical_risk()
    test_mixed_risks()
    print("All risk engine tests passed!")
