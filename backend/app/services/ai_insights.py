"""
AI Insights Service
Generates intelligent insights from analysis findings.
Uses rule-based heuristics by default, with optional LLM integration.
"""

import os
import httpx
from app.models.schemas import Finding, FindingType, RiskLevel


class AIInsightsEngine:
    """Generates security insights from scan findings and log analysis."""

    def __init__(self):
        self.ai_provider = os.getenv("AI_PROVIDER", "none")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")

    async def generate_insights(
        self,
        findings: list[Finding],
        log_summary: dict | None = None,
        content_preview: str = "",
    ) -> tuple[str, list[str]]:
        """Returns (summary, list_of_insights)."""

        if self.ai_provider == "openai" and self.openai_key:
            return await self._openai_insights(findings, log_summary, content_preview)
        if self.ai_provider == "anthropic" and self.anthropic_key:
            return await self._anthropic_insights(findings, log_summary, content_preview)

        return self._rule_based_insights(findings, log_summary)

    def _rule_based_insights(
        self, findings: list[Finding], log_summary: dict | None
    ) -> tuple[str, list[str]]:
        insights = []
        type_counts: dict[str, int] = {}
        for f in findings:
            type_counts[f.type.value] = type_counts.get(f.type.value, 0) + 1

        if type_counts.get("password", 0) > 0:
            insights.append(
                f"CRITICAL: {type_counts['password']} password(s) found exposed in content. "
                "Credentials must never appear in logs or source files."
            )
        if type_counts.get("api_key", 0) > 0:
            insights.append(
                f"HIGH: {type_counts['api_key']} API key(s) detected. "
                "Rotate compromised keys immediately and use vault-based secret management."
            )
        if type_counts.get("token", 0) > 0:
            insights.append(
                f"HIGH: {type_counts['token']} authentication token(s) exposed. "
                "Revoke tokens and implement proper secret handling."
            )
        if type_counts.get("secret", 0) > 0:
            insights.append(
                f"CRITICAL: {type_counts['secret']} secret(s)/private key(s) detected. "
                "These must be stored securely, not in plaintext."
            )
        if type_counts.get("email", 0) > 0:
            insights.append(
                f"LOW: {type_counts['email']} email address(es) found. "
                "Consider PII compliance requirements."
            )
        if type_counts.get("credit_card", 0) > 0:
            insights.append(
                f"CRITICAL: {type_counts['credit_card']} credit card number(s) detected. "
                "This is a PCI-DSS violation. Remove immediately."
            )
        if type_counts.get("stack_trace", 0) > 0:
            insights.append(
                f"MEDIUM: {type_counts['stack_trace']} stack trace(s) found. "
                "Error details can reveal internal system architecture to attackers."
            )
        if type_counts.get("sql_injection", 0) > 0:
            insights.append(
                f"HIGH: {type_counts['sql_injection']} potential SQL injection pattern(s) detected. "
                "Use parameterized queries to prevent injection attacks."
            )
        if type_counts.get("brute_force", 0) > 0:
            insights.append(
                "HIGH: Multiple failed login attempts detected — possible brute-force attack. "
                "Implement rate limiting and account lockout policies."
            )
        if type_counts.get("suspicious_ip", 0) > 0:
            insights.append(
                "HIGH: Suspicious IP activity detected with repeated failed access attempts. "
                "Consider IP-based blocking or CAPTCHA enforcement."
            )
        if type_counts.get("debug_leak", 0) > 0:
            insights.append(
                "MEDIUM: Debug mode is enabled. "
                "Disable debug mode in production to prevent information leakage."
            )

        if log_summary:
            levels = log_summary.get("log_levels", {})
            error_count = levels.get("ERROR", 0) + levels.get("FATAL", 0) + levels.get("CRITICAL", 0)
            if error_count > 10:
                insights.append(
                    f"WARNING: {error_count} error-level log entries detected. "
                    "High error rates may indicate systemic failures."
                )
            ip_data = log_summary.get("ip_activity", {})
            if ip_data.get("unique_count", 0) > 20:
                insights.append(
                    f"INFO: {ip_data['unique_count']} unique IPs found in logs. "
                    "Review for unauthorized access patterns."
                )

        if not insights:
            insights.append("No significant security issues detected in the provided content.")

        summary = self._build_summary(findings, log_summary)
        return summary, insights

    def _build_summary(
        self, findings: list[Finding], log_summary: dict | None
    ) -> str:
        if not findings:
            return "Content analyzed — no sensitive data or security issues detected."

        critical = sum(1 for f in findings if f.risk == RiskLevel.CRITICAL)
        high = sum(1 for f in findings if f.risk == RiskLevel.HIGH)
        parts = []
        if critical:
            parts.append(f"{critical} critical")
        if high:
            parts.append(f"{high} high-risk")
        parts.append(f"{len(findings)} total finding(s)")

        base = f"Analysis complete: {', '.join(parts)} detected."
        if log_summary:
            lines = log_summary.get("total_lines", 0)
            base += f" Log contains {lines} lines."
        return base

    async def _openai_insights(
        self, findings, log_summary, content_preview
    ) -> tuple[str, list[str]]:
        prompt = self._build_llm_prompt(findings, log_summary, content_preview)
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.openai_key}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": "You are a security analyst. Analyze the findings and produce a JSON with keys: summary (string), insights (array of strings). Be specific and actionable."},
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.3,
                    },
                )
                data = resp.json()
                text = data["choices"][0]["message"]["content"]
                return self._parse_llm_response(text, findings, log_summary)
        except Exception:
            return self._rule_based_insights(findings, log_summary)

    async def _anthropic_insights(
        self, findings, log_summary, content_preview
    ) -> tuple[str, list[str]]:
        prompt = self._build_llm_prompt(findings, log_summary, content_preview)
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.anthropic_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": "claude-haiku-4-5-20251001",
                        "max_tokens": 1024,
                        "system": "You are a security analyst. Analyze the findings and produce a JSON with keys: summary (string), insights (array of strings). Be specific and actionable.",
                        "messages": [{"role": "user", "content": prompt}],
                    },
                )
                data = resp.json()
                text = data["content"][0]["text"]
                return self._parse_llm_response(text, findings, log_summary)
        except Exception:
            return self._rule_based_insights(findings, log_summary)

    def _build_llm_prompt(self, findings, log_summary, content_preview) -> str:
        parts = ["Security scan findings:"]
        for f in findings[:30]:
            parts.append(f"- Type: {f.type.value}, Risk: {f.risk.value}, Line: {f.line}, Detail: {f.detail}")
        if log_summary:
            parts.append(f"\nLog summary: {log_summary}")
        if content_preview:
            parts.append(f"\nContent preview (first 500 chars):\n{content_preview[:500]}")
        return "\n".join(parts)

    def _parse_llm_response(
        self, text: str, findings, log_summary
    ) -> tuple[str, list[str]]:
        import json
        try:
            start = text.index("{")
            end = text.rindex("}") + 1
            data = json.loads(text[start:end])
            return data.get("summary", ""), data.get("insights", [])
        except (ValueError, json.JSONDecodeError):
            return self._rule_based_insights(findings, log_summary)
