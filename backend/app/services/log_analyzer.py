"""
Log Analyzer Service
Parses log files, detects anomalies, and generates structured log summaries.
"""

from collections import Counter, defaultdict
from app.models.schemas import Finding, FindingType, RiskLevel
from app.utils.patterns import (
    BRUTE_FORCE_PATTERN,
    SUSPICIOUS_IP_PATTERN,
    LOG_LEVEL_PATTERN,
    TIMESTAMP_PATTERN,
)


class LogAnalyzer:
    """Analyzes log files for security issues and anomalies."""

    BRUTE_FORCE_THRESHOLD = 5

    def analyze(self, content: str) -> dict:
        lines = content.splitlines()
        result = {
            "total_lines": len(lines),
            "log_levels": self._count_log_levels(lines),
            "timestamps": self._extract_time_range(lines),
            "ip_activity": self._analyze_ip_activity(lines),
            "error_lines": self._find_error_lines(lines),
            "findings": self._detect_anomalies(lines),
        }
        return result

    def _count_log_levels(self, lines: list[str]) -> dict:
        counts = Counter()
        for line in lines:
            match = LOG_LEVEL_PATTERN.search(line)
            if match:
                level = match.group(1).upper()
                if level == "WARNING":
                    level = "WARN"
                counts[level] += 1
        return dict(counts)

    def _extract_time_range(self, lines: list[str]) -> dict:
        timestamps = []
        for line in lines:
            match = TIMESTAMP_PATTERN.search(line)
            if match:
                timestamps.append(match.group(0))
        if timestamps:
            return {"first": timestamps[0], "last": timestamps[-1], "count": len(timestamps)}
        return {"first": None, "last": None, "count": 0}

    def _analyze_ip_activity(self, lines: list[str]) -> dict:
        ip_counts = Counter()
        for line in lines:
            for match in SUSPICIOUS_IP_PATTERN.finditer(line):
                ip = match.group(0)
                octets = ip.split(".")
                if all(0 <= int(o) <= 255 for o in octets):
                    ip_counts[ip] += 1
        top_ips = ip_counts.most_common(10)
        return {"unique_count": len(ip_counts), "top_ips": dict(top_ips)}

    def _find_error_lines(self, lines: list[str]) -> list[dict]:
        errors = []
        for i, line in enumerate(lines, start=1):
            match = LOG_LEVEL_PATTERN.search(line)
            if match and match.group(1).upper() in ("ERROR", "FATAL", "CRITICAL"):
                errors.append({"line": i, "content": line.strip()[:200]})
        return errors[:50]

    def _detect_anomalies(self, lines: list[str]) -> list[Finding]:
        findings = []
        failed_login_lines = []
        failed_by_ip = defaultdict(list)

        for i, line in enumerate(lines, start=1):
            if BRUTE_FORCE_PATTERN.search(line):
                failed_login_lines.append(i)
                ip_match = SUSPICIOUS_IP_PATTERN.search(line)
                if ip_match:
                    failed_by_ip[ip_match.group(0)].append(i)

        if len(failed_login_lines) >= self.BRUTE_FORCE_THRESHOLD:
            findings.append(
                Finding(
                    type=FindingType.BRUTE_FORCE,
                    risk=RiskLevel.HIGH,
                    line=failed_login_lines[0],
                    detail=(
                        f"Detected {len(failed_login_lines)} failed login attempts "
                        f"(lines: {', '.join(str(l) for l in failed_login_lines[:10])})"
                    ),
                )
            )

        for ip, ip_lines in failed_by_ip.items():
            if len(ip_lines) >= self.BRUTE_FORCE_THRESHOLD:
                findings.append(
                    Finding(
                        type=FindingType.SUSPICIOUS_IP,
                        value=ip,
                        risk=RiskLevel.HIGH,
                        line=ip_lines[0],
                        detail=(
                            f"IP {ip} has {len(ip_lines)} failed attempts"
                        ),
                    )
                )

        return findings
