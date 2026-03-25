"""Tests for the LogAnalyzer service."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.log_analyzer import LogAnalyzer
from app.models.schemas import FindingType


analyzer = LogAnalyzer()

SAMPLE_LOG = """2026-03-10 10:00:01 INFO Server started
2026-03-10 10:01:00 ERROR Authentication failed for user admin from 10.0.0.50
2026-03-10 10:01:01 ERROR Authentication failed for user admin from 10.0.0.50
2026-03-10 10:01:02 ERROR Authentication failed for user admin from 10.0.0.50
2026-03-10 10:01:03 ERROR Authentication failed for user admin from 10.0.0.50
2026-03-10 10:01:04 ERROR Authentication failed for user admin from 10.0.0.50
2026-03-10 10:01:05 ERROR Authentication failed for user admin from 10.0.0.50
2026-03-10 10:02:00 WARN Something happened
2026-03-10 10:03:00 INFO Normal operation"""


def test_log_level_counting():
    result = analyzer.analyze(SAMPLE_LOG)
    levels = result["log_levels"]
    assert levels.get("ERROR", 0) == 6
    assert levels.get("INFO", 0) == 2
    assert levels.get("WARN", 0) == 1


def test_timestamp_extraction():
    result = analyzer.analyze(SAMPLE_LOG)
    ts = result["timestamps"]
    assert ts["first"] is not None
    assert ts["count"] > 0


def test_brute_force_detection():
    result = analyzer.analyze(SAMPLE_LOG)
    finding_types = [f.type for f in result["findings"]]
    assert FindingType.BRUTE_FORCE in finding_types


def test_ip_activity():
    result = analyzer.analyze(SAMPLE_LOG)
    assert result["ip_activity"]["unique_count"] > 0


def test_error_lines():
    result = analyzer.analyze(SAMPLE_LOG)
    assert len(result["error_lines"]) == 6


if __name__ == "__main__":
    test_log_level_counting()
    test_timestamp_extraction()
    test_brute_force_detection()
    test_ip_activity()
    test_error_lines()
    print("All log analyzer tests passed!")
