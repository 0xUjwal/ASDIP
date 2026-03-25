"""
Risk Engine Service
Computes risk scores and levels from scan findings.
"""

from app.models.schemas import Finding, RiskLevel


RISK_WEIGHTS = {
    RiskLevel.NONE: 0,
    RiskLevel.LOW: 1,
    RiskLevel.MEDIUM: 3,
    RiskLevel.HIGH: 5,
    RiskLevel.CRITICAL: 10,
}

SCORE_THRESHOLDS = [
    (0, RiskLevel.NONE),
    (3, RiskLevel.LOW),
    (6, RiskLevel.MEDIUM),
    (10, RiskLevel.HIGH),
    (999, RiskLevel.CRITICAL),
]


class RiskEngine:
    """Calculates aggregated risk scores from a list of findings."""

    def evaluate(self, findings: list[Finding]) -> tuple[int, RiskLevel]:
        if not findings:
            return 0, RiskLevel.NONE

        score = sum(RISK_WEIGHTS.get(f.risk, 0) for f in findings)

        has_critical = any(f.risk == RiskLevel.CRITICAL for f in findings)
        if has_critical:
            score = max(score, 10)

        level = RiskLevel.NONE
        for threshold, risk_level in SCORE_THRESHOLDS:
            if score <= threshold:
                level = risk_level
                break

        return score, level
