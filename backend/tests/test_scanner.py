"""Tests for the DataScanner service."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.scanner import DataScanner
from app.models.schemas import FindingType, RiskLevel


scanner = DataScanner()


def test_email_detection():
    findings = scanner.scan("Contact us at admin@company.com")
    types = [f.type for f in findings]
    assert FindingType.EMAIL in types


def test_password_detection():
    findings = scanner.scan("password=secret123")
    types = [f.type for f in findings]
    assert FindingType.PASSWORD in types
    assert any(f.risk == RiskLevel.CRITICAL for f in findings)


def test_api_key_detection():
    findings = scanner.scan("api_key=sk-prod-xyz789abcdef1234")
    types = [f.type for f in findings]
    assert FindingType.API_KEY in types


def test_stack_trace_detection():
    content = "ERROR stack trace: NullPointerException at service.java:45"
    findings = scanner.scan(content)
    types = [f.type for f in findings]
    assert FindingType.STACK_TRACE in types


def test_no_findings():
    findings = scanner.scan("This is a normal log line with nothing sensitive.")
    assert len(findings) == 0


def test_multiple_findings():
    content = """email=admin@test.com
password=hunter2
api_key=sk-abcdef1234567890"""
    findings = scanner.scan(content)
    assert len(findings) >= 3


if __name__ == "__main__":
    test_email_detection()
    test_password_detection()
    test_api_key_detection()
    test_stack_trace_detection()
    test_no_findings()
    test_multiple_findings()
    print("All scanner tests passed!")
