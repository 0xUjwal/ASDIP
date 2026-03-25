"""
Data Scanner Service
Scans content for sensitive data patterns using regex-based detection.
"""

from app.models.schemas import Finding, FindingType, RiskLevel
from app.utils.patterns import SENSITIVE_PATTERNS


class DataScanner:
    """Scans text content for sensitive data patterns."""

    def scan(self, content: str) -> list[Finding]:
        findings = []
        lines = content.splitlines()

        for line_num, line in enumerate(lines, start=1):
            for key, config in SENSITIVE_PATTERNS.items():
                matches = config["pattern"].finditer(line)
                for match in matches:
                    finding_type = config.get("type_override", key)
                    try:
                        ft = FindingType(finding_type)
                    except ValueError:
                        ft = FindingType.SECRET

                    value = match.group(0)
                    if len(value) > 80:
                        value = value[:77] + "..."

                    findings.append(
                        Finding(
                            type=ft,
                            value=self._partial_mask(value),
                            risk=RiskLevel(config["risk"]),
                            line=line_num,
                            detail=config["label"],
                        )
                    )

        return self._deduplicate(findings)

    @staticmethod
    def _partial_mask(value: str) -> str:
        """Show first and last few chars, mask the middle."""
        if len(value) <= 6:
            return value[:2] + "***"
        visible = max(2, len(value) // 5)
        return value[:visible] + "***" + value[-visible:]

    @staticmethod
    def _deduplicate(findings: list[Finding]) -> list[Finding]:
        seen = set()
        unique = []
        for f in findings:
            key = (f.type, f.line, f.value)
            if key not in seen:
                seen.add(key)
                unique.append(f)
        return unique
