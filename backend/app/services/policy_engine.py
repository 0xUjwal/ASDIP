"""
Policy Engine Service
Determines response actions based on risk level and configured options.
"""

import re
from app.models.schemas import RiskLevel, AnalyzeOptions
from app.utils.patterns import SENSITIVE_PATTERNS


class PolicyEngine:
    """Applies security policies to determine actions on analyzed content."""

    def decide_action(
        self, risk_level: RiskLevel, options: AnalyzeOptions
    ) -> str:
        if options.block_high_risk and risk_level in (
            RiskLevel.HIGH,
            RiskLevel.CRITICAL,
        ):
            return "blocked"
        if options.mask:
            return "masked"
        return "allowed"

    def mask_content(self, content: str) -> str:
        masked = content
        for key, config in SENSITIVE_PATTERNS.items():
            if key == "stack_trace":
                continue
            masked = config["pattern"].sub(self._mask_match, masked)
        return masked

    @staticmethod
    def _mask_match(match: re.Match) -> str:
        original = match.group(0)
        if len(original) <= 4:
            return "****"
        return original[:2] + "*" * (len(original) - 4) + original[-2:]
